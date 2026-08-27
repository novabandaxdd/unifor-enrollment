package br.unifor.enrollment.service

import br.unifor.enrollment.domain.AulaMatriz
import br.unifor.enrollment.domain.Coordenador
import br.unifor.enrollment.domain.Curso
import br.unifor.enrollment.domain.Disciplina
import br.unifor.enrollment.domain.Horario
import br.unifor.enrollment.domain.Matricula
import br.unifor.enrollment.domain.Professor
import br.unifor.enrollment.dto.AulaResponse
import br.unifor.enrollment.dto.CriarAulaRequest
import br.unifor.enrollment.dto.EditarAulaRequest
import br.unifor.enrollment.dto.toAulaResponse
import br.unifor.enrollment.exception.AcessoNegadoException
import br.unifor.enrollment.exception.EntidadeNaoEncontradaException
import br.unifor.enrollment.exception.RegraDeNegocioException
import jakarta.enterprise.context.ApplicationScoped
import jakarta.transaction.Transactional
import java.util.UUID

@ApplicationScoped
class MatrizService {

    fun getCoordenadorByKeycloakId(keycloakId: String): Coordenador =
        Coordenador.find("keycloakId", keycloakId).firstResult()
            ?: throw EntidadeNaoEncontradaException("Coordenador não encontrado para keycloak id: $keycloakId")

    @Transactional
    fun criarAula(request: CriarAulaRequest, keycloakId: String): AulaResponse {
        val coordenador = getCoordenadorByKeycloakId(keycloakId)
        val disciplina = Disciplina.findById(request.disciplinaId)
            ?: throw EntidadeNaoEncontradaException("Disciplina não encontrada")
        val professor = Professor.findById(request.professorId)
            ?: throw EntidadeNaoEncontradaException("Professor não encontrado")
        val horario = Horario.findById(request.horarioId)
            ?: throw EntidadeNaoEncontradaException("Horário não encontrado")
        val cursos = request.cursosAutorizadosIds.map {
            Curso.findById(it) ?: throw EntidadeNaoEncontradaException("Curso $it não encontrado")
        }

        val conflito = AulaMatriz.count("disciplina = ?1 and horario = ?2 and ativo = true", disciplina, horario)
        if (conflito > 0) throw RegraDeNegocioException("Disciplina já ofertada neste horário")

        val aula = AulaMatriz().apply {
            this.disciplina = disciplina
            this.professor = professor
            this.horario = horario
            this.coordenador = coordenador
            this.maxAlunos = request.maxAlunos
            this.cursosAutorizados = cursos.toMutableList()
        }
        aula.persist()
        return aula.toAulaResponse()
    }

    fun listarAulas(
        keycloakId: String,
        periodo: String?,
        cursoId: UUID?,
        maxAlunos: Int?,
        horarioId: UUID?
    ): List<AulaResponse> {
        val coordenador = getCoordenadorByKeycloakId(keycloakId)

        var query = "coordenador = ?1 and ativo = true"
        val params = mutableListOf<Any>(coordenador)

        if (periodo != null) {
            query += " and horario.periodo = ?${params.size + 1}"
            params.add(periodo)
        }
        if (cursoId != null) {
            val curso = Curso.findById(cursoId)
                ?: throw EntidadeNaoEncontradaException("Curso não encontrado")
            query += " and ?${params.size + 1} member of cursosAutorizados"
            params.add(curso)
        }
        if (maxAlunos != null) {
            query += " and maxAlunos <= ?${params.size + 1}"
            params.add(maxAlunos)
        }
        if (horarioId != null) {
            query += " and horario.id = ?${params.size + 1}"
            params.add(horarioId)
        }

        return AulaMatriz.find(query, *params.toTypedArray()).list().map { it.toAulaResponse() }
    }

    @Transactional
    fun editarAula(aulaId: UUID, request: EditarAulaRequest, keycloakId: String): AulaResponse {
        val coordenador = getCoordenadorByKeycloakId(keycloakId)
        val aula = AulaMatriz.findById(aulaId)
            ?: throw EntidadeNaoEncontradaException("Aula não encontrada")
        if (aula.coordenador.id != coordenador.id)
            throw AcessoNegadoException("Aula não pertence a este coordenador")

        request.horarioId?.let {
            aula.horario = Horario.findById(it) ?: throw EntidadeNaoEncontradaException("Horário não encontrado")
        }
        request.professorId?.let {
            aula.professor = Professor.findById(it) ?: throw EntidadeNaoEncontradaException("Professor não encontrado")
        }
        request.cursosAutorizadosIds?.let { ids ->
            aula.cursosAutorizados = ids.map {
                Curso.findById(it) ?: throw EntidadeNaoEncontradaException("Curso $it não encontrado")
            }.toMutableList()
        }

        return aula.toAulaResponse()
    }

    @Transactional
    fun excluirAula(aulaId: UUID, keycloakId: String) {
        val coordenador = getCoordenadorByKeycloakId(keycloakId)
        val aula = AulaMatriz.findById(aulaId)
            ?: throw EntidadeNaoEncontradaException("Aula não encontrada")
        if (aula.coordenador.id != coordenador.id)
            throw AcessoNegadoException("Aula não pertence a este coordenador")
        val matriculados = Matricula.count("aulaMatriz = ?1 and ativo = true", aula)
        if (matriculados > 0) throw RegraDeNegocioException("Não é possível excluir aula com alunos matriculados")
        aula.ativo = false
    }
}

