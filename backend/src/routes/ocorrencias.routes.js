import { Router } from 'express';
import autorizarPerfil from '../middlewares/autorizarPerfil.js';
import validar from '../middlewares/validar.js';
import { esquemaRegistro, esquemaListagem, esquemaArquivamento } from '../validators/ocorrencia.validator.js';
import * as ocorrenciaController from '../controllers/ocorrencia.controller.js';

const router = Router();

router.post('/', autorizarPerfil('professor', 'coordenador'), validar(esquemaRegistro), ocorrenciaController.registrar); // R04
router.get('/', autorizarPerfil('professor', 'coordenador', 'apoio_pedagogico'), validar(esquemaListagem, 'query'), ocorrenciaController.listar); // R05
router.get('/:id', ocorrenciaController.detalhar); // R06 — escopo (turma/titular) resolvido no service
router.post(
  '/:id/arquivamento',
  autorizarPerfil('professor', 'coordenador'),
  validar(esquemaArquivamento),
  ocorrenciaController.arquivar,
); // R07

router.all('/:id', (req, res) => // R08 — qualquer outro método em /:id é recusado
  res.status(405).json({
    codigo: 'METODO_NAO_PERMITIDO',
    mensagem: 'Ocorrências não podem ser editadas ou excluídas. Registre uma nova ocorrência ou arquive esta.',
  }));

export default router;
