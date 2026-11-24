import { useEffect, useState } from 'react'
import citasService, { type CitaResponse } from '../../api/citasService'
import historiasService, { type ResumenResponse } from '../../api/historiasService'
import mascotasService from '../../api/mascotasService'
import { formatearFechaHora, formatearHora, rangoDelDia } from '../../shared/fechas'
import { CalendarIcon, ClipboardIcon, PawIcon, ChevronRightIcon, SparklesIcon } from '../../shared/icons'
import { useNombresMascotas } from '../../shared/useNombresMascotas'
import { useSesion } from '../../shared/useSesion'
import { hoyISO } from '../../shared/validaciones'
import { ESTADO_CITA, nombreVeterinario } from '../../shared/estados'

interface Props {
    onOpenAgenda: () => void
    onOpenResumenes: () => void
    onOpenMascotas: () => void
}

type Carga<T> = T | undefined | null // undefined: cargando; null: falló

export default function Dashboard({ onOpenAgenda, onOpenResumenes, onOpenMascotas }: Props) {
    const { usuario } = useSesion()
    const [citas, setCitas] = useState<Carga<CitaResponse[]>>()
    const [resumenes, setResumenes] = useState<Carga<ResumenResponse[]>>()
    const [mascotasDeResumen, setMascotasDeResumen] = useState<Record<string, string>>({})
    const [totalMascotas, setTotalMascotas] = useState<Carga<number>>()

    useEffect(() => {
        let vigente = true
        citasService.listar(rangoDelDia(hoyISO()))
            .then(data => { if (vigente) setCitas([...data].sort((a, b) => a.inicio.localeCompare(b.inicio))) })
            .catch(() => { if (vigente) setCitas(null) })
        historiasService.resumenes('BORRADOR')
            .then(async data => {
                if (!vigente) return
                setResumenes(data)
                const primeros = data.slice(0, 5)
                const consultas = await Promise.allSettled(primeros.map(r => historiasService.consulta(r.consultaId)))
                const mapa: Record<string, string> = {}
                consultas.forEach((c, i) => { if (c.status === 'fulfilled') mapa[primeros[i].consultaId] = c.value.mascotaId })
                if (vigente) setMascotasDeResumen(mapa)
            })
            .catch(() => { if (vigente) setResumenes(null) })
        mascotasService.listar({ tamano: 1 })
            .then(p => { if (vigente) setTotalMascotas(p.totalElementos) })
            .catch(() => { if (vigente) setTotalMascotas(null) })
        return () => { vigente = false }
    }, [])

    const nombres = useNombresMascotas(Object.values(mascotasDeResumen))
    const activasHoy = citas?.filter(c => c.estado === 'PROGRAMADA' || c.estado === 'CONFIRMADA')
    const valor = (v: Carga<number>) => (v === undefined ? '…' : v === null ? '—' : String(v))

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-xl font-bold mb-0.5" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                    Inicio
                </h1>
                <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
                    ¡Hola{usuario?.nombre ? `, ${usuario.nombre}` : ''}! Aquí tienes un resumen de tu día.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={<CalendarIcon size={20} />} iconBg="var(--primary-light)" iconColor="var(--primary)"
                    value={valor(activasHoy?.length ?? (citas === null ? null : undefined))} label="Citas pendientes hoy" onClick={onOpenAgenda} />
                <StatCard icon={<ClipboardIcon size={20} />} iconBg="#FEF3C7" iconColor="var(--accent)"
                    value={valor(resumenes?.length ?? (resumenes === null ? null : undefined))} label="Resúmenes por revisar" onClick={onOpenResumenes} />
                <StatCard icon={<PawIcon size={20} />} iconBg="var(--secondary-light)" iconColor="var(--secondary)"
                    value={valor(totalMascotas)} label="Mascotas registradas" onClick={onOpenMascotas} />
            </div>

            <Seccion titulo="Resúmenes por revisar" accion="Ver todos" onAccion={onOpenResumenes}>
                {resumenes === undefined && <Vacio texto="Cargando..." />}
                {resumenes === null && <Vacio texto="No se pudieron cargar los resúmenes." />}
                {resumenes?.length === 0 && <Vacio texto="Nada pendiente. Los resúmenes aparecen aquí al cerrar una consulta." />}
                {resumenes?.slice(0, 5).map(r => {
                    const mascotaId = mascotasDeResumen[r.consultaId]
                    return (
                        <button key={r.id} onClick={onOpenResumenes} className="w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-gray-50">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#FEF3C7', color: '#92400E' }}>
                                <SparklesIcon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold" style={{ color: 'var(--dark)' }}>
                                    {(mascotaId && nombres[mascotaId]) || 'Mascota'}
                                </div>
                                <div className="text-xs mt-0.5" style={{ color: 'var(--gray-500)' }}>Generado el {formatearFechaHora(r.createdAt)}</div>
                            </div>
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: '#FEF3C7', color: '#92400E' }}>
                                Pendiente revisión
                            </span>
                            <span style={{ color: 'var(--gray-400)' }}><ChevronRightIcon /></span>
                        </button>
                    )
                })}
            </Seccion>

            <Seccion titulo="Agenda del día" accion="Ver agenda completa" onAccion={onOpenAgenda}>
                {citas === undefined && <Vacio texto="Cargando..." />}
                {citas === null && <Vacio texto="No se pudo cargar la agenda." />}
                {citas?.length === 0 && <Vacio texto="No hay citas para hoy." />}
                {citas?.map(c => (
                    <div key={c.id} className="flex items-center gap-4 px-5 py-3">
                        <div className="text-xs font-semibold w-12 flex-shrink-0" style={{ color: 'var(--primary)' }}>{formatearHora(c.inicio)}</div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium" style={{ color: 'var(--dark)' }}>{c.mascotaNombre}</div>
                            <div className="truncate text-xs" style={{ color: 'var(--gray-500)' }}>{nombreVeterinario(c.veterinarioNombre)} · {c.motivo}</div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: ESTADO_CITA[c.estado].fondo, color: ESTADO_CITA[c.estado].color }}>
                            {ESTADO_CITA[c.estado].texto}
                        </span>
                    </div>
                ))}
            </Seccion>
        </div>
    )
}

function Seccion({ titulo, accion, onAccion, children }: { titulo: string; accion: string; onAccion: () => void; children: React.ReactNode }) {
    return (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--white)', border: '1px solid var(--gray-200)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <h2 className="font-semibold text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>{titulo}</h2>
                <button onClick={onAccion} className="text-xs font-medium" style={{ color: 'var(--primary)' }}>{accion}</button>
            </div>
            <div className="divide-y">{children}</div>
        </div>
    )
}

function Vacio({ texto }: { texto: string }) {
    return <p className="px-5 py-6 text-center text-sm" style={{ color: 'var(--gray-400)' }}>{texto}</p>
}

function StatCard({ icon, iconBg, iconColor, value, label, onClick }: {
    icon: React.ReactNode
    iconBg: string
    iconColor: string
    value: string
    label: string
    onClick?: () => void
}) {
    const contenido = (
        <>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg, color: iconColor }}>
                {icon}
            </div>
            <div>
                <div className="text-2xl font-bold leading-none mb-1" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                    {value}
                </div>
                <div className="text-xs" style={{ color: 'var(--gray-500)' }}>{label}</div>
            </div>
        </>
    )
    const className = 'rounded-xl p-5 flex items-center gap-4 text-left'
    const style = { background: 'var(--white)', border: '1px solid var(--gray-200)' }

    if (onClick) {
        return (
            <button type="button" onClick={onClick} className={`${className} transition-shadow hover:shadow-md`} style={style}>
                {contenido}
            </button>
        )
    }

    return <div className={className} style={style}>{contenido}</div>
}
