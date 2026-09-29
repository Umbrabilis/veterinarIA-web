import { useEffect, useState } from 'react'
import {
    SearchIcon, PlusIcon, ChevronRightIcon, PawIcon
} from '../../shared/icons'
import { getPropietarios, crearPropietario } from '../../api/propietariosService'

const pets = [
    { name: 'Luna', type: 'Perro', breed: 'Golden Retriever', age: '4 años', owner: 'María López', status: 'Activa' },
    { name: 'Milo', type: 'Gato', breed: 'Siamés', age: '2 años', owner: 'María López', status: 'Activa' },
    { name: 'Rex', type: 'Perro', breed: 'Labrador', age: '6 años', owner: 'Carlos Gómez', status: 'Activa' },
    { name: 'Bella', type: 'Perro', breed: 'Beagle', age: '3 años', owner: 'Lucía Fernández', status: 'Activa' },
    { name: 'Simba', type: 'Gato', breed: 'Persa', age: '5 años', owner: 'Lucía Fernández', status: 'Inactiva' },
    { name: 'Max', type: 'Perro', breed: 'Boxer', age: '1 año', owner: 'Diego Ramírez', status: 'Activa' },
]

const petTypeColor: Record<string, string> = {
    Perro: '#F59E08',
    Gato: '#14BBA6',
}

export default function OwnersAndPets() {
    const [tab, setTab] = useState<'propietarios' | 'mascotas'>('propietarios')
    const [search, setSearch] = useState('')

    const [owners, setOwners] = useState<Owner[]>([])

    useEffect(() => {
        getPropietarios()
            .then(data => {
                console.log('Propietarios recibidos:', data)

                const ownersFormateados = data.contenido.map((p: any) => ({
                    name: p.nombre,
                    email: p.email ?? '',
                    phone: p.telefono ?? '',
                    pets: 0,
                }))

                setOwners(ownersFormateados)
            })
            .catch(error => {
                console.error('Error cargando propietarios:', error)
            })
    }, [])
    //crear temporal
    /*useEffect(() => {
        const crearPropietarioPrueba = async () => {
            try {
                const nuevoPropietario = await crearPropietario({
                    nombre: 'Juan Pérez Prueba',
                    documento: '1000123456',
                    telefono: '3001234567',
                    email: 'juan.prueba23@test.com',
                    direccion: 'Calle 10 # 20-30',
                    aceptaTratamientoDatos: true,
                })

                console.log('Propietario creado:', nuevoPropietario)
            } catch (error: any) {
                console.log('STATUS:', error.response?.status)
                console.log('DATA:', error.response?.data)
                console.log('MESSAGE:', error.response?.data?.message)
                console.log('ERROR COMPLETO:', error)
            }
        }

        crearPropietarioPrueba()
    }, [])*/

    const filteredOwners = owners.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.email.toLowerCase().includes(search.toLowerCase())
    )

    const filteredPets = pets.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.owner.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-5">
            <div>
                <h1 className="text-xl font-bold mb-0.5" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                    Propietarios
                </h1>
                <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
                    Gestioná los propietarios y sus mascotas registradas en el sistema.
                </p>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--white)', border: '1px solid var(--gray-200)' }}>
                {/* Tabs + actions */}
                <div className="flex items-center justify-between px-5 pt-4 pb-0" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <div className="flex gap-1">
                        {(['propietarios', 'mascotas'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => { setTab(t); setSearch('') }}
                                className="px-4 py-2 text-sm font-medium capitalize transition-all border-b-2 -mb-px"
                                style={{
                                    borderColor: tab === t ? 'var(--primary)' : 'transparent',
                                    color: tab === t ? 'var(--primary)' : 'var(--gray-500)',
                                    fontFamily: 'Poppins, sans-serif',
                                }}
                            >
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search + button */}
                <div className="flex items-center gap-3 px-5 py-4">
                    <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-400)' }}>
              <SearchIcon />
            </span>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={tab === 'propietarios' ? 'Buscar por nombre, email o teléfono' : 'Buscar por nombre o propietario'}
                            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all"
                            style={{
                                border: '1.5px solid var(--gray-200)',
                                color: 'var(--dark)',
                            }}
                            onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                            onBlur={e => (e.target.style.borderColor = 'var(--gray-200)')}
                        />
                    </div>
                    <button
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: 'var(--primary)', whiteSpace: 'nowrap' }}
                    >
                        <PlusIcon />
                        {tab === 'propietarios' ? 'Nuevo propietario' : 'Nueva mascota'}
                    </button>
                </div>

                {/* Table */}
                {tab === 'propietarios' ? (
                    <OwnersTable owners={filteredOwners} />
                ) : (
                    <PetsTable pets={filteredPets} petTypeColor={petTypeColor} />
                )}
            </div>
        </div>
    )

}

type Owner = { name: string; email: string; phone: string; pets: number }

function OwnersTable({ owners }: { owners: Owner[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                <tr style={{ background: 'var(--gray-100)', borderBottom: '1px solid var(--gray-200)' }}>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gray-500)' }}>Nombre</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gray-500)' }}>Email</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gray-500)' }}>Teléfono</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gray-500)' }}>Mascotas</th>
                    <th className="px-5 py-3" />
                </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--gray-200)' }}>
                {owners.map((o, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors cursor-pointer">
                        <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                                    style={{ background: 'var(--primary)' }}
                                >
                                    {o.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium" style={{ color: 'var(--dark)' }}>{o.name}</span>
                            </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--gray-500)' }}>{o.email}</td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--gray-500)' }}>{o.phone}</td>
                        <td className="px-5 py-3.5">
                            <span className="text-sm font-semibold" style={{ color: 'var(--dark)' }}>{o.pets}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                            <span style={{ color: 'var(--gray-400)' }}><ChevronRightIcon /></span>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            {owners.length === 0 && (
                <div className="py-12 text-center text-sm" style={{ color: 'var(--gray-400)' }}>
                    No se encontraron propietarios.
                </div>
            )}
        </div>
    )
}

function PetsTable({ pets, petTypeColor }: { pets: any[]; petTypeColor: Record<string, string> }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                <tr style={{ background: 'var(--gray-100)', borderBottom: '1px solid var(--gray-200)' }}>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gray-500)' }}>Nombre</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gray-500)' }}>Raza</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gray-500)' }}>Edad</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gray-500)' }}>Propietario</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gray-500)' }}>Estado</th>
                    <th className="px-5 py-3" />
                </tr>
                </thead>
                <tbody className="divide-y">
                {pets.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors cursor-pointer">
                        <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: petTypeColor[p.type] + '22' }}
                                >
                                    <PawIcon size={15} color={petTypeColor[p.type]} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium" style={{ color: 'var(--dark)' }}>{p.name}</div>
                                    <div className="text-xs" style={{ color: 'var(--gray-500)' }}>{p.type}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--gray-500)' }}>{p.breed}</td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--gray-500)' }}>{p.age}</td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--gray-500)' }}>{p.owner}</td>
                        <td className="px-5 py-3.5">
                <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                        background: p.status === 'Activa' ? 'var(--secondary-light)' : 'var(--gray-100)',
                        color: p.status === 'Activa' ? '#065F46' : 'var(--gray-500)',
                    }}
                >
                  {p.status}
                </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                            <span style={{ color: 'var(--gray-400)' }}><ChevronRightIcon /></span>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}
