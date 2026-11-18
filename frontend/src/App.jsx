import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import AppLayout from './layouts/AppLayout'
import AlunosPage from './pages/alunos/AlunosPage'
import FichaAlunoPage from './pages/alunos/FichaAlunoPage'
import CadastrosPage from './pages/cadastros/CadastrosPage'
import MeuHistoricoPage from './pages/historico/MeuHistoricoPage'
import LoginPage from './pages/LoginPage'
import OcorrenciasPage from './pages/ocorrencias/OcorrenciasPage'
import PainelPage from './pages/painel/PainelPage'
import ProtectedRoute from './routes/ProtectedRoute'
import { ROTA_INICIAL_POR_PERFIL } from './utils/constantes'

function RotaInicial() {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  if (!usuario) return <Navigate to="/login" replace />
  return <Navigate to={ROTA_INICIAL_POR_PERFIL[usuario.perfil] ?? '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RotaInicial />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<ProtectedRoute perfis={['professor', 'coordenador']} />}>
            <Route path="/ocorrencias" element={<OcorrenciasPage />} />
            <Route path="/alunos" element={<AlunosPage />} />
            <Route path="/alunos/:id" element={<FichaAlunoPage />} />
          </Route>
          <Route element={<ProtectedRoute perfis={['coordenador']} />}>
            <Route path="/cadastros" element={<CadastrosPage />} />
            <Route path="/painel" element={<PainelPage />} />
          </Route>
          <Route element={<ProtectedRoute perfis={['aluno']} />}>
            <Route path="/meu-historico" element={<MeuHistoricoPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
