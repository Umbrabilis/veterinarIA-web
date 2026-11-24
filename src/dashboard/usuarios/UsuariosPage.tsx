import { useCallback, useEffect, useState } from 'react'
import authService from '../../api/authService'
import usuariosService, { type UsuarioAdmin } from '../../api/usuariosService'
import { EditIcon, PlusIcon, SearchIcon } from '../../shared/icons'
import { LIMITES, mensajeDeError } from '../../shared/validaciones'
import UsuarioFormModal from './UsuarioFormModal'
import { ROL_COLOR, ROL_LABEL } from './usuarioUtils'

type Formulario = { modo: 'crear' } | { modo: 'editar'; usuario: UsuarioAdmin }

/** Cuentas del personal. Solo la ve el administrador: el menú la oculta y el backend responde 403 a los demás. */
export default function UsuariosPage() {
    const [version, setVersion] = useState(0)
    const [resultado, setResultado] = useState<{ version: number; data?: UsuarioAdmin[]; error?: string; sinPermiso?: boolean } | null>(null)
    const [miId, setMiId] = useState<string | null>(null)
    const [texto, setTexto] = useState('')
    const [formulario, setFormulario] = useState<Formulario | null>(null)
    const [confirmando, setConfirmando] = useState<UsuarioAdmin | null>(null)
    const [cambiandoEstado, setCambiandoEstado] = useState(false)
    const [aviso, setAviso] = useState('')

    const cargando = resultado?.version !== version
    const usuarios = resultado?.data

    useEffect(() => {
        let vigente = true
        usuariosService.listar()
            .then(data => { if (vigente) setResultado({ version, data }) })
            .catch(error => {
                if (!vigente) return
                const sinPermiso = (error as { response?: { status?: number } })?.response?.status === 403
                setResultado({ version, sinPermiso, error: mensajeDeError(error, 'No se pudieron cargar los usuarios.') })
            })
        return () => { vigente = false }
    }, [version])

    useEffect(() => {
        authService.getProfile().then(p => setMiId(p.id ?? null)).catch(() => setMiId(null))
    }, [])

    useEffect(() => {
        if (!aviso) return
        const timeout = window.setTimeout(() => setAviso(''), 5000)
        return () => window.clearTimeout(timeout)
    }, [aviso])

    const cerrarFormulario = useCallback(() => setFormulario(null), [])

    async function cambiarEstado(usuario: UsuarioAdmin) {
        setCambiandoEstado(true)
        try {
            const actualizado = await usuariosService.actualizar(usuario.id, {
                nombre: usuario.nombre,
                rol: usuario.rol,
                activo: !usuario.activo,
            })
            setAviso(actualizado.activo
                ? `La cuenta de ${actualizado.nombre} quedó activa.`
                : `La cuenta de ${actualizado.nombre} quedó inactiva: ya no puede iniciar sesión.`)
            setVersion(v => v + 1)
        } catch (error) {
            setAviso(mensajeDeError(error, 'No se pudo cambiar el estado de la cuenta.'))
        } finally {
            setCambiandoEstado(false)
            setConfirmando(null)
        }
    }

    const filtro = texto.trim().toLowerCase()
    const visibles = (usuarios ?? []).filter(u =>
        !filtro || u.nombre.toLowerCase().includes(filtro) || u.email.toLowerCase().includes(filtro))

    if (resultado?.sinPermiso) {
        return (
            <div className="p-6 max-w-5xl mx-auto">
                <div className="rounded-xl border px-6 py-10 text-center" style={{ background: 'var(--white)', borderColor: 'var(--gray-200)' }}>
                    <p className="text-sm" style={{ color: 'var(--gray-500)' }}>Solo los administradores pueden gestionar las cuentas del personal.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-5">
            <div>
                <h1 className="text-xl font-bold mb-0.5" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                    Usuarios
                </h1>
                <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
                    Cuentas del personal de la clínica: quién puede entrar al sistema y con qué rol.
                </p>
            </div>

            {aviso && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700" role="status">
                    {aviso}
                </div>
            )}

            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--white)', border: '1px solid var(--gray-200)' }}>
                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-400)' }}>
                            <SearchIcon />
                        </span>
                        <input
                            value={texto}
                            maxLength={LIMITES.busqueda}
                            onChange={e => setTexto(e.target.value)}
                            placeholder="Buscar por nombre o correo"
                            aria-label="Buscar usuarios"
                            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all"
                            style={{ border: '1.5px solid var(--gray-200)', color: 'var(--dark)' }}
                            onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                            onBlur={e => (e.target.style.borderColor = 'var(--gray-200)')}
                        />
                    </div>
                    <button
                        onClick={() => setFormulario({ modo: 'crear' })}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: 'var(--primary)', whiteSpace: 'nowrap' }}
                    >
                        <PlusIcon />
                        Nuevo usuario
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr style={{ background: 'var(--gray-100)', borderBottom: '1px solid var(--gray-200)' }}>
                            {['Nombre', 'Rol', 'Estado', 'Creado'].map(col => (
                                <th key={col} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gray-500)' }}>
                                    {col}
                                </th>
                            ))}
                            <th className="px-5 py-3"><span className="sr-only">Acciones</span></th>
                        </tr>
                        </thead>
                        <tbody className="divide-y" style={{ opacity: cargando && usuarios ? 0.55 : 1 }}>
                        {visibles.map(u => {
                            const esYo = u.id === miId
                            return (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                                                style={{ background: u.activo ? 'var(--primary)' : 'var(--gray-400)' }}
                                            >
                                                {u.nombre.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium" style={{ color: 'var(--dark)' }}>
                                                    {u.nombre}
                                                    {esYo && <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--gray-500)' }}>(tú)</span>}
                                                </div>
                                                <div className="text-xs truncate" style={{ color: 'var(--gray-500)' }}>{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: ROL_COLOR[u.rol].fondo, color: ROL_COLOR[u.rol].texto }}>
                                            {ROL_LABEL[u.rol]}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span
                                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                                            style={{ background: u.activo ? 'var(--secondary-light)' : 'var(--gray-100)', color: u.activo ? '#065F46' : 'var(--gray-500)' }}
                                        >
                                            {u.activo ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm whitespace-nowrap" style={{ color: 'var(--gray-500)' }}>
                                        {new Date(u.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => setFormulario({ modo: 'editar', usuario: u })}
                                                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-indigo-50"
                                                style={{ color: 'var(--primary)' }}
                                                aria-label={`Editar ${u.nombre}`}
                                            >
                                                <EditIcon size={14} />
                                                Editar
                                            </button>
                                            {!esYo && (
                                                <button
                                                    onClick={() => setConfirmando(u)}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-gray-100"
                                                    style={{ color: u.activo ? 'var(--gray-500)' : 'var(--secondary)' }}
                                                >
                                                    {u.activo ? 'Desactivar' : 'Reactivar'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>

                    {!usuarios && cargando && (
                        <div className="py-12 text-center text-sm" style={{ color: 'var(--gray-400)' }}>Cargando usuarios...</div>
                    )}
                    {resultado?.error && !cargando && (
                        <div className="py-12 text-center text-sm" style={{ color: '#EF4444' }} role="alert">
                            {resultado.error}{' '}
                            <button onClick={() => setVersion(v => v + 1)} className="font-semibold underline" style={{ color: 'var(--primary)' }}>Reintentar</button>
                        </div>
                    )}
                    {usuarios && visibles.length === 0 && !cargando && (
                        <div className="py-12 text-center text-sm" style={{ color: 'var(--gray-400)' }}>
                            {filtro ? 'Ningún usuario coincide con la búsqueda.' : 'Aún no hay usuarios registrados.'}
                        </div>
                    )}
                </div>

                {usuarios && usuarios.length > 0 && (
                    <div className="px-5 py-3 text-xs" style={{ borderTop: '1px solid var(--gray-200)', color: 'var(--gray-500)' }}>
                        {usuarios.filter(u => u.activo).length} activas de {usuarios.length} cuentas
                    </div>
                )}
            </div>

            {formulario && (
                <UsuarioFormModal
                    usuario={formulario.modo === 'editar' ? formulario.usuario : undefined}
                    miId={miId}
                    onClose={cerrarFormulario}
                    onSaved={(u, creado) => {
                        setFormulario(null)
                        setAviso(creado ? `Se creó la cuenta de ${u.nombre}.` : `Los datos de ${u.nombre} se actualizaron.`)
                        setVersion(v => v + 1)
                    }}
                />
            )}

            {confirmando && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15, 23, 42, 0.45)' }}>
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="confirmar-usuario-titulo"
                        className="w-full max-w-sm rounded-2xl border p-6"
                        style={{ background: 'var(--white)', borderColor: 'var(--gray-200)', boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)' }}
                    >
                        <h2 id="confirmar-usuario-titulo" className="text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                            {confirmando.activo ? `¿Desactivar a ${confirmando.nombre}?` : `¿Reactivar a ${confirmando.nombre}?`}
                        </h2>
                        <p className="mt-2 text-sm" style={{ color: 'var(--gray-500)' }}>
                            {confirmando.activo
                                ? 'No podrá iniciar sesión. Su información y su historial en la clínica se conservan, y puedes reactivarla cuando quieras.'
                                : 'Podrá volver a iniciar sesión con su contraseña de siempre.'}
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmando(null)}
                                disabled={cambiandoEstado}
                                className="rounded-lg border px-4 py-2 text-sm font-semibold"
                                style={{ borderColor: 'var(--gray-200)', color: 'var(--dark)' }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => cambiarEstado(confirmando)}
                                disabled={cambiandoEstado}
                                className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                style={{ background: confirmando.activo ? '#EF4444' : 'var(--secondary)' }}
                            >
                                {cambiandoEstado ? 'Guardando...' : confirmando.activo ? 'Desactivar' : 'Reactivar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
