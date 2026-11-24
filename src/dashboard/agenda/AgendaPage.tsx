import { useEffect, useState } from 'react'
import citasService, { type CitaResponse, type EstadoCita, type VeterinarioResponse } from '../../api/citasService'
import { aISOFecha, formatearFechaLarga, formatearHora, rangoDelDia, sumarDias } from '../../shared/fechas'
import { ArrowLeftIcon, CalendarIcon, ChevronRightIcon, ClipboardIcon, PlusIcon } from '../../shared/icons'
import { ESTADO_CITA, nombreVeterinario } from '../../shared/estados'
import { Confirmacion } from '../../shared/Modal'
import { useSesion } from '../../shared/useSesion'
import { hoyISO, mensajeDeError } from '../../shared/validaciones'
import CitaFormModal from './CitaFormModal'


const esActiva = (estado: EstadoCita) => estado === 'PROGRAMADA' || estado === 'CONFIRMADA'

interface Props {
    /** "Atender": abre la historia clínica de la mascota con una consulta nueva ligada a la cita. */
    onAtender: (cita: CitaResponse) => void
}

type Formulario = { modo: 'crear' } | { modo: 'reprogramar'; cita: CitaResponse }
type Pendiente = { cita: CitaResponse; estado: EstadoCita }

export default function AgendaPage({ onAtender }: Props) {
    const { usuario, esVeterinario } = useSesion()
    const [fecha, setFecha] = useState(hoyISO())
    // null: el usuario aún no eligió filtro; un veterinario empieza viendo su propia agenda.
    const [veterinarioElegido, setVeterinarioId] = useState<string | null>(null)
    const veterinarioId = veterinarioElegido ?? (esVeterinario && usuario?.id ? usuario.id : '')
    const [veterinarios, setVeterinarios] = useState<VeterinarioResponse[]>([])
    const [version, setVersion] = useState(0)
    const [resultado, setResultado] = useState<{ clave: string; citas?: CitaResponse[]; error?: string } | null>(null)
    const [formulario, setFormulario] = useState<Formulario | null>(null)
    const [confirmando, setConfirmando] = useState<Pendiente | null>(null)
    const [ocupado, setOcupado] = useState(false)
    const [aviso, setAviso] = useState<{ texto: string; error?: boolean } | null>(null)

    const clave = `${fecha}|${veterinarioId}|${version}`
    const cargando = resultado?.clave !== clave
    const citas = resultado?.citas

    useEffect(() => {
        citasService.veterinarios().then(setVeterinarios).catch(() => setVeterinarios([]))
    }, [])

    useEffect(() => {
        let vigente = true
        citasService.listar({ veterinarioId, ...rangoDelDia(fecha) })
            .then(data => {
                if (!vigente) return
                data.sort((a, b) => a.inicio.localeCompare(b.inicio))
                setResultado({ clave, citas: data })
            })
            .catch(error => { if (vigente) setResultado({ clave, error: mensajeDeError(error, 'No se pudo cargar la agenda.') }) })
        return () => { vigente = false }
    }, [fecha, veterinarioId, clave])

    useEffect(() => {
        if (!aviso) return
        const timeout = window.setTimeout(() => setAviso(null), 5000)
        return () => window.clearTimeout(timeout)
    }, [aviso])

    const recargar = () => setVersion(v => v + 1)

    async function cambiarEstado({ cita, estado }: Pendiente) {
        setOcupado(true)
        try {
            await citasService.cambiarEstado(cita.id, estado)
            setAviso({ texto: `La cita de ${cita.mascotaNombre} quedó ${ESTADO_CITA[estado].texto.toLowerCase()}.` })
            recargar()
        } catch (error) {
            setAviso({ texto: mensajeDeError(error, 'No se pudo cambiar el estado de la cita.'), error: true })
        } finally {
            setOcupado(false)
            setConfirmando(null)
        }
    }

    const activas = citas?.filter(c => esActiva(c.estado)).length ?? 0
    const esHoy = fecha === hoyISO()

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold mb-0.5" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>Agenda</h1>
                    <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
                        Citas de la clínica. Cada cambio avisa en tiempo real al resto del personal.
                    </p>
                </div>
                <button
                    onClick={() => setFormulario({ modo: 'crear' })}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: 'var(--primary)', whiteSpace: 'nowrap' }}
                >
                    <PlusIcon />
                    Nueva cita
                </button>
            </div>

            {aviso && (
                <div
                    className={`rounded-lg border px-4 py-3 text-sm font-medium ${aviso.error ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}
                    role={aviso.error ? 'alert' : 'status'}
                >
                    {aviso.texto}
                </div>
            )}

            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--white)', border: '1px solid var(--gray-200)' }}>
                <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setFecha(f => sumarDias(f, -1))} aria-label="Día anterior" className="rounded-lg border p-2 hover:bg-gray-50" style={{ borderColor: 'var(--gray-200)', color: 'var(--dark)' }}>
                            <ArrowLeftIcon />
                        </button>
                        <input
                            type="date"
                            value={fecha}
                            onChange={e => e.target.value && setFecha(e.target.value)}
                            aria-label="Fecha de la agenda"
                            className="rounded-lg border px-3 py-1.5 text-sm"
                            style={{ borderColor: 'var(--gray-200)', color: 'var(--dark)' }}
                        />
                        <button onClick={() => setFecha(f => sumarDias(f, 1))} aria-label="Día siguiente" className="rounded-lg border p-2 hover:bg-gray-50" style={{ borderColor: 'var(--gray-200)', color: 'var(--dark)' }}>
                            <ChevronRightIcon />
                        </button>
                        {!esHoy && (
                            <button onClick={() => setFecha(hoyISO())} className="px-2 text-sm font-semibold" style={{ color: 'var(--primary)' }}>Hoy</button>
                        )}
                    </div>
                    <select
                        value={veterinarioId}
                        onChange={e => setVeterinarioId(e.target.value)}
                        aria-label="Filtrar por veterinario"
                        className="rounded-lg border px-3 py-2 text-sm"
                        style={{ borderColor: 'var(--gray-200)', color: 'var(--dark)' }}
                    >
                        <option value="">Todos los veterinarios</option>
                        {veterinarios.map(v => <option key={v.id} value={v.id}>{nombreVeterinario(v.nombre)}</option>)}
                    </select>
                </div>

                <div className="flex items-center justify-between px-5 py-3" style={{ background: 'var(--gray-100)', borderBottom: '1px solid var(--gray-200)' }}>
                    <span className="text-sm font-semibold" style={{ color: 'var(--dark)' }}>
                        {esHoy ? 'Hoy · ' : ''}{formatearFechaLarga(fecha)}
                    </span>
                    {citas && <span className="text-xs" style={{ color: 'var(--gray-500)' }}>{activas} {activas === 1 ? 'cita activa' : 'citas activas'}</span>}
                </div>

                <div className="divide-y" style={{ opacity: cargando && citas ? 0.55 : 1 }}>
                    {citas?.map(c => (
                        <div key={c.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                            <div className="w-24 flex-shrink-0">
                                <div className="text-sm font-bold" style={{ color: esActiva(c.estado) ? 'var(--primary)' : 'var(--gray-400)' }}>{formatearHora(c.inicio)}</div>
                                <div className="text-xs" style={{ color: 'var(--gray-400)' }}>a {formatearHora(c.fin)}</div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-semibold" style={{ color: 'var(--dark)' }}>{c.mascotaNombre}</span>
                                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: ESTADO_CITA[c.estado].fondo, color: ESTADO_CITA[c.estado].color }}>
                                        {ESTADO_CITA[c.estado].texto}
                                    </span>
                                </div>
                                <div className="mt-0.5 text-xs" style={{ color: 'var(--gray-500)' }}>
                                    {nombreVeterinario(c.veterinarioNombre)} · {c.motivo}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                                {esActiva(c.estado) && esVeterinario && c.veterinarioId === usuario?.id && (
                                    <AccionCita onClick={() => onAtender(c)} destacada>
                                        <ClipboardIcon size={14} /> Atender
                                    </AccionCita>
                                )}
                                {c.estado === 'PROGRAMADA' && (
                                    <AccionCita onClick={() => cambiarEstado({ cita: c, estado: 'CONFIRMADA' })} disabled={ocupado}>Confirmar</AccionCita>
                                )}
                                {esActiva(c.estado) && (
                                    <>
                                        <AccionCita onClick={() => setFormulario({ modo: 'reprogramar', cita: c })}>Reprogramar</AccionCita>
                                        <AccionCita onClick={() => setConfirmando({ cita: c, estado: 'ATENDIDA' })}>Atendida</AccionCita>
                                        <AccionCita onClick={() => setConfirmando({ cita: c, estado: 'NO_ASISTIO' })}>No asistió</AccionCita>
                                        <AccionCita onClick={() => setConfirmando({ cita: c, estado: 'CANCELADA' })} peligro>Cancelar</AccionCita>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {!citas && cargando && <div className="py-12 text-center text-sm" style={{ color: 'var(--gray-400)' }}>Cargando agenda...</div>}
                {resultado?.error && !cargando && (
                    <div className="py-12 text-center text-sm" style={{ color: '#EF4444' }} role="alert">
                        {resultado.error}{' '}
                        <button onClick={recargar} className="font-semibold underline" style={{ color: 'var(--primary)' }}>Reintentar</button>
                    </div>
                )}
                {citas && citas.length === 0 && !cargando && (
                    <div className="py-12 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                            <CalendarIcon size={22} />
                        </div>
                        <p className="text-sm" style={{ color: 'var(--gray-400)' }}>No hay citas este día.</p>
                        <button onClick={() => setFormulario({ modo: 'crear' })} className="mt-2 text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                            Agendar una cita
                        </button>
                    </div>
                )}
            </div>

            {formulario && (
                <CitaFormModal
                    cita={formulario.modo === 'reprogramar' ? formulario.cita : undefined}
                    fechaInicial={fecha}
                    veterinarioInicial={veterinarioId}
                    onClose={() => setFormulario(null)}
                    onSaved={guardada => {
                        setFormulario(null)
                        setAviso({ texto: formulario.modo === 'crear' ? `Cita de ${guardada.mascotaNombre} agendada.` : `Cita de ${guardada.mascotaNombre} reprogramada.` })
                        setFecha(aISOFecha(new Date(guardada.inicio)))
                        recargar()
                    }}
                />
            )}

            {confirmando && (
                <Confirmacion
                    titulo={TITULO_CONFIRMACION[confirmando.estado] ?? '¿Cambiar el estado?'}
                    mensaje={`${confirmando.cita.mascotaNombre}, ${formatearHora(confirmando.cita.inicio)} con ${nombreVeterinario(confirmando.cita.veterinarioNombre)}. Este cambio no se puede deshacer.`}
                    textoConfirmar={confirmando.estado === 'CANCELADA' ? 'Cancelar cita' : 'Sí, marcar'}
                    peligro={confirmando.estado === 'CANCELADA'}
                    ocupado={ocupado}
                    onConfirmar={() => cambiarEstado(confirmando)}
                    onCancelar={() => setConfirmando(null)}
                />
            )}
        </div>
    )
}

const TITULO_CONFIRMACION: Partial<Record<EstadoCita, string>> = {
    CANCELADA: '¿Cancelar la cita?',
    ATENDIDA: '¿Marcar como atendida?',
    NO_ASISTIO: '¿Marcar que no asistió?',
}


function AccionCita({ children, onClick, disabled, peligro, destacada }: {
    children: React.ReactNode
    onClick: () => void
    disabled?: boolean
    peligro?: boolean
    destacada?: boolean
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-gray-100 disabled:opacity-40"
            style={destacada
                ? { background: 'var(--primary)', color: 'white' }
                : { color: peligro ? '#EF4444' : 'var(--gray-500)' }}
        >
            {children}
        </button>
    )
}
