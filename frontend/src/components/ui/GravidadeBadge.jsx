import { GRAVIDADES } from '../../utils/constantes'

const CORES = {
  leve: 'text-gravidade-leve-texto bg-gravidade-leve-fundo',
  media: 'text-gravidade-media-texto bg-gravidade-media-fundo',
  grave: 'text-gravidade-grave-texto bg-gravidade-grave-fundo',
}

export default function GravidadeBadge({ gravidade }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CORES[gravidade]}`}>
      {GRAVIDADES[gravidade]}
    </span>
  )
}
