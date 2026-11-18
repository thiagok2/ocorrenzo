const PALETA = ['#FCE7F3', '#DBEAFE', '#DCFCE7', '#FEF3C7', '#EDE9FE', '#FFE4E6']
const PALETA_TEXTO = ['#9D174D', '#1E40AF', '#166534', '#92400E', '#5B21B6', '#9F1239']

const TAMANHOS = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
}

function iniciais(nome) {
  const partes = nome.trim().split(/\s+/)
  const primeira = partes[0]?.[0] ?? ''
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
}

function indiceCor(nome) {
  const soma = nome.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return soma % PALETA.length
}

export default function Avatar({ nome, tamanho = 'md' }) {
  const indice = indiceCor(nome)
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${TAMANHOS[tamanho]}`}
      style={{ backgroundColor: PALETA[indice], color: PALETA_TEXTO[indice] }}
      aria-hidden="true"
    >
      {iniciais(nome)}
    </span>
  )
}
