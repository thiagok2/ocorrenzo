import { useNavigate } from 'react-router-dom'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import StatTile from '../../components/ui/StatTile'
import useAluno from '../../hooks/useAluno'
import useHistoricoAluno from '../../hooks/useHistoricoAluno'
import HistoricoRecente from './HistoricoRecente'

const FILTROS_RECENTES = { situacao: 'todas', page: 1, pageSize: 3 }

export default function AlunoResumoPanel({ alunoId, onRegistrarOcorrencia }) {
  const navigate = useNavigate()
  const { dados: aluno, carregando: carregandoAluno } = useAluno(alunoId)
  const { dados: historico, carregando: carregandoHistorico } = useHistoricoAluno(alunoId, FILTROS_RECENTES)

  if (carregandoAluno || !aluno) {
    return (
      <div className="rounded-card border border-borda bg-superficie p-4">
        <Skeleton linhas={4} />
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-card border border-borda bg-superficie p-4">
      <div className="flex items-center gap-3">
        <Avatar nome={aluno.nome} tamanho="lg" />
        <div>
          <p className="font-medium text-texto">{aluno.nome}</p>
          <p className="text-sm text-texto-secundario">
            {aluno.matricula} · {aluno.turma.nome}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatTile rotulo="Ativas" valor={aluno.resumo.totalAtivas} />
        <StatTile rotulo="Graves" valor={aluno.resumo.graves} tom={aluno.resumo.graves > 0 ? 'alerta' : 'neutro'} />
        <StatTile rotulo="Arquivadas" valor={aluno.resumo.arquivadas} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-texto">Histórico recente</p>
        {carregandoHistorico ? <Skeleton linhas={3} /> : <HistoricoRecente itens={historico?.itens ?? []} />}
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={() => onRegistrarOcorrencia(aluno)}>Registrar ocorrência</Button>
        <Button variante="secundario" onClick={() => navigate(`/alunos/${alunoId}`)}>
          Ver ficha completa
        </Button>
      </div>
    </div>
  )
}
