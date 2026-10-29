import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define('ProfessorTurma', {
    professorId: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
    turmaId: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
  }, { tableName: 'professores_turmas', underscored: true, timestamps: false });
