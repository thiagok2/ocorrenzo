import { useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import SegmentedControl from '../../components/ui/SegmentedControl'
import Skeleton from '../../components/ui/Skeleton'
import useTurmas from '../../hooks/useTurmas'
import AlunosPage from '../alunos/AlunosPage'
import CadastroTurmaDialog from './CadastroTurmaDialog'
import TurmasTable from './TurmasTable'
import VinculosPanel from './VinculosPanel'

const ABAS = [
  { value: 'alunos', label: 'Alunos' },
  { value: 'turmas', label: 'Turmas' },
  { value: 'vinculos', label: 'Vínculos' },
]

export default function CadastrosPage() {
  const [aba, setAba] = useState('alunos')
  const [cadastroTurmaAberto, setCadastroTurmaAberto] = useState(false)
  const { dados: turmas, carregando, recarregar } = useTurmas()

  function aoCriarTurma() {
    setCadastroTurmaAberto(false)
    recarregar()
  }

  return (
    <div>
      <PageHeader titulo="Cadastros" />

      <div className="mb-6">
        <SegmentedControl opcoes={ABAS} valor={aba} onChange={setAba} />
      </div>

      {aba === 'alunos' && <AlunosPage />}

      {aba === 'turmas' && (
        <div>
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setCadastroTurmaAberto(true)}>Nova turma</Button>
          </div>
          {carregando ? <Skeleton linhas={4} /> : <TurmasTable itens={turmas} />}
          <CadastroTurmaDialog aberto={cadastroTurmaAberto} onFechar={() => setCadastroTurmaAberto(false)} onCriada={aoCriarTurma} />
        </div>
      )}

      {aba === 'vinculos' && <VinculosPanel turmas={turmas} />}
    </div>
  )
}
