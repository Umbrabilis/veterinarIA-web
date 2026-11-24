# veterinarIA-web

Frontend (SPA) del software de gestión para clínicas veterinarias. Consume la API de `veterinarIA-API`.

## Stack (no cambiar sin discusión del equipo)
React 19, TypeScript 6, Vite 8, React Router DOM 7, Axios, Tailwind CSS 4 (plugin `@tailwindcss/vite`), oxlint.
Ante dudas de API de React 19, React Router 7, Vite 8 o Tailwind 4, consultar con Context7 antes de escribir código:
cambiaron bastante respecto a versiones anteriores (p. ej. Tailwind 4 se configura en CSS, no en `tailwind.config.js`).

## Comandos
- `npm run dev` — servidor de desarrollo en http://localhost:5173 (el backend debe permitir ese origen en CORS).
- `npm run lint` — oxlint.
- `npm run build` — `tsc -b && vite build`.
- Antes de dar una tarea por terminada deben pasar `npm run lint` y `npm run build`.

## Configuración
- URL del backend en `VITE_API_URL` (ver `.env.example`). Nunca hardcodear URLs de la API.
- `.env` no se versiona.

## Estructura
- `src/api/` — cliente HTTP (`axiosClient.ts`) y un servicio por recurso (`authService.ts`, ...).
  Los componentes no llaman a axios directamente; siempre pasan por un servicio.
- `src/auth/` — login, registro y protección de rutas.
- `src/dashboard/` — layout y pantallas del panel.
- `src/shared/` — componentes e íconos reutilizables.
- Organización por módulo de dominio (propietarios, mascotas, agenda, consultas...), igual que el backend.

## Contrato con la API
- El backend expone OpenAPI en `/v3/api-docs` (springdoc) y Swagger UI en `/swagger-ui.html`.
- Los tipos de request/response deben coincidir exactamente con los DTO del backend (`veterinarIA-API/src/main/java/.../dto/`).
  No inventar campos ni aceptar variantes "por si acaso" (`token` vs `accessToken`): si hay duda, revisar el OpenAPI.
- Endpoints bajo `/api/v1/`.
- El token JWT se envía como `Authorization: Bearer <token>` desde el interceptor de `axiosClient.ts`.
  Un 401 limpia la sesión.

## Seguridad y datos
- Nunca registrar con `console.log` tokens ni datos personales de propietarios (nombre, teléfono, correo, dirección).
- La UI no es la barrera de seguridad: ocultar un botón no reemplaza la autorización en el backend.
- Los resúmenes IA se muestran al veterinario para revisar, editar y aprobar; la UI nunca ofrece enviarlos sin aprobación.

## Convenciones
- Textos de la interfaz en español de Colombia, tuteo. Código de dominio en español.
- Commits con Conventional Commits. Ramas desde `main`; todo entra por PR con dos aprobaciones.

## Agentes del proyecto (`.claude/agents/`)
- `api-contract-checker`: usar al crear o modificar servicios o tipos en `src/api/`, o cuando cambie un DTO del backend.
