import { useState } from 'react'
import historiasService, { type ContenidoResumen, type ResumenResponse } from '../../api/historiasService'
import { estiloInput } from '../../shared/estilos'
import { ESTADO_RESUMEN } from '../../shared/estados'
import { formatearFechaHora } from '../../shared/fechas'
import { Campo } from '../../shared/Formulario'
import { CheckIcon, SendIcon, SparklesIcon } from '../../shared/icons'
import Modal, { BotonPrimario, BotonSecundario, Confirmacion, ErrorServidor } from '../../shared/Modal'
import { mensajeDeError } from '../../shared/validaciones'


const SECCIONES: { campo: keyof ContenidoResumen; label: string }[] = [
    { campo: 'hallazgos', label: 'Qué se encontró' },
    { campo: 'tratamiento', label: 'Tratamiento' },
    { campo: 'cuidadosEnCasa', label: 'Cuidados en casa' },
    { campo: 'proximaVisita', label: 'Cuándo volver' },
]

const VACIO: ContenidoResumen = { hallazgos: '', tratamiento: '', cuidadosEnCasa: '', proximaVisita: '' }

interface Props {
    resumen: ResumenResponse
    mascotaNombre: string
    esVeterinario: boolean
    onClose: () => void
    onChanged: (resumen: ResumenResponse, mensaje: string) => void
}

/**
 * Revisión del resumen que redactó la IA para el dueño. Nada sale sin que el veterinario lo apruebe: primero se
 * aprueba (con sus correcciones) y solo entonces se puede enviar. El backend y la base de datos lo exigen igual.
 */
export default function ResumenModal({ resumen, mascotaNombre, esVeterinario, onClose, onChanged }: Props) {
    const [contenido, setContenido] = useState<ContenidoResumen>(resumen.contenidoFinal ?? resumen.generado ?? VACIO)
    const [errores, setErrores] = useState<Partial<Record<keyof ContenidoResumen, string>>>({})
    const [ocupado, setOcupado] = useState<'' | 'guardar' | 'aprobar' | 'enviar'>('')
    const [confirmarEnvio, setConfirmarEnvio] = useState(false)
    const [errorServidor, setErrorServidor] = useState('')
    const [verOriginal, setVerOriginal] = useState(false)

    const editable = esVeterinario && resumen.estado === 'BORRADOR'
    const estado = ESTADO_RESUMEN[resumen.estado]

    function validar() {
        const e: typeof errores = {}
        for (const { campo, label } of SECCIONES) {
            if (!contenido[campo].trim()) e[campo] = `La sección "${label}" es obligatoria`
            else if (contenido[campo].length > 4000) e[campo] = 'Máximo 4000 caracteres'
        }
        setErrores(e)
        return Object.keys(e).length === 0
    }

    async function ejecutar(accion: 'guardar' | 'aprobar' | 'enviar') {
        if (accion !== 'enviar' && !validar()) return
        setOcupado(accion)
        setErrorServidor('')
        try {
            const limpio = Object.fromEntries(SECCIONES.map(({ campo }) => [campo, contenido[campo].trim()])) as unknown as ContenidoResumen
            if (accion === 'guardar') onChanged(await historiasService.editarResumen(resumen.id, limpio), 'Borrador guardado.')
            if (accion === 'aprobar') onChanged(await historiasService.aprobarResumen(resumen.id, limpio), 'Resumen aprobado. Ya puedes enviarlo al dueño.')
            if (accion === 'enviar') onChanged(await historiasService.enviarResumen(resumen.id), `Resumen de ${mascotaNombre} enviado al dueño.`)
        } catch (error) {
            setErrorServidor(mensajeDeError(error, 'No se pudo completar la acción.'))
        } finally {
            setOcupado('')
            setConfirmarEnvio(false)
        }
    }

    return (
        <Modal
            titulo={`Resumen para el dueño de ${mascotaNombre}`}
            subtitulo={`Redactado por IA${resumen.modelo ? ` (${resumen.modelo}, prompt ${resumen.versionPrompt})` : ''} · ${formatearFechaHora(resumen.createdAt)}`}
            icono={<SparklesIcon size={18} />}
            ancho="lg"
            bloqueado={Boolean(ocupado)}
            onClose={onClose}
            pie={
                <>
                    <BotonSecundario onClick={onClose} disabled={Boolean(ocupado)}>Cerrar</BotonSecundario>
                    {editable && (
                        <>
                            <BotonSecundario onClick={() => ejecutar('guardar')} disabled={Boolean(ocupado)}>
                                {ocupado === 'guardar' ? 'Guardando...' : 'Guardar borrador'}
                            </BotonSecundario>
                            <BotonPrimario onClick={() => ejecutar('aprobar')} disabled={Boolean(ocupado)}>
                                <CheckIcon size={14} /> {ocupado === 'aprobar' ? 'Aprobando...' : 'Aprobar'}
                            </BotonPrimario>
                        </>
                    )}
                    {esVeterinario && resumen.estado === 'APROBADO' && (
                        <BotonPrimario onClick={() => setConfirmarEnvio(true)} disabled={Boolean(ocupado)} color="var(--secondary)">
                            <SendIcon size={14} /> Enviar al dueño
                        </BotonPrimario>
                    )}
                </>
            }
        >
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: estado.fondo, color: estado.color }}>{estado.texto}</span>
                    {resumen.aprobadoEn && <span className="text-xs" style={{ color: 'var(--gray-500)' }}>Aprobado el {formatearFechaHora(resumen.aprobadoEn)}</span>}
                    {resumen.enviadoEn && <span className="text-xs" style={{ color: 'var(--gray-500)' }}>· Enviado el {formatearFechaHora(resumen.enviadoEn)}</span>}
                </div>

                {resumen.estado === 'BORRADOR' && (
                    <p className="rounded-lg px-4 py-3 text-xs" style={{ background: '#FFFBEB', color: '#92400E' }}>
                        Revisa y corrige el texto antes de aprobarlo. El dueño solo recibe la versión que apruebes; el texto original de la IA queda guardado para auditoría.
                    </p>
                )}
                {!esVeterinario && resumen.estado !== 'ENVIADO' && (
                    <p className="text-xs" style={{ color: 'var(--gray-500)' }}>Solo el veterinario puede editar, aprobar y enviar el resumen.</p>
                )}
                <ErrorServidor mensaje={errorServidor} />

                {SECCIONES.map(({ campo, label }) => (
                    <Campo key={campo} label={label} error={errores[campo]}>
                        {id => editable ? (
                            <textarea
                                id={id}
                                rows={3}
                                maxLength={4000}
                                value={contenido[campo]}
                                onChange={e => { setContenido(prev => ({ ...prev, [campo]: e.target.value })); setErrores(prev => ({ ...prev, [campo]: undefined })) }}
                                style={{ ...estiloInput(errores[campo]), resize: 'vertical' }}
                            />
                        ) : (
                            <p id={id} className="whitespace-pre-wrap rounded-lg px-3.5 py-2.5 text-sm" style={{ background: 'var(--gray-100)', color: 'var(--dark)' }}>
                                {contenido[campo] || '—'}
                            </p>
                        )}
                    </Campo>
                ))}

                {resumen.generado && resumen.contenidoFinal && (
                    <div>
                        <button type="button" onClick={() => setVerOriginal(v => !v)} className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                            {verOriginal ? 'Ocultar' : 'Ver'} el texto original de la IA
                        </button>
                        {verOriginal && (
                            <div className="mt-2 space-y-2 rounded-lg border p-3 text-xs" style={{ borderColor: 'var(--gray-200)', color: 'var(--gray-500)' }}>
                                {SECCIONES.map(({ campo, label }) => (
                                    <p key={campo} className="whitespace-pre-wrap"><strong>{label}:</strong> {resumen.generado?.[campo]}</p>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {confirmarEnvio && (
                <Confirmacion
                    titulo="¿Enviar el resumen al dueño?"
                    mensaje="Se enviará por correo la versión aprobada. Después del envío no se puede modificar."
                    textoConfirmar="Enviar"
                    ocupado={ocupado === 'enviar'}
                    onConfirmar={() => ejecutar('enviar')}
                    onCancelar={() => setConfirmarEnvio(false)}
                />
            )}
        </Modal>
    )
}
