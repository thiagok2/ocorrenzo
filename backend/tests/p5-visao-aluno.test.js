import request from 'supertest';
import app from '../src/app.js';
import {
  login,
  registrarOcorrencia,
  buscarAlunoPorMatricula,
  MATRICULA_COORDENADOR,
  MATRICULA_ALUNO,
  MATRICULA_OUTRO_ALUNO,
} from './helpers.js';

describe('P5 - Aluno só vê o que é seu', () => {
  let tokenCoordenador;
  let tokenAluno;
  let meuAluno;
  let outroAluno;

  beforeAll(async () => {
    tokenCoordenador = await login(MATRICULA_COORDENADOR);
    tokenAluno = await login(MATRICULA_ALUNO);
    meuAluno = await buscarAlunoPorMatricula(tokenCoordenador, MATRICULA_ALUNO);
    outroAluno = await buscarAlunoPorMatricula(tokenCoordenador, MATRICULA_OUTRO_ALUNO);
  });

  it('GET /alunos/{outro}/ocorrencias → 403', async () => {
    const resposta = await request(app)
      .get(`/api/alunos/${outroAluno.id}/ocorrencias`)
      .set('Authorization', `Bearer ${tokenAluno}`);
    expect(resposta.status).toBe(403);
    expect(resposta.body.codigo).toBe('ACESSO_NEGADO');
  });

  it('/me/ocorrencias só traz as próprias', async () => {
    const minhaOcorrencia = await registrarOcorrencia(tokenCoordenador, { alunoId: meuAluno.id, descricao: 'P5 - minha ocorrência.' });
    const ocorrenciaDoOutro = await registrarOcorrencia(tokenCoordenador, { alunoId: outroAluno.id, descricao: 'P5 - ocorrência do outro aluno.' });

    const resposta = await request(app).get('/api/me/ocorrencias').set('Authorization', `Bearer ${tokenAluno}`);
    expect(resposta.status).toBe(200);

    const ids = resposta.body.itens.map((item) => item.id);
    expect(ids).toContain(minhaOcorrencia.body.id);
    expect(ids).not.toContain(ocorrenciaDoOutro.body.id);
  });
});
