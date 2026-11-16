import * as professorService from '../services/professor.service.js';

function serializar(professor) {
  return { id: professor.id, nome: professor.nome, matricula: professor.matricula };
}

export async function listar(req, res) {
  const professores = await professorService.listar();
  res.json(professores.map(serializar));
}

export async function listarPorTurma(req, res) {
  const professores = await professorService.listarPorTurma(req.params.id);
  res.json(professores.map(serializar));
}

export async function vincular(req, res) {
  const vinculo = await professorService.vincular(req.params.id, req.body.professorId);
  res.status(201).json({ turmaId: vinculo.turmaId, professorId: vinculo.professorId });
}
