import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define('Turma', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nome: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    numero: { type: DataTypes.STRING(20) },
    observacoes: { type: DataTypes.TEXT },
    etapaEnsino: { type: DataTypes.ENUM('fundamental_1', 'fundamental_2', 'medio') },
    turno: { type: DataTypes.ENUM('matutino', 'vespertino', 'noturno', 'integral') },
  }, { tableName: 'turmas', underscored: true });
