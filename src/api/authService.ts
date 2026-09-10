import axiosClient from './axiosClient'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  nombre: string
  apellido: string
  email: string
  password: string
  rol: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    nombre: string
    apellido: string
    rol: string
  }
}

export interface UserProfile {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: string
}

const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/api/v1/auth/register', {
      nombre: data.nombre,
      email: data.email,
      password: data.password,
      rol: data.rol,
    })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response.data
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/api/v1/auth/login', data)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response.data
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await axiosClient.get<UserProfile>('/api/v1/auth/me')
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
  },

  getToken: () => localStorage.getItem('token'),

  isAuthenticated: () => !!localStorage.getItem('token'),
}

export default authService
