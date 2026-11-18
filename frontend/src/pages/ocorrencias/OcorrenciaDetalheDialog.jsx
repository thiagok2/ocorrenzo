import Dialog from '../../components/ui/Dialog'
import GravidadeBadge from '../../components/ui/GravidadeBadge'
import SituacaoBadge from '../../components/ui/SituacaoBadge'
import TipoLabel from '../../components/ui/TipoLabel'
import { formatarData, formatarDataHora } from '../../utils/formatadores'

function Campo({ rotulo, children }) {
  return (
    <div>
      <p className="text-sm text-texto-secundario">{rotulo}</p>
      <div className="text-sm text-texto">{children}</div>
    </div>
  )
}

export default function OcorrenciaDetalheDialog({ ocorrencia, onFechar }) {
  if (!ocorrencia) return null

  return (
    <Dialog aberto titulo="Detalhes da ocorrência" onFechar={onFechar}>
      <div className="space-y-3">
        <Campo rotulo="Aluno(a)">
          {ocorrencia.aluno.nome} · {ocorrencia.aluno.matricula}
        </Campo>
        <Campo rotulo="Turma (no momento do registro)">{ocorrencia.turma.nome}</Campo>
        <Campo rotulo="Tipo">
          <TipoLabel tipo={ocorrencia.tipo} />
        </Campo>
        <Campo rotulo="Gravidade">
          <GravidadeBadge gravidade={ocorrencia.gravidade} />
        </Campo>
        <Campo rotulo="Data do ocorrido">{formatarData(ocorrencia.data)}</Campo>
        <Campo rotulo="Descrição">{ocorrencia.descricao}</Campo>
        <Campo rotulo="Situação">
          <SituacaoBadge arquivada={ocorrencia.arquivada} />
        </Campo>
        <Campo rotulo="Registrada por">
          {ocorrencia.criadoPor.nome} em {formatarDataHora(ocorrencia.criadoEm)}
        </Campo>
        {ocorrencia.arquivada && (
          <div className="rounded-campo bg-situacao-arquivada-fundo p-3">
            <Campo rotulo="Motivo do arquivamento">{ocorrencia.arquivamento.motivo}</Campo>
            <p className="mt-2 text-sm text-texto-secundario">
              Arquivada por {ocorrencia.arquivamento.por.nome} em {formatarDataHora(ocorrencia.arquivamento.em)}
            </p>
          </div>
        )}
      </div>
    </Dialog>
  )
}
