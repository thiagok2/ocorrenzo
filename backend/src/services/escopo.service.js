import { ProfessorTurma } from '../models/index.js';

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
