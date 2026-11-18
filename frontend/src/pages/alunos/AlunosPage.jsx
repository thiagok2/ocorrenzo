import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Pagination from '../../components/ui/Pagination'
import Skeleton from '../../components/ui/Skeleton'
import Toast from '../../components/ui/Toast'
import { useAuth } from '../../contexts/AuthContext'
import useAlunos from '../../hooks/useAlunos'
import useTurmas from '../../hooks/useTurmas'
import RegistrarOcorrenciaDrawer from '../ocorrencias/RegistrarOcorrenciaDrawer'
import AlunoResumoPanel from './AlunoResumoPanel'
import AlunosFilterBar from './AlunosFilterBar'
import AlunosTable from './AlunosTable'
import CadastroAlunoDrawer from './CadastroAlunoDrawer'
import TransferirAlunoDialog from './TransferirAlunoDialog'

const PAGE_SIZE = 10

export default function AlunosPage() {
  const { usuario } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selecionadoId, setSelecionadoId] = useState(null)
  const [drawerAberto, setDrawerAberto] = useState(false)
  const [drawerChave, setDrawerChave] = useState(0)
  const [alunoParaRegistro, setAlunoParaRegistro] = useState(null)
  const [cadastroAberto, setCadastroAberto] = useState(false)
  const [cadastroChave, setCadastroChave] = useState(0)
  const [alunoParaTransferir, setAlunoParaTransferir] = useState(null)
  const [toast, setToast] = useState(null)

  const filtros = {
    q: searchParams.get('q') ?? undefined,
    turmaId: searchParams.get('turmaId') ?? undefined,
    page: Number(searchParams.get('page') ?? 1),
    pageSize: PAGE_SIZE,
  }

  const { dados: turmas } = useTurmas()
  const { dados, carregando, erro, recarregar } = useAlunos(filtros)

  function atualizarFiltros(proximosValores) {
    const proximos = { ...filtros, ...proximosValores, page: 1 }
    const params = {}
    for (const [chave, valor] of Object.entries(proximos)) {
      if (valor !== null && valor !== undefined && valor !== '') params[chave] = String(valor)
    }
    setSearchParams(params)
  }

  function abrirDrawer(aluno) {
    setAlunoParaRegistro(aluno)
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

  function aoCadastrarComSucesso() {
    setCadastroAberto(false)
    recarregar()
    mostrarToast('sucesso', 'Aluno cadastrado com sucesso.')
  }

  function aoTransferirComSucesso() {
    setAlunoParaTransferir(null)
    recarregar()
    mostrarToast('sucesso', 'Aluno transferido com sucesso.')
  }

  const turmaFiltrada = turmas.find((turma) => turma.id === filtros.turmaId)

  return (
    <div>
      <PageHeader
        titulo={turmaFiltrada ? `Alunos – Turma ${turmaFiltrada.nome}` : 'Alunos'}
        subtitulo={dados ? `${dados.total} aluno(s)` : undefined}
        acao={
          usuario.perfil === 'coordenador' && (
            <Button
              onClick={() => {
                setCadastroChave((chave) => chave + 1)
                setCadastroAberto(true)
              }}
            >
              Novo aluno
            </Button>
          )
        }
      />

      <AlunosFilterBar filtros={filtros} turmas={turmas} onChange={atualizarFiltros} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div>
          {carregando && <Skeleton linhas={5} />}
          {!carregando && erro && <ErrorState onTentarNovamente={recarregar} />}
          {!carregando && !erro && dados && dados.itens.length === 0 && (
            <EmptyState mensagem="Nenhum aluno encontrado para os critérios selecionados." />
          )}
          {!carregando && !erro && dados && dados.itens.length > 0 && (
            <>
              <AlunosTable
                itens={dados.itens}
                selecionadoId={selecionadoId}
                onSelecionar={(aluno) => setSelecionadoId(aluno.id)}
                onRegistrarOcorrencia={abrirDrawer}
                onTransferir={setAlunoParaTransferir}
              />
              <div className="mt-4">
                <Pagination
                  page={dados.page}
                  pageSize={dados.pageSize}
                  total={dados.total}
                  onChange={(page) => atualizarFiltros({ page })}
                />
              </div>
            </>
          )}
        </div>

        <div>
          {selecionadoId ? (
            <AlunoResumoPanel alunoId={selecionadoId} onRegistrarOcorrencia={abrirDrawer} />
          ) : (
            <p className="text-sm text-texto-secundario">Selecione um aluno na lista para ver o resumo.</p>
          )}
        </div>
      </div>

      <RegistrarOcorrenciaDrawer
        key={drawerChave}
        aberto={drawerAberto}
        onFechar={() => setDrawerAberto(false)}
        onRegistrado={aoRegistrarComSucesso}
        alunoInicial={alunoParaRegistro}
      />

      <CadastroAlunoDrawer
        key={cadastroChave}
        aberto={cadastroAberto}
        turmas={turmas}
        onFechar={() => setCadastroAberto(false)}
        onCriado={aoCadastrarComSucesso}
      />

      <TransferirAlunoDialog
        aluno={alunoParaTransferir}
        turmas={turmas}
        onFechar={() => setAlunoParaTransferir(null)}
        onTransferido={aoTransferirComSucesso}
      />

      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast tipo={toast.tipo} mensagem={toast.mensagem} onFechar={() => setToast(null)} />
        </div>
      )}
    </div>
  )
}
