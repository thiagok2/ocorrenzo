import { Router } from 'express';
import autorizarPerfil from '../middlewares/autorizarPerfil.js';
import validar from '../middlewares/validar.js';
import { esquemaListagemAlunos, esquemaCriarAluno, esquemaTransferirAluno } from '../validators/aluno.validator.js';
import { esquemaHistoricoAluno } from '../validators/ocorrencia.validator.js';
import * as alunoController from '../controllers/aluno.controller.js';
import * as ocorrenciaController from '../controllers/ocorrencia.controller.js';

const router = Router();

router.get('/', autorizarPerfil('professor', 'coordenador', 'apoio_pedagogico'), validar(esquemaListagemAlunos, 'query'), alunoController.listar); // R12
router.post('/', autorizarPerfil('coordenador'), validar(esquemaCriarAluno), alunoController.criar); // R15
router.get('/:id', alunoController.detalhar); // R13 — escopo (turma/titular) resolvido no service
router.patch('/:id/turma', autorizarPerfil('coordenador'), validar(esquemaTransferirAluno), alunoController.transferir); // R16
router.get('/:id/ocorrencias', validar(esquemaHistoricoAluno, 'query'), ocorrenciaController.historicoAluno); // R09 — escopo resolvido no service

export default router;
