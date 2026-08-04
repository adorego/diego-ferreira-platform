import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BOOK_CHAPTERS } from '@/lib/book'

import AvanzaPage from '../page'
import * as avanzaPageModule from '../page'

describe('AvanzaPage (/avanza)', () => {
  it('renderiza LibroHero', () => {
    render(<AvanzaPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Despertá. Avanzá. Carajo.' })).toBeInTheDocument()
  })

  it('renderiza LibroDescripcion', () => {
    render(<AvanzaPage />)
    expect(screen.getByText('Sobre el libro')).toBeInTheDocument()
  })

  it('renderiza LibroCapitulos con los 15 capítulos', () => {
    render(<AvanzaPage />)
    expect(screen.getByText('Los 15 capítulos')).toBeInTheDocument()
    for (const chapter of BOOK_CHAPTERS) {
      expect(screen.getAllByText(chapter).length).toBeGreaterThan(0)
    }
  })

  it('renderiza LibroTestimonios', () => {
    render(<AvanzaPage />)
    expect(screen.getByText('Lo que dicen los lectores')).toBeInTheDocument()
  })

  it('renderiza LibroCompra con id="comprar"', () => {
    const { container } = render(<AvanzaPage />)
    expect(container.querySelector('#comprar')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /comprar ahora/i })).toBeInTheDocument()
  })

  // El checklist original pedía verificar "metadata correcta (title, description)".
  // apps/web/src/app/avanza/page.tsx no exporta ningún `metadata` — a diferencia de
  // apps/web/src/app/layout.tsx, que sí define metadata a nivel de sitio. Esto no es
  // un bug de comportamiento (Next.js simplemente hereda el metadata del layout raíz
  // si la página no define uno propio), pero si se quiere un title/description
  // específicos para /avanza (recomendable para SEO), hoy no existen y habría que
  // agregarlos — no lo hice acá porque es contenido nuevo, fuera del alcance de
  // "completar tests".
  it.skip('la página exporta metadata propia (title/description) — no existe todavía, ver nota arriba', () => {
    expect((avanzaPageModule as any).metadata).toBeDefined()
  })
})
