import jwt from 'jsonwebtoken';
import ErroApp from '../utils/ErroApp.js';

export default function autenticar(req, res, next) {
  const [esquema, token] = (req.headers.authorization || '').split(' ');
  if (esquema !== 'Bearer' || !token) {
    return next(new ErroApp(401, 'NAO_AUTENTICADO', 'Faça login para continuar.'));
  }
  try {
    const { sub, perfil } = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: sub, perfil };
    return next();
  } catch {
    return next(new ErroApp(401, 'NAO_AUTENTICADO', 'Sessão inválida ou expirada.'));
  }
}
