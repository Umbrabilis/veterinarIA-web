import axiosClient from './axiosClient'

// Contrato: auth-service `UsuarioAdminResponse`, `CrearUsuarioRequest` y `ActualizarUsuarioRequest`.
// Todos estos endpoints exigen rol ADMINISTRADOR en el backend (un veterinario recibe 403).

export const ROLES_PERSONAL = ['ADMINISTRADOR', 'VETERINARIO'] as const
export type RolPersonal = (typeof ROLES_PERSONAL)[number]

export interface UsuarioAdmin {
  id: string
  nombre: string
  email: string
  rol: RolPersonal
  activo: boolean
  createdAt: string
}

export interface CrearUsuarioRequest {
  nombre: string
  email: string
  /** Contraseña inicial; la persona puede cambiarla luego desde su perfil. */
  password: string
  rol: RolPersonal
}

/** El email no se edita: es el usuario con el que se inicia sesión. */
export interface ActualizarUsuarioRequest {
  nombre: string
  rol: RolPersonal
  activo: boolean
}

const usuariosService = {
  listar: async () => {
    const response = await axiosClient.get<UsuarioAdmin[]>('/api/v1/usuarios')
    return response.data
  },

  crear: async (data: CrearUsuarioRequest) => {
    const response = await axiosClient.post<UsuarioAdmin>('/api/v1/usuarios', data)
    return response.data
  },

  actualizar: async (id: string, data: ActualizarUsuarioRequest) => {
    const response = await axiosClient.put<UsuarioAdmin>(`/api/v1/usuarios/${id}`, data)
    return response.data
  },
}

export default usuariosService
