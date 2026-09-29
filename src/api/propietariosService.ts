import axiosClient from './axiosClient'

export interface PropietarioRequest {
    nombre: string
    documento: string
    telefono: string
    email?: string
    direccion?: string
    aceptaTratamientoDatos?: boolean
}

export const getPropietarios = async () => {
    const response = await axiosClient.get('/api/v1/propietarios', {
        params: {
            query: '',
        },
    })

    return response.data
}

export const crearPropietario = async (propietario: PropietarioRequest) => {
    const response = await axiosClient.post(
        '/api/v1/propietarios',
        propietario
    )

    return response.data
}