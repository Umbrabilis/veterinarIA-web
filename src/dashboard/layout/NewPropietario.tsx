import { useState, useEffect, useRef } from 'react'

interface Props {
    onClose: () => void
    onSave: (data: OwnerForm) => void
}

interface OwnerForm {
    nombre: string
    documento: string
    telefono: string
    email: string
    direccion: string
    aceptaTratamientoDatos: boolean
}

const empty: OwnerForm = {
    nombre: '',
    documento: '',
    telefono: '',
    email: '',
    direccion: '',
    aceptaTratamientoDatos: false,
}

export default function NewOwnerModal({ onClose, onSave }: Props) {
    const [form, setForm] = useState<OwnerForm>(empty)
    const [errors, setErrors] = useState<Partial<Record<keyof OwnerForm, string>>>({})
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    function set<K extends keyof OwnerForm>(field: K, value: OwnerForm[K]) {
        setForm(prev => ({ ...prev, [field]: value }))
        setErrors(prev => ({ ...prev, [field]: '' }))
    }

    function validate() {
        const e: Partial<Record<keyof OwnerForm, string>> = {}
        if (!form.nombre.trim()) e.nombre = 'Requerido'
        if (!form.documento.trim()) e.documento = 'Requerido'
        if (!form.telefono.trim()) e.telefono = 'Requerido'
        if (form.email && !form.email.includes('@')) e.email = 'Email inválido'
        if (!form.aceptaTratamientoDatos) e.aceptaTratamientoDatos = 'Debe aceptar para continuar'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (validate()) onSave(form)
    }

    const inputStyle: React.CSSProperties = {
        border: '1.5px solid var(--gray-200)',
        borderRadius: 8,
        padding: '9px 13px',
        fontSize: 14,
        color: 'var(--dark)',
        background: 'var(--white)',
        outline: 'none',
        width: '100%',
        transition: 'border-color 0.15s',
    }

    function focusBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
        e.target.style.borderColor = 'var(--primary)'
    }
    function blurBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof OwnerForm) {
        e.target.style.borderColor = errors[field] ? '#EF4444' : 'var(--gray-200)'
    }

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(17, 24, 39, 0.45)', backdropFilter: 'blur(2px)' }}
            onMouseDown={e => { if (e.target === overlayRef.current) onClose() }}
        >
            <div
                className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
                style={{
                    background: 'var(--white)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                    maxHeight: '90vh',
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-5 flex-shrink-0"
                    style={{ borderBottom: '1px solid var(--gray-200)' }}
                >
                    <div>
                        <h2 className="font-bold text-base" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                            Nuevo propietario
                        </h2>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--gray-500)' }}>
                            Completá los datos para registrar al propietario.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
                        style={{ color: 'var(--gray-400)' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

                    {/* Nombre */}
                    <Field label="Nombre completo" required error={errors.nombre}>
                        <input
                            style={inputStyle}
                            placeholder="María López"
                            value={form.nombre}
                            onChange={e => set('nombre', e.target.value)}
                            onFocus={focusBorder}
                            onBlur={e => blurBorder(e, 'nombre')}
                        />
                    </Field>

                    {/* Documento + Teléfono */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Documento / DNI" required error={errors.documento}>
                            <input
                                style={inputStyle}
                                placeholder="30.123.456"
                                value={form.documento}
                                onChange={e => set('documento', e.target.value)}
                                onFocus={focusBorder}
                                onBlur={e => blurBorder(e, 'documento')}
                            />
                        </Field>
                        <Field label="Teléfono" required error={errors.telefono}>
                            <input
                                style={inputStyle}
                                placeholder="+54 9 11 2345-6789"
                                value={form.telefono}
                                onChange={e => set('telefono', e.target.value)}
                                onFocus={focusBorder}
                                onBlur={e => blurBorder(e, 'telefono')}
                            />
                        </Field>
                    </div>

                    {/* Email */}
                    <Field label="Email" error={errors.email}>
                        <input
                            style={inputStyle}
                            type="email"
                            placeholder="maria@email.com"
                            value={form.email}
                            onChange={e => set('email', e.target.value)}
                            onFocus={focusBorder}
                            onBlur={e => blurBorder(e, 'email')}
                        />
                    </Field>

                    {/* Dirección */}
                    <Field label="Dirección" error={errors.direccion}>
                        <input
                            style={inputStyle}
                            placeholder="Av. Corrientes 1234, CABA"
                            value={form.direccion}
                            onChange={e => set('direccion', e.target.value)}
                            onFocus={focusBorder}
                            onBlur={e => blurBorder(e, 'direccion')}
                        />
                    </Field>

                    {/* Consentimiento */}
                    <div
                        className="rounded-xl p-4"
                        style={{
                            background: errors.aceptaTratamientoDatos ? '#FEF2F2' : 'var(--gray-100)',
                            border: `1.5px solid ${errors.aceptaTratamientoDatos ? '#FECACA' : 'transparent'}`,
                            transition: 'all 0.15s',
                        }}
                    >
                        <label className="flex items-start gap-3 cursor-pointer">
                            <div className="relative flex-shrink-0 mt-0.5">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={form.aceptaTratamientoDatos}
                                    onChange={e => set('aceptaTratamientoDatos', e.target.checked)}
                                />
                                <div
                                    className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                                    style={{
                                        background: form.aceptaTratamientoDatos ? 'var(--primary)' : 'var(--white)',
                                        border: `2px solid ${form.aceptaTratamientoDatos ? 'var(--primary)' : 'var(--gray-300)'}`,
                                    }}
                                >
                                    {form.aceptaTratamientoDatos && (
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <div>
                <span className="text-sm font-medium" style={{ color: 'var(--dark)' }}>
                  Acepta el tratamiento de datos personales <span style={{ color: '#EF4444' }}>*</span>
                </span>
                                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--gray-500)' }}>
                                    El propietario autoriza a la clínica a registrar y procesar sus datos personales con fines de atención veterinaria, conforme a la Ley 25.326 de Protección de Datos Personales.
                                </p>
                            </div>
                        </label>
                        {errors.aceptaTratamientoDatos && (
                            <p className="text-xs mt-2 ml-8" style={{ color: '#EF4444' }}>
                                {errors.aceptaTratamientoDatos}
                            </p>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div
                    className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0"
                    style={{ borderTop: '1px solid var(--gray-200)' }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100"
                        style={{ color: 'var(--gray-500)', border: '1.5px solid var(--gray-200)' }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{ background: 'var(--primary)' }}
                    >
                        Guardar propietario
                    </button>
                </div>
            </div>
        </div>
    )
}

function Field({
                   label, required, error, children,
               }: {
    label: string
    required?: boolean
    error?: string
    children: React.ReactNode
}) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--dark)' }}>
                {label}
                {required && <span className="ml-0.5" style={{ color: '#EF4444' }}>*</span>}
            </label>
            {children}
            {error && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{error}</p>}
        </div>
    )
}
