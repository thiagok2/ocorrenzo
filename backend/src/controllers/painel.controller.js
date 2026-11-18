import * as painelService from '../services/painel.service.js';

export async function turmas(req, res) {
  const dados = await painelService.turmas(req.query.periodoDias);
  res.json(dados);
}

export async function alunosEmAtencao(req, res) {
  const dados = await painelService.alunosEmAtencao(req.query.periodoDias, req.query.turmaId);
  res.json(dados);
}
