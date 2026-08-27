-- ============================================================
-- Unifor Enrollment — Database Initialization Script
-- PostgreSQL 16
-- Executed automatically by Docker at first startup.
-- DDL only; seed data is loaded via backend/src/main/resources/import.sql
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- curso
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS curso (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(100) NOT NULL,
    descricao   TEXT
);

-- ------------------------------------------------------------
-- disciplina
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS disciplina (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nome          VARCHAR(100) NOT NULL,
    carga_horaria INT          NOT NULL,
    ementa        TEXT
);

-- ------------------------------------------------------------
-- professor
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS professor (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nome         VARCHAR(100) NOT NULL,
    email        VARCHAR(150) UNIQUE NOT NULL,
    especialidade VARCHAR(100)
);

-- ------------------------------------------------------------
-- horario
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS horario (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    dia_semana  VARCHAR(20) NOT NULL,
    hora_inicio TIME        NOT NULL,
    hora_fim    TIME        NOT NULL,
    periodo     VARCHAR(10) NOT NULL  -- MANHA | TARDE | NOITE
);

-- ------------------------------------------------------------
-- coordenador
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coordenador (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nome         VARCHAR(100) NOT NULL,
    email        VARCHAR(150) UNIQUE NOT NULL,
    keycloak_id  VARCHAR(100) UNIQUE NOT NULL
);

-- ------------------------------------------------------------
-- aluno
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aluno (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    matricula   VARCHAR(20)  UNIQUE NOT NULL,
    keycloak_id VARCHAR(100) UNIQUE NOT NULL,
    curso_id    UUID         REFERENCES curso(id)
);

-- ------------------------------------------------------------
-- aula_matriz
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aula_matriz (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    disciplina_id   UUID    NOT NULL REFERENCES disciplina(id),
    professor_id    UUID    NOT NULL REFERENCES professor(id),
    horario_id      UUID    NOT NULL REFERENCES horario(id),
    coordenador_id  UUID    NOT NULL REFERENCES coordenador(id),
    max_alunos      INT     NOT NULL,
    ativo           BOOLEAN NOT NULL DEFAULT true
);

-- ------------------------------------------------------------
-- aula_matriz_curso  (M:N — which courses may enroll in a class)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aula_matriz_curso (
    aula_matriz_id  UUID NOT NULL REFERENCES aula_matriz(id),
    curso_id        UUID NOT NULL REFERENCES curso(id),
    PRIMARY KEY (aula_matriz_id, curso_id)
);

-- ------------------------------------------------------------
-- matricula  (student enrollment)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS matricula (
    id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id        UUID      NOT NULL REFERENCES aluno(id),
    aula_matriz_id  UUID      NOT NULL REFERENCES aula_matriz(id),
    data_matricula  TIMESTAMP NOT NULL DEFAULT NOW(),
    ativo           BOOLEAN   NOT NULL DEFAULT true,
    UNIQUE (aluno_id, aula_matriz_id)
);

-- ------------------------------------------------------------
-- Indexes for common query patterns
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_aluno_keycloak_id        ON aluno(keycloak_id);
CREATE INDEX IF NOT EXISTS idx_coordenador_keycloak_id  ON coordenador(keycloak_id);
CREATE INDEX IF NOT EXISTS idx_aula_matriz_coordenador  ON aula_matriz(coordenador_id);
CREATE INDEX IF NOT EXISTS idx_aula_matriz_ativo         ON aula_matriz(ativo);
CREATE INDEX IF NOT EXISTS idx_matricula_aluno           ON matricula(aluno_id);
CREATE INDEX IF NOT EXISTS idx_matricula_aula_matriz     ON matricula(aula_matriz_id);
CREATE INDEX IF NOT EXISTS idx_matricula_ativo           ON matricula(ativo);
