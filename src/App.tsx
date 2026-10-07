import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, type ReactElement } from 'react'
import LoginForm from './auth/components/LoginForm'
import RegisterForm from './auth/components/RegisterForm'
import DashboardContent from './dashboard/components/DashboardPage'
import Layout from './dashboard/layout/Layout'
import PropietariosPage from './dashboard/propietarios/PropietariosPage'
import MascotasPage from './dashboard/mascotas/MascotasPage'
import authService from './api/authService'


function ProtectedRoute({ children }: { children: ReactElement }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AdminRoute({ children }: { children: ReactElement }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAdmin = async () => {
      if (!authService.isAuthenticated()) {
        setIsAdmin(false)
        return
      }

      try {
        const profile = await authService.getProfile()
        setIsAdmin(profile.rol === 'ADMINISTRADOR')
      } catch (error) {
        setIsAdmin(false)
      }
    }

    void checkAdmin()
  }, [])

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  if (isAdmin === null) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Comprobando permisos...</div>
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = (location.state as { message?: string } | null)?.message || ''

  if (authService.isAuthenticated()) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <LoginForm
      onLogin={() => navigate('/dashboard')}
      onGoToRegister={() => navigate('/register')}
      successMessage={successMessage}
    />
  )
}

function RegisterPage({ isAdminRegistration = false }: { isAdminRegistration?: boolean }) {
  const navigate = useNavigate()

  return (
    <RegisterForm
      isAdminRegistration={isAdminRegistration}
      onBack={() => navigate(isAdminRegistration ? '/dashboard' : '/login')}
      onRegister={() => navigate(
        isAdminRegistration ? '/dashboard' : '/login',
        { state: { message: isAdminRegistration ? 'Usuario creado correctamente.' : 'Cuenta creada correctamente. Inicia sesión.' } },
      )}
    />
  )
}

function DashboardPage() {
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'agenda' | 'propietarios' | 'mascotas' | 'consultas' | 'reportes' | 'usuarios'>('dashboard')
  // Búsqueda con la que se abre Mascotas (p. ej. el documento del dueño desde Propietarios).
  const [busquedaMascotas, setBusquedaMascotas] = useState('')

  const irA = (screen: typeof activeScreen) => {
    setBusquedaMascotas('')
    setActiveScreen(screen)
  }
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = (location.state as { message?: string } | null)?.message
  const [showSuccessMessage, setShowSuccessMessage] = useState(Boolean(successMessage))

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
      case "propietarios":
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
          <div className="flex items-center justify-center min-h-[70vh] p-8">
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

function navLabel(screen: 'dashboard' | 'agenda' | 'propietarios' | 'mascotas' | 'consultas' | 'reportes' | 'usuarios') {
  const labels: Record<typeof screen, string> = {
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/admin/register"
        element={
          <AdminRoute>
            <RegisterPage isAdminRegistration />
          </AdminRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
