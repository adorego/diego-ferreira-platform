import * as React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BOOK_CHAPTERS } from '@/lib/book'

// NOTA: el componente real de la sección del libro en /main se llama BookSection.tsx
// (no existe ningún LibroSection.tsx en el proyecto).

vi.mock('next/link', () => ({
  default: React.forwardRef<HTMLAnchorElement, any>(({ children, href, ...props }, ref) => (
    <a href={href} ref={ref} {...props}>{children}</a>
  )),
}))

import BookSection from '../BookSection'

describe('BookSection (sección del libro en /main)', () => {
  it('renderiza la tapa del libro', () => {
    render(<BookSection />)
    expect(screen.getByAltText(/Tapa del libro/i)).toBeInTheDocument()
  })

  it('renderiza el botón principal "Comprar el libro" apuntando a /avanza#comprar', () => {
    render(<BookSection />)
    const link = screen.getByRole('link', { name: 'Comprar el libro →' })
    expect(link).toHaveAttribute('href', '/avanza#comprar')
  })

  it('renderiza el botón secundario "Ver el libro" apuntando a /avanza', () => {
    render(<BookSection />)
    const link = screen.getByRole('link', { name: 'Ver el libro' })
    expect(link).toHaveAttribute('href', '/avanza')
  })

  it('NO renderiza ningún formulario de compra (sin inputs ni botón de pago directo)', () => {
    render(<BookSection />)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/nombre/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /comprar ahora/i })).not.toBeInTheDocument()
  })

  it('los 15 capítulos están presentes en el documento', () => {
    render(<BookSection />)
    for (const chapter of BOOK_CHAPTERS) {
      expect(screen.getAllByText(chapter).length).toBeGreaterThan(0)
    }
  })

  // NOTA sobre el checklist original ("muestra 8 por defecto, Ver más → 15, Mostrar
  // menos → 8 de nuevo"): no es lo que hace el componente real. BookSection.tsx no
  // tiene un accordion de 8-a-15 — en desktop los 15 capítulos están SIEMPRE
  // visibles (sin acordeón), y en mobile el bloque de Collapse arranca cerrado
  // (0 visibles) y al abrir muestra los 15, no hay estado intermedio de 8.
  // Además, como jsdom no evalúa media queries, ambos bloques (desktop y mobile)
  // están siempre presentes en el DOM en simultáneo — por eso no se puede
  // verificar "cuántos capítulos se ven" contando nodos de texto; lo único
  // verificable de forma confiable es el estado del botón toggle en sí.
  it('el botón toggle de capítulos cambia de texto al hacer click (Ver los N capítulos ↔ Ver menos)', async () => {
    const user = userEvent.setup()
    render(<BookSection />)

    const toggle = screen.getByRole('button', { name: `Ver los ${BOOK_CHAPTERS.length} capítulos →` })
    await user.click(toggle)

    expect(screen.getByRole('button', { name: 'Ver menos' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ver menos' }))

    expect(screen.getByRole('button', { name: `Ver los ${BOOK_CHAPTERS.length} capítulos →` })).toBeInTheDocument()
  })
})
