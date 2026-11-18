import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'

export default function usePainelAlunosEmAtencao(periodoDias, turmaId) {
  const [dados, setDados] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const buscar = useCallback(() => {
    setCarregando(true)
    setErro(null)
    api
      .get('/painel/alunos-em-atencao', { params: { periodoDias, turmaId } })
      .then((resposta) => setDados(resposta.data))
      .catch((erroRequisicao) => setErro(erroRequisicao))
      .finally(() => setCarregando(false))
  }, [periodoDias, turmaId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial e a cada troca de período/turma; padrão de data-fetching da própria documentação do React
    buscar()
  }, [buscar])

  return { dados, carregando, erro, recarregar: buscar }
}
