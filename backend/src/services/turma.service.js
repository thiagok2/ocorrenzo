import { Turma } from '../models/index.js';
import ErroApp from '../utils/ErroApp.js';
import { turmasPermitidas } from './escopo.service.js';

export async function listar(usuario) {
  const permitidas = await turmasPermitidas(usuario);
  const where = permitidas === null ? {} : { id: permitidas };
  return Turma.findAll({ where, attributes: ['id', 'nome'], order: [['nome', 'ASC']] });
}

export async function criar(nome) {
  const existente = await Turma.findOne({ where: { nome } });
  if (existente) throw new ErroApp(409, 'CONFLITO', 'Já existe uma turma com esse nome.');

  return Turma.create({ nome });
}
