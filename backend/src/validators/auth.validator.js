import Joi from 'joi';

export const esquemaLogin = Joi.object({
  matricula: Joi.string().trim().min(1).required(),
  senha: Joi.string().min(1).required(),
});
