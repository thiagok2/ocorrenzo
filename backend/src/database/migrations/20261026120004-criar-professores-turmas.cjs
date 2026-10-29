module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('professores_turmas', {
      professor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'usuarios', key: 'id' },
      },
      turma_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'turmas', key: 'id' },
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('professores_turmas');
  },
};
