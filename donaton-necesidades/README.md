<div align="center">
  <h1>🆘 Necesidades Service - Sistema Donatón</h1>
  <p><strong>Monitoreo y Geolocalización de Emergencias</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 17" />
    <img src="https://img.shields.io/badge/Spring_Boot-4-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  </p>
</div>

---

## 📖 Descripción del Servicio

Microservicio dedicado exclusivamente a mapear la demanda. Se encarga de procesar los reportes de desastre, calcular los requerimientos de ayuda por zonas y devolver coordenadas espaciales.

Esta data es vital para que el frontend pueda pintar los mapas interactivos con *Leaflet*, permitiendo una toma de decisiones informada sobre qué recursos (médicos, alimenticios) enviar a cada coordenada geográfica.
Adicionalmente, se encarga de la trazabilidad y persistencia de las necesidades a lo largo del tiempo, almacenándolas en el **Historial de Necesidades** una vez han sido completadas o cubiertas en su totalidad, permitiendo generar reportes post-desastre.

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos
*   Base de datos MySQL activa.
*   Conexión al Eureka Server.

### Ejecutar Localmente
```bash
mvn spring-boot:run
```

**Puerto por defecto:** `8084`

## 🔌 Endpoints Principales
* POST /api/necesidades - Reporta una nueva emergencia o necesidad humanitaria.
* GET /api/necesidades - Lista las necesidades activas geolocalizadas.
* PUT /api/necesidades/{id}/estado - Actualiza el estado (ej. CUBIERTA) de una necesidad.

## ⚙️ Variables de Entorno Clave
* SPRING_DATASOURCE_URL: URL de conexión a MySQL.
* EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: URL del servidor de descubrimiento Eureka.
