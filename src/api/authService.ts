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

export interface AuthResponse {
  token?: string
  accessToken?: string
  tokenType?: string
  expiresInSeconds?: number
  user?: {
    id: string
    email: string
    nombre: string
    rol: string
  }
  usuario?: {
    id: string
    email: string
    nombre: string
    rol: string
  }
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

const getTokenFromResponse = (payload: AuthResponse): string | null => {
  return payload.accessToken || payload.token || null
}

const getUserFromResponse = (payload: AuthResponse) => {
  return payload.usuario || payload.user || null
}

const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/api/v1/auth/register', {
      nombre: data.nombre,
      email: data.email,
      password: data.password,
      rol: data.rol,
    })

    return response.data
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/api/v1/auth/login', data)

    const token = getTokenFromResponse(response.data)
    if (token) {
      localStorage.setItem('token', token)
    }

    return {
      ...response.data,
      token: token ?? undefined,
      user: getUserFromResponse(response.data) || response.data.user,
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

  logout: () => {
    localStorage.removeItem('token')
  },

  getToken: () => localStorage.getItem('token'),

  isAuthenticated: () => !!localStorage.getItem('token'),
}

export default authService
