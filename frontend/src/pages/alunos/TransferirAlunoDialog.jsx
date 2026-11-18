import { useState } from 'react'
import Button from '../../components/ui/Button'
import Dialog from '../../components/ui/Dialog'
import SelectFilter from '../../components/ui/SelectFilter'
import api from '../../services/api'

export default function TransferirAlunoDialog({ aluno, turmas, onFechar, onTransferido }) {
  const [turmaId, setTurmaId] = useState(null)
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (!aluno) return null

  const opcoesTurma = turmas.filter((turma) => turma.id !== aluno.turma?.id).map((turma) => ({ value: turma.id, label: turma.nome }))

  async function aoTransferir() {
    if (!turmaId) {
      setErro('Selecione a turma de destino.')
      return
    }

    setEnviando(true)
    setErro(null)
    try {
      const resposta = await api.patch(`/alunos/${aluno.id}/turma`, { turmaId })
      onTransferido(resposta.data)
    } catch (erroRequisicao) {
      if (erroRequisicao.response?.status === 409) {
        setErro('O aluno já está nessa turma.')
      } else {
        setErro(erroRequisicao.response?.data?.mensagem ?? 'Não foi possível transferir o aluno. Tente novamente.')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog
      aberto
      titulo={`Transferir ${aluno.nome}`}
      onFechar={onFechar}
      rodape={
        <>
          <Button variante="secundario" onClick={onFechar}>
            Cancelar
          </Button>
          <Button onClick={aoTransferir} carregando={enviando}>
            Transferir
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <SelectFilter rotulo="Nova turma" valor={turmaId} opcoes={opcoesTurma} onChange={setTurmaId} placeholder="Selecione" />
        <p className="text-sm text-texto-secundario">As ocorrências anteriores continuam registradas na turma original.</p>
        {erro && <p className="text-sm text-gravidade-grave-texto">{erro}</p>}
      </div>
    </Dialog>
  )
}
