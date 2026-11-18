export default function StatTile({ rotulo, valor, tom = 'neutro' }) {
  const cor = tom === 'alerta' ? 'text-gravidade-grave-texto' : 'text-texto'

  return (
    <div className="rounded-card border border-borda bg-superficie p-4">
      <p className="text-sm text-texto-secundario">{rotulo}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${cor}`}>{valor}</p>
    </div>
  )
}
