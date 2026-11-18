export default function PageHeader({ breadcrumb, titulo, subtitulo, acao }) {
  return (
    <div className="mb-6">
      {breadcrumb && <p className="mb-1 text-sm text-texto-secundario">{breadcrumb}</p>}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-texto">{titulo}</h1>
          {subtitulo && <p className="text-sm text-texto-secundario">{subtitulo}</p>}
        </div>
        {acao}
      </div>
    </div>
  )
}
