import * as turmaService from '../services/turma.service.js';

export async function listar(req, res) {
  const turmas = await turmaService.listar(req.usuario);
  res.json(turmas.map((turma) => ({ id: turma.id, nome: turma.nome })));
}

export async function criar(req, res) {
  const turma = await turmaService.criar(req.body.nome);
  res.status(201).json({ id: turma.id, nome: turma.nome });
}
