import { useState } from 'react'
import Button from '../../components/ui/Button'
import Dialog from '../../components/ui/Dialog'
import Textarea from '../../components/ui/Textarea'
import api from '../../services/api'

export default function ArquivarOcorrenciaDialog({ ocorrencia, onFechar, onArquivada }) {
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (!ocorrencia) return null

  async function aoArquivar() {
    if (!motivo.trim()) {
      setErro('Informe o motivo do arquivamento.')
      return
    }

    setEnviando(true)
    setErro(null)
    try {
      const resposta = await api.post(`/ocorrencias/${ocorrencia.id}/arquivamento`, { motivo: motivo.trim() })
      onArquivada(resposta.data)
    } catch (erroRequisicao) {
      if (erroRequisicao.response?.status === 409) {
        setErro('Esta ocorrência já está arquivada.')
      } else if (erroRequisicao.response?.status === 403) {
        setErro('Acesso restrito às turmas em que você leciona.')
      } else {
        setErro(erroRequisicao.response?.data?.mensagem ?? 'Não foi possível arquivar. Tente novamente.')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog
      aberto
      titulo="Arquivar ocorrência"
      onFechar={onFechar}
      rodape={
        <>
          <Button variante="secundario" onClick={onFechar}>
            Cancelar
          </Button>
          <Button onClick={aoArquivar} carregando={enviando}>
            Arquivar
          </Button>
        </>
      }
    >
      <Textarea rotulo="Motivo" obrigatorio valor={motivo} onChange={setMotivo} erro={erro} />
    </Dialog>
  )
}
