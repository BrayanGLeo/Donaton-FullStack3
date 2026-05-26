<div align="center">
  <h1>🧩 Backend For Frontend (BFF) - Sistema Donatón</h1>
  <p><strong>Orquestador y Protector de la Lógica de Cliente</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 17" />
    <img src="https://img.shields.io/badge/Spring_Boot-4-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/Resilience4j-007ACC?style=for-the-badge" alt="Circuit Breaker" />
  </p>
</div>

---

## 📖 Descripción del Servicio

El **BFF** está diseñado específicamente para acoplarse a las necesidades de la interfaz de usuario. En lugar de que el frontend haga decenas de peticiones a múltiples microservicios (Donaciones, Logística, etc.), el BFF agrega, formatea y despacha la información en una sola respuesta eficiente.

Adicionalmente, actúa como escudo de resiliencia implementando el patrón **Circuit Breaker** (usando Resilience4j). Esto protege la plataforma de sobrecargas o caídas en cascada si un microservicio de back-office falla o tarda demasiado en responder.

---

## 🚀 Guía de Inicio Rápido

### Ejecutar Localmente

```bash
mvn spring-boot:run
```

Este servicio requiere estar registrado en **Eureka** para poder descubrir a los demás microservicios que orquesta.
