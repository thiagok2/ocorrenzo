module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('alunos', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      nome: { type: Sequelize.STRING(120), allowNull: false },
      matricula: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      turma_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'turmas', key: 'id' } },
      usuario_id: { type: Sequelize.UUID, references: { model: 'usuarios', key: 'id' } },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('alunos', ['turma_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('alunos');
  },
};
