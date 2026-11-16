import { Op } from 'sequelize';
import { Aluno, Ocorrencia } from '../models/index.js';
import ErroApp from '../utils/ErroApp.js';
import { podeAgirNaTurma, podeVerAluno, turmasPermitidas } from './escopo.service.js';

const INCLUDES = [
  { association: 'aluno', attributes: ['id', 'nome', 'matricula', 'usuarioId'] },
  { association: 'turma', attributes: ['id', 'nome'] },
  { association: 'autor', attributes: ['id', 'nome'] },
  { association: 'arquivador', attributes: ['id', 'nome'] },
];

function montarFiltroPeriodo({ situacao, tipo, gravidade, dataInicio, dataFim }) {
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
  return where;
}

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
  const { q, turmaId, page, pageSize } = query;
  const where = montarFiltroPeriodo(query);

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

export async function arquivar(usuario, id, motivo) {
  const ocorrencia = await Ocorrencia.findByPk(id);
  if (!ocorrencia) throw new ErroApp(404, 'NAO_ENCONTRADO', 'Ocorrência não encontrada.');

  if (!(await podeAgirNaTurma(usuario, ocorrencia.turmaId))) {
    throw new ErroApp(403, 'ACESSO_NEGADO', 'Acesso restrito às turmas em que você leciona.');
  }
  if (ocorrencia.arquivada) throw new ErroApp(409, 'CONFLITO', 'Esta ocorrência já está arquivada.');

  ocorrencia.arquivada = true;
  ocorrencia.motivoArquivamento = motivo;
  ocorrencia.arquivadoPor = usuario.id;
  ocorrencia.arquivadoEm = new Date();
  await ocorrencia.save(); // dispara o hook beforeUpdate (RN1): só campos de arquivamento podem mudar

  return Ocorrencia.findByPk(ocorrencia.id, { include: INCLUDES });
}

async function montarHistorico(usuario, aluno, query) {
  const where = { ...montarFiltroPeriodo(query), alunoId: aluno.id };

  // o aluno vê todo o próprio histórico, sem restrição de turma; os demais perfis
  // só veem os itens das turmas vinculadas (coordenador/apoio_pedagogico: todas)
  if (usuario.perfil !== 'aluno') {
    const permitidas = await turmasPermitidas(usuario);
    if (permitidas !== null) where.turmaId = { [Op.in]: permitidas };
  }

  const { rows, count } = await Ocorrencia.findAndCountAll({
    where,
    include: INCLUDES,
    order: [['dataOcorrencia', 'DESC'], ['criadoEm', 'DESC']],
    limit: query.pageSize,
    offset: (query.page - 1) * query.pageSize,
  });

  return {
    aluno: { id: aluno.id, nome: aluno.nome, matricula: aluno.matricula, turmaAtual: { id: aluno.turma.id, nome: aluno.turma.nome } },
    itens: rows,
    total: count,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function historicoAluno(usuario, alunoId, query) {
  const aluno = await Aluno.findByPk(alunoId, { include: [{ association: 'turma', attributes: ['id', 'nome'] }] });
  if (!aluno) throw new ErroApp(404, 'NAO_ENCONTRADO', 'Aluno não encontrado.');

  if (!(await podeVerAluno(usuario, aluno))) {
    const mensagem = usuario.perfil === 'aluno' ? 'Acesso restrito ao próprio histórico.' : 'Acesso restrito às turmas em que você leciona.';
    throw new ErroApp(403, 'ACESSO_NEGADO', mensagem);
  }

  return montarHistorico(usuario, aluno, query);
}

export async function meuHistorico(usuario, query) {
  const aluno = await Aluno.findOne({ where: { usuarioId: usuario.id }, include: [{ association: 'turma', attributes: ['id', 'nome'] }] });
  if (!aluno) throw new ErroApp(404, 'NAO_ENCONTRADO', 'Aluno não encontrado.');

  return montarHistorico(usuario, aluno, query);
}
