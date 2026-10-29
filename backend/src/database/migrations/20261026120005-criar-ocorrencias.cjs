module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ocorrencias', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      aluno_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'alunos', key: 'id' } },
      turma_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'turmas', key: 'id' } },
      tipo: {
        type: Sequelize.ENUM('atraso', 'indisciplina', 'uso_indevido_celular', 'dano_patrimonio', 'destaque_positivo'),
        allowNull: false,
      },
      gravidade: { type: Sequelize.ENUM('leve', 'media', 'grave'), allowNull: false },
      descricao: { type: Sequelize.STRING(500), allowNull: false },
      data_ocorrencia: { type: Sequelize.DATEONLY, allowNull: false },
      criado_por: { type: Sequelize.UUID, allowNull: false, references: { model: 'usuarios', key: 'id' } },
      criado_em: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      arquivada: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      motivo_arquivamento: { type: Sequelize.STRING(500) },
      arquivado_por: { type: Sequelize.UUID, references: { model: 'usuarios', key: 'id' } },
      arquivado_em: { type: Sequelize.DATE },
      referencia_id: { type: Sequelize.UUID, references: { model: 'ocorrencias', key: 'id' } },
    });
    await queryInterface.addIndex('ocorrencias', { fields: ['aluno_id', { attribute: 'data_ocorrencia', order: 'DESC' }] });
    await queryInterface.addIndex('ocorrencias', { fields: ['turma_id', { attribute: 'data_ocorrencia', order: 'DESC' }] });
    await queryInterface.addIndex('ocorrencias', ['arquivada']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('ocorrencias');
  },
};
