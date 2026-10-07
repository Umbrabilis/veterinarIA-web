import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import authService from '../../api/authService'
import DashboardContent from '../components/DashboardPage'
import Layout from '../layout/Layout'
import PropietariosPage from '../propietarios/PropietariosPage'
import MascotasPage from '../mascotas/MascotasPage'
import '../../index.css'

type ActiveScreen = 'dashboard' | 'agenda' | 'propietarios' | 'mascotas' | 'consultas' | 'reportes' | 'usuarios'

export default function DashboardPage() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('dashboard')
  const [busquedaMascotas, setBusquedaMascotas] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = (location.state as { message?: string } | null)?.message
  const [showSuccessMessage, setShowSuccessMessage] = useState(Boolean(successMessage))

  const irA = (screen: ActiveScreen) => {
    setBusquedaMascotas('')
    setActiveScreen(screen)
  }

  useEffect(() => {
    if (!successMessage) return

    setShowSuccessMessage(true)
    const timeoutId = window.setTimeout(() => setShowSuccessMessage(false), 10_000)
    return () => window.clearTimeout(timeoutId)
  }, [successMessage])

  const renderContent = () => {
    switch (activeScreen) {
      case 'dashboard':
        return (
          <DashboardContent
            onOpenConsulta={() => irA('consultas')}
            onOpenMascotas={() => irA('mascotas')}
          />
        )
      case 'propietarios':
        return (
          <PropietariosPage
            onVerMascotas={documento => {
              setBusquedaMascotas(documento ?? '')
              setActiveScreen('mascotas')
            }}
          />
        )
      case 'mascotas':
        return <MascotasPage key={busquedaMascotas} busquedaInicial={busquedaMascotas} />
      default:
        return (
          <div className="flex min-h-[70vh] items-center justify-center p-8">
            <div
              className="w-full max-w-xl rounded-2xl border text-center"
              style={{
                background: 'var(--white)',
                borderColor: 'var(--gray-200)',
                boxShadow: '0 12px 36px rgba(15, 23, 42, 0.06)',
              }}
            >
              <div className="px-8 py-10">
                <div
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--gray-500)' }}>
                  Módulo
                </p>
                <h2 className="mt-2 text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--dark)' }}>
                  {navLabel(activeScreen)}
                </h2>
                <p className="mt-3 text-sm leading-6" style={{ color: 'var(--gray-500)' }}>
                  Este módulo está en construcción y pronto estará disponible dentro del sistema de gestión veterinaria.
                </p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <Layout
      activeScreen={activeScreen}
      onNavigate={irA}
      onLogout={() => {
        authService.logout()
        navigate('/login')
      }}
    >
      <>
        {showSuccessMessage && successMessage && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700" role="status">
            {successMessage}
          </div>
        )}
        {renderContent()}
      </>
    </Layout>
  )
}

function navLabel(screen: ActiveScreen) {
  const labels: Record<ActiveScreen, string> = {
    dashboard: 'Inicio',
    agenda: 'Agenda',
    propietarios: 'Propietarios',
    mascotas: 'Mascotas',
    consultas: 'Consultas',
    reportes: 'Reportes',
    usuarios: 'Usuarios',
  }

  return labels[screen]
}
