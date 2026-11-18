import GravidadeBadge from '../../components/ui/GravidadeBadge'
import SituacaoBadge from '../../components/ui/SituacaoBadge'
import TipoLabel from '../../components/ui/TipoLabel'
import { formatarData } from '../../utils/formatadores'

export default function HistoricoTable({ itens, onVerDetalhes }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-borda text-texto-secundario">
          <th scope="col" className="py-2 pr-4 font-medium">
            Data
          </th>
          <th scope="col" className="py-2 pr-4 font-medium">
            Tipo
          </th>
          <th scope="col" className="py-2 pr-4 font-medium">
            Gravidade
          </th>
          <th scope="col" className="py-2 pr-4 font-medium">
            Descrição
          </th>
          <th scope="col" className="py-2 font-medium">
            Situação
          </th>
        </tr>
      </thead>
      <tbody>
        {itens.map((ocorrencia) => (
          <tr
            key={ocorrencia.id}
            onClick={() => onVerDetalhes(ocorrencia)}
            className="cursor-pointer border-b border-borda hover:bg-primaria-suave"
          >
            <td className="py-3 pr-4 tabular-nums text-texto">{formatarData(ocorrencia.data)}</td>
            <td className="py-3 pr-4 text-texto">
              <TipoLabel tipo={ocorrencia.tipo} />
            </td>
            <td className="py-3 pr-4">
              <GravidadeBadge gravidade={ocorrencia.gravidade} />
            </td>
            <td className="max-w-sm truncate py-3 pr-4 text-texto-secundario">{ocorrencia.descricao}</td>
            <td className="py-3">
              <SituacaoBadge arquivada={ocorrencia.arquivada} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
