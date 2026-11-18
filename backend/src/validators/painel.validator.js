import Joi from 'joi';

export const esquemaPainelTurmas = Joi.object({
  periodoDias: Joi.number().integer().valid(30, 60, 90).default(30),
});

export const esquemaPainelAlunosEmAtencao = Joi.object({
  periodoDias: Joi.number().integer().valid(30, 60, 90).default(30),
  turmaId: Joi.string().uuid(),
});
