declare module 'auth/LoginPage' {
  import type { ComponentType } from 'react'
  const LoginPage: ComponentType
  export default LoginPage
}

declare module 'auth/RegisterPage' {
  import type { ComponentType } from 'react'
  const RegisterPage: ComponentType<{ isAdminRegistration?: boolean }>
  export default RegisterPage
}

declare module 'management/DashboardPage' {
  import type { ComponentType } from 'react'
  const DashboardPage: ComponentType
  export default DashboardPage
}
