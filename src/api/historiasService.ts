import axiosClient from './axiosClient'

// Contrato: historias-service. Consultas (`DatosClinicosRequest`, `ConsultaResponse`, enmiendas), vacunas,
// seguimiento y resúmenes IA (`ContenidoResumen`, `ResumenResponse`, `EstadoResumen`).

export type EstadoConsulta = 'ABIERTA' | 'CERRADA'

export interface DatosClinicos {
  motivo: string
  sintomas: string | null
  examenFisico: string | null
  pesoKg: number | null
  temperaturaC: number | null
  diagnostico: string | null
  tratamiento: string | null
  indicaciones: string | null
  /** `YYYY-MM-DD` */
  proximoControl: string | null
}

export interface EnmiendaResponse {
  id: string
  consultaId: string
  autorId: string
  motivo: string
  contenido: string
  createdAt: string
}

export interface ConsultaResponse extends DatosClinicos {
  id: string
  mascotaId: string
  propietarioId: string
  veterinarioId: string
  citaId: string | null
  estado: EstadoConsulta
  cerradaEn: string | null
  createdAt: string
  /** Solo viene al pedir una consulta por id. */
  enmiendas: EnmiendaResponse[]
}

export interface VacunaRequest {
  mascotaId: string
  nombre: string
  lote: string | null
  fechaAplicacion: string
  proximaDosis: string | null
  notas: string | null
}

export interface VacunaResponse extends VacunaRequest {
  id: string
  veterinarioId: string
  createdAt: string
}

export interface SeguimientoItem {
  tipo: 'CONTROL' | 'REFUERZO_VACUNA'
  fecha: string
  mascotaId: string
  propietarioId: string
  referenciaId: string
  descripcion: string
}

export type EstadoResumen = 'BORRADOR' | 'APROBADO' | 'ENVIADO'

export interface ContenidoResumen {
  hallazgos: string
  tratamiento: string
  cuidadosEnCasa: string
  proximaVisita: string
}

export interface ResumenResponse {
  id: string
  consultaId: string
  estado: EstadoResumen
  /** Lo que escribió el modelo, tal cual (trazabilidad). */
  generado: ContenidoResumen | null
  /** Última edición del veterinario o versión aprobada; null mientras no la haya. */
  contenidoFinal: ContenidoResumen | null
  modelo: string | null
  versionPrompt: string | null
  aprobadoPor: string | null
  aprobadoEn: string | null
  enviadoEn: string | null
  createdAt: string
}

const historiasService = {
  historia: async (mascotaId: string) => {
    const response = await axiosClient.get<ConsultaResponse[]>('/api/v1/consultas', { params: { mascotaId } })
    return response.data
  },

  consulta: async (id: string) => {
    const response = await axiosClient.get<ConsultaResponse>(`/api/v1/consultas/${id}`)
    return response.data
  },

  abrirConsulta: async (mascotaId: string, datos: DatosClinicos, citaId?: string) => {
    const response = await axiosClient.post<ConsultaResponse>('/api/v1/consultas', { mascotaId, citaId, datos })
    return response.data
  },

  actualizarConsulta: async (id: string, datos: DatosClinicos) => {
    const response = await axiosClient.put<ConsultaResponse>(`/api/v1/consultas/${id}`, datos)
    return response.data
  },

  /** Queda inmutable y se genera el borrador del resumen para el dueño. */
  cerrarConsulta: async (id: string) => {
    const response = await axiosClient.post<ConsultaResponse>(`/api/v1/consultas/${id}/cerrar`)
    return response.data
  },

  enmendar: async (id: string, motivo: string, contenido: string) => {
    const response = await axiosClient.post<EnmiendaResponse>(`/api/v1/consultas/${id}/enmiendas`, { motivo, contenido })
    return response.data
  },

  vacunas: async (mascotaId: string) => {
    const response = await axiosClient.get<VacunaResponse[]>('/api/v1/vacunas', { params: { mascotaId } })
    return response.data
  },

  registrarVacuna: async (data: VacunaRequest) => {
    const response = await axiosClient.post<VacunaResponse>('/api/v1/vacunas', data)
    return response.data
  },

  seguimiento: async (dias = 30) => {
    const response = await axiosClient.get<SeguimientoItem[]>('/api/v1/seguimiento/pendientes', { params: { dias } })
    return response.data
  },

  resumenes: async (estado: EstadoResumen) => {
    const response = await axiosClient.get<ResumenResponse[]>('/api/v1/resumenes', { params: { estado } })
    return response.data
  },

  /** 404 si la consulta aún no tiene resumen. */
  resumenDeConsulta: async (consultaId: string) => {
    const response = await axiosClient.get<ResumenResponse>(`/api/v1/consultas/${consultaId}/resumen`)
    return response.data
  },

  generarResumen: async (consultaId: string) => {
    const response = await axiosClient.post<ResumenResponse>(`/api/v1/consultas/${consultaId}/resumen`)
    return response.data
  },

  editarResumen: async (id: string, contenido: ContenidoResumen) => {
    const response = await axiosClient.put<ResumenResponse>(`/api/v1/resumenes/${id}`, contenido)
    return response.data
  },

  aprobarResumen: async (id: string, contenidoFinal: ContenidoResumen) => {
    const response = await axiosClient.post<ResumenResponse>(`/api/v1/resumenes/${id}/aprobar`, { contenidoFinal })
    return response.data
  },

  /** Solo funciona con un resumen aprobado: lo exige el backend y la base de datos. */
  enviarResumen: async (id: string) => {
    const response = await axiosClient.post<ResumenResponse>(`/api/v1/resumenes/${id}/enviar`)
    return response.data
  },
}

export default historiasService
