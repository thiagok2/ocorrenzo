import { Router } from 'express';
import autorizarPerfil from '../middlewares/autorizarPerfil.js';
import validar from '../middlewares/validar.js';
import { esquemaCriarTurma } from '../validators/turma.validator.js';
import { esquemaVincularProfessor } from '../validators/professor.validator.js';
import * as turmaController from '../controllers/turma.controller.js';
import * as professorController from '../controllers/professor.controller.js';

const router = Router();

router.get('/', autorizarPerfil('professor', 'coordenador', 'apoio_pedagogico'), turmaController.listar); // R11
router.post('/', autorizarPerfil('coordenador'), validar(esquemaCriarTurma), turmaController.criar); // R14
router.get('/:id/professores', autorizarPerfil('coordenador', 'apoio_pedagogico'), professorController.listarPorTurma); // R18
router.post('/:id/professores', autorizarPerfil('coordenador'), validar(esquemaVincularProfessor), professorController.vincular); // R19

export default router;
