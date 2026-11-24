import axiosClient from './axiosClient'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  nombre: string
  email: string
  password: string
  rol: string
}

/**
 * Respuesta del login. No trae el JWT: el backend lo deja en una cookie HttpOnly que el navegador envía solo.
 */
export interface AuthResponse {
  expiresInSeconds: number
  usuario: UserProfile
}

export interface UserProfile {
  id?: string
  email: string
  nombre: string
  rol: string
}

export interface UpdateProfileRequest {
  nombre: string
}

export interface ChangePasswordRequest {
  passwordActual: string
  passwordNueva: string
}

const authService = {
  /** Crea la cuenta. No inicia sesión (un administrador también la usa para crear cuentas ajenas). */
  register: async (data: RegisterRequest): Promise<UserProfile> => {
    const response = await axiosClient.post<UserProfile>('/api/v1/auth/register', {
      nombre: data.nombre,
      email: data.email,
      password: data.password,
      rol: data.rol,
    })

    return response.data
  },

  /** Inicia sesión: el backend responde con la cookie de sesión y el usuario. */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/api/v1/auth/login', data)
    return response.data
  },

  /**
   * Usuario de la sesión actual, o `null` si no hay sesión. Como el frontend no puede leer la cookie, la forma de
   * saber si hay sesión es preguntarle al backend.
   */
  obtenerSesion: async (): Promise<UserProfile | null> => {
    try {
      const response = await axiosClient.get<UserProfile>('/api/v1/auth/me')
      return response.data
    } catch {
      return null
    }
  },

  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await axiosClient.get<UserProfile>('/api/v1/usuarios/me')
      return response.data
    } catch (error) {
      return axiosClient.get<UserProfile>('/api/v1/auth/me')
        .then(response => response.data)
        .catch(err => {
          throw err
        })
    }
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await axiosClient.put<UserProfile>('/api/v1/usuarios/me', data)
    return response.data
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await axiosClient.put('/api/v1/usuarios/me/password', data)
  },

  /** Cierra la sesión: el backend borra la cookie. */
  logout: async (): Promise<void> => {
    await axiosClient.post('/api/v1/auth/logout')
  },
}

export default authService
