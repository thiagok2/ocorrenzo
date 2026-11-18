import SelectFilter from '../../components/ui/SelectFilter'
import { OPCOES_GRAVIDADE, OPCOES_TIPO } from '../../utils/constantes'

export default function FiltrosTipoGravidadePeriodo({ filtros, onChange }) {
  return (
    <>
      <SelectFilter rotulo="Tipo" valor={filtros.tipo} opcoes={OPCOES_TIPO} onChange={(tipo) => onChange({ tipo })} />
      <SelectFilter
        rotulo="Gravidade"
        valor={filtros.gravidade}
        opcoes={OPCOES_GRAVIDADE}
        onChange={(gravidade) => onChange({ gravidade })}
      />
      <label className="flex items-center gap-2 text-sm text-texto">
        <span className="text-texto-secundario">De:</span>
        <input
          type="date"
          value={filtros.dataInicio ?? ''}
          onChange={(evento) => onChange({ dataInicio: evento.target.value || null })}
          className="rounded-campo border border-borda bg-superficie px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-texto">
        <span className="text-texto-secundario">Até:</span>
        <input
          type="date"
          value={filtros.dataFim ?? ''}
          onChange={(evento) => onChange({ dataFim: evento.target.value || null })}
          className="rounded-campo border border-borda bg-superficie px-2 py-1.5 text-sm"
        />
      </label>
    </>
  )
}
