import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import LoginForm from './auth/components/LoginForm'

function LoginPage() {
  const navigate = useNavigate()

  return <LoginForm onLogin={() => navigate('/dashboard')} />
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
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  )
}

export default App
