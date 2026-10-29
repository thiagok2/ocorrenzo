import sequelize from '../database/connection.js';
import definirUsuario from './Usuario.js';
import definirTurma from './Turma.js';
import definirAluno from './Aluno.js';
import definirProfessorTurma from './ProfessorTurma.js';
import definirOcorrencia from './Ocorrencia.js';

const Usuario = definirUsuario(sequelize);
const Turma = definirTurma(sequelize);
const Aluno = definirAluno(sequelize);
const ProfessorTurma = definirProfessorTurma(sequelize);
const Ocorrencia = definirOcorrencia(sequelize);

Turma.hasMany(Aluno, { foreignKey: 'turmaId', as: 'alunos' });
Aluno.belongsTo(Turma, { foreignKey: 'turmaId', as: 'turma' });
Aluno.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

Aluno.hasMany(Ocorrencia, { foreignKey: 'alunoId', as: 'ocorrencias' });
Ocorrencia.belongsTo(Aluno, { foreignKey: 'alunoId', as: 'aluno' });
Ocorrencia.belongsTo(Turma, { foreignKey: 'turmaId', as: 'turma' });
Ocorrencia.belongsTo(Usuario, { foreignKey: 'criadoPor', as: 'autor' });
Ocorrencia.belongsTo(Usuario, { foreignKey: 'arquivadoPor', as: 'arquivador' });

Usuario.belongsToMany(Turma, { through: ProfessorTurma, foreignKey: 'professorId', otherKey: 'turmaId', as: 'turmasLecionadas' });
Turma.belongsToMany(Usuario, { through: ProfessorTurma, foreignKey: 'turmaId', otherKey: 'professorId', as: 'professores' });

export { sequelize, Usuario, Turma, Aluno, ProfessorTurma, Ocorrencia };
