import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

vi.mock('next/script', () => ({
  default: () => null,
}))

import LibroCompra from '../LibroCompra'

describe('LibroCompra', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
    process.env.NEXT_PUBLIC_API_URL = 'http://api.test'
  })

  it('renderiza el formulario con campos de email y nombre', () => {
    render(<LibroCompra />)
    expect(screen.getByPlaceholderText('Nombre completo')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Tu email')).toBeInTheDocument()
  })

  it('renderiza el precio USD 12.99', () => {
    render(<LibroCompra />)
    expect(screen.getByText('USD 12.99')).toBeInTheDocument()
  })

  // NOTA sobre el checklist original ("el botón está deshabilitado si falta
  // email/nombre"): no es lo que hace el componente real. El botón "Comprar
  // ahora" solo se deshabilita mientras `loading` es true — con campos vacíos
  // sigue habilitado, y al hacer click la validación ocurre dentro de
  // handleComprar() y muestra un mensaje de error en vez de prevenir el click.
  // Documentado como comportamiento real, no corregido.
  it('con email vacío → el botón sigue habilitado, pero al hacer click muestra error y no llama a fetch', async () => {
    const user = userEvent.setup()
    render(<LibroCompra />)

    await user.type(screen.getByPlaceholderText('Nombre completo'), 'Juan Pérez')
    const button = screen.getByRole('button', { name: /comprar ahora/i })
    expect(button).toBeEnabled()

    await user.click(button)

    expect(await screen.findByText(/ingresá un email válido/i)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('con nombre vacío → el botón sigue habilitado, pero al hacer click muestra error y no llama a fetch', async () => {
    const user = userEvent.setup()
    render(<LibroCompra />)

    await user.type(screen.getByPlaceholderText('Tu email'), 'juan@test.com')
    const button = screen.getByRole('button', { name: /comprar ahora/i })
    expect(button).toBeEnabled()

    await user.click(button)

    expect(await screen.findByText(/ingresá tu nombre completo/i)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('con datos válidos → llama a POST /payments/libro/initiate con email y nombre', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ processId: '99900001' }),
    } as Response)

    const user = userEvent.setup()
    render(<LibroCompra />)

    await user.type(screen.getByPlaceholderText('Nombre completo'), 'Juan Pérez')
    await user.type(screen.getByPlaceholderText('Tu email'), 'juan@test.com')
    await user.click(screen.getByRole('button', { name: /comprar ahora/i }))

    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      'http://api.test/payments/libro/initiate',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'juan@test.com', nombre: 'Juan Pérez' }),
      }),
    ))
  })

  it('durante loading muestra "Procesando…" y deshabilita el botón', async () => {
    let resolveFetch: (v: unknown) => void = () => {}
    vi.mocked(fetch).mockReturnValue(
      new Promise(resolve => { resolveFetch = resolve }) as any,
    )

    const user = userEvent.setup()
    render(<LibroCompra />)

    await user.type(screen.getByPlaceholderText('Nombre completo'), 'Juan Pérez')
    await user.type(screen.getByPlaceholderText('Tu email'), 'juan@test.com')
    await user.click(screen.getByRole('button', { name: /comprar ahora/i }))

    const loadingButton = await screen.findByRole('button', { name: 'Procesando…' })
    expect(loadingButton).toBeDisabled()

    resolveFetch({ ok: true, json: async () => ({ processId: '1' }) })
  })

  it('si la API responde sin processId → muestra mensaje de error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    const user = userEvent.setup()
    render(<LibroCompra />)

    await user.type(screen.getByPlaceholderText('Nombre completo'), 'Juan Pérez')
    await user.type(screen.getByPlaceholderText('Tu email'), 'juan@test.com')
    await user.click(screen.getByRole('button', { name: /comprar ahora/i }))

    expect(await screen.findByText(/no pudimos iniciar el pago/i)).toBeInTheDocument()
  })

  it('si la API retorna processId → oculta el formulario y muestra el contenedor del iframe de Bancard', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ processId: '99900001' }),
    } as Response)

    const user = userEvent.setup()
    const { container } = render(<LibroCompra />)

    await user.type(screen.getByPlaceholderText('Nombre completo'), 'Juan Pérez')
    await user.type(screen.getByPlaceholderText('Tu email'), 'juan@test.com')
    await user.click(screen.getByRole('button', { name: /comprar ahora/i }))

    await waitFor(() =>
      expect(container.querySelector('#libro-bancard-checkout-container')).toBeInTheDocument(),
    )
    expect(screen.queryByPlaceholderText('Tu email')).not.toBeInTheDocument()
  })
})
