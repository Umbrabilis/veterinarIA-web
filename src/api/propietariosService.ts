import axiosClient from './axiosClient'
import type { PaginaResponse } from './tipos'

// Contrato: pacientes-service `PropietarioRequest` y `PropietarioResponse`.
// Los dueños no tienen cuenta en el sistema: la clínica les escribe a este correo.

export interface PropietarioRequest {
    nombre: string
    documento: string
    telefono: string
    /** Obligatorio: es el canal por el que el dueño recibe las novedades de su mascota. */
    email: string
    direccion: string | null
    /** Autorización de tratamiento de datos (Ley 1581 de 2012). El backend la exige en `true` al crear y al editar. */
    aceptaTratamientoDatos: boolean
}

export interface PropietarioResponse {
    id: string
    /** Heredado de cuando los dueños tenían cuenta; el panel no lo usa. */
    usuarioId: string | null
    nombre: string
    documento: string
    telefono: string
    email: string | null
    direccion: string | null
    consentimientoDatosEn: string
}

export interface ListarPropietariosParams {
    /** Nombre (parcial) o documento (exacto). */
    busqueda?: string
    pagina?: number
    tamano?: number
}

export const listarPropietarios = async ({ busqueda, pagina = 0, tamano = 20 }: ListarPropietariosParams = {}) => {
    const response = await axiosClient.get<PaginaResponse<PropietarioResponse>>('/api/v1/propietarios', {
        params: { busqueda: busqueda?.trim() || undefined, pagina, tamano },
    })

    return response.data
}

/** Para selectores: primeros resultados de una búsqueda. */
export const buscarPropietarios = (busqueda: string, tamano = 8) => listarPropietarios({ busqueda, tamano })

export const obtenerPropietario = async (id: string) => {
    const response = await axiosClient.get<PropietarioResponse>(`/api/v1/propietarios/${id}`)

    return response.data
}

export const crearPropietario = async (propietario: PropietarioRequest) => {
    const response = await axiosClient.post<PropietarioResponse>('/api/v1/propietarios', propietario)

    return response.data
}

export const actualizarPropietario = async (id: string, propietario: PropietarioRequest) => {
    const response = await axiosClient.put<PropietarioResponse>(`/api/v1/propietarios/${id}`, propietario)

    return response.data
}
