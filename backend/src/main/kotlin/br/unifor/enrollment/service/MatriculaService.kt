package br.unifor.enrollment.service

import br.unifor.enrollment.domain.Aluno
import br.unifor.enrollment.domain.AulaMatriz
import br.unifor.enrollment.domain.Matricula
import br.unifor.enrollment.dto.AulaResponse
import br.unifor.enrollment.dto.MatricularRequest
import br.unifor.enrollment.dto.MatriculaResponse
import br.unifor.enrollment.dto.toAulaResponse
import br.unifor.enrollment.exception.AcessoNegadoException
import br.unifor.enrollment.exception.EntidadeNaoEncontradaException
import br.unifor.enrollment.exception.RegraDeNegocioException
import jakarta.enterprise.context.ApplicationScoped
import jakarta.inject.Inject
import jakarta.persistence.EntityManager
import jakarta.persistence.LockModeType
import jakarta.transaction.Transactional
import java.time.LocalDateTime
import java.util.UUID

@ApplicationScoped
class MatriculaService {

    @Inject
    lateinit var em: EntityManager

    fun getAlunoByKeycloakId(keycloakId: String): Aluno =
        Aluno.find("keycloakId", keycloakId).firstResult()
            ?: throw EntidadeNaoEncontradaException("Aluno não encontrado para keycloak id: $keycloakId")

    fun getMinhasMatriculas(keycloakId: String): List<MatriculaResponse> {
        val aluno = getAlunoByKeycloakId(keycloakId)
        return Matricula.find("aluno = ?1 and ativo = true", aluno)
            .list()
            .map { it.toResponse() }
    }

    fun getAulasDisponiveis(keycloakId: String): List<AulaResponse> {
        val aluno = getAlunoByKeycloakId(keycloakId)
        return AulaMatriz.find(
            "ativo = true and ?1 member of cursosAutorizados",
            aluno.curso
        ).list()
            .filter { it.vagasDisponiveis() > 0 }
            .map { it.toAulaResponse() }
    }

    @Transactional
    fun matricular(request: MatricularRequest, keycloakId: String): MatriculaResponse {
        val aluno = getAlunoByKeycloakId(keycloakId)

        // 1. Load and PESSIMISTIC_WRITE lock the AulaMatriz
        val aulaMatriz = em.find(AulaMatriz::class.java, request.aulaMatrizId, LockModeType.PESSIMISTIC_WRITE)
            ?: throw EntidadeNaoEncontradaException("Aula não encontrada")

        if (!aulaMatriz.ativo) throw EntidadeNaoEncontradaException("Aula não está ativa")

        // 2. Validate: aluno's course is authorized
        val cursoAutorizado = aulaMatriz.cursosAutorizados.any { it.id == aluno.curso.id }
        if (!cursoAutorizado) throw RegraDeNegocioException("Sua aula não está autorizada para o seu curso")

        // 3. Validate: vagas disponíveis
        val vagasUsadas = Matricula.count("aulaMatriz = ?1 and ativo = true", aulaMatriz)
        if (vagasUsadas >= aulaMatriz.maxAlunos) throw RegraDeNegocioException("Não há vagas disponíveis para esta aula")

        // 4. Validate: no schedule conflict
        val horario = aulaMatriz.horario
        val conflito = em.createQuery(
            """
            SELECT COUNT(m) FROM Matricula m
            WHERE m.aluno = :aluno
              AND m.ativo = true
              AND m.aulaMatriz.horario.diaSemana = :dia
              AND m.aulaMatriz.horario.horaInicio < :horaFim
              AND m.aulaMatriz.horario.horaFim > :horaInicio
            """.trimIndent(),
            Long::class.java
        )
            .setParameter("aluno", aluno)
            .setParameter("dia", horario.diaSemana)
            .setParameter("horaFim", horario.horaFim)
            .setParameter("horaInicio", horario.horaInicio)
            .singleResult
        if (conflito > 0) throw RegraDeNegocioException("Choque de horário com outra aula já matriculada")

        // 5. Check if already enrolled (unique constraint guard)
        val jaMatriculado = Matricula.count("aluno = ?1 and aulaMatriz = ?2 and ativo = true", aluno, aulaMatriz)
        if (jaMatriculado > 0) throw RegraDeNegocioException("Aluno já matriculado nesta aula")

        // 6. Create enrollment
        val matricula = Matricula().apply {
            this.aluno = aluno
            this.aulaMatriz = aulaMatriz
            this.dataMatricula = LocalDateTime.now()
            this.ativo = true
        }
        matricula.persist()
        return matricula.toResponse()
    }

    @Transactional
    fun cancelarMatricula(matriculaId: UUID, keycloakId: String) {
        val aluno = getAlunoByKeycloakId(keycloakId)
        val matricula = Matricula.findById(matriculaId)
            ?: throw EntidadeNaoEncontradaException("Matrícula não encontrada")
        if (matricula.aluno.id != aluno.id) throw AcessoNegadoException("Matrícula não pertence a este aluno")
        matricula.ativo = false
    }

    private fun Matricula.toResponse(): MatriculaResponse = MatriculaResponse(
        id = this.id,
        aulaMatriz = this.aulaMatriz.toAulaResponse(),
        dataMatricula = this.dataMatricula.toString(),
        ativo = this.ativo
    )
}
