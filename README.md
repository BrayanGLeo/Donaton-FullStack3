# 🏥 Plataforma Donatón - Arquitectura de Microservicios

Este repositorio contiene el código fuente de la plataforma Donatón, desarrollada utilizando una arquitectura de microservicios con Spring Boot, orquestación con Netflix Eureka y despliegue local vía Docker.

## 🛠️ Requisitos Previos
* **Java 17**
* **Maven**
* **Docker y Docker Compose**

## 🚀 Levantamiento de Infraestructura
El proyecto incluye un archivo `docker-compose.yml` que orquesta la base de datos (MySQL) con sus respectivos esquemas independientes, y el servidor de calidad (SonarQube).

Para iniciar la infraestructura, ejecuta en la raíz del proyecto:
```bash
docker-compose up -d

mvn clean verify sonar:sonar -Dsonar.projectKey=donaton-plataforma -Dsonar.host.url=http://localhost:9000 -Dsonar.login=TU_TOKEN_AQUI