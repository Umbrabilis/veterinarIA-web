import { useId, type ReactNode } from 'react'

/** Etiqueta + control + mensaje de error. `children` recibe el id para enlazar la etiqueta. */
export function Campo({ label, error, ayuda, requerido = false, children }: {
    label: string
    error?: string
    ayuda?: string
    requerido?: boolean
    children: (id: string) => ReactNode
}) {
    const id = useId()
    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--dark)' }}>
                {label} {requerido && <span style={{ color: '#EF4444' }}>*</span>}
            </label>
            {children(id)}
            {error ? (
                <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{error}</p>
            ) : ayuda ? (
                <p className="mt-1 text-xs" style={{ color: 'var(--gray-400)' }}>{ayuda}</p>
            ) : null}
        </div>
    )
}

export function CloseIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    )
}
