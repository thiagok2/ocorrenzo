import useFocusTrap from './useFocusTrap'

export default function Drawer({ aberto, titulo, onFechar, rodape, children }) {
  const painelRef = useFocusTrap(aberto, onFechar)

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
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
        className="relative flex h-full w-full max-w-md flex-col bg-superficie shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-borda px-6 py-4">
          <h2 className="text-lg font-semibold text-texto">{titulo}</h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-campo p-1 text-texto-secundario hover:bg-primaria-suave focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
          >
            ✕
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {rodape && <footer className="flex justify-end gap-2 border-t border-borda px-6 py-4">{rodape}</footer>}
      </div>
    </div>
  )
}
