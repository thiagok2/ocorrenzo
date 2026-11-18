export default function SituacaoBadge({ arquivada }) {
  const classes = arquivada
    ? 'text-situacao-arquivada-texto bg-situacao-arquivada-fundo'
    : 'text-situacao-ativa-texto bg-situacao-ativa-fundo'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {arquivada ? 'Arquivada' : 'Ativa'}
    </span>
  )
}
