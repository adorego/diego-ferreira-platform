import { test, expect } from '@playwright/test'

test.describe('Flujo de pago (coaching, /pago)', () => {
  test('token inválido en /pago no muestra iframe de Bancard', async ({ page }) => {
    await page.goto('/pago?token=token_invalido_test_12345')
    await expect(page.locator('body')).toBeVisible()

    const iframeCount = await page.locator('iframe[src*="bancard"], iframe[src*="infonet"]').count()
    expect(iframeCount).toBe(0)
  })

  test('/pago sin token muestra mensaje de error', async ({ page }) => {
    await page.goto('/pago')
    // PagoClient.tsx setea error='Link inválido.' sincrónicamente cuando no hay ?token
    await expect(page.getByText('Link inválido.')).toBeVisible()
  })

  test('página /pago/confirmacion carga correctamente', async ({ page }) => {
    await page.goto('/pago/confirmacion')
    await expect(page.getByRole('heading', { name: 'Pago confirmado' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ir al inicio' })).toHaveAttribute('href', '/main')
  })

  test('página /pago/cancelado tiene opción de reintentar', async ({ page }) => {
    await page.goto('/pago/cancelado')
    await expect(page.getByRole('heading', { name: 'Pago cancelado' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Intentar de nuevo' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ver planes' })).toBeVisible()
  })
})

test.describe('Flujo de pago (libro, /avanza)', () => {
  test('página /avanza/confirmacion carga correctamente', async ({ page }) => {
    await page.goto('/avanza/confirmacion')
    await expect(page.getByText(/gracias/i)).toBeVisible()
    await expect(page.getByText(/compra/i).first()).toBeVisible()
  })

  test('página /avanza/cancelado tiene opción de reintentar', async ({ page }) => {
    await page.goto('/avanza/cancelado')
    await expect(page.locator('a[href*="/avanza"]')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Intentar de nuevo' })).toHaveAttribute('href', '/avanza#comprar')
  })
})
