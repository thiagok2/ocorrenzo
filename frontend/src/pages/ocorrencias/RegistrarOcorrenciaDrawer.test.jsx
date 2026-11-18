import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RegistrarOcorrenciaDrawer from './RegistrarOcorrenciaDrawer'

function renderDrawer(props = {}) {
  return render(
    <RegistrarOcorrenciaDrawer aberto onFechar={vi.fn()} onRegistrado={vi.fn()} {...props} />,
  )
}

describe('RegistrarOcorrenciaDrawer', () => {
  it('mostra os erros dos campos obrigatórios ao salvar em branco', () => {
    renderDrawer()

    fireEvent.click(screen.getByRole('button', { name: 'Salvar registro' }))

    expect(screen.getByText('Selecione o aluno.')).toBeInTheDocument()
    expect(screen.getByText('Selecione o tipo.')).toBeInTheDocument()
    expect(screen.getByText('Selecione a gravidade.')).toBeInTheDocument()
    expect(screen.getByText('Descreva o ocorrido.')).toBeInTheDocument()
  })

  it('atualiza o contador da descrição conforme o texto digitado', () => {
    renderDrawer()

    const campoDescricao = screen.getByLabelText(/^Descrição/)
    expect(screen.getByText('0/500')).toBeInTheDocument()

    fireEvent.change(campoDescricao, { target: { value: 'Utilizou o celular em aula.' } })

    expect(screen.getByText('27/500')).toBeInTheDocument()
  })

  it('pede confirmação ao cancelar quando há dados preenchidos', () => {
    renderDrawer()

    fireEvent.change(screen.getByLabelText(/^Descrição/), { target: { value: 'Algo foi preenchido.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    const confirmacao = screen.getByRole('dialog', { name: 'Descartar registro?' })
    expect(within(confirmacao).getByText('As informações preenchidas serão perdidas.')).toBeInTheDocument()
  })

  it('fecha direto, sem confirmação, quando não há dados preenchidos', () => {
    const onFechar = vi.fn()
    renderDrawer({ onFechar })

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onFechar).toHaveBeenCalledOnce()
    expect(screen.queryByText('Descartar registro?')).not.toBeInTheDocument()
  })
})
