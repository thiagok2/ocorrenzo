const CORES = {
  sucesso: 'bg-gravidade-leve-fundo text-gravidade-leve-texto',
  erro: 'bg-gravidade-grave-fundo text-gravidade-grave-texto',
  info: 'bg-primaria-suave text-primaria',
}

export default function Toast({ tipo = 'info', mensagem, onFechar }) {
  return (
    <div
      role="status"
      className={`flex items-center gap-3 rounded-card px-4 py-3 text-sm font-medium shadow-md ${CORES[tipo]}`}
    >
      <span>{mensagem}</span>
      {onFechar && (
        <button type="button" onClick={onFechar} aria-label="Fechar aviso" className="text-current">
          ✕
        </button>
      )}
    </div>
  )
}
