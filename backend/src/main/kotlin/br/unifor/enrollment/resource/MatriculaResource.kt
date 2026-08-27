package br.unifor.enrollment.resource

import br.unifor.enrollment.dto.AulaResponse
import br.unifor.enrollment.dto.MatricularRequest
import br.unifor.enrollment.dto.MatriculaResponse
import br.unifor.enrollment.service.MatriculaService
import jakarta.annotation.security.RolesAllowed
import jakarta.inject.Inject
import jakarta.validation.Valid
import jakarta.ws.rs.Consumes
import jakarta.ws.rs.DELETE
import jakarta.ws.rs.GET
import jakarta.ws.rs.POST
import jakarta.ws.rs.Path
import jakarta.ws.rs.PathParam
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.Context
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import jakarta.ws.rs.core.SecurityContext
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag
import java.util.UUID

@Path("/api/v1")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("ALUNO")
@Tag(name = "Matrícula", description = "Matrícula do aluno em aulas da matriz curricular")
class MatriculaResource {

    @Inject
    lateinit var matriculaService: MatriculaService

    @Context
    lateinit var securityContext: SecurityContext

    @GET
    @Path("/matricula/minhas")
    @Operation(summary = "Lista todas as matrículas ativas do aluno logado")
    fun getMinhas(): List<MatriculaResponse> {
        val keycloakId = securityContext.userPrincipal.name
        return matriculaService.getMinhasMatriculas(keycloakId)
    }

    @GET
    @Path("/matricula/disponiveis")
    @Operation(summary = "Lista aulas disponíveis para o curso do aluno logado")
    fun getDisponiveis(): List<AulaResponse> {
        val keycloakId = securityContext.userPrincipal.name
        return matriculaService.getAulasDisponiveis(keycloakId)
    }

    @POST
    @Path("/matricula")
    @Operation(summary = "Realiza matrícula em uma aula da matriz curricular")
    fun matricular(@Valid request: MatricularRequest): Response {
        val keycloakId = securityContext.userPrincipal.name
        val response = matriculaService.matricular(request, keycloakId)
        return Response.status(Response.Status.CREATED).entity(response).build()
    }

    @DELETE
    @Path("/matricula/{id}")
    @Operation(summary = "Cancela uma matrícula ativa")
    fun cancelar(@PathParam("id") id: UUID): Response {
        val keycloakId = securityContext.userPrincipal.name
        matriculaService.cancelarMatricula(id, keycloakId)
        return Response.noContent().build()
    }
}
