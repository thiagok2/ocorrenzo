import { useState } from 'react'
import Button from '../../components/ui/Button'
import Drawer from '../../components/ui/Drawer'
import SelectFilter from '../../components/ui/SelectFilter'
import TextField from '../../components/ui/TextField'
import api from '../../services/api'

export default function CadastroAlunoDrawer({ aberto, turmas, onFechar, onCriado }) {
  const [nome, setNome] = useState('')
  const [matricula, setMatricula] = useState('')
  const [turmaId, setTurmaId] = useState(null)
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)

  const opcoesTurma = turmas.map((turma) => ({ value: turma.id, label: turma.nome }))

  async function aoSalvar() {
    const proximosErros = {}
    if (!nome.trim()) proximosErros.nome = 'Informe o nome.'
    if (!matricula.trim()) proximosErros.matricula = 'Informe a matrícula.'
    if (!turmaId) proximosErros.turmaId = 'Selecione a turma.'
    if (Object.keys(proximosErros).length > 0) {
      setErros(proximosErros)
      return
    }

    setEnviando(true)
    setErros({})
    try {
      const resposta = await api.post('/alunos', { nome: nome.trim(), matricula: matricula.trim(), turmaId })
      onCriado(resposta.data)
    } catch (erro) {
      if (erro.response?.status === 409) {
        setErros({ matricula: 'Já existe um usuário com essa matrícula.' })
      } else if (erro.response?.status === 400) {
        const porCampo = {}
        for (const item of erro.response.data.detalhes ?? []) porCampo[item.campo] = item.mensagem
        setErros(porCampo)
      } else {
        setErros({ geral: 'Não foi possível cadastrar o aluno. Tente novamente.' })
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Drawer
      aberto={aberto}
      titulo="Novo aluno"
      onFechar={onFechar}
      rodape={
        <>
          <Button variante="secundario" onClick={onFechar}>
            Cancelar
          </Button>
          <Button onClick={aoSalvar} carregando={enviando}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextField rotulo="Nome" obrigatorio value={nome} onChange={(evento) => setNome(evento.target.value)} erro={erros.nome} />
        <TextField
          rotulo="Matrícula"
          obrigatorio
          value={matricula}
          onChange={(evento) => setMatricula(evento.target.value)}
          erro={erros.matricula}
        />
        <div>
          <SelectFilter rotulo="Turma" valor={turmaId} opcoes={opcoesTurma} onChange={setTurmaId} placeholder="Selecione" />
          {erros.turmaId && <p className="mt-1 text-sm text-gravidade-grave-texto">{erros.turmaId}</p>}
        </div>
        {erros.geral && (
          <p role="alert" className="text-sm text-gravidade-grave-texto">
            {erros.geral}
          </p>
        )}
      </div>
    </Drawer>
  )
}
