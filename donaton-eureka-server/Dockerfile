FROM gcr.io/distroless/java17-debian12

WORKDIR /app

COPY target/donaton-eureka-server-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8761

ENTRYPOINT ["java", "-jar", "app.jar"]