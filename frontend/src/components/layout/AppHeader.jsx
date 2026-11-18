import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { PERFIS } from '../../utils/constantes'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

const ABAS_POR_PERFIL = {
  coordenador: [
    { to: '/ocorrencias', label: 'Ocorrências' },
    { to: '/cadastros', label: 'Cadastros' },
    { to: '/painel', label: 'Painel' },
  ],
  professor: [
    { to: '/ocorrencias', label: 'Ocorrências' },
    { to: '/alunos', label: 'Alunos' },
  ],
  apoio_pedagogico: [{ to: '/ocorrencias', label: 'Ocorrências' }],
  aluno: [{ to: '/meu-historico', label: 'Meu histórico' }],
}

export default function AppHeader() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  function aoSair() {
    logout()
    navigate('/login', { replace: true })
  }

  const abas = ABAS_POR_PERFIL[usuario.perfil] ?? []

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-borda bg-superficie px-6 py-3">
      <div className="flex items-center gap-8">
        <span className="text-lg font-bold text-primaria">Ocorrência+</span>
        <nav className="flex gap-6" aria-label="Navegação principal">
          {abas.map((aba) => (
            <NavLink
              key={aba.to}
              to={aba.to}
              className={({ isActive }) =>
                `border-b-2 py-1 text-sm font-medium ${
                  isActive ? 'border-primaria text-primaria' : 'border-transparent text-texto-secundario hover:text-texto'
                }`
              }
            >
              {aba.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <Avatar nome={usuario.nome} tamanho="sm" />
        <div className="text-sm leading-tight">
          <p className="font-medium text-texto">{usuario.nome}</p>
          <p className="text-texto-secundario">{PERFIS[usuario.perfil]}</p>
        </div>
        <Button variante="secundario" onClick={aoSair}>
          Sair
        </Button>
      </div>
    </header>
  )
}
