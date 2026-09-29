import { useState } from 'react'
import { ClipboardIcon, HuesoLogo, PawIcon, SparklesIcon } from '../../shared/icons'
import authService from '../../api/authService'

interface Props {
    onBack: () => void
    onRegister: () => void
    isAdminRegistration?: boolean
}

const roles = ['ADMINISTRADOR', 'VETERINARIO']

type RegistrationForm = {
    nombre: string
    email: string
    rol: string
    password: string
    confirm: string
}

function validateForm(form: RegistrationForm, availableRoles: string[]): Partial<RegistrationForm> {
    const errors: Partial<RegistrationForm> = {}
    const nombre = form.nombre.trim()
    const email = form.email.trim()

    if (!nombre) {
        errors.nombre = 'Ingresa el nombre'
    } else if (nombre.length > 150) {
        errors.nombre = 'El nombre no puede superar 150 caracteres'
    }

    if (!email) {
        errors.email = 'Ingresa el email'
    } else if (email.length > 255) {
        errors.email = 'El email no puede superar 255 caracteres'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Ingresa un email válido'
    }

    if (!availableRoles.includes(form.rol)) {
        errors.rol = 'Selecciona un rol válido'
    }

    if (form.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres'
    } else if (form.password.length > 72) {
        errors.password = 'La contraseña no puede superar 72 caracteres'
    }

    if (!form.confirm) {
        errors.confirm = 'Confirma la contraseña'
    } else if (form.confirm !== form.password) {
        errors.confirm = 'Las contraseñas no coinciden'
    }

    return errors
}

export default function Register({ onBack, onRegister, isAdminRegistration = false }: Props) {
    const availableRoles = isAdminRegistration ? roles : ['VETERINARIO']
    const [form, setForm] = useState({
        nombre: '',
        email: '',
        rol: isAdminRegistration ? '' : 'VETERINARIO',
        password: '',
        confirm: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [errors, setErrors] = useState<Partial<typeof form>>({})
    const [loading, setLoading] = useState(false)
    const [serverError, setServerError] = useState('')

    function set(field: keyof typeof form, value: string) {
        setForm(prev => ({ ...prev, [field]: value }))
        setErrors(prev => ({ ...prev, [field]: '' }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const validationErrors = validateForm(form, availableRoles)
        setErrors(validationErrors)
        if (Object.keys(validationErrors).length > 0) return

        setLoading(true)
        setServerError('')
        try {
            await authService.register({
                nombre: form.nombre.trim(),
                email: form.email.trim(),
                password: form.password,
                rol: form.rol,
            })
            onRegister()
        } catch (err: any) {
            setServerError(err.response?.data?.message || 'Error al crear la cuenta')
        } finally {
            setLoading(false)
        }
    }

    const inputBase: React.CSSProperties = {
        border: '1.5px solid var(--gray-200)',
        color: 'var(--dark)',
        background: 'var(--white)',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 14,
        width: '100%',
        outline: 'none',
        transition: 'border-color 0.15s',
    }

    return (
        <div className="min-h-screen flex">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden flex-col justify-between">
                <img
                    src="https://images.unsplash.com/photo-1693615775129-f2004d6e3e0b?w=900&h=1200&fit=crop&auto=format"
                    alt="Golden retriever"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(160deg, rgba(20,187,166,0.80) 0%, rgba(79,70,229,0.70) 100%)' }}
                />
                <div className="relative z-10 p-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-xl p-2">
                            <HuesoLogo size={28} color="white" />
                        </div>
                        <span className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
              VeterinarIA
            </span>
                    </div>
                </div>
                <div className="relative z-10 p-10">
                    <div className="space-y-4">
                        {[
                            { icon: <PawIcon size={18} color="white" />, text: 'Registra y sigue a cada mascota' },
                            { icon: <ClipboardIcon size={18} color="white" />, text: 'Historial clínico siempre disponible' },
                            { icon: <SparklesIcon size={18} color="white" />, text: 'Resúmenes generados con IA para los dueños' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white">
                                    {item.icon}
                                </span>
                                <span className="text-white/90 text-sm font-medium">{item.text}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-white/60 text-xs mt-8">
                        Cuidado, seguimiento y bienestar para cada mascota.
                    </p>
                </div>
            </div>

            {/* Right: form */}
            <div className="flex-1 flex items-start justify-center overflow-y-auto bg-white">
                <div className="w-full max-w-md px-8 py-10">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-6 lg:hidden">
                        <HuesoLogo size={22} color="var(--primary)" />
                        <span className="font-bold text-base" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
              VeterinarIA
            </span>
                    </div>

                            <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: 'var(--primary)' }}
                    >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
            </svg>
            {isAdminRegistration ? 'Regresar al dashboard' : 'Volver a iniciar sesión'}
                    </button>

                    <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
            Crear cuenta
                    </h2>
                    <p className="text-sm mb-7" style={{ color: 'var(--gray-500)' }}>
                        Completa tus datos para registrarte en el sistema.
                    </p>

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        <Field label="Nombre" error={errors.nombre}>
                            <input
                                style={inputBase}
                                type="text"
                                maxLength={150}
                                required
                                aria-invalid={Boolean(errors.nombre)}
                                placeholder="Ana"
                                value={form.nombre}
                                onChange={e => set('nombre', e.target.value)}
                                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                                onBlur={e => (e.target.style.borderColor = errors.nombre ? '#EF4444' : 'var(--gray-200)')}
                            />
                        </Field>

                        {/* Email */}
                        <Field label="Email institucional" error={errors.email}>
                            <input
                                style={inputBase}
                                type="email"
                                maxLength={255}
                                required
                                aria-invalid={Boolean(errors.email)}
                                placeholder="usuario@clinica.com"
                                value={form.email}
                                onChange={e => set('email', e.target.value)}
                                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                                onBlur={e => (e.target.style.borderColor = errors.email ? '#EF4444' : 'var(--gray-200)')}
                            />
                        </Field>

                        {isAdminRegistration ? (
                        <Field label="Rol en la clínica" error={errors.rol}>
                            <select
                                style={{ ...inputBase, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
                                required
                                aria-invalid={Boolean(errors.rol)}
                                value={form.rol}
                                onChange={e => set('rol', e.target.value)}
                                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                                onBlur={e => (e.target.style.borderColor = errors.rol ? '#EF4444' : 'var(--gray-200)')}
                            >
                                <option value="">Seleccionar rol</option>
                                {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </Field>
                        ) : (
                            <Field label="Rol en la clínica">
                                <div style={inputBase}>VETERINARIO</div>
                            </Field>
                        )}

                        {/* Password */}
                        <Field label="Contraseña" error={errors.password} hint="Entre 8 y 72 caracteres">
                            <div className="relative">
                                <input
                                    style={inputBase}
                                    type={showPassword ? 'text' : 'password'}
                                    minLength={8}
                                    maxLength={72}
                                    required
                                    aria-invalid={Boolean(errors.password)}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => set('password', e.target.value)}
                                    onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                                    onBlur={e => (e.target.style.borderColor = errors.password ? '#EF4444' : 'var(--gray-200)')}
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
                            {form.password.length > 0 && (
                                <PasswordStrength password={form.password} />
                            )}
                        </Field>

                        {/* Confirm */}
                        <Field label="Confirmar contraseña" error={errors.confirm}>
                            <div className="relative">
                                <input
                                    style={inputBase}
                                    type={showConfirm ? 'text' : 'password'}
                                    maxLength={72}
                                    required
                                    aria-invalid={Boolean(errors.confirm)}
                                    placeholder="••••••••"
                                    value={form.confirm}
                                    onChange={e => set('confirm', e.target.value)}
                                    onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                                    onBlur={e => (e.target.style.borderColor = errors.confirm ? '#EF4444' : 'var(--gray-200)')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    style={{ color: 'var(--gray-400)' }}
                                >
                                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </Field>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 mt-2"
                            style={{ background: 'var(--primary)' }}
                        >
                            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                        </button>
                        {serverError && (
                            <p className="text-red-500 text-sm text-center mt-2">{serverError}</p>
                        )}
                    </form>

                </div>
            </div>
        </div>
    )
}

function Field({
                   label, error, hint, children,
               }: {
    label: string
    error?: string
    hint?: string
    children: React.ReactNode
}) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--dark)' }}>
                {label}
            </label>
            {children}
            {error ? (
                <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{error}</p>
            ) : hint ? (
                <p className="text-xs mt-1" style={{ color: 'var(--gray-400)' }}>{hint}</p>
            ) : null}
        </div>
    )
}

function PasswordStrength({ password }: { password: string }) {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    const labels = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte']
    const colors = ['#EF4444', '#F59E08', '#14BBA6', '#4F46E5']

    return (
        <div className="mt-2 space-y-1">
            <div className="flex gap-1">
                {[0, 1, 2, 3].map(i => (
                    <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: i < strength ? colors[strength - 1] : 'var(--gray-200)' }}
                    />
                ))}
            </div>
            <p className="text-xs" style={{ color: colors[strength - 1] ?? 'var(--gray-400)' }}>
                {strength > 0 ? labels[strength - 1] : ''}
            </p>
        </div>
    )
}

function EyeIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    )
}

function EyeOffIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
    )
}
