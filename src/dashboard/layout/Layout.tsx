import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
    HuesoLogo, HomeIcon, CalendarIcon, UsersIcon, PawIcon,
    ClipboardIcon, BarChartIcon, UserIcon, HelpCircleIcon, ChevronDownIcon
} from '../../shared/icons'
import authService, { type UserProfile } from '../../api/authService'

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
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loadingUser, setLoadingUser] = useState(true)
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const loadUser = async () => {
            try {
                const profile = await authService.getProfile()
                setUser(profile)
            } catch (error: any) {
                console.error('Error loading profile status:', error.response?.status)
                console.error('Error loading profile payload:', error.response?.data)
                console.error('Error loading profile full:', error)
                setUser(null)
            } finally {
                setLoadingUser(false)
            }
        }

        loadUser()
    }, [])

    useEffect(() => {
        function handleClick(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

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
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--gray-100)' }}>
            <aside
                className="flex flex-col flex-shrink-0 h-full"
                style={{
                    width: 'var(--sidebar-width)',
                    background: 'var(--primary)',
                    color: 'white',
                }}
            >
                <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
                    <HuesoLogo size={32} color="white" />
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

                    <div className="relative" ref={menuRef}>
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
                                        onClick={() => setMenuOpen(false)}
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
