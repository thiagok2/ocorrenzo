import ErroApp from '../utils/ErroApp.js';

export default function autorizarPerfil(...perfis) {
  return (req, res, next) =>
    perfis.includes(req.usuario.perfil)
      ? next()
      : next(new ErroApp(403, 'ACESSO_NEGADO', 'Acesso negado.'));
}
