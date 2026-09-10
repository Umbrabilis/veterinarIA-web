# VeterinarIA Frontend

Frontend de una clínica veterinaria desarrollado con React + TypeScript + Vite. La aplicación incluye autenticación, registro y flujo inicial para gestionar usuarios con roles del sistema.

## Descripción

Este proyecto representa la parte del cliente para un sistema de gestión veterinaria. Actualmente contempla:

- Login de usuarios
- Registro de nuevos usuarios
- Validación de formularios
- Roles permitidos: `ADMINISTRADOR` y `VETERINARIO`
- Comunicación con el backend a través de Axios
- Protección del token JWT en las peticiones autenticadas

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router DOM
- Axios
- Oxlint

## Requisitos previos

- Node.js 18 o superior
- npm
- Backend de la API ejecutándose en `http://localhost:8080` (o la URL configurada en variables de entorno)

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/Umbrabilis/veterinaria-web.git
cd veterinaria-web
```

2. Instala dependencias:

```bash
npm install
```

3. Configura las variables de entorno:

```bash
cp .env.example .env
```

El archivo `.env` debe contener algo parecido a:

```env
VITE_API_URL=http://localhost:8080
```

## Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación quedará disponible normalmente en:

```text
http://localhost:5173
```

## Build de producción

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Estructura del proyecto

```text
src/
├── api/
│   ├── authService.ts
│   └── axiosClient.ts
├── auth/
│   └── components/
│       ├── LoginForm.tsx
│       └── RegisterForm.tsx
├── App.tsx
├── main.tsx
├── index.css
├── shared/
│   └── icons.tsx
└── ...
```

## Flujo de autenticación

El frontend se comunica con el backend con estos endpoints principales:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `GET /api/v1/auth/me`

El registro solo acepta estos roles:

- `ADMINISTRADOR`
- `VETERINARIO`

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | URL base del backend de la API |

## Convenciones actuales

- El token JWT se guarda en `localStorage`
- Los formularios tienen validación básica en frontend
- La gestión de errores se realiza desde los componentes de autenticación y la capa de servicio

## Estado del proyecto

Proyecto en desarrollo activo, enfocado en la gestión inicial de autenticación y acceso del sistema veterinario.


