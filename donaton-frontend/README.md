<div align="center">
  <h1>📱 Sistema Donatón - Frontend</h1>
  <p><strong>Interfaz de usuario y cliente web para la Plataforma Logística Humanitaria</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 18" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="React Bootstrap" />
    <img src="https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet Maps" />
  </p>
</div>

---

## 📖 Descripción del Proyecto

Este directorio contiene el código fuente del cliente web para el **Sistema Donatón**. Construido con tecnologías modernas del ecosistema frontend, está enfocado en ofrecer una experiencia de usuario (UX) fluida, robusta y accesible en entornos críticos.

La interfaz permite a los usuarios interactuar con los microservicios (BFF), ofreciendo características clave como:
*   🗺️ **Mapas Interactivos:** Visualización de emergencias y rutas logísticas en tiempo real usando Leaflet.
*   ⚡ **Rendimiento Óptimo:** Empaquetado ultrarrápido y Hot-Module Replacement gracias a Vite y React 18.
*   🛡️ **Tipado Estricto:** Código robusto, escalable y más fácil de mantener con TypeScript.
*   📱 **Diseño Responsivo:** Completamente adaptado para dispositivos móviles, tablets y escritorios usando React Bootstrap.

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos
Asegúrate de tener instalados:
*   [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada)
*   NPM (viene incluido con Node)

### Instalación

1. Si no estás en la carpeta del frontend, navega hacia ella:
   ```bash
   cd donaton-frontend
   ```

2. Instala todas las dependencias del proyecto:
   ```bash
   npm install
   ```

### Ejecutar en Desarrollo

Para levantar el servidor de desarrollo local de Vite:

```bash
npm run dev
```

La aplicación estará lista y sirviéndose en [http://localhost:5173](http://localhost:5173).

---

## 📜 Scripts Disponibles

En este directorio, puedes utilizar las siguientes herramientas de la CLI:

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo con recarga en caliente (HMR). |
| `npm run build` | Compila la aplicación para producción. Los archivos minificados se generan en la carpeta `dist`. |
| `npm run lint` | Ejecuta ESLint para encontrar problemas de sintaxis o código según las reglas configuradas. |
| `npm run preview` | Inicia un servidor estático para previsualizar y probar localmente la build de producción generada en `dist`. |

---

## 📂 Estructura Principal del Proyecto

A continuación, una vista general de cómo está organizado el código del frontend:

```text
donaton-frontend/
├── public/             # Recursos estáticos puros (favicon, manifiesto)
├── src/                # Código fuente principal
│   ├── assets/         # Imágenes, estilos globales e iconos
│   ├── components/     # Componentes de React reutilizables (Botones, Modales, etc.)
│   ├── hooks/          # Custom Hooks de React con lógica de estado
│   ├── pages/          # Vistas principales de la aplicación (Enrutamiento)
│   ├── services/       # Integración HTTP con el API Gateway / BFF
│   ├── App.tsx         # Componente raíz y configuración de React Router
│   └── main.tsx        # Punto de entrada de la aplicación React
├── package.json        # Dependencias y configuración de scripts
├── tsconfig.json       # Reglas de compilación de TypeScript
└── vite.config.ts      # Configuración del servidor y empaquetador Vite
```
