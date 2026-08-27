export interface DisciplinaInfo {
  id: string;
  nome: string;
  cargaHoraria: number;
}

export interface ProfessorInfo {
  id: string;
  nome: string;
  email: string;
}

export interface HorarioInfo {
  id: string;
  diaSemana: string;
  horaInicio: string;
  horaFim: string;
  periodo: string;
}

export interface CursoInfo {
  id: string;
  nome: string;
}

export interface AulaResponse {
  id: string;
  disciplina: DisciplinaInfo;
  professor: ProfessorInfo;
  horario: HorarioInfo;
  cursosAutorizados: CursoInfo[];
  maxAlunos: number;
  vagasDisponiveis: number;
  ativo: boolean;
}

export interface MatriculaResponse {
  id: string;
  aulaMatriz: AulaResponse;
  dataMatricula: string;
  ativo: boolean;
}

export interface CriarAulaRequest {
  disciplinaId: string;
  professorId: string;
  horarioId: string;
  cursosAutorizadosIds: string[];
  maxAlunos: number;
}

export interface EditarAulaRequest {
  horarioId?: string;
  professorId?: string;
  cursosAutorizadosIds?: string[];
}

export interface Disciplina {
  id: string;
  nome: string;
  cargaHoraria: number;
  ementa?: string;
}

export interface Professor {
  id: string;
  nome: string;
  email: string;
  especialidade?: string;
}

export interface Horario {
  id: string;
  diaSemana: string;
  horaInicio: string;
  horaFim: string;
  periodo: string;
}

export interface Curso {
  id: string;
  nome: string;
}
