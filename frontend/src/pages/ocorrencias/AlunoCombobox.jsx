import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function AlunoCombobox({ selecionado, onSelecionar, erro }) {
  const [texto, setTexto] = useState('')
  const [opcoes, setOpcoes] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    if (texto.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- limpa as opções quando o texto fica curto demais para buscar
      setOpcoes([])
      return
    }
    const id = setTimeout(() => {
      setBuscando(true)
      api
        .get('/alunos', { params: { q: texto, pageSize: 10 } })
        .then((resposta) => setOpcoes(resposta.data.itens))
        .finally(() => setBuscando(false))
    }, 300)
    return () => clearTimeout(id)
  }, [texto])

  function aoSelecionar(aluno) {
    onSelecionar(aluno)
    setTexto('')
    setOpcoes([])
    setAberto(false)
  }

  return (
    <div>
      <label htmlFor="aluno-combobox" className="mb-1 block text-sm font-medium text-texto">
        Aluno(a) <span aria-hidden="true">*</span>
      </label>

      {selecionado ? (
        <div className="flex items-center justify-between rounded-campo border border-borda px-3 py-2 text-sm text-texto">
          <span>
            {selecionado.nome} · {selecionado.matricula} · {selecionado.turma?.nome}
          </span>
          <button
            type="button"
            onClick={() => onSelecionar(null)}
            className="text-sm font-medium text-primaria"
          >
            Trocar
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            id="aluno-combobox"
            type="text"
            value={texto}
            onChange={(evento) => {
              setTexto(evento.target.value)
              setAberto(true)
            }}
            placeholder="Buscar por nome ou matrícula"
            aria-invalid={Boolean(erro)}
            aria-expanded={aberto && texto.trim().length >= 2}
            role="combobox"
            autoComplete="off"
            className={`w-full rounded-campo border px-3 py-2 text-sm text-texto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
              erro ? 'border-gravidade-grave-texto' : 'border-borda'
            }`}
          />
          {aberto && texto.trim().length >= 2 && (
            <ul
              role="listbox"
              className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-campo border border-borda bg-superficie py-1 text-sm shadow-md"
            >
              {buscando && <li className="px-3 py-2 text-texto-secundario">Buscando...</li>}
              {!buscando && opcoes.length === 0 && (
                <li className="px-3 py-2 text-texto-secundario">Nenhum aluno encontrado.</li>
              )}
              {!buscando &&
                opcoes.map((aluno) => (
                  <li key={aluno.id}>
                    <button
                      type="button"
                      onClick={() => aoSelecionar(aluno)}
                      className="block w-full px-3 py-2 text-left hover:bg-primaria-suave"
                    >
                      {aluno.nome} · {aluno.matricula} · {aluno.turma?.nome}
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      {erro && <p className="mt-1 text-sm text-gravidade-grave-texto">{erro}</p>}
    </div>
  )
}
