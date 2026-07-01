<div align="center">
  <h1>🌐 Eureka Server - Sistema Donatón</h1>
  <p><strong>Servidor de Descubrimiento y Registro de Microservicios</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 17" />
    <img src="https://img.shields.io/badge/Spring_Boot-4-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/Netflix_Eureka-E50914?style=for-the-badge&logo=netflix&logoColor=white" alt="Netflix Eureka" />
  </p>
</div>

---

## 📖 Descripción del Servicio

Este módulo actúa como el **Service Registry** centralizado de la plataforma. Basado en Netflix Eureka, su función principal es mantener un catálogo dinámico de todos los microservicios activos en la red. 

Gracias a este servicio, el API Gateway, el BFF y el resto de los microservicios no necesitan conocer las direcciones IP absolutas entre sí; en su lugar, se comunican utilizando los nombres registrados, asegurando tolerancia a fallos y balanceo de carga automático.

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos
*   [Java 17](https://jdk.java.net/17/)
*   Maven

### Ejecutar Localmente

```bash
mvn spring-boot:run
```

**Puerto por defecto:** `8761`

Puedes acceder al panel de control interactivo de Eureka visitando `http://localhost:8761` en tu navegador para ver la matriz de microservicios registrados en tiempo real.

## 📡 Arquitectura de Descubrimiento
Actúa como el "Directorio Telefónico" de la plataforma. Cada vez que un microservicio de Donatón arranca, se registra aquí. Esto permite que servicios como el API Gateway o el BFF encuentren a los demás servicios por su nombre (ej. DONATON-LOGISTICA) sin importar en qué IP o puerto dinámico se estén ejecutando.
