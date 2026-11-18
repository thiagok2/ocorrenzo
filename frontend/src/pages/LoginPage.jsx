import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROTA_INICIAL_POR_PERFIL } from '../utils/constantes'
import LoginForm from './login/LoginForm'
import LoginHero from './login/LoginHero'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  async function aoEntrar(matricula, senha) {
    const usuario = await login(matricula, senha)
    navigate(ROTA_INICIAL_POR_PERFIL[usuario.perfil] ?? '/', { replace: true })
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden md:block">
        <LoginHero />
      </div>
      <div className="flex items-center justify-center bg-fundo p-8">
        <LoginForm onEntrar={aoEntrar} />
      </div>
    </div>
  )
}
