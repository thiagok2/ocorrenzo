import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'

export default function useHistoricoAluno(alunoId, filtros) {
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const chaveFiltros = JSON.stringify(filtros)

  const buscar = useCallback(() => {
    setCarregando(true)
    setErro(null)
    api
      .get(`/alunos/${alunoId}/ocorrencias`, { params: JSON.parse(chaveFiltros) })
      .then((resposta) => setDados(resposta.data))
      .catch((erroRequisicao) => setErro(erroRequisicao))
      .finally(() => setCarregando(false))
  }, [alunoId, chaveFiltros])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial e a cada troca de filtro; padrão de data-fetching da própria documentação do React
    buscar()
  }, [buscar])

  return { dados, carregando, erro, recarregar: buscar }
}
