import { Turma, Usuario, ProfessorTurma } from '../models/index.js';
import ErroApp from '../utils/ErroApp.js';

export async function listar() {
  return Usuario.findAll({ where: { perfil: 'professor' }, attributes: ['id', 'nome', 'matricula'], order: [['nome', 'ASC']] });
}

export async function listarPorTurma(turmaId) {
  const turma = await Turma.findByPk(turmaId, {
    include: [{ association: 'professores', attributes: ['id', 'nome', 'matricula'], through: { attributes: [] } }],
  });
  if (!turma) throw new ErroApp(404, 'NAO_ENCONTRADO', 'Turma não encontrada.');

  return turma.professores;
}

export async function vincular(turmaId, professorId) {
  const turma = await Turma.findByPk(turmaId);
  if (!turma) throw new ErroApp(404, 'NAO_ENCONTRADO', 'Turma não encontrada.');

  const professor = await Usuario.findOne({ where: { id: professorId, perfil: 'professor' } });
  if (!professor) throw new ErroApp(404, 'NAO_ENCONTRADO', 'Professor não encontrado.');

  const existente = await ProfessorTurma.findOne({ where: { turmaId, professorId } });
  if (existente) throw new ErroApp(409, 'CONFLITO', 'Professor já vinculado a essa turma.');

  return ProfessorTurma.create({ turmaId, professorId });
}
