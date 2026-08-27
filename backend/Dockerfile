# ============================================================
# Multi-stage Dockerfile for the Quarkus backend
# Stage 1: Build the JAR with Maven
# Stage 2: Run with JRE (JVM mode)
# ============================================================

# -------------------------------------------------------------------
# Stage 1 — Build
# -------------------------------------------------------------------
FROM eclipse-temurin:21-jdk-alpine AS build

# Install Maven directly (no wrapper dependency)
RUN apk add --no-cache curl && \
    curl -fsSL https://archive.apache.org/dist/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.tar.gz \
    | tar -xzC /opt && \
    ln -s /opt/apache-maven-3.9.9/bin/mvn /usr/local/bin/mvn

WORKDIR /app

# Copy POM first for dependency layer caching
COPY pom.xml ./

# Download dependencies
RUN mvn dependency:go-offline -q

# Copy sources and build
COPY src/ src/
RUN mvn package -DskipTests -q

# -------------------------------------------------------------------
# Stage 2 — Runtime
# -------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /deployments

# Quarkus fast-jar layout
COPY --from=build /app/target/quarkus-app/lib/       lib/
COPY --from=build /app/target/quarkus-app/*.jar       ./
COPY --from=build /app/target/quarkus-app/app/        app/
COPY --from=build /app/target/quarkus-app/quarkus/    quarkus/

EXPOSE 8080

ENV JAVA_OPTS_APPEND="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"

ENTRYPOINT ["java", "-jar", "quarkus-run.jar"]
