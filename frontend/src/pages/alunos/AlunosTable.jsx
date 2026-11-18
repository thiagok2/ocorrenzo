import Avatar from '../../components/ui/Avatar'
import { formatarData } from '../../utils/formatadores'
import AlunoRowActionsMenu from './AlunoRowActionsMenu'

export default function AlunosTable({ itens, selecionadoId, onSelecionar, onRegistrarOcorrencia, onTransferir }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-borda text-texto-secundario">
          <th scope="col" className="py-2 pr-4 font-medium">
            Aluno
          </th>
          <th scope="col" className="py-2 pr-4 font-medium">
            Matrícula
          </th>
          <th scope="col" className="py-2 pr-4 font-medium">
            Ocorrências
          </th>
          <th scope="col" className="py-2 pr-4 font-medium">
            Última
          </th>
          <th scope="col" className="py-2 font-medium">
            <span className="sr-only">Ações</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {itens.map((aluno) => (
          <tr
            key={aluno.id}
            onClick={() => onSelecionar(aluno)}
            className={`cursor-pointer border-b border-borda ${aluno.id === selecionadoId ? 'bg-primaria-suave' : ''}`}
          >
            <td className="py-3 pr-4">
              <div className="flex items-center gap-2">
                <Avatar nome={aluno.nome} tamanho="sm" />
                <span className="font-medium text-texto">{aluno.nome}</span>
              </div>
            </td>
            <td className="py-3 pr-4 tabular-nums text-texto">{aluno.matricula}</td>
            <td className="py-3 pr-4 tabular-nums text-texto">{aluno.totalOcorrenciasAtivas}</td>
            <td className="py-3 pr-4 text-texto">{aluno.ultimaOcorrenciaEm ? formatarData(aluno.ultimaOcorrenciaEm) : '—'}</td>
            <td className="py-3 text-right" onClick={(evento) => evento.stopPropagation()}>
              <AlunoRowActionsMenu aluno={aluno} onRegistrarOcorrencia={onRegistrarOcorrencia} onTransferir={onTransferir} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
