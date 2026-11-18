import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Pagination from '../../components/ui/Pagination'
import Skeleton from '../../components/ui/Skeleton'
import useMeuHistorico from '../../hooks/useMeuHistorico'
import FiltrosTipoGravidadePeriodo from '../ocorrencias/FiltrosTipoGravidadePeriodo'
import OcorrenciaDetalheDialog from '../ocorrencias/OcorrenciaDetalheDialog'
import SituacaoTabs from '../ocorrencias/SituacaoTabs'
import HistoricoTable from './HistoricoTable'

const PAGE_SIZE = 10

export default function MeuHistoricoPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [detalheAberto, setDetalheAberto] = useState(null)

  const filtros = {
    situacao: searchParams.get('situacao') ?? 'ativas',
    tipo: searchParams.get('tipo') ?? undefined,
    gravidade: searchParams.get('gravidade') ?? undefined,
    dataInicio: searchParams.get('dataInicio') ?? undefined,
    dataFim: searchParams.get('dataFim') ?? undefined,
    page: Number(searchParams.get('page') ?? 1),
    pageSize: PAGE_SIZE,
  }

  const { dados, carregando, erro, recarregar } = useMeuHistorico(filtros)

  function atualizarFiltros(proximosValores, { reiniciarPagina = true } = {}) {
    const proximos = { ...filtros, ...proximosValores }
    if (reiniciarPagina) proximos.page = 1
    const params = {}
    for (const [chave, valor] of Object.entries(proximos)) {
      if (valor !== null && valor !== undefined && valor !== '') params[chave] = String(valor)
    }
    setSearchParams(params)
  }

  return (
    <div>
      <PageHeader titulo="Meu histórico" subtitulo={dados ? `${dados.total} registro(s)` : undefined} />

      <div className="mb-4">
        <SituacaoTabs situacao={filtros.situacao} total={dados?.total} onChange={(situacao) => atualizarFiltros({ situacao })} />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <FiltrosTipoGravidadePeriodo filtros={filtros} onChange={atualizarFiltros} />
      </div>

      {carregando && <Skeleton linhas={5} />}
      {!carregando && erro && <ErrorState onTentarNovamente={recarregar} />}
      {!carregando && !erro && dados && dados.itens.length === 0 && (
        <EmptyState mensagem="Não há ocorrências para os critérios selecionados." />
      )}
      {!carregando && !erro && dados && dados.itens.length > 0 && (
        <>
          <HistoricoTable itens={dados.itens} onVerDetalhes={setDetalheAberto} />
          <div className="mt-4">
            <Pagination
              page={dados.page}
              pageSize={dados.pageSize}
              total={dados.total}
              onChange={(page) => atualizarFiltros({ page }, { reiniciarPagina: false })}
            />
          </div>
        </>
      )}

      <OcorrenciaDetalheDialog ocorrencia={detalheAberto} onFechar={() => setDetalheAberto(null)} />
    </div>
  )
}
