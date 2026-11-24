import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import authService, { type UserProfile } from '../../api/authService'
import mascotasService, {
    type EspecieMascota,
    type Mascota,
    type MascotaRequest,
    type Propietario,
    type SexoMascota,
} from '../../api/mascotasService'

const PAGE_SIZE = 20
const species: { value: EspecieMascota; label: string }[] = [
    { value: 'PERRO', label: 'Perro' },
    { value: 'GATO', label: 'Gato' },
    { value: 'AVE', label: 'Ave' },
    { value: 'CONEJO', label: 'Conejo' },
    { value: 'ROEDOR', label: 'Roedor' },
    { value: 'REPTIL', label: 'Reptil' },
    { value: 'OTRO', label: 'Otro' },
]
const sexes: { value: SexoMascota; label: string }[] = [
    { value: 'MACHO', label: 'Macho' },
    { value: 'HEMBRA', label: 'Hembra' },
    { value: 'DESCONOCIDO', label: 'Desconocido' },
]

interface MascotaForm {
    propietarioId: string
    nombre: string
    especie: EspecieMascota
    raza: string
    sexo: SexoMascota
    fechaNacimiento: string
    pesoKg: string
    color: string
    activo: boolean
}

const emptyForm: MascotaForm = {
    propietarioId: '',
    nombre: '',
    especie: 'PERRO',
    raza: '',
    sexo: 'DESCONOCIDO',
    fechaNacimiento: '',
    pesoKg: '',
    color: '',
    activo: true,
}

function toRequest(form: MascotaForm): MascotaRequest {
    return {
        propietarioId: form.propietarioId,
        nombre: form.nombre.trim(),
        especie: form.especie,
        raza: form.raza.trim() || undefined,
        sexo: form.sexo,
        fechaNacimiento: form.fechaNacimiento || undefined,
        pesoKg: form.pesoKg ? Number(form.pesoKg) : undefined,
        color: form.color.trim() || undefined,
        activo: form.activo,
    }
}

function errorMessage(error: unknown): string {
    if (axios.isAxiosError<{ message?: string; detalles?: string | string[] }>(error)) {
        const data = error.response?.data
        if (Array.isArray(data?.detalles)) return data.detalles.join(', ')
        if (data?.detalles) return String(data.detalles)
        if (data?.message) return data.message
        if (error.response?.status === 403) return 'No tienes permiso para realizar esta acción.'
        if (error.response?.status === 404) return 'No se encontró el registro solicitado.'
    }
    return 'No se pudo completar la operación. Intenta de nuevo.'
}

function formatDate(value?: string) {
    if (!value) return '—'
    const date = new Date(`${value}T00:00:00`)
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es')
}

function labelFor(values: { value: string; label: string }[], value: string) {
    return values.find(item => item.value === value)?.label || value
}

export default function MascotasPage() {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loadingProfile, setLoadingProfile] = useState(true)
    const [pets, setPets] = useState<Mascota[]>([])
    const [ownerNames, setOwnerNames] = useState<Record<string, string>>({})
    const [loadingPets, setLoadingPets] = useState(false)
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalPets, setTotalPets] = useState(0)
    const [reloadKey, setReloadKey] = useState(0)
    const [error, setError] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingPet, setEditingPet] = useState<Mascota | null>(null)
    const [form, setForm] = useState<MascotaForm>(emptyForm)
    const [owners, setOwners] = useState<Propietario[]>([])
    const [ownerSearch, setOwnerSearch] = useState('')
    const [ownerLoading, setOwnerLoading] = useState(false)
    const [ownerError, setOwnerError] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        let active = true
        authService.getProfile()
            .then(profile => {
                if (active) setUser(profile)
            })
            .catch(() => {
                if (active) setError('No se pudo cargar tu perfil. Vuelve a iniciar sesión e inténtalo de nuevo.')
            })
            .finally(() => {
                if (active) setLoadingProfile(false)
            })
        return () => { active = false }
    }, [])

    useEffect(() => {
        if (!user) return
        let active = true
        setLoadingPets(true)
        setError('')

        const isOwner = user.rol.toUpperCase() === 'PROPIETARIO'
        const load = isOwner
            ? mascotasService.listarMias().then(result => ({
                contenido: result,
                totalElementos: result.length,
                totalPaginas: 1,
            }))
            : mascotasService.listar(page, PAGE_SIZE)

        load.then(async result => {
            if (!active) return
            const rows = result.contenido
            setPets(rows)
            setTotalPets(result.totalElementos)
            setTotalPages(result.totalPaginas)
            if (isOwner) setPage(0)

            if (!isOwner && rows.length > 0) {
                const ownerIds = [...new Set(rows.map(pet => pet.propietarioId))]
                const ownerResults = await Promise.allSettled(
                    ownerIds.map(id => mascotasService.obtenerPropietario(id)),
                )
                if (!active) return
                const names: Record<string, string> = {}
                ownerResults.forEach((ownerResult, index) => {
                    if (ownerResult.status === 'fulfilled') {
                        names[ownerIds[index]] = ownerResult.value.nombre
                    }
                })
                setOwnerNames(current => ({ ...current, ...names }))
            }
        }).catch(loadError => {
            if (active) setError(errorMessage(loadError))
        }).finally(() => {
            if (active) setLoadingPets(false)
        })

        return () => { active = false }
    }, [user, page, reloadKey])

    const isStaff = user?.rol.toUpperCase() === 'ADMINISTRADOR' || user?.rol.toUpperCase() === 'VETERINARIO'

    async function searchOwners(query: string, selectedOwnerId?: string) {
        setOwnerLoading(true)
        setOwnerError('')
        try {
            const results = await mascotasService.buscarPropietarios(query)
            if (selectedOwnerId && !results.some(owner => owner.id === selectedOwnerId)) {
                try {
                    results.unshift(await mascotasService.obtenerPropietario(selectedOwnerId))
                } catch {
                    setOwnerError('No se pudo cargar el propietario asociado a esta mascota.')
                }
            }
            setOwners(results)
        } catch (searchError) {
            setOwnerError(errorMessage(searchError))
        } finally {
            setOwnerLoading(false)
        }
    }

    function openCreateDialog() {
        setEditingPet(null)
        setForm(emptyForm)
        setOwners([])
        setOwnerSearch('')
        setOwnerError('')
        setError('')
        setDialogOpen(true)
        void searchOwners('')
    }

    function openEditDialog(pet: Mascota) {
        setEditingPet(pet)
        setForm({
            propietarioId: pet.propietarioId,
            nombre: pet.nombre,
            especie: pet.especie,
            raza: pet.raza || '',
            sexo: pet.sexo,
            fechaNacimiento: pet.fechaNacimiento || '',
            pesoKg: pet.pesoKg == null ? '' : String(pet.pesoKg),
            color: pet.color || '',
            activo: pet.activo,
        })
        setOwners([])
        setOwnerSearch(ownerNames[pet.propietarioId] || '')
        setOwnerError('')
        setError('')
        setDialogOpen(true)
        void searchOwners(ownerNames[pet.propietarioId] || '', pet.propietarioId)
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!form.propietarioId) {
            setOwnerError('Selecciona un propietario para la mascota.')
            return
        }
        if (form.pesoKg && (!Number.isFinite(Number(form.pesoKg)) || Number(form.pesoKg) < 0.01 || Number(form.pesoKg) > 9999.99)) {
            setError('El peso debe estar entre 0.01 y 9999.99 kg.')
            return
        }

        setSaving(true)
        setError('')
        try {
            const data = toRequest(form)
            if (editingPet) {
                await mascotasService.actualizar(editingPet.id, data)
            } else {
                await mascotasService.crear(data)
            }
            setDialogOpen(false)
            setReloadKey(value => value + 1)
        } catch (saveError) {
            setError(errorMessage(saveError))
        } finally {
            setSaving(false)
        }
    }

    async function deactivatePet(pet: Mascota) {
        if (!window.confirm(`¿Marcar a ${pet.nombre} como inactiva?`)) return
        setError('')
        try {
            await mascotasService.actualizar(pet.id, {
                propietarioId: pet.propietarioId,
                nombre: pet.nombre,
                especie: pet.especie,
                raza: pet.raza,
                sexo: pet.sexo,
                fechaNacimiento: pet.fechaNacimiento,
                pesoKg: pet.pesoKg,
                color: pet.color,
                activo: false,
            })
            setReloadKey(value => value + 1)
        } catch (deactivateError) {
            setError(errorMessage(deactivateError))
        }
    }

    if (loadingProfile) {
        return <div className="p-6 text-sm" style={{ color: 'var(--gray-500)' }}>Cargando perfil...</div>
    }

    if (!user) {
        return <div className="m-6 rounded-xl border p-5 text-sm text-red-600" style={{ background: 'var(--white)', borderColor: 'var(--gray-200)' }}>{error}</div>
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="mb-1 text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                        {user.rol.toUpperCase() === 'PROPIETARIO' ? 'Mis mascotas' : 'Mascotas'}
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
                        {user.rol.toUpperCase() === 'PROPIETARIO'
                            ? 'Consulta la información de tus mascotas registradas.'
                            : 'Registra y administra los pacientes de la clínica.'}
                    </p>
                </div>
                {isStaff && (
                    <button
                        type="button"
                        onClick={openCreateDialog}
                        className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: 'var(--primary)' }}
                    >
                        + Registrar mascota
                    </button>
                )}
            </div>

            {error && !dialogOpen && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
                    <span>{error}</span>
                    <button type="button" className="font-semibold" onClick={() => setReloadKey(value => value + 1)}>Reintentar</button>
                </div>
            )}

            <section className="overflow-hidden rounded-xl border" style={{ background: 'var(--white)', borderColor: 'var(--gray-200)' }}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--gray-200)' }}>
                    <h2 className="text-sm font-semibold" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                        Registro de pacientes
                    </h2>
                    <span className="text-xs" style={{ color: 'var(--gray-500)' }}>
                        {totalPets} {totalPets === 1 ? 'mascota' : 'mascotas'}
                    </span>
                </div>

                {loadingPets ? (
                    <div className="px-5 py-12 text-center text-sm" style={{ color: 'var(--gray-500)' }}>Cargando mascotas...</div>
                ) : pets.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <div className="text-sm font-medium" style={{ color: 'var(--dark)' }}>Aún no hay mascotas registradas</div>
                        <p className="mt-1 text-sm" style={{ color: 'var(--gray-500)' }}>
                            {isStaff ? 'Registra una mascota para comenzar a llevar su seguimiento.' : 'Cuando se registren tus mascotas, aparecerán aquí.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[780px] text-left text-sm">
                            <thead style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }}>
                                <tr>
                                    <th className="px-5 py-3 font-medium">Mascota</th>
                                    <th className="px-5 py-3 font-medium">Propietario</th>
                                    <th className="px-5 py-3 font-medium">Sexo</th>
                                    <th className="px-5 py-3 font-medium">Nacimiento</th>
                                    <th className="px-5 py-3 font-medium">Estado</th>
                                    {isStaff && <th className="px-5 py-3 text-right font-medium">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {pets.map(pet => (
                                    <tr key={pet.id} className="border-t" style={{ borderColor: 'var(--gray-200)' }}>
                                        <td className="px-5 py-4">
                                            <div className="font-semibold" style={{ color: 'var(--dark)' }}>{pet.nombre}</div>
                                            <div className="mt-0.5 text-xs" style={{ color: 'var(--gray-500)' }}>
                                                {labelFor(species, pet.especie)}{pet.raza ? ` · ${pet.raza}` : ''}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4" style={{ color: 'var(--dark)' }}>
                                            {user.rol.toUpperCase() === 'PROPIETARIO'
                                                ? 'Tú'
                                                : ownerNames[pet.propietarioId] || `ID ${pet.propietarioId.slice(0, 8)}…`}
                                        </td>
                                        <td className="px-5 py-4" style={{ color: 'var(--gray-500)' }}>{labelFor(sexes, pet.sexo)}</td>
                                        <td className="px-5 py-4" style={{ color: 'var(--gray-500)' }}>{formatDate(pet.fechaNacimiento)}</td>
                                        <td className="px-5 py-4">
                                            <span
                                                className="rounded-full px-2.5 py-1 text-xs font-medium"
                                                style={pet.activo
                                                    ? { background: 'var(--secondary-light)', color: '#0F766E' }
                                                    : { background: 'var(--gray-100)', color: 'var(--gray-500)' }}
                                            >
                                                {pet.activo ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </td>
                                        {isStaff && (
                                            <td className="px-5 py-4 text-right">
                                                <div className="inline-flex items-center gap-3">
                                                    <button type="button" onClick={() => openEditDialog(pet)} className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                                                        Editar
                                                    </button>
                                                    {pet.activo && (
                                                        <button type="button" onClick={() => void deactivatePet(pet)} className="text-xs font-semibold text-red-600">
                                                            Desactivar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loadingPets && isStaff && totalPages > 1 && (
                    <div className="flex items-center justify-between border-t px-5 py-3" style={{ borderColor: 'var(--gray-200)' }}>
                        <span className="text-xs" style={{ color: 'var(--gray-500)' }}>Página {page + 1} de {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={page === 0}
                                onClick={() => setPage(current => Math.max(0, current - 1))}
                                className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                                style={{ borderColor: 'var(--gray-200)', color: 'var(--dark)' }}
                            >
                                Anterior
                            </button>
                            <button
                                type="button"
                                disabled={page + 1 >= totalPages}
                                onClick={() => setPage(current => Math.min(totalPages - 1, current + 1))}
                                className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                                style={{ borderColor: 'var(--gray-200)', color: 'var(--dark)' }}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {dialogOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(15, 23, 42, 0.45)' }}
                    onClick={() => !saving && setDialogOpen(false)}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="mascota-dialog-title"
                        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border"
                        style={{ background: 'var(--white)', borderColor: 'var(--gray-200)', boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)' }}
                        onClick={event => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b px-6 py-5" style={{ borderColor: 'var(--gray-200)' }}>
                            <div>
                                <h2 id="mascota-dialog-title" className="text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                                    {editingPet ? 'Editar mascota' : 'Registrar mascota'}
                                </h2>
                                <p className="mt-1 text-sm" style={{ color: 'var(--gray-500)' }}>Completa la información del paciente.</p>
                            </div>
                            <button type="button" onClick={() => setDialogOpen(false)} className="text-sm font-medium" style={{ color: 'var(--gray-500)' }} disabled={saving}>
                                Cerrar
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="min-h-0 space-y-4 overflow-y-auto p-6">
                            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">{error}</div>}
                            {ownerError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">{ownerError}</div>}

                            <div>
                                <label htmlFor="owner-search" className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--dark)' }}>
                                    Propietario
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        id="owner-search"
                                        value={ownerSearch}
                                        onChange={event => setOwnerSearch(event.target.value)}
                                        placeholder="Buscar por nombre o documento"
                                        className="min-w-0 flex-1 rounded-lg px-4 py-2.5 text-sm outline-none"
                                        style={{ border: '1.5px solid var(--gray-200)', color: 'var(--dark)', background: 'var(--white)' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => void searchOwners(ownerSearch, form.propietarioId || undefined)}
                                        disabled={ownerLoading}
                                        className="rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-60"
                                        style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                                    >
                                        {ownerLoading ? 'Buscando...' : 'Buscar'}
                                    </button>
                                </div>
                                <select
                                    required
                                    value={form.propietarioId}
                                    onChange={event => setForm(current => ({ ...current, propietarioId: event.target.value }))}
                                    className="mt-2 w-full rounded-lg px-4 py-2.5 text-sm outline-none"
                                    style={{ border: '1.5px solid var(--gray-200)', color: 'var(--dark)', background: 'var(--white)' }}
                                >
                                    <option value="">Selecciona un propietario</option>
                                    {owners.map(owner => (
                                        <option key={owner.id} value={owner.id}>{owner.nombre} · {owner.documento}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField label="Nombre" htmlFor="pet-name">
                                    <input id="pet-name" required maxLength={100} value={form.nombre} onChange={event => setForm(current => ({ ...current, nombre: event.target.value }))} className={inputClass} style={inputStyle} />
                                </FormField>
                                <FormField label="Especie" htmlFor="pet-species">
                                    <select id="pet-species" required value={form.especie} onChange={event => setForm(current => ({ ...current, especie: event.target.value as EspecieMascota }))} className={inputClass} style={inputStyle}>
                                        {species.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Raza" htmlFor="pet-breed">
                                    <input id="pet-breed" maxLength={100} value={form.raza} onChange={event => setForm(current => ({ ...current, raza: event.target.value }))} className={inputClass} style={inputStyle} />
                                </FormField>
                                <FormField label="Sexo" htmlFor="pet-sex">
                                    <select id="pet-sex" required value={form.sexo} onChange={event => setForm(current => ({ ...current, sexo: event.target.value as SexoMascota }))} className={inputClass} style={inputStyle}>
                                        {sexes.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Fecha de nacimiento" htmlFor="pet-birth">
                                    <input id="pet-birth" type="date" value={form.fechaNacimiento} onChange={event => setForm(current => ({ ...current, fechaNacimiento: event.target.value }))} className={inputClass} style={inputStyle} />
                                </FormField>
                                <FormField label="Peso (kg)" htmlFor="pet-weight">
                                    <input id="pet-weight" type="number" min="0.01" max="9999.99" step="0.01" value={form.pesoKg} onChange={event => setForm(current => ({ ...current, pesoKg: event.target.value }))} className={inputClass} style={inputStyle} />
                                </FormField>
                                <FormField label="Color" htmlFor="pet-color">
                                    <input id="pet-color" maxLength={60} value={form.color} onChange={event => setForm(current => ({ ...current, color: event.target.value }))} className={inputClass} style={inputStyle} />
                                </FormField>
                                {editingPet && (
                                    <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium" style={{ color: 'var(--dark)' }}>
                                        <input type="checkbox" checked={form.activo} onChange={event => setForm(current => ({ ...current, activo: event.target.checked }))} />
                                        Mascota activa
                                    </label>
                                )}
                            </div>

                            <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end" style={{ borderColor: 'var(--gray-200)' }}>
                                <button type="button" onClick={() => setDialogOpen(false)} disabled={saving} className="rounded-lg border px-4 py-2.5 text-sm font-semibold disabled:opacity-60" style={{ borderColor: 'var(--gray-200)', color: 'var(--gray-500)' }}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={saving || ownerLoading} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'var(--primary)' }}>
                                    {saving ? 'Guardando...' : editingPet ? 'Guardar cambios' : 'Registrar mascota'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    )
}

const inputClass = 'w-full rounded-lg px-4 py-2.5 text-sm outline-none'
const inputStyle = { border: '1.5px solid var(--gray-200)', color: 'var(--dark)', background: 'var(--white)' }

function FormField({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
    return (
        <div>
            <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--dark)' }}>{label}</label>
            {children}
        </div>
    )
}
