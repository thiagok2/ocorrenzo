import { useCallback, useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import SelectFilter from '../../components/ui/SelectFilter'
import Skeleton from '../../components/ui/Skeleton'
import useProfessores from '../../hooks/useProfessores'
import api from '../../services/api'

export default function VinculosPanel({ turmas }) {
  const [turmaId, setTurmaId] = useState(null)
  const [professorId, setProfessorId] = useState(null)
  const [vinculados, setVinculados] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const [vinculando, setVinculando] = useState(false)

  const { dados: professores } = useProfessores()

  const buscarVinculados = useCallback(() => {
    if (!turmaId) {
      setVinculados([])
      return
    }
    setCarregando(true)
    api
      .get(`/turmas/${turmaId}/professores`)
      .then((resposta) => setVinculados(resposta.data))
      .finally(() => setCarregando(false))
  }, [turmaId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca os professores vinculados quando a turma selecionada muda
    buscarVinculados()
  }, [buscarVinculados])

  const opcoesTurma = turmas.map((turma) => ({ value: turma.id, label: turma.nome }))
  const idsVinculados = new Set(vinculados.map((professor) => professor.id))
  const opcoesProfessor = professores.filter((professor) => !idsVinculados.has(professor.id)).map((professor) => ({ value: professor.id, label: professor.nome }))

  async function aoVincular() {
    if (!professorId) {
      setErro('Selecione o professor.')
      return
    }

    setVinculando(true)
    setErro(null)
    try {
      await api.post(`/turmas/${turmaId}/professores`, { professorId })
      setProfessorId(null)
      buscarVinculados()
    } catch (erroRequisicao) {
      if (erroRequisicao.response?.status === 409) {
        setErro('Professor já vinculado a essa turma.')
      } else {
        setErro(erroRequisicao.response?.data?.mensagem ?? 'Não foi possível vincular. Tente novamente.')
      }
    } finally {
      setVinculando(false)
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <SelectFilter rotulo="Turma" valor={turmaId} opcoes={opcoesTurma} onChange={setTurmaId} placeholder="Selecione" />

      {turmaId && (
        <>
          <div>
            <p className="mb-2 text-sm font-medium text-texto">Professores vinculados</p>
            {carregando ? (
              <Skeleton linhas={2} />
            ) : vinculados.length === 0 ? (
              <p className="text-sm text-texto-secundario">Nenhum professor vinculado a esta turma.</p>
            ) : (
              <ul className="space-y-1 text-sm text-texto">
                {vinculados.map((professor) => (
                  <li key={professor.id}>
                    {professor.nome} · {professor.matricula}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-end gap-3">
            <SelectFilter
              rotulo="Vincular professor"
              valor={professorId}
              opcoes={opcoesProfessor}
              onChange={setProfessorId}
              placeholder="Selecione"
            />
            <Button onClick={aoVincular} carregando={vinculando}>
              Vincular
            </Button>
          </div>
          {erro && <p className="text-sm text-gravidade-grave-texto">{erro}</p>}
        </>
      )}
    </div>
  )
}
