import axiosClient from './axiosClient'
import type { PaginaResponse } from './tipos'

// Contrato: pacientes-service `MascotaRequest` / `MascotaResponse` y los enums `Especie` y `Sexo`.

export const ESPECIES = ['PERRO', 'GATO', 'AVE', 'CONEJO', 'ROEDOR', 'REPTIL', 'OTRO'] as const
export type Especie = (typeof ESPECIES)[number]

export const SEXOS = ['MACHO', 'HEMBRA', 'DESCONOCIDO'] as const
export type Sexo = (typeof SEXOS)[number]

export interface MascotaRequest {
  propietarioId: string
  nombre: string
  especie: Especie
  raza: string | null
  sexo: Sexo
  /** `YYYY-MM-DD` */
  fechaNacimiento: string | null
  pesoKg: number | null
  color: string | null
  activo: boolean | null
}

export interface MascotaResponse {
  id: string
  propietarioId: string
  nombre: string
  especie: Especie
  raza: string | null
  sexo: Sexo
  fechaNacimiento: string | null
  pesoKg: number | null
  color: string | null
  activo: boolean
  createdAt: string
}

export interface ListarMascotasParams {
  propietarioId?: string
  /** Nombre de la mascota, nombre del propietario o documento exacto del propietario. */
  busqueda?: string
  pagina?: number
  tamano?: number
}

const mascotasService = {
  listar: async ({ propietarioId, busqueda, pagina = 0, tamano = 20 }: ListarMascotasParams = {}) => {
    const response = await axiosClient.get<PaginaResponse<MascotaResponse>>('/api/v1/mascotas', {
      params: {
        propietarioId: propietarioId || undefined,
        busqueda: busqueda?.trim() || undefined,
        pagina,
        tamano,
      },
    })
    return response.data
  },

  obtener: async (id: string) => {
    const response = await axiosClient.get<MascotaResponse>(`/api/v1/mascotas/${id}`)
    return response.data
  },

  crear: async (data: MascotaRequest) => {
    const response = await axiosClient.post<MascotaResponse>('/api/v1/mascotas', data)
    return response.data
  },

  /** También sirve para desactivar o reactivar (`activo`): el backend no borra mascotas. */
  actualizar: async (id: string, data: MascotaRequest) => {
    const response = await axiosClient.put<MascotaResponse>(`/api/v1/mascotas/${id}`, data)
    return response.data
  },
}

export default mascotasService
