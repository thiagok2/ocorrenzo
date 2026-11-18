import { TIPOS_OCORRENCIA } from '../../utils/constantes'

export default function TipoLabel({ tipo }) {
  return <span>{TIPOS_OCORRENCIA[tipo] ?? tipo}</span>
}
