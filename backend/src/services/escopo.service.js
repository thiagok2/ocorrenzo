import { Op } from 'sequelize';
import { ProfessorTurma, Ocorrencia } from '../models/index.js';

// null = todas as turmas (coordenador e apoio_pedagogico, que só lê); [] = nenhuma (aluno); lista = turmas vinculadas (professor)
export async function turmasPermitidas(usuario) {
  if (usuario.perfil === 'coordenador' || usuario.perfil === 'apoio_pedagogico') return null;
  if (usuario.perfil === 'professor') {
    const vinculos = await ProfessorTurma.findAll({ where: { professorId: usuario.id }, attributes: ['turmaId'] });
    return vinculos.map((v) => v.turmaId);
  }
  return [];
}

export async function podeAgirNaTurma(usuario, turmaId) {
  const permitidas = await turmasPermitidas(usuario);
  return permitidas === null || permitidas.includes(turmaId);
}

// R09/R13: o aluno só vê o próprio; o professor acessa se a turma ATUAL do aluno é vinculada
// OU se existe alguma ocorrência dele registrada numa turma vinculada (aluno transferido).
export async function podeVerAluno(usuario, aluno) {
  if (usuario.perfil === 'aluno') return aluno.usuarioId === usuario.id;

  const permitidas = await turmasPermitidas(usuario);
  if (permitidas === null) return true;
  if (permitidas.includes(aluno.turmaId)) return true;

  const possuiOcorrenciaVinculada = await Ocorrencia.count({
    where: { alunoId: aluno.id, turmaId: { [Op.in]: permitidas } },
  });
  return possuiOcorrenciaVinculada > 0;
}
