package br.unifor.enrollment.exception

import br.unifor.enrollment.dto.ErrorResponse
import io.quarkus.resteasy.reactive.server.ServerExceptionMapper
import jakarta.ws.rs.core.Response

class GlobalExceptionMapper {

    @ServerExceptionMapper
    fun mapEntidadeNaoEncontrada(e: EntidadeNaoEncontradaException): Response =
        Response.status(Response.Status.NOT_FOUND)
            .entity(ErrorResponse(e.message!!, "NOT_FOUND"))
            .build()

    @ServerExceptionMapper
    fun mapRegraDeNegocio(e: RegraDeNegocioException): Response =
        Response.status(Response.Status.CONFLICT)
            .entity(ErrorResponse(e.message!!, "BUSINESS_RULE_VIOLATION"))
            .build()

    @ServerExceptionMapper
    fun mapAcessoNegado(e: AcessoNegadoException): Response =
        Response.status(Response.Status.FORBIDDEN)
            .entity(ErrorResponse(e.message!!, "FORBIDDEN"))
            .build()
}
