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
    const response = await axiosClient.get<UserProfile>('/api/v1/auth/me')
    console.log('GET /api/v1/auth/me =>', response.data)
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
  },

  getToken: () => localStorage.getItem('token'),

  isAuthenticated: () => !!localStorage.getItem('token'),
}

export default authService
