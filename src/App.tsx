import { lazy, Suspense, useEffect, useState, type ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import authService from './api/authService'

const LoginPage = lazy(() => import('auth/LoginPage'))
const RegisterPage = lazy(() => import('auth/RegisterPage'))
const DashboardPage = lazy(() => import('management/DashboardPage'))

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

function App() {
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

function RemoteLoading() {
  return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Cargando módulo...</div>
}

export default App
