export default function EmptyState({ mensagem }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center text-texto-secundario">
      <p>{mensagem}</p>
    </div>
  )
}
