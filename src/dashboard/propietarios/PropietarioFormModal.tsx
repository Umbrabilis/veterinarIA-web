import { useEffect, useId, useState, type SubmitEvent } from 'react'
import {
    actualizarPropietario, crearPropietario, type PropietarioRequest, type PropietarioResponse,
} from '../../api/propietariosService'
import { estiloInput } from '../../shared/estilos'
import { CloseIcon, Campo } from '../../shared/Formulario'
import { UsersIcon } from '../../shared/icons'
import {
    LIMITES, mensajeDeError, validarDireccion, validarDocumento, validarEmail, validarNombre, validarTelefono,
} from '../../shared/validaciones'

interface Props {
    /** Sin propietario: registro. Con propietario: edición. */
    propietario?: PropietarioResponse
    onClose: () => void
    onSaved: (propietario: PropietarioResponse, creado: boolean) => void
}

type Campos = {
    nombre: string
    documento: string
    telefono: string
    email: string
    direccion: string
    aceptaTratamientoDatos: boolean
}

type Errores = Partial<Record<keyof Campos, string>>

function validar(campos: Campos, esEdicion: boolean): Errores {
    const errores: Errores = {
        nombre: validarNombre(campos.nombre),
        documento: validarDocumento(campos.documento),
        telefono: validarTelefono(campos.telefono),
        email: validarEmail(campos.email),
        direccion: validarDireccion(campos.direccion),
    }
    if (!esEdicion && !campos.aceptaTratamientoDatos) {
        errores.aceptaTratamientoDatos = 'Sin la autorización del titular no se puede guardar ningún dato (Ley 1581 de 2012)'
    }
    return errores
}

const textoONull = (valor: string) => valor.trim() || null

export default function PropietarioFormModal({ propietario, onClose, onSaved }: Props) {
    const esEdicion = Boolean(propietario)
    const tituloId = useId()
    const [campos, setCampos] = useState<Campos>({
        nombre: propietario?.nombre ?? '',
        documento: propietario?.documento ?? '',
        telefono: propietario?.telefono ?? '',
        email: propietario?.email ?? '',
        direccion: propietario?.direccion ?? '',
        aceptaTratamientoDatos: esEdicion,
    })
    const [errores, setErrores] = useState<Errores>({})
    const [guardando, setGuardando] = useState(false)
    const [errorServidor, setErrorServidor] = useState('')

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape' && !guardando) onClose()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [guardando, onClose])

    function set<K extends keyof Campos>(campo: K, valor: Campos[K]) {
        setCampos(prev => ({ ...prev, [campo]: valor }))
        setErrores(prev => ({ ...prev, [campo]: undefined }))
    }

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault()
        const encontrados = validar(campos, esEdicion)
        setErrores(encontrados)
        if (Object.values(encontrados).some(Boolean)) return

        const request: PropietarioRequest = {
            nombre: campos.nombre.trim(),
            documento: campos.documento.trim(),
            telefono: campos.telefono.trim(),
            email: campos.email.trim(),
            direccion: textoONull(campos.direccion),
            // Al editar, la autorización ya consta (consentimientoDatosEn); el backend la exige en cada envío.
            aceptaTratamientoDatos: esEdicion || campos.aceptaTratamientoDatos,
        }

        setGuardando(true)
        setErrorServidor('')
        try {
            const guardado = propietario
                ? await actualizarPropietario(propietario.id, request)
                : await crearPropietario(request)
            onSaved(guardado, !propietario)
        } catch (error) {
            setErrorServidor(mensajeDeError(error, 'No se pudo guardar el propietario. Intenta de nuevo.'))
        } finally {
            setGuardando(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15, 23, 42, 0.45)' }}>
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby={tituloId}
                className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border"
                style={{
                    maxHeight: 'min(92vh, 760px)',
                    background: 'var(--white)',
                    borderColor: 'var(--gray-200)',
                    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
                }}
            >
                <header className="flex items-start justify-between gap-4 px-6 py-5" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                            <UsersIcon size={18} />
                        </div>
                        <div>
                            <h2 id={tituloId} className="text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                                {esEdicion ? 'Editar propietario' : 'Registrar propietario'}
                            </h2>
                            <p className="text-xs" style={{ color: 'var(--gray-500)' }}>
                                {esEdicion ? 'Actualiza los datos de contacto del dueño.' : 'Datos del dueño de la mascota.'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={guardando}
                        aria-label="Cerrar"
                        className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                        style={{ color: 'var(--gray-400)' }}
                    >
                        <CloseIcon />
                    </button>
                </header>

                <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
                    <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                        <Campo label="Nombre completo" error={errores.nombre} requerido>
                            {id => (
                                <input
                                    id={id}
                                    type="text"
                                    autoComplete="off"
                                    maxLength={LIMITES.nombre}
                                    placeholder="Ej. Laura Gómez"
                                    value={campos.nombre}
                                    onChange={e => set('nombre', e.target.value)}
                                    aria-invalid={Boolean(errores.nombre)}
                                    style={estiloInput(errores.nombre)}
                                />
                            )}
                        </Campo>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Campo label="Documento" error={errores.documento} ayuda="Cédula, cédula de extranjería, pasaporte o NIT" requerido>
                                {id => (
                                    <input
                                        id={id}
                                        type="text"
                                        autoComplete="off"
                                        maxLength={LIMITES.documento}
                                        placeholder="Ej. 1020304050"
                                        value={campos.documento}
                                        onChange={e => set('documento', e.target.value)}
                                        aria-invalid={Boolean(errores.documento)}
                                        style={estiloInput(errores.documento)}
                                    />
                                )}
                            </Campo>

                            <Campo label="Teléfono" error={errores.telefono} requerido>
                                {id => (
                                    <input
                                        id={id}
                                        type="tel"
                                        autoComplete="off"
                                        maxLength={LIMITES.telefono}
                                        placeholder="Ej. 300 123 4567"
                                        value={campos.telefono}
                                        onChange={e => set('telefono', e.target.value.replace(/[^0-9+()\s-]/g, ''))}
                                        aria-invalid={Boolean(errores.telefono)}
                                        style={estiloInput(errores.telefono)}
                                    />
                                )}
                            </Campo>
                        </div>

                        <Campo label="Correo" error={errores.email} ayuda="Aquí le llegan las novedades de su mascota, como los resúmenes de consulta." requerido>
                            {id => (
                                <input
                                    id={id}
                                    type="email"
                                    autoComplete="off"
                                    maxLength={LIMITES.email}
                                    placeholder="Ej. laura@correo.com"
                                    value={campos.email}
                                    onChange={e => set('email', e.target.value)}
                                    aria-invalid={Boolean(errores.email)}
                                    style={estiloInput(errores.email)}
                                />
                            )}
                        </Campo>

                        <Campo label="Dirección" error={errores.direccion} ayuda="Opcional">
                            {id => (
                                <input
                                    id={id}
                                    type="text"
                                    autoComplete="off"
                                    maxLength={LIMITES.direccion}
                                    placeholder="Ej. Calle 10 # 20-30, Apto 301"
                                    value={campos.direccion}
                                    onChange={e => set('direccion', e.target.value)}
                                    aria-invalid={Boolean(errores.direccion)}
                                    style={estiloInput(errores.direccion)}
                                />
                            )}
                        </Campo>

                        {esEdicion && propietario ? (
                            <div className="flex items-start gap-3 rounded-lg px-4 py-3 text-xs" style={{ background: 'var(--secondary-light)', color: '#065F46' }}>
                                <span aria-hidden="true">✓</span>
                                <span>
                                    Autorización de tratamiento de datos registrada el{' '}
                                    {new Date(propietario.consentimientoDatosEn).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}.
                                </span>
                            </div>
                        ) : (
                            <div>
                                <label
                                    className="flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3"
                                    style={{ borderColor: errores.aceptaTratamientoDatos ? '#EF4444' : 'var(--gray-200)', background: 'var(--gray-100)' }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={campos.aceptaTratamientoDatos}
                                        onChange={e => set('aceptaTratamientoDatos', e.target.checked)}
                                        aria-invalid={Boolean(errores.aceptaTratamientoDatos)}
                                        className="mt-0.5 h-4 w-4 flex-shrink-0"
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                    <span className="text-xs leading-5" style={{ color: 'var(--dark)' }}>
                                        El titular autoriza a la clínica a tratar sus datos personales para la atención de sus
                                        mascotas, conforme a la Ley 1581 de 2012. <span style={{ color: '#EF4444' }}>*</span>
                                    </span>
                                </label>
                                {errores.aceptaTratamientoDatos && (
                                    <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errores.aceptaTratamientoDatos}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <footer className="flex flex-col-reverse gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-end" style={{ borderTop: '1px solid var(--gray-200)', background: 'var(--gray-100)' }}>
                        {errorServidor && (
                            <p className="text-sm sm:mr-auto" style={{ color: '#EF4444' }} role="alert">{errorServidor}</p>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={guardando}
                            className="rounded-lg border px-4 py-2 text-sm font-semibold transition-colors hover:bg-white"
                            style={{ borderColor: 'var(--gray-200)', color: 'var(--dark)' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando}
                            className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: 'var(--primary)' }}
                        >
                            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Registrar propietario'}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    )
}
