// Postgres não permite remover um valor de ENUM com ALTER TYPE (down não é reversível de forma limpa;
// para desfazer de verdade seria preciso recriar o tipo inteiro). ADD VALUE funciona dentro de transação
// a partir do Postgres 12+, então não precisa de tratamento especial aqui.
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TYPE enum_usuarios_perfil ADD VALUE IF NOT EXISTS 'apoio_pedagogico';"
    );
  },
  async down() {
    // Sem rollback automático: remover um valor de ENUM no Postgres exige recriar o tipo manualmente.
  },
};
