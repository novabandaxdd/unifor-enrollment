# Sistema de Matrícula — Unifor

> Sistema full-stack de gestão de matriz curricular e matrícula acadêmica desenvolvido para o Desafio Técnico Unifor 2026.

**Stack:** Kotlin 2.0 · Quarkus 3.20 · Angular 20 · PostgreSQL 16 · Keycloak 24 · Docker Compose

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Docker & Docker Compose | 24+ |
| Node.js (apenas para dev local) | 20+ |
| Java (apenas para dev local) | 21+ |
| Git | qualquer |

---

## Como executar

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd unifor-enrollment

# 2. Suba todos os serviços com um único comando
docker compose up --build
```

A ordem de inicialização é automática:
```
postgres → keycloak → backend → frontend
```

Aguarde a mensagem `Quarkus ... started in` no log antes de acessar o sistema.

---

## URLs de acesso

| Serviço | URL |
|---|---|
| **Frontend** | http://localhost:4200 |
| **Backend REST API** | http://localhost:8080 |
| **Swagger UI** | http://localhost:8080/q/swagger-ui |
| **Keycloak Admin** | http://localhost:8180 |

Credenciais do painel Keycloak: **admin / admin**

---

## Credenciais de teste

Todos os usuários utilizam a senha: **`unifor123`**

### Coordenadores (perfil `COORDENADOR`)

| Nome | Usuário / E-mail | Senha |
|---|---|---|
| Ana Coordenadora | coord.ana@unifor.br | unifor123 |
| Bruno Coordenador | coord.bruno@unifor.br | unifor123 |
| Carla Coordenadora | coord.carla@unifor.br | unifor123 |

### Alunos (perfil `ALUNO`)

| Nome | Usuário / E-mail | Senha |
|---|---|---|
| João Aluno | aluno.joao@unifor.br | unifor123 |
| Maria Aluna | aluno.maria@unifor.br | unifor123 |
| Pedro Aluno | aluno.pedro@unifor.br | unifor123 |
| Julia Aluna | aluno.julia@unifor.br | unifor123 |
| Lucas Aluno | aluno.lucas@unifor.br | unifor123 |

---

## Endpoints da API

Documentação interativa completa: **http://localhost:8080/q/swagger-ui**

### Matriz Curricular (perfil: COORDENADOR)

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/v1/matriz` | Listar aulas com filtros |
| `POST` | `/api/v1/matriz` | Criar nova aula |
| `PATCH` | `/api/v1/matriz/{id}` | Editar aula |
| `DELETE` | `/api/v1/matriz/{id}` | Excluir aula (soft-delete) |

**Filtros disponíveis (GET /api/v1/matriz):**
- `periodo` — `MANHA`, `TARDE` ou `NOITE`
- `cursoId` — UUID do curso
- `maxAlunos` — capacidade máxima (filtra por ≤)
- `horarioId` — UUID do horário

### Matrícula (perfil: ALUNO)

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/v1/matricula/disponiveis` | Aulas disponíveis para o curso do aluno |
| `GET` | `/api/v1/matricula/minhas` | Matrículas ativas do aluno |
| `POST` | `/api/v1/matricula` | Realizar matrícula |
| `DELETE` | `/api/v1/matricula/{id}` | Cancelar matrícula |

### Referências (autenticado — ALUNO ou COORDENADOR)

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/v1/referencias/disciplinas` | Lista de disciplinas |
| `GET` | `/api/v1/referencias/professores` | Lista de professores |
| `GET` | `/api/v1/referencias/horarios` | Lista de horários |
| `GET` | `/api/v1/referencias/cursos` | Lista de cursos |

### Códigos de resposta

| Código | Significado |
|---|---|
| `200 OK` | Sucesso |
| `201 Created` | Recurso criado |
| `204 No Content` | Operação sem retorno (ex: exclusão) |
| `401 Unauthorized` | Token ausente ou inválido |
| `403 Forbidden` | Sem permissão para o recurso |
| `404 Not Found` | Entidade não encontrada |
| `409 Conflict` | Regra de negócio violada (sem vagas, choque de horário, etc.) |
| `422 Unprocessable Entity` | Dados inválidos |

---

## Fluxo de teste — Coordenador

1. Acesse http://localhost:4200
2. Faça login com `coord.ana@unifor.br` / `unifor123`
3. Vá em **Matriz Curricular** → veja as aulas cadastradas
4. Use os **filtros** de período, curso e máximo de alunos
5. Clique em **Nova Aula** → preencha os campos → clique em **Criar Aula**
6. Clique em **Editar** para alterar professor, horário ou cursos autorizados
7. Tente **Excluir** uma aula com alunos matriculados → deve retornar erro 409

## Fluxo de teste — Aluno

1. Abra uma nova aba ou faça logout do coordenador
2. Faça login com `aluno.joao@unifor.br` / `unifor123`
3. Vá em **Aulas Disponíveis** → veja as aulas do seu curso com vagas
4. Clique em **Matricular** → confirme no diálogo de confirmação
5. Vá em **Minhas Matrículas** → verifique a matrícula realizada
6. Clique em **Cancelar** para desfazer

## Cenários de erro testados

| Cenário | Resposta esperada |
|---|---|
| Matricular em aula sem vaga | Toast de erro — HTTP 409 |
| Choque de horário | Toast de erro — HTTP 409 |
| Curso não autorizado | Toast de erro — HTTP 409 |
| Excluir aula com matriculados | Toast de erro — HTTP 409 |
| Acesso a rota sem autenticação | Redirecionamento para Keycloak |
| Acesso a rota de outro perfil | Página 403 Não Autorizado |

---

## Testes unitários

```bash
# Backend — JUnit 5 com Mockito
cd backend
./mvnw test

# Relatório de cobertura (JaCoCo)
./mvnw verify
# Abra: target/site/jacoco/index.html
```

Os testes cobrem o `MatriculaService` — a classe com as regras de negócio mais críticas:

- ✅ Matrícula bem-sucedida cria registro
- ✅ Erro quando curso não autorizado
- ✅ Erro quando não há vagas
- ✅ Erro quando há choque de horário
- ✅ Erro quando aluno já está matriculado
- ✅ Upsert reativa matrícula cancelada
- ✅ Cancelamento de matrícula
- ✅ Erro ao cancelar matrícula já cancelada

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│  Navegador                                                  │
│  Angular 20 SPA (porta 4200)                                │
│  NgRx Signal Store · PrimeNG · keycloak-angular             │
└───────────────────┬─────────────────────────────────────────┘
                    │ HTTP + Bearer Token (JWT)
┌───────────────────▼─────────────────────────────────────────┐
│  Quarkus 3.20 (porta 8080)                                  │
│  RESTEasy Reactive · JPA Panache · OpenAPI/Swagger          │
│  @RolesAllowed("ALUNO" | "COORDENADOR")                     │
└────────┬───────────────────────────┬────────────────────────┘
         │                           │ OIDC
┌────────▼───────┐       ┌───────────▼──────────────────────┐
│  PostgreSQL 16 │       │  Keycloak 24 (porta 8180)        │
│  (porta 5432)  │       │  Realm: unifor                   │
│  unifor_db     │       │  Tema personalizado em PT-BR     │
└────────────────┘       └──────────────────────────────────┘
```

### Decisões técnicas principais

| Decisão | Justificativa |
|---|---|
| **Lock pessimista** (`PESSIMISTIC_WRITE`) | Garante consistência em matrículas concorrentes — zero chance de dupla ocupação de vaga |
| **Keycloak PKCE** | Padrão OAuth2 seguro para SPA — sem client_secret no navegador |
| **Panache Active Record** | Menos boilerplate, queries expressivas, ideal para o tamanho deste domínio |
| **NgRx Signal Store** | Mais leve que Redux clássico, reatividade nativa do Angular 20 com Signals |
| **Nx Monorepo** | Separação clara entre `apps/` e `libs/` com build cache incremental |
| **Soft delete** | Preserva histórico acadêmico e permite auditoria |
| **Upsert pattern** | Evita `ConstraintViolationException` ao re-matricular após cancelamento |

---

## Estrutura do projeto

```
unifor-enrollment/
├── backend/                        # Aplicação Quarkus Kotlin
│   ├── src/main/kotlin/br/unifor/enrollment/
│   │   ├── resource/               # Controllers REST (MatrizResource, MatriculaResource)
│   │   ├── service/                # Regras de negócio (MatrizService, MatriculaService)
│   │   ├── domain/                 # Entidades JPA Panache
│   │   ├── dto/                    # DTOs de request/response
│   │   ├── exception/              # Exceções de domínio + GlobalExceptionMapper
│   │   └── config/                 # JacksonConfig (KotlinModule)
│   ├── src/test/                   # Testes unitários JUnit 5 + Mockito
│   └── Dockerfile
├── docs/
│   └── interview-notes.md          # Notas para entrevista técnica
├── frontend/                       # Workspace Nx Angular 20
│   ├── apps/enrollment-app/        # Aplicação principal
│   │   └── src/app/
│   │       ├── features/
│   │       │   ├── matriz/         # Criar, listar, editar aulas
│   │       │   ├── matricula/      # Aulas disponíveis, minhas matrículas
│   │       │   └── shared/         # Dashboard, unauthorized
│   │       ├── app.component.ts    # Shell com sidebar colapsável
│   │       └── app.routes.ts       # Roteamento com guards
│   ├── libs/
│   │   ├── shared-auth/            # AuthService, AuthGuard, RoleGuard
│   │   ├── shared-data-access/     # Models, API services, Signal Stores
│   │   └── shared-ui/              # LoadingComponent, ErrorMessageComponent
│   └── Dockerfile
├── infra/
│   ├── keycloak/
│   │   ├── realm-export.json       # Realm com usuários, roles e clientes
│   │   └── themes/unifor/login/    # Tema customizado em PT-BR
│   └── postgres/
│       └── init.sql                # Schema + seed data
├── docker-compose.yml
└── README.md
```

---

## Dados pré-cadastrados

O banco de dados é inicializado automaticamente com:

| Entidade | Quantidade |
|---|---|
| Cursos | 9 |
| Disciplinas | 15 |
| Professores | 5 |
| Horários | 9 |
| Coordenadores | 3 |
| Alunos | 5 |

---

## Documentação completa

- **Swagger UI:** http://localhost:8080/q/swagger-ui
