# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing.spec.ts >> Landing principal (/main) >> página /avanza carga correctamente
- Location: tests/landing.spec.ts:59:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('USD 12.99').first()
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 30000ms
  - waiting for getByText('USD 12.99').first()

```

```yaml
- banner:
  - link "Diego Ferreira":
    - /url: /main
    - img "Diego Ferreira"
  - link "Cómo funciona":
    - /url: /main#identificacion
  - link "El Método":
    - /url: /main#metodo
  - link "Para quién es":
    - /url: /main#para-quien
  - link "Libro":
    - /url: /main#libro
  - link "Precios":
    - /url: /main#precios
  - link "Agendá tu lugar hoy":
    - /url: /agendar
- heading "404" [level=1]
- heading "This page could not be found." [level=2]
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Landing principal (/main)', () => {
  4  |   test('landing /main carga correctamente', async ({ page }) => {
  5  |     await page.goto('/main')
  6  | 
  7  |     // Hero
  8  |     await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  9  | 
  10 |     // TopBar: 5 links de navegación (Cómo funciona, El Método, Para quién es, Libro, Precios)
  11 |     const nav = page.locator('header')
  12 |     await expect(nav.getByRole('link', { name: 'Cómo funciona' })).toBeVisible()
  13 |     await expect(nav.getByRole('link', { name: 'El Método' })).toBeVisible()
  14 |     await expect(nav.getByRole('link', { name: 'Para quién es' })).toBeVisible()
  15 |     await expect(nav.getByRole('link', { name: 'Libro' })).toBeVisible()
  16 |     await expect(nav.getByRole('link', { name: 'Precios' })).toBeVisible()
  17 | 
  18 |     // CTA
  19 |     await expect(nav.getByRole('link', { name: 'Agendá tu lugar hoy' })).toBeVisible()
  20 |   })
  21 | 
  22 |   test('navegación por anchors funciona', async ({ page }) => {
  23 |     await page.goto('/main')
  24 |     const nav = page.locator('header')
  25 | 
  26 |     await nav.getByRole('link', { name: 'Cómo funciona' }).click()
  27 |     await expect(page).toHaveURL(/#identificacion/)
  28 |     await expect(page.locator('#identificacion')).toBeInViewport()
  29 | 
  30 |     await nav.getByRole('link', { name: 'El Método' }).click()
  31 |     await expect(page).toHaveURL(/#metodo/)
  32 |     await expect(page.locator('#metodo')).toBeInViewport()
  33 | 
  34 |     await nav.getByRole('link', { name: 'Precios' }).click()
  35 |     await expect(page).toHaveURL(/#precios/)
  36 |     await expect(page.locator('#precios')).toBeInViewport()
  37 | 
  38 |     await nav.getByRole('link', { name: 'Libro' }).click()
  39 |     await expect(page).toHaveURL(/#libro/)
  40 |     await expect(page.locator('#libro')).toBeInViewport()
  41 |   })
  42 | 
  43 |   test('sección del libro tiene los botones correctos y sin formulario de compra', async ({ page }) => {
  44 |     await page.goto('/main#libro')
  45 | 
  46 |     const comprarBtn = page.getByRole('link', { name: 'Comprar el libro →' })
  47 |     await expect(comprarBtn).toBeVisible()
  48 |     await expect(comprarBtn).toHaveAttribute('href', '/avanza#comprar')
  49 | 
  50 |     const verBtn = page.getByRole('link', { name: 'Ver el libro' })
  51 |     await expect(verBtn).toBeVisible()
  52 |     await expect(verBtn).toHaveAttribute('href', '/avanza')
  53 | 
  54 |     // Sin formulario de compra directa en /main (se movió a /avanza)
  55 |     await expect(page.locator('#libro input[type="email"]')).toHaveCount(0)
  56 |     await expect(page.getByRole('button', { name: /comprar ahora/i })).toHaveCount(0)
  57 |   })
  58 | 
  59 |   test('página /avanza carga correctamente', async ({ page }) => {
  60 |     await page.goto('/avanza')
  61 | 
> 62 |     await expect(page.getByText('USD 12.99').first()).toBeVisible()
     |                                                       ^ Error: expect(locator).toBeVisible() failed
  63 |     await expect(page.locator('#comprar')).toBeVisible()
  64 |     await expect(page.locator('#comprar input[type="email"]')).toBeVisible()
  65 |     await expect(page.locator('#comprar').getByPlaceholder('Nombre completo')).toBeVisible()
  66 |   })
  67 | })
  68 | 
```