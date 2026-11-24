import type { EstadoCita } from '../api/citasService'
import type { EstadoResumen } from '../api/historiasService'

type Insignia = { texto: string; fondo: string; color: string }

export const ESTADO_CITA: Record<EstadoCita, Insignia> = {
    PROGRAMADA: { texto: 'Programada', fondo: 'var(--primary-light)', color: 'var(--primary)' },
    CONFIRMADA: { texto: 'Confirmada', fondo: 'var(--secondary-light)', color: '#065F46' },
    ATENDIDA: { texto: 'Atendida', fondo: '#E0F2FE', color: '#075985' },
    NO_ASISTIO: { texto: 'No asistió', fondo: '#FEF3C7', color: '#92400E' },
    CANCELADA: { texto: 'Cancelada', fondo: 'var(--gray-100)', color: 'var(--gray-500)' },
}

export const ESTADO_RESUMEN: Record<EstadoResumen, Insignia> = {
    BORRADOR: { texto: 'Por revisar', fondo: '#FEF3C7', color: '#92400E' },
    APROBADO: { texto: 'Aprobado', fondo: 'var(--primary-light)', color: 'var(--primary)' },
    ENVIADO: { texto: 'Enviado', fondo: 'var(--secondary-light)', color: '#065F46' },
}

/** "Dr. Nombre", sin duplicar el título si el nombre ya lo trae ("Dra. Marta Ríos"). */
export function nombreVeterinario(nombre: string): string {
    return /^dra?\.?\s/i.test(nombre.trim()) ? nombre : `Dr. ${nombre}`
}
