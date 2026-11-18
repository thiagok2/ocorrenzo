import { useState } from 'react'
import Button from '../../components/ui/Button'
import Dialog from '../../components/ui/Dialog'
import TextField from '../../components/ui/TextField'
import api from '../../services/api'

export default function CadastroTurmaDialog({ aberto, onFechar, onCriada }) {
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function aoCriar() {
    if (!nome.trim()) {
      setErro('Informe o nome da turma.')
      return
    }

    setEnviando(true)
    setErro(null)
    try {
      const resposta = await api.post('/turmas', { nome: nome.trim() })
      onCriada(resposta.data)
    } catch (erroRequisicao) {
      if (erroRequisicao.response?.status === 409) {
        setErro('Já existe uma turma com esse nome.')
      } else {
        setErro(erroRequisicao.response?.data?.mensagem ?? 'Não foi possível criar a turma. Tente novamente.')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog
      aberto={aberto}
      titulo="Nova turma"
      onFechar={onFechar}
      rodape={
        <>
          <Button variante="secundario" onClick={onFechar}>
            Cancelar
          </Button>
          <Button onClick={aoCriar} carregando={enviando}>
            Criar
          </Button>
        </>
      }
    >
      <TextField
        rotulo="Nome"
        obrigatorio
        value={nome}
        onChange={(evento) => setNome(evento.target.value)}
        erro={erro}
        placeholder="Ex.: 8º A"
      />
    </Dialog>
  )
}
