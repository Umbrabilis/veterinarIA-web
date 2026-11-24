import { useEffect, useState } from 'react'
import mascotasService, { type MascotaResponse } from '../api/mascotasService'
import { ESPECIE_COLOR, ESPECIE_LABEL } from '../dashboard/mascotas/mascotaUtils'
import { PawIcon, SearchIcon } from './icons'
import { LIMITES, busquedaValida } from './validaciones'

interface Props {
    seleccionada: MascotaResponse | null
    onChange: (mascota: MascotaResponse | null) => void
    error?: string
    /** Oculta las mascotas inactivas (p. ej. al agendar). */
    soloActivas?: boolean
    etiqueta?: string
}

/** Busca una mascota por su nombre, el del propietario o su documento, y la selecciona. */
export default function SelectorMascota({ seleccionada, onChange, error, soloActivas = false, etiqueta = 'Mascota' }: Props) {
    const [texto, setTexto] = useState('')
    const [resultado, setResultado] = useState<{ busqueda: string; mascotas: MascotaResponse[] } | null>(null)
    const [fallo, setFallo] = useState('')
    const busqueda = texto.trim()
    const valida = busquedaValida(busqueda)

    useEffect(() => {
        if (seleccionada || !busqueda || !valida) return
        let vigente = true
        const timeout = window.setTimeout(() => {
            mascotasService.listar({ busqueda, tamano: 6 })
                .then(pagina => {
                    if (!vigente) return
                    setFallo('')
                    setResultado({ busqueda, mascotas: pagina.contenido.filter(m => !soloActivas || m.activo) })
                })
                .catch(() => { if (vigente) setFallo('No se pudo buscar. Intenta de nuevo.') })
        }, 300)
        return () => { vigente = false; window.clearTimeout(timeout) }
    }, [busqueda, valida, seleccionada, soloActivas])

    const etiquetaEl = (
        <span className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--dark)' }}>
            {etiqueta} <span style={{ color: '#EF4444' }}>*</span>
        </span>
    )

    if (seleccionada) {
        return (
            <div>
                {etiquetaEl}
                <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--gray-200)' }}>
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: ESPECIE_COLOR[seleccionada.especie] + '22' }}>
                            <PawIcon size={15} color={ESPECIE_COLOR[seleccionada.especie]} />
                        </div>
                        <div>
                            <div className="text-sm font-semibold" style={{ color: 'var(--dark)' }}>{seleccionada.nombre}</div>
                            <div className="text-xs" style={{ color: 'var(--gray-500)' }}>
                                {ESPECIE_LABEL[seleccionada.especie]}{seleccionada.raza ? ` · ${seleccionada.raza}` : ''}
                            </div>
                        </div>
                    </div>
                    <button type="button" onClick={() => { onChange(null); setTexto('') }} className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                        Cambiar
                    </button>
                </div>
            </div>
        )
    }

    const mascotas = resultado?.busqueda === busqueda ? resultado.mascotas : null

    return (
        <div>
            {etiquetaEl}
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-400)' }}>
                    <SearchIcon />
                </span>
                <input
                    value={texto}
                    maxLength={LIMITES.busqueda}
                    onChange={e => setTexto(e.target.value)}
                    placeholder="Nombre de la mascota, del propietario o documento"
                    aria-label={`Buscar ${etiqueta.toLowerCase()}`}
                    aria-invalid={Boolean(error) || !valida}
                    className="w-full rounded-lg py-2.5 pl-9 pr-4 text-sm outline-none"
                    style={{ border: `1.5px solid ${error || !valida ? '#EF4444' : 'var(--gray-200)'}`, color: 'var(--dark)' }}
                />
            </div>
            {busqueda && valida && (
                <div className="mt-2 overflow-hidden rounded-lg border" style={{ borderColor: 'var(--gray-200)' }}>
                    {fallo && <p className="px-3 py-2.5 text-xs" style={{ color: '#EF4444' }}>{fallo}</p>}
                    {!fallo && mascotas === null && <p className="px-3 py-2.5 text-xs" style={{ color: 'var(--gray-400)' }}>Buscando...</p>}
                    {!fallo && mascotas?.length === 0 && (
                        <p className="px-3 py-2.5 text-xs" style={{ color: 'var(--gray-400)' }}>No se encontraron mascotas.</p>
                    )}
                    {mascotas?.map(m => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => onChange(m)}
                            className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-50"
                        >
                            <PawIcon size={14} color={ESPECIE_COLOR[m.especie]} />
                            <span className="text-sm" style={{ color: 'var(--dark)' }}>{m.nombre}</span>
                            <span className="text-xs" style={{ color: 'var(--gray-500)' }}>
                                {ESPECIE_LABEL[m.especie]}{m.activo ? '' : ' · inactiva'}
                            </span>
                        </button>
                    ))}
                </div>
            )}
            {!valida && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>Usa solo letras, números, espacios, puntos, guiones o @.</p>}
            {error && valida && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{error}</p>}
        </div>
    )
}
