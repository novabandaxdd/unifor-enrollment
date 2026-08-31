# Notas Técnicas para Entrevista — Sistema de Matrícula Unifor

> Documento de suporte para a apresentação técnica do desafio.
> Registra decisões de arquitetura, trade-offs e pontos de melhoria futura.

---

## 1. Visão Geral da Solução

### Diagrama de Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Docker Compose Network                           │
│                                                                         │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │  Angular 20 SPA  │    │   Keycloak 24    │    │  Quarkus 3.20    │  │
│  │  (nginx :80)     │    │   (:8080)        │    │  REST API (:8080)│  │
│  │                  │    │                  │    │                  │  │
│  │  Nx monorepo     │◄──►│  Realm: unifor   │◄──►│  Kotlin 2.0      │  │
│  │  NgRx Signals    │    │  PKCE + S256     │    │  @RolesAllowed   │  │
│  │  PrimeNG 20      │    │  Roles: ALUNO    │    │  Panache ORM     │  │
│  │                  │    │         COORD    │    │  OIDC JWT valida │  │
│  └──────────────────┘    └──────────────────┘    └────────┬─────────┘  │
│         :4200                    :8180                     │            │
│                                                            ▼            │
│                                                  ┌──────────────────┐  │
│                                                  │  PostgreSQL 16   │  │
│                                                  │  (:5432)         │  │
│                                                  │  unifor_db       │  │
│                                                  │  init.sql seed   │  │
│                                                  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Fluxo de Autenticação (PKCE)

```
Aluno/Coord                Angular SPA              Keycloak              Backend
     │                         │                        │                    │
     │── click em app ─────────►│                        │                    │
     │                         │──── redirect ──────────►│                    │
     │◄──────────── login form ─┤                        │                    │
     │── credenciais ──────────►│                        │                    │
     │                         │◄── code + PKCE ─────────┤                    │
     │                         │──── code + verifier ───►│                    │
     │                         │◄── access_token JWT ────┤                    │
     │                         │                        │                    │
     │                         │── GET /api/v1/matriz ──────────────────────►│
     │                         │   Authorization: Bearer <JWT>               │
     │                         │◄─────────────── 200 OK ─────────────────────┤
```

### Fluxo de Matrícula (Critical Path)

```
Aluno           Angular (MatriculaStore)      Backend (MatriculaService)    PostgreSQL
  │                     │                            │                          │
  │── Matricular ───────►│                            │                          │
  │                     │── POST /matricula ─────────►│                          │
  │                     │                            │── BEGIN TRANSACTION ─────►│
  │                     │                            │── SELECT FOR UPDATE ──────►│ ← PESSIMISTIC_WRITE
  │                     │                            │◄─ AulaMatriz locked ───────┤
  │                     │                            │── VALIDATE vagas          │
  │                     │                            │── VALIDATE curso          │
  │                     │                            │── VALIDATE horário        │
  │                     │                            │── INSERT matricula ───────►│
  │                     │                            │── COMMIT ─────────────────►│
  │                     │◄─ 201 Created ─────────────┤                          │
  │◄─ toast success ────┤                            │                          │
```

---

## 2. Decisões de Backend

### Por que Kotlin 2.0 + Quarkus 3.20?

**Kotlin vs Java:**
- **Null-safety em tempo de compilação:** elimina `NullPointerException` — crítico em um sistema com múltiplos relacionamentos entre entidades
- **Data classes:** `data class CriarAulaRequest(val disciplinaId: UUID, ...)` é um DTO completo sem boilerplate
- **Extension functions:** `fun AulaMatriz.toAulaResponse()` — mantém lógica de mapeamento no local correto
- **Companion objects + PanacheCompanionBase:** `AulaMatriz.findById(id)` é idiomático e seguro

**Quarkus vs Spring Boot:**
- Startup sub-segundo em dev (`quarkus:dev` recarrega em milissegundos)
- OIDC **declarativo**: `quarkus.oidc.auth-server-url=...` resolve toda a validação JWT sem código
- Native image (GraalVM) como opção futura sem mudança de código
- Panache já é Kotlin-native com PanacheCompanionBase

### Pessimistic Locking na Matrícula

```kotlin
// MatriculaService.kt — linha crítica
val aulaMatriz = em.find(AulaMatriz::class.java, id, LockModeType.PESSIMISTIC_WRITE)
```

**Por que PESSIMISTIC_WRITE e não optimistic locking?**

Em um cenário de matrícula com múltiplos alunos concorrentes, o optimistic locking geraria muitos `OptimisticLockException` e exigiria retry no cliente. O pessimistic locking **garante que apenas um aluno por vez** passa pela validação de vagas, eliminando race conditions sem complexidade extra no frontend.

**Sequência dentro da transação:**
1. `PESSIMISTIC_WRITE` → bloqueia a linha `aula_matriz`
2. Verifica vagas: `COUNT(matricula WHERE ativo=true)`
3. Verifica curso autorizado
4. Verifica choque de horário (query JPQL com `horaInicio < :horaFim AND horaFim > :horaInicio`)
5. `INSERT matricula` → commit libera o lock

### Separação de Camadas

```
resource/  ← HTTP + security context → delega para service
service/   ← regras de negócio + transações
domain/    ← entidades JPA + Active Record queries
dto/       ← request/response + extension mappers
exception/ ← custom exceptions + @Provider mappers
```

### Soft Delete

```sql
-- aula_matriz.ativo = false (não remove do banco)
-- matricula.ativo = false  (cancelamento não destrói histórico)
```
Escolha intencional: histórico acadêmico não pode ser apagado fisicamente. Auditoria futura e relatórios dependem desse dado.

---

## 3. Decisões de Frontend

### Angular 20 + Nx Monorepo

```
frontend/
├── apps/enrollment-app/          ← aplicação principal
└── libs/
    ├── shared-auth/               ← authGuard, roleGuard, AuthService
    ├── shared-data-access/        ← NgRx Signal Stores, API Services, models
    └── shared-ui/                 ← LoadingComponent, ErrorMessageComponent
```

**Nx vs estrutura flat Angular:**
- **Boundary enforcement:** libs/shared-auth não pode importar libs/shared-data-access sem declarar explicitamente
- **Caching de build:** `nx build` recompila apenas libs alteradas
- **Separação de responsabilidades forçada pelo compilador:** não é só convenção, é enforced pelo module boundary

### NgRx Signal Store

```typescript
// MatrizStore — estado reativo sem boilerplate de Actions/Reducers/Effects
export const MatrizStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, api = inject(MatrizApiService)) => ({
    loadAulas: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => api.listar().pipe(
        tapResponse(
          (aulas) => patchState(store, { aulas, loading: false }),
          () => patchState(store, { error: 'Erro ao carregar', loading: false })
        )
      ))
    )),
  }))
);
```

**Signal Store vs NgRx clássico:**
- Zero boilerplate de Actions/Reducers: 80% menos código para o mesmo resultado
- `rxMethod` = ponte entre signals e streams RxJS sem impedir o uso de operadores complexos
- Integração com `effect()` para reações a estado (toast de sucesso após matrícula)

### Keycloak-Angular v20 — Decisão Técnica Crítica

A versão 20 do `keycloak-angular` **depreciou `KeycloakService`** e migrou para injeção direta do `Keycloak` do `keycloak-js`:

```typescript
// ❌ ANTES (v17): KeycloakService — NÃO é provido por provideKeycloak()
const keycloak = inject(KeycloakService);  // NG0201 em runtime!

// ✅ DEPOIS (v20): Keycloak diretamente
import Keycloak from 'keycloak-js';
const keycloak = inject(Keycloak);          // Provido por provideKeycloak()
```

**Armadilha encontrada:** `withAutoRefreshToken` chama `inject(AutoRefreshTokenService)` internamente. Esse service precisa estar explicitamente nos `providers[]` do `provideKeycloak()`:

```typescript
provideKeycloak({
  ...
  features: [withAutoRefreshToken({ onInactivityTimeout: 'logout' })],
  providers: [AutoRefreshTokenService, UserActivityService], // ← OBRIGATÓRIO
})
```

### PrimeNG 20 Standalone API

| v19 (module) | v20 (standalone) |
|---|---|
| `DropdownModule` | `Select` (`<p-select>`) |
| `ButtonModule` | `Button` |
| `CardModule` | `Card` |
| `TagModule` | `Tag` |
| `MultiSelectModule` | `MultiSelect` |

---

## 4. Diagrama de Entidade (ERD)

```
┌─────────────────┐          ┌─────────────────┐
│     CURSO       │          │   DISCIPLINA    │
├─────────────────┤          ├─────────────────┤
│ id UUID PK      │          │ id UUID PK      │
│ nome            │          │ nome            │
│ descricao       │          │ carga_horaria   │
└────────┬────────┘          │ ementa          │
         │                   └────────┬────────┘
         │ 1:N                        │ N:1
         ▼                            ▼
┌─────────────────┐          ┌─────────────────────────────────┐
│     ALUNO       │          │         AULA_MATRIZ             │
├─────────────────┤    N:M   ├─────────────────────────────────┤
│ id UUID PK      │◄────────►│ id UUID PK                      │
│ nome            │          │ disciplina_id FK → DISCIPLINA   │
│ email UNIQUE    │ via       │ professor_id FK → PROFESSOR     │
│ matricula UNIQUE│ matricula │ horario_id FK → HORARIO         │
│ keycloak_id     │          │ coordenador_id FK → COORDENADOR │
│ curso_id FK     │          │ max_alunos                      │
└────────┬────────┘          │ ativo (soft-delete)             │
         │                   └──────────┬──────────────────────┘
         │ 1:N                          │ N:M via AULA_MATRIZ_CURSO
         ▼                              ▼
┌─────────────────┐          ┌─────────────────┐
│   MATRICULA     │          │ AULA_MATRIZ_CURSO│
├─────────────────┤          ├─────────────────┤
│ id UUID PK      │          │ aula_matriz_id  │
│ aluno_id FK     │          │ curso_id        │
│ aula_matriz_id  │          └─────────────────┘
│ data_matricula  │
│ ativo (cancel)  │          ┌─────────────────┐
│ UNIQUE(aluno,   │          │    PROFESSOR    │
│   aula_matriz)  │          ├─────────────────┤
└─────────────────┘          │ id UUID PK      │
                             │ nome            │
┌─────────────────┐          │ email UNIQUE    │
│  COORDENADOR    │          │ especialidade   │
├─────────────────┤          └─────────────────┘
│ id UUID PK      │
│ nome            │          ┌─────────────────┐
│ email UNIQUE    │          │    HORARIO      │
│ keycloak_id     │          ├─────────────────┤
└─────────────────┘          │ id UUID PK      │
                             │ dia_semana      │
                             │ hora_inicio     │
                             │ hora_fim        │
                             │ periodo         │
                             └─────────────────┘
```

---

## 5. Controle de Acesso

### Duas Camadas de Segurança

**Camada 1 — Frontend (UX)**
```typescript
// app.routes.ts — canActivate com roleGuard
{ path: 'matriz', canActivate: [authGuard, roleGuard('COORDENADOR')] }
{ path: 'matricula', canActivate: [authGuard, roleGuard('ALUNO')] }
```
- Impede navegação a rotas não autorizadas
- Oculta links no navbar baseado em `keycloak.realmAccess.roles`

**Camada 2 — Backend (segurança real)**
```kotlin
@RolesAllowed("COORDENADOR")  // MatrizResource — valida JWT
@RolesAllowed("ALUNO")         // MatriculaResource

// + isolamento de dados: coordenador só vê suas aulas
val coordenador = getCoordenadorByKeycloakId(securityContext.userPrincipal.name)
return AulaMatriz.find("coordenador = ?1 and ativo = true", coordenador)
```

**Por que `@RolesAllowed` e não `@Authenticated`?**
Em Quarkus 3.x, combinar `@Authenticated + @RolesAllowed` lança `IllegalStateException`. Usar apenas `@RolesAllowed` implica autenticação e verifica o role em uma única annotation.

---

## 6. Infraestrutura Docker

### Ordem de Dependências

```yaml
postgres:   healthcheck (pg_isready)
keycloak:   depends_on postgres (service_healthy)
backend:    depends_on postgres (service_healthy) + keycloak (service_started)
frontend:   depends_on backend
```

**Por que `restart: unless-stopped` no backend?**
O Keycloak pode demorar até 30s para importar o realm. O backend inicia rapidamente mas pode receber 503 do OIDC discovery. O `restart: unless-stopped` garante que o backend tenta novamente sem intervenção manual.

### Init.sql vs Hibernate DDL Auto

```yaml
QUARKUS_HIBERNATE_ORM_DATABASE_GENERATION: validate
QUARKUS_HIBERNATE_ORM_SQL_LOAD_SCRIPT: no-file
```

- `validate`: Hibernate verifica que o schema do banco coincide com as entidades. Se divergir, falha rápido e explícito
- O schema é criado pelo PostgreSQL `init.sql` (mais controle sobre tipos, constraints, índices)
- `no-file`: desabilita `import.sql` (funciona apenas em dev profile) — não confundir com `init.sql`

---

## 7. Testes

### Backend — JUnit 5 + QuarkusTest (H2 in-memory)

```kotlin
// MatriculaServiceTest.kt — 8 testes de regras de negócio críticas
// Abordagem: @QuarkusTest com H2 in-memory no profile %test — sem mocks, sem stubs
// Cada test roda contra a service real com banco real (in-memory) — maior fidelidade

@QuarkusTest
@TestSecurity(user = "test-aluno", roles = ["ALUNO"])
class MatriculaServiceTest {
    @Inject lateinit var matriculaService: MatriculaService

    @BeforeEach @Transactional
    fun setup() { /* limpa banco e cria dados isolados */ }

    @Test fun `matricular_sucesso`() { ... }
    @Test fun `matricular_semVagas_throwsRegraDeNegocio`() { ... }
    @Test fun `matricular_choqueDeHorario_throwsRegraDeNegocio`() { ... }
    @Test fun `matricular_cursoNaoAutorizado_throwsRegraDeNegocio`() { ... }
    @Test fun `cancelarMatricula_alunoErrado_throwsAcessoNegado`() { ... }
    @Test fun `cancelarMatricula_sucesso_setAtivo_false`() { ... }
    @Test fun `matricular_aposCancel_reativa_matricula`() { ... }  // upsert
    @Test fun `cancelarMatricula_jaInativa_throwsRegraDeNegocio`() { ... }
}
```

**Decisão técnica — @QuarkusTest com H2 vs Mockito puro:**
- `@QuarkusTest` sobe o container CDI real com a service real — detecta bugs de integração entre service e ORM
- H2 no profile `%test` (MODE=PostgreSQL) permite queries JPQL reais sem precisar de Docker
- `@TestSecurity` simula contexto autenticado sem Keycloak em produção
- Desvantagem aceita: testes levam ~3-5s vs ~50ms com mocks — trade-off intencional para fidelidade

**Cobertura intencional:** 100% dos caminhos negativos (BusinessRule violations) + fluxo feliz + upsert. Não vale a pena cobrir getters/setters de DTOs.

### Frontend — Jest + jest-preset-angular (95 testes, 7 suites)

```
 PASS  apps/enrollment-app/src/app/features/shared/auth-guard.spec.ts     (16 tests)
 PASS  apps/enrollment-app/src/app/features/shared/auth-service.spec.ts   (12 tests)
 PASS  apps/enrollment-app/src/app/features/shared/component-utils.spec.ts (8 tests)
 PASS  apps/enrollment-app/src/app/features/matricula/matricula-api.service.spec.ts (15 tests)
 PASS  apps/enrollment-app/src/app/features/matricula/matricula-store.spec.ts      (14 tests)
 PASS  apps/enrollment-app/src/app/features/matriz/matriz-api.service.spec.ts     (16 tests)
 PASS  apps/enrollment-app/src/app/features/matriz/matriz-store.spec.ts           (14 tests)

Test Suites: 7 passed, 7 total
Tests:       95 passed, 95 total
```

**Desafio técnico resolvido — Angular 20 é pure ESM:**
- Angular 20 removeu os bundles CJS do `@angular/core` → `ts-jest` puro lança erro imediatamente
- Solução: `jest-preset-angular@14` como transformer ESM-aware
- `keycloak-js` usa campo `exports` sem `main` → path explícito em `tsconfig.spec.json`
- `provideRouter([])` no TestBed 20 causa injeção circular → solução: `Injector.create() + runInInjectionContext`

---

## 8. O que Faria Diferente com Mais Tempo

| Item | Situação atual | Melhoria |
|---|---|---|
| Testes de integração | @QuarkusTest com H2 (sem Docker) | `@QuarkusIntegrationTest` com Testcontainers + PostgreSQL real |
| Frontend testes | 95 testes Jest (services + stores + guards) | Testes de componente com Angular Testing Library |
| Paginação | Listas sem paginação server-side | `Pageable` no backend + scroll infinito no frontend |
| Cache | Sem cache | `@CacheResult` nas referências (disciplinas/horários não mudam) |
| Observability | Health básico (smallrye-health) | Micrometer + Grafana/Prometheus dashboard |
| CI/CD | Só Docker Compose local | GitHub Actions: lint → test → build → push imagem |
| Refresh token | `withAutoRefreshToken` configurado | Rotação automática de refresh token com sliding window |

---

## 9. Pontos para Destacar na Entrevista

### "Por que usou pessimistic locking?"

> "Em um sistema de matrícula, dois alunos podem simultaneamente ver '1 vaga disponível' e ambos clicarem em Matricular. Com optimistic locking, um deles receberia um erro 409 genérico e precisaria de retry. Com pessimistic (`SELECT FOR UPDATE`), o segundo aluno espera o primeiro commit e recebe a mensagem clara 'Não há vagas disponíveis'. Isso é semanticamente mais correto para o domínio e reduz a superfície de erros no cliente."

### "Por que NgRx Signal Store e não NgRx clássico?"

> "NgRx clássico tem overhead de 200+ linhas (actions, reducers, effects, selectors) para um fluxo simples. O Signal Store entrega o mesmo resultado em ~50 linhas com `rxMethod` para integrações RxJS. Para uma SPA de médio porte como essa, a produtividade é superior sem sacrificar previsibilidade — o estado ainda é imutável e centralizado."

### "Por que Quarkus e não Spring Boot?"

> "A principal razão foi o OIDC declarativo. Com Quarkus, adiciono 3 linhas no `application.properties` e o framework trata toda a validação JWT, extração de roles e propagação do `SecurityContext`. No Spring Security precisaria de mais configuração explícita. Além disso, Quarkus tem startup sub-segundo em dev mode, que acelera muito o ciclo de desenvolvimento."

### "Por que soft delete?"

> "Dados acadêmicos têm valor histórico e legal. Se um aluno foi matriculado em uma aula e depois a aula foi 'excluída', esse histórico precisa existir para fins de relatório, certificação e auditoria. Marcar como `ativo = false` é a abordagem correta — o dado existe no banco mas não aparece nas listagens operacionais."

---

## 10. Arquitetura de Branches Git

```
master          ← versão estável final (tag v1.0.0)
  └── develop   ← integração contínua
        ├── feature/database-schema     ← DDL + seed data
        ├── feature/backend-core        ← entidades, serviços, recursos
        ├── feature/keycloak-setup      ← realm export, usuários
        ├── feature/frontend-structure  ← Nx monorepo, libs, config
        ├── feature/coordinator-ui      ← páginas do coordenador
        ├── feature/student-ui          ← páginas do aluno
        └── fix/keycloak-angular-v20    ← migração para nova API KC
```
