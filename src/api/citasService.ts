import axiosClient from './axiosClient'

// Contrato: citas-service `CrearCitaRequest`, `CitaResponse` y el enum `EstadoCita`;
// auth-service `VeterinarioResponse` para elegir con quién se agenda.

export const ESTADOS_CITA = ['PROGRAMADA', 'CONFIRMADA', 'CANCELADA', 'ATENDIDA', 'NO_ASISTIO'] as const
export type EstadoCita = (typeof ESTADOS_CITA)[number]

export interface CitaResponse {
  id: string
  mascotaId: string
  mascotaNombre: string
  propietarioId: string
  veterinarioId: string
  veterinarioNombre: string
  /** ISO-8601 (UTC) */
  inicio: string
  fin: string
  motivo: string
  estado: EstadoCita
  createdAt: string
}

export interface CrearCitaRequest {
  mascotaId: string
  veterinarioId: string
  inicio: string
  fin: string
  motivo: string
}

export interface VeterinarioResponse {
  id: string
  nombre: string
}

export interface ListarCitasParams {
  veterinarioId?: string
  mascotaId?: string
  /** ISO-8601 */
  desde?: string
  hasta?: string
}

const citasService = {
  /** Agenda de la clínica (administradores y veterinarios). */
  listar: async ({ veterinarioId, mascotaId, desde, hasta }: ListarCitasParams = {}) => {
    const response = await axiosClient.get<CitaResponse[]>('/api/v1/citas', {
      params: { veterinarioId: veterinarioId || undefined, mascotaId: mascotaId || undefined, desde, hasta },
    })
    return response.data
  },

  crear: async (data: CrearCitaRequest) => {
    const response = await axiosClient.post<CitaResponse>('/api/v1/citas', data)
    return response.data
  },

  reprogramar: async (id: string, inicio: string, fin: string) => {
    const response = await axiosClient.patch<CitaResponse>(`/api/v1/citas/${id}/reprogramar`, { inicio, fin })
    return response.data
  },

  /** Confirmar, marcar como atendida / no asistió, o cancelar. El backend valida la transición. */
  cambiarEstado: async (id: string, estado: EstadoCita) => {
    const response = await axiosClient.patch<CitaResponse>(`/api/v1/citas/${id}/estado`, { estado })
    return response.data
  },

  veterinarios: async () => {
    const response = await axiosClient.get<VeterinarioResponse[]>('/api/v1/usuarios/veterinarios')
    return response.data
  },
}

export default citasService
