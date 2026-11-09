// R07 a R10 ainda simulados — serão trocados pela versão real nas tarefas 1.6 a 1.8
import { Router } from 'express';
import ocorrenciasRouter from './ocorrencias.routes.js';
import authRouter from './auth.routes.js';
import autenticar from '../middlewares/autenticar.js';
import sequelize from '../database/connection.js';

const router = Router();

router.get('/health', async (req, res) => { // R01 - público
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', banco: 'conectado' });
  } catch (erro) {
    res.json({ status: 'ok', banco: 'nao-configurado' });
  }
});

router.use('/auth', authRouter); // R02 (público) e R03 (protegida dentro do próprio router)

router.use(autenticar); // a partir daqui, toda rota exige token válido

router.use('/ocorrencias', ocorrenciasRouter); // R04 a R06 reais; R07 e R08 ainda com respostas simuladas

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
