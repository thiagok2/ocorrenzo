import request from 'supertest';
import app from '../src/app.js';
import { login, criarTurma, criarAluno, registrarOcorrencia, sufixoUnico, MATRICULA_COORDENADOR, MATRICULA_PROFESSOR } from './helpers.js';

describe('P6 - "Em atenção" recalculado a cada consulta', () => {
  let tokenCoordenador;
  let tokenProfessor;
  let turma;

  beforeAll(async () => {
    tokenCoordenador = await login(MATRICULA_COORDENADOR);
    tokenProfessor = await login(MATRICULA_PROFESSOR);
    turma = await criarTurma(tokenCoordenador, `P6 ${sufixoUnico()}`);
  });

  async function novoAluno() {
    const sufixo = sufixoUnico();
    return criarAluno(tokenCoordenador, { nome: `Aluno P6 ${sufixo}`, matricula: `P6${sufixo}`, turmaId: turma.id });
  }

  async function buscarNaAtencao(alunoId) {
    const resposta = await request(app)
      .get('/api/painel/alunos-em-atencao')
      .query({ periodoDias: 30, turmaId: turma.id })
      .set('Authorization', `Bearer ${tokenCoordenador}`);
    return resposta.body.find((item) => item.alunoId === alunoId);
  }

  it('professor não acessa o painel (403)', async () => {
    const resposta = await request(app).get('/api/painel/turmas').set('Authorization', `Bearer ${tokenProfessor}`);
    expect(resposta.status).toBe(403);
    expect(resposta.body.codigo).toBe('ACESSO_NEGADO');
  });

  it('valida periodoDias fora de {30,60,90}', async () => {
    const resposta = await request(app)
      .get('/api/painel/turmas')
      .query({ periodoDias: 45 })
      .set('Authorization', `Bearer ${tokenCoordenador}`);
    expect(resposta.status).toBe(400);
  });

  it('2 ocorrências graves não destacam; a 3ª destaca; arquivar uma remove o destaque', async () => {
    const aluno = await novoAluno();
    await registrarOcorrencia(tokenCoordenador, { alunoId: aluno.id, gravidade: 'grave', descricao: 'P6 grave 1' });
    await registrarOcorrencia(tokenCoordenador, { alunoId: aluno.id, gravidade: 'grave', descricao: 'P6 grave 2' });
    expect(await buscarNaAtencao(aluno.id)).toBeUndefined();

    const terceira = await registrarOcorrencia(tokenCoordenador, { alunoId: aluno.id, gravidade: 'grave', descricao: 'P6 grave 3' });
    const destaque = await buscarNaAtencao(aluno.id);
    expect(destaque).toBeTruthy();
    expect(destaque.graves).toBe(3);

    await request(app)
      .post(`/api/ocorrencias/${terceira.body.id}/arquivamento`)
      .set('Authorization', `Bearer ${tokenCoordenador}`)
      .send({ motivo: 'P6 - remover do destaque.' });
    expect(await buscarNaAtencao(aluno.id)).toBeUndefined();
  });

  it('5 ocorrências do tipo destaque_positivo não destacam o aluno', async () => {
    const aluno = await novoAluno();
    for (let indice = 0; indice < 5; indice += 1) {
      await registrarOcorrencia(tokenCoordenador, {
        alunoId: aluno.id,
        tipo: 'destaque_positivo',
        gravidade: 'leve',
        descricao: `P6 destaque ${indice}`,
      });
    }
    expect(await buscarNaAtencao(aluno.id)).toBeUndefined();
  });

  it('5 ocorrências ativas (mesmo leves) destacam por totalAtivas', async () => {
    const aluno = await novoAluno();
    for (let indice = 0; indice < 5; indice += 1) {
      await registrarOcorrencia(tokenCoordenador, { alunoId: aluno.id, tipo: 'atraso', gravidade: 'leve', descricao: `P6 leve ${indice}` });
    }
    const destaque = await buscarNaAtencao(aluno.id);
    expect(destaque).toBeTruthy();
    expect(destaque.totalAtivas).toBe(5);
    expect(destaque.graves).toBe(0);
  });

  it('GET /painel/turmas soma os contadores da turma por tipo e gravidade', async () => {
    const aluno = await novoAluno();
    await registrarOcorrencia(tokenCoordenador, { alunoId: aluno.id, tipo: 'dano_patrimonio', gravidade: 'media', descricao: 'P6 turma 1' });
    await registrarOcorrencia(tokenCoordenador, { alunoId: aluno.id, tipo: 'dano_patrimonio', gravidade: 'media', descricao: 'P6 turma 2' });

    const resposta = await request(app)
      .get('/api/painel/turmas')
      .query({ periodoDias: 30 })
      .set('Authorization', `Bearer ${tokenCoordenador}`);

    expect(resposta.status).toBe(200);
    const linha = resposta.body.find((item) => item.turmaId === turma.id);
    expect(linha).toBeTruthy();
    expect(linha.porTipo.dano_patrimonio).toBeGreaterThanOrEqual(2);
    expect(linha.porGravidade.media).toBeGreaterThanOrEqual(2);
  });
});
