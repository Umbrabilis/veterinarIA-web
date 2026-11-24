import { useState, type FormEvent } from 'react'
import historiasService, { type VacunaResponse } from '../../api/historiasService'
import { estiloInput } from '../../shared/estilos'
import { Campo } from '../../shared/Formulario'
import { CheckIcon } from '../../shared/icons'
import Modal, { BotonPrimario, BotonSecundario, ErrorServidor } from '../../shared/Modal'
import { hoyISO, mensajeDeError } from '../../shared/validaciones'

interface Props {
    mascotaId: string
    mascotaNombre: string
    onClose: () => void
    onSaved: (vacuna: VacunaResponse) => void
}

type Errores = Partial<Record<'nombre' | 'lote' | 'fechaAplicacion' | 'proximaDosis', string>>

// Mismas reglas que historias-service (`Patrones.NOMBRE_COSA` y `Patrones.LOTE`).
const NOMBRE = /^[\p{L}\p{N}][\p{L}\p{N} .'()/-]*$/u
const LOTE = /^[A-Za-z0-9-]+$/

export default function VacunaFormModal({ mascotaId, mascotaNombre, onClose, onSaved }: Props) {
    const [nombre, setNombre] = useState('')
    const [lote, setLote] = useState('')
    const [fechaAplicacion, setFechaAplicacion] = useState(hoyISO())
    const [proximaDosis, setProximaDosis] = useState('')
    const [notas, setNotas] = useState('')
    const [errores, setErrores] = useState<Errores>({})
    const [guardando, setGuardando] = useState(false)
    const [errorServidor, setErrorServidor] = useState('')

    function validar(): Errores {
        const e: Errores = {}
        if (!nombre.trim()) e.nombre = 'Escribe el nombre de la vacuna'
        else if (!NOMBRE.test(nombre.trim())) e.nombre = 'Contiene caracteres no permitidos'
        if (lote.trim() && !LOTE.test(lote.trim())) e.lote = 'Solo letras, números y guiones'
        if (!fechaAplicacion) e.fechaAplicacion = 'Indica cuándo se aplicó'
        else if (fechaAplicacion > hoyISO()) e.fechaAplicacion = 'No puede estar en el futuro'
        if (proximaDosis && fechaAplicacion && proximaDosis <= fechaAplicacion) e.proximaDosis = 'Debe ser posterior a la aplicación'
        return e
    }

    async function guardar(event: FormEvent) {
        event.preventDefault()
        const encontrados = validar()
        setErrores(encontrados)
        if (Object.values(encontrados).some(Boolean)) return
        setGuardando(true)
        setErrorServidor('')
        try {
            onSaved(await historiasService.registrarVacuna({
                mascotaId,
                nombre: nombre.trim(),
                lote: lote.trim() || null,
                fechaAplicacion,
                proximaDosis: proximaDosis || null,
                notas: notas.trim() || null,
            }))
        } catch (error) {
            setErrorServidor(mensajeDeError(error, 'No se pudo registrar la vacuna.'))
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Modal
            titulo="Registrar vacuna"
            subtitulo={`${mascotaNombre} · Si indicas la próxima dosis, aparecerá en Seguimiento.`}
            icono={<CheckIcon size={18} />}
            ancho="sm"
            bloqueado={guardando}
            onClose={onClose}
            pie={
                <>
                    <BotonSecundario onClick={onClose} disabled={guardando}>Cancelar</BotonSecundario>
                    <BotonPrimario type="submit" form="form-vacuna" disabled={guardando}>{guardando ? 'Guardando...' : 'Registrar'}</BotonPrimario>
                </>
            }
        >
            <form id="form-vacuna" onSubmit={guardar} noValidate className="space-y-4">
                <ErrorServidor mensaje={errorServidor} />
                <Campo label="Vacuna" error={errores.nombre} requerido>
                    {id => <input id={id} maxLength={150} placeholder="Ej. Rabia" value={nombre} onChange={e => { setNombre(e.target.value); setErrores(p => ({ ...p, nombre: undefined })) }} style={estiloInput(errores.nombre)} />}
                </Campo>
                <Campo label="Lote" error={errores.lote}>
                    {id => <input id={id} maxLength={60} value={lote} onChange={e => { setLote(e.target.value); setErrores(p => ({ ...p, lote: undefined })) }} style={estiloInput(errores.lote)} />}
                </Campo>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Campo label="Aplicada el" error={errores.fechaAplicacion} requerido>
                        {id => <input id={id} type="date" max={hoyISO()} value={fechaAplicacion} onChange={e => { setFechaAplicacion(e.target.value); setErrores(p => ({ ...p, fechaAplicacion: undefined, proximaDosis: undefined })) }} style={estiloInput(errores.fechaAplicacion)} />}
                    </Campo>
                    <Campo label="Próxima dosis" error={errores.proximaDosis}>
                        {id => <input id={id} type="date" min={fechaAplicacion || undefined} value={proximaDosis} onChange={e => { setProximaDosis(e.target.value); setErrores(p => ({ ...p, proximaDosis: undefined })) }} style={estiloInput(errores.proximaDosis)} />}
                    </Campo>
                </div>
                <Campo label="Notas">
                    {id => <textarea id={id} rows={2} maxLength={2000} value={notas} onChange={e => setNotas(e.target.value)} style={{ ...estiloInput(), resize: 'vertical' }} />}
                </Campo>
            </form>
        </Modal>
    )
}
