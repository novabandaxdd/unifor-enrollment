package br.unifor.enrollment.dto

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull
import java.util.UUID

data class CriarAulaRequest(
    @field:NotNull val disciplinaId: UUID,
    @field:NotNull val professorId: UUID,
    @field:NotNull val horarioId: UUID,
    @field:NotEmpty val cursosAutorizadosIds: List<UUID>,
    @field:Min(1) val maxAlunos: Int
)
