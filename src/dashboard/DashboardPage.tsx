import { CalendarIcon, ClipboardIcon, PawIcon, ChevronRightIcon } from './components/icons'

interface Props {
    onOpenConsulta: () => void
}

const pendingItems = [
    { name: 'Luna', type: 'Perro', consulta: 'Control de salud', color: '#F59E08' },
    { name: 'Milo', type: 'Gato', consulta: 'Vacunación', color: '#14BBA6' },
    { name: 'Bella', type: 'Perro', consulta: 'Problemas digestivos', color: '#EF4444' },
]

const petColors: Record<string, string> = {
    Perro: '#F59E08',
    Gato: '#14BBA6',
}

export default function Dashboard({ onOpenConsulta }: Props) {
    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold mb-0.5" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                    Dashboard
                </h1>
                <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
                    ¡Hola, Dra. Ana! Aquí tenés un resumen de tu día.
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    icon={<CalendarIcon size={20} />}
                    iconBg="var(--primary-light)"
                    iconColor="var(--primary)"
                    value="5"
                    label="Citas hoy"
                />
                <StatCard
                    icon={<ClipboardIcon size={20} />}
                    iconBg="#FEF3C7"
                    iconColor="var(--accent)"
                    value="3"
                    label="Resúmenes pendientes"
                />
                <StatCard
                    icon={<PawIcon size={20} />}
                    iconBg="var(--secondary-light)"
                    iconColor="var(--secondary)"
                    value="12"
                    label="Mascotas activas"
                />
            </div>

            {/* Pending summaries */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--white)', border: '1px solid var(--gray-200)' }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <h2 className="font-semibold text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                        Resúmenes pendientes
                    </h2>
                    <button className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                        Ver todo
                    </button>
                </div>
                <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
                    {pendingItems.map((item, i) => (
                        <button
                            key={i}
                            onClick={onOpenConsulta}
                            className="w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-gray-50"
                        >
                            <div
                                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: petColors[item.type] + '22' }}
                            >
                                <PawIcon size={16} color={petColors[item.type]} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold" style={{ color: 'var(--dark)' }}>
                                    {item.name} <span className="font-normal" style={{ color: 'var(--gray-500)' }}>({item.type})</span>
                                </div>
                                <div className="text-xs mt-0.5" style={{ color: 'var(--gray-500)' }}>
                                    Consulta: {item.consulta}
                                </div>
                            </div>
                            <span
                                className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                                style={{ background: '#FEF3C7', color: '#92400E' }}
                            >
                Pendiente revisión
              </span>
                            <span style={{ color: 'var(--gray-400)' }}><ChevronRightIcon /></span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Agenda del día placeholder */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--white)', border: '1px solid var(--gray-200)' }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <h2 className="font-semibold text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                        Agenda del día
                    </h2>
                    <button className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                        Ver agenda completa
                    </button>
                </div>
                <div className="divide-y">
                    {[
                        { time: '09:00', pet: 'Rocky (Perro)', owner: 'Juan Martínez', type: 'Vacunación' },
                        { time: '10:30', pet: 'Mishi (Gato)', owner: 'Laura Díaz', type: 'Control anual' },
                        { time: '11:45', pet: 'Thor (Perro)', owner: 'Pablo Ruiz', type: 'Cirugía menor' },
                        { time: '14:00', pet: 'Luna (Perro)', owner: 'María López', type: 'Control de salud' },
                        { time: '15:30', pet: 'Nala (Gato)', owner: 'Sofía Torres', type: 'Consulta digestiva' },
                    ].map((appt, i) => (
                        <div key={i} className="flex items-center gap-4 px-5 py-3">
                            <div className="text-xs font-semibold w-12 flex-shrink-0" style={{ color: 'var(--primary)' }}>
                                {appt.time}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium" style={{ color: 'var(--dark)' }}>{appt.pet}</div>
                                <div className="text-xs" style={{ color: 'var(--gray-500)' }}>{appt.owner} · {appt.type}</div>
                            </div>
                            <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                            >
                Confirmada
              </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function StatCard({
                      icon, iconBg, iconColor, value, label
                  }: {
    icon: React.ReactNode
    iconBg: string
    iconColor: string
    value: string
    label: string
}) {
    return (
        <div
            className="rounded-xl p-5 flex items-center gap-4"
            style={{ background: 'var(--white)', border: '1px solid var(--gray-200)' }}
        >
            <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: iconBg, color: iconColor }}
            >
                {icon}
            </div>
            <div>
                <div className="text-2xl font-bold leading-none mb-1" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                    {value}
                </div>
                <div className="text-xs" style={{ color: 'var(--gray-500)' }}>{label}</div>
            </div>
        </div>
    )
}
