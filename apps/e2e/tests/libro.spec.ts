import { test, expect } from '@playwright/test'

// Copiado deliberadamente en vez de importado de apps/web/src/lib/book — los tests
// E2E son black-box y no deberían depender de la resolución de módulos de otro
// paquete del monorepo. Si el contenido del libro cambia, hay que actualizar esto.
const BOOK_CHAPTERS = [
  'No nací fuerte',
  'El chico que se sentía inútil',
  'Tres palabras que destruyeron mi futuro',
  'Salí último. Y ese fue el mejor día de mi vida',
  'La frase que repetí miles de veces hasta hacerla realidad',
  'Entrenamientos, hielo, vómitos y sacrificios',
  'El hombre que vio algo en mí cuando nadie más lo veía',
  'El día que demostré que no estaba loco',
  'Los sueños grandes cobran caro',
  'Lo mejor estaba por venir',
  'El atleta que también quería hacer negocios',
  'Cuando la mente se me fue a la mierda',
  'El día que tuve que decirle a mi hija que no podía volver',
  'Me daba pánico hablar. Ahora quiero llenar auditorios',
  'Despertá. Avanzá. Carajo.',
]

test.describe('Landing del libro (/avanza)', () => {
  test('carga con todos los elementos principales', async ({ page }) => {
    await page.goto('/avanza')

    // "Despertá. Avanzá. Carajo." aparece dos veces (título del hero y capítulo 15)
    await expect(page.getByRole('heading', { level: 1, name: 'Despertá. Avanzá. Carajo.' })).toBeVisible()
    await expect(page.getByText('USD 12.99').first()).toBeVisible()
    await expect(page.locator('#comprar')).toBeVisible()
    await expect(page.getByText('Comprar ahora').first()).toBeVisible()
  })

  test('los 15 capítulos están listados (sin acordeón, todos visibles)', async ({ page }) => {
    await page.goto('/avanza')

    for (const chapter of BOOK_CHAPTERS) {
      await expect(page.getByText(chapter, { exact: true }).first()).toBeVisible()
    }
    expect(BOOK_CHAPTERS.length).toBe(15)
  })

  test('el formulario de compra no procede sin email/nombre completos', async ({ page }) => {
    await page.goto('/avanza#comprar')

    const compraSection = page.locator('#comprar')
    const submitBtn = compraSection.getByRole('button', { name: /comprar ahora/i })

    // NOTA: el botón no se deshabilita por campos vacíos (comportamiento real de
    // LibroCompra.tsx) — la validación ocurre al hacer click y muestra un error.
    await submitBtn.click()
    await expect(compraSection.getByText(/ingresá tu nombre completo/i)).toBeVisible()

    await compraSection.getByPlaceholder('Nombre completo').fill('Test E2E')
    await submitBtn.click()
    await expect(compraSection.getByText(/ingresá un email válido/i)).toBeVisible()
  })
})
