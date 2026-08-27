package br.unifor.enrollment.domain

import io.quarkus.hibernate.orm.panache.kotlin.PanacheCompanionBase
import io.quarkus.hibernate.orm.panache.kotlin.PanacheEntityBase
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.JoinTable
import jakarta.persistence.ManyToMany
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.hibernate.annotations.GenericGenerator
import java.util.UUID

@Entity
@Table(name = "aula_matriz")
class AulaMatriz : PanacheEntityBase() {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    lateinit var id: UUID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disciplina_id")
    lateinit var disciplina: Disciplina

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id")
    lateinit var professor: Professor

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "horario_id")
    lateinit var horario: Horario

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coordenador_id")
    lateinit var coordenador: Coordenador

    @Column(name = "max_alunos")
    var maxAlunos: Int = 0

    var ativo: Boolean = true

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "aula_matriz_curso",
        joinColumns = [JoinColumn(name = "aula_matriz_id")],
        inverseJoinColumns = [JoinColumn(name = "curso_id")]
    )
    var cursosAutorizados: MutableList<Curso> = mutableListOf()

    fun vagasDisponiveis(): Long =
        maxAlunos - Matricula.count("aulaMatriz = ?1 and ativo = true", this)

    companion object : PanacheCompanionBase<AulaMatriz, UUID>
}
