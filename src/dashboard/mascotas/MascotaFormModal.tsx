import { useEffect, useId, useState, type SubmitEvent } from 'react'
import mascotasService, {
    ESPECIES, SEXOS, type Especie, type MascotaRequest, type MascotaResponse, type Sexo,
} from '../../api/mascotasService'
import { buscarPropietarios, obtenerPropietario, type PropietarioResponse } from '../../api/propietariosService'
import { estiloInput } from '../../shared/estilos'
import { CloseIcon, Campo } from '../../shared/Formulario'
import { PawIcon, SearchIcon } from '../../shared/icons'
import {
    LIMITES, busquedaValida, hoyISO, mensajeDeError, validarFechaPasada, validarNombreMascota, validarPeso,
    validarTextoDescriptivo,
} from '../../shared/validaciones'
import { ESPECIE_COLOR, ESPECIE_LABEL, SEXO_LABEL } from './mascotaUtils'

interface Props {
    /** Sin mascota: registro. Con mascota: edición. */
    mascota?: MascotaResponse
    propietarioInicial?: PropietarioResponse | null
    onClose: () => void
    onSaved: (mascota: MascotaResponse, creada: boolean) => void
}

type Campos = {
    nombre: string
    especie: Especie | ''
    sexo: Sexo | ''
    raza: string
    color: string
    fechaNacimiento: string
    pesoKg: string
    activo: boolean
}

type Errores = Partial<Record<keyof Campos | 'propietario', string>>

function camposIniciales(mascota?: MascotaResponse): Campos {
    return {
        nombre: mascota?.nombre ?? '',
        especie: mascota?.especie ?? '',
        sexo: mascota?.sexo ?? '',
        raza: mascota?.raza ?? '',
        color: mascota?.color ?? '',
        fechaNacimiento: mascota?.fechaNacimiento ?? '',
        pesoKg: mascota?.pesoKg != null ? String(mascota.pesoKg) : '',
        activo: mascota?.activo ?? true,
    }
}

function validar(campos: Campos, propietario: PropietarioResponse | null): Errores {
    const errores: Errores = {}
    if (!propietario) errores.propietario = 'Selecciona el propietario de la mascota'
    const nombre = validarNombreMascota(campos.nombre)
    if (nombre) errores.nombre = nombre
    if (!campos.especie) errores.especie = 'Selecciona la especie'
    if (!campos.sexo) errores.sexo = 'Selecciona el sexo'
    const raza = validarTextoDescriptivo(campos.raza, 'La raza', LIMITES.raza)
    if (raza) errores.raza = raza
    const color = validarTextoDescriptivo(campos.color, 'El color', LIMITES.color)
    if (color) errores.color = color
    const fecha = validarFechaPasada(campos.fechaNacimiento, 'La fecha de nacimiento')
    if (fecha) errores.fechaNacimiento = fecha
    const peso = validarPeso(campos.pesoKg)
    if (peso) errores.pesoKg = peso
    return errores
}

const textoONull = (valor: string) => valor.trim() || null

export default function MascotaFormModal({ mascota, propietarioInicial = null, onClose, onSaved }: Props) {
    const esEdicion = Boolean(mascota)
    const tituloId = useId()
    const [campos, setCampos] = useState<Campos>(() => camposIniciales(mascota))
    const [propietario, setPropietario] = useState<PropietarioResponse | null>(propietarioInicial)
    const [errores, setErrores] = useState<Errores>({})
    const [guardando, setGuardando] = useState(false)
    const [errorServidor, setErrorServidor] = useState('')

    // Al editar, si la lista aún no tenía el nombre del propietario, se consulta aquí.
    // Solo depende de las props: si el usuario pulsa "Cambiar", no se vuelve a seleccionar el original.
    useEffect(() => {
        if (!mascota || propietarioInicial) return
        let vigente = true
        obtenerPropietario(mascota.propietarioId)
            .then(p => { if (vigente) setPropietario(actual => actual ?? p) })
            .catch(() => { /* el selector queda vacío y el usuario puede buscarlo */ })
        return () => { vigente = false }
    }, [mascota, propietarioInicial])

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
        const encontrados = validar(campos, propietario)
        setErrores(encontrados)
        if (Object.values(encontrados).some(Boolean) || !propietario) return

        const request: MascotaRequest = {
            propietarioId: propietario.id,
            nombre: campos.nombre.trim(),
            especie: campos.especie as Especie,
            raza: textoONull(campos.raza),
            sexo: campos.sexo as Sexo,
            fechaNacimiento: campos.fechaNacimiento || null,
            pesoKg: campos.pesoKg.trim() ? Number(campos.pesoKg.trim().replace(',', '.')) : null,
            color: textoONull(campos.color),
            activo: campos.activo,
        }

        setGuardando(true)
        setErrorServidor('')
        try {
            const guardada = mascota
                ? await mascotasService.actualizar(mascota.id, request)
                : await mascotasService.crear(request)
            onSaved(guardada, !mascota)
        } catch (error) {
            setErrorServidor(mensajeDeError(error, 'No se pudo guardar la mascota. Intenta de nuevo.'))
        } finally {
            setGuardando(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15, 23, 42, 0.45)' }}
        >
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
                            <PawIcon size={18} />
                        </div>
                        <div>
                            <h2 id={tituloId} className="text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                                {esEdicion ? 'Editar mascota' : 'Registrar mascota'}
                            </h2>
                            <p className="text-xs" style={{ color: 'var(--gray-500)' }}>
                                {esEdicion ? 'Actualiza los datos del paciente.' : 'Completa los datos del nuevo paciente.'}
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
                        <SelectorPropietario
                            seleccionado={propietario}
                            error={errores.propietario}
                            onChange={p => {
                                setPropietario(p)
                                setErrores(prev => ({ ...prev, propietario: undefined }))
                            }}
                        />

                        <Campo label="Nombre" error={errores.nombre} requerido>
                            {id => (
                                <input
                                    id={id}
                                    type="text"
                                    maxLength={LIMITES.nombreMascota}
                                    placeholder="Ej. Luna"
                                    value={campos.nombre}
                                    onChange={e => set('nombre', e.target.value)}
                                    aria-invalid={Boolean(errores.nombre)}
                                    style={estiloInput(errores.nombre)}
                                />
                            )}
                        </Campo>

                        <Campo label="Especie" error={errores.especie} requerido>
                            {() => (
                                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Especie">
                                    {ESPECIES.map(especie => {
                                        const activa = campos.especie === especie
                                        return (
                                            <button
                                                key={especie}
                                                type="button"
                                                role="radio"
                                                aria-checked={activa}
                                                onClick={() => set('especie', especie)}
                                                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
                                                style={{
                                                    borderColor: activa ? ESPECIE_COLOR[especie] : 'var(--gray-200)',
                                                    background: activa ? ESPECIE_COLOR[especie] + '1A' : 'var(--white)',
                                                    color: activa ? 'var(--dark)' : 'var(--gray-500)',
                                                }}
                                            >
                                                <PawIcon size={12} color={ESPECIE_COLOR[especie]} />
                                                {ESPECIE_LABEL[especie]}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </Campo>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Campo label="Sexo" error={errores.sexo} requerido>
                                {id => (
                                    <select
                                        id={id}
                                        value={campos.sexo}
                                        onChange={e => set('sexo', e.target.value as Sexo)}
                                        aria-invalid={Boolean(errores.sexo)}
                                        style={estiloInput(errores.sexo)}
                                    >
                                        <option value="">Seleccionar</option>
                                        {SEXOS.map(s => <option key={s} value={s}>{SEXO_LABEL[s]}</option>)}
                                    </select>
                                )}
                            </Campo>

                            <Campo label="Raza" error={errores.raza}>
                                {id => (
                                    <input
                                        id={id}
                                        type="text"
                                        maxLength={LIMITES.raza}
                                        placeholder="Ej. Criollo"
                                        value={campos.raza}
                                        onChange={e => set('raza', e.target.value)}
                                        aria-invalid={Boolean(errores.raza)}
                                        style={estiloInput(errores.raza)}
                                    />
                                )}
                            </Campo>

                            <Campo label="Fecha de nacimiento" error={errores.fechaNacimiento}>
                                {id => (
                                    <input
                                        id={id}
                                        type="date"
                                        max={hoyISO()}
                                        value={campos.fechaNacimiento}
                                        onChange={e => set('fechaNacimiento', e.target.value)}
                                        aria-invalid={Boolean(errores.fechaNacimiento)}
                                        style={estiloInput(errores.fechaNacimiento)}
                                    />
                                )}
                            </Campo>

                            <Campo label="Peso (kg)" error={errores.pesoKg}>
                                {id => (
                                    <input
                                        id={id}
                                        type="text"
                                        inputMode="decimal"
                                        maxLength={7}
                                        placeholder="Ej. 12.5"
                                        value={campos.pesoKg}
                                        onChange={e => set('pesoKg', e.target.value.replace(/[^0-9.,]/g, ''))}
                                        aria-invalid={Boolean(errores.pesoKg)}
                                        style={estiloInput(errores.pesoKg)}
                                    />
                                )}
                            </Campo>

                            <Campo label="Color" error={errores.color}>
                                {id => (
                                    <input
                                        id={id}
                                        type="text"
                                        maxLength={LIMITES.color}
                                        placeholder="Ej. Café con blanco"
                                        value={campos.color}
                                        onChange={e => set('color', e.target.value)}
                                        aria-invalid={Boolean(errores.color)}
                                        style={estiloInput(errores.color)}
                                    />
                                )}
                            </Campo>

                            {esEdicion && (
                                <Campo label="Estado">
                                    {id => (
                                        <label htmlFor={id} className="flex h-[42px] cursor-pointer items-center gap-3 rounded-lg border px-3.5" style={{ borderColor: 'var(--gray-200)' }}>
                                            <input
                                                id={id}
                                                type="checkbox"
                                                checked={campos.activo}
                                                onChange={e => set('activo', e.target.checked)}
                                                className="h-4 w-4"
                                                style={{ accentColor: 'var(--secondary)' }}
                                            />
                                            <span className="text-sm" style={{ color: 'var(--dark)' }}>
                                                {campos.activo ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </label>
                                    )}
                                </Campo>
                            )}
                        </div>
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
                            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Registrar mascota'}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    )
}

function SelectorPropietario({ seleccionado, error, onChange }: {
    seleccionado: PropietarioResponse | null
    error?: string
    onChange: (propietario: PropietarioResponse | null) => void
}) {
    const inputId = useId()
    const [texto, setTexto] = useState('')
    const [resultado, setResultado] = useState<{ para: string; items: PropietarioResponse[]; error?: string } | null>(null)
    const consulta = texto.trim()
    const consultaValida = busquedaValida(consulta)

    useEffect(() => {
        if (seleccionado || consulta.length < 2 || !consultaValida) return
        let vigente = true
        const timeout = window.setTimeout(async () => {
            try {
                const pagina = await buscarPropietarios(consulta)
                if (vigente) setResultado({ para: consulta, items: pagina.contenido })
            } catch (err) {
                if (vigente) setResultado({ para: consulta, items: [], error: mensajeDeError(err, 'No se pudo buscar propietarios') })
            }
        }, 300)
        return () => {
            vigente = false
            window.clearTimeout(timeout)
        }
    }, [consulta, consultaValida, seleccionado])

    const buscando = consulta.length >= 2 && consultaValida && resultado?.para !== consulta

    if (seleccionado) {
        return (
            <div>
                <span className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--dark)' }}>
                    Propietario <span style={{ color: '#EF4444' }}>*</span>
                </span>
                <div className="flex items-center gap-3 rounded-lg border px-3.5 py-2.5" style={{ borderColor: 'var(--gray-200)', background: 'var(--gray-100)' }}>
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: 'var(--primary)' }}>
                        {seleccionado.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium" style={{ color: 'var(--dark)' }}>{seleccionado.nombre}</div>
                        <div className="text-xs" style={{ color: 'var(--gray-500)' }}>Documento {seleccionado.documento}</div>
                    </div>
                    <button
                        type="button"
                        onClick={() => { onChange(null); setTexto(''); setResultado(null) }}
                        className="text-xs font-semibold"
                        style={{ color: 'var(--primary)' }}
                    >
                        Cambiar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--dark)' }}>
                Propietario <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-400)' }}>
                    <SearchIcon />
                </span>
                <input
                    id={inputId}
                    type="text"
                    autoComplete="off"
                    maxLength={LIMITES.busqueda}
                    placeholder="Busca por nombre o documento"
                    value={texto}
                    onChange={e => setTexto(e.target.value)}
                    aria-invalid={Boolean(error)}
                    style={{ ...estiloInput(error), paddingLeft: 36 }}
                />
            </div>

            {consulta.length >= 2 && (
                <div className="mt-2 overflow-hidden rounded-lg border" style={{ borderColor: 'var(--gray-200)' }}>
                    {!consultaValida ? (
                        <p className="px-4 py-3 text-xs" style={{ color: '#EF4444' }}>La búsqueda contiene caracteres no permitidos.</p>
                    ) : buscando ? (
                        <p className="px-4 py-3 text-xs" style={{ color: 'var(--gray-500)' }}>Buscando...</p>
                    ) : resultado?.error ? (
                        <p className="px-4 py-3 text-xs" style={{ color: '#EF4444' }}>{resultado.error}</p>
                    ) : resultado && resultado.items.length === 0 ? (
                        <p className="px-4 py-3 text-xs" style={{ color: 'var(--gray-500)' }}>
                            No hay propietarios con ese nombre o documento. Regístralo primero en Propietarios.
                        </p>
                    ) : (
                        <ul className="max-h-48 divide-y overflow-y-auto" style={{ borderColor: 'var(--gray-200)' }}>
                            {resultado?.items.map(p => (
                                <li key={p.id}>
                                    <button
                                        type="button"
                                        onClick={() => onChange(p)}
                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
                                    >
                                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: 'var(--primary)' }}>
                                            {p.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-medium" style={{ color: 'var(--dark)' }}>{p.nombre}</div>
                                            <div className="text-xs" style={{ color: 'var(--gray-500)' }}>Documento {p.documento}</div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            {error ? (
                <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{error}</p>
            ) : consulta.length < 2 ? (
                <p className="mt-1 text-xs" style={{ color: 'var(--gray-400)' }}>Escribe al menos 2 caracteres.</p>
            ) : null}
        </div>
    )
}
