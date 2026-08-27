package br.unifor.enrollment.dto

import java.util.UUID

data class AulaResponse(
    val id: UUID,
    val disciplina: DisciplinaInfo,
    val professor: ProfessorInfo,
    val horario: HorarioInfo,
    val cursosAutorizados: List<CursoInfo>,
    val maxAlunos: Int,
    val vagasDisponiveis: Long,
    val ativo: Boolean
)

data class DisciplinaInfo(
    val id: UUID,
    val nome: String,
    val cargaHoraria: Int
)

data class ProfessorInfo(
    val id: UUID,
    val nome: String,
    val email: String
)

data class HorarioInfo(
    val id: UUID,
    val diaSemana: String,
    val horaInicio: String,
    val horaFim: String,
    val periodo: String
)

data class CursoInfo(
    val id: UUID,
    val nome: String
)
