import request from 'supertest';
import app from '../src/app.js';

// Matrículas fixas do seed de desenvolvimento (Tarefa 1.2), reaproveitado no banco de teste.
export const MATRICULA_COORDENADOR = '2026000001';
export const MATRICULA_PROFESSOR = '2026000002'; // Thiago Oliveira — vinculado só à turma única do seed
export const MATRICULA_ALUNO = '2024308532'; // Alana Sofia Mendonça Ribeiro Trajano
export const MATRICULA_OUTRO_ALUNO = '2024308579'; // Ana Lara Marques Candido Bandeira

export async function login(matricula, senha = 'senha123') {
  const resposta = await request(app).post('/api/auth/login').send({ matricula, senha });
  return resposta.body.token;
}

// Sufixo único pra nomes/matrículas de fixtures criadas em teste — evita colisão (409) entre execuções
// sucessivas de `npm test` sem resetar o banco. Em base 36 e curto porque `turmas.nome` tem no máximo
// 30 caracteres (esquemaCriarTurma).
export function sufixoUnico() {
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 1000).toString(36)}`;
}

export function dataHoje() {
  return new Date().toISOString().slice(0, 10);
}

export async function buscarAlunoPorMatricula(tokenCoordenador, matricula) {
  const resposta = await request(app)
    .get(`/api/alunos?q=${matricula}`)
    .set('Authorization', `Bearer ${tokenCoordenador}`);
  return resposta.body.itens[0];
}

export async function criarTurma(tokenCoordenador, nome) {
  const resposta = await request(app)
    .post('/api/turmas')
    .set('Authorization', `Bearer ${tokenCoordenador}`)
    .send({ nome });
  return resposta.body;
}

export async function criarAluno(tokenCoordenador, { nome, matricula, turmaId }) {
  const resposta = await request(app)
    .post('/api/alunos')
    .set('Authorization', `Bearer ${tokenCoordenador}`)
    .send({ nome, matricula, turmaId });
  return resposta.body;
}

export async function registrarOcorrencia(token, { alunoId, ...resto }) {
  return request(app)
    .post('/api/ocorrencias')
    .set('Authorization', `Bearer ${token}`)
    .send({ alunoId, tipo: 'atraso', gravidade: 'leve', descricao: 'Ocorrência de teste.', data: dataHoje(), ...resto });
}
