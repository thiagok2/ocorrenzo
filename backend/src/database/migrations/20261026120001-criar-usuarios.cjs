module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      nome: { type: Sequelize.STRING(120), allowNull: false },
      matricula: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      senha_hash: { type: Sequelize.STRING, allowNull: false },
      perfil: { type: Sequelize.ENUM('professor', 'coordenador', 'aluno'), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('usuarios');
  },
};
