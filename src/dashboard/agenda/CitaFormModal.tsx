import { useEffect, useState, type FormEvent } from 'react'
import citasService, { type CitaResponse, type VeterinarioResponse } from '../../api/citasService'
import type { MascotaResponse } from '../../api/mascotasService'
import { estiloInput } from '../../shared/estilos'
import { nombreVeterinario } from '../../shared/estados'
import { combinarFechaHora, desdeISOFecha, horaLocal, aISOFecha, sumarMinutos } from '../../shared/fechas'
import { Campo } from '../../shared/Formulario'
import { CalendarIcon } from '../../shared/icons'
import Modal, { BotonPrimario, BotonSecundario, ErrorServidor } from '../../shared/Modal'
import SelectorMascota from '../../shared/SelectorMascota'
import { hoyISO, mensajeDeError } from '../../shared/validaciones'

const DURACIONES = [15, 30, 45, 60, 90, 120]
const MAX_MOTIVO = 500

interface Props {
    /** Sin cita: agendar. Con cita: reprogramar (solo cambia el horario). */
    cita?: CitaResponse
    fechaInicial: string
    veterinarioInicial?: string
    onClose: () => void
    onSaved: (cita: CitaResponse) => void
}

type Errores = Partial<Record<'mascota' | 'veterinario' | 'fecha' | 'hora' | 'motivo', string>>

function duracionDe(cita?: CitaResponse): number {
    if (!cita) return 30
    return Math.round((new Date(cita.fin).getTime() - new Date(cita.inicio).getTime()) / 60_000)
}

export default function CitaFormModal({ cita, fechaInicial, veterinarioInicial = '', onClose, onSaved }: Props) {
    const reprogramando = Boolean(cita)
    const [mascota, setMascota] = useState<MascotaResponse | null>(null)
    const [veterinarios, setVeterinarios] = useState<VeterinarioResponse[] | null>(null)
    const [veterinarioId, setVeterinarioId] = useState(cita?.veterinarioId ?? veterinarioInicial)
    const [fecha, setFecha] = useState(cita ? aISOFecha(new Date(cita.inicio)) : fechaInicial < hoyISO() ? hoyISO() : fechaInicial)
    const [hora, setHora] = useState(cita ? horaLocal(cita.inicio) : '09:00')
    const [duracion, setDuracion] = useState(() => {
        const d = duracionDe(cita)
        return DURACIONES.includes(d) ? d : 30
    })
    const [motivo, setMotivo] = useState('')
    const [errores, setErrores] = useState<Errores>({})
    const [guardando, setGuardando] = useState(false)
    const [errorServidor, setErrorServidor] = useState('')

    useEffect(() => {
        if (reprogramando) return
        citasService.veterinarios()
            .then(setVeterinarios)
            .catch(() => setVeterinarios([]))
    }, [reprogramando])

    function validar(): Errores {
        const e: Errores = {}
        if (!reprogramando) {
            if (!mascota) e.mascota = 'Selecciona la mascota'
            if (!veterinarioId) e.veterinario = 'Selecciona el veterinario'
            if (!motivo.trim()) e.motivo = 'Escribe el motivo de la cita'
            else if (motivo.trim().length > MAX_MOTIVO) e.motivo = `Máximo ${MAX_MOTIVO} caracteres`
        }
        if (!fecha) e.fecha = 'Elige la fecha'
        if (!hora) e.hora = 'Elige la hora'
        if (fecha && hora && new Date(combinarFechaHora(fecha, hora)) <= new Date()) e.hora = 'La cita debe ser en el futuro'
        return e
    }

    async function guardar(event: FormEvent) {
        event.preventDefault()
        const encontrados = validar()
        setErrores(encontrados)
        if (Object.values(encontrados).some(Boolean)) return

        const inicio = combinarFechaHora(fecha, hora)
        const fin = sumarMinutos(inicio, duracion)
        setGuardando(true)
        setErrorServidor('')
        try {
            const guardada = cita
                ? await citasService.reprogramar(cita.id, inicio, fin)
                : await citasService.crear({ mascotaId: mascota!.id, veterinarioId, inicio, fin, motivo: motivo.trim() })
            onSaved(guardada)
        } catch (error) {
            setErrorServidor(mensajeDeError(error, 'No se pudo guardar la cita. Intenta de nuevo.'))
        } finally {
            setGuardando(false)
        }
    }

    const limpiar = (campo: keyof Errores) => setErrores(prev => ({ ...prev, [campo]: undefined }))

    return (
        <Modal
            titulo={reprogramando ? 'Reprogramar cita' : 'Agendar cita'}
            subtitulo={cita ? `${cita.mascotaNombre} con ${cita.veterinarioNombre}` : 'El sistema evita que se crucen los horarios.'}
            icono={<CalendarIcon />}
            bloqueado={guardando}
            onClose={onClose}
            pie={
                <>
                    <BotonSecundario onClick={onClose} disabled={guardando}>Cancelar</BotonSecundario>
                    <BotonPrimario type="submit" form="form-cita" disabled={guardando}>
                        {guardando ? 'Guardando...' : reprogramando ? 'Reprogramar' : 'Agendar'}
                    </BotonPrimario>
                </>
            }
        >
            <form id="form-cita" onSubmit={guardar} noValidate className="space-y-4">
                <ErrorServidor mensaje={errorServidor} />

                {!reprogramando && (
                    <>
                        <SelectorMascota
                            seleccionada={mascota}
                            soloActivas
                            error={errores.mascota}
                            onChange={m => { setMascota(m); limpiar('mascota') }}
                        />
                        <Campo label="Veterinario" error={errores.veterinario} requerido>
                            {id => (
                                <select
                                    id={id}
                                    value={veterinarioId}
                                    onChange={e => { setVeterinarioId(e.target.value); limpiar('veterinario') }}
                                    style={estiloInput(errores.veterinario)}
                                    disabled={veterinarios === null}
                                >
                                    <option value="">{veterinarios === null ? 'Cargando...' : 'Selecciona'}</option>
                                    {veterinarios?.map(v => <option key={v.id} value={v.id}>{nombreVeterinario(v.nombre)}</option>)}
                                </select>
                            )}
                        </Campo>
                    </>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Campo label="Fecha" error={errores.fecha} requerido>
                        {id => (
                            <input
                                id={id}
                                type="date"
                                min={hoyISO()}
                                value={fecha}
                                onChange={e => { setFecha(e.target.value); limpiar('fecha'); limpiar('hora') }}
                                style={estiloInput(errores.fecha)}
                            />
                        )}
                    </Campo>
                    <Campo label="Hora" error={errores.hora} requerido>
                        {id => (
                            <input
                                id={id}
                                type="time"
                                step={300}
                                value={hora}
                                onChange={e => { setHora(e.target.value); limpiar('hora') }}
                                style={estiloInput(errores.hora)}
                            />
                        )}
                    </Campo>
                    <Campo label="Duración">
                        {id => (
                            <select id={id} value={duracion} onChange={e => setDuracion(Number(e.target.value))} style={estiloInput()}>
                                {DURACIONES.map(d => <option key={d} value={d}>{d < 60 ? `${d} min` : `${d / 60} h`}</option>)}
                            </select>
                        )}
                    </Campo>
                </div>
                {fecha && desdeISOFecha(fecha).getDay() === 0 && (
                    <p className="text-xs" style={{ color: 'var(--gray-500)' }}>Ojo: la fecha elegida es domingo.</p>
                )}

                {!reprogramando && (
                    <Campo label="Motivo" error={errores.motivo} requerido>
                        {id => (
                            <textarea
                                id={id}
                                rows={3}
                                maxLength={MAX_MOTIVO}
                                placeholder="Ej. Vacunación anual, control de peso..."
                                value={motivo}
                                onChange={e => { setMotivo(e.target.value); limpiar('motivo') }}
                                style={{ ...estiloInput(errores.motivo), resize: 'vertical' }}
                            />
                        )}
                    </Campo>
                )}
            </form>
        </Modal>
    )
}
