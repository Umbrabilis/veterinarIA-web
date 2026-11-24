import { useEffect, useState } from 'react'
import authService, { type UserProfile } from '../api/authService'

// Una sola consulta por carga de la página, compartida por todas las pantallas que necesitan el rol.
let sesion: Promise<UserProfile | null> | null = null

/**
 * Usuario de la sesión. Las pantallas lo usan para mostrar u ocultar acciones (p. ej. solo un veterinario abre
 * consultas); la autorización real la hace el backend.
 */
export function useSesion() {
    const [usuario, setUsuario] = useState<UserProfile | null>(null)

    useEffect(() => {
        let vigente = true
        sesion ??= authService.obtenerSesion()
        sesion.then(u => {
            if (!vigente) return
            if (!u) sesion = null // sin sesión: el próximo intento vuelve a preguntar
            setUsuario(u)
        })
        return () => { vigente = false }
    }, [])

    const rol = usuario?.rol?.toUpperCase() ?? ''
    return { usuario, esVeterinario: rol === 'VETERINARIO', esAdministrador: rol === 'ADMINISTRADOR' }
}
