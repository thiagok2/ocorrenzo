import ErroApp from '../utils/ErroApp.js';

export default function validar(esquema, origem = 'body') {
  return (req, res, next) => {
    const { error, value } = esquema.validate(req[origem], { abortEarly: false, stripUnknown: true });
    if (error) {
      const detalhes = error.details.map((d) => ({ campo: d.path.join('.'), mensagem: d.message }));
      return next(new ErroApp(400, 'VALIDACAO', 'Dados inválidos.', detalhes));
    }
    req[origem] = value;
    return next();
  };
}
