# ============================================================
# Multi-stage Dockerfile for the Quarkus backend
# Stage 1: Build the JAR with Maven
# Stage 2: Run with the quarkus-micro-image (JVM mode)
# ============================================================

# -------------------------------------------------------------------
# Stage 1 — Build
# -------------------------------------------------------------------
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Copy Maven wrapper and POM first (layer cache for dependency download)
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Download dependencies in a separate layer
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q

# Copy sources and build the uber-jar (fast-jar packaging)
COPY src/ src/
RUN ./mvnw package -DskipTests -q

# -------------------------------------------------------------------
# Stage 2 — Runtime (quarkus-micro-image equivalent via distroless)
# -------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /deployments

# Quarkus fast-jar layout
COPY --from=build /app/target/quarkus-app/lib/           lib/
COPY --from=build /app/target/quarkus-app/*.jar          ./
COPY --from=build /app/target/quarkus-app/app/           app/
COPY --from=build /app/target/quarkus-app/quarkus/       quarkus/

EXPOSE 8080

ENV JAVA_OPTS_APPEND="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"

ENTRYPOINT ["java", "-jar", "quarkus-run.jar"]
