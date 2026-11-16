import { Router } from 'express';
import autorizarPerfil from '../middlewares/autorizarPerfil.js';
import * as professorController from '../controllers/professor.controller.js';

const router = Router();

router.get('/', autorizarPerfil('coordenador', 'apoio_pedagogico'), professorController.listar); // R17

export default router;
