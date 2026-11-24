import { useEffect, useId, useState, type SubmitEvent } from 'react'
import usuariosService, {
    ROLES_PERSONAL, type RolPersonal, type UsuarioAdmin,
} from '../../api/usuariosService'
import AvisoLimite from '../../shared/AvisoLimite'
import { estiloInput } from '../../shared/estilos'
import { CloseIcon, Campo } from '../../shared/Formulario'
import { UserIcon } from '../../shared/icons'
import {
    LIMITES, mensajeDeError, validarEmail, validarNombre, validarPasswordNueva,
} from '../../shared/validaciones'
import { ROL_LABEL } from './usuarioUtils'

interface Props {
    /** Sin usuario: creación. Con usuario: edición. */
    usuario?: UsuarioAdmin
    /** Id del administrador con sesión: no puede quitarse el rol ni desactivarse. */
    miId: string | null
    onClose: () => void
    onSaved: (usuario: UsuarioAdmin, creado: boolean) => void
}

type Campos = {
    nombre: string
    email: string
    rol: RolPersonal | ''
    password: string
    confirmacion: string
    activo: boolean
}

type Errores = Partial<Record<keyof Campos, string>>

export default function UsuarioFormModal({ usuario, miId, onClose, onSaved }: Props) {
    const esEdicion = Boolean(usuario)
    const esMiCuenta = Boolean(usuario && usuario.id === miId)
    const tituloId = useId()
    const [campos, setCampos] = useState<Campos>({
        nombre: usuario?.nombre ?? '',
        email: usuario?.email ?? '',
        rol: usuario?.rol ?? '',
        password: '',
        confirmacion: '',
        activo: usuario?.activo ?? true,
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

    function validar(): Errores {
        const e: Errores = { nombre: validarNombre(campos.nombre) }
        if (!campos.rol) e.rol = 'Selecciona el rol'
        if (!esEdicion) {
            e.email = validarEmail(campos.email)
            e.password = validarPasswordNueva(campos.password)
            if (!campos.confirmacion) e.confirmacion = 'Confirma la contraseña'
            else if (campos.confirmacion !== campos.password) e.confirmacion = 'Las contraseñas no coinciden'
        }
        return e
    }

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault()
        const encontrados = validar()
        setErrores(encontrados)
        if (Object.values(encontrados).some(Boolean)) return

        setGuardando(true)
        setErrorServidor('')
        try {
            const guardado = usuario
                ? await usuariosService.actualizar(usuario.id, {
                    nombre: campos.nombre.trim(),
                    rol: campos.rol as RolPersonal,
                    activo: campos.activo,
                })
                : await usuariosService.crear({
                    nombre: campos.nombre.trim(),
                    email: campos.email.trim(),
                    password: campos.password,
                    rol: campos.rol as RolPersonal,
                })
            onSaved(guardado, !usuario)
        } catch (error) {
            setErrorServidor(mensajeDeError(error, 'No se pudo guardar el usuario. Intenta de nuevo.'))
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
                className="flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border"
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
                            <UserIcon size={18} />
                        </div>
                        <div>
                            <h2 id={tituloId} className="text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                                {esEdicion ? 'Editar usuario' : 'Nuevo usuario'}
                            </h2>
                            <p className="text-xs" style={{ color: 'var(--gray-500)' }}>
                                {esEdicion ? 'Cambia el nombre, el rol o el estado de la cuenta.' : 'Crea la cuenta de un miembro del personal.'}
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
                                <>
                                    <input
                                        id={id}
                                        type="text"
                                        autoComplete="off"
                                        maxLength={LIMITES.nombre}
                                        placeholder="Ej. Diana Torres"
                                        value={campos.nombre}
                                        onChange={e => set('nombre', e.target.value)}
                                        aria-invalid={Boolean(errores.nombre)}
                                        style={estiloInput(errores.nombre)}
                                    />
                                    <AvisoLimite valor={campos.nombre} max={LIMITES.nombre} />
                                </>
                            )}
                        </Campo>

                        <Campo
                            label="Correo"
                            error={errores.email}
                            ayuda={esEdicion ? 'El correo no se puede cambiar: es el usuario con el que inicia sesión.' : 'Con este correo iniciará sesión.'}
                            requerido={!esEdicion}
                        >
                            {id => (
                                <>
                                    <input
                                        id={id}
                                        type="email"
                                        autoComplete="off"
                                        maxLength={LIMITES.email}
                                        placeholder="Ej. diana@clinica.com"
                                        value={campos.email}
                                        onChange={e => set('email', e.target.value)}
                                        readOnly={esEdicion}
                                        aria-invalid={Boolean(errores.email)}
                                        style={{ ...estiloInput(errores.email), ...(esEdicion ? { background: 'var(--gray-100)', color: 'var(--gray-500)' } : {}) }}
                                    />
                                    {!esEdicion && <AvisoLimite valor={campos.email} max={LIMITES.email} />}
                                </>
                            )}
                        </Campo>

                        <Campo
                            label="Rol"
                            error={errores.rol}
                            ayuda={esMiCuenta ? 'No puedes quitarte el rol de administrador.' : undefined}
                            requerido
                        >
                            {id => (
                                <select
                                    id={id}
                                    value={campos.rol}
                                    onChange={e => set('rol', e.target.value as RolPersonal)}
                                    disabled={esMiCuenta}
                                    aria-invalid={Boolean(errores.rol)}
                                    style={estiloInput(errores.rol)}
                                >
                                    <option value="">Seleccionar</option>
                                    {ROLES_PERSONAL.map(r => <option key={r} value={r}>{ROL_LABEL[r]}</option>)}
                                </select>
                            )}
                        </Campo>

                        {esEdicion ? (
                            <Campo label="Estado" ayuda={esMiCuenta ? 'No puedes desactivar tu propia cuenta.' : 'Una cuenta inactiva no puede iniciar sesión.'}>
                                {id => (
                                    <label htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5" style={{ borderColor: 'var(--gray-200)' }}>
                                        <input
                                            id={id}
                                            type="checkbox"
                                            checked={campos.activo}
                                            disabled={esMiCuenta}
                                            onChange={e => set('activo', e.target.checked)}
                                            className="h-4 w-4"
                                            style={{ accentColor: 'var(--secondary)' }}
                                        />
                                        <span className="text-sm" style={{ color: 'var(--dark)' }}>{campos.activo ? 'Activa' : 'Inactiva'}</span>
                                    </label>
                                )}
                            </Campo>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Campo label="Contraseña inicial" error={errores.password} ayuda="8 a 72 caracteres, con letras y números" requerido>
                                    {id => (
                                        <>
                                            <input
                                                id={id}
                                                type="password"
                                                autoComplete="new-password"
                                                maxLength={LIMITES.passwordMax}
                                                value={campos.password}
                                                onChange={e => set('password', e.target.value)}
                                                aria-invalid={Boolean(errores.password)}
                                                style={estiloInput(errores.password)}
                                            />
                                            <AvisoLimite valor={campos.password} max={LIMITES.passwordMax} />
                                        </>
                                    )}
                                </Campo>
                                <Campo label="Confirmar contraseña" error={errores.confirmacion} requerido>
                                    {id => (
                                        <input
                                            id={id}
                                            type="password"
                                            autoComplete="new-password"
                                            maxLength={LIMITES.passwordMax}
                                            value={campos.confirmacion}
                                            onChange={e => set('confirmacion', e.target.value)}
                                            aria-invalid={Boolean(errores.confirmacion)}
                                            style={estiloInput(errores.confirmacion)}
                                        />
                                    )}
                                </Campo>
                            </div>
                        )}

                        {!esEdicion && (
                            <p className="rounded-lg px-4 py-3 text-xs leading-5" style={{ background: 'var(--primary-light)', color: 'var(--dark)' }}>
                                Entrégale la contraseña inicial a la persona por un canal privado. Puede cambiarla después desde
                                <strong> Ver mi perfil → Contraseña</strong>.
                            </p>
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
                            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear usuario'}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    )
}
