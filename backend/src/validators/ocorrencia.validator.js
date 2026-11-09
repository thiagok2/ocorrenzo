import Joi from 'joi';

const TIPOS = ['atraso', 'indisciplina', 'uso_indevido_celular', 'dano_patrimonio', 'destaque_positivo'];
const GRAVIDADES = ['leve', 'media', 'grave'];

// Joi.date() converte a string em Date (meia-noite UTC). As regras de data (.max, .min etc.)
// precisam vir ANTES do .custom() — ele devolve a string 'YYYY-MM-DD' de volta, porque o
// Sequelize formataria o Date com o fuso local (DATEONLY), voltando um dia em fusos atrás
// de UTC (ex.: America/Maceio, UTC-3).
const paraDataISO = (valor) => valor.toISOString().slice(0, 10);

export const esquemaRegistro = Joi.object({
  alunoId: Joi.string().uuid().required(),
  tipo: Joi.string().valid(...TIPOS).required(),
  gravidade: Joi.string().valid(...GRAVIDADES).required(),
  descricao: Joi.string().trim().min(1).max(500).required(),
  data: Joi.date().iso().max('now').custom(paraDataISO).required(),
  referenciaId: Joi.string().uuid().allow(null),
});

export const esquemaListagem = Joi.object({
  situacao: Joi.string().valid('ativas', 'arquivadas', 'todas').default('ativas'),
  q: Joi.string().trim().allow(''),
  turmaId: Joi.string().uuid(),
  tipo: Joi.string().valid(...TIPOS),
  gravidade: Joi.string().valid(...GRAVIDADES),
  dataInicio: Joi.date().iso().custom(paraDataISO),
  dataFim: Joi.date().iso().custom(paraDataISO),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(50).default(10),
});
