-- ============================================================
-- Unifor Enrollment — Database Initialization Script
-- PostgreSQL 16
-- Executed automatically by Docker at first startup.
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
    periodo     VARCHAR(10) NOT NULL
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
-- aula_matriz_curso  (M:N)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aula_matriz_curso (
    aula_matriz_id  UUID NOT NULL REFERENCES aula_matriz(id),
    curso_id        UUID NOT NULL REFERENCES curso(id),
    PRIMARY KEY (aula_matriz_id, curso_id)
);

-- ------------------------------------------------------------
-- matricula
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
-- Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_aluno_keycloak_id        ON aluno(keycloak_id);
CREATE INDEX IF NOT EXISTS idx_coordenador_keycloak_id  ON coordenador(keycloak_id);
CREATE INDEX IF NOT EXISTS idx_aula_matriz_coordenador  ON aula_matriz(coordenador_id);
CREATE INDEX IF NOT EXISTS idx_aula_matriz_ativo         ON aula_matriz(ativo);
CREATE INDEX IF NOT EXISTS idx_matricula_aluno           ON matricula(aluno_id);
CREATE INDEX IF NOT EXISTS idx_matricula_aula_matriz     ON matricula(aula_matriz_id);
CREATE INDEX IF NOT EXISTS idx_matricula_ativo           ON matricula(ativo);

-- ============================================================
-- SEED DATA — Fixed UUIDs to match realm-export.json
-- ============================================================

-- ------------------------------------------------------------
-- CURSOS (9)
-- ------------------------------------------------------------
INSERT INTO curso (id, nome, descricao) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Ciência da Computação',                'Graduação em Ciência da Computação'),
  ('c1000000-0000-0000-0000-000000000002', 'Engenharia de Software',                'Graduação em Engenharia de Software'),
  ('c1000000-0000-0000-0000-000000000003', 'Sistemas de Informação',                'Graduação em Sistemas de Informação'),
  ('c1000000-0000-0000-0000-000000000004', 'Análise e Desenvolvimento de Sistemas', 'Graduação em ADS'),
  ('c1000000-0000-0000-0000-000000000005', 'Engenharia da Computação',              'Graduação em Engenharia da Computação'),
  ('c1000000-0000-0000-0000-000000000006', 'Redes de Computadores',                 'Graduação em Redes de Computadores'),
  ('c1000000-0000-0000-0000-000000000007', 'Banco de Dados',                        'Graduação em Banco de Dados'),
  ('c1000000-0000-0000-0000-000000000008', 'Inteligência Artificial',               'Graduação em Inteligência Artificial'),
  ('c1000000-0000-0000-0000-000000000009', 'Segurança da Informação',               'Graduação em Segurança da Informação')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- DISCIPLINAS (15)
-- ------------------------------------------------------------
INSERT INTO disciplina (id, nome, carga_horaria, ementa) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Algoritmos e Estrutura de Dados',    80, 'Fundamentos de algoritmos e estruturas de dados clássicas'),
  ('d1000000-0000-0000-0000-000000000002', 'Programação Orientada a Objetos',    80, 'Paradigma orientado a objetos com Java/Kotlin'),
  ('d1000000-0000-0000-0000-000000000003', 'Banco de Dados I',                   60, 'Modelo relacional, SQL e normalização'),
  ('d1000000-0000-0000-0000-000000000004', 'Cálculo I',                          80, 'Limites, derivadas e integrais'),
  ('d1000000-0000-0000-0000-000000000005', 'Álgebra Linear',                     60, 'Vetores, matrizes e transformações lineares'),
  ('d1000000-0000-0000-0000-000000000006', 'Redes de Computadores',              60, 'Protocolos, TCP/IP e arquitetura de redes'),
  ('d1000000-0000-0000-0000-000000000007', 'Engenharia de Software I',           80, 'Processos, requisitos e arquitetura de software'),
  ('d1000000-0000-0000-0000-000000000008', 'Sistemas Operacionais',              60, 'Processos, memória e sistemas de arquivos'),
  ('d1000000-0000-0000-0000-000000000009', 'Arquitetura de Computadores',        60, 'Organização e arquitetura de sistemas computacionais'),
  ('d1000000-0000-0000-0000-000000000010', 'Compiladores',                       80, 'Análise léxica, sintática, semântica e geração de código'),
  ('d1000000-0000-0000-0000-000000000011', 'Inteligência Artificial',            80, 'Busca heurística, aprendizado de máquina e redes neurais'),
  ('d1000000-0000-0000-0000-000000000012', 'Segurança da Informação',            60, 'Criptografia, vulnerabilidades e políticas de segurança'),
  ('d1000000-0000-0000-0000-000000000013', 'Desenvolvimento Web',                80, 'HTML, CSS, JavaScript, frameworks frontend e backend'),
  ('d1000000-0000-0000-0000-000000000014', 'Programação Mobile',                 80, 'Desenvolvimento Android e iOS com frameworks multiplataforma'),
  ('d1000000-0000-0000-0000-000000000015', 'Tópicos Avançados em TI',            60, 'Temas emergentes em tecnologia da informação')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- PROFESSORES (5)
-- ------------------------------------------------------------
INSERT INTO professor (id, nome, email, especialidade) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Dr. Roberto Silva',   'roberto.silva@unifor.br',   'Algoritmos'),
  ('a1000000-0000-0000-0000-000000000002', 'Dra. Fernanda Costa', 'fernanda.costa@unifor.br',  'Engenharia de Software'),
  ('a1000000-0000-0000-0000-000000000003', 'Dr. Marcos Lima',     'marcos.lima@unifor.br',     'Banco de Dados'),
  ('a1000000-0000-0000-0000-000000000004', 'Dra. Patricia Souza', 'patricia.souza@unifor.br',  'Redes'),
  ('a1000000-0000-0000-0000-000000000005', 'Dr. Eduardo Nunes',   'eduardo.nunes@unifor.br',   'Inteligencia Artificial')
ON CONFLICT (email) DO NOTHING;

-- ------------------------------------------------------------
-- HORARIOS (9)
-- ------------------------------------------------------------
INSERT INTO horario (id, dia_semana, hora_inicio, hora_fim, periodo) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'SEG', '08:00:00', '10:00:00', 'MANHA'),
  ('b1000000-0000-0000-0000-000000000002', 'SEG', '10:00:00', '12:00:00', 'MANHA'),
  ('b1000000-0000-0000-0000-000000000003', 'SEG', '14:00:00', '16:00:00', 'TARDE'),
  ('b1000000-0000-0000-0000-000000000004', 'SEG', '16:00:00', '18:00:00', 'TARDE'),
  ('b1000000-0000-0000-0000-000000000005', 'SEG', '19:00:00', '21:00:00', 'NOITE'),
  ('b1000000-0000-0000-0000-000000000006', 'TER', '08:00:00', '10:00:00', 'MANHA'),
  ('b1000000-0000-0000-0000-000000000007', 'TER', '14:00:00', '16:00:00', 'TARDE'),
  ('b1000000-0000-0000-0000-000000000008', 'QUA', '08:00:00', '10:00:00', 'MANHA'),
  ('b1000000-0000-0000-0000-000000000009', 'QUA', '19:00:00', '21:00:00', 'NOITE')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- COORDENADORES (3) — keycloak_id matches realm-export.json
-- ------------------------------------------------------------
INSERT INTO coordenador (id, nome, email, keycloak_id) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'Ana Coordenadora',   'coord.ana@unifor.br',   'cccccccc-0003-0003-0003-000000000001'),
  ('e1000000-0000-0000-0000-000000000002', 'Bruno Coordenador',  'coord.bruno@unifor.br', 'cccccccc-0003-0003-0003-000000000002'),
  ('e1000000-0000-0000-0000-000000000003', 'Carla Coordenadora', 'coord.carla@unifor.br', 'cccccccc-0003-0003-0003-000000000003')
ON CONFLICT (keycloak_id) DO NOTHING;

-- ------------------------------------------------------------
-- ALUNOS (5) — keycloak_id matches realm-export.json
-- ------------------------------------------------------------
INSERT INTO aluno (id, nome, email, matricula, keycloak_id, curso_id) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'João Aluno',  'aluno.joao@unifor.br',  '2024001', 'dddddddd-0004-0004-0004-000000000001', 'c1000000-0000-0000-0000-000000000001'),
  ('f1000000-0000-0000-0000-000000000002', 'Maria Aluna', 'aluno.maria@unifor.br', '2024002', 'dddddddd-0004-0004-0004-000000000002', 'c1000000-0000-0000-0000-000000000002'),
  ('f1000000-0000-0000-0000-000000000003', 'Pedro Aluno', 'aluno.pedro@unifor.br', '2024003', 'dddddddd-0004-0004-0004-000000000003', 'c1000000-0000-0000-0000-000000000003'),
  ('f1000000-0000-0000-0000-000000000004', 'Julia Aluna', 'aluno.julia@unifor.br', '2024004', 'dddddddd-0004-0004-0004-000000000004', 'c1000000-0000-0000-0000-000000000004'),
  ('f1000000-0000-0000-0000-000000000005', 'Lucas Aluno', 'aluno.lucas@unifor.br', '2024005', 'dddddddd-0004-0004-0004-000000000005', 'c1000000-0000-0000-0000-000000000005')
ON CONFLICT (keycloak_id) DO NOTHING;
