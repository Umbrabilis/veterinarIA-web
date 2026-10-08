import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

/** Lo emite el cliente cuando la API responde 401: la sesión venció o no existe. Lo escucha `App`. */
export const EVENTO_SESION_EXPIRADA = 'veterinaria:sesion-expirada'

// La sesión vive en una cookie HttpOnly que emite el backend: el JavaScript no puede leerla ni guardarla.
// `withCredentials` hace que el navegador la adjunte a cada petición hacia la API.
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Rutas donde un 401 es una respuesta esperada y no significa que se cayó una sesión abierta.
const RUTAS_SIN_AVISO = ['/api/v1/auth/login', '/api/v1/auth/me']

axiosClient.interceptors.response.use(
  response => response,
  error => {
    const ruta: string = error.config?.url ?? ''
    if (error.response?.status === 401 && !RUTAS_SIN_AVISO.some(r => ruta.startsWith(r))) {
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA))
    }

    return Promise.reject(error)
  },
)

export default axiosClient
