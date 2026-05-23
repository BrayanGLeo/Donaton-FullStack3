FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY target/donaton-donaciones-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]