-- =============================================================
-- Unifor Enrollment — Seed Data
-- Loaded by Hibernate in %dev and %test profiles only.
-- =============================================================

-- -------------------------------------------------------------
-- CURSOS (9 records — fixed UUIDs for cross-table references)
-- -------------------------------------------------------------
INSERT INTO curso (id, nome, descricao) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Ciência da Computação',                  'Graduação em Ciência da Computação'),
  ('c1000000-0000-0000-0000-000000000002', 'Engenharia de Software',                  'Graduação em Engenharia de Software'),
  ('c1000000-0000-0000-0000-000000000003', 'Sistemas de Informação',                  'Graduação em Sistemas de Informação'),
  ('c1000000-0000-0000-0000-000000000004', 'Análise e Desenvolvimento de Sistemas',   'Graduação em ADS'),
  ('c1000000-0000-0000-0000-000000000005', 'Engenharia da Computação',                'Graduação em Engenharia da Computação'),
  ('c1000000-0000-0000-0000-000000000006', 'Redes de Computadores',                   'Graduação em Redes de Computadores'),
  ('c1000000-0000-0000-0000-000000000007', 'Banco de Dados',                          'Graduação em Banco de Dados'),
  ('c1000000-0000-0000-0000-000000000008', 'Inteligência Artificial',                 'Graduação em Inteligência Artificial'),
  ('c1000000-0000-0000-0000-000000000009', 'Segurança da Informação',                 'Graduação em Segurança da Informação');

-- -------------------------------------------------------------
-- DISCIPLINAS (15 records)
-- -------------------------------------------------------------
INSERT INTO disciplina (id, nome, carga_horaria, ementa) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Algoritmos e Estrutura de Dados',     80, 'Fundamentos de algoritmos e estruturas de dados clássicas'),
  ('d1000000-0000-0000-0000-000000000002', 'Programação Orientada a Objetos',     80, 'Paradigma orientado a objetos com Java/Kotlin'),
  ('d1000000-0000-0000-0000-000000000003', 'Banco de Dados I',                    60, 'Modelo relacional, SQL e normalização'),
  ('d1000000-0000-0000-0000-000000000004', 'Cálculo I',                           80, 'Limites, derivadas e integrais'),
  ('d1000000-0000-0000-0000-000000000005', 'Álgebra Linear',                      60, 'Vetores, matrizes e transformações lineares'),
  ('d1000000-0000-0000-0000-000000000006', 'Redes de Computadores',               60, 'Protocolos, TCP/IP e arquitetura de redes'),
  ('d1000000-0000-0000-0000-000000000007', 'Engenharia de Software I',            80, 'Processos, requisitos e arquitetura de software'),
  ('d1000000-0000-0000-0000-000000000008', 'Sistemas Operacionais',               60, 'Processos, memória e sistemas de arquivos'),
  ('d1000000-0000-0000-0000-000000000009', 'Arquitetura de Computadores',         60, 'Organização e arquitetura de sistemas computacionais'),
  ('d1000000-0000-0000-0000-000000000010', 'Compiladores',                        80, 'Análise léxica, sintática, semântica e geração de código'),
  ('d1000000-0000-0000-0000-000000000011', 'Inteligência Artificial',             80, 'Busca heurística, aprendizado de máquina e redes neurais'),
  ('d1000000-0000-0000-0000-000000000012', 'Segurança da Informação',             60, 'Criptografia, vulnerabilidades e políticas de segurança'),
  ('d1000000-0000-0000-0000-000000000013', 'Desenvolvimento Web',                 80, 'HTML, CSS, JavaScript, frameworks frontend e backend'),
  ('d1000000-0000-0000-0000-000000000014', 'Programação Mobile',                  80, 'Desenvolvimento Android e iOS com frameworks multiplataforma'),
  ('d1000000-0000-0000-0000-000000000015', 'Tópicos Avançados em TI',             60, 'Temas emergentes em tecnologia da informação');

-- -------------------------------------------------------------
-- PROFESSORES (5 records)
-- -------------------------------------------------------------
INSERT INTO professor (id, nome, email, especialidade) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'Dr. Roberto Silva',    'roberto.silva@unifor.br',    'Algoritmos'),
  ('p1000000-0000-0000-0000-000000000002', 'Dra. Fernanda Costa',  'fernanda.costa@unifor.br',   'Engenharia de Software'),
  ('p1000000-0000-0000-0000-000000000003', 'Dr. Marcos Lima',      'marcos.lima@unifor.br',      'Banco de Dados'),
  ('p1000000-0000-0000-0000-000000000004', 'Dra. Patricia Souza',  'patricia.souza@unifor.br',   'Redes'),
  ('p1000000-0000-0000-0000-000000000005', 'Dr. Eduardo Nunes',    'eduardo.nunes@unifor.br',    'Inteligência Artificial');

-- -------------------------------------------------------------
-- HORARIOS (9 records)
-- -------------------------------------------------------------
INSERT INTO horario (id, dia_semana, hora_inicio, hora_fim, periodo) VALUES
  ('h1000000-0000-0000-0000-000000000001', 'SEG', '08:00:00', '10:00:00', 'MANHA'),
  ('h1000000-0000-0000-0000-000000000002', 'SEG', '10:00:00', '12:00:00', 'MANHA'),
  ('h1000000-0000-0000-0000-000000000003', 'SEG', '14:00:00', '16:00:00', 'TARDE'),
  ('h1000000-0000-0000-0000-000000000004', 'SEG', '16:00:00', '18:00:00', 'TARDE'),
  ('h1000000-0000-0000-0000-000000000005', 'SEG', '19:00:00', '21:00:00', 'NOITE'),
  ('h1000000-0000-0000-0000-000000000006', 'TER', '08:00:00', '10:00:00', 'MANHA'),
  ('h1000000-0000-0000-0000-000000000007', 'TER', '14:00:00', '16:00:00', 'TARDE'),
  ('h1000000-0000-0000-0000-000000000008', 'QUA', '08:00:00', '10:00:00', 'MANHA'),
  ('h1000000-0000-0000-0000-000000000009', 'QUA', '19:00:00', '21:00:00', 'NOITE');

-- -------------------------------------------------------------
-- COORDENADORES (3 records — keycloak_id must match realm-export.json)
-- -------------------------------------------------------------
INSERT INTO coordenador (id, nome, email, keycloak_id) VALUES
  (gen_random_uuid(), 'Ana Coordenadora',   'coord.ana@unifor.br',   'cccccccc-0003-0003-0003-000000000001'),
  (gen_random_uuid(), 'Bruno Coordenador',  'coord.bruno@unifor.br', 'cccccccc-0003-0003-0003-000000000002'),
  (gen_random_uuid(), 'Carla Coordenadora', 'coord.carla@unifor.br', 'cccccccc-0003-0003-0003-000000000003');

-- -------------------------------------------------------------
-- ALUNOS (5 records — keycloak_id must match realm-export.json)
-- -------------------------------------------------------------
INSERT INTO aluno (id, nome, email, matricula, keycloak_id, curso_id) VALUES
  (gen_random_uuid(), 'João Aluno',   'aluno.joao@unifor.br',  '2024001', 'dddddddd-0004-0004-0004-000000000001', 'c1000000-0000-0000-0000-000000000001'),
  (gen_random_uuid(), 'Maria Aluna',  'aluno.maria@unifor.br', '2024002', 'dddddddd-0004-0004-0004-000000000002', 'c1000000-0000-0000-0000-000000000002'),
  (gen_random_uuid(), 'Pedro Aluno',  'aluno.pedro@unifor.br', '2024003', 'dddddddd-0004-0004-0004-000000000003', 'c1000000-0000-0000-0000-000000000003'),
  (gen_random_uuid(), 'Julia Aluna',  'aluno.julia@unifor.br', '2024004', 'dddddddd-0004-0004-0004-000000000004', 'c1000000-0000-0000-0000-000000000004'),
  (gen_random_uuid(), 'Lucas Aluno',  'aluno.lucas@unifor.br', '2024005', 'dddddddd-0004-0004-0004-000000000005', 'c1000000-0000-0000-0000-000000000005');
