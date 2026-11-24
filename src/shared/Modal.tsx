import { useEffect, useId, type ReactNode } from 'react'
import { CloseIcon } from './Formulario'

interface Props {
    titulo: string
    subtitulo?: string
    icono?: ReactNode
    /** Mientras se guarda no se cierra con Escape ni con la X. */
    bloqueado?: boolean
    ancho?: 'sm' | 'md' | 'lg'
    onClose: () => void
    children: ReactNode
    /** Botones fijos abajo (el contenido hace scroll). */
    pie?: ReactNode
}

const ANCHOS = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-3xl' }

/** Ventana modal con el mismo aspecto que los formularios de mascotas y propietarios. */
export default function Modal({ titulo, subtitulo, icono, bloqueado = false, ancho = 'md', onClose, children, pie }: Props) {
    const tituloId = useId()

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape' && !bloqueado) onClose()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [bloqueado, onClose])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15, 23, 42, 0.45)' }}>
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby={tituloId}
                className={`flex w-full ${ANCHOS[ancho]} flex-col overflow-hidden rounded-2xl border`}
                style={{
                    maxHeight: 'min(92vh, 820px)',
                    background: 'var(--white)',
                    borderColor: 'var(--gray-200)',
                    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
                }}
            >
                <header className="flex items-start justify-between gap-4 px-6 py-5" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <div className="flex items-center gap-3">
                        {icono && (
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                {icono}
                            </div>
                        )}
                        <div>
                            <h2 id={tituloId} className="text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                                {titulo}
                            </h2>
                            {subtitulo && <p className="text-xs" style={{ color: 'var(--gray-500)' }}>{subtitulo}</p>}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={bloqueado}
                        aria-label="Cerrar"
                        className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                        style={{ color: 'var(--gray-400)' }}
                    >
                        <CloseIcon />
                    </button>
                </header>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
                {pie && (
                    <footer className="flex flex-wrap justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid var(--gray-200)' }}>
                        {pie}
                    </footer>
                )}
            </section>
        </div>
    )
}

/** Botones del pie con el estilo de la aplicación. */
export function BotonSecundario({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            {...props}
            className="rounded-lg border px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-50 disabled:opacity-50"
            style={{ borderColor: 'var(--gray-200)', color: 'var(--dark)' }}
        >
            {children}
        </button>
    )
}

export function BotonPrimario({ children, color = 'var(--primary)', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { color?: string }) {
    return (
        <button
            type="button"
            {...props}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: color }}
        >
            {children}
        </button>
    )
}

/** Diálogo de confirmación para acciones que no se deshacen (cerrar consulta, cancelar cita, enviar resumen). */
export function Confirmacion({ titulo, mensaje, textoConfirmar, peligro = false, ocupado = false, onConfirmar, onCancelar }: {
    titulo: string
    mensaje: string
    textoConfirmar: string
    peligro?: boolean
    ocupado?: boolean
    onConfirmar: () => void
    onCancelar: () => void
}) {
    const tituloId = useId()
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(15, 23, 42, 0.45)' }}>
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={tituloId}
                className="w-full max-w-sm rounded-2xl border p-6"
                style={{ background: 'var(--white)', borderColor: 'var(--gray-200)', boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)' }}
            >
                <h2 id={tituloId} className="text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                    {titulo}
                </h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--gray-500)' }}>{mensaje}</p>
                <div className="mt-6 flex justify-end gap-3">
                    <BotonSecundario onClick={onCancelar} disabled={ocupado}>Volver</BotonSecundario>
                    <BotonPrimario onClick={onConfirmar} disabled={ocupado} color={peligro ? '#EF4444' : 'var(--primary)'}>
                        {ocupado ? 'Procesando...' : textoConfirmar}
                    </BotonPrimario>
                </div>
            </div>
        </div>
    )
}

/** Mensaje de error del servidor dentro de un formulario. */
export function ErrorServidor({ mensaje }: { mensaje: string }) {
    if (!mensaje) return null
    return (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {mensaje}
        </div>
    )
}
