import axios, { AxiosHeaders } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers = config.headers ?? new AxiosHeaders()
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  return config
})

axiosClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }

    return Promise.reject(error)
  },
)

export default axiosClient
