import Button from '../../components/ui/Button'
import SearchInput from '../../components/ui/SearchInput'
import SelectFilter from '../../components/ui/SelectFilter'
import FiltrosTipoGravidadePeriodo from './FiltrosTipoGravidadePeriodo'

export default function FilterBar({ filtros, turmas, onChange, onLimpar }) {
  const opcoesTurma = turmas.map((turma) => ({ value: turma.id, label: turma.nome }))

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <SearchInput
        placeholder="Buscar por nome ou matrícula"
        valorInicial={filtros.q ?? ''}
        onChange={(q) => onChange({ q })}
      />
      <SelectFilter rotulo="Turma" valor={filtros.turmaId} opcoes={opcoesTurma} onChange={(turmaId) => onChange({ turmaId })} />
      <FiltrosTipoGravidadePeriodo filtros={filtros} onChange={onChange} />
      <Button variante="link" onClick={onLimpar}>
        Limpar filtros
      </Button>
    </div>
  )
}
