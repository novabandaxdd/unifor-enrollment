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
import java.util.UUID

@Entity
@Table(name = "aluno")
class Aluno : PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    lateinit var id: UUID

    lateinit var nome: String

    lateinit var email: String

    lateinit var matricula: String

    @Column(name = "keycloak_id", unique = true)
    lateinit var keycloakId: String

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curso_id")
    lateinit var curso: Curso

    companion object : PanacheCompanionBase<Aluno, UUID>
}
