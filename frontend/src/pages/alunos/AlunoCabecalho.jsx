import { Link } from 'react-router-dom'
import Avatar from '../../components/ui/Avatar'
import StatTile from '../../components/ui/StatTile'

export default function AlunoCabecalho({ aluno }) {
  return (
    <div className="mb-6">
      <Link to="/alunos" className="text-sm text-texto-secundario hover:text-texto">
        ← Alunos
      </Link>
      <div className="mt-2 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Avatar nome={aluno.nome} tamanho="lg" />
          <div>
            <h1 className="text-xl font-semibold text-texto">{aluno.nome}</h1>
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
      </div>
    </div>
  )
}
