import { useCallback, useEffect, useState } from 'react'
import mascotasService from '../../api/mascotasService'
import { listarPropietarios, type PropietarioResponse } from '../../api/propietariosService'
import type { PaginaResponse } from '../../api/tipos'
import { EditIcon, PawIcon, PlusIcon, SearchIcon } from '../../shared/icons'
import { LIMITES, busquedaValida, mensajeDeError } from '../../shared/validaciones'
import PropietarioFormModal from './PropietarioFormModal'

const TAMANO_PAGINA = 10

type Formulario = { modo: 'crear' } | { modo: 'editar'; propietario: PropietarioResponse }

interface Props {
    /** Abre Mascotas; con documento, filtrado por las mascotas de ese dueño. */
    onVerMascotas: (documentoPropietario?: string) => void
}

export default function PropietariosPage({ onVerMascotas }: Props) {
    const [texto, setTexto] = useState('')
    const [busqueda, setBusqueda] = useState('')
    const [pagina, setPagina] = useState(0)
    const [version, setVersion] = useState(0)
    const [resultado, setResultado] = useState<{ clave: string; data?: PaginaResponse<PropietarioResponse>; error?: string } | null>(null)
    const [conteoMascotas, setConteoMascotas] = useState<Record<string, number | null>>({})
    const [formulario, setFormulario] = useState<Formulario | null>(null)
    const [aviso, setAviso] = useState('')

    const textoValido = busquedaValida(texto.trim())
    const clave = `${busqueda}|${pagina}|${version}`
    const cargando = resultado?.clave !== clave
    const datos = resultado?.data

    useEffect(() => {
        if (!textoValido) return
        const timeout = window.setTimeout(() => {
            setBusqueda(texto.trim())
            setPagina(0)
        }, 350)
        return () => window.clearTimeout(timeout)
    }, [texto, textoValido])

    useEffect(() => {
        let vigente = true
        listarPropietarios({ busqueda, pagina, tamano: TAMANO_PAGINA })
            .then(data => { if (vigente) setResultado({ clave, data }) })
            .catch(error => { if (vigente) setResultado({ clave, error: mensajeDeError(error, 'No se pudieron cargar los propietarios.') }) })
        return () => { vigente = false }
    }, [busqueda, pagina, clave])

    // Cuántas mascotas tiene cada propietario de la página (la API de propietarios no lo incluye).
    useEffect(() => {
        const faltantes = (datos?.contenido ?? []).map(p => p.id).filter(id => !(id in conteoMascotas))
        if (faltantes.length === 0) return
        let vigente = true
        Promise.allSettled(faltantes.map(id => mascotasService.listar({ propietarioId: id, tamano: 1 }))).then(respuestas => {
            if (!vigente) return
            setConteoMascotas(prev => {
                const siguiente = { ...prev }
                respuestas.forEach((r, i) => { siguiente[faltantes[i]] = r.status === 'fulfilled' ? r.value.totalElementos : null })
                return siguiente
            })
        })
        return () => { vigente = false }
    }, [datos, conteoMascotas])

    useEffect(() => {
        if (!aviso) return
        const timeout = window.setTimeout(() => setAviso(''), 5000)
        return () => window.clearTimeout(timeout)
    }, [aviso])

    const cerrarFormulario = useCallback(() => setFormulario(null), [])

    const desde = datos && datos.totalElementos > 0 ? datos.pagina * datos.tamano + 1 : 0
    const hasta = datos ? datos.pagina * datos.tamano + datos.contenido.length : 0

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-5">
            <div>
                <h1 className="text-xl font-bold mb-0.5" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                    Propietarios
                </h1>
                <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
                    Gestiona los propietarios y sus mascotas registradas en el sistema.
                </p>
            </div>

            {aviso && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700" role="status">
                    {aviso}
                </div>
            )}

            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--white)', border: '1px solid var(--gray-200)' }}>
                {/* Tabs */}
                <div className="flex items-center justify-between px-5 pt-4 pb-0" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <div className="flex gap-1">
                        {(['propietarios', 'mascotas'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => { if (t === 'mascotas') onVerMascotas() }}
                                className="px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px"
                                style={{
                                    borderColor: t === 'propietarios' ? 'var(--primary)' : 'transparent',
                                    color: t === 'propietarios' ? 'var(--primary)' : 'var(--gray-500)',
                                    fontFamily: 'Poppins, sans-serif',
                                }}
                            >
                                {t === 'propietarios' ? 'Propietarios' : 'Mascotas'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search + button */}
                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start">
                    <div className="flex-1">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-400)' }}>
                                <SearchIcon />
                            </span>
                            <input
                                value={texto}
                                maxLength={LIMITES.busqueda}
                                onChange={e => setTexto(e.target.value)}
                                placeholder="Buscar por nombre o documento"
                                aria-label="Buscar propietarios"
                                aria-invalid={!textoValido}
                                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all"
                                style={{ border: `1.5px solid ${textoValido ? 'var(--gray-200)' : '#EF4444'}`, color: 'var(--dark)' }}
                                onFocus={e => { if (textoValido) e.target.style.borderColor = 'var(--primary)' }}
                                onBlur={e => { if (textoValido) e.target.style.borderColor = 'var(--gray-200)' }}
                            />
                        </div>
                        {!textoValido ? (
                            <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>Usa solo letras, números, espacios, puntos, guiones o @.</p>
                        ) : (
                            <p className="mt-1 text-xs" style={{ color: 'var(--gray-400)' }}>El documento debe escribirse completo.</p>
                        )}
                    </div>
                    <button
                        onClick={() => setFormulario({ modo: 'crear' })}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: 'var(--primary)', whiteSpace: 'nowrap' }}
                    >
                        <PlusIcon />
                        Nuevo propietario
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr style={{ background: 'var(--gray-100)', borderBottom: '1px solid var(--gray-200)', borderTop: '1px solid var(--gray-200)' }}>
                            {['Nombre', 'Teléfono', 'Correo', 'Mascotas'].map(col => (
                                <th key={col} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gray-500)' }}>
                                    {col}
                                </th>
                            ))}
                            <th className="px-5 py-3"><span className="sr-only">Acciones</span></th>
                        </tr>
                        </thead>
                        <tbody className="divide-y" style={{ opacity: cargando && datos ? 0.55 : 1 }}>
                        {datos?.contenido.map(p => {
                            const mascotas = conteoMascotas[p.id]
                            return (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                                                style={{ background: 'var(--primary)' }}
                                            >
                                                {p.nombre.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium" style={{ color: 'var(--dark)' }}>{p.nombre}</div>
                                                <div className="text-xs" style={{ color: 'var(--gray-500)' }}>Doc. {p.documento}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm whitespace-nowrap" style={{ color: 'var(--gray-500)' }}>{p.telefono}</td>
                                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--gray-500)' }}>
                                        {p.email || (
                                            // Registros anteriores a que el correo fuera obligatorio: sin él no se le puede avisar.
                                            <span className="text-xs font-medium" style={{ color: '#B45309' }} title="Edítalo para agregar su correo">
                                                Sin correo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <button
                                            onClick={() => onVerMascotas(p.documento)}
                                            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold transition-colors hover:bg-gray-100"
                                            style={{ color: 'var(--dark)' }}
                                            title="Ver sus mascotas"
                                        >
                                            <PawIcon size={13} color="var(--secondary)" />
                                            {mascotas === undefined ? '…' : mascotas ?? '—'}
                                        </button>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => setFormulario({ modo: 'editar', propietario: p })}
                                                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-indigo-50"
                                                style={{ color: 'var(--primary)' }}
                                                aria-label={`Editar ${p.nombre}`}
                                            >
                                                <EditIcon size={14} />
                                                Editar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>

                    {!datos && cargando && (
                        <div className="py-12 text-center text-sm" style={{ color: 'var(--gray-400)' }}>Cargando propietarios...</div>
                    )}
                    {resultado?.error && !cargando && (
                        <div className="py-12 text-center text-sm" style={{ color: '#EF4444' }} role="alert">
                            {resultado.error}{' '}
                            <button onClick={() => setVersion(v => v + 1)} className="font-semibold underline" style={{ color: 'var(--primary)' }}>Reintentar</button>
                        </div>
                    )}
                    {datos && datos.contenido.length === 0 && !cargando && (
                        <div className="py-12 text-center">
                            <p className="text-sm" style={{ color: 'var(--gray-400)' }}>
                                {busqueda ? 'No se encontraron propietarios con esa búsqueda.' : 'Aún no hay propietarios registrados.'}
                            </p>
                            {!busqueda && (
                                <button onClick={() => setFormulario({ modo: 'crear' })} className="mt-2 text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                                    Registrar el primer propietario
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {datos && datos.totalElementos > 0 && (
                    <div className="flex items-center justify-between px-5 py-3 text-xs" style={{ borderTop: '1px solid var(--gray-200)', color: 'var(--gray-500)' }}>
                        <span>Mostrando {desde}–{hasta} de {datos.totalElementos}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagina(pg => Math.max(0, pg - 1))}
                                disabled={pagina === 0 || cargando}
                                className="rounded-lg border px-3 py-1.5 font-semibold transition-colors hover:bg-gray-50 disabled:opacity-40"
                                style={{ borderColor: 'var(--gray-200)', color: 'var(--dark)' }}
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setPagina(pg => pg + 1)}
                                disabled={pagina + 1 >= datos.totalPaginas || cargando}
                                className="rounded-lg border px-3 py-1.5 font-semibold transition-colors hover:bg-gray-50 disabled:opacity-40"
                                style={{ borderColor: 'var(--gray-200)', color: 'var(--dark)' }}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {formulario && (
                <PropietarioFormModal
                    propietario={formulario.modo === 'editar' ? formulario.propietario : undefined}
                    onClose={cerrarFormulario}
                    onSaved={(p, creado) => {
                        setFormulario(null)
                        setAviso(creado ? `${p.nombre} quedó registrado.` : `Los datos de ${p.nombre} se actualizaron.`)
                        setVersion(v => v + 1)
                    }}
                />
            )}

        </div>
    )
}
