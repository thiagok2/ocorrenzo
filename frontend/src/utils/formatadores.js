const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function formatarData(data) {
  if (!data) return ''
  const [ano, mes, dia] = data.slice(0, 10).split('-')
  return `${dia} ${MESES[Number(mes) - 1]} ${ano}`
}

export function formatarDataHora(dataIso) {
  if (!dataIso) return ''
  const data = new Date(dataIso)
  const dataFormatada = formatarData(dataIso)
  const hora = String(data.getHours()).padStart(2, '0')
  const minuto = String(data.getMinutes()).padStart(2, '0')
  return `${dataFormatada}, ${hora}:${minuto}`
}
