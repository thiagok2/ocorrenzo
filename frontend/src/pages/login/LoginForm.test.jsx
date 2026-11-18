import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import LoginForm from './LoginForm'

describe('LoginForm', () => {
  it('mostra erros quando os campos obrigatórios estão vazios', () => {
    const onEntrar = vi.fn()
    render(<LoginForm onEntrar={onEntrar} />)

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(screen.getByText('Informe a matrícula.')).toBeInTheDocument()
    expect(screen.getByText('Informe a senha.')).toBeInTheDocument()
    expect(onEntrar).not.toHaveBeenCalled()
  })

  it('chama onEntrar com a matrícula e a senha preenchidas', async () => {
    const onEntrar = vi.fn().mockResolvedValue(undefined)
    render(<LoginForm onEntrar={onEntrar} />)

    fireEvent.change(screen.getByLabelText(/^Matrícula/), { target: { value: '2026000001' } })
    fireEvent.change(screen.getByLabelText(/^Senha/), { target: { value: 'senha123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(onEntrar).toHaveBeenCalledWith('2026000001', 'senha123'))
  })

  it('mostra "Matrícula ou senha inválidos." quando a API responde 401', async () => {
    const onEntrar = vi.fn().mockRejectedValue({ response: { status: 401 } })
    render(<LoginForm onEntrar={onEntrar} />)

    fireEvent.change(screen.getByLabelText(/^Matrícula/), { target: { value: '2026000001' } })
    fireEvent.change(screen.getByLabelText(/^Senha/), { target: { value: 'errada' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Matrícula ou senha inválidos.')).toBeInTheDocument()
  })

  it('alterna a visibilidade da senha', () => {
    render(<LoginForm onEntrar={vi.fn()} />)

    const campoSenha = screen.getByLabelText(/^Senha/)
    expect(campoSenha).toHaveAttribute('type', 'password')

    fireEvent.click(screen.getByLabelText('Mostrar senha'))
    expect(campoSenha).toHaveAttribute('type', 'text')
  })
})
