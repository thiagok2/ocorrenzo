import { Router } from 'express';
import autorizarPerfil from '../middlewares/autorizarPerfil.js';
import validar from '../middlewares/validar.js';
import { esquemaPainelTurmas, esquemaPainelAlunosEmAtencao } from '../validators/painel.validator.js';
import * as painelController from '../controllers/painel.controller.js';

const router = Router();

router.get(
  '/turmas',
  autorizarPerfil('coordenador', 'apoio_pedagogico'),
  validar(esquemaPainelTurmas, 'query'),
  painelController.turmas,
); // R20

router.get(
  '/alunos-em-atencao',
  autorizarPerfil('coordenador', 'apoio_pedagogico'),
  validar(esquemaPainelAlunosEmAtencao, 'query'),
  painelController.alunosEmAtencao,
); // R21

export default router;
