import { useState } from 'react'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Drawer from '../../components/ui/Drawer'
import SegmentedControl from '../../components/ui/SegmentedControl'
import SelectFilter from '../../components/ui/SelectFilter'
import Textarea from '../../components/ui/Textarea'
import api from '../../services/api'
import { OPCOES_GRAVIDADE, OPCOES_TIPO } from '../../utils/constantes'
import AlunoCombobox from './AlunoCombobox'

function hojeISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function RegistrarOcorrenciaDrawer({ aberto, onFechar, onRegistrado, alunoInicial = null, referenciaId = null }) {
  const [aluno, setAluno] = useState(alunoInicial)
  const [tipo, setTipo] = useState(null)
  const [data, setData] = useState(hojeISO())
  const [gravidade, setGravidade] = useState(null)
  const [descricao, setDescricao] = useState('')
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false)

  const temDados = Boolean(aluno || tipo || gravidade || descricao.trim() || data !== hojeISO())

  function aoTentarFechar() {
    if (temDados) {
      setConfirmandoDescarte(true)
      return
    }
    onFechar()
  }

  function validar() {
    const proximosErros = {}
    if (!aluno) proximosErros.alunoId = 'Selecione o aluno.'
    if (!tipo) proximosErros.tipo = 'Selecione o tipo.'
    if (!data) proximosErros.data = 'Informe a data.'
    else if (data > hojeISO()) proximosErros.data = 'A data não pode ser futura.'
    if (!gravidade) proximosErros.gravidade = 'Selecione a gravidade.'
    if (!descricao.trim()) proximosErros.descricao = 'Descreva o ocorrido.'
    return proximosErros
  }

  async function aoSalvar() {
    const proximosErros = validar()
    if (Object.keys(proximosErros).length > 0) {
      setErros(proximosErros)
      return
    }

    setEnviando(true)
    setErros({})
    try {
      const resposta = await api.post('/ocorrencias', {
        alunoId: aluno.id,
        tipo,
        gravidade,
        descricao: descricao.trim(),
        data,
        referenciaId,
      })
      onRegistrado(resposta.data)
    } catch (erro) {
      if (erro.response?.status === 400) {
        const porCampo = {}
        for (const item of erro.response.data.detalhes ?? []) porCampo[item.campo] = item.mensagem
        setErros(porCampo)
      } else if (erro.response?.status === 403) {
        setErros({ geral: 'Acesso restrito às turmas em que você leciona.' })
      } else {
        setErros({ geral: 'Não foi possível registrar a ocorrência. Tente novamente.' })
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <Drawer
        aberto={aberto}
        titulo="Registrar ocorrência"
        onFechar={aoTentarFechar}
        rodape={
          <>
            <Button variante="secundario" onClick={aoTentarFechar}>
              Cancelar
            </Button>
            <Button onClick={aoSalvar} carregando={enviando}>
              Salvar registro
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-texto-secundario">Campos com * são obrigatórios.</p>

        <div className="space-y-4">
          <AlunoCombobox selecionado={aluno} onSelecionar={setAluno} erro={erros.alunoId} />

          <div>
            <SelectFilter rotulo="Tipo" valor={tipo} opcoes={OPCOES_TIPO} onChange={setTipo} placeholder="Selecione" />
            {erros.tipo && <p className="mt-1 text-sm text-gravidade-grave-texto">{erros.tipo}</p>}
          </div>

          <div>
            <label htmlFor="data-ocorrido" className="mb-1 block text-sm font-medium text-texto">
              Data do ocorrido <span aria-hidden="true">*</span>
            </label>
            <input
              id="data-ocorrido"
              type="date"
              value={data}
              max={hojeISO()}
              onChange={(evento) => setData(evento.target.value)}
              className="w-full rounded-campo border border-borda px-3 py-2 text-sm text-texto"
            />
            {erros.data && <p className="mt-1 text-sm text-gravidade-grave-texto">{erros.data}</p>}
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-texto">
              Gravidade <span aria-hidden="true">*</span>
            </p>
            <SegmentedControl opcoes={OPCOES_GRAVIDADE} valor={gravidade} onChange={setGravidade} />
            {erros.gravidade && <p className="mt-1 text-sm text-gravidade-grave-texto">{erros.gravidade}</p>}
          </div>

          <Textarea rotulo="Descrição" obrigatorio valor={descricao} onChange={setDescricao} erro={erros.descricao} />

          {erros.geral && (
            <p role="alert" className="text-sm text-gravidade-grave-texto">
              {erros.geral}
            </p>
          )}
        </div>
      </Drawer>

      <ConfirmDialog
        aberto={confirmandoDescarte}
        titulo="Descartar registro?"
        mensagem="As informações preenchidas serão perdidas."
        textoConfirmar="Descartar"
        onConfirmar={() => {
          setConfirmandoDescarte(false)
          onFechar()
        }}
        onFechar={() => setConfirmandoDescarte(false)}
      />
    </>
  )
}
