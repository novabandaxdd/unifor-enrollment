package br.unifor.enrollment.service

import br.unifor.enrollment.domain.Aluno
import br.unifor.enrollment.domain.AulaMatriz
import br.unifor.enrollment.domain.Coordenador
import br.unifor.enrollment.domain.Curso
import br.unifor.enrollment.domain.Disciplina
import br.unifor.enrollment.domain.Horario
import br.unifor.enrollment.domain.Matricula
import br.unifor.enrollment.domain.Professor
import br.unifor.enrollment.dto.MatricularRequest
import br.unifor.enrollment.exception.AcessoNegadoException
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
@TestSecurity(user = "test-aluno", roles = ["ALUNO"])
class MatriculaServiceTest {

    @Inject
    lateinit var matriculaService: MatriculaService

    // Shared state created in @BeforeEach
    private lateinit var alunoKeycloakId: String
    private lateinit var outroAlunoKeycloakId: String
    private lateinit var cursoId: UUID
    private lateinit var outroCursoId: UUID
    private lateinit var aulaMatrizId: UUID

    /**
     * Creates a fresh, isolated dataset before every test.
     * Deletion order respects FK constraints:
     *   matricula → aula_matriz_curso + aula_matriz → aluno → coordenador →
     *   disciplina / professor / horario / curso
     */
    @BeforeEach
    @Transactional
    fun setup() {
        Matricula.deleteAll()
        AulaMatriz.deleteAll()
        Aluno.deleteAll()
        Coordenador.deleteAll()
        Disciplina.deleteAll()
        Professor.deleteAll()
        Horario.deleteAll()
        Curso.deleteAll()

        // Courses
        val curso = Curso().apply { nome = "Ciência da Computação" }
        curso.persist()
        cursoId = curso.id

        val outroCurso = Curso().apply { nome = "Engenharia Civil" }
        outroCurso.persist()
        outroCursoId = outroCurso.id

        // Coordinator
        val coordenador = Coordenador().apply {
            nome = "Coord. Teste"
            email = "coord@teste.com"
            keycloakId = UUID.randomUUID().toString()
        }
        coordenador.persist()

        // Discipline / Professor / Timetable
        val disciplina = Disciplina().apply {
            nome = "Algoritmos"
            cargaHoraria = 80
        }
        disciplina.persist()

        val professor = Professor().apply {
            nome = "Prof. Silva"
            email = "silva@teste.com"
        }
        professor.persist()

        val horario = Horario().apply {
            diaSemana = "SEGUNDA"
            horaInicio = LocalTime.of(8, 0)
            horaFim = LocalTime.of(10, 0)
            periodo = "MANHA"
        }
        horario.persist()

        // AulaMatriz — authorized for `curso` only, capacity 1
        val aulaMatriz = AulaMatriz().apply {
            this.disciplina = disciplina
            this.professor = professor
            this.horario = horario
            this.coordenador = coordenador
            this.maxAlunos = 1
            this.cursosAutorizados = mutableListOf(curso)
            this.ativo = true
        }
        aulaMatriz.persist()
        aulaMatrizId = aulaMatriz.id

        // Primary student (enrolled in the authorized course)
        alunoKeycloakId = UUID.randomUUID().toString()
        Aluno().apply {
            nome = "Aluno Principal"
            email = "aluno@teste.com"
            matricula = "20240001"
            keycloakId = alunoKeycloakId
            this.curso = curso
        }.persist()

        // Secondary student (same course — used for concurrency / ownership tests)
        outroAlunoKeycloakId = UUID.randomUUID().toString()
        Aluno().apply {
            nome = "Outro Aluno"
            email = "outro@teste.com"
            matricula = "20240002"
            keycloakId = outroAlunoKeycloakId
            this.curso = curso
        }.persist()
    }

    // ------------------------------------------------------------------
    // 1. Happy path
    // ------------------------------------------------------------------
    @Test
    fun `matricular_sucesso`() {
        val request = MatricularRequest(aulaMatrizId = aulaMatrizId)

        val response = matriculaService.matricular(request, alunoKeycloakId)

        assertNotNull(response.id)
        assertEquals(aulaMatrizId, response.aulaMatriz.id)
        assertTrue(response.ativo)
    }

    // ------------------------------------------------------------------
    // 2. No vacancy — fill the single slot, then try again
    // ------------------------------------------------------------------
    @Test
    fun `matricular_semVagas_throwsRegraDeNegocio`() {
        val request = MatricularRequest(aulaMatrizId = aulaMatrizId)

        // Primary student takes the only slot
        matriculaService.matricular(request, alunoKeycloakId)

        // Secondary student attempts to enroll → no vacancy
        assertThrows(RegraDeNegocioException::class.java) {
            matriculaService.matricular(request, outroAlunoKeycloakId)
        }
    }

    // ------------------------------------------------------------------
    // 3. Schedule conflict
    // ------------------------------------------------------------------
    @Test
    @Transactional
    fun `matricular_choqueDeHorario_throwsRegraDeNegocio`() {
        // Create a second class at the same time as aulaMatrizId
        val aulaConflito = AulaMatriz.findById(aulaMatrizId)!!
        val aulaConflitante = AulaMatriz().apply {
            disciplina = aulaConflito.disciplina
            professor = aulaConflito.professor
            horario = aulaConflito.horario      // identical horário → conflict
            coordenador = aulaConflito.coordenador
            maxAlunos = 30
            cursosAutorizados = aulaConflito.cursosAutorizados.toMutableList()
            ativo = true
        }
        aulaConflitante.persist()

        // Enroll in the first class
        matriculaService.matricular(MatricularRequest(aulaMatrizId = aulaMatrizId), alunoKeycloakId)

        // Attempt to enroll in the conflicting class → schedule collision
        assertThrows(RegraDeNegocioException::class.java) {
            matriculaService.matricular(MatricularRequest(aulaMatrizId = aulaConflitante.id), alunoKeycloakId)
        }
    }

    // ------------------------------------------------------------------
    // 4. Student's course not authorized
    // ------------------------------------------------------------------
    @Test
    @Transactional
    fun `matricular_cursoNaoAutorizado_throwsRegraDeNegocio`() {
        // Create a student enrolled in outroCurso (not authorized for the aula)
        val alunoNaoAutorizadoKeycloakId = UUID.randomUUID().toString()
        Aluno().apply {
            nome = "Aluno Não Autorizado"
            email = "naoauth@teste.com"
            matricula = "20240003"
            keycloakId = alunoNaoAutorizadoKeycloakId
            curso = Curso.findById(outroCursoId)!!
        }.persist()

        assertThrows(RegraDeNegocioException::class.java) {
            matriculaService.matricular(MatricularRequest(aulaMatrizId = aulaMatrizId), alunoNaoAutorizadoKeycloakId)
        }
    }

    // ------------------------------------------------------------------
    // 5. Cancel — wrong student must be rejected
    // ------------------------------------------------------------------
    @Test
    fun `cancelarMatricula_alunoErrado_throwsAcessoNegado`() {
        // Primary student enrolls
        val matriculaResponse = matriculaService.matricular(
            MatricularRequest(aulaMatrizId = aulaMatrizId),
            alunoKeycloakId
        )

        // Secondary student tries to cancel primary's enrollment
        assertThrows(AcessoNegadoException::class.java) {
            matriculaService.cancelarMatricula(matriculaResponse.id, outroAlunoKeycloakId)
        }
    }

    // ------------------------------------------------------------------
    // 6. Cancel — happy path, sets ativo = false
    // ------------------------------------------------------------------
    @Test
    fun `cancelarMatricula_sucesso_setAtivo_false`() {
        val matriculaResponse = matriculaService.matricular(
            MatricularRequest(aulaMatrizId = aulaMatrizId),
            alunoKeycloakId
        )

        matriculaService.cancelarMatricula(matriculaResponse.id, alunoKeycloakId)

        val matricula = Matricula.findById(matriculaResponse.id)!!
        assertFalse(matricula.ativo)
    }

    // ------------------------------------------------------------------
    // 7. Re-matrícula após cancelamento — deve funcionar (upsert)
    // ------------------------------------------------------------------
    @Test
    fun `matricular_aposCancel_reativa_matricula`() {
        val request = MatricularRequest(aulaMatrizId = aulaMatrizId)

        // Matrícula inicial
        val primeira = matriculaService.matricular(request, alunoKeycloakId)
        // Cancela
        matriculaService.cancelarMatricula(primeira.id, alunoKeycloakId)

        // Re-matrícula — NÃO deve lançar ConstraintViolationException
        val segunda = matriculaService.matricular(request, alunoKeycloakId)

        // Deve ser o mesmo id (upsert reativou)
        assertEquals(primeira.id, segunda.id)
        assertTrue(segunda.ativo)
    }

    // ------------------------------------------------------------------
    // 8. Cancelar matrícula já cancelada — deve lançar erro
    // ------------------------------------------------------------------
    @Test
    fun `cancelarMatricula_jaInativa_throwsRegraDeNegocio`() {
        val matriculaResponse = matriculaService.matricular(
            MatricularRequest(aulaMatrizId = aulaMatrizId),
            alunoKeycloakId
        )
        // Primeiro cancelamento — OK
        matriculaService.cancelarMatricula(matriculaResponse.id, alunoKeycloakId)

        // Segundo cancelamento — deve falhar
        assertThrows(RegraDeNegocioException::class.java) {
            matriculaService.cancelarMatricula(matriculaResponse.id, alunoKeycloakId)
        }
    }

    // Helper — Kotlin's assertTrue not pulled in by default via JUnit5 static imports
    private fun assertTrue(value: Boolean) = assertEquals(true, value)
}
