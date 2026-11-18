export const TIPOS_OCORRENCIA = {
  atraso: 'Atraso',
  indisciplina: 'Indisciplina',
  uso_indevido_celular: 'Uso indevido de celular',
  dano_patrimonio: 'Dano ao patrimônio',
  destaque_positivo: 'Destaque positivo',
}

export const GRAVIDADES = {
  leve: 'Leve',
  media: 'Média',
  grave: 'Grave',
}

export const OPCOES_TIPO = Object.entries(TIPOS_OCORRENCIA).map(([value, label]) => ({ value, label }))

export const OPCOES_GRAVIDADE = [
  { value: 'leve', label: GRAVIDADES.leve, cor: '#1F7A47' },
  { value: 'media', label: GRAVIDADES.media, cor: '#A15C07' },
  { value: 'grave', label: GRAVIDADES.grave, cor: '#B91C1C' },
]

export const PERFIS = {
  coordenador: 'Coordenador',
  professor: 'Professor',
  apoio_pedagogico: 'Apoio pedagógico',
  aluno: 'Aluno',
}

export const ROTA_INICIAL_POR_PERFIL = {
  coordenador: '/ocorrencias',
  professor: '/ocorrencias',
  apoio_pedagogico: '/ocorrencias',
  aluno: '/meu-historico',
}
