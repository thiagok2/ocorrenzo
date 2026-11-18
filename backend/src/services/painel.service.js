import { Op, fn, col } from 'sequelize';
import { Turma, Aluno, Ocorrencia } from '../models/index.js';

const TIPOS = ['atraso', 'indisciplina', 'uso_indevido_celular', 'dano_patrimonio', 'destaque_positivo'];
const GRAVIDADES = ['leve', 'media', 'grave'];

function dataCorte(periodoDias) {
  const data = new Date();
  data.setDate(data.getDate() - periodoDias);
  return data.toISOString().slice(0, 10);
}

export async function turmas(periodoDias) {
  const desde = dataCorte(periodoDias);
  const todasTurmas = await Turma.findAll({ attributes: ['id', 'nome'], order: [['nome', 'ASC']] });

  const linhas = await Ocorrencia.findAll({
    where: { arquivada: false, dataOcorrencia: { [Op.gte]: desde } },
    attributes: ['turmaId', 'tipo', 'gravidade', [fn('COUNT', col('id')), 'total']],
    group: ['turmaId', 'tipo', 'gravidade'],
    raw: true,
  });

  return todasTurmas.map((turma) => {
    const porGravidade = Object.fromEntries(GRAVIDADES.map((gravidade) => [gravidade, 0]));
    const porTipo = Object.fromEntries(TIPOS.map((tipo) => [tipo, 0]));
    let totalAtivas = 0;

    for (const linha of linhas.filter((item) => item.turmaId === turma.id)) {
      const total = Number(linha.total);
      porGravidade[linha.gravidade] += total;
      porTipo[linha.tipo] += total;
      totalAtivas += total;
    }

    return { turmaId: turma.id, nome: turma.nome, totalAtivas, porGravidade, porTipo };
  });
}

export async function alunosEmAtencao(periodoDias, turmaId) {
  const desde = dataCorte(periodoDias);

  const where = {};
  if (turmaId) where.turmaId = turmaId;

  const alunos = await Aluno.findAll({
    where,
    attributes: ['id', 'nome', 'matricula'],
    include: [{ association: 'turma', attributes: ['id', 'nome'] }],
  });
  if (alunos.length === 0) return [];

  const linhas = await Ocorrencia.findAll({
    where: {
      alunoId: { [Op.in]: alunos.map((aluno) => aluno.id) },
      arquivada: false,
      tipo: { [Op.ne]: 'destaque_positivo' },
      dataOcorrencia: { [Op.gte]: desde },
    },
    attributes: ['alunoId', 'gravidade', [fn('COUNT', col('id')), 'total']],
    group: ['alunoId', 'gravidade'],
    raw: true,
  });

  const contadoresPorAluno = {};
  for (const linha of linhas) {
    const atual = contadoresPorAluno[linha.alunoId] ?? { totalAtivas: 0, graves: 0 };
    const total = Number(linha.total);
    atual.totalAtivas += total;
    if (linha.gravidade === 'grave') atual.graves += total;
    contadoresPorAluno[linha.alunoId] = atual;
  }

  return alunos
    .map((aluno) => {
      const contadores = contadoresPorAluno[aluno.id] ?? { totalAtivas: 0, graves: 0 };
      return {
        alunoId: aluno.id,
        nome: aluno.nome,
        matricula: aluno.matricula,
        turma: { id: aluno.turma.id, nome: aluno.turma.nome },
        ...contadores,
      };
    })
    .filter((aluno) => aluno.graves >= 3 || aluno.totalAtivas >= 5);
}
