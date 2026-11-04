'use strict';

const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

// Seeder de desenvolvimento (Tarefa 1.2) — NUNCA deve rodar em produção.
const SENHA_PADRAO = 'senha123';

const PROFESSORES = [
  { nome: 'Thiago Oliveira', matricula: '2026000002' },
  { nome: 'Osvaldo Pife', matricula: '2026000003' },
  { nome: 'Marici Lopes', matricula: '2026000004' },
];

const APOIO_PEDAGOGICO = [
  { nome: 'Fabricia', matricula: '2026000005' },
  { nome: 'Lidiane', matricula: '2026000006' },
];

const COORDENADOR = { nome: 'Marcio Roberio', matricula: '2026000001' };

// 3º Ano do Ensino Médio — nomes e matrículas reais da turma
const ALUNOS = [
  ['Alana Sofia Mendonça Ribeiro Trajano', '2024308532'],
  ['Ana Lara Marques Candido Bandeira', '2024308579'],
  ['Ana Luísa de Assis Gomes', '2024317952'],
  ['Arthur César Vieira Martiniano Leite', '2024317925'],
  ['Eduardo Caio da Silva', '2024308603'],
  ['Enzo Gabriel Pimentel Barbosa', '2024308612'],
  ['Giovanna Anselmo Sampaio', '2024308640'],
  ['Iasmin Nikoly Bernardino da Silva', '2024317961'],
  ['Isabelly Christiny Gomes de Jesus', '2024317934'],
  ['Ivan Mendes da Costa', '2024309576'],
  ['João Marcos Cariri Santos', '2024308677'],
  ['João Vitor Rocha de Lima', '2024308668'],
  ['Kamilly Davinia de Souza Verçosa', '2024308659'],
  ['Lucas Gabriel Pontes de Oliveira e Silva Lima', '2024317907'],
  ['Lucas Rafael Neves Rego', '2024309674'],
  ['Luna Elara Caminha Brandão', '2024335280'],
  ['Lyvia Moreira Duarte do Espirito Santo', '2024315591'],
  ['Maria Beatriz da Silva Veiga', '2024309870'],
  ['Maria Beatriz Ferreira de Freitas', '2024309745'],
  ['Milena Vitória Bezerra da Silva Cavalcanti', '2024308686'],
  ['Styven Bôtto Alves Guimarães', '2024309790'],
  ['Yasmim Fernandes da Silva', '2024309923'],
];

module.exports = {
  async up(queryInterface) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Seeder de desenvolvimento não pode rodar em produção.');
    }

    const agora = new Date();
    const senhaHash = await bcrypt.hash(SENHA_PADRAO, 10);

    const turmaId = randomUUID();
    await queryInterface.bulkInsert('turmas', [{
      id: turmaId,
      nome: '3º Ano',
      etapa_ensino: 'medio',
      created_at: agora,
      updated_at: agora,
    }]);

    const professores = PROFESSORES.map((p) => ({ id: randomUUID(), ...p }));
    const apoio = APOIO_PEDAGOGICO.map((p) => ({ id: randomUUID(), ...p }));
    const coordenador = { id: randomUUID(), ...COORDENADOR };

    const usuariosStaff = [
      { ...coordenador, perfil: 'coordenador' },
      ...professores.map((p) => ({ ...p, perfil: 'professor' })),
      ...apoio.map((p) => ({ ...p, perfil: 'apoio_pedagogico' })),
    ];

    await queryInterface.bulkInsert('usuarios', usuariosStaff.map((u) => ({
      id: u.id,
      nome: u.nome,
      matricula: u.matricula,
      senha_hash: senhaHash,
      perfil: u.perfil,
      created_at: agora,
      updated_at: agora,
    })));

    await queryInterface.bulkInsert('professores_turmas', professores.map((p) => ({
      professor_id: p.id,
      turma_id: turmaId,
    })));

    const alunosUsuarios = ALUNOS.map(([nome, matricula]) => ({
      id: randomUUID(),
      nome,
      matricula,
    }));

    await queryInterface.bulkInsert('usuarios', alunosUsuarios.map((a) => ({
      id: a.id,
      nome: a.nome,
      matricula: a.matricula,
      senha_hash: senhaHash,
      perfil: 'aluno',
      created_at: agora,
      updated_at: agora,
    })));

    await queryInterface.bulkInsert('alunos', alunosUsuarios.map((a) => ({
      id: randomUUID(),
      nome: a.nome,
      matricula: a.matricula,
      turma_id: turmaId,
      usuario_id: a.id,
      created_at: agora,
      updated_at: agora,
    })));
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('alunos', null, {});
    await queryInterface.bulkDelete('professores_turmas', null, {});
    await queryInterface.bulkDelete('usuarios', null, {});
    await queryInterface.bulkDelete('turmas', null, {});
  },
};
