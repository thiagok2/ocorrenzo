import * as ocorrenciaService from '../services/ocorrencia.service.js';

export function serializarOcorrencia(ocorrencia) {
  return {
    id: ocorrencia.id,
    aluno: { id: ocorrencia.aluno.id, nome: ocorrencia.aluno.nome, matricula: ocorrencia.aluno.matricula },
    turma: { id: ocorrencia.turma.id, nome: ocorrencia.turma.nome },
    tipo: ocorrencia.tipo,
    gravidade: ocorrencia.gravidade,
    descricao: ocorrencia.descricao,
    data: ocorrencia.dataOcorrencia,
    arquivada: ocorrencia.arquivada,
    arquivamento: ocorrencia.arquivada
      ? {
          motivo: ocorrencia.motivoArquivamento,
          por: { id: ocorrencia.arquivador.id, nome: ocorrencia.arquivador.nome },
          em: ocorrencia.arquivadoEm,
        }
      : null,
    referenciaId: ocorrencia.referenciaId,
    criadoPor: { id: ocorrencia.autor.id, nome: ocorrencia.autor.nome },
    criadoEm: ocorrencia.criadoEm,
  };
}

export async function registrar(req, res) {
  const ocorrencia = await ocorrenciaService.registrar(req.usuario, req.body);
  res.status(201).json(serializarOcorrencia(ocorrencia));
}

export async function listar(req, res) {
  const { itens, total, page, pageSize } = await ocorrenciaService.listar(req.usuario, req.query);
  res.json({ itens: itens.map(serializarOcorrencia), total, page, pageSize });
}

export async function detalhar(req, res) {
  const ocorrencia = await ocorrenciaService.detalhar(req.usuario, req.params.id);
  res.json(serializarOcorrencia(ocorrencia));
}
