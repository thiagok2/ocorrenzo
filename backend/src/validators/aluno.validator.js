import Joi from 'joi';

export const esquemaListagemAlunos = Joi.object({
  q: Joi.string().trim().allow(''),
  turmaId: Joi.string().uuid(),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(50).default(10),
});

export const esquemaCriarAluno = Joi.object({
  nome: Joi.string().trim().min(1).max(120).required(),
  matricula: Joi.string().trim().min(1).max(20).required(),
  turmaId: Joi.string().uuid().required(),
});

export const esquemaTransferirAluno = Joi.object({
  turmaId: Joi.string().uuid().required(),
});
