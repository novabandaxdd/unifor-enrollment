package br.unifor.enrollment.dto

import java.util.UUID

data class MatriculaResponse(
    val id: UUID,
    val aulaMatriz: AulaResponse,
    val dataMatricula: String,
    val ativo: Boolean
)
