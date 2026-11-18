import { Link } from 'react-router-dom'
import SeverityBar from './SeverityBar'

export default function TurmaCard({ turma }) {
  return (
    <div className="rounded-card border border-borda bg-superficie p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium text-texto">{turma.nome}</p>
        <p className="tabular-nums text-texto-secundario">{turma.totalAtivas} ativa(s)</p>
      </div>
      <div className="mt-3">
        <SeverityBar porGravidade={turma.porGravidade} />
      </div>
      <Link to={`/ocorrencias?turmaId=${turma.turmaId}`} className="mt-3 inline-block text-sm text-primaria hover:underline">
        Ver ocorrências da turma
      </Link>
    </div>
  )
}
