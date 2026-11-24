import { useEffect, useState } from 'react'
import historiasService, {
    type ConsultaResponse, type EstadoResumen, type ResumenResponse, type SeguimientoItem, type VacunaResponse,
} from '../../api/historiasService'
import mascotasService, { type MascotaResponse } from '../../api/mascotasService'
import { formatearDiaDe, formatearFecha, formatearFechaHora } from '../../shared/fechas'
import { CalendarIcon, ChevronRightIcon, ClipboardIcon, PlusIcon, SparklesIcon } from '../../shared/icons'
import SelectorMascota from '../../shared/SelectorMascota'
import { useNombresMascotas } from '../../shared/useNombresMascotas'
import { useSesion } from '../../shared/useSesion'
import { mensajeDeError } from '../../shared/validaciones'
import ConsultaDetalleModal, { EstadoConsultaBadge } from './ConsultaDetalleModal'
import ConsultaFormModal from './ConsultaFormModal'
import { ESTADO_RESUMEN } from '../../shared/estados'
import ResumenModal from './ResumenModal'
import VacunaFormModal from './VacunaFormModal'

type Pestana = 'historia' | 'resumenes' | 'seguimiento'

export interface AtencionDeCita {
    mascotaId: string
    cita: { id: string; motivo: string }
}

interface Props {
    /** Desde la agenda ("Atender"): abre la historia de la mascota con una consulta nueva ligada a la cita. */
    atencion?: AtencionDeCita
    pestanaInicial?: Pestana
}

export default function ConsultasPage({ atencion, pestanaInicial = 'historia' }: Props) {
    const [pestana, setPestana] = useState<Pestana>(atencion ? 'historia' : pestanaInicial)
    const [aviso, setAviso] = useState('')

    useEffect(() => {
        if (!aviso) return
        const timeout = window.setTimeout(() => setAviso(''), 6000)
        return () => window.clearTimeout(timeout)
    }, [aviso])

    const pestanas: { id: Pestana; texto: string }[] = [
        { id: 'historia', texto: 'Historia clínica' },
        { id: 'resumenes', texto: 'Resúmenes IA' },
        { id: 'seguimiento', texto: 'Seguimiento' },
    ]

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-5">
            <div>
                <h1 className="text-xl font-bold mb-0.5" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>Consultas</h1>
                <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
                    Historia clínica, vacunas, resúmenes para los dueños y controles pendientes.
                </p>
            </div>

            <div className="flex gap-1 overflow-x-auto rounded-xl p-1" role="tablist" style={{ background: 'var(--gray-100)' }}>
                {pestanas.map(p => (
                    <button
                        key={p.id}
                        role="tab"
                        aria-selected={pestana === p.id}
                        onClick={() => setPestana(p.id)}
                        className="flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all"
                        style={pestana === p.id ? { background: 'var(--white)', color: 'var(--primary)', boxShadow: '0 1px 3px rgba(15,23,42,0.08)' } : { color: 'var(--gray-500)' }}
                    >
                        {p.texto}
                    </button>
                ))}
            </div>

            {aviso && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700" role="status">{aviso}</div>}

            {pestana === 'historia' && <HistoriaClinica atencion={atencion} onAviso={setAviso} />}
            {pestana === 'resumenes' && <Resumenes onAviso={setAviso} />}
            {pestana === 'seguimiento' && <Seguimiento />}
        </div>
    )
}

/* ---------- Historia clínica de una mascota ---------- */

function HistoriaClinica({ atencion, onAviso }: { atencion?: AtencionDeCita; onAviso: (texto: string) => void }) {
    const { usuario, esVeterinario } = useSesion()
    const [mascota, setMascota] = useState<MascotaResponse | null>(null)
    const [version, setVersion] = useState(0)
    const [datos, setDatos] = useState<{ clave: string; consultas?: ConsultaResponse[]; vacunas?: VacunaResponse[]; error?: string } | null>(null)
    const [nueva, setNueva] = useState<AtencionDeCita['cita'] | null | false>(false)
    const [detalle, setDetalle] = useState<string | null>(null)
    const [vacunando, setVacunando] = useState(false)

    // Llegada desde la agenda: se carga la mascota y se abre el formulario de consulta.
    useEffect(() => {
        if (!atencion) return
        let vigente = true
        mascotasService.obtener(atencion.mascotaId)
            .then(m => { if (vigente) { setMascota(m); setNueva(atencion.cita) } })
            .catch(() => { /* el usuario puede buscarla a mano */ })
        return () => { vigente = false }
    }, [atencion])

    const clave = `${mascota?.id}|${version}`
    useEffect(() => {
        if (!mascota) return
        let vigente = true
        Promise.all([historiasService.historia(mascota.id), historiasService.vacunas(mascota.id)])
            .then(([consultas, vacunas]) => { if (vigente) setDatos({ clave, consultas, vacunas }) })
            .catch(e => { if (vigente) setDatos({ clave, error: mensajeDeError(e, 'No se pudo cargar la historia clínica.') }) })
        return () => { vigente = false }
    }, [mascota, clave])

    const recargar = () => setVersion(v => v + 1)
    const actuales = datos?.clave === clave ? datos : null

    return (
        <div className="space-y-5">
            <div className="rounded-xl p-5" style={{ background: 'var(--white)', border: '1px solid var(--gray-200)' }}>
                <SelectorMascota seleccionada={mascota} onChange={m => { setMascota(m); setDatos(null) }} etiqueta="Paciente" />
                {mascota && esVeterinario && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => setNueva(null)} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90" style={{ background: 'var(--primary)' }}>
                            <PlusIcon /> Nueva consulta
                        </button>
                        <button onClick={() => setVacunando(true)} className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50" style={{ borderColor: 'var(--gray-200)', color: 'var(--dark)' }}>
                            Registrar vacuna
                        </button>
                    </div>
                )}
                {mascota && !esVeterinario && (
                    <p className="mt-3 text-xs" style={{ color: 'var(--gray-500)' }}>Solo los veterinarios registran consultas y vacunas.</p>
                )}
            </div>

            {!mascota && (
                <div className="rounded-xl py-12 text-center" style={{ background: 'var(--white)', border: '1px dashed var(--gray-200)' }}>
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        <ClipboardIcon size={22} />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--gray-400)' }}>Busca un paciente para ver su historia clínica.</p>
                </div>
            )}

            {mascota && (
                <>
                    {!actuales && <p className="py-6 text-center text-sm" style={{ color: 'var(--gray-400)' }}>Cargando historia clínica...</p>}
                    {actuales?.error && (
                        <p className="py-6 text-center text-sm" style={{ color: '#EF4444' }} role="alert">
                            {actuales.error} <button onClick={recargar} className="font-semibold underline" style={{ color: 'var(--primary)' }}>Reintentar</button>
                        </p>
                    )}
                    {actuales?.consultas && (
                        <Tarjeta titulo={`Consultas (${actuales.consultas.length})`}>
                            {actuales.consultas.length === 0 && <Vacio texto={`${mascota.nombre} aún no tiene consultas registradas.`} />}
                            {actuales.consultas.map(c => (
                                <button key={c.id} onClick={() => setDetalle(c.id)} className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-gray-50">
                                    <div className="w-24 flex-shrink-0 text-xs font-semibold" style={{ color: 'var(--primary)' }}>{formatearDiaDe(c.createdAt)}</div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-medium" style={{ color: 'var(--dark)' }}>{c.motivo}</div>
                                        <div className="truncate text-xs" style={{ color: 'var(--gray-500)' }}>{c.diagnostico ? `Diagnóstico: ${c.diagnostico}` : 'Sin diagnóstico aún'}</div>
                                    </div>
                                    <EstadoConsultaBadge estado={c.estado} />
                                    <span style={{ color: 'var(--gray-400)' }}><ChevronRightIcon /></span>
                                </button>
                            ))}
                        </Tarjeta>
                    )}
                    {actuales?.vacunas && (
                        <Tarjeta titulo={`Carné de vacunación (${actuales.vacunas.length})`}>
                            {actuales.vacunas.length === 0 && <Vacio texto="Sin vacunas registradas." />}
                            {actuales.vacunas.map(v => (
                                <div key={v.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3">
                                    <div className="w-24 flex-shrink-0 text-xs font-semibold" style={{ color: 'var(--secondary)' }}>{formatearFecha(v.fechaAplicacion)}</div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium" style={{ color: 'var(--dark)' }}>{v.nombre}</div>
                                        <div className="text-xs" style={{ color: 'var(--gray-500)' }}>{v.lote ? `Lote ${v.lote}` : 'Sin lote'}{v.notas ? ` · ${v.notas}` : ''}</div>
                                    </div>
                                    {v.proximaDosis && <span className="text-xs" style={{ color: 'var(--gray-500)' }}>Próxima: {formatearFecha(v.proximaDosis)}</span>}
                                </div>
                            ))}
                        </Tarjeta>
                    )}
                </>
            )}

            {mascota && nueva !== false && (
                <ConsultaFormModal
                    mascotaId={mascota.id}
                    mascotaNombre={mascota.nombre}
                    cita={nueva ?? undefined}
                    onClose={() => setNueva(false)}
                    onSaved={c => { setNueva(false); onAviso(`Consulta de ${mascota.nombre} abierta.`); recargar(); setDetalle(c.id) }}
                />
            )}
            {mascota && detalle && (
                <ConsultaDetalleModal
                    consultaId={detalle}
                    mascotaNombre={mascota.nombre}
                    usuarioId={usuario?.id}
                    esVeterinario={esVeterinario}
                    onClose={() => setDetalle(null)}
                    onChanged={mensaje => { onAviso(mensaje); recargar() }}
                />
            )}
            {mascota && vacunando && (
                <VacunaFormModal
                    mascotaId={mascota.id}
                    mascotaNombre={mascota.nombre}
                    onClose={() => setVacunando(false)}
                    onSaved={v => { setVacunando(false); onAviso(`Vacuna ${v.nombre} registrada para ${mascota.nombre}.`); recargar() }}
                />
            )}
        </div>
    )
}

/* ---------- Bandeja de resúmenes IA ---------- */

function Resumenes({ onAviso }: { onAviso: (texto: string) => void }) {
    const { esVeterinario } = useSesion()
    const [estado, setEstado] = useState<EstadoResumen>('BORRADOR')
    const [version, setVersion] = useState(0)
    const [datos, setDatos] = useState<{ clave: string; resumenes?: ResumenResponse[]; mascotas?: Record<string, string>; error?: string } | null>(null)
    const [abierto, setAbierto] = useState<ResumenResponse | null>(null)

    const clave = `${estado}|${version}`
    useEffect(() => {
        let vigente = true
        historiasService.resumenes(estado)
            .then(async resumenes => {
                // El resumen solo trae la consulta: de ella sale la mascota.
                const consultas = await Promise.allSettled(resumenes.map(r => historiasService.consulta(r.consultaId)))
                const mascotas: Record<string, string> = {}
                consultas.forEach((c, i) => { if (c.status === 'fulfilled') mascotas[resumenes[i].consultaId] = c.value.mascotaId })
                if (vigente) setDatos({ clave, resumenes, mascotas })
            })
            .catch(e => { if (vigente) setDatos({ clave, error: mensajeDeError(e, 'No se pudieron cargar los resúmenes.') }) })
        return () => { vigente = false }
    }, [estado, clave])

    const actuales = datos?.clave === clave ? datos : null
    const nombres = useNombresMascotas(Object.values(actuales?.mascotas ?? {}))
    const nombreDe = (r: ResumenResponse) => {
        const id = actuales?.mascotas?.[r.consultaId]
        return (id && nombres[id]) || 'Mascota'
    }

    return (
        <Tarjeta
            titulo="Resúmenes para los dueños"
            accion={
                <div className="flex gap-1">
                    {(['BORRADOR', 'APROBADO', 'ENVIADO'] as const).map(e => (
                        <button
                            key={e}
                            onClick={() => setEstado(e)}
                            className="rounded-full px-3 py-1 text-xs font-semibold"
                            style={estado === e ? { background: ESTADO_RESUMEN[e].fondo, color: ESTADO_RESUMEN[e].color } : { color: 'var(--gray-500)' }}
                        >
                            {ESTADO_RESUMEN[e].texto}
                        </button>
                    ))}
                </div>
            }
        >
            {!actuales && <Vacio texto="Cargando..." />}
            {actuales?.error && <p className="px-5 py-8 text-center text-sm" style={{ color: '#EF4444' }} role="alert">{actuales.error}</p>}
            {actuales?.resumenes?.length === 0 && (
                <Vacio texto={estado === 'BORRADOR' ? 'No hay resúmenes por revisar. Se crean al cerrar una consulta.' : 'No hay resúmenes en este estado.'} />
            )}
            {actuales?.resumenes?.map(r => (
                <button key={r.id} onClick={() => setAbierto(r)} className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-gray-50">
                    <span style={{ color: 'var(--primary)' }}><SparklesIcon size={16} /></span>
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold" style={{ color: 'var(--dark)' }}>{nombreDe(r)}</div>
                        <div className="text-xs" style={{ color: 'var(--gray-500)' }}>
                            Generado el {formatearFechaHora(r.createdAt)}{r.enviadoEn ? ` · enviado el ${formatearFechaHora(r.enviadoEn)}` : ''}
                        </div>
                    </div>
                    <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: ESTADO_RESUMEN[r.estado].fondo, color: ESTADO_RESUMEN[r.estado].color }}>
                        {ESTADO_RESUMEN[r.estado].texto}
                    </span>
                    <span style={{ color: 'var(--gray-400)' }}><ChevronRightIcon /></span>
                </button>
            ))}

            {abierto && (
                <ResumenModal
                    resumen={abierto}
                    mascotaNombre={nombreDe(abierto)}
                    esVeterinario={esVeterinario}
                    onClose={() => setAbierto(null)}
                    onChanged={(_, mensaje) => { setAbierto(null); onAviso(mensaje); setVersion(v => v + 1) }}
                />
            )}
        </Tarjeta>
    )
}

/* ---------- Seguimiento: controles y refuerzos próximos ---------- */

function Seguimiento() {
    const [dias, setDias] = useState(30)
    const [datos, setDatos] = useState<{ dias: number; items?: SeguimientoItem[]; error?: string } | null>(null)

    useEffect(() => {
        let vigente = true
        historiasService.seguimiento(dias)
            .then(items => { if (vigente) setDatos({ dias, items: [...items].sort((a, b) => a.fecha.localeCompare(b.fecha)) }) })
            .catch(e => { if (vigente) setDatos({ dias, error: mensajeDeError(e, 'No se pudo cargar el seguimiento.') }) })
        return () => { vigente = false }
    }, [dias])

    const actuales = datos?.dias === dias ? datos : null
    const nombres = useNombresMascotas(actuales?.items?.map(i => i.mascotaId) ?? [])

    return (
        <Tarjeta
            titulo="Controles y refuerzos pendientes"
            accion={
                <select value={dias} onChange={e => setDias(Number(e.target.value))} aria-label="Ventana de días" className="rounded-lg border px-2 py-1 text-xs" style={{ borderColor: 'var(--gray-200)', color: 'var(--dark)' }}>
                    {[7, 15, 30, 60, 90].map(d => <option key={d} value={d}>Próximos {d} días</option>)}
                </select>
            }
        >
            {!actuales && <Vacio texto="Cargando..." />}
            {actuales?.error && <p className="px-5 py-8 text-center text-sm" style={{ color: '#EF4444' }} role="alert">{actuales.error}</p>}
            {actuales?.items?.length === 0 && <Vacio texto="No hay controles ni refuerzos pendientes en este periodo." />}
            {actuales?.items?.map(i => (
                <div key={`${i.tipo}-${i.referenciaId}`} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-24 flex-shrink-0 text-xs font-semibold" style={{ color: 'var(--primary)' }}>{formatearFecha(i.fecha)}</div>
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold" style={{ color: 'var(--dark)' }}>
                            {nombres[i.mascotaId] === undefined ? '…' : nombres[i.mascotaId] ?? 'Mascota'}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--gray-500)' }}>{i.descripcion}</div>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" style={i.tipo === 'CONTROL' ? { background: 'var(--primary-light)', color: 'var(--primary)' } : { background: 'var(--secondary-light)', color: '#065F46' }}>
                        {i.tipo === 'CONTROL' ? <><CalendarIcon size={12} /> Control</> : 'Refuerzo de vacuna'}
                    </span>
                </div>
            ))}
        </Tarjeta>
    )
}

/* ---------- Piezas comunes ---------- */

function Tarjeta({ titulo, accion, children }: { titulo: string; accion?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--white)', border: '1px solid var(--gray-200)' }}>
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <h2 className="text-sm font-semibold" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>{titulo}</h2>
                {accion}
            </div>
            <div className="divide-y">{children}</div>
        </div>
    )
}

function Vacio({ texto }: { texto: string }) {
    return <p className="px-5 py-8 text-center text-sm" style={{ color: 'var(--gray-400)' }}>{texto}</p>
}

