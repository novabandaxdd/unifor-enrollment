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

        // IDs de aulas onde o aluno já tem matrícula ativa — excluir da listagem
        val aulasJaMatriculadas: Set<UUID> = Matricula
            .find("aluno = ?1 and ativo = true", aluno)
            .list()
            .map { it.aulaMatriz.id }
            .toSet()

        return AulaMatriz.find(
            "ativo = true and ?1 member of cursosAutorizados",
            aluno.curso
        ).list()
            .filter { aula ->
                aula.id !in aulasJaMatriculadas &&
                contarMatriculasAtivas(aula.id) < aula.maxAlunos
            }
            .map { it.toAulaResponse() }
    }

    @Transactional
    fun matricular(request: MatricularRequest, keycloakId: String): MatriculaResponse {
        val aluno = getAlunoByKeycloakId(keycloakId)

        // 1. Load and PESSIMISTIC_WRITE lock the AulaMatriz row
        val aulaMatriz = em.find(AulaMatriz::class.java, request.aulaMatrizId, LockModeType.PESSIMISTIC_WRITE)
            ?: throw EntidadeNaoEncontradaException("Aula não encontrada")

        if (!aulaMatriz.ativo) throw EntidadeNaoEncontradaException("Aula não está ativa")

        // 2. Validate: course is authorized
        if (aulaMatriz.cursosAutorizados.none { it.id == aluno.curso.id })
            throw RegraDeNegocioException("Sua aula não está autorizada para o seu curso")

        // 3. Validate: vagas disponíveis — query SQL direto para leitura consistente dentro do lock
        val vagasOcupadas: Long = contarMatriculasAtivas(aulaMatriz.id)
        if (vagasOcupadas >= aulaMatriz.maxAlunos.toLong())
            throw RegraDeNegocioException("Não há vagas disponíveis para esta aula")

        // 4. Validate: no schedule conflict
        val horario = aulaMatriz.horario
        val conflito: Long = em.createQuery(
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

        // 5. Upsert — se já existe registro (ativo=false de cancelamento anterior), reativa
        //    Isso evita ConstraintViolationException do UNIQUE (aluno_id, aula_matriz_id)
        val matriculaExistente: Matricula? = Matricula
            .find("aluno = ?1 and aulaMatriz = ?2", aluno, aulaMatriz)
            .firstResult()

        val matricula: Matricula = if (matriculaExistente != null) {
            if (matriculaExistente.ativo)
                throw RegraDeNegocioException("Aluno já está matriculado nesta aula")
            // Reativar matrícula cancelada anteriormente
            matriculaExistente.ativo = true
            matriculaExistente.dataMatricula = LocalDateTime.now()
            matriculaExistente
        } else {
            Matricula().apply {
                this.aluno = aluno
                this.aulaMatriz = aulaMatriz
                this.dataMatricula = LocalDateTime.now()
                this.ativo = true
            }.also { it.persist() }
        }

        return matricula.toResponse()
    }

    @Transactional
    fun cancelarMatricula(matriculaId: UUID, keycloakId: String) {
        val aluno = getAlunoByKeycloakId(keycloakId)
        val matricula = Matricula.findById(matriculaId)
            ?: throw EntidadeNaoEncontradaException("Matrícula não encontrada")
        if (matricula.aluno.id != aluno.id)
            throw AcessoNegadoException("Matrícula não pertence a este aluno")
        if (!matricula.ativo)
            throw RegraDeNegocioException("Matrícula já está cancelada")
        matricula.ativo = false
    }

    // ─── helpers ────────────────────────────────────────────────────────────────

    /**
     * Conta matrículas ATIVAS de uma aula via JPQL nomeado para garantir
     * que a query sempre vai ao banco (bypassa cache L1 do Hibernate).
     * Usado tanto no filtro de getAulasDisponiveis quanto na validação de vagas.
     */
    fun contarMatriculasAtivas(aulaMatrizId: UUID): Long =
        em.createQuery(
            "SELECT COUNT(m) FROM Matricula m WHERE m.aulaMatriz.id = :id AND m.ativo = true",
            Long::class.java
        ).setParameter("id", aulaMatrizId).singleResult

    private fun Matricula.toResponse(): MatriculaResponse = MatriculaResponse(
        id = this.id,
        aulaMatriz = this.aulaMatriz.toAulaResponse(),
        dataMatricula = this.dataMatricula.toString(),
        ativo = this.ativo
    )
}
