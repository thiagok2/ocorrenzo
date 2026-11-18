import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function AlunoRowActionsMenu({ aluno, onRegistrarOcorrencia, onTransferir }) {
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef(null)
  const navigate = useNavigate()
  const { usuario } = useAuth()

  useEffect(() => {
    if (!aberto) return
    function aoClicarFora(evento) {
      if (!containerRef.current?.contains(evento.target)) setAberto(false)
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [aberto])

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setAberto((valor) => !valor)}
        aria-label={`Ações para ${aluno.nome}`}
        aria-expanded={aberto}
        className="rounded-campo px-2 py-1 text-texto-secundario hover:bg-primaria-suave focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
      >
        ⋮
      </button>
      {aberto && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-1 w-48 rounded-campo border border-borda bg-superficie py-1 text-sm shadow-md"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setAberto(false)
              navigate(`/alunos/${aluno.id}`)
            }}
            className="block w-full px-3 py-2 text-left text-texto hover:bg-primaria-suave"
          >
            Ver ficha
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setAberto(false)
              onRegistrarOcorrencia(aluno)
            }}
            className="block w-full px-3 py-2 text-left text-texto hover:bg-primaria-suave"
          >
            Registrar ocorrência
          </button>
          {usuario.perfil === 'coordenador' && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setAberto(false)
                onTransferir(aluno)
              }}
              className="block w-full px-3 py-2 text-left text-texto hover:bg-primaria-suave"
            >
              Transferir de turma
            </button>
          )}
        </div>
      )}
    </div>
  )
}
