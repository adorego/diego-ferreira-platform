import * as React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/link', () => ({
  default: React.forwardRef<HTMLAnchorElement, any>(({ children, href, ...props }, ref) => (
    <a href={href} ref={ref} {...props}>{children}</a>
  )),
}))

import TopBar from '../nav/TopBar'

describe('TopBar', () => {
  it('renderiza el logo', () => {
    render(<TopBar />)
    expect(screen.getByAltText('Diego Ferreira')).toBeInTheDocument()
  })

  it('renderiza todos los links de navegación', () => {
    render(<TopBar />)
    // Button component={Link} renderiza un <a href>, cuyo role ARIA implícito es "link".
    const labels = ['Cómo funciona', 'El Método', 'Para quién es', 'Libro', 'Precios']
    for (const label of labels) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })

  it('renderiza el botón CTA de escritorio "Agendá tu lugar hoy"', () => {
    render(<TopBar />)
    expect(screen.getByRole('link', { name: 'Agendá tu lugar hoy' })).toBeInTheDocument()
  })

  it('muestra el botón hamburguesa', () => {
    // jsdom no evalúa media queries reales — el botón hamburguesa (sx: xs:flex/md:none)
    // siempre está presente en el DOM independientemente del "viewport" simulado.
    render(<TopBar />)
    expect(screen.getByLabelText('Abrir menú')).toBeInTheDocument()
  })

  it('al hacer click en hamburguesa abre el drawer (aparece contenido exclusivo del drawer)', async () => {
    const user = userEvent.setup()
    render(<TopBar />)

    // MUI Drawer (variant temporary) no monta su contenido hasta que open=true,
    // así que el CTA del drawer ("Agendá sesión gratis →") no existe todavía.
    expect(screen.queryByRole('link', { name: 'Agendá sesión gratis →' })).not.toBeInTheDocument()

    await user.click(screen.getByLabelText('Abrir menú'))

    expect(await screen.findByRole('link', { name: 'Agendá sesión gratis →' })).toBeInTheDocument()
  })

  it('los links del drawer apuntan a los anchors correctos', async () => {
    const user = userEvent.setup()
    render(<TopBar />)
    await user.click(screen.getByLabelText('Abrir menú'))

    const expected: Record<string, string> = {
      'Cómo funciona': '/main#identificacion',
      'El Método': '/main#metodo',
      'Para quién es': '/main#para-quien',
      'El libro': '/main#libro',
      'Precios': '/main#precios',
    }

    for (const [label, href] of Object.entries(expected)) {
      const link = await screen.findByRole('link', { name: new RegExp(label) })
      expect(link).toHaveAttribute('href', href)
    }
  })
})
