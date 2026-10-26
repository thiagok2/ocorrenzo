// VERSÃO SIMULADA — cada grupo é trocado pela versão real nas tarefas 1.3 a 1.8
import { Router } from 'express';
import ocorrenciasRouter from './ocorrencias.routes.js';
import sequelize from '../database/connection.js';

const router = Router();

router.get('/health', async (req, res) => { // R01
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', banco: 'conectado' });
  } catch (erro) {
    res.json({ status: 'ok', banco: 'nao-configurado' });
  }
});

router.post('/auth/login', (req, res) => res.json({ // R02
  token: 'token-simulado',
  usuario: { id: 'e9b0c1d2-0000-4000-8000-000000000001', nome: 'Verônica Lima', matricula: '2026000001', perfil: 'coordenador' },
}));

router.get('/auth/me', (req, res) => res.json({ // R03
  id: 'e9b0c1d2-0000-4000-8000-000000000001', nome: 'Verônica Lima', matricula: '2026000001', perfil: 'coordenador',
}));

router.use('/ocorrencias', ocorrenciasRouter); // R04 a R08

router.get('/alunos/:id/ocorrencias', (req, res) => // R09
  res.json({
    aluno: { id: req.params.id, nome: 'Ana Clara Silva', turmaAtual: { id: 'c3a1d2f4-0000-4000-8000-000000000001', nome: '8º A' } },
    itens: [],
    total: 0,
    page: 1,
    pageSize: 10,
  }));
router.get('/me/ocorrencias', (req, res) => // R10
  res.json({ itens: [], total: 0, page: 1, pageSize: 10 }));

export default router;
