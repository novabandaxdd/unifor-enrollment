package br.unifor.enrollment.resource

import br.unifor.enrollment.dto.AulaResponse
import br.unifor.enrollment.dto.CriarAulaRequest
import br.unifor.enrollment.dto.EditarAulaRequest
import br.unifor.enrollment.service.MatrizService
import jakarta.annotation.security.RolesAllowed
import jakarta.inject.Inject
import jakarta.validation.Valid
import jakarta.ws.rs.Consumes
import jakarta.ws.rs.DELETE
import jakarta.ws.rs.GET
import jakarta.ws.rs.PATCH
import jakarta.ws.rs.POST
import jakarta.ws.rs.Path
import jakarta.ws.rs.PathParam
import jakarta.ws.rs.Produces
import jakarta.ws.rs.QueryParam
import jakarta.ws.rs.core.Context
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import jakarta.ws.rs.core.SecurityContext
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag
import java.util.UUID

@Path("/api/v1/matriz")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("COORDENADOR")
@Tag(name = "Matriz Curricular", description = "Gerenciamento da matriz curricular pelo coordenador")
class MatrizResource {

    @Inject
    lateinit var matrizService: MatrizService

    @Context
    lateinit var securityContext: SecurityContext

    @POST
    @Operation(summary = "Criar aula na matriz curricular")
    fun criar(@Valid request: CriarAulaRequest): Response {
        val keycloakId = securityContext.userPrincipal.name
        val response = matrizService.criarAula(request, keycloakId)
        return Response.status(Response.Status.CREATED).entity(response).build()
    }

    @GET
    @Operation(summary = "Listar aulas da matriz curricular com filtros opcionais")
    fun listar(
        @QueryParam("periodo") periodo: String?,
        @QueryParam("cursoId") cursoId: UUID?,
        @QueryParam("maxAlunos") maxAlunos: Int?,
        @QueryParam("horarioId") horarioId: UUID?
    ): List<AulaResponse> {
        val keycloakId = securityContext.userPrincipal.name
        return matrizService.listarAulas(keycloakId, periodo, cursoId, maxAlunos, horarioId)
    }

    @PATCH
    @Path("/{id}")
    @Operation(summary = "Editar horário, professor ou cursos autorizados de uma aula")
    fun editar(
        @PathParam("id") id: UUID,
        request: EditarAulaRequest
    ): AulaResponse {
        val keycloakId = securityContext.userPrincipal.name
        return matrizService.editarAula(id, request, keycloakId)
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Excluir (soft-delete) uma aula da matriz curricular")
    fun excluir(@PathParam("id") id: UUID): Response {
        val keycloakId = securityContext.userPrincipal.name
        matrizService.excluirAula(id, keycloakId)
        return Response.noContent().build()
    }
}
