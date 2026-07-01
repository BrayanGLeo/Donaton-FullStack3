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

Este microservicio se encarga de la capa física del proyecto:
1. **Transporte:** Gestionar flotas de vehículos, asignar rutas, tracking GPS y proveer la trazabilidad hacia las zonas de necesidad.
2. **Control de Acopio (Inventarios):** Centraliza las existencias físicas de las donaciones despachadas, permitiendo el descuento, agrupamiento por subcategorías y reportabilidad de stock en tiempo real mediante el `InventarioController`.

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

## 🔌 Endpoints Principales
* GET /api/logistica/inventario - Consulta el stock actual consolidado.
* POST /api/logistica/despachos - Crea una ruta de entrega de suministros hacia una necesidad.
* GET /api/logistica/centros-acopio - Lista los centros de acopio disponibles por región.

## ⚙️ Variables de Entorno Clave
* SPRING_DATASOURCE_URL: URL de conexión a MySQL.
* SPRING_RABBITMQ_HOST: Host de RabbitMQ para escuchar eventos de ingresos de donaciones.
