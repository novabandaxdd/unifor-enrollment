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

All four services will start in the correct order (postgres → keycloak → backend → frontend).

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

| Name | Email |
|---|---|
| Ana Coordenadora | coord.ana@unifor.br |
| Bruno Coordenador | coord.bruno@unifor.br |
| Carla Coordenadora | coord.carla@unifor.br |

### Students (`ALUNO` role)

| Name | Email |
|---|---|
| João Aluno | aluno.joao@unifor.br |
| Maria Aluna | aluno.maria@unifor.br |
| Pedro Aluno | aluno.pedro@unifor.br |
| Julia Aluna | aluno.julia@unifor.br |
| Lucas Aluno | aluno.lucas@unifor.br |

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

See [`docs/interview-notes.md`](docs/interview-notes.md) for full architecture rationale (created in Phase 6).

---

## Project Structure

```
unifor-enrollment/
├── backend/                   # Quarkus Kotlin application
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/                  # Nx Angular 20 workspace
│   ├── apps/enrollment-app/
│   ├── libs/
│   └── Dockerfile
├── infra/
│   ├── keycloak/realm-export.json
│   └── postgres/init.sql
├── docker-compose.yml
└── README.md
```
