FROM gcr.io/distroless/java17-debian12

WORKDIR /app

COPY target/donaton-donaciones-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]