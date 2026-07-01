<div align="center">
  <h1>📦 Donaciones Service - Sistema Donatón</h1>
  <p><strong>Gestión Core de Inventarios y Suministros Humanitarios</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 17" />
    <img src="https://img.shields.io/badge/Spring_Boot-4-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white" alt="RabbitMQ" />
  </p>
</div>

---

## 📖 Descripción del Servicio

Un componente crítico encargado de administrar el ciclo de vida del inventario en tiempo real. Valida las recepciones, clasifica los recursos según su tipo (perecederos, medicinas, abrigo) y gestiona las reservas lógicas de stock.

### Arquitectura de Eventos
Cuando ocurre un evento de negocio crítico (por ejemplo, una donación importante lista para despacho), este servicio funciona como **Publisher** enviando un mensaje asíncrono a **RabbitMQ**. Esto alerta al módulo de Logística sin crear un acoplamiento directo entre los servicios.

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos
Para aprovechar todas las capacidades de este microservicio, asegúrate de tener instancias en ejecución de:
1. Base de datos MySQL.
2. Servidor de mensajería RabbitMQ.
*(Recomendado: levantar usando Docker Compose desde la raíz).*

### Ejecutar Localmente
```bash
mvn spring-boot:run
```

**Puerto por defecto:** `8082`

## 🔌 Endpoints Principales
* POST /api/donaciones - Registra una donación entrante al sistema.
* GET /api/donaciones - Lista todas las donaciones procesadas.
* PUT /api/donaciones/{id}/estado - Actualiza el estado logístico (ej. EN_TRANSITO).

## ⚙️ Variables de Entorno Clave
* SPRING_DATASOURCE_URL: URL de conexión a MySQL.
* SPRING_RABBITMQ_HOST: Host del servidor RabbitMQ para publicar eventos asíncronos.
