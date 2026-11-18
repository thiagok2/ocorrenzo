import { useId } from 'react'

export default function Textarea({ rotulo, valor, onChange, max = 500, obrigatorio = false, erro, id, ...props }) {
  const idGerado = useId()
  const campoId = id ?? props.name ?? idGerado
  const erroId = erro ? `${campoId}-erro` : undefined
  const noLimite = valor.length >= max

  return (
    <div>
      {rotulo && (
        <label htmlFor={campoId} className="mb-1 block text-sm font-medium text-texto">
          {rotulo}
          {obrigatorio && <span aria-hidden="true"> *</span>}
        </label>
      )}
      <textarea
        id={campoId}
        value={valor}
        onChange={(evento) => onChange(evento.target.value.slice(0, max))}
        aria-invalid={Boolean(erro)}
        aria-describedby={erroId}
        aria-required={obrigatorio}
        rows={4}
        className={`w-full rounded-campo border px-3 py-2 text-sm text-texto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
          erro ? 'border-gravidade-grave-texto' : 'border-borda'
        }`}
        {...props}
      />
      <div className="mt-1 flex justify-between text-sm">
        {erro ? <p id={erroId} className="text-gravidade-grave-texto">{erro}</p> : <span />}
        <span className={`tabular-nums ${noLimite ? 'text-gravidade-grave-texto' : 'text-texto-secundario'}`}>
          {valor.length}/{max}
        </span>
      </div>
    </div>
  )
}
