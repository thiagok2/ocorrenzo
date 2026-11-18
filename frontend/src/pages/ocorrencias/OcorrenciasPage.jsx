import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Pagination from '../../components/ui/Pagination'
import Skeleton from '../../components/ui/Skeleton'
import Toast from '../../components/ui/Toast'
import useOcorrencias from '../../hooks/useOcorrencias'
import useTurmas from '../../hooks/useTurmas'
import ArquivarOcorrenciaDialog from './ArquivarOcorrenciaDialog'
import FilterBar from './FilterBar'
import OcorrenciaDetalheDialog from './OcorrenciaDetalheDialog'
import OcorrenciasTable from './OcorrenciasTable'
import RegistrarOcorrenciaDrawer from './RegistrarOcorrenciaDrawer'
import SituacaoTabs from './SituacaoTabs'

const PAGE_SIZE = 10
const CONTEXTO_DRAWER_VAZIO = { alunoInicial: null, referenciaId: null }

export default function OcorrenciasPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [drawerAberto, setDrawerAberto] = useState(false)
  const [drawerChave, setDrawerChave] = useState(0)
  const [drawerContexto, setDrawerContexto] = useState(CONTEXTO_DRAWER_VAZIO)
  const [detalheAberto, setDetalheAberto] = useState(null)
  const [arquivarAberto, setArquivarAberto] = useState(null)
  const [toast, setToast] = useState(null)

  const filtros = {
    situacao: searchParams.get('situacao') ?? 'ativas',
    q: searchParams.get('q') ?? undefined,
    turmaId: searchParams.get('turmaId') ?? undefined,
    tipo: searchParams.get('tipo') ?? undefined,
    gravidade: searchParams.get('gravidade') ?? undefined,
    dataInicio: searchParams.get('dataInicio') ?? undefined,
    dataFim: searchParams.get('dataFim') ?? undefined,
    page: Number(searchParams.get('page') ?? 1),
    pageSize: PAGE_SIZE,
  }

  const { dados: turmas } = useTurmas()
  const { dados, carregando, erro, recarregar } = useOcorrencias(filtros)

  useEffect(() => {
    if (searchParams.get('registrar') === '1') {
      abrirDrawer()
      const proximos = new URLSearchParams(searchParams)
      proximos.delete('registrar')
      setSearchParams(proximos, { replace: true })
    }
  }, [searchParams, setSearchParams])

  function atualizarFiltros(proximosValores, { reiniciarPagina = true } = {}) {
    const proximos = { ...filtros, ...proximosValores }
    if (reiniciarPagina) proximos.page = 1
    const params = {}
    for (const [chave, valor] of Object.entries(proximos)) {
      if (valor !== null && valor !== undefined && valor !== '') params[chave] = String(valor)
    }
    setSearchParams(params)
  }

  function limparFiltros() {
    setSearchParams({ situacao: 'ativas' })
  }

  function abrirDrawer(contexto = CONTEXTO_DRAWER_VAZIO) {
    setDrawerContexto(contexto)
    setDrawerChave((chave) => chave + 1)
    setDrawerAberto(true)
  }

  function mostrarToast(tipo, mensagem) {
    setToast({ tipo, mensagem })
    setTimeout(() => setToast(null), 4000)
  }

  function aoRegistrarComSucesso() {
    setDrawerAberto(false)
    recarregar()
    mostrarToast('sucesso', 'Ocorrência registrada com sucesso.')
  }

  function aoRegistrarCorrecao(ocorrencia) {
    abrirDrawer({ alunoInicial: ocorrencia.aluno, referenciaId: ocorrencia.id })
  }

  function aoArquivarComSucesso() {
    setArquivarAberto(null)
    recarregar()
    mostrarToast('sucesso', 'Ocorrência arquivada com sucesso.')
  }

  return (
    <div>
      <PageHeader
        titulo="Ocorrências"
        subtitulo={dados ? `${dados.total} registro(s)` : undefined}
        acao={<Button onClick={() => abrirDrawer()}>Nova ocorrência</Button>}
      />

      <div className="mb-4">
        <SituacaoTabs
          situacao={filtros.situacao}
          total={dados?.total}
          onChange={(situacao) => atualizarFiltros({ situacao })}
        />
      </div>

      <FilterBar filtros={filtros} turmas={turmas} onChange={atualizarFiltros} onLimpar={limparFiltros} />

      {carregando && <Skeleton linhas={5} />}
      {!carregando && erro && <ErrorState onTentarNovamente={recarregar} />}
      {!carregando && !erro && dados && dados.itens.length === 0 && (
        <EmptyState mensagem="Não há ocorrências para os critérios selecionados." />
      )}
      {!carregando && !erro && dados && dados.itens.length > 0 && (
        <>
          <OcorrenciasTable
            itens={dados.itens}
            onVerDetalhes={setDetalheAberto}
            onArquivar={setArquivarAberto}
            onRegistrarCorrecao={aoRegistrarCorrecao}
          />
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

      <RegistrarOcorrenciaDrawer
        key={drawerChave}
        aberto={drawerAberto}
        onFechar={() => setDrawerAberto(false)}
        onRegistrado={aoRegistrarComSucesso}
        alunoInicial={drawerContexto.alunoInicial}
        referenciaId={drawerContexto.referenciaId}
      />

      <OcorrenciaDetalheDialog ocorrencia={detalheAberto} onFechar={() => setDetalheAberto(null)} />

      <ArquivarOcorrenciaDialog
        ocorrencia={arquivarAberto}
        onFechar={() => setArquivarAberto(null)}
        onArquivada={aoArquivarComSucesso}
      />

      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast tipo={toast.tipo} mensagem={toast.mensagem} onFechar={() => setToast(null)} />
        </div>
      )}
    </div>
  )
}
