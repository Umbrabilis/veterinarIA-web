import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm'
import authService from '../../api/authService'
import '../../index.css'

export default function LoginPage() {
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
