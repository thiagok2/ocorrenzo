import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { useAuth } from '../contexts/AuthContext'
import ProtectedRoute from './ProtectedRoute'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))

function renderComRota(perfis) {
  render(
    <MemoryRouter initialEntries={['/ocorrencias']}>
      <Routes>
        <Route path="/login" element={<p>Tela de login</p>} />
        <Route path="/" element={<p>Tela inicial</p>} />
        <Route element={<ProtectedRoute perfis={perfis} />}>
          <Route path="/ocorrencias" element={<p>Ocorrências</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('redireciona para /login quando não há usuário autenticado', () => {
    useAuth.mockReturnValue({ usuario: null, carregando: false })
    renderComRota(['professor', 'coordenador'])

    expect(screen.getByText('Tela de login')).toBeInTheDocument()
  })

  it('redireciona para / quando o perfil não está na lista permitida', () => {
    useAuth.mockReturnValue({ usuario: { perfil: 'aluno' }, carregando: false })
    renderComRota(['professor', 'coordenador'])

    expect(screen.getByText('Tela inicial')).toBeInTheDocument()
  })

  it('renderiza a rota quando o perfil é permitido', () => {
    useAuth.mockReturnValue({ usuario: { perfil: 'professor' }, carregando: false })
    renderComRota(['professor', 'coordenador'])

    expect(screen.getByText('Ocorrências')).toBeInTheDocument()
  })

  it('não renderiza nada enquanto a sessão está carregando', () => {
    useAuth.mockReturnValue({ usuario: null, carregando: true })
    renderComRota(['professor', 'coordenador'])

    expect(screen.queryByText('Tela de login')).not.toBeInTheDocument()
    expect(screen.queryByText('Ocorrências')).not.toBeInTheDocument()
  })
})
