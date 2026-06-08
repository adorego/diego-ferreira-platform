import { test, expect } from '@playwright/test'

test.describe('Autenticación', () => {
  test('paciente puede loguearse', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'diego@diegoferreira.com')
    await page.fill('input[type="password"]', 'Admin.123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })
  })

  test('redirect a /login si no está autenticado', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/, { timeout: 5000 })
  })
})
