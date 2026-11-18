import { Link } from 'react-router-dom'
import EmptyState from '../../components/ui/EmptyState'

export default function AlunosEmAtencaoList({ itens }) {
  if (itens.length === 0) {
    return <EmptyState mensagem="Nenhum aluno em atenção no período selecionado." />
  }

  return (
    <ul className="divide-y divide-borda rounded-card border border-borda bg-superficie">
      {itens.map((aluno) => (
        <li key={aluno.alunoId} className="flex items-center justify-between px-4 py-3">
          <div>
            <Link to={`/alunos/${aluno.alunoId}`} className="font-medium text-primaria hover:underline">
              {aluno.nome}
            </Link>
            <p className="text-sm text-texto-secundario">{aluno.turma.nome}</p>
          </div>
          <p className="text-sm tabular-nums text-texto-secundario">
            {aluno.totalAtivas} ativa(s) · {aluno.graves} grave(s)
          </p>
        </li>
      ))}
    </ul>
  )
}
