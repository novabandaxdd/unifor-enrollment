package br.unifor.enrollment.domain

import io.quarkus.hibernate.orm.panache.kotlin.PanacheCompanionBase
import io.quarkus.hibernate.orm.panache.kotlin.PanacheEntityBase
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.GenericGenerator
import java.util.UUID

@Entity
@Table(name = "disciplina")
class Disciplina : PanacheEntityBase() {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    lateinit var id: UUID

    lateinit var nome: String

    @Column(name = "carga_horaria")
    var cargaHoraria: Int = 0

    var ementa: String? = null

    companion object : PanacheCompanionBase<Disciplina, UUID>
}
