import { useCallback, useEffect, useState } from 'react'
import mascotasService, { type MascotaResponse } from '../../api/mascotasService'
import { obtenerPropietario, type PropietarioResponse } from '../../api/propietariosService'
import type { PaginaResponse } from '../../api/tipos'
import { EditIcon, PawIcon, PlusIcon, SearchIcon } from '../../shared/icons'
import { LIMITES, busquedaValida, mensajeDeError } from '../../shared/validaciones'
import MascotaFormModal from './MascotaFormModal'
import { ESPECIE_COLOR, ESPECIE_LABEL, SEXO_LABEL, edadDesde, formatearPeso } from './mascotaUtils'

const TAMANO_PAGINA = 10

type Formulario = { modo: 'crear' } | { modo: 'editar'; mascota: MascotaResponse }

interface Props {
    /** Llega desde Propietarios ("Ver mascotas"): el documento del dueño. */
    busquedaInicial?: string
}

export default function MascotasPage({ busquedaInicial = '' }: Props) {
    const [texto, setTexto] = useState(busquedaInicial)
    const [busqueda, setBusqueda] = useState(busquedaInicial.trim())
    const [pagina, setPagina] = useState(0)
    const [version, setVersion] = useState(0)
    const [resultado, setResultado] = useState<{ clave: string; data?: PaginaResponse<MascotaResponse>; error?: string } | null>(null)
    const [propietarios, setPropietarios] = useState<Record<string, PropietarioResponse | null>>({})
    const [formulario, setFormulario] = useState<Formulario | null>(null)
    const [confirmando, setConfirmando] = useState<MascotaResponse | null>(null)
    const [cambiandoEstado, setCambiandoEstado] = useState(false)
    const [aviso, setAviso] = useState('')

    const textoValido = busquedaValida(texto.trim())
    const clave = `${busqueda}|${pagina}|${version}`
    const cargando = resultado?.clave !== clave
    const datos = resultado?.data

    // Espera a que el usuario deje de escribir antes de consultar.
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
        mascotasService.listar({ busqueda, pagina, tamano: TAMANO_PAGINA })
            .then(data => { if (vigente) setResultado({ clave, data }) })
            .catch(error => { if (vigente) setResultado({ clave, error: mensajeDeError(error, 'No se pudieron cargar las mascotas.') }) })
        return () => { vigente = false }
    }, [busqueda, pagina, clave])

    // Nombres de los propietarios de la página actual (la API de mascotas solo trae el id).
    useEffect(() => {
        const faltantes = [...new Set(datos?.contenido.map(m => m.propietarioId) ?? [])]
            .filter(id => !(id in propietarios))
        if (faltantes.length === 0) return
        let vigente = true
        Promise.allSettled(faltantes.map(id => obtenerPropietario(id))).then(respuestas => {
            if (!vigente) return
            setPropietarios(prev => {
                const siguiente = { ...prev }
                respuestas.forEach((r, i) => { siguiente[faltantes[i]] = r.status === 'fulfilled' ? r.value : null })
                return siguiente
            })
        })
        return () => { vigente = false }
    }, [datos, propietarios])

    useEffect(() => {
        if (!aviso) return
        const timeout = window.setTimeout(() => setAviso(''), 5000)
        return () => window.clearTimeout(timeout)
    }, [aviso])

    const cerrarFormulario = useCallback(() => setFormulario(null), [])

    function recargar() {
        setVersion(v => v + 1)
    }

    async function cambiarEstado(mascota: MascotaResponse) {
        setCambiandoEstado(true)
        try {
            const actualizada = await mascotasService.actualizar(mascota.id, {
                propietarioId: mascota.propietarioId,
                nombre: mascota.nombre,
                especie: mascota.especie,
                raza: mascota.raza,
                sexo: mascota.sexo,
                fechaNacimiento: mascota.fechaNacimiento,
                pesoKg: mascota.pesoKg,
                color: mascota.color,
                activo: !mascota.activo,
            })
            setAviso(`${actualizada.nombre} quedó ${actualizada.activo ? 'activa' : 'inactiva'}.`)
            setConfirmando(null)
            recargar()
        } catch (error) {
            setAviso(mensajeDeError(error, 'No se pudo cambiar el estado de la mascota.'))
            setConfirmando(null)
        } finally {
            setCambiandoEstado(false)
        }
    }

    const desde = datos && datos.totalElementos > 0 ? datos.pagina * datos.tamano + 1 : 0
    const hasta = datos ? datos.pagina * datos.tamano + datos.contenido.length : 0

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-5">
            <div>
                <h1 className="text-xl font-bold mb-0.5" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                    Mascotas
                </h1>
                <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
                    Registra y gestiona los pacientes de la clínica.
                </p>
            </div>

            {aviso && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700" role="status">
                    {aviso}
                </div>
            )}

            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--white)', border: '1px solid var(--gray-200)' }}>
                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <div className="flex-1">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-400)' }}>
                                <SearchIcon />
                            </span>
                            <input
                                value={texto}
                                maxLength={LIMITES.busqueda}
                                onChange={e => setTexto(e.target.value)}
                                placeholder="Buscar por nombre de la mascota, propietario o documento"
                                aria-label="Buscar mascotas"
                                aria-invalid={!textoValido}
                                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all"
                                style={{ border: `1.5px solid ${textoValido ? 'var(--gray-200)' : '#EF4444'}`, color: 'var(--dark)' }}
                                onFocus={e => { if (textoValido) e.target.style.borderColor = 'var(--primary)' }}
                                onBlur={e => { if (textoValido) e.target.style.borderColor = 'var(--gray-200)' }}
                            />
                        </div>
                        {!textoValido && (
                            <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                                Usa solo letras, números, espacios, puntos, guiones o @.
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => setFormulario({ modo: 'crear' })}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: 'var(--primary)', whiteSpace: 'nowrap' }}
                    >
                        <PlusIcon />
                        Nueva mascota
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr style={{ background: 'var(--gray-100)', borderBottom: '1px solid var(--gray-200)' }}>
                            {['Nombre', 'Raza', 'Edad', 'Peso', 'Propietario', 'Estado'].map(col => (
                                <th key={col} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gray-500)' }}>
                                    {col}
                                </th>
                            ))}
                            <th className="px-5 py-3"><span className="sr-only">Acciones</span></th>
                        </tr>
                        </thead>
                        <tbody className="divide-y" style={{ opacity: cargando && datos ? 0.55 : 1 }}>
                        {datos?.contenido.map(m => {
                            const propietario = propietarios[m.propietarioId]
                            return (
                                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: ESPECIE_COLOR[m.especie] + '22' }}>
                                                <PawIcon size={15} color={ESPECIE_COLOR[m.especie]} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium" style={{ color: 'var(--dark)' }}>{m.nombre}</div>
                                                <div className="text-xs" style={{ color: 'var(--gray-500)' }}>
                                                    {ESPECIE_LABEL[m.especie]} · {SEXO_LABEL[m.sexo]}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--gray-500)' }}>{m.raza || '—'}</td>
                                    <td className="px-5 py-3.5 text-sm whitespace-nowrap" style={{ color: 'var(--gray-500)' }}>{edadDesde(m.fechaNacimiento)}</td>
                                    <td className="px-5 py-3.5 text-sm whitespace-nowrap" style={{ color: 'var(--gray-500)' }}>{formatearPeso(m.pesoKg)}</td>
                                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--gray-500)' }}>
                                        {propietario === undefined ? '…' : propietario?.nombre ?? 'No disponible'}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span
                                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                                            style={{
                                                background: m.activo ? 'var(--secondary-light)' : 'var(--gray-100)',
                                                color: m.activo ? '#065F46' : 'var(--gray-500)',
                                            }}
                                        >
                                            {m.activo ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => setFormulario({ modo: 'editar', mascota: m })}
                                                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-indigo-50"
                                                style={{ color: 'var(--primary)' }}
                                                aria-label={`Editar ${m.nombre}`}
                                            >
                                                <EditIcon size={14} />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => setConfirmando(m)}
                                                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-gray-100"
                                                style={{ color: m.activo ? 'var(--gray-500)' : 'var(--secondary)' }}
                                            >
                                                {m.activo ? 'Desactivar' : 'Reactivar'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>

                    {!datos && cargando && (
                        <div className="py-12 text-center text-sm" style={{ color: 'var(--gray-400)' }}>Cargando mascotas...</div>
                    )}
                    {resultado?.error && !cargando && (
                        <div className="py-12 text-center text-sm" style={{ color: '#EF4444' }} role="alert">
                            {resultado.error}{' '}
                            <button onClick={recargar} className="font-semibold underline" style={{ color: 'var(--primary)' }}>Reintentar</button>
                        </div>
                    )}
                    {datos && datos.contenido.length === 0 && !cargando && (
                        <div className="py-12 text-center">
                            <p className="text-sm" style={{ color: 'var(--gray-400)' }}>
                                {busqueda ? 'No se encontraron mascotas con esa búsqueda.' : 'Aún no hay mascotas registradas.'}
                            </p>
                            {!busqueda && (
                                <button onClick={() => setFormulario({ modo: 'crear' })} className="mt-2 text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                                    Registrar la primera mascota
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
                                onClick={() => setPagina(p => Math.max(0, p - 1))}
                                disabled={pagina === 0 || cargando}
                                className="rounded-lg border px-3 py-1.5 font-semibold transition-colors hover:bg-gray-50 disabled:opacity-40"
                                style={{ borderColor: 'var(--gray-200)', color: 'var(--dark)' }}
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setPagina(p => p + 1)}
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
                <MascotaFormModal
                    mascota={formulario.modo === 'editar' ? formulario.mascota : undefined}
                    propietarioInicial={formulario.modo === 'editar' ? propietarios[formulario.mascota.propietarioId] ?? null : null}
                    onClose={cerrarFormulario}
                    onSaved={(mascota, creada) => {
                        setFormulario(null)
                        setAviso(creada ? `${mascota.nombre} quedó registrada.` : `Los datos de ${mascota.nombre} se actualizaron.`)
                        recargar()
                    }}
                />
            )}

            {confirmando && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15, 23, 42, 0.45)' }}>
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="confirmar-estado-titulo"
                        className="w-full max-w-sm rounded-2xl border p-6"
                        style={{ background: 'var(--white)', borderColor: 'var(--gray-200)', boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)' }}
                    >
                        <h2 id="confirmar-estado-titulo" className="text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                            {confirmando.activo ? `¿Desactivar a ${confirmando.nombre}?` : `¿Reactivar a ${confirmando.nombre}?`}
                        </h2>
                        <p className="mt-2 text-sm" style={{ color: 'var(--gray-500)' }}>
                            {confirmando.activo
                                ? 'La mascota dejará de aparecer como paciente activo. Su historia clínica se conserva y puedes reactivarla cuando quieras.'
                                : 'La mascota volverá a aparecer como paciente activo.'}
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmando(null)}
                                disabled={cambiandoEstado}
                                className="rounded-lg border px-4 py-2 text-sm font-semibold"
                                style={{ borderColor: 'var(--gray-200)', color: 'var(--dark)' }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => cambiarEstado(confirmando)}
                                disabled={cambiandoEstado}
                                className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                style={{ background: confirmando.activo ? '#EF4444' : 'var(--secondary)' }}
                            >
                                {cambiandoEstado ? 'Guardando...' : confirmando.activo ? 'Desactivar' : 'Reactivar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
