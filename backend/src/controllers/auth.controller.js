import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Usuario } from '../models/index.js';
import ErroApp from '../utils/ErroApp.js';

export async function login(req, res) {
  const { matricula, senha } = req.body;

  const usuario = await Usuario.findOne({ where: { matricula } });
  const senhaOk = usuario && (await bcrypt.compare(senha, usuario.senhaHash));
  if (!senhaOk) {
    throw new ErroApp(401, 'CREDENCIAIS_INVALIDAS', 'Matrícula ou senha inválidos.');
  }

  const token = jwt.sign({ perfil: usuario.perfil }, process.env.JWT_SECRET, {
    subject: usuario.id,
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.json({
    token,
    usuario: { id: usuario.id, nome: usuario.nome, matricula: usuario.matricula, perfil: usuario.perfil },
  });
}

export async function me(req, res) {
  const usuario = await Usuario.findByPk(req.usuario.id);
  if (!usuario) {
    throw new ErroApp(401, 'NAO_AUTENTICADO', 'Sessão inválida ou expirada.');
  }
  res.json({ id: usuario.id, nome: usuario.nome, matricula: usuario.matricula, perfil: usuario.perfil });
}
