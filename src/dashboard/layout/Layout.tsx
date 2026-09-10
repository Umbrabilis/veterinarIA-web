import { ReactNode } from 'react'
import {
    HuesoLogo, BoneIcon, HomeIcon, CalendarIcon, UsersIcon, PawIcon,
    ClipboardIcon, BarChartIcon, UserIcon, HelpCircleIcon, ChevronDownIcon
} from './icons'

type Screen = 'dashboard' | 'agenda' | 'propietarios' | 'mascotas' | 'consultas' | 'reportes' | 'usuarios'

interface Props {
    children: ReactNode
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

export default function Layout({ children, activeScreen, onNavigate }: Props) {
    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--gray-100)' }}>
            {/* Sidebar */}
            <aside
                className="flex flex-col flex-shrink-0 h-full"
                style={{
                    width: 'var(--sidebar-width)',
                    background: 'var(--primary)',
                    color: 'white',
                }}
            >
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
                    <HuesoLogo size={32} color="white" />
                </div>

                {/* Nav */}
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

                {/* Help */}
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

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
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
                    <div className="flex items-center gap-2 cursor-pointer group">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                            style={{ background: 'var(--secondary)' }}
                        >
                            A
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-semibold leading-tight" style={{ color: 'var(--dark)' }}>Dra. Ana Pérez</div>
                            <div className="text-xs" style={{ color: 'var(--gray-500)' }}>Veterinaria</div>
                        </div>
                        <span style={{ color: 'var(--gray-400)' }}><ChevronDownIcon /></span>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
