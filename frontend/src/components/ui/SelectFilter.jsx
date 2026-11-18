export default function SelectFilter({ rotulo, valor, opcoes, onChange, placeholder = 'Todas', className = '' }) {
  return (
    <label className={`flex items-center gap-2 text-sm text-texto ${className}`}>
      <span className="text-texto-secundario">{rotulo}:</span>
      <select
        value={valor ?? ''}
        onChange={(evento) => onChange(evento.target.value || null)}
        className="rounded-campo border border-borda bg-superficie px-2 py-1.5 text-sm text-texto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
      >
        <option value="">{placeholder}</option>
        {opcoes.map((opcao) => (
          <option key={opcao.value} value={opcao.value}>
            {opcao.label}
          </option>
        ))}
      </select>
    </label>
  )
}
