# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payment-flow.spec.ts >> Flujo de pago (libro, /avanza) >> página /avanza/confirmacion carga correctamente
- Location: tests/payment-flow.spec.ts:33:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/gracias/i)
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 30000ms
  - waiting for getByText(/gracias/i)

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
  3  | test.describe('Flujo de pago (coaching, /pago)', () => {
  4  |   test('token inválido en /pago no muestra iframe de Bancard', async ({ page }) => {
  5  |     await page.goto('/pago?token=token_invalido_test_12345')
  6  |     await expect(page.locator('body')).toBeVisible()
  7  | 
  8  |     const iframeCount = await page.locator('iframe[src*="bancard"], iframe[src*="infonet"]').count()
  9  |     expect(iframeCount).toBe(0)
  10 |   })
  11 | 
  12 |   test('/pago sin token muestra mensaje de error', async ({ page }) => {
  13 |     await page.goto('/pago')
  14 |     // PagoClient.tsx setea error='Link inválido.' sincrónicamente cuando no hay ?token
  15 |     await expect(page.getByText('Link inválido.')).toBeVisible()
  16 |   })
  17 | 
  18 |   test('página /pago/confirmacion carga correctamente', async ({ page }) => {
  19 |     await page.goto('/pago/confirmacion')
  20 |     await expect(page.getByRole('heading', { name: 'Pago confirmado' })).toBeVisible()
  21 |     await expect(page.getByRole('link', { name: 'Ir al inicio' })).toHaveAttribute('href', '/main')
  22 |   })
  23 | 
  24 |   test('página /pago/cancelado tiene opción de reintentar', async ({ page }) => {
  25 |     await page.goto('/pago/cancelado')
  26 |     await expect(page.getByRole('heading', { name: 'Pago cancelado' })).toBeVisible()
  27 |     await expect(page.getByRole('link', { name: 'Intentar de nuevo' })).toBeVisible()
  28 |     await expect(page.getByRole('link', { name: 'Ver planes' })).toBeVisible()
  29 |   })
  30 | })
  31 | 
  32 | test.describe('Flujo de pago (libro, /avanza)', () => {
  33 |   test('página /avanza/confirmacion carga correctamente', async ({ page }) => {
  34 |     await page.goto('/avanza/confirmacion')
> 35 |     await expect(page.getByText(/gracias/i)).toBeVisible()
     |                                              ^ Error: expect(locator).toBeVisible() failed
  36 |     await expect(page.getByText(/compra/i).first()).toBeVisible()
  37 |   })
  38 | 
  39 |   test('página /avanza/cancelado tiene opción de reintentar', async ({ page }) => {
  40 |     await page.goto('/avanza/cancelado')
  41 |     await expect(page.locator('a[href*="/avanza"]')).toBeVisible()
  42 |     await expect(page.getByRole('link', { name: 'Intentar de nuevo' })).toHaveAttribute('href', '/avanza#comprar')
  43 |   })
  44 | })
  45 | 
```