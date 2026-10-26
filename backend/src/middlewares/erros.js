export default function tratarErros(erro, req, res, next) {
  if (erro.status) {
    return res.status(erro.status).json({ codigo: erro.codigo, mensagem: erro.message, detalhes: erro.detalhes });
  }
  console.error(erro);
  return res.status(500).json({ codigo: 'ERRO_INTERNO', mensagem: 'Erro inesperado.' });
}
