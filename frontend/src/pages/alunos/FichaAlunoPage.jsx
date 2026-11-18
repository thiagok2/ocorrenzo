import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import ErrorState from '../../components/ui/ErrorState'
import Pagination from '../../components/ui/Pagination'
import Skeleton from '../../components/ui/Skeleton'
import Toast from '../../components/ui/Toast'
import EmptyState from '../../components/ui/EmptyState'
import useAluno from '../../hooks/useAluno'
import useHistoricoAluno from '../../hooks/useHistoricoAluno'
import ArquivarOcorrenciaDialog from '../ocorrencias/ArquivarOcorrenciaDialog'
import FiltrosTipoGravidadePeriodo from '../ocorrencias/FiltrosTipoGravidadePeriodo'
import OcorrenciaDetalheDialog from '../ocorrencias/OcorrenciaDetalheDialog'
import OcorrenciasTable from '../ocorrencias/OcorrenciasTable'
import RegistrarOcorrenciaDrawer from '../ocorrencias/RegistrarOcorrenciaDrawer'
import SituacaoTabs from '../ocorrencias/SituacaoTabs'
import AlunoCabecalho from './AlunoCabecalho'

const PAGE_SIZE = 10

export default function FichaAlunoPage() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [drawerAberto, setDrawerAberto] = useState(false)
  const [drawerChave, setDrawerChave] = useState(0)
  const [drawerContexto, setDrawerContexto] = useState({ alunoInicial: null, referenciaId: null })
  const [detalheAberto, setDetalheAberto] = useState(null)
  const [arquivarAberto, setArquivarAberto] = useState(null)
  const [toast, setToast] = useState(null)

  const { dados: aluno, carregando: carregandoAluno, erro: erroAluno } = useAluno(id)

  const filtros = {
    situacao: searchParams.get('situacao') ?? 'ativas',
    tipo: searchParams.get('tipo') ?? undefined,
    gravidade: searchParams.get('gravidade') ?? undefined,
    dataInicio: searchParams.get('dataInicio') ?? undefined,
    dataFim: searchParams.get('dataFim') ?? undefined,
    page: Number(searchParams.get('page') ?? 1),
    pageSize: PAGE_SIZE,
  }

  const { dados, carregando, erro, recarregar } = useHistoricoAluno(id, filtros)

  function atualizarFiltros(proximosValores, { reiniciarPagina = true } = {}) {
    const proximos = { ...filtros, ...proximosValores }
    if (reiniciarPagina) proximos.page = 1
    const params = {}
    for (const [chave, valor] of Object.entries(proximos)) {
      if (valor !== null && valor !== undefined && valor !== '') params[chave] = String(valor)
    }
    setSearchParams(params)
  }

  function mostrarToast(tipo, mensagem) {
    setToast({ tipo, mensagem })
    setTimeout(() => setToast(null), 4000)
  }

  function aoRegistrarCorrecao(ocorrencia) {
    setDrawerContexto({
      alunoInicial: { id: ocorrencia.aluno.id, nome: ocorrencia.aluno.nome, matricula: ocorrencia.aluno.matricula, turma: ocorrencia.turma },
      referenciaId: ocorrencia.id,
    })
    setDrawerChave((chave) => chave + 1)
    setDrawerAberto(true)
  }

  function aoRegistrarComSucesso() {
    setDrawerAberto(false)
    recarregar()
    mostrarToast('sucesso', 'Ocorrência registrada com sucesso.')
  }

  function aoArquivarComSucesso() {
    setArquivarAberto(null)
    recarregar()
    mostrarToast('sucesso', 'Ocorrência arquivada com sucesso.')
  }

  if (carregandoAluno) return <Skeleton linhas={4} />
  if (erroAluno || !aluno) return <ErrorState mensagem="Não foi possível carregar o aluno." />

  return (
    <div>
      <AlunoCabecalho aluno={aluno} />

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
          <OcorrenciasTable
            itens={dados.itens}
            mostrarAluno={false}
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
