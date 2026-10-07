import type { Especie, Sexo } from '../../api/mascotasService'

export const ESPECIE_LABEL: Record<Especie, string> = {
    PERRO: 'Perro',
    GATO: 'Gato',
    AVE: 'Ave',
    CONEJO: 'Conejo',
    ROEDOR: 'Roedor',
    REPTIL: 'Reptil',
    OTRO: 'Otro',
}

// Perro y gato conservan los colores que ya usa el dashboard.
export const ESPECIE_COLOR: Record<Especie, string> = {
    PERRO: '#F59E08',
    GATO: '#14BBA6',
    AVE: '#0EA5E9',
    CONEJO: '#EC4899',
    ROEDOR: '#8B5CF6',
    REPTIL: '#22C55E',
    OTRO: '#6B7280',
}

export const SEXO_LABEL: Record<Sexo, string> = {
    MACHO: 'Macho',
    HEMBRA: 'Hembra',
    DESCONOCIDO: 'Sin definir',
}

/** "3 años", "5 meses", "2 semanas" o "—" si no hay fecha. */
export function edadDesde(fechaNacimiento: string | null): string {
    if (!fechaNacimiento) return '—'
    const [anio, mes, dia] = fechaNacimiento.split('-').map(Number)
    const nacimiento = new Date(anio, mes - 1, dia)
    const hoy = new Date()

    let meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + (hoy.getMonth() - nacimiento.getMonth())
    if (hoy.getDate() < nacimiento.getDate()) meses--

    if (meses >= 12) {
        const anios = Math.floor(meses / 12)
        return `${anios} ${anios === 1 ? 'año' : 'años'}`
    }
    if (meses >= 1) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`

    const semanas = Math.max(0, Math.floor((hoy.getTime() - nacimiento.getTime()) / (7 * 24 * 60 * 60 * 1000)))
    return semanas <= 1 ? 'Recién nacido' : `${semanas} semanas`
}

export function formatearPeso(pesoKg: number | null): string {
    if (pesoKg === null || pesoKg === undefined) return '—'
    return `${Number(pesoKg).toLocaleString('es-CO', { maximumFractionDigits: 2 })} kg`
}
