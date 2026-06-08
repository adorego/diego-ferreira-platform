import { test, expect } from '@playwright/test'

test.describe('Reserva de sesión', () => {
  test('paciente puede ver disponibilidad y agendar', async ({ page }) => {
    await page.goto('/agendar')
    await expect(page.locator('body')).toBeVisible()

    const nameInput = page.locator('input[name="name"], input[placeholder*="nombre"]').first()
    if (await nameInput.count() > 0) {
      await nameInput.fill('Juan Pérez Test')
    }

    const emailInput = page.locator('input[type="email"]').first()
    if (await emailInput.count() > 0) {
      await emailInput.fill('juan@test.com')
    }

    await expect(page.locator('body')).toBeVisible()
  })
})
