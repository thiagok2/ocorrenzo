import { Router } from 'express';
import ocorrenciasRouter from './ocorrencias.routes.js';
import alunosRouter from './alunos.routes.js';
import turmasRouter from './turmas.routes.js';
import professoresRouter from './professores.routes.js';
import authRouter from './auth.routes.js';
import autenticar from '../middlewares/autenticar.js';
import autorizarPerfil from '../middlewares/autorizarPerfil.js';
import validar from '../middlewares/validar.js';
import { esquemaHistoricoAluno } from '../validators/ocorrencia.validator.js';
import * as ocorrenciaController from '../controllers/ocorrencia.controller.js';
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

router.use('/ocorrencias', ocorrenciasRouter); // R04 a R08 reais
router.use('/alunos', alunosRouter); // R09, R12, R13, R15, R16 reais
router.use('/turmas', turmasRouter); // R11, R14, R18, R19 reais
router.use('/professores', professoresRouter); // R17 real

router.get(
  '/me/ocorrencias',
  autorizarPerfil('aluno'),
  validar(esquemaHistoricoAluno, 'query'),
  ocorrenciaController.meuHistorico,
); // R10

export default router;
