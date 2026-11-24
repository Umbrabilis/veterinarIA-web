import { useState, type FormEvent } from 'react'
import historiasService, { type ConsultaResponse, type DatosClinicos } from '../../api/historiasService'
import { estiloInput } from '../../shared/estilos'
import { Campo } from '../../shared/Formulario'
import { ClipboardIcon } from '../../shared/icons'
import Modal, { BotonPrimario, BotonSecundario, ErrorServidor } from '../../shared/Modal'
import { hoyISO, mensajeDeError } from '../../shared/validaciones'

interface Props {
    mascotaId: string
    mascotaNombre: string
    /** Sin consulta: abrir una nueva. Con consulta (abierta): editar sus datos. */
    consulta?: ConsultaResponse
    /** Cita que se está atendiendo (queda ligada a la consulta). */
    cita?: { id: string; motivo: string }
    onClose: () => void
    onSaved: (consulta: ConsultaResponse) => void
}

type Campos = Record<keyof DatosClinicos, string>
type Errores = Partial<Record<keyof DatosClinicos, string>>

const LARGOS: { campo: keyof DatosClinicos; label: string; ayuda?: string; filas: number }[] = [
    { campo: 'sintomas', label: 'Síntomas', filas: 2 },
    { campo: 'examenFisico', label: 'Examen físico', filas: 2 },
    { campo: 'diagnostico', label: 'Diagnóstico', ayuda: 'Obligatorio para cerrar la consulta.', filas: 2 },
    { campo: 'tratamiento', label: 'Tratamiento', filas: 2 },
    { campo: 'indicaciones', label: 'Indicaciones para el dueño', filas: 2 },
]

function iniciales(consulta?: ConsultaResponse, cita?: Props['cita']): Campos {
    return {
        motivo: consulta?.motivo ?? cita?.motivo ?? '',
        sintomas: consulta?.sintomas ?? '',
        examenFisico: consulta?.examenFisico ?? '',
        pesoKg: consulta?.pesoKg != null ? String(consulta.pesoKg) : '',
        temperaturaC: consulta?.temperaturaC != null ? String(consulta.temperaturaC) : '',
        diagnostico: consulta?.diagnostico ?? '',
        tratamiento: consulta?.tratamiento ?? '',
        indicaciones: consulta?.indicaciones ?? '',
        proximoControl: consulta?.proximoControl ?? '',
    }
}

const numero = (valor: string) => Number(valor.trim().replace(',', '.'))

function validar(c: Campos): Errores {
    const e: Errores = {}
    if (!c.motivo.trim()) e.motivo = 'El motivo de consulta es obligatorio'
    else if (c.motivo.trim().length > 500) e.motivo = 'Máximo 500 caracteres'
    if (c.pesoKg.trim()) {
        const p = numero(c.pesoKg)
        if (!Number.isFinite(p) || p <= 0 || p >= 10000) e.pesoKg = 'Peso no válido'
        else if (!/^\d+([.,]\d{1,2})?$/.test(c.pesoKg.trim())) e.pesoKg = 'Máximo dos decimales'
    }
    if (c.temperaturaC.trim()) {
        const t = numero(c.temperaturaC)
        if (!Number.isFinite(t) || t < 25 || t > 45) e.temperaturaC = 'Entre 25 y 45 °C'
        else if (!/^\d+([.,]\d)?$/.test(c.temperaturaC.trim())) e.temperaturaC = 'Máximo un decimal'
    }
    if (c.proximoControl && c.proximoControl < hoyISO()) e.proximoControl = 'No puede estar en el pasado'
    return e
}

export default function ConsultaFormModal({ mascotaId, mascotaNombre, consulta, cita, onClose, onSaved }: Props) {
    const [campos, setCampos] = useState<Campos>(() => iniciales(consulta, cita))
    const [errores, setErrores] = useState<Errores>({})
    const [guardando, setGuardando] = useState(false)
    const [errorServidor, setErrorServidor] = useState('')

    function set(campo: keyof DatosClinicos, valor: string) {
        setCampos(prev => ({ ...prev, [campo]: valor }))
        setErrores(prev => ({ ...prev, [campo]: undefined }))
    }

    async function guardar(event: FormEvent) {
        event.preventDefault()
        const encontrados = validar(campos)
        setErrores(encontrados)
        if (Object.values(encontrados).some(Boolean)) return

        const texto = (v: string) => v.trim() || null
        const datos: DatosClinicos = {
            motivo: campos.motivo.trim(),
            sintomas: texto(campos.sintomas),
            examenFisico: texto(campos.examenFisico),
            pesoKg: campos.pesoKg.trim() ? numero(campos.pesoKg) : null,
            temperaturaC: campos.temperaturaC.trim() ? numero(campos.temperaturaC) : null,
            diagnostico: texto(campos.diagnostico),
            tratamiento: texto(campos.tratamiento),
            indicaciones: texto(campos.indicaciones),
            proximoControl: campos.proximoControl || null,
        }
        setGuardando(true)
        setErrorServidor('')
        try {
            const guardada = consulta
                ? await historiasService.actualizarConsulta(consulta.id, datos)
                : await historiasService.abrirConsulta(mascotaId, datos, cita?.id)
            onSaved(guardada)
        } catch (error) {
            setErrorServidor(mensajeDeError(error, 'No se pudo guardar la consulta. Intenta de nuevo.'))
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Modal
            titulo={consulta ? 'Editar consulta' : 'Nueva consulta'}
            subtitulo={`${mascotaNombre} · ${consulta ? 'La consulta sigue abierta: puedes editarla hasta cerrarla.' : 'Se guarda abierta; ciérrala cuando termines.'}`}
            icono={<ClipboardIcon />}
            bloqueado={guardando}
            onClose={onClose}
            pie={
                <>
                    <BotonSecundario onClick={onClose} disabled={guardando}>Cancelar</BotonSecundario>
                    <BotonPrimario type="submit" form="form-consulta" disabled={guardando}>
                        {guardando ? 'Guardando...' : consulta ? 'Guardar cambios' : 'Abrir consulta'}
                    </BotonPrimario>
                </>
            }
        >
            <form id="form-consulta" onSubmit={guardar} noValidate className="space-y-4">
                <ErrorServidor mensaje={errorServidor} />
                <Campo label="Motivo de consulta" error={errores.motivo} requerido>
                    {id => (
                        <input id={id} maxLength={500} value={campos.motivo} onChange={e => set('motivo', e.target.value)} style={estiloInput(errores.motivo)} />
                    )}
                </Campo>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Campo label="Peso (kg)" error={errores.pesoKg}>
                        {id => <input id={id} inputMode="decimal" placeholder="Ej. 12.5" value={campos.pesoKg} onChange={e => set('pesoKg', e.target.value)} style={estiloInput(errores.pesoKg)} />}
                    </Campo>
                    <Campo label="Temperatura (°C)" error={errores.temperaturaC}>
                        {id => <input id={id} inputMode="decimal" placeholder="Ej. 38.5" value={campos.temperaturaC} onChange={e => set('temperaturaC', e.target.value)} style={estiloInput(errores.temperaturaC)} />}
                    </Campo>
                    <Campo label="Próximo control" error={errores.proximoControl}>
                        {id => <input id={id} type="date" min={hoyISO()} value={campos.proximoControl} onChange={e => set('proximoControl', e.target.value)} style={estiloInput(errores.proximoControl)} />}
                    </Campo>
                </div>
                {LARGOS.map(({ campo, label, ayuda, filas }) => (
                    <Campo key={campo} label={label} ayuda={ayuda} error={errores[campo]}>
                        {id => (
                            <textarea
                                id={id}
                                rows={filas}
                                maxLength={10000}
                                value={campos[campo]}
                                onChange={e => set(campo, e.target.value)}
                                style={{ ...estiloInput(errores[campo]), resize: 'vertical' }}
                            />
                        )}
                    </Campo>
                ))}
            </form>
        </Modal>
    )
}
