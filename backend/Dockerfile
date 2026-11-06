# ==========================================
# Stage 1: Build Application with Maven
# ==========================================
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

# Pre-fetch dependencies to leverage Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and compile
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================================
# Stage 2: Minimal Production JRE Runtime
# ==========================================
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Ensure directory for uploads exists with appropriate permissions
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Copy packaged fat JAR from the builder stage
COPY --from=builder /build/target/*.jar app.jar

# Expose backend port (matches server.port in application.properties)
EXPOSE 8081

# Container-aware JVM memory tuning
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
