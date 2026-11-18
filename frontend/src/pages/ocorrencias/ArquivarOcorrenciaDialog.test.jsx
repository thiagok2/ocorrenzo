import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../../services/api'
import ArquivarOcorrenciaDialog from './ArquivarOcorrenciaDialog'

vi.mock('../../services/api', () => ({ default: { post: vi.fn() } }))

const OCORRENCIA = { id: 'abc-123' }

beforeEach(() => {
  api.post.mockReset()
})

describe('ArquivarOcorrenciaDialog', () => {
  it('bloqueia o arquivamento sem motivo', () => {
    render(<ArquivarOcorrenciaDialog ocorrencia={OCORRENCIA} onFechar={vi.fn()} onArquivada={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Arquivar' }))

    expect(screen.getByText('Informe o motivo do arquivamento.')).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
  })

  it('arquiva com sucesso quando o motivo é preenchido', async () => {
    const ocorrenciaArquivada = { ...OCORRENCIA, arquivada: true }
    api.post.mockResolvedValue({ data: ocorrenciaArquivada })
    const onArquivada = vi.fn()

    render(<ArquivarOcorrenciaDialog ocorrencia={OCORRENCIA} onFechar={vi.fn()} onArquivada={onArquivada} />)

    fireEvent.change(screen.getByLabelText(/^Motivo/), { target: { value: 'Reincidência confirmada.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Arquivar' }))

    await vi.waitFor(() => expect(onArquivada).toHaveBeenCalledWith(ocorrenciaArquivada))
    expect(api.post).toHaveBeenCalledWith(`/ocorrencias/${OCORRENCIA.id}/arquivamento`, { motivo: 'Reincidência confirmada.' })
  })

  it('mostra "Esta ocorrência já está arquivada." quando a API responde 409', async () => {
    api.post.mockRejectedValue({ response: { status: 409 } })

    render(<ArquivarOcorrenciaDialog ocorrencia={OCORRENCIA} onFechar={vi.fn()} onArquivada={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/^Motivo/), { target: { value: 'Qualquer motivo.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Arquivar' }))

    expect(await screen.findByText('Esta ocorrência já está arquivada.')).toBeInTheDocument()
  })
})
