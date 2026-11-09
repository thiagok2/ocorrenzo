import { Op } from 'sequelize';
import { Aluno, Ocorrencia } from '../models/index.js';
import ErroApp from '../utils/ErroApp.js';
import { podeAgirNaTurma, turmasPermitidas } from './escopo.service.js';

const INCLUDES = [
  { association: 'aluno', attributes: ['id', 'nome', 'matricula', 'usuarioId'] },
  { association: 'turma', attributes: ['id', 'nome'] },
  { association: 'autor', attributes: ['id', 'nome'] },
  { association: 'arquivador', attributes: ['id', 'nome'] },
];

export async function registrar(usuario, dados) {
  const aluno = await Aluno.findByPk(dados.alunoId);
  if (!aluno) throw new ErroApp(404, 'NAO_ENCONTRADO', 'Aluno não encontrado.');

  if (!(await podeAgirNaTurma(usuario, aluno.turmaId))) {
    throw new ErroApp(403, 'ACESSO_NEGADO', 'Acesso restrito às turmas em que você leciona.');
  }

  if (dados.referenciaId) {
    const referencia = await Ocorrencia.findByPk(dados.referenciaId);
    if (!referencia) throw new ErroApp(404, 'NAO_ENCONTRADO', 'Ocorrência de referência não encontrada.');
    if (referencia.alunoId !== aluno.id) {
      throw new ErroApp(400, 'VALIDACAO', 'Dados inválidos.', [
        { campo: 'referenciaId', mensagem: 'Deve apontar para uma ocorrência do mesmo aluno.' },
      ]);
    }
  }

  const ocorrencia = await Ocorrencia.create({
    alunoId: aluno.id,
    turmaId: aluno.turmaId, // RN5: captura a turma atual do aluno
    tipo: dados.tipo,
    gravidade: dados.gravidade,
    descricao: dados.descricao,
    dataOcorrencia: dados.data,
    criadoPor: usuario.id, // vem do token, nunca do body
    referenciaId: dados.referenciaId ?? null,
  });

  return Ocorrencia.findByPk(ocorrencia.id, { include: INCLUDES });
}

export async function listar(usuario, query) {
  const { situacao, q, turmaId, tipo, gravidade, dataInicio, dataFim, page, pageSize } = query;

  const where = {};
  if (situacao === 'ativas') where.arquivada = false;
  else if (situacao === 'arquivadas') where.arquivada = true;
  if (tipo) where.tipo = tipo;
  if (gravidade) where.gravidade = gravidade;
  if (dataInicio || dataFim) {
    where.dataOcorrencia = {};
    if (dataInicio) where.dataOcorrencia[Op.gte] = dataInicio;
    if (dataFim) where.dataOcorrencia[Op.lte] = dataFim;
  }

  const permitidas = await turmasPermitidas(usuario);
  if (turmaId) {
    if (!(permitidas === null || permitidas.includes(turmaId))) {
      throw new ErroApp(403, 'ACESSO_NEGADO', 'Acesso restrito às turmas em que você leciona.');
    }
    where.turmaId = turmaId;
  } else if (permitidas !== null) {
    where.turmaId = { [Op.in]: permitidas };
  }

  const includeAluno = { association: 'aluno', attributes: ['id', 'nome', 'matricula', 'usuarioId'] };
  if (q) {
    includeAluno.where = {
      [Op.or]: [{ nome: { [Op.iLike]: `%${q}%` } }, { matricula: { [Op.iLike]: `%${q}%` } }],
    };
  }

  const { rows, count } = await Ocorrencia.findAndCountAll({
    where,
    include: [
      includeAluno,
      { association: 'turma', attributes: ['id', 'nome'] },
      { association: 'autor', attributes: ['id', 'nome'] },
      { association: 'arquivador', attributes: ['id', 'nome'] },
    ],
    order: [['dataOcorrencia', 'DESC'], ['criadoEm', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return { itens: rows, total: count, page, pageSize };
}

export async function detalhar(usuario, id) {
  const ocorrencia = await Ocorrencia.findByPk(id, { include: INCLUDES });
  if (!ocorrencia) throw new ErroApp(404, 'NAO_ENCONTRADO', 'Ocorrência não encontrada.');

  if (usuario.perfil === 'aluno') {
    if (ocorrencia.aluno.usuarioId !== usuario.id) {
      throw new ErroApp(403, 'ACESSO_NEGADO', 'Acesso restrito ao próprio histórico.');
    }
  } else if (!(await podeAgirNaTurma(usuario, ocorrencia.turmaId))) {
    throw new ErroApp(403, 'ACESSO_NEGADO', 'Acesso restrito às turmas em que você leciona.');
  }

  return ocorrencia;
}
