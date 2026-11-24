import { useCallback, useEffect, useState, type FormEvent } from 'react'
import historiasService, { type ConsultaResponse, type ResumenResponse } from '../../api/historiasService'
import { estiloInput } from '../../shared/estilos'
import { formatearFecha, formatearFechaHora } from '../../shared/fechas'
import { Campo } from '../../shared/Formulario'
import { ClipboardIcon, EditIcon, LockIcon, SparklesIcon } from '../../shared/icons'
import Modal, { BotonPrimario, BotonSecundario, Confirmacion, ErrorServidor } from '../../shared/Modal'
import { mensajeDeError } from '../../shared/validaciones'
import ConsultaFormModal from './ConsultaFormModal'
import { ESTADO_RESUMEN } from '../../shared/estados'
import ResumenModal from './ResumenModal'

interface Props {
    consultaId: string
    mascotaNombre: string
    usuarioId?: string
    esVeterinario: boolean
    onClose: () => void
    /** Algo cambió (para recargar la lista de quien abrió el detalle). */
    onChanged: (mensaje: string) => void
}

export default function ConsultaDetalleModal({ consultaId, mascotaNombre, usuarioId, esVeterinario, onClose, onChanged }: Props) {
    const [consulta, setConsulta] = useState<ConsultaResponse | null>(null)
    const [error, setError] = useState('')
    const [editando, setEditando] = useState(false)
    const [confirmarCierre, setConfirmarCierre] = useState(false)
    const [cerrando, setCerrando] = useState(false)
    const [resumen, setResumen] = useState<ResumenResponse | null | undefined>(undefined)
    const [viendoResumen, setViendoResumen] = useState(false)
    const [generando, setGenerando] = useState(false)
    const [aviso, setAviso] = useState('')

    const cargar = useCallback(() => {
        historiasService.consulta(consultaId)
            .then(c => {
                setConsulta(c)
                if (c.estado === 'CERRADA') {
                    historiasService.resumenDeConsulta(c.id).then(setResumen).catch(() => setResumen(null))
                }
            })
            .catch(e => setError(mensajeDeError(e, 'No se pudo cargar la consulta.')))
    }, [consultaId])

    useEffect(cargar, [cargar])

    const esMia = consulta?.veterinarioId === usuarioId
    const abierta = consulta?.estado === 'ABIERTA'

    async function cerrar() {
        if (!consulta) return
        setCerrando(true)
        try {
            await historiasService.cerrarConsulta(consulta.id)
            setAviso('Consulta cerrada. La IA está redactando el resumen para el dueño; aparecerá en "Resúmenes IA" para que lo revises.')
            onChanged(`Consulta de ${mascotaNombre} cerrada.`)
            cargar()
        } catch (e) {
            setError(mensajeDeError(e, 'No se pudo cerrar la consulta.'))
        } finally {
            setCerrando(false)
            setConfirmarCierre(false)
        }
    }

    async function generarResumen() {
        if (!consulta) return
        setGenerando(true)
        setError('')
        try {
            setResumen(await historiasService.generarResumen(consulta.id))
            setViendoResumen(true)
        } catch (e) {
            setError(mensajeDeError(e, 'No se pudo generar el resumen.'))
        } finally {
            setGenerando(false)
        }
    }

    return (
        <Modal
            titulo={`Consulta de ${mascotaNombre}`}
            subtitulo={consulta ? `${formatearFechaHora(consulta.createdAt)}${consulta.cerradaEn ? ` · cerrada el ${formatearFechaHora(consulta.cerradaEn)}` : ''}` : 'Cargando...'}
            icono={<ClipboardIcon />}
            ancho="lg"
            onClose={onClose}
            pie={
                <>
                    <BotonSecundario onClick={onClose}>Cerrar ventana</BotonSecundario>
                    {abierta && esMia && (
                        <>
                            <BotonSecundario onClick={() => setEditando(true)}><span className="flex items-center gap-1.5"><EditIcon size={14} /> Editar</span></BotonSecundario>
                            <BotonPrimario onClick={() => setConfirmarCierre(true)}><LockIcon size={14} /> Cerrar consulta</BotonPrimario>
                        </>
                    )}
                </>
            }
        >
            {!consulta && !error && <p className="py-8 text-center text-sm" style={{ color: 'var(--gray-400)' }}>Cargando...</p>}
            <div className="space-y-5">
                <ErrorServidor mensaje={error} />
                {aviso && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700" role="status">{aviso}</div>}

                {consulta && (
                    <>
                        <div className="flex flex-wrap items-center gap-2">
                            <EstadoConsultaBadge estado={consulta.estado} />
                            {abierta && !esMia && <span className="text-xs" style={{ color: 'var(--gray-500)' }}>Solo el veterinario que la abrió puede editarla.</span>}
                            {!abierta && <span className="text-xs" style={{ color: 'var(--gray-500)' }}>La historia clínica no se edita: las correcciones se agregan como enmiendas.</span>}
                        </div>

                        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
                            <Dato titulo="Motivo" valor={consulta.motivo} ancho />
                            <Dato titulo="Peso" valor={consulta.pesoKg != null ? `${consulta.pesoKg} kg` : null} />
                            <Dato titulo="Temperatura" valor={consulta.temperaturaC != null ? `${consulta.temperaturaC} °C` : null} />
                            <Dato titulo="Próximo control" valor={consulta.proximoControl ? formatearFecha(consulta.proximoControl) : null} />
                            <Dato titulo="Síntomas" valor={consulta.sintomas} ancho />
                            <Dato titulo="Examen físico" valor={consulta.examenFisico} ancho />
                            <Dato titulo="Diagnóstico" valor={consulta.diagnostico} ancho />
                            <Dato titulo="Tratamiento" valor={consulta.tratamiento} ancho />
                            <Dato titulo="Indicaciones" valor={consulta.indicaciones} ancho />
                        </dl>

                        {!abierta && (
                            <>
                                <section className="space-y-3">
                                    <h3 className="text-sm font-semibold" style={{ color: 'var(--dark)' }}>Enmiendas ({consulta.enmiendas.length})</h3>
                                    {consulta.enmiendas.map(e => (
                                        <div key={e.id} className="rounded-lg border px-4 py-3" style={{ borderColor: 'var(--gray-200)' }}>
                                            <div className="text-xs" style={{ color: 'var(--gray-500)' }}>
                                                {formatearFechaHora(e.createdAt)} · {e.autorId === usuarioId ? 'tú' : 'otro veterinario'} · <strong>{e.motivo}</strong>
                                            </div>
                                            <p className="mt-1 whitespace-pre-wrap text-sm" style={{ color: 'var(--dark)' }}>{e.contenido}</p>
                                        </div>
                                    ))}
                                    {esVeterinario && <FormEnmienda consultaId={consulta.id} onSaved={() => { onChanged('Enmienda agregada.'); cargar() }} />}
                                </section>

                                <section className="flex flex-col gap-3 rounded-xl px-4 py-4 sm:flex-row sm:items-center sm:justify-between" style={{ background: 'var(--gray-100)' }}>
                                    <div className="flex items-center gap-3">
                                        <span style={{ color: 'var(--primary)' }}><SparklesIcon size={18} /></span>
                                        <div>
                                            <div className="text-sm font-semibold" style={{ color: 'var(--dark)' }}>Resumen para el dueño</div>
                                            <div className="text-xs" style={{ color: 'var(--gray-500)' }}>
                                                {resumen === undefined ? 'Consultando...' : resumen ? `Estado: ${ESTADO_RESUMEN[resumen.estado].texto}` : 'Aún no hay resumen (la IA puede tardar unos segundos tras el cierre).'}
                                            </div>
                                        </div>
                                    </div>
                                    {resumen ? (
                                        <BotonPrimario onClick={() => setViendoResumen(true)}>Ver resumen</BotonPrimario>
                                    ) : resumen === null && (
                                        <div className="flex gap-2">
                                            <BotonSecundario onClick={cargar}>Actualizar</BotonSecundario>
                                            {esMia && <BotonPrimario onClick={generarResumen} disabled={generando}>{generando ? 'Generando...' : 'Generar ahora'}</BotonPrimario>}
                                        </div>
                                    )}
                                </section>
                            </>
                        )}
                    </>
                )}
            </div>

            {editando && consulta && (
                <ConsultaFormModal
                    mascotaId={consulta.mascotaId}
                    mascotaNombre={mascotaNombre}
                    consulta={consulta}
                    onClose={() => setEditando(false)}
                    onSaved={() => { setEditando(false); onChanged('Consulta actualizada.'); cargar() }}
                />
            )}
            {confirmarCierre && (
                <Confirmacion
                    titulo="¿Cerrar la consulta?"
                    mensaje="Quedará inmutable en la historia clínica (las correcciones posteriores serán enmiendas) y la IA redactará el resumen para el dueño, que deberás revisar y aprobar."
                    textoConfirmar="Cerrar consulta"
                    ocupado={cerrando}
                    onConfirmar={cerrar}
                    onCancelar={() => setConfirmarCierre(false)}
                />
            )}
            {viendoResumen && resumen && (
                <ResumenModal
                    resumen={resumen}
                    mascotaNombre={mascotaNombre}
                    esVeterinario={esVeterinario}
                    onClose={() => setViendoResumen(false)}
                    onChanged={(r, mensaje) => { setResumen(r); setViendoResumen(false); setAviso(mensaje); onChanged(mensaje) }}
                />
            )}
        </Modal>
    )
}

export function EstadoConsultaBadge({ estado }: { estado: ConsultaResponse['estado'] }) {
    const abierta = estado === 'ABIERTA'
    return (
        <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={abierta ? { background: '#FEF3C7', color: '#92400E' } : { background: 'var(--gray-100)', color: 'var(--gray-500)' }}>
            {abierta ? 'Abierta' : 'Cerrada'}
        </span>
    )
}

function Dato({ titulo, valor, ancho }: { titulo: string; valor: string | null; ancho?: boolean }) {
    return (
        <div className={ancho ? 'sm:col-span-3' : undefined}>
            <dt className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gray-400)' }}>{titulo}</dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-sm" style={{ color: valor ? 'var(--dark)' : 'var(--gray-400)' }}>{valor || '—'}</dd>
        </div>
    )
}

function FormEnmienda({ consultaId, onSaved }: { consultaId: string; onSaved: () => void }) {
    const [abierto, setAbierto] = useState(false)
    const [motivo, setMotivo] = useState('')
    const [contenido, setContenido] = useState('')
    const [errores, setErrores] = useState<{ motivo?: string; contenido?: string }>({})
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    if (!abierto) {
        return (
            <button type="button" onClick={() => setAbierto(true)} className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                + Agregar enmienda
            </button>
        )
    }

    async function guardar(event: FormEvent) {
        event.preventDefault()
        const e: typeof errores = {}
        if (!motivo.trim()) e.motivo = 'Explica por qué se corrige'
        if (!contenido.trim()) e.contenido = 'Escribe la corrección'
        setErrores(e)
        if (e.motivo || e.contenido) return
        setGuardando(true)
        setError('')
        try {
            await historiasService.enmendar(consultaId, motivo.trim(), contenido.trim())
            setAbierto(false)
            setMotivo('')
            setContenido('')
            onSaved()
        } catch (err) {
            setError(mensajeDeError(err, 'No se pudo guardar la enmienda.'))
        } finally {
            setGuardando(false)
        }
    }

    return (
        <form onSubmit={guardar} noValidate className="space-y-3 rounded-lg border p-4" style={{ borderColor: 'var(--gray-200)' }}>
            <ErrorServidor mensaje={error} />
            <Campo label="Motivo de la enmienda" error={errores.motivo} requerido>
                {id => <input id={id} maxLength={500} value={motivo} onChange={e => setMotivo(e.target.value)} style={estiloInput(errores.motivo)} />}
            </Campo>
            <Campo label="Corrección o información agregada" error={errores.contenido} requerido>
                {id => <textarea id={id} rows={3} maxLength={10000} value={contenido} onChange={e => setContenido(e.target.value)} style={{ ...estiloInput(errores.contenido), resize: 'vertical' }} />}
            </Campo>
            <div className="flex justify-end gap-2">
                <BotonSecundario onClick={() => setAbierto(false)} disabled={guardando}>Cancelar</BotonSecundario>
                <BotonPrimario type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar enmienda'}</BotonPrimario>
            </div>
        </form>
    )
}

