import request from 'supertest';
import app from '../src/app.js';
import { Ocorrencia } from '../src/models/index.js';
import { login, registrarOcorrencia, buscarAlunoPorMatricula, MATRICULA_COORDENADOR, MATRICULA_ALUNO } from './helpers.js';

describe('P1 - Ocorrência é imutável', () => {
  let token;
  let ocorrenciaId;

  beforeAll(async () => {
    token = await login(MATRICULA_COORDENADOR);
    const aluno = await buscarAlunoPorMatricula(token, MATRICULA_ALUNO);
    const resposta = await registrarOcorrencia(token, { alunoId: aluno.id, descricao: 'P1 - ocorrência de teste.' });
    ocorrenciaId = resposta.body.id;
  });

  it('recusa PATCH com 405 METODO_NAO_PERMITIDO', async () => {
    const resposta = await request(app)
      .patch(`/api/ocorrencias/${ocorrenciaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ descricao: 'tentando alterar' });

    expect(resposta.status).toBe(405);
    expect(resposta.body.codigo).toBe('METODO_NAO_PERMITIDO');
  });

  it('recusa DELETE com 405 METODO_NAO_PERMITIDO', async () => {
    const resposta = await request(app)
      .delete(`/api/ocorrencias/${ocorrenciaId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(405);
    expect(resposta.body.codigo).toBe('METODO_NAO_PERMITIDO');
  });

  it('instancia.update() fora da API lança OCORRENCIA_IMUTAVEL', async () => {
    const ocorrencia = await Ocorrencia.findByPk(ocorrenciaId);
    await expect(ocorrencia.update({ descricao: 'alterado direto no modelo' })).rejects.toThrow('OCORRENCIA_IMUTAVEL');
  });

  it('instancia.destroy() fora da API lança OCORRENCIA_NAO_PODE_SER_EXCLUIDA', async () => {
    const ocorrencia = await Ocorrencia.findByPk(ocorrenciaId);
    await expect(ocorrencia.destroy()).rejects.toThrow('OCORRENCIA_NAO_PODE_SER_EXCLUIDA');
  });
});
