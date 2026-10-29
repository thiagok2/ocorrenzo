import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define('Usuario', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nome: { type: DataTypes.STRING(120), allowNull: false },
    matricula: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    senhaHash: { type: DataTypes.STRING, allowNull: false },
    perfil: { type: DataTypes.ENUM('professor', 'coordenador', 'aluno', 'apoio_pedagogico'), allowNull: false },
  }, { tableName: 'usuarios', underscored: true });
