import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import LoginForm from './auth/components/LoginForm'
import RegisterForm from './auth/components/RegisterForm'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = (location.state as { message?: string } | null)?.message || ''

  return (
    <LoginForm
      onLogin={() => navigate('/dashboard')}
      onGoToRegister={() => navigate('/register')}
      successMessage={successMessage}
    />
  )
}

function RegisterPage() {
  const navigate = useNavigate()

  return (
    <RegisterForm
      onBack={() => navigate('/login')}
      onRegister={() => navigate('/login', { state: { message: 'Registro exitoso. Inicia sesión para continuar.' } })}
    />
  )
}

function DashboardPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard</h1>
      <p>Sesión iniciada correctamente.</p>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  )
}

export default App
