# VeterinarIA Frontend

Frontend para la gestión veterinaria.

## Tecnologías

- React
- TypeScript
- Vite
- React Router DOM
- Axios

## Requisitos

- Node.js 18 o superior
- npm
- Backend corriendo localmente

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/Umbrabilis/veterinaria-web.git
cd veterinaria-web
```

2. Instalar dependencias:

```bash
npm install
```

3. Crear el archivo `.env` con la URL del backend:

```env
VITE_API_URL=http://localhost:8080
```

## Ejecutar en desarrollo

```bash
npm run dev
```

La app queda normalmente en:

```text
http://localhost:5173
```

## Build de producción

```bash
npm run build
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
├── dashboard/
│   ├── components/
│   │   └── DashboardPage.tsx
│   └── layout/
│       └── Layout.tsx
├── shared/
│   └── icons.tsx
├── App.tsx
├── index.css
├── main.tsx
└── ...
```

## Flujo de autenticación

La aplicación usa estos endpoints principales del backend:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `GET /api/v1/auth/me`

### Contrato actual del backend

El backend devuelve el token como `accessToken` y el usuario como `usuario`:

Los roles permitidos por ahora son:

- `ADMINISTRADOR`
- `VETERINARIO`

## Cómo funciona la app

### `main.tsx`

Inicializa React y monta la aplicación en el documento HTML.

### `App.tsx`

Define las rutas principales de la app:

- `/login`
- `/register`
- `/dashboard`

Además protege `/dashboard` para que solo puedan entrar usuarios autenticados.

### `api/authService.ts`

Es la capa de autenticación y manejo de sesión. Aquí se hacen las llamadas de login, registro y perfil. También se guarda el token en `localStorage` y se expone la lógica de logout e isAuthenticated.

### `api/axiosClient.ts`

Es la instancia centralizada de Axios para todas las llamadas HTTP del proyecto.

También se encarga de:

- definir la base URL del backend
- agregar el header `Authorization: Bearer <token>`
- borrar el token si el backend responde `401`

### `LoginForm.tsx`

Formulario para iniciar sesión. Valida email y contraseña, llama al backend y redirige al dashboard si la autenticación es correcta.

### `RegisterForm.tsx`

Formulario de registro. Envía los datos necesarios al backend y redirige de vuelta al login después del alta.

### `Layout.tsx`

Construye el dashboard visual: sidebar, header y menú del usuario. También consume `/api/v1/auth/me` para mostrar la información real del usuario logueado.

### `DashboardPage.tsx`

Contenido principal del inicio. Puede redirigir a otros módulos del sistema y mostrar estados de “módulo en construcción”.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | URL base del backend |

## Reglas de sesión y seguridad

- El token JWT se guarda en `localStorage`
- Las rutas protegidas revisan si existe un token válido
- Si el backend responde `401`, el token se elimina y la sesión se cierra

## Estado del proyecto

Proyecto en desarrollo activo, enfocado en autenticación, roles, dashboard y control de acceso del sistema veterinario.


