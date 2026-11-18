import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import ErrorState from '../../components/ui/ErrorState'
import Skeleton from '../../components/ui/Skeleton'
import usePainelAlunosEmAtencao from '../../hooks/usePainelAlunosEmAtencao'
import usePainelTurmas from '../../hooks/usePainelTurmas'
import AlunosEmAtencaoList from './AlunosEmAtencaoList'
import PeriodoSelect from './PeriodoSelect'
import TurmaCard from './TurmaCard'

export default function PainelPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const periodoDias = Number(searchParams.get('periodoDias') ?? 30)

  const { dados: turmas, carregando: carregandoTurmas, erro: erroTurmas, recarregar: recarregarTurmas } = usePainelTurmas(periodoDias)
  const {
    dados: alunosEmAtencao,
    carregando: carregandoAlunos,
    erro: erroAlunos,
    recarregar: recarregarAlunos,
  } = usePainelAlunosEmAtencao(periodoDias)

  return (
    <div>
      <PageHeader titulo="Painel" acao={<PeriodoSelect periodoDias={periodoDias} onChange={(valor) => setSearchParams({ periodoDias: String(valor) })} />} />

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-texto-secundario">Turmas</h2>
        {carregandoTurmas && <Skeleton linhas={3} />}
        {!carregandoTurmas && erroTurmas && <ErrorState onTentarNovamente={recarregarTurmas} />}
        {!carregandoTurmas && !erroTurmas && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {turmas.map((turma) => (
              <TurmaCard key={turma.turmaId} turma={turma} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-texto-secundario">Precisa de atenção</h2>
        {carregandoAlunos && <Skeleton linhas={3} />}
        {!carregandoAlunos && erroAlunos && <ErrorState onTentarNovamente={recarregarAlunos} />}
        {!carregandoAlunos && !erroAlunos && <AlunosEmAtencaoList itens={alunosEmAtencao} />}
      </section>
    </div>
  )
}
