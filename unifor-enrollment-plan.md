# Unifor Enrollment — Technical Challenge Plan

## Top-Level Overview

Build a full-stack academic enrollment system from scratch, delivered as a monorepo:

- **Backend:** Kotlin 2.0 + Quarkus 3.20+, PostgreSQL, JPA/Panache, REST API, Keycloak integration
- **Frontend:** Angular 20 + Nx monorepo, NgRx Signal Store, RxJS, PrimeNG, Keycloak-Angular
- **Infrastructure:** Docker Compose (backend + frontend + Keycloak + PostgreSQL)
- **Documentation:** Swagger/OpenAPI auto-generated + README

The work is split into **6 sequential phases** designed to produce clean, incremental git commits over 3 days. Each phase ends in a working, committable state.

---

## Architecture Decisions (for interview doc)

| Decision | Choice | Reason |
|---|---|---|
| Backend language | Kotlin 2.0 | Concise, null-safe, coroutines for async |
| Framework | Quarkus 3.20 | Fast startup, native Panache, built-in OpenAPI |
| Persistence | Panache (Active Record) | Less boilerplate, fits Quarkus idiom |
| Auth | Keycloak OIDC | Requirement; roles mapped to `ALUNO`/`COORDENADOR` |
| Concurrency control | Pessimistic lock on enrollment slot | Prevents double-booking under race conditions |
| Frontend state | NgRx Signal Store + RxJS rxMethod | Angular 20 Signals-native, minimal boilerplate |
| UI lib | PrimeNG | Requirement |
| Monorepo | Nx | Requirement; clean lib/app separation |
| API style | REST + standard HTTP status codes | Requirement |

---

## Branch Strategy

```
master
  └── homolog
        └── develop
              ├── feature/database-schema       ← current
              ├── feature/backend-seed-data
              ├── feature/backend-curriculum
              ├── feature/backend-enrollment
              ├── feature/frontend-setup
              ├── feature/frontend-coordinator
              └── feature/frontend-student
```

Each feature branch is merged to `develop` via small, well-named commits before moving to the next.

---

## Sub-Tasks

---

### Phase 1 — Repository Structure & Infrastructure
**Status:** `[ ] pending`

**Intent:** Establish the monorepo layout, Docker Compose, Keycloak realm configuration, and database initialization. This is the foundation all other phases depend on.

**Expected Outcomes:**
- `docker-compose.yml` runs all 4 services (postgres, keycloak, backend, frontend)
- Keycloak realm `unifor` exists with roles `ALUNO` and `COORDENADOR` and test users
- PostgreSQL init script creates the schema
- Backend skeleton boots and connects to DB + Keycloak
- Frontend Nx workspace scaffolded with Angular 20

**Todo List:**
1. Create root `README.md` with project overview and run instructions
2. Create `docker-compose.yml` with services: `postgres`, `keycloak`, `backend`, `frontend`
3. Create `infra/keycloak/realm-export.json` — realm `unifor`, clients `backend` and `frontend`, roles `ALUNO`/`COORDENADOR`, 8 test users (5 students + 3 coordinators)
4. Create `infra/postgres/init.sql` — schema DDL (all tables)
5. Scaffold Nx workspace in `frontend/` using `create-nx-workspace` with Angular 20 preset
6. Scaffold Quarkus project in `backend/` using Quarkus CLI or Maven with extensions: `resteasy-reactive-jackson`, `hibernate-orm-panache`, `jdbc-postgresql`, `oidc`, `smallrye-openapi`, `kotlin`
7. Add `backend/Dockerfile` and `frontend/Dockerfile`
8. Commit: `feat: add infrastructure and project scaffold`

**Relevant Context:**
- Keycloak realm export JSON must have `directGrantsOnly: false` and PKCE enabled for the frontend SPA client
- Backend OIDC config: `quarkus.oidc.auth-server-url=http://keycloak:8080/realms/unifor`
- Nx command: `npx create-nx-workspace@latest frontend --preset=angular --framework=angular --bundler=esbuild`

---

### Phase 2 — Database Schema & Seed Data
**Status:** `[ ] pending`

**Branch:** `feature/database-schema` (current) → then `feature/backend-seed-data`

**Intent:** Define all entities with JPA/Panache and populate the required seed data (15 disciplines, 5 professors, 9 time slots, 9 courses, 5 students, 3 coordinators).

**Expected Outcomes:**
- All entity classes compile with correct JPA annotations
- Flyway or `import.sql` seeds all pre-cadastered entities
- Backend starts with zero errors and entities are queryable via H2 in dev mode

**Todo List:**
1. Create entity: `Disciplina` (id, nome, cargaHoraria, ementa)
2. Create entity: `Professor` (id, nome, email, especialidade)
3. Create entity: `Horario` (id, diaSemana, horaInicio, horaFim, periodo: MANHA/TARDE/NOITE)
4. Create entity: `Curso` (id, nome, descricao)
5. Create entity: `Aluno` (id, nome, email, matricula, keycloakId, curso FK)
6. Create entity: `Coordenador` (id, nome, email, keycloakId)
7. Create entity: `AulaMatriz` (id, disciplina FK, professor FK, horario FK, maxAlunos, ativo boolean, coordenador FK)
8. Create entity: `AulaMatrizCurso` join table (aulaMatrizId, cursoId) — authorized courses
9. Create entity: `Matricula` (id, aluno FK, aulaMatriz FK, dataMatricula, ativo boolean)
10. Create `src/main/resources/import.sql` with 15 disciplines, 5 professors, 9 time slots, 9 courses, 5 students, 3 coordinators
11. Commit per entity group: `feat: add domain entities`, `feat: add seed data`

**Relevant Context:**
- `AulaMatriz.maxAlunos` and vacancy counting must support pessimistic locking
- `Horario.periodo` derived from `horaInicio`: 06:00-12:00 = MANHA, 12:00-18:00 = TARDE, 18:00-23:00 = NOITE
- Keycloak IDs in seed data must match the realm-export.json test users

---

### Phase 3 — Backend: Curriculum Matrix API (Coordinator)
**Status:** `[ ] pending`

**Branch:** `feature/backend-curriculum`

**Intent:** Implement all coordinator endpoints: create, list (with filters), edit, and soft-delete curriculum entries (`AulaMatriz`).

**Expected Outcomes:**
- `POST /api/v1/matriz` — creates a new class entry, validates all references
- `GET /api/v1/matriz` — lists with filters (horario range, periodo, curso, maxAlunos)
- `PATCH /api/v1/matriz/{id}` — edits horario/professor/cursos, validates no enrolled students are lost
- `DELETE /api/v1/matriz/{id}` — soft delete, blocked if students enrolled
- All endpoints return correct HTTP status codes (201, 200, 204, 400, 403, 404, 409)
- Swagger UI shows all endpoints with schemas
- Access restricted to `COORDENADOR` role; coordinator sees only their own matrix

**Todo List:**
1. Create `MatrizResource` (REST controller) with `@RolesAllowed("COORDENADOR")`
2. Create `MatrizService` with business logic methods
3. Create request/response DTOs: `CriarAulaRequest`, `EditarAulaRequest`, `AulaResponse`, `MatrizFiltroParams`
4. Implement `criarAula` — validate disciplina, professor, horario, cursos exist; same disciplina in same horario → 409
5. Implement `listarAulas` with JPA criteria/Panache query using filters
6. Implement `editarAula` — allow horario/professor/cursos change; validate new horario valid; do not remove enrolled students
7. Implement `excluirAula` — check `Matricula` count; if > 0 return 409; else set `ativo=false`
8. Implement coordinator ownership check: coordinator can only manage their own AulaMatriz entries
9. Add `@QuarkusTest` unit tests for service layer (create, delete-with-students, edit-invalid-horario)
10. Commit: `feat: coordinator curriculum matrix CRUD API`

**Relevant Context:**
- `@Context SecurityIdentity` provides the logged-in user's keycloakId
- Panache query: `AulaMatriz.find("coordenador.keycloakId = ?1 and ativo = true", keycloakId)`
- Vacancy count: `Matricula.count("aulaMatriz = ?1 and ativo = true", aula)`

---

### Phase 4 — Backend: Enrollment API (Student) with Concurrency Control
**Status:** `[ ] pending`

**Branch:** `feature/backend-enrollment`

**Intent:** Implement student enrollment with transactional pessimistic locking to prevent double-booking under concurrent requests.

**Expected Outcomes:**
- `GET /api/v1/matricula/minhas` — returns all active enrollments for the logged-in student
- `GET /api/v1/matriz/disponiveis` — lists available classes for the student's course
- `POST /api/v1/matricula` — enrolls student with full rule validation
- `DELETE /api/v1/matricula/{id}` — cancels enrollment
- Concurrent enrollment requests for the last slot result in exactly one success and one 409
- Access restricted to `ALUNO` role

**Business Rules validated in service:**
1. `AulaMatriz` is authorized for the student's course (check `AulaMatrizCurso`)
2. Available slots: `maxAlunos - count(active matriculas)` > 0
3. No schedule conflict: student has no other active enrollment with same `Horario` (same diaSemana, overlapping horaInicio/horaFim)
4. Pessimistic lock: `em.lock(aulaMatriz, LockModeType.PESSIMISTIC_WRITE)` inside `@Transactional`

**Todo List:**
1. Create `MatriculaResource` with `@RolesAllowed("ALUNO")`
2. Create `MatriculaService` with `@Transactional` enrollment method
3. Create DTOs: `MatricularRequest` (aulaMatrizId), `MatriculaResponse` (disciplina, professor, horario)
4. Implement `getMinhasMatriculas` — query by student's keycloakId
5. Implement `getAulasDisponiveis` — filter by student's curso + ativo=true + vagas > 0
6. Implement `matricular` with pessimistic lock sequence:
   a. Load student by keycloakId
   b. Load and lock `AulaMatriz` with `PESSIMISTIC_WRITE`
   c. Validate course authorization
   d. Count active enrollments → check vacancy
   e. Check schedule conflict
   f. Insert `Matricula`
7. Add `@QuarkusTest` for: enrollment success, no vacancy, schedule conflict, unauthorized course
8. Commit: `feat: student enrollment API with pessimistic locking`

**Relevant Context:**
- Pessimistic lock in Panache: `getEntityManager().lock(entity, LockModeType.PESSIMISTIC_WRITE)`
- Schedule conflict query: find any `Matricula` for student where `horario.diaSemana = :dia AND horario.horaInicio < :horaFim AND horario.horaFim > :horaInicio`
- The transaction isolation ensures the lock is held until commit/rollback

---

### Phase 5 — Frontend: Nx Workspace + Auth + Coordinator Module
**Status:** `[ ] pending`

**Branch:** `feature/frontend-setup` + `feature/frontend-coordinator`

**Intent:** Set up the Nx Angular 20 workspace with shared libs, Keycloak auth, routing, and implement the full coordinator UI.

**Expected Outcomes:**
- Nx workspace with apps: `coordinator-app`, `student-app` (or one app with role-based routing)
- Shared libs: `ui` (PrimeNG wrappers), `data-access` (API services), `auth` (Keycloak guard)
- Login/logout flow via Keycloak PKCE
- Route guards using `keycloak-angular` with role checks
- Coordinator views: list matrix, create class form, edit class, delete with confirmation
- NgRx Signal Store for `MatrizStore` managing state

**Todo List:**
1. Create Nx workspace: `npx create-nx-workspace@latest frontend --preset=angular`
2. Add libs: `nx g @nx/angular:lib shared/ui`, `shared/data-access`, `shared/auth`
3. Install: `keycloak-angular`, `@ngrx/signals`, `primeng`, `primeicons`, `@angular/cdk`
4. Configure `KeycloakService` in `shared/auth` with realm/client from environment
5. Create `AuthGuard` and `RoleGuard` using `CanActivateFn` (standalone Angular 20 style)
6. Create `ApiService` base in `shared/data-access` using `HttpClient` with Keycloak token interceptor
7. Create `MatrizApiService` — CRUD calls to backend `/api/v1/matriz`
8. Create `MatrizStore` using NgRx Signal Store with `withState`, `withMethods`, `withComputed`
9. Create coordinator pages: `MatrizListPage`, `MatrizCreatePage`, `MatrizEditPage` using PrimeNG `p-table`, `p-dialog`, `p-form`
10. Add route protection: coordinator routes require `COORDENADOR` role
11. Commit: `feat: frontend Nx setup with auth and coordinator module`

**Relevant Context:**
- Angular 20 uses standalone components by default — no NgModule
- Keycloak PKCE flow: `keycloak-angular` v5+ supports Angular 17+ standalone
- Signal Store pattern: `signalStore(withState(initial), withMethods((store, api = inject(ApiService)) => ({...})))`
- PrimeNG v17+ works with Angular 20 with standalone imports

---

### Phase 6 — Frontend: Student Module + Docker Polish + Documentation
**Status:** `[ ] pending`

**Branch:** `feature/frontend-student`

**Intent:** Implement the student UI (view enrollments, browse available classes, enroll), finalize Docker Compose, and write the complete README + interview document.

**Expected Outcomes:**
- Student views: `MinhasMatriculasPage`, `AulasDisponiveisPage` with enrollment action
- Error handling: conflict messages (no vacancy, schedule conflict, unauthorized course) displayed via PrimeNG toast
- Docker Compose `docker compose up` starts everything and the app is fully usable
- `README.md` has full run instructions, URLs, test users
- `docs/interview-notes.md` — architecture decisions document for interview
- Swagger UI accessible at `http://localhost:8080/q/swagger-ui`

**Todo List:**
1. Create `MatriculaApiService` — calls to `/api/v1/matricula`
2. Create `MatriculaStore` with NgRx Signal Store
3. Create `MinhasMatriculasPage` — table with disciplina/professor/horario columns
4. Create `AulasDisponiveisPage` — filterable table, "Matricular" button per row
5. Handle backend error responses in store: map 409 → user-friendly Portuguese message
6. Add reactive loading/error states via Signal Store `withState`
7. Finalize `docker-compose.yml` with health checks and depends_on ordering
8. Write `README.md` with: prerequisites, `docker compose up`, URLs table, test credentials
9. Write `docs/interview-notes.md` (see structure below)
10. Final validation: `docker compose up --build` and manual test all flows
11. Commits: `feat: student enrollment UI`, `docs: add README and interview notes`, `chore: finalize docker compose`

---

## Interview Document Structure (docs/interview-notes.md)

To be written in Phase 6. Sections:

1. **Visão Geral da Arquitetura** — why this stack, how layers interact
2. **Decisões de Backend** — Kotlin vs Java, Panache Active Record, pessimistic locking, Quarkus OIDC
3. **Decisões de Frontend** — Angular 20 Signals, NgRx Signal Store vs NgRx Classic, Nx monorepo libs
4. **Controle de Acesso** — Keycloak roles, how they flow from JWT to `@RolesAllowed` to frontend `RoleGuard`
5. **Concorrência** — why pessimistic lock, what happens under concurrent requests, transaction boundary
6. **O que evoluiria** — optimistic locking migration, circuit breaker, E2E tests, CI/CD pipeline

---

## Commit Cadence (3-day schedule)

### Day 1
- `chore: initial project setup` ✅ (done)
- `feat: add infrastructure scaffold and docker-compose`
- `feat: add keycloak realm configuration`
- `feat: add database schema DDL`
- `feat: add domain entities`
- `feat: add seed data`

### Day 2
- `feat: coordinator curriculum matrix CRUD API`
- `feat: add unit tests for matrix service`
- `feat: student enrollment API with pessimistic locking`
- `feat: add unit tests for enrollment service`

### Day 3
- `feat: frontend Nx workspace setup`
- `feat: frontend keycloak authentication`
- `feat: frontend coordinator matrix management`
- `feat: frontend student enrollment module`
- `docs: add README and swagger documentation`
- `docs: add interview architecture notes`
- `chore: finalize docker compose and environment config`
