import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define('Aluno', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nome: { type: DataTypes.STRING(120), allowNull: false },
    matricula: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    turmaId: { type: DataTypes.UUID, allowNull: false }, // turma ATUAL (muda na transferência)
    usuarioId: { type: DataTypes.UUID },
    telefone: { type: DataTypes.STRING(20) },
    email: { type: DataTypes.STRING(120), validate: { isEmail: true } },
    nomeResponsavel: { type: DataTypes.STRING(120) },
    telefoneResponsavel: { type: DataTypes.STRING(20) },
  }, { tableName: 'alunos', underscored: true });
