package br.unifor.enrollment.exception

import br.unifor.enrollment.dto.ErrorResponse
import jakarta.ws.rs.core.Response
import jakarta.ws.rs.ext.ExceptionMapper
import jakarta.ws.rs.ext.Provider

/**
 * Mapeia exceções de negócio para respostas HTTP adequadas.
 * Usa a API padrão JAX-RS ExceptionMapper para máxima compatibilidade
 * com RESTEasy Reactive no Quarkus 3.x.
 */
@Provider
class EntidadeNaoEncontradaMapper : ExceptionMapper<EntidadeNaoEncontradaException> {
    override fun toResponse(e: EntidadeNaoEncontradaException): Response =
        Response.status(Response.Status.NOT_FOUND)
            .entity(ErrorResponse(e.message ?: "Entidade não encontrada", "NOT_FOUND"))
            .build()
}

@Provider
class RegraDeNegocioMapper : ExceptionMapper<RegraDeNegocioException> {
    override fun toResponse(e: RegraDeNegocioException): Response =
        Response.status(Response.Status.CONFLICT)
            .entity(ErrorResponse(e.message ?: "Regra de negócio violada", "BUSINESS_RULE_VIOLATION"))
            .build()
}

@Provider
class AcessoNegadoMapper : ExceptionMapper<AcessoNegadoException> {
    override fun toResponse(e: AcessoNegadoException): Response =
        Response.status(Response.Status.FORBIDDEN)
            .entity(ErrorResponse(e.message ?: "Acesso negado", "FORBIDDEN"))
            .build()
}
