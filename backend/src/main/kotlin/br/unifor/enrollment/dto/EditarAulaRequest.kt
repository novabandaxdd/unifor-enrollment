package br.unifor.enrollment.dto

import java.util.UUID

data class EditarAulaRequest(
    val horarioId: UUID?,
    val professorId: UUID?,
    val cursosAutorizadosIds: List<UUID>?
)
