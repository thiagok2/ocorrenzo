import request from 'supertest';
import app from '../src/app.js';
import { login, registrarOcorrencia, criarTurma, criarAluno, sufixoUnico, MATRICULA_COORDENADOR } from './helpers.js';

describe('P3 - Turma do momento: a transferência não altera a turma já registrada (RN5)', () => {
  it('ocorrência antiga mantém a turma original depois do aluno ser transferido', async () => {
    const token = await login(MATRICULA_COORDENADOR);
    const sufixo = sufixoUnico();

    const turmaOrigem = await criarTurma(token, `P3-A-${sufixo}`);
    const turmaDestino = await criarTurma(token, `P3-B-${sufixo}`);
    const aluno = await criarAluno(token, { nome: 'Aluno P3', matricula: `8${sufixo}`, turmaId: turmaOrigem.id });

    const registro = await registrarOcorrencia(token, { alunoId: aluno.id, descricao: 'P3 - antes da transferência.' });
    expect(registro.status).toBe(201);
    expect(registro.body.turma.id).toBe(turmaOrigem.id);

    const transferencia = await request(app)
      .patch(`/api/alunos/${aluno.id}/turma`)
      .set('Authorization', `Bearer ${token}`)
      .send({ turmaId: turmaDestino.id });
    expect(transferencia.status).toBe(200);
    expect(transferencia.body.turma.id).toBe(turmaDestino.id);

    const detalhe = await request(app)
      .get(`/api/ocorrencias/${registro.body.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(detalhe.status).toBe(200);
    expect(detalhe.body.turma.id).toBe(turmaOrigem.id);

    const fichaAluno = await request(app)
      .get(`/api/alunos/${aluno.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(fichaAluno.body.turma.id).toBe(turmaDestino.id);
  });
});
