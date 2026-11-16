import * as alunoService from '../services/aluno.service.js';

export async function listar(req, res) {
  const { itens, total, page, pageSize } = await alunoService.listar(req.usuario, req.query);
  res.json({ itens, total, page, pageSize });
}

export async function detalhar(req, res) {
  const aluno = await alunoService.detalhar(req.usuario, req.params.id);
  res.json(aluno);
}

export async function criar(req, res) {
  const aluno = await alunoService.criar(req.body);
  res.status(201).json(aluno);
}

export async function transferir(req, res) {
  const aluno = await alunoService.transferir(req.params.id, req.body.turmaId);
  res.json(aluno);
}
