# Notas Técnicas para Entrevista — Sistema de Matrícula Unifor

> Documento de suporte para apresentação do desafio técnico.
> Registra as decisões de arquitetura, trade-offs e pontos de melhoria futura.

---

## 1. Visão Geral da Solução

O sistema foi construído como um monorepo com separação explícita entre backend e frontend, conforme exigido no desafio.

```
Browser (Angular 20 SPA)
     │  Authorization Code + PKCE
     ▼
Keycloak 24  (emite JWT com realm_access.roles)
     │
     │  Bearer token em cada request
     ▼
Quarkus 3.20 REST API  (valida JWT, verifica roles via @RolesAllowed)
     │
     ▼
PostgreSQL 16  (transações ACID, pessimistic lock nas matrículas)
```

**Fluxo completo de uma matrícula:**
1. Aluno autentica no Keycloak via PKCE → recebe `access_token` JWT com `realm_access.roles: ["ALUNO"]`
2. Angular envia `POST /api/v1/matricula` com `Authorization: Bearer <token>`
3. Quarkus verifica assinatura do JWT e extrai o role `ALUNO`
4. `MatriculaService` abre transação, aplica `PESSIMISTIC_WRITE` na `AulaMatriz`, valida regras de negócio e persiste a matrícula
5. Resposta `201 Created` retorna para o frontend; o NgRx Signal Store atualiza o estado local sem nova requisição de listagem

---

## 2. Decisões de Backend

### Kotlin 2.0 + Quarkus 3.20

**Por que Kotlin em vez de Java?**
- **Null-safety em tempo de compilação:** `NullPointerException` são capturados pelo compilador, não em runtime. Em um sistema de matrículas onde dados de alunos e aulas se cruzam, isso elimina uma classe inteira de bugs.
- **Data classes:** eliminam o boilerplate de DTOs (sem getters/setters/equals/hashCode manuais). `data class MatricularRequest(val aulaMatrizId: String)` é um DTO completo.
- **Coroutines:** preparado para operações assíncronas sem callback hell, se o projeto evoluir para endpoints suspensos.

**Por que Quarkus?**
- Startup sub-segundo em dev mode — `./mvnw quarkus:dev` recarrega em milissegundos
- Hot Reload automático sem reiniciar a JVM
- Panache já é Kotlin-native (sem adaptações extras)
- OIDC declarativo: apenas `quarkus.oidc.*` no `application.properties` e o framework trata toda a validação JWT

### Panache Active Record vs Repository Pattern

**Decisão: Active Record**

Para este domínio de tamanho médio, o Active Record é mais legível:

```kotlin
// Active Record — direto
val aulas = AulaMatriz.find("coordenador.keycloakId = ?1 and ativo = true", id).list<AulaMatriz>()

// Repository — mais verbose, mas mais testável em isolamento
aulaMatrizRepository.findByCoordenaorKeycloakIdAndAtivo(id, true)
```

**Trade-off reconhecido:** Para projetos maiores ou que exijam mock do repositório em testes unitários sem banco, o Repository Pattern seria preferível. Para este desafio, o Active Record reduz boilerplate sem prejuízo de clareza.

### Controle de Concorrência com Pessimistic Lock

**Cenário:** dois alunos tentam a última vaga simultaneamente.

**Problema sem lock:**
```
Thread A: lê 1 vaga disponível ✓
Thread B: lê 1 vaga disponível ✓
Thread A: insere matrícula (vagas = 0)
Thread B: insere matrícula (vagas = -1) ← DOUBLE BOOKING!
```

**Solução implementada:**
```kotlin
@Transactional
fun matricular(request: MatricularRequest, keycloakId: String): MatriculaResponse {
    val aluno = Aluno.find("keycloakId", keycloakId).firstResult<Aluno>()
        ?: throw NotFoundException("Aluno não encontrado")

    // Pessimistic Write: emite SELECT ... FOR UPDATE no banco
    // Thread B fica bloqueada aqui até Thread A commitar
    val aulaMatriz = em.find(AulaMatriz::class.java, request.aulaMatrizId, LockModeType.PESSIMISTIC_WRITE)
        ?: throw NotFoundException("Aula não encontrada")

    // Quando Thread B desbloqueia, revalida — agora não há mais vaga
    val vagasOcupadas = Matricula.count("aulaMatriz = ?1 and ativo = true", aulaMatriz)
    if (vagasOcupadas >= aulaMatriz.maxAlunos) {
        throw ConflictException("Sem vagas disponíveis")
    }

    // ... demais validações e persistência
}
```

**Por que Pessimistic e não Optimistic (`@Version`)?**
Matrículas têm alta contenção (muitos alunos, poucas vagas). Com Optimistic Lock, o segundo thread sofreria `OptimisticLockException` e precisaria de um retry loop — com alto volume, causaria thundering herd. O Pessimistic Lock serializa as threads no nível do banco, que é mais eficiente nesse cenário.

### Quarkus OIDC Declarativo

Zero código de validação manual de JWT:

```kotlin
@Path("/api/v1/matricula")
@RolesAllowed("ALUNO")  // ← Quarkus valida realm_access.roles do JWT automaticamente
class MatriculaResource {
    @Context
    lateinit var identity: SecurityIdentity

    // identity.principal.name == keycloakId (sub do JWT)
}
```

O `quarkus-oidc` faz introspection/JWKS automático contra o Keycloak. Não há código de parsing de token no projeto.

### Soft Delete

Aulas e matrículas usam `ativo = false` em vez de `DELETE` físico. Isso:
- Preserva o histórico de matrículas de alunos mesmo após a aula ser removida da grade
- Permite auditoria futura
- Evita violações de foreign key

---

## 3. Decisões de Frontend

### Angular 20 + Standalone Components

O Angular 20 aboliu NgModules como conceito obrigatório. Cada componente declara suas próprias dependências:

```typescript
@Component({
  standalone: true,
  imports: [TableModule, ButtonModule, TagModule],  // ← sem NgModule intermediário
  template: `...`
})
export class AulasDisponiveisPage { }
```

**Benefícios:**
- Tree-shaking granular: apenas os módulos usados vão para o bundle
- Lazy loading por componente individual (não por módulo)
- Menos camadas de abstração para entender o código

### NgRx Signal Store (não NgRx clássico)

**Por que Signal Store em vez do NgRx tradicional?**

| Aspecto | NgRx Clássico | NgRx Signal Store |
|---|---|---|
| Boilerplate | Actions + Reducers + Effects (3 arquivos) | Um único `signalStore()` |
| Change detection | Zone.js, re-render do componente inteiro | Signal granular — só renderiza o que mudou |
| Tipo do estado | `Observable<T>` | `Signal<T>` — leitura síncrona com `()` |
| Curva de aprendizado | Alta | Baixa |
| Async side-effects | Effects com `createEffect` | `rxMethod` inline no store |

O Signal Store é a direção que o ecossistema Angular está tomando em 2024-2025, e demonstra conhecimento da evolução do framework.

**Padrão usado:**
```typescript
export const MatriculaStore = signalStore(
  { providedIn: 'root' },
  withState({ minhasMatriculas: [], loading: false, error: null }),
  withMethods((store, api = inject(MatriculaApiService)) => ({
    matricular: rxMethod<string>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(id => api.matricular(id).pipe(
        tapResponse(
          matricula => patchState(store, state => ({
            minhasMatriculas: [...state.minhasMatriculas, matricula],
            loading: false
          })),
          (err: HttpErrorResponse) => patchState(store, {
            error: err.error?.message ?? 'Erro ao matricular',
            loading: false
          })
        )
      ))
    ))
  }))
);
```

### RxJS com `rxMethod`

Para side-effects HTTP, uso `rxMethod` que conecta o mundo Observable ao mundo Signal:

```typescript
loadAulasDisponiveis: rxMethod<void>(pipe(
  tap(() => patchState(store, { loading: true })),
  switchMap(() => api.getDisponiveis().pipe(
    tapResponse(data => patchState(store, { aulasDisponiveis: data, loading: false }), ...)
  ))
))
```

O `switchMap` cancela requisições anteriores pendentes se uma nova for disparada, evitando race conditions no frontend.

### Nx Monorepo com Libs

Separação intencional das libs:

```
libs/
├── shared/auth          # Keycloak guards, AuthService
│                        # ← sem dependências de UI
├── shared/data-access   # Models, API services, Signal Stores
│                        # ← sem dependências de UI primitives
└── shared/ui            # LoadingComponent, ErrorMessageComponent
                         # ← reutilizável por qualquer app
```

**Por que importa:** se o projeto evoluir para dois apps separados (`coordinator-app` e `student-app`), as três libs são reutilizadas sem duplicação. O Nx enforça os limites via `project.json` e recusa imports circulares em build-time.

---

## 4. Segurança e Controle de Acesso

### Keycloak PKCE para SPA

O fluxo Authorization Code + PKCE é o único seguro para SPAs, pois não expõe `client_secret` no browser:

```
1. Angular gera code_verifier (random, 128 chars) e code_challenge = SHA256(code_verifier)
2. Redireciona para Keycloak com code_challenge no URL
3. Usuário autentica → Keycloak retorna authorization_code
4. Angular troca code + code_verifier pelo access_token
5. Keycloak verifica que SHA256(code_verifier) == code_challenge armazenado
   → Garante que só o browser que iniciou o fluxo recebe o token
```

### JWT → @RolesAllowed

```
JWT payload:
{
  "sub": "uuid-do-aluno",
  "realm_access": {
    "roles": ["ALUNO", "offline_access"]
  }
}
                    ↓  lido pelo Quarkus OIDC
@RolesAllowed("ALUNO")  ← check automático sem código manual
```

### Isolamento de Dados por Keycloak ID

- **Coordenador:** só vê suas próprias `AulaMatriz` via `WHERE coordenador.keycloak_id = :sub`
- **Aluno:** só cancela suas próprias matrículas via verificação `matricula.aluno.keycloakId == identity.principal.name`
- Nenhum endpoint permite "ver dados de outro usuário" — isolamento em nível de query, não apenas de role

---

## 5. Concorrência — Análise Detalhada

**Sequência com Pessimistic Lock (2 threads concorrentes, 1 vaga):**

```
T=0  Thread A: BEGIN TRANSACTION
T=0  Thread B: BEGIN TRANSACTION
T=1  Thread A: SELECT * FROM aula_matriz WHERE id=X FOR UPDATE → adquire lock, vê 1 vaga
T=1  Thread B: SELECT * FROM aula_matriz WHERE id=X FOR UPDATE → BLOQUEADA no banco
T=2  Thread A: INSERT INTO matricula → vaga = 0
T=3  Thread A: COMMIT → lock liberado
T=3  Thread B: SELECT retorna → vê 0 vagas → lança ConflictException (HTTP 409)
T=4  Thread B: ROLLBACK
```

**Boundary de transação:** o lock é mantido do `em.find(..., PESSIMISTIC_WRITE)` até o `COMMIT`. Quarkus garante que o método `@Transactional` inteiro corre em uma única transação.

---

## 6. O que Evoluiria com Mais Tempo

### Curto Prazo (próxima sprint)
- **Optimistic Lock (`@Version`)** nos endpoints de baixa contenção (PATCH de aula pelo coordenador)
- **Paginação** cursor-based nas listagens de aulas (evita `OFFSET` em tabelas grandes)
- **Testes E2E** com Playwright — cenários de matrícula e conflito de horário

### Médio Prazo
- **CI/CD com GitHub Actions:** pipeline build → test → Docker build → push registry → deploy
- **Circuit Breaker (SmallRye Fault Tolerance):** protege chamadas ao Keycloak em caso de instabilidade
- **Notificações em tempo real:** WebSocket ou SSE quando vagas são liberadas (aluno na fila de espera)

### Longo Prazo
- **Separação de apps:** `coordinator-app` e `student-app` como builds Nx separados com PWA
- **Métricas** com Micrometer/Prometheus + dashboards Grafana
- **Auditoria completa** com Hibernate Envers (log de quem alterou cada entidade e quando)
- **Multi-tenant** (suporte a múltiplas instituições no mesmo sistema)

---

## 7. Padrões e Boas Práticas Demonstradas

| Prática | Implementado |
|---|---|
| Separação Controller / Service / Repository | ✅ |
| DTOs distintos de Entities (request/response separados) | ✅ |
| Tratamento centralizado de erros (GlobalExceptionMapper) | ✅ |
| Soft Delete para preservar histórico | ✅ |
| Transações atômicas com lock pessimista | ✅ |
| Validação no backend (nunca confiar no cliente) | ✅ |
| Seed data via `import.sql` (não cadastro manual) | ✅ |
| Docker Compose para reprodutibilidade total do ambiente | ✅ |
| Standalone Components (Angular 20 idiomático) | ✅ |
| Signal Store (NgRx moderno, sem boilerplate clássico) | ✅ |
| Nx libs com boundary enforcement | ✅ |
| PKCE para SPA (sem client_secret no browser) | ✅ |
| Isolamento de dados por keycloakId no backend | ✅ |
| OpenAPI/Swagger gerado automaticamente | ✅ |

---

## 8. Troubleshooting do Docker Build — Lições Aprendidas

Durante o processo de build com `docker compose up --build`, três classes de erros foram encontradas e resolvidas. Documentá-las demonstra domínio do ciclo real de desenvolvimento.

### 8.1 `This type does not have a constructor` — Kotlin + JPA

**Causa:** Classes de entidade Kotlin herdam de `PanacheEntityBase` com parênteses (`PanacheEntityBase()`), o que tenta invocar um construtor inexistente em vez de apenas herdar. Além disso, JPA/Hibernate 6 exige um **construtor sem argumentos** em todas as classes `@Entity`, que o Kotlin não gera automaticamente.

**Solução:**
1. Remover os parênteses: `class Aluno : PanacheEntityBase` (sem `()`)
2. Adicionar o plugin `kotlin-maven-noarg` no `pom.xml` com `no-arg:annotation=jakarta.persistence.Entity` — gera o construtor sinteticamente sem expô-lo no código-fonte

```xml
<compilerPlugins>
  <plugin>all-open</plugin>
  <plugin>no-arg</plugin>   <!-- novo -->
</compilerPlugins>
<pluginOptions>
  <option>no-arg:annotation=jakarta.persistence.Entity</option>
</pluginOptions>
```

### 8.2 `Unresolved reference 'validation'` — Jakarta Validation ausente

**Causa:** O `pom.xml` não incluía `quarkus-hibernate-validator`, então as anotações `@NotNull`, `@Valid`, `@Min` etc. do pacote `jakarta.validation` não estavam disponíveis em compile time.

**Solução:** Adicionar a dependência:
```xml
<dependency>
  <groupId>io.quarkus</groupId>
  <artifactId>quarkus-hibernate-validator</artifactId>
</dependency>
```

### 8.3 `@Authenticated + @RolesAllowed` — Anotações de segurança conflitantes

**Causa:** O Quarkus Security proíbe o uso combinado de `@Authenticated` e `@RolesAllowed` na mesma classe — são mutuamente exclusivos por design.

**Solução:** Remover `@Authenticated` — `@RolesAllowed("ROLE")` já implica autenticação obrigatória:
```kotlin
// ❌ Antes — IllegalStateException em build
@Authenticated
@RolesAllowed("COORDENADOR")

// ✅ Depois
@RolesAllowed("COORDENADOR")
```

### 8.4 `@GenericGenerator` deprecated no Hibernate 6

**Oportunidade de melhoria** identificada durante o processo: a anotação `@GenericGenerator(strategy = "org.hibernate.id.UUIDGenerator")` foi marcada como deprecated no Hibernate 6 (usado pelo Quarkus 3.x). Migrado para a API nativa do JPA 3.1:
```kotlin
// Antes (Hibernate 5 style)
@GeneratedValue(generator = "UUID")
@GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")

// Depois (JPA 3.1 nativo)
@GeneratedValue(strategy = GenerationType.UUID)
```

---
