import { lazy, Suspense, useEffect, useState, type ReactElement } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import authService, { type UserProfile } from './api/authService'
import { EVENTO_SESION_EXPIRADA } from './api/axiosClient'

const LoginPage = lazy(() => import('auth/LoginPage'))
const RegisterPage = lazy(() => import('auth/RegisterPage'))
const DashboardPage = lazy(() => import('management/DashboardPage'))

type EstadoSesion = { cargando: true } | { cargando: false; usuario: UserProfile | null }

/** Pregunta al backend si hay sesión: la cookie es HttpOnly y el frontend no puede leerla. */
function useSesion(): EstadoSesion {
  const [estado, setEstado] = useState<EstadoSesion>({ cargando: true })

  useEffect(() => {
    let vigente = true
    void authService.obtenerSesion().then(usuario => {
      if (vigente) setEstado({ cargando: false, usuario })
    })
    return () => {
      vigente = false
    }
  }, [])

  return estado
}

function ProtectedRoute({ children }: { children: ReactElement }) {
  const sesion = useSesion()

  if (sesion.cargando) {
    return <Comprobando texto="Comprobando sesión..." />
  }

  if (!sesion.usuario) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AdminRoute({ children }: { children: ReactElement }) {
  const sesion = useSesion()

  if (sesion.cargando) {
    return <Comprobando texto="Comprobando permisos..." />
  }

  if (!sesion.usuario) {
    return <Navigate to="/login" replace />
  }

  if (sesion.usuario.rol !== 'ADMINISTRADOR') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

/** Si la API responde 401 en medio del uso (la sesión venció), vuelve al login. */
function useRedirigirAlVencerSesion() {
  const navigate = useNavigate()

  useEffect(() => {
    const alVencer = () => navigate('/login', {
      replace: true,
      state: { message: 'Tu sesión terminó. Inicia sesión de nuevo.' },
    })
    window.addEventListener(EVENTO_SESION_EXPIRADA, alVencer)
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alVencer)
  }, [navigate])
}

function App() {
  useRedirigirAlVencerSesion()

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Suspense fallback={<RemoteLoading />}><LoginPage /></Suspense>} />
      <Route path="/register" element={<Suspense fallback={<RemoteLoading />}><RegisterPage /></Suspense>} />
      <Route
        path="/admin/register"
        element={
          <AdminRoute>
            <Suspense fallback={<RemoteLoading />}><RegisterPage isAdminRegistration /></Suspense>
          </AdminRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Suspense fallback={<RemoteLoading />}><DashboardPage /></Suspense>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function Comprobando({ texto }: { texto: string }) {
  return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">{texto}</div>
}

function RemoteLoading() {
  return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Cargando módulo...</div>
}

export default App
