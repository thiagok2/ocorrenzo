import { useId } from 'react'

export default function TextField({
  rotulo,
  icone = null,
  acaoDireita = null,
  erro,
  obrigatorio = false,
  id,
  className = '',
  ...props
}) {
  const idGerado = useId()
  const campoId = id ?? props.name ?? idGerado
  const erroId = erro ? `${campoId}-erro` : undefined

  return (
    <div className={className}>
      {rotulo && (
        <label htmlFor={campoId} className="mb-1 block text-sm font-medium text-texto">
          {rotulo}
          {obrigatorio && <span aria-hidden="true"> *</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {icone && <span className="pointer-events-none absolute left-3 text-texto-secundario">{icone}</span>}
        <input
          id={campoId}
          aria-invalid={Boolean(erro)}
          aria-describedby={erroId}
          aria-required={obrigatorio}
          className={`w-full rounded-campo border px-3 py-2 text-sm text-texto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
            icone ? 'pl-9' : ''
          } ${acaoDireita ? 'pr-10' : ''} ${erro ? 'border-gravidade-grave-texto' : 'border-borda'}`}
          {...props}
        />
        {acaoDireita && <span className="absolute right-2">{acaoDireita}</span>}
      </div>
      {erro && (
        <p id={erroId} className="mt-1 text-sm text-gravidade-grave-texto">
          {erro}
        </p>
      )}
    </div>
  )
}
