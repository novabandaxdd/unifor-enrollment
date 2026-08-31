package br.unifor.enrollment.service

import br.unifor.enrollment.domain.AulaMatriz
import br.unifor.enrollment.domain.Coordenador
import br.unifor.enrollment.domain.Curso
import br.unifor.enrollment.domain.Disciplina
import br.unifor.enrollment.domain.Horario
import br.unifor.enrollment.domain.Matricula
import br.unifor.enrollment.domain.Professor
import br.unifor.enrollment.domain.Aluno
import br.unifor.enrollment.dto.CriarAulaRequest
import br.unifor.enrollment.dto.EditarAulaRequest
import br.unifor.enrollment.exception.AcessoNegadoException
import br.unifor.enrollment.exception.EntidadeNaoEncontradaException
import br.unifor.enrollment.exception.RegraDeNegocioException
import io.quarkus.test.junit.QuarkusTest
import io.quarkus.test.security.TestSecurity
import jakarta.inject.Inject
import jakarta.transaction.Transactional
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.LocalTime
import java.util.UUID

@QuarkusTest
@TestSecurity(user = "test-coordenador", roles = ["COORDENADOR"])
class MatrizServiceTest {

    @Inject
    lateinit var matrizService: MatrizService

    // IDs created fresh per test run
    private lateinit var coordenadorKeycloakId: String
    private lateinit var coordenadorId: UUID
    private lateinit var outroCoordenadorKeycloakId: String
    private lateinit var disciplinaId: UUID
    private lateinit var professorId: UUID
    private lateinit var horarioId: UUID
    private lateinit var cursoId: UUID

    @BeforeEach
    @Transactional
    fun setup() {
        // Clean all dependent tables first
        Matricula.deleteAll()
        AulaMatriz.deleteAll()
        Coordenador.deleteAll()
        Disciplina.deleteAll()
        Professor.deleteAll()
        Horario.deleteAll()
        Aluno.deleteAll()
        Curso.deleteAll()

        coordenadorKeycloakId = UUID.randomUUID().toString()
        outroCoordenadorKeycloakId = UUID.randomUUID().toString()

        val coordenador = Coordenador().apply {
            nome = "Coordenador Teste"
            email = "coord@teste.com"
            keycloakId = coordenadorKeycloakId
        }
        coordenador.persist()
        coordenadorId = coordenador.id

        val outroCoordenador = Coordenador().apply {
            nome = "Outro Coordenador"
            email = "outro@teste.com"
            keycloakId = outroCoordenadorKeycloakId
        }
        outroCoordenador.persist()

        val disciplina = Disciplina().apply {
            nome = "Algoritmos"
            cargaHoraria = 80
        }
        disciplina.persist()
        disciplinaId = disciplina.id

        val professor = Professor().apply {
            nome = "Prof. Silva"
            email = "silva@teste.com"
        }
        professor.persist()
        professorId = professor.id

        val horario = Horario().apply {
            diaSemana = "SEG"   // 3-char abbreviation: SEG/TER/QUA/QUI/SEX/SAB/DOM
            horaInicio = LocalTime.of(8, 0)
            horaFim = LocalTime.of(10, 0)
            periodo = "MANHA"
        }
        horario.persist()
        horarioId = horario.id

        val curso = Curso().apply {
            nome = "Ciência da Computação"
        }
        curso.persist()
        cursoId = curso.id
    }

    @Test
    fun `criarAula_sucesso`() {
        val request = CriarAulaRequest(
            disciplinaId = disciplinaId,
            professorId = professorId,
            horarioId = horarioId,
            cursosAutorizadosIds = listOf(cursoId),
            maxAlunos = 30
        )

        val response = matrizService.criarAula(request, coordenadorKeycloakId)

        assertNotNull(response.id)
        assertEquals("Algoritmos", response.disciplina.nome)
        assertEquals("Prof. Silva", response.professor.nome)
        assertEquals("SEGUNDA", response.horario.diaSemana)
        assertEquals(30, response.maxAlunos)
        assertEquals(30L, response.vagasDisponiveis)
        assertEquals(1, response.cursosAutorizados.size)
    }

    @Test
    fun `criarAula_disciplinaNoMesmoHorario_throwsRegraDeNegocio`() {
        val request = CriarAulaRequest(
            disciplinaId = disciplinaId,
            professorId = professorId,
            horarioId = horarioId,
            cursosAutorizadosIds = listOf(cursoId),
            maxAlunos = 30
        )

        // First creation succeeds
        matrizService.criarAula(request, coordenadorKeycloakId)

        // Second creation with same disciplina + horario must conflict
        assertThrows(RegraDeNegocioException::class.java) {
            matrizService.criarAula(request, coordenadorKeycloakId)
        }
    }

    @Test
    @Transactional
    fun `excluirAula_comMatriculados_throwsRegraDeNegocio`() {
        val request = CriarAulaRequest(
            disciplinaId = disciplinaId,
            professorId = professorId,
            horarioId = horarioId,
            cursosAutorizadosIds = listOf(cursoId),
            maxAlunos = 30
        )
        val aulaResponse = matrizService.criarAula(request, coordenadorKeycloakId)
        val aula = AulaMatriz.findById(aulaResponse.id)!!

        // Create an aluno and enroll them
        val aluno = Aluno().apply {
            nome = "Aluno Teste"
            email = "aluno@teste.com"
            matricula = "20240001"
            keycloakId = UUID.randomUUID().toString()
            curso = Curso.findById(cursoId)!!
        }
        aluno.persist()

        val matricula = Matricula().apply {
            this.aluno = aluno
            this.aulaMatriz = aula
            this.ativo = true
        }
        matricula.persist()

        assertThrows(RegraDeNegocioException::class.java) {
            matrizService.excluirAula(aulaResponse.id, coordenadorKeycloakId)
        }
    }

    @Test
    fun `excluirAula_softDelete_setAtivo_false`() {
        val request = CriarAulaRequest(
            disciplinaId = disciplinaId,
            professorId = professorId,
            horarioId = horarioId,
            cursosAutorizadosIds = listOf(cursoId),
            maxAlunos = 30
        )
        val aulaResponse = matrizService.criarAula(request, coordenadorKeycloakId)

        matrizService.excluirAula(aulaResponse.id, coordenadorKeycloakId)

        val aula = AulaMatriz.findById(aulaResponse.id)!!
        assertFalse(aula.ativo)
    }

    @Test
    fun `editarAula_coordenadorErrado_throwsAcessoNegado`() {
        val request = CriarAulaRequest(
            disciplinaId = disciplinaId,
            professorId = professorId,
            horarioId = horarioId,
            cursosAutorizadosIds = listOf(cursoId),
            maxAlunos = 30
        )
        val aulaResponse = matrizService.criarAula(request, coordenadorKeycloakId)

        val editarRequest = EditarAulaRequest(
            horarioId = null,
            professorId = null,
            cursosAutorizadosIds = null
        )

        // outroCoordenador attempting to edit coordenador's aula
        assertThrows(AcessoNegadoException::class.java) {
            matrizService.editarAula(aulaResponse.id, editarRequest, outroCoordenadorKeycloakId)
        }
    }
}
