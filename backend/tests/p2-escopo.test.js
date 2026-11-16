import request from 'supertest';
import app from '../src/app.js';
import { login, registrarOcorrencia, criarTurma, criarAluno, sufixoUnico, MATRICULA_COORDENADOR, MATRICULA_PROFESSOR } from './helpers.js';

describe('P2 - Professor sem vínculo recebe 403', () => {
  let tokenCoordenador;
  let tokenProfessor;
  let turmaSemVinculo;
  let alunoSemVinculo;
  let ocorrenciaExistente;

  beforeAll(async () => {
    tokenCoordenador = await login(MATRICULA_COORDENADOR);
    tokenProfessor = await login(MATRICULA_PROFESSOR); // vinculado só à turma do seed, não à turma criada abaixo

    const sufixo = sufixoUnico();
    turmaSemVinculo = await criarTurma(tokenCoordenador, `P2-${sufixo}`);
    alunoSemVinculo = await criarAluno(tokenCoordenador, { nome: 'Aluno P2', matricula: `9${sufixo}`, turmaId: turmaSemVinculo.id });

    const resposta = await registrarOcorrencia(tokenCoordenador, { alunoId: alunoSemVinculo.id });
    ocorrenciaExistente = resposta.body;
  });

  it('registrar → 403', async () => {
    const resposta = await registrarOcorrencia(tokenProfessor, { alunoId: alunoSemVinculo.id });
    expect(resposta.status).toBe(403);
    expect(resposta.body.codigo).toBe('ACESSO_NEGADO');
  });

  it('listar por turmaId → 403', async () => {
    const resposta = await request(app)
      .get(`/api/ocorrencias?turmaId=${turmaSemVinculo.id}`)
      .set('Authorization', `Bearer ${tokenProfessor}`);
    expect(resposta.status).toBe(403);
    expect(resposta.body.codigo).toBe('ACESSO_NEGADO');
  });

  it('detalhar → 403', async () => {
    const resposta = await request(app)
      .get(`/api/ocorrencias/${ocorrenciaExistente.id}`)
      .set('Authorization', `Bearer ${tokenProfessor}`);
    expect(resposta.status).toBe(403);
    expect(resposta.body.codigo).toBe('ACESSO_NEGADO');
  });

  it('arquivar → 403', async () => {
    const resposta = await request(app)
      .post(`/api/ocorrencias/${ocorrenciaExistente.id}/arquivamento`)
      .set('Authorization', `Bearer ${tokenProfessor}`)
      .send({ motivo: 'Tentando arquivar sem vínculo.' });
    expect(resposta.status).toBe(403);
    expect(resposta.body.codigo).toBe('ACESSO_NEGADO');
  });
});
