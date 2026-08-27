package br.unifor.enrollment.dto

import jakarta.validation.constraints.NotNull
import java.util.UUID

data class MatricularRequest(
    @field:NotNull val aulaMatrizId: UUID
)
