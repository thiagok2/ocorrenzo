import { Op, fn, col } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../database/connection.js';
import { Aluno, Turma, Usuario, Ocorrencia } from '../models/index.js';
import ErroApp from '../utils/ErroApp.js';
import { podeVerAluno, turmasPermitidas } from './escopo.service.js';

export async function listar(usuario, query) {
  const { q, turmaId, page, pageSize } = query;
  const permitidas = await turmasPermitidas(usuario);

  const where = {};
  if (turmaId) {
    if (!(permitidas === null || permitidas.includes(turmaId))) {
      throw new ErroApp(403, 'ACESSO_NEGADO', 'Acesso restrito às turmas em que você leciona.');
    }
    where.turmaId = turmaId;
  } else if (permitidas !== null) {
    where.turmaId = { [Op.in]: permitidas };
  }
  if (q) {
    where[Op.or] = [{ nome: { [Op.iLike]: `%${q}%` } }, { matricula: { [Op.iLike]: `%${q}%` } }];
  }

  const { rows, count } = await Aluno.findAndCountAll({
    where,
    include: [{ association: 'turma', attributes: ['id', 'nome'] }],
    order: [['nome', 'ASC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const alunoIds = rows.map((aluno) => aluno.id);
  const ocorrenciaWhere = { alunoId: { [Op.in]: alunoIds } };
  if (permitidas !== null) ocorrenciaWhere.turmaId = { [Op.in]: permitidas };

  const [contadoresAtivas, ultimasOcorrencias] = await Promise.all([
    Ocorrencia.findAll({
      where: { ...ocorrenciaWhere, arquivada: false },
      attributes: ['alunoId', [fn('COUNT', col('id')), 'total']],
      group: ['alunoId'],
      raw: true,
    }),
    Ocorrencia.findAll({
      where: ocorrenciaWhere,
      attributes: ['alunoId', [fn('MAX', col('data_ocorrencia')), 'ultima']],
      group: ['alunoId'],
      raw: true,
    }),
  ]);

  const totalPorAluno = Object.fromEntries(contadoresAtivas.map((linha) => [linha.alunoId, Number(linha.total)]));
  const ultimaPorAluno = Object.fromEntries(ultimasOcorrencias.map((linha) => [linha.alunoId, linha.ultima]));

  const itens = rows.map((aluno) => ({
    id: aluno.id,
    nome: aluno.nome,
    matricula: aluno.matricula,
    turma: { id: aluno.turma.id, nome: aluno.turma.nome },
    totalOcorrenciasAtivas: totalPorAluno[aluno.id] ?? 0,
    ultimaOcorrenciaEm: ultimaPorAluno[aluno.id] ?? null,
  }));

  return { itens, total: count, page, pageSize };
}

export async function detalhar(usuario, id) {
  const aluno = await Aluno.findByPk(id, { include: [{ association: 'turma', attributes: ['id', 'nome'] }] });
  if (!aluno) throw new ErroApp(404, 'NAO_ENCONTRADO', 'Aluno não encontrado.');

  if (!(await podeVerAluno(usuario, aluno))) {
    const mensagem = usuario.perfil === 'aluno' ? 'Acesso restrito ao próprio histórico.' : 'Acesso restrito às turmas em que você leciona.';
    throw new ErroApp(403, 'ACESSO_NEGADO', mensagem);
  }

  const where = { alunoId: aluno.id };
  if (usuario.perfil !== 'aluno') {
    const permitidas = await turmasPermitidas(usuario);
    if (permitidas !== null) where.turmaId = { [Op.in]: permitidas };
  }

  const [totalAtivas, graves, arquivadas, ultimaOcorrenciaEm] = await Promise.all([
    Ocorrencia.count({ where: { ...where, arquivada: false } }),
    Ocorrencia.count({ where: { ...where, arquivada: false, gravidade: 'grave' } }),
    Ocorrencia.count({ where: { ...where, arquivada: true } }),
    Ocorrencia.max('dataOcorrencia', { where }),
  ]);

  return {
    id: aluno.id,
    nome: aluno.nome,
    matricula: aluno.matricula,
    turma: { id: aluno.turma.id, nome: aluno.turma.nome },
    resumo: { totalAtivas, graves, arquivadas, ultimaOcorrenciaEm: ultimaOcorrenciaEm ?? null },
  };
}

export async function criar({ nome, matricula, turmaId }) {
  const turma = await Turma.findByPk(turmaId);
  if (!turma) throw new ErroApp(404, 'NAO_ENCONTRADO', 'Turma não encontrada.');

  const matriculaExistente = await Usuario.findOne({ where: { matricula } });
  if (matriculaExistente) throw new ErroApp(409, 'CONFLITO', 'Já existe um usuário com essa matrícula.');

  const senhaHash = await bcrypt.hash(matricula, 10); // RN: senha inicial do aluno = matrícula

  const aluno = await sequelize.transaction(async (transaction) => {
    const usuario = await Usuario.create({ nome, matricula, senhaHash, perfil: 'aluno' }, { transaction });
    return Aluno.create({ nome, matricula, turmaId, usuarioId: usuario.id }, { transaction });
  });

  return { id: aluno.id, nome: aluno.nome, matricula: aluno.matricula, turma: { id: turma.id, nome: turma.nome } };
}

export async function transferir(id, turmaId) {
  const aluno = await Aluno.findByPk(id);
  if (!aluno) throw new ErroApp(404, 'NAO_ENCONTRADO', 'Aluno não encontrado.');

  const turma = await Turma.findByPk(turmaId);
  if (!turma) throw new ErroApp(404, 'NAO_ENCONTRADO', 'Turma não encontrada.');

  if (aluno.turmaId === turmaId) throw new ErroApp(409, 'CONFLITO', 'O aluno já está nessa turma.');

  aluno.turmaId = turmaId; // não toca nas ocorrências existentes (RN5 preserva a turma registrada)
  await aluno.save();

  return { id: aluno.id, nome: aluno.nome, matricula: aluno.matricula, turma: { id: turma.id, nome: turma.nome } };
}
