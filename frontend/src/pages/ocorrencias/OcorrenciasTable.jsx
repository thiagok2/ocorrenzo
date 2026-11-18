import Avatar from '../../components/ui/Avatar'
import GravidadeBadge from '../../components/ui/GravidadeBadge'
import SituacaoBadge from '../../components/ui/SituacaoBadge'
import TipoLabel from '../../components/ui/TipoLabel'
import { formatarData } from '../../utils/formatadores'
import RowActionsMenu from './RowActionsMenu'

export default function OcorrenciasTable({ itens, mostrarAluno = true, onVerDetalhes, onArquivar, onRegistrarCorrecao }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-borda text-texto-secundario">
          <th scope="col" className="py-2 pr-4 font-medium">
            {mostrarAluno ? 'Aluno' : 'Turma'}
          </th>
          <th scope="col" className="py-2 pr-4 font-medium">
            Ocorrência
          </th>
          <th scope="col" className="py-2 pr-4 font-medium">
            Data
          </th>
          <th scope="col" className="py-2 pr-4 font-medium">
            Gravidade
          </th>
          <th scope="col" className="py-2 pr-4 font-medium">
            Situação
          </th>
          <th scope="col" className="py-2 font-medium">
            <span className="sr-only">Ações</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {itens.map((ocorrencia) => (
          <tr key={ocorrencia.id} className="border-b border-borda">
            <td className="py-3 pr-4">
              {mostrarAluno ? (
                <div className="flex items-center gap-2">
                  <Avatar nome={ocorrencia.aluno.nome} tamanho="sm" />
                  <div>
                    <p className="font-medium text-texto">{ocorrencia.aluno.nome}</p>
                    <p className="text-texto-secundario">{ocorrencia.turma.nome}</p>
                  </div>
                </div>
              ) : (
                <span className="text-texto">{ocorrencia.turma.nome}</span>
              )}
            </td>
            <td className="py-3 pr-4">
              <p className="font-medium text-texto">
                <TipoLabel tipo={ocorrencia.tipo} />
              </p>
              <p className="max-w-xs truncate text-texto-secundario">{ocorrencia.descricao}</p>
            </td>
            <td className="py-3 pr-4 tabular-nums text-texto">{formatarData(ocorrencia.data)}</td>
            <td className="py-3 pr-4">
              <GravidadeBadge gravidade={ocorrencia.gravidade} />
            </td>
            <td className="py-3 pr-4">
              <SituacaoBadge arquivada={ocorrencia.arquivada} />
            </td>
            <td className="py-3 text-right">
              <RowActionsMenu
                ocorrencia={ocorrencia}
                onVerDetalhes={onVerDetalhes}
                onArquivar={onArquivar}
                onRegistrarCorrecao={onRegistrarCorrecao}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
