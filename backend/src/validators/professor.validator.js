import Joi from 'joi';

export const esquemaVincularProfessor = Joi.object({
  professorId: Joi.string().uuid().required(),
});
