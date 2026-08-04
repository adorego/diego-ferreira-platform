# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: libro.spec.ts >> Landing del libro (/avanza) >> el formulario de compra no procede sin email/nombre completos
- Location: tests/libro.spec.ts:44:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#comprar').getByRole('button', { name: /comprar ahora/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "Diego Ferreira" [ref=e5] [cursor=pointer]:
        - /url: /main
        - img "Diego Ferreira" [ref=e6]
      - generic [ref=e7]:
        - link "Cómo funciona" [ref=e8] [cursor=pointer]:
          - /url: /main#identificacion
        - link "El Método" [ref=e9] [cursor=pointer]:
          - /url: /main#metodo
        - link "Para quién es" [ref=e10] [cursor=pointer]:
          - /url: /main#para-quien
        - link "Libro" [ref=e11] [cursor=pointer]:
          - /url: /main#libro
        - link "Precios" [ref=e12] [cursor=pointer]:
          - /url: /main#precios
        - link "Agendá tu lugar hoy" [ref=e13] [cursor=pointer]:
          - /url: /agendar
  - generic [ref=e15]:
    - heading "404" [level=1] [ref=e16]
    - heading "This page could not be found." [level=2] [ref=e18]
  - alert [ref=e19]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | // Copiado deliberadamente en vez de importado de apps/web/src/lib/book — los tests
  4  | // E2E son black-box y no deberían depender de la resolución de módulos de otro
  5  | // paquete del monorepo. Si el contenido del libro cambia, hay que actualizar esto.
  6  | const BOOK_CHAPTERS = [
  7  |   'No nací fuerte',
  8  |   'El chico que se sentía inútil',
  9  |   'Tres palabras que destruyeron mi futuro',
  10 |   'Salí último. Y ese fue el mejor día de mi vida',
  11 |   'La frase que repetí miles de veces hasta hacerla realidad',
  12 |   'Entrenamientos, hielo, vómitos y sacrificios',
  13 |   'El hombre que vio algo en mí cuando nadie más lo veía',
  14 |   'El día que demostré que no estaba loco',
  15 |   'Los sueños grandes cobran caro',
  16 |   'Lo mejor estaba por venir',
  17 |   'El atleta que también quería hacer negocios',
  18 |   'Cuando la mente se me fue a la mierda',
  19 |   'El día que tuve que decirle a mi hija que no podía volver',
  20 |   'Me daba pánico hablar. Ahora quiero llenar auditorios',
  21 |   'Despertá. Avanzá. Carajo.',
  22 | ]
  23 | 
  24 | test.describe('Landing del libro (/avanza)', () => {
  25 |   test('carga con todos los elementos principales', async ({ page }) => {
  26 |     await page.goto('/avanza')
  27 | 
  28 |     // "Despertá. Avanzá. Carajo." aparece dos veces (título del hero y capítulo 15)
  29 |     await expect(page.getByRole('heading', { level: 1, name: 'Despertá. Avanzá. Carajo.' })).toBeVisible()
  30 |     await expect(page.getByText('USD 12.99').first()).toBeVisible()
  31 |     await expect(page.locator('#comprar')).toBeVisible()
  32 |     await expect(page.getByText('Comprar ahora').first()).toBeVisible()
  33 |   })
  34 | 
  35 |   test('los 15 capítulos están listados (sin acordeón, todos visibles)', async ({ page }) => {
  36 |     await page.goto('/avanza')
  37 | 
  38 |     for (const chapter of BOOK_CHAPTERS) {
  39 |       await expect(page.getByText(chapter, { exact: true }).first()).toBeVisible()
  40 |     }
  41 |     expect(BOOK_CHAPTERS.length).toBe(15)
  42 |   })
  43 | 
  44 |   test('el formulario de compra no procede sin email/nombre completos', async ({ page }) => {
  45 |     await page.goto('/avanza#comprar')
  46 | 
  47 |     const compraSection = page.locator('#comprar')
  48 |     const submitBtn = compraSection.getByRole('button', { name: /comprar ahora/i })
  49 | 
  50 |     // NOTA: el botón no se deshabilita por campos vacíos (comportamiento real de
  51 |     // LibroCompra.tsx) — la validación ocurre al hacer click y muestra un error.
> 52 |     await submitBtn.click()
     |                     ^ Error: locator.click: Test timeout of 30000ms exceeded.
  53 |     await expect(compraSection.getByText(/ingresá tu nombre completo/i)).toBeVisible()
  54 | 
  55 |     await compraSection.getByPlaceholder('Nombre completo').fill('Test E2E')
  56 |     await submitBtn.click()
  57 |     await expect(compraSection.getByText(/ingresá un email válido/i)).toBeVisible()
  58 |   })
  59 | })
  60 | 
```