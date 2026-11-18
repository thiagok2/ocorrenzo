import SearchInput from '../../components/ui/SearchInput'
import SelectFilter from '../../components/ui/SelectFilter'

export default function AlunosFilterBar({ filtros, turmas, onChange }) {
  const opcoesTurma = turmas.map((turma) => ({ value: turma.id, label: turma.nome }))

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <SearchInput
        placeholder="Buscar por nome ou matrícula"
        valorInicial={filtros.q ?? ''}
        onChange={(q) => onChange({ q })}
      />
      <SelectFilter rotulo="Turma" valor={filtros.turmaId} opcoes={opcoesTurma} onChange={(turmaId) => onChange({ turmaId })} />
    </div>
  )
}
