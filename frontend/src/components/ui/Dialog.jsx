import useFocusTrap from './useFocusTrap'

export default function Dialog({ aberto, titulo, onFechar, rodape, children }) {
  const painelRef = useFocusTrap(aberto, onFechar)

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onFechar}
        className="absolute inset-0 bg-black/40"
      />
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="relative w-full max-w-md rounded-card bg-superficie p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-texto">{titulo}</h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-campo p-1 text-texto-secundario hover:bg-primaria-suave focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
        {rodape && <div className="mt-6 flex justify-end gap-2">{rodape}</div>}
      </div>
    </div>
  )
}
