// R07 e R08 ainda simulados — serão trocados pela implementação real na tarefa 1.6
import { Router } from 'express';
import autorizarPerfil from '../middlewares/autorizarPerfil.js';
import validar from '../middlewares/validar.js';
import { esquemaRegistro, esquemaListagem } from '../validators/ocorrencia.validator.js';
import * as ocorrenciaController from '../controllers/ocorrencia.controller.js';

const router = Router();

const ocorrenciaExemplo = {
  id: '7a2e9c44-51b3-4f6e-8c2d-0e3f6a1b9d55',
  aluno: { id: '0f5c3b1e-8d7a-4f0a-9d7e-2a6c1b9e4a10', nome: 'Ana lara Silva', matricula: '2026010101' },
  turma: { id: 'c3a1d2f4-0000-4000-8000-000000000001', nome: '8º A' },
  tipo: 'uso_indevido_celular',
  gravidade: 'leve',
  descricao: 'Utilizou o celular durante a aula.',
  data: '2026-05-12',
  arquivada: false,
  arquivamento: null,
  referenciaId: null,
  criadoPor: { id: 'e9b0c1d2-0000-4000-8000-000000000002', nome: 'Prof. Marcos Andrade' },
  criadoEm: '2026-05-12T14:03:21.000Z',
};

router.post('/', autorizarPerfil('professor', 'coordenador'), validar(esquemaRegistro), ocorrenciaController.registrar); // R04
router.get('/', autorizarPerfil('professor', 'coordenador', 'apoio_pedagogico'), validar(esquemaListagem, 'query'), ocorrenciaController.listar); // R05
router.get('/:id', ocorrenciaController.detalhar); // R06 — escopo (turma/titular) resolvido no service
router.post('/:id/arquivamento', (req, res) => // R07
  res.json({
    ...ocorrenciaExemplo,
    arquivada: true,
    arquivamento: {
      motivo: req.body.motivo,
      por: { id: 'e9b0c1d2-0000-4000-8000-000000000001', nome: 'Verônica Lima' },
      em: new Date().toISOString(),
    },
  }));
router.all('/:id', (req, res) => // R08
  res.status(405).json({
    codigo: 'METODO_NAO_PERMITIDO',
    mensagem: 'Ocorrências não podem ser editadas ou excluídas. Registre uma nova ocorrência ou arquive esta.',
  }));

export default router;
