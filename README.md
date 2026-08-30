# Sistema de Matrícula Unifor

Full-stack academic enrollment system built for the Unifor technical challenge.

- **Backend:** Kotlin 2.0 + Quarkus 3.20, PostgreSQL, JPA/Panache, REST API
- **Frontend:** Angular 20 + Nx monorepo, NgRx Signal Store, PrimeNG, Keycloak-Angular
- **Infrastructure:** Docker Compose (backend · frontend · Keycloak · PostgreSQL)
- **Auth:** Keycloak OIDC with roles `ALUNO` and `COORDENADOR`

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| Docker & Docker Compose | 24+ |
| Node.js | 20+ |
| Java | 21+ |
| Git | any |

---

## Quick Start

```bash
# Clone and run everything with one command
git clone <repo-url>
cd unifor-enrollment
docker compose up --build
```

All four services start in the correct dependency order:
`postgres` → `keycloak` → `backend` → `frontend`

Wait for the log line `Quarkus ... started in` before accessing the app.

---

## Service URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend REST API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/q/swagger-ui |
| Keycloak Admin | http://localhost:8180 |

Keycloak admin credentials: **admin / admin**

---

## Test Credentials

All users share the password: **`unifor123`**

### Coordinators (`COORDENADOR` role)

| Name | Username / Email | Password |
|---|---|---|
| Ana Coordenadora | coord.ana@unifor.br | unifor123 |
| Bruno Coordenador | coord.bruno@unifor.br | unifor123 |
| Carla Coordenadora | coord.carla@unifor.br | unifor123 |

### Students (`ALUNO` role)

| Name | Username / Email | Password |
|---|---|---|
| João Aluno | aluno.joao@unifor.br | unifor123 |
| Maria Aluna | aluno.maria@unifor.br | unifor123 |
| Pedro Aluno | aluno.pedro@unifor.br | unifor123 |
| Julia Aluna | aluno.julia@unifor.br | unifor123 |
| Lucas Aluno | aluno.lucas@unifor.br | unifor123 |

---

## Endpoints da API

Swagger UI interativo: **http://localhost:8080/q/swagger-ui**

| Método | Endpoint | Role | Descrição |
|---|---|---|---|
| `GET` | `/api/v1/matriz` | COORDENADOR | Listar aulas da matriz |
| `POST` | `/api/v1/matriz` | COORDENADOR | Criar nova aula na matriz |
| `PATCH` | `/api/v1/matriz/{id}` | COORDENADOR | Editar aula |
| `DELETE` | `/api/v1/matriz/{id}` | COORDENADOR | Soft-delete de aula |
| `GET` | `/api/v1/matricula/disponiveis` | ALUNO | Aulas disponíveis para o curso do aluno |
| `GET` | `/api/v1/matricula/minhas` | ALUNO | Matrículas ativas do aluno |
| `POST` | `/api/v1/matricula` | ALUNO | Realizar matrícula |
| `DELETE` | `/api/v1/matricula/{id}` | ALUNO | Cancelar matrícula |

---

## Testando a Aplicação

### Fluxo do Coordenador

1. Acesse http://localhost:4200
2. Faça login com `coord.ana@unifor.br` / `unifor123`
3. Navegue até **Matriz Curricular** → visualize as aulas cadastradas
4. Clique em **Nova Aula** → preencha disciplina, professor, horário e cursos autorizados → salve
5. Verifique que a nova aula aparece na listagem com vagas disponíveis
6. Clique em **Editar** para alterar professor ou horário
7. Tente **Excluir** uma aula que já tem alunos matriculados → deve retornar erro 409

### Fluxo do Aluno

1. Acesse http://localhost:4200 (em outra aba ou após logout do coordenador)
2. Faça login com `aluno.joao@unifor.br` / `unifor123`
3. Navegue até **Aulas Disponíveis** → veja as aulas do seu curso com vagas
4. Clique em **Matricular** em uma aula → a linha desaparece da listagem
5. Vá para **Minhas Matrículas** → a nova matrícula aparece na tabela
6. Clique em **Cancelar** para desfazer a matrícula

### Cenários de Erro

| Cenário | Resposta esperada |
|---|---|
| Matricular em aula sem vaga | Toast de erro: "Sem vagas disponíveis" (HTTP 409) |
| Conflito de horário | Toast de erro: "Conflito de horário" (HTTP 409) |
| Curso não autorizado para a aula | Toast de erro com mensagem do backend (HTTP 409) |

---

## Executando Testes Unitários

```bash
# Backend — testes JUnit com Quarkus Test
cd backend
./mvnw test

# Relatório de cobertura (JaCoCo)
./mvnw verify
open target/site/jacoco/index.html
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                │
│  Angular 20 SPA (port 4200)                             │
│  NgRx Signal Store · PrimeNG · keycloak-angular         │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTP + Bearer token
┌───────────────────▼─────────────────────────────────────┐
│  Quarkus 3.20 (port 8080)                               │
│  RESTEasy Reactive · JPA Panache · OpenAPI              │
│  @RolesAllowed("ALUNO"|"COORDENADOR")                   │
└────────┬───────────────────────────┬────────────────────┘
         │                           │
┌────────▼───────┐       ┌───────────▼──────────────────┐
│  PostgreSQL 16 │       │  Keycloak 24 (port 8180)     │
│  (port 5432)   │       │  Realm: unifor               │
│  unifor_db     │       │  Clients: backend, frontend  │
└────────────────┘       └──────────────────────────────┘
```

Key design decisions:

- **Pessimistic locking** (`PESSIMISTIC_WRITE`) on `AulaMatriz` prevents double-booking under concurrent enrollment requests.
- **Keycloak PKCE** for the Angular SPA (public client, no client secret in the browser).
- **Panache Active Record** pattern for minimal persistence boilerplate.
- **Nx monorepo** with shared libs (`shared-ui`, `shared-data-access`, `shared-auth`) for clean separation of concerns.

See [`docs/interview-notes.md`](docs/interview-notes.md) for full architecture rationale.

---

## Project Structure

```
unifor-enrollment/
├── backend/                   # Quarkus Kotlin application
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── docs/
│   └── interview-notes.md     # Architecture decisions (for interview)
├── frontend/                  # Nx Angular 20 workspace
│   ├── apps/enrollment-app/
│   ├── libs/
│   │   ├── shared-auth/       # Keycloak guards + AuthService
│   │   ├── shared-data-access/ # API services + NgRx Signal Stores
│   │   └── shared-ui/         # Reusable PrimeNG wrappers
│   └── Dockerfile
├── infra/
│   ├── keycloak/realm-export.json
│   └── postgres/init.sql
├── docker-compose.yml
└── README.md
```
