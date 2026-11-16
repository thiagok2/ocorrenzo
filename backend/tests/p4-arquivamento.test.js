import request from 'supertest';
import app from '../src/app.js';
import { login, registrarOcorrencia, buscarAlunoPorMatricula, MATRICULA_COORDENADOR, MATRICULA_ALUNO } from './helpers.js';

describe('P4 - Arquivamento auditado, sem alterar o conteúdo original', () => {
  let token;
  let ocorrenciaId;

  beforeAll(async () => {
    token = await login(MATRICULA_COORDENADOR);
    const aluno = await buscarAlunoPorMatricula(token, MATRICULA_ALUNO);
    const resposta = await registrarOcorrencia(token, { alunoId: aluno.id, descricao: 'P4 - antes de arquivar.' });
    ocorrenciaId = resposta.body.id;
  });

  it('arquivar sem motivo → 400 VALIDACAO', async () => {
    const resposta = await request(app)
      .post(`/api/ocorrencias/${ocorrenciaId}/arquivamento`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(resposta.status).toBe(400);
    expect(resposta.body.codigo).toBe('VALIDACAO');
  });

  it('arquiva preservando os dados originais, e recusa um segundo arquivamento (409)', async () => {
    const arquivamento = await request(app)
      .post(`/api/ocorrencias/${ocorrenciaId}/arquivamento`)
      .set('Authorization', `Bearer ${token}`)
      .send({ motivo: 'Motivo de teste P4.' });

    expect(arquivamento.status).toBe(200);
    expect(arquivamento.body.arquivada).toBe(true);
    expect(arquivamento.body.descricao).toBe('P4 - antes de arquivar.');
    expect(arquivamento.body.arquivamento.motivo).toBe('Motivo de teste P4.');
    expect(arquivamento.body.arquivamento.por).toBeTruthy();
    expect(arquivamento.body.arquivamento.em).toBeTruthy();

    const duplo = await request(app)
      .post(`/api/ocorrencias/${ocorrenciaId}/arquivamento`)
      .set('Authorization', `Bearer ${token}`)
      .send({ motivo: 'Segunda tentativa.' });
    expect(duplo.status).toBe(409);
    expect(duplo.body.codigo).toBe('CONFLITO');
  });
});
