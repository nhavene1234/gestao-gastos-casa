# ---------- 1.ª fase: compilar ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

# ---------- 2.ª fase: executar ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# o plano gratuito do Render tem 512 MB de memória
ENV JAVA_TOOL_OPTIONS="-Xmx384m -XX:+UseSerialGC"

EXPOSE 8080
CMD ["java", "-jar", "app.jar"]