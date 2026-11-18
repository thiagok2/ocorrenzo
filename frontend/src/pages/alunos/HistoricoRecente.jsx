import GravidadeBadge from '../../components/ui/GravidadeBadge'
import SituacaoBadge from '../../components/ui/SituacaoBadge'
import TipoLabel from '../../components/ui/TipoLabel'
import { formatarData } from '../../utils/formatadores'

const COR_PONTO = { leve: '#1F7A47', media: '#A15C07', grave: '#B91C1C' }

export default function HistoricoRecente({ itens }) {
  if (itens.length === 0) {
    return <p className="text-sm text-texto-secundario">Nenhuma ocorrência registrada ainda.</p>
  }

  return (
    <ul className="space-y-2">
      {itens.map((ocorrencia) => (
        <li key={ocorrencia.id} className="flex items-start gap-2 text-sm">
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: COR_PONTO[ocorrencia.gravidade] }}
            aria-hidden="true"
          />
          <div>
            <p className="text-texto">
              <TipoLabel tipo={ocorrencia.tipo} /> · {formatarData(ocorrencia.data)}
            </p>
            <div className="mt-1 flex gap-1">
              <GravidadeBadge gravidade={ocorrencia.gravidade} />
              <SituacaoBadge arquivada={ocorrencia.arquivada} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
