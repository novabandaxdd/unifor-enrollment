package br.unifor.enrollment

import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag

@Path("/health")
@Tag(name = "Health", description = "Liveness probe endpoint")
class HealthResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Simple liveness check", description = "Returns HTTP 200 when the application is running")
    fun health(): Response =
        Response.ok(mapOf("status" to "UP", "service" to "unifor-enrollment-backend")).build()
}
