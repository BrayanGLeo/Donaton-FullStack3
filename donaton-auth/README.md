<div align="center">
  <h1>🔐 Auth Service - Sistema Donatón</h1>
  <p><strong>Gestión de Identidades y Emisión de Tokens JWT</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 17" />
    <img src="https://img.shields.io/badge/Spring_Boot-4-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=spring-security&logoColor=white" alt="Spring Security" />
    <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT" />
  </p>
</div>

---

## 📖 Descripción del Servicio

El microservicio de **Autenticación** es el núcleo de seguridad de la plataforma. Verifica las credenciales de los distintos actores del sistema (voluntarios, administradores, centros de acopio) y emite tokens JWT sin mantener estado en el servidor (*stateless*).

Estos tokens viajan encriptados a través de las cabeceras HTTP hacia el API Gateway y son validados de forma descentralizada por el resto de microservicios, lo que garantiza un esquema de autorización horizontalmente escalable.

---

## 🚀 Guía de Inicio Rápido

### Ejecutar Localmente

```bash
mvn spring-boot:run
```

**Puerto por defecto:** `8081`

## 🔌 Endpoints Principales
* POST /api/auth/registro - Registra nuevos usuarios (donantes, voluntarios, etc).
* POST /api/auth/login - Autentica y devuelve un token JWT sin estado.
* GET /api/auth/usuarios - Lista los usuarios registrados en la plataforma.

## ⚙️ Variables de Entorno Clave
* SPRING_DATASOURCE_URL: URL de conexión a la base de datos MySQL.
* JWT_SECRET: Semilla secreta para la firma y validación de tokens JWT.
