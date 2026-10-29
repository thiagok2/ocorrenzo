module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('alunos', 'telefone', { type: Sequelize.STRING(20) });
    await queryInterface.addColumn('alunos', 'email', { type: Sequelize.STRING(120) });
    await queryInterface.addColumn('alunos', 'nome_responsavel', { type: Sequelize.STRING(120) });
    await queryInterface.addColumn('alunos', 'telefone_responsavel', { type: Sequelize.STRING(20) });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('alunos', 'telefone_responsavel');
    await queryInterface.removeColumn('alunos', 'nome_responsavel');
    await queryInterface.removeColumn('alunos', 'email');
    await queryInterface.removeColumn('alunos', 'telefone');
  },
};
