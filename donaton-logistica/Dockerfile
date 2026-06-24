FROM gcr.io/distroless/java17-debian12

WORKDIR /app

COPY target/donaton-logistica-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8086

ENTRYPOINT ["java", "-jar", "app.jar"]
