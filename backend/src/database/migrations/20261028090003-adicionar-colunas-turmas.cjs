module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('turmas', 'numero', { type: Sequelize.STRING(20) });
    await queryInterface.addColumn('turmas', 'observacoes', { type: Sequelize.TEXT });
    await queryInterface.addColumn('turmas', 'etapa_ensino', {
      type: Sequelize.ENUM('fundamental_1', 'fundamental_2', 'medio'),
    });
    await queryInterface.addColumn('turmas', 'turno', {
      type: Sequelize.ENUM('matutino', 'vespertino', 'noturno', 'integral'),
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('turmas', 'turno');
    await queryInterface.removeColumn('turmas', 'etapa_ensino');
    await queryInterface.removeColumn('turmas', 'observacoes');
    await queryInterface.removeColumn('turmas', 'numero');
  },
};
