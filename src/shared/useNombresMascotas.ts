import { useEffect, useState } from 'react'
import mascotasService from '../api/mascotasService'

/**
 * Nombres de mascotas por id (las APIs de historias solo traen el id). `undefined` mientras carga,
 * `null` si no se pudo obtener.
 */
export function useNombresMascotas(ids: string[]) {
    const [nombres, setNombres] = useState<Record<string, string | null>>({})
    const clave = [...new Set(ids)].sort().join(',')

    useEffect(() => {
        const faltantes = clave ? clave.split(',').filter(id => !(id in nombres)) : []
        if (faltantes.length === 0) return
        let vigente = true
        Promise.allSettled(faltantes.map(id => mascotasService.obtener(id))).then(respuestas => {
            if (!vigente) return
            setNombres(prev => {
                const siguiente = { ...prev }
                respuestas.forEach((r, i) => { siguiente[faltantes[i]] = r.status === 'fulfilled' ? r.value.nombre : null })
                return siguiente
            })
        })
        return () => { vigente = false }
    }, [clave, nombres])

    return nombres
}
