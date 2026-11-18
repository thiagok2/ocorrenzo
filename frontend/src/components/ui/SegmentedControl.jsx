export default function SegmentedControl({ opcoes, valor, onChange, className = '' }) {
  return (
    <div role="tablist" className={`inline-flex rounded-campo border border-borda bg-superficie p-1 ${className}`}>
      {opcoes.map((opcao) => {
        const selecionado = opcao.value === valor
        return (
          <button
            key={opcao.value}
            type="button"
            role="tab"
            aria-selected={selecionado}
            onClick={() => onChange(opcao.value)}
            className={`flex items-center gap-2 rounded-campo px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
              selecionado ? 'bg-primaria-suave text-primaria' : 'text-texto-secundario hover:text-texto'
            }`}
          >
            {opcao.cor && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: opcao.cor }} aria-hidden="true" />}
            {opcao.label}
            {opcao.contagem !== undefined && <span className="tabular-nums">({opcao.contagem})</span>}
          </button>
        )
      })}
    </div>
  )
}
