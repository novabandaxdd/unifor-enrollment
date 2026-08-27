package br.unifor.enrollment.domain

import io.quarkus.hibernate.orm.panache.kotlin.PanacheCompanionBase
import io.quarkus.hibernate.orm.panache.kotlin.PanacheEntityBase
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(
    name = "matricula",
    uniqueConstraints = [UniqueConstraint(columnNames = ["aluno_id", "aula_matriz_id"])]
)
class Matricula : PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    lateinit var id: UUID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id")
    lateinit var aluno: Aluno

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aula_matriz_id")
    lateinit var aulaMatriz: AulaMatriz

    @Column(name = "data_matricula")
    var dataMatricula: LocalDateTime = LocalDateTime.now()

    var ativo: Boolean = true

    companion object : PanacheCompanionBase<Matricula, UUID>
}
