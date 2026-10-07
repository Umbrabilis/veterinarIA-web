import type { CSSProperties } from 'react'

/** Borde y espaciado de los campos de formulario; rojo si hay error. */
export function estiloInput(error?: string): CSSProperties {
    return {
        border: `1.5px solid ${error ? '#EF4444' : 'var(--gray-200)'}`,
        color: 'var(--dark)',
        background: 'var(--white)',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 14,
        width: '100%',
        outline: 'none',
    }
}
