<div align="center">
  <h1>🚚 Logística Service - Sistema Donatón</h1>
  <p><strong>Gestor de Flotas y Trazabilidad de Última Milla</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 17" />
    <img src="https://img.shields.io/badge/Spring_Boot-4-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white" alt="RabbitMQ" />
  </p>
</div>

---

## 📖 Descripción del Servicio

Este microservicio se encarga de la capa física de transporte: gestionar flotas de vehículos, asignar rutas, tracking GPS y proveer la trazabilidad hacia las zonas de necesidad.

### Consumo de Eventos
Este servicio es un **Consumer** clave en el *Event Bus*. Está suscrito a colas en **RabbitMQ** esperando alertas desde el servicio de Donaciones. En cuanto una carga es notificada, los algoritmos internos de Logística buscan y reservan el vehículo más óptimo para su transporte.

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos
*   Base de datos MySQL activa.
*   Instancia de RabbitMQ para las escuchas de colas.

### Ejecutar Localmente
```bash
mvn spring-boot:run
```

**Puerto por defecto:** `8083`
