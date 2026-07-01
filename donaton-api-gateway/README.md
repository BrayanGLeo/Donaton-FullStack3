<div align="center">
  <h1>🚪 API Gateway - Sistema Donatón</h1>
  <p><strong>Punto Único de Entrada y Enrutamiento Perimetral</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 17" />
    <img src="https://img.shields.io/badge/Spring_Boot-4-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/Spring_Cloud-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Spring Cloud" />
  </p>
</div>

---

## 📖 Descripción del Servicio

El **API Gateway** es la primera capa defensiva y de enrutamiento de nuestra arquitectura. Desarrollado con Spring Cloud Gateway, recibe todas las peticiones HTTP provenientes de los clientes (como la web frontend) y las redirige al Backend For Frontend (BFF) o directamente a los servicios internos.

### Características Clave
*   **Enrutamiento dinámico:** Resuelve direcciones usando el registro de Eureka.
*   **CORS Centralizado:** Maneja la seguridad de cabeceras de origen cruzado para el Frontend.
*   **Predicates y Filters:** Manipulación de requests y responses al vuelo.

---

## 🚀 Guía de Inicio Rápido

### Ejecutar Localmente

```bash
mvn spring-boot:run
```

> **Nota:** Este servicio actúa en conjunto con Eureka, por lo que es indispensable levantar el **Service Registry** primero para que el Gateway pueda mapear las rutas correctamente.

## 🛣️ Rutas Configuradas (Routing)
El Gateway expone el puerto 8081 al exterior y redirige el tráfico basándose en los predicados de las URLs:
* /api/auth/** ➔ Enruta hacia donaton-auth
* /api/** ➔ Enruta hacia donaton-bff

## 🔒 Filtros de Seguridad (AuthFilter)
Cuenta con filtros globales que interceptan las peticiones, validando la presencia, firma y expiración del token JWT antes de permitir que la petición alcance la red interna de microservicios.
