import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    HuesoLogo, HomeIcon, CalendarIcon, UsersIcon, PawIcon,
    ClipboardIcon, BarChartIcon, UserIcon, HelpCircleIcon, ChevronDownIcon
} from '../../shared/icons'
import authService, { type UserProfile } from '../../api/authService'
import { LIMITES, mensajeDeError, validarNombre, validarPasswordNueva } from '../../shared/validaciones'
import AvisoLimite from '../../shared/AvisoLimite'

type Screen = 'dashboard' | 'agenda' | 'propietarios' | 'mascotas' | 'consultas' | 'reportes' | 'usuarios'

interface Props {
    children: ReactNode
    activeScreen: Screen
    onNavigate: (screen: Screen) => void
    onLogout?: () => void
}

const navItems: { id: Screen; label: string; icon: ReactNode }[] = [
    { id: 'dashboard', label: 'Inicio', icon: <HomeIcon /> },
    { id: 'agenda', label: 'Agenda', icon: <CalendarIcon /> },
    { id: 'propietarios', label: 'Propietarios', icon: <UsersIcon /> },
    { id: 'mascotas', label: 'Mascotas', icon: <PawIcon size={18} /> },
    { id: 'consultas', label: 'Consultas', icon: <ClipboardIcon /> },
    { id: 'reportes', label: 'Reportes', icon: <BarChartIcon /> },
    { id: 'usuarios', label: 'Usuarios', icon: <UserIcon /> },
]

export default function Layout({ children, activeScreen, onNavigate, onLogout }: Props) {
    const navigate = useNavigate()
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loadingUser, setLoadingUser] = useState(true)
    const [menuOpen, setMenuOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const [helpOpen, setHelpOpen] = useState(false)
    const [profileTab, setProfileTab] = useState<'resumen' | 'editar' | 'password'>('resumen')
    const [profileDraft, setProfileDraft] = useState('')
    const [passwordForm, setPasswordForm] = useState({ actual: '', nueva: '', confirmacion: '' })
    const [profileError, setProfileError] = useState('')
    const [profileSuccess, setProfileSuccess] = useState('')
    const [savingProfile, setSavingProfile] = useState(false)
    const [savingPassword, setSavingPassword] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const getErrorMessage = (error: unknown) => mensajeDeError(error, 'No se pudo completar la operación.')

    const refreshUser = async () => {
        try {
            const profile = await authService.getProfile()
            setUser(profile)
            setProfileDraft(profile.nombre || '')
        } catch {
            setUser(null)
        } finally {
            setLoadingUser(false)
        }
    }

    useEffect(() => {
        refreshUser()
    }, [])

    useEffect(() => {
        if (user?.nombre) {
            setProfileDraft(user.nombre)
        }
    }, [user?.nombre, profileOpen])

    useEffect(() => {
        function handleClick(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    useEffect(() => {
        if (!helpOpen) return

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') setHelpOpen(false)
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [helpOpen])

    const normalizedRole = user?.rol?.toUpperCase() || ''
    const displayName = normalizedRole === 'VETERINARIO'
        ? `Dr. ${user?.nombre || 'Usuario'}`
        : (user?.nombre || 'Usuario')
    const roleLabel = normalizedRole || 'Usuario'
    const initials = displayName
        .split(' ')
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'U'

    return (
        <>
            <div className="flex h-screen overflow-hidden" style={{ background: 'var(--gray-100)' }}>
                <aside
                    className="flex flex-col flex-shrink-0 h-full"
                    style={{
                        width: 'var(--sidebar-width)',
                        background: 'var(--primary)',
                        color: 'white',
                    }}
                >
                    <div className="px-5 py-5 border-b border-white/10">
                        <button
                            type="button"
                            onClick={() => onNavigate('dashboard')}
                            aria-label="Ir al dashboard"
                            title="Ir al dashboard"
                            className="inline-flex rounded-lg transition-opacity hover:opacity-80"
                        >
                            <HuesoLogo size={32} color="white" />
                        </button>
                    </div>

                    <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
                        {navItems.map(item => {
                            const active = activeScreen === item.id
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate(item.id)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
                                    style={{
                                        background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                                        color: active ? 'white' : 'rgba(255,255,255,0.7)',
                                    }}
                                    onMouseEnter={e => {
                                        if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'
                                    }}
                                    onMouseLeave={e => {
                                        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
                                    }}
                                >
                                    <span className="flex-shrink-0">{item.icon}</span>
                                    {item.label}
                                </button>
                            )
                        })}
                    </nav>

                    <div className="px-3 py-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={() => setHelpOpen(true)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                            style={{ color: 'rgba(255,255,255,0.7)' }}
                            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)')}
                            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                        >
                            <HelpCircleIcon />
                            Ayuda
                        </button>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <header
                        className="flex-shrink-0 flex items-center justify-between px-6"
                        style={{
                            height: 'var(--header-height)',
                            background: 'var(--white)',
                            borderBottom: '1px solid var(--gray-200)',
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <HuesoLogo size={24} color="var(--primary)" />
                            <span className="font-semibold text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                                VeterinarIA
                            </span>
                        </div>

                        <div className="relative flex items-center gap-3" ref={menuRef}>
                            {user?.rol === 'ADMINISTRADOR' && (
                                <button
                                    type="button"
                                   onClick={() => navigate('/admin/register')}
                                    className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors sm:inline-flex"
                                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                        <circle cx="11" cy="7" r="4" />
                                        <path d="M20 8v6M17 11h6" />
                                    </svg>
                                    Nuevo usuario
                                </button>
                            )}

                            <button
                                onClick={() => setMenuOpen(menu => !menu)}
                                className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-gray-50"
                            >
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                                    style={{ background: 'var(--secondary)' }}
                                >
                                    {loadingUser ? '...' : initials}
                                </div>
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-semibold leading-tight" style={{ color: 'var(--dark)' }}>
                                        {loadingUser ? 'Cargando...' : displayName}
                                    </div>
                                    <div className="text-xs" style={{ color: 'var(--gray-500)' }}>
                                        {loadingUser ? 'Usuario' : roleLabel}
                                    </div>
                                </div>
                                <span
                                    style={{
                                        color: 'var(--gray-400)',
                                        transition: 'transform 0.15s',
                                        transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                        display: 'inline-block',
                                    }}
                                >
                                    <ChevronDownIcon />
                                </span>
                            </button>

                            {menuOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-64 rounded-xl overflow-hidden z-50"
                                    style={{
                                        background: 'var(--white)',
                                        border: '1px solid var(--gray-200)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                                    }}
                                >
                                    <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                                                style={{ background: 'var(--secondary)' }}
                                            >
                                                {initials}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                                                    {loadingUser ? 'Cargando...' : displayName}
                                                </div>
                                                <div className="text-xs" style={{ color: 'var(--gray-500)' }}>
                                                    {loadingUser ? 'Usuario' : roleLabel}
                                                </div>
                                                <div className="text-xs mt-0.5" style={{ color: 'var(--gray-400)' }}>
                                                    {user?.email || 'correo@clinica.com'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="py-1">
                                        <MenuItem
                                            icon={
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                                    <circle cx="12" cy="7" r="4" />
                                                </svg>
                                            }
                                            label="Ver mi perfil"
                                            onClick={() => {
                                                setMenuOpen(false)
                                                setProfileOpen(true)
                                            }}
                                        />
                                        <MenuItem
                                            icon={
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="3" />
                                                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                                                </svg>
                                            }
                                            label="Configuración"
                                            onClick={() => setMenuOpen(false)}
                                        />
                                    </div>

                                    <div className="py-1" style={{ borderTop: '1px solid var(--gray-200)' }}>
                                        <button
                                            onClick={() => {
                                                setMenuOpen(false)
                                                onLogout?.()
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-red-50 text-left"
                                            style={{ color: '#EF4444' }}
                                        >
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                                <polyline points="16 17 21 12 16 7" />
                                                <line x1="21" y1="12" x2="9" y2="12" />
                                            </svg>
                                            Cerrar sesión
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto">{children}</main>
                </div>
            </div>

            {helpOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(15, 23, 42, 0.45)' }}
                    onClick={() => setHelpOpen(false)}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="help-title"
                        className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border"
                        style={{
                            maxHeight: 'min(90vh, 680px)',
                            background: 'var(--white)',
                            borderColor: 'var(--gray-200)',
                            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
                        }}
                        onClick={event => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 px-6 py-5" style={{ background: 'var(--primary-light)' }}>
                            <div>
                                <h2 id="help-title" className="text-lg font-bold" style={{ color: 'var(--dark)', fontFamily: 'Poppins, sans-serif' }}>
                                    Centro de ayuda
                                </h2>
                                <p className="mt-1 text-sm" style={{ color: 'var(--gray-500)' }}>
                                    Guía rápida para usar VeterinarIA.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setHelpOpen(false)}
                                className="text-sm font-medium"
                                style={{ color: 'var(--gray-500)' }}
                                aria-label="Cerrar centro de ayuda"
                            >
                                Cerrar
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
                            <HelpSection title="Tu perfil">
                                Abre el menú de tu usuario y selecciona <strong>Ver mi perfil</strong>. Desde ahí puedes actualizar tu nombre o cambiar tu contraseña; para cambiarla necesitas ingresar la contraseña actual.
                            </HelpSection>
                            <HelpSection title="Cuentas de usuario">
                                El registro disponible desde el inicio de sesión crea cuentas de veterinario. Para crear una cuenta de administrador o gestionar otros roles, usa <strong>Nuevo usuario</strong> desde el dashboard con una cuenta de administrador.
                            </HelpSection>
                            <HelpSection title="Navegación">
                                Usa las opciones del menú lateral para cambiar de sección. Algunos módulos todavía están en construcción y mostrarán un aviso cuando aún no estén disponibles.
                            </HelpSection>
                        </div>

                        <div className="shrink-0 px-6 pb-8">
                            <button
                                type="button"
                                onClick={() => setHelpOpen(false)}
                                className="w-full rounded-lg px-4 py-3 text-sm font-semibold"
                                style={{ background: 'var(--primary)', color: 'white' }}
                            >
                                Entendido
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {profileOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(15, 23, 42, 0.45)' }}
                    onClick={() => setProfileOpen(false)}
                >
                    {/* Altura máxima + scroll interno: si el contenido supera la ventana, no se corta arriba. */}
                    <div
                        className="flex w-full max-w-xl flex-col rounded-2xl border p-0 overflow-hidden"
                        style={{
                            maxHeight: 'min(92vh, 720px)',
                            background: 'var(--white)',
                            borderColor: 'var(--gray-200)',
                            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
                        }}
                        onClick={event => event.stopPropagation()}
                    >
                        <div className="shrink-0 px-6 py-5" style={{ background: 'var(--primary-light)', borderBottom: '1px solid var(--gray-200)' }}>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className="flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-white flex-shrink-0"
                                        style={{ background: 'var(--secondary)' }}
                                    >
                                        {initials}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-base font-semibold truncate" style={{ color: 'var(--dark)' }}>
                                            {loadingUser ? 'Cargando...' : displayName}
                                        </div>
                                        <div className="text-xs" style={{ color: 'var(--gray-500)' }}>
                                            {loadingUser ? 'Usuario' : roleLabel}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setProfileOpen(false)}
                                    className="text-sm font-medium"
                                    style={{ color: 'var(--gray-500)' }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>

                        <div className="shrink-0 p-4" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                            <div className="flex flex-wrap gap-2 rounded-xl p-1" style={{ background: 'var(--gray-100)' }}>
                                {[
                                    { key: 'resumen', label: 'Resumen' },
                                    { key: 'editar', label: 'Editar perfil' },
                                    { key: 'password', label: 'Contraseña' },
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => {
                                            setProfileError('')
                                            setProfileSuccess('')
                                            setProfileTab(tab.key as 'resumen' | 'editar' | 'password')
                                        }}
                                        className="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                                        style={{
                                            background: profileTab === tab.key ? 'var(--white)' : 'transparent',
                                            color: profileTab === tab.key ? 'var(--primary)' : 'var(--gray-500)',
                                            boxShadow: profileTab === tab.key ? '0 2px 10px rgba(15,23,42,0.08)' : 'none',
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
                            {profileError && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                                    {profileError}
                                </div>
                            )}

                            {profileSuccess && (
                                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                                    {profileSuccess}
                                </div>
                            )}

                            {profileTab === 'resumen' && (
                                <>
                                    <div className="rounded-xl p-4" style={{ background: 'var(--gray-100)', border: '1px solid var(--gray-200)' }}>
                                        <div className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--gray-500)' }}>
                                            Nombre
                                        </div>
                                        <div className="mt-1 text-sm font-medium" style={{ color: 'var(--dark)' }}>
                                            {user?.nombre || 'No disponible'}
                                        </div>
                                    </div>

                                    <div className="rounded-xl p-4" style={{ background: 'var(--gray-100)', border: '1px solid var(--gray-200)' }}>
                                        <div className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--gray-500)' }}>
                                            Email
                                        </div>
                                        <div className="mt-1 text-sm font-medium" style={{ color: 'var(--dark)' }}>
                                            {user?.email || 'No disponible'}
                                        </div>
                                    </div>

                                    <div className="rounded-xl p-4" style={{ background: 'var(--gray-100)', border: '1px solid var(--gray-200)' }}>
                                        <div className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--gray-500)' }}>
                                            Rol
                                        </div>
                                        <div className="mt-1 text-sm font-medium" style={{ color: 'var(--dark)' }}>
                                            {roleLabel}
                                        </div>
                                    </div>
                                </>
                            )}

                            {profileTab === 'editar' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--dark)' }}>
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={LIMITES.nombre}
                                            value={profileDraft}
                                            onChange={event => setProfileDraft(event.target.value)}
                                            placeholder="Tu nombre completo"
                                            className="w-full rounded-lg px-4 py-2.5 text-sm outline-none"
                                            style={{
                                                border: '1.5px solid var(--gray-200)',
                                                color: 'var(--dark)',
                                                background: 'var(--white)',
                                            }}
                                        />
                                        <AvisoLimite valor={profileDraft} max={LIMITES.nombre} />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const normalizedName = profileDraft.trim()
                                            const nombreError = validarNombre(normalizedName)
                                            if (nombreError) {
                                                setProfileError(nombreError)
                                                return
                                            }

                                            setSavingProfile(true)
                                            setProfileError('')
                                            setProfileSuccess('')

                                            try {
                                                const updatedUser = await authService.updateProfile({ nombre: normalizedName })
                                                setUser(updatedUser)
                                                setProfileSuccess('Perfil actualizado correctamente.')
                                                setProfileTab('resumen')
                                            } catch (error) {
                                                setProfileError(getErrorMessage(error))
                                            } finally {
                                                setSavingProfile(false)
                                            }
                                        }}
                                        disabled={savingProfile}
                                        className="w-full rounded-lg px-4 py-3 text-sm font-semibold"
                                        style={{ background: 'var(--primary)', color: 'white', opacity: savingProfile ? 0.7 : 1 }}
                                    >
                                        {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                                    </button>
                                </div>
                            )}

                            {profileTab === 'password' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--dark)' }}>
                                            Contraseña actual
                                        </label>
                                        <input
                                            type="password"
                                            maxLength={LIMITES.passwordMax}
                                            value={passwordForm.actual}
                                            onChange={event => setPasswordForm(current => ({ ...current, actual: event.target.value }))}
                                            className="w-full rounded-lg px-4 py-2.5 text-sm outline-none"
                                            style={{ border: '1.5px solid var(--gray-200)', color: 'var(--dark)', background: 'var(--white)' }}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--dark)' }}>
                                            Nueva contraseña
                                        </label>
                                        <input
                                            type="password"
                                            maxLength={LIMITES.passwordMax}
                                            value={passwordForm.nueva}
                                            onChange={event => setPasswordForm(current => ({ ...current, nueva: event.target.value }))}
                                            className="w-full rounded-lg px-4 py-2.5 text-sm outline-none"
                                            style={{ border: '1.5px solid var(--gray-200)', color: 'var(--dark)', background: 'var(--white)' }}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--dark)' }}>
                                            Confirmar nueva contraseña
                                        </label>
                                        <input
                                            type="password"
                                            maxLength={LIMITES.passwordMax}
                                            value={passwordForm.confirmacion}
                                            onChange={event => setPasswordForm(current => ({ ...current, confirmacion: event.target.value }))}
                                            className="w-full rounded-lg px-4 py-2.5 text-sm outline-none"
                                            style={{ border: '1.5px solid var(--gray-200)', color: 'var(--dark)', background: 'var(--white)' }}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (!passwordForm.actual || !passwordForm.nueva || !passwordForm.confirmacion) {
                                                setProfileError('Completa todos los campos para cambiar la contraseña.')
                                                return
                                            }

                                            const passwordError = validarPasswordNueva(passwordForm.nueva)
                                            if (passwordError) {
                                                setProfileError(passwordError)
                                                return
                                            }

                                            if (passwordForm.nueva !== passwordForm.confirmacion) {
                                                setProfileError('La nueva contraseña y la confirmación no coinciden.')
                                                return
                                            }

                                            setSavingPassword(true)
                                            setProfileError('')
                                            setProfileSuccess('')

                                            try {
                                                await authService.changePassword({
                                                    passwordActual: passwordForm.actual,
                                                    passwordNueva: passwordForm.nueva,
                                                })
                                                setPasswordForm({ actual: '', nueva: '', confirmacion: '' })
                                                setProfileSuccess('Contraseña actualizada correctamente.')
                                                setProfileTab('resumen')
                                            } catch (error) {
                                                setProfileError(getErrorMessage(error))
                                            } finally {
                                                setSavingPassword(false)
                                            }
                                        }}
                                        disabled={savingPassword}
                                        className="w-full rounded-lg px-4 py-3 text-sm font-semibold"
                                        style={{ background: 'var(--secondary)', color: 'white', opacity: savingPassword ? 0.7 : 1 }}
                                    >
                                        {savingPassword ? 'Actualizando...' : 'Cambiar contraseña'}
                                    </button>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    setProfileOpen(false)
                                    onLogout?.()
                                }}
                                className="w-full rounded-lg px-4 py-3 text-sm font-semibold"
                                style={{ background: '#EF4444', color: 'white' }}
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

function HelpSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div>
            <h3 className="mb-1 text-sm font-semibold" style={{ color: 'var(--dark)' }}>{title}</h3>
            <p className="text-sm leading-6" style={{ color: 'var(--gray-500)' }}>{children}</p>
        </div>
    )
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 text-left"
            style={{ color: 'var(--dark)' }}
        >
            <span style={{ color: 'var(--gray-500)' }}>{icon}</span>
            {label}
        </button>
    )
}
