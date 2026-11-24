import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm'
import authService from '../../api/authService'
import '../../index.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = (location.state as { message?: string } | null)?.message || ''

  // Si ya hay sesión (cookie vigente), no tiene sentido mostrar el login.
  useEffect(() => {
    let vigente = true
    void authService.obtenerSesion().then(usuario => {
      if (vigente && usuario) navigate('/dashboard', { replace: true })
    })
    return () => {
      vigente = false
    }
  }, [navigate])

  return (
    <LoginForm
      onLogin={() => navigate('/dashboard')}
      onGoToRegister={() => navigate('/register')}
      successMessage={successMessage}
    />
  )
}
