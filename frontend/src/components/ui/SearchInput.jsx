import { useEffect, useState } from 'react'

export default function SearchInput({ placeholder = 'Buscar...', valorInicial = '', onChange, className = '' }) {
  const [texto, setTexto] = useState(valorInicial)

  useEffect(() => {
    const id = setTimeout(() => onChange(texto), 300)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce: dispara só quando o texto digitado muda
  }, [texto])

  return (
    <input
      type="search"
      value={texto}
      onChange={(evento) => setTexto(evento.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className={`rounded-campo border border-borda bg-superficie px-3 py-2 text-sm text-texto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${className}`}
    />
  )
}
