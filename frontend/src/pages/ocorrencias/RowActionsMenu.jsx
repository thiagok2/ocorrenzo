import { useEffect, useRef, useState } from 'react'

export default function RowActionsMenu({ ocorrencia, onVerDetalhes, onArquivar, onRegistrarCorrecao }) {
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!aberto) return
    function aoClicarFora(evento) {
      if (!containerRef.current?.contains(evento.target)) setAberto(false)
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [aberto])

  function aoClicar(acao) {
    setAberto(false)
    acao(ocorrencia)
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setAberto((valor) => !valor)}
        aria-label={`Ações para ${ocorrencia.aluno.nome}`}
        aria-expanded={aberto}
        className="rounded-campo px-2 py-1 text-texto-secundario hover:bg-primaria-suave focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
      >
        ⋮
      </button>
      {aberto && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-1 w-48 rounded-campo border border-borda bg-superficie py-1 text-sm shadow-md"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => aoClicar(onVerDetalhes)}
            className="block w-full px-3 py-2 text-left text-texto hover:bg-primaria-suave"
          >
            Ver detalhes
          </button>
          {!ocorrencia.arquivada && (
            <button
              type="button"
              role="menuitem"
              onClick={() => aoClicar(onArquivar)}
              className="block w-full px-3 py-2 text-left text-texto hover:bg-primaria-suave"
            >
              Arquivar
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => aoClicar(onRegistrarCorrecao)}
            className="block w-full px-3 py-2 text-left text-texto hover:bg-primaria-suave"
          >
            Registrar correção
          </button>
        </div>
      )}
    </div>
  )
}
