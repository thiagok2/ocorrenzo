import request from 'supertest';
import app from '../src/app.js';
import { login, registrarOcorrencia, buscarAlunoPorMatricula, MATRICULA_COORDENADOR, MATRICULA_ALUNO } from './helpers.js';

describe('Geral', () => {
  it('login com senha errada → 401 CREDENCIAIS_INVALIDAS', async () => {
    const resposta = await request(app).post('/api/auth/login').send({ matricula: MATRICULA_COORDENADOR, senha: 'senha-errada' });
    expect(resposta.status).toBe(401);
    expect(resposta.body.codigo).toBe('CREDENCIAIS_INVALIDAS');
  });

  it('token ausente em rota protegida → 401 NAO_AUTENTICADO', async () => {
    const resposta = await request(app).get('/api/auth/me');
    expect(resposta.status).toBe(401);
    expect(resposta.body.codigo).toBe('NAO_AUTENTICADO');
  });

  it('descrição de 501 caracteres → 400 VALIDACAO', async () => {
    const token = await login(MATRICULA_COORDENADOR);
    const aluno = await buscarAlunoPorMatricula(token, MATRICULA_ALUNO);
    const resposta = await registrarOcorrencia(token, { alunoId: aluno.id, descricao: 'a'.repeat(501) });
    expect(resposta.status).toBe(400);
    expect(resposta.body.codigo).toBe('VALIDACAO');
  });

  it('data futura → 400 VALIDACAO', async () => {
    const token = await login(MATRICULA_COORDENADOR);
    const aluno = await buscarAlunoPorMatricula(token, MATRICULA_ALUNO);
    const amanha = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const resposta = await registrarOcorrencia(token, { alunoId: aluno.id, data: amanha });
    expect(resposta.status).toBe(400);
    expect(resposta.body.codigo).toBe('VALIDACAO');
  });
});
