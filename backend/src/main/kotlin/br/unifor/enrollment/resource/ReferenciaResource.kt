package br.unifor.enrollment.resource

import br.unifor.enrollment.domain.Curso
import br.unifor.enrollment.domain.Disciplina
import br.unifor.enrollment.domain.Horario
import br.unifor.enrollment.domain.Professor
import jakarta.annotation.security.RolesAllowed
import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag

@Path("/api/v1/referencias")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed("ALUNO", "COORDENADOR")
@Tag(name = "Referências", description = "Dados de referência para preenchimento de formulários")
class ReferenciaResource {

    @GET
    @Path("/disciplinas")
    @Operation(summary = "Listar todas as disciplinas")
    fun getDisciplinas(): List<Disciplina> = Disciplina.listAll()

    @GET
    @Path("/professores")
    @Operation(summary = "Listar todos os professores")
    fun getProfessores(): List<Professor> = Professor.listAll()

    @GET
    @Path("/horarios")
    @Operation(summary = "Listar todos os horários disponíveis")
    fun getHorarios(): List<Horario> = Horario.listAll()

    @GET
    @Path("/cursos")
    @Operation(summary = "Listar todos os cursos")
    fun getCursos(): List<Curso> = Curso.listAll()
}
