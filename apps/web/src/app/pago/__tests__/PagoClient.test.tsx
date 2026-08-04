import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockUseSearchParams = vi.fn()

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockUseSearchParams(),
}))

vi.mock('next/script', () => ({
  default: () => null,
}))

import PagoClient from '../PagoClient'

describe('PagoClient', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
    process.env.NEXT_PUBLIC_API_URL = 'http://api.test'
  })

  it('sin token en la URL → muestra mensaje de error y no llama a fetch', async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams())

    render(<PagoClient />)

    expect(await screen.findByText('Link inválido.')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('con token inválido/expirado (la API no devuelve processId) → muestra error', async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('token=abc123'))
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    render(<PagoClient />)

    expect(await screen.findByText('Link inválido o expirado.')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/payments/create-link',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ token: 'abc123' }),
        credentials: 'include',
      }),
    )
  })

  it('con token válido → renderiza el contenedor del widget de Bancard', async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('token=abc123'))
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ processId: '99900001' }),
    } as Response)

    const { container } = render(<PagoClient />)

    expect(await screen.findByText('Completá tu pago')).toBeInTheDocument()
    expect(container.querySelector('#bancard-checkout-container')).toBeInTheDocument()
    expect(screen.queryByText('Link inválido.')).not.toBeInTheDocument()
    expect(screen.queryByText('Link inválido o expirado.')).not.toBeInTheDocument()
  })
})
