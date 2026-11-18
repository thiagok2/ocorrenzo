const VARIANTES = {
  primario: 'bg-primaria text-white hover:opacity-90 disabled:opacity-50',
  secundario: 'border border-borda bg-superficie text-texto hover:bg-primaria-suave disabled:opacity-50',
  link: 'text-primaria hover:underline disabled:opacity-50 px-0',
}

export default function Button({
  variante = 'primario',
  carregando = false,
  icone = null,
  type = 'button',
  className = '',
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      className={`inline-flex items-center justify-center gap-2 rounded-campo px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${VARIANTES[variante]} ${className}`}
      {...props}
    >
      {carregando && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {!carregando && icone}
      {children}
    </button>
  )
}
