import { useNavigate } from 'react-router-dom'
import RegisterForm from '../components/RegisterForm'
import '../../index.css'

export default function RegisterPage({ isAdminRegistration = false }: { isAdminRegistration?: boolean }) {
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
