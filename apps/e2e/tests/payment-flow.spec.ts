import { test, expect } from '@playwright/test'

test.describe('Flujo de pago', () => {
  test('link de pago con token inválido no muestra iframe de Bancard', async ({ page }) => {
    await page.goto('/pago?token=token_invalido_test_12345')
    await expect(page.locator('body')).toBeVisible()

    // El iframe de Bancard no debe aparecer con token inválido
    const iframeCount = await page.locator('iframe[src*="bancard"], iframe[src*="infonet"]').count()
    expect(iframeCount).toBe(0)
  })
})
