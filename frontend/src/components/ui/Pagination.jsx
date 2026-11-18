import Button from './Button'

export default function Pagination({ page, pageSize, total, onChange }) {
  const totalPaginas = Math.max(1, Math.ceil(total / pageSize))
  const inicio = total === 0 ? 0 : (page - 1) * pageSize + 1
  const fim = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between text-sm text-texto-secundario">
      <span className="tabular-nums">
        Exibindo {inicio} a {fim} de {total} registros
      </span>
      <div className="flex gap-2">
        <Button variante="secundario" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Anterior
        </Button>
        <Button variante="secundario" disabled={page >= totalPaginas} onClick={() => onChange(page + 1)}>
          Próxima
        </Button>
      </div>
    </div>
  )
}
