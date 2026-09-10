import { useState } from 'react'
import { HuesoLogo } from '../../shared/icons'

interface Props {
    onLogin: () => void
    onGoToRegister?: () => void
}

export default function Login({ onLogin, onGoToRegister }: Props) {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    return (
        <div className="min-h-screen flex">
            {/* Left: hero image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1625794084867-8ddd239946b1?w=900&h=1200&fit=crop&auto=format"
                    alt="Golden retriever puppy"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.75) 0%, rgba(20,187,166,0.55) 100%)' }} />
                <div className="relative z-10 flex flex-col justify-end p-12 text-white">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-white/20 rounded-xl p-2">
                            <HuesoLogo size={28} color="white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Bienvenido/a
                    </h1>
                    <p className="text-white/80 text-lg leading-relaxed max-w-sm">
                        Gestiona la salud de tus mascotas de forma más simple y eficiente.
                    </p>
                </div>
            </div>

            {/* Right: login form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-sm">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="rounded-xl p-2.5" style={{ background: 'var(--primary-light)' }}>
                            <HuesoLogo size={24} color="var(--primary)" />
                        </div>
                        <div>
                            <div className="font-bold text-base leading-tight" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                                VeterinarIA
                            </div>
                            <div className="text-xs" style={{ color: 'var(--gray-500)' }}>Sistema de Gestión Clínica</div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                        Iniciar sesión
                    </h2>
                    <p className="text-sm mb-8" style={{ color: 'var(--gray-500)' }}>
                        Accedé a tu cuenta para continuar
                    </p>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--dark)' }}>
                                Usuario
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="usuario@clinica.com"
                                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all placeholder:text-gray-400 placeholder:opacity-70"
                                style={{
                                    border: '1.5px solid var(--gray-200)',
                                    color: 'var(--dark)',
                                    background: 'var(--white)',
                                }}
                                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                                onBlur={e => (e.target.style.borderColor = 'var(--gray-200)')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--dark)' }}>
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 pr-11 rounded-lg text-sm outline-none transition-all placeholder:text-gray-400 placeholder:opacity-70"
                                    style={{
                                        border: '1.5px solid var(--gray-200)',
                                        color: 'var(--dark)',
                                        background: 'var(--white)',
                                    }}
                                    onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                                    onBlur={e => (e.target.style.borderColor = 'var(--gray-200)')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    style={{ color: 'var(--gray-400)' }}
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            <div className="flex justify-end mt-1.5">
                                <button className="text-xs font-medium" style={{ color: 'var(--secondary)' }}>
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={onLogin}
                            className="w-full py-3 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99]"
                            style={{ background: 'var(--primary)' }}
                        >
                            Iniciar sesión
                        </button>
                    </div>

                    <p className="text-center text-sm mt-6" style={{ color: 'var(--gray-500)' }}>
                        ¿Nuevo en el sistema?{' '}
                        <button type="button" onClick={onGoToRegister} className="font-semibold" style={{ color: 'var(--primary)' }}>
                            Crear cuenta
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

function EyeIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    )
}

function EyeOffIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
    )
}
