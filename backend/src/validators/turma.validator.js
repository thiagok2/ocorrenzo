import Joi from 'joi';

export const esquemaCriarTurma = Joi.object({
  nome: Joi.string().trim().min(1).max(30).required(),
});
