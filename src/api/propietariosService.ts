import axiosClient from './axiosClient'

export const getPropietarios = async () => {
    const response = await axiosClient.get('/api/v1/propietarios', {
        params: {
            query: '',
        },
    })

    return response.data
}