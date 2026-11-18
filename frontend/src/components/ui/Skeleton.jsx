export default function Skeleton({ linhas = 4 }) {
  return (
    <div className="animate-pulse space-y-3" aria-hidden="true">
      {Array.from({ length: linhas }, (_, indice) => (
        <div key={indice} className="h-10 rounded-campo bg-primaria-suave" />
      ))}
    </div>
  )
}
