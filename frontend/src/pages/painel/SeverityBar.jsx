const CORES = { leve: '#1F7A47', media: '#A15C07', grave: '#B91C1C' }

export default function SeverityBar({ porGravidade }) {
  const total = porGravidade.leve + porGravidade.media + porGravidade.grave

  if (total === 0) {
    return <div className="h-2 w-full rounded-full bg-borda" aria-hidden="true" />
  }

  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full" role="img" aria-label="Distribuição por gravidade">
      {['grave', 'media', 'leve'].map((gravidade) => {
        const percentual = (porGravidade[gravidade] / total) * 100
        if (percentual === 0) return null
        return <div key={gravidade} style={{ width: `${percentual}%`, backgroundColor: CORES[gravidade] }} />
      })}
    </div>
  )
}
