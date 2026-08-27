package br.unifor.enrollment.dto

import br.unifor.enrollment.domain.AulaMatriz

/**
 * Shared extension functions — used by both MatrizService and MatriculaService.
 */
fun AulaMatriz.toAulaResponse(): AulaResponse = AulaResponse(
    id = this.id,
    disciplina = DisciplinaInfo(
        id = disciplina.id,
        nome = disciplina.nome,
        cargaHoraria = disciplina.cargaHoraria
    ),
    professor = ProfessorInfo(
        id = professor.id,
        nome = professor.nome,
        email = professor.email
    ),
    horario = HorarioInfo(
        id = horario.id,
        diaSemana = horario.diaSemana,
        horaInicio = horario.horaInicio.toString(),
        horaFim = horario.horaFim.toString(),
        periodo = horario.periodo
    ),
    cursosAutorizados = cursosAutorizados.map { CursoInfo(id = it.id, nome = it.nome) },
    maxAlunos = this.maxAlunos,
    vagasDisponiveis = this.vagasDisponiveis(),
    ativo = this.ativo
)
