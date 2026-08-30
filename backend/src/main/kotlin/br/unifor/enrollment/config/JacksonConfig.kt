package br.unifor.enrollment.config

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.KotlinModule
import io.quarkus.jackson.ObjectMapperCustomizer
import jakarta.inject.Singleton

/**
 * Customiza o ObjectMapper do Quarkus para:
 * 1. Registrar o KotlinModule — sem ele o Jackson não consegue deserializar
 *    data classes Kotlin (que não possuem construtor padrão vazio).
 *    Erro sem esse módulo: "Cannot construct instance of X (no Creators...)"
 * 2. Registrar JavaTimeModule para serializar LocalDate/LocalTime/LocalDateTime
 * 3. Ignorar propriedades desconhecidas no JSON de entrada (tolerância)
 */
@Singleton
class JacksonConfig : ObjectMapperCustomizer {
    override fun customize(objectMapper: ObjectMapper) {
        // Suporte a data classes Kotlin sem @JsonCreator
        objectMapper.registerModule(KotlinModule.Builder().build())
        // Serialização de tipos Java Time (LocalTime, LocalDateTime, etc.)
        objectMapper.registerModule(JavaTimeModule())
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
        // Não falhar em propriedades desconhecidas no JSON recebido
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
    }
}
