package br.unifor.enrollment.domain

import io.quarkus.hibernate.orm.panache.kotlin.PanacheCompanionBase
import io.quarkus.hibernate.orm.panache.kotlin.PanacheEntityBase
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.GenericGenerator
import java.time.LocalTime
import java.util.UUID

@Entity
@Table(name = "horario")
class Horario : PanacheEntityBase() {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    lateinit var id: UUID

    @Column(name = "dia_semana")
    lateinit var diaSemana: String

    @Column(name = "hora_inicio")
    lateinit var horaInicio: LocalTime

    @Column(name = "hora_fim")
    lateinit var horaFim: LocalTime

    /** MANHA / TARDE / NOITE */
    lateinit var periodo: String

    companion object : PanacheCompanionBase<Horario, UUID>
}
