import { test, expect } from '@playwright/test'

test.describe('Landing principal (/main)', () => {
  test('landing /main carga correctamente', async ({ page }) => {
    await page.goto('/main')

    // Hero
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // TopBar: 5 links de navegación (Cómo funciona, El Método, Para quién es, Libro, Precios)
    const nav = page.locator('header')
    await expect(nav.getByRole('link', { name: 'Cómo funciona' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'El Método' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Para quién es' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Libro' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Precios' })).toBeVisible()

    // CTA
    await expect(nav.getByRole('link', { name: 'Agendá tu lugar hoy' })).toBeVisible()
  })

  test('navegación por anchors funciona', async ({ page }) => {
    await page.goto('/main')
    const nav = page.locator('header')

    await nav.getByRole('link', { name: 'Cómo funciona' }).click()
    await expect(page).toHaveURL(/#identificacion/)
    await expect(page.locator('#identificacion')).toBeInViewport()

    await nav.getByRole('link', { name: 'El Método' }).click()
    await expect(page).toHaveURL(/#metodo/)
    await expect(page.locator('#metodo')).toBeInViewport()

    await nav.getByRole('link', { name: 'Precios' }).click()
    await expect(page).toHaveURL(/#precios/)
    await expect(page.locator('#precios')).toBeInViewport()

    await nav.getByRole('link', { name: 'Libro' }).click()
    await expect(page).toHaveURL(/#libro/)
    await expect(page.locator('#libro')).toBeInViewport()
  })

  test('sección del libro tiene los botones correctos y sin formulario de compra', async ({ page }) => {
    await page.goto('/main#libro')

    const comprarBtn = page.getByRole('link', { name: 'Comprar el libro →' })
    await expect(comprarBtn).toBeVisible()
    await expect(comprarBtn).toHaveAttribute('href', '/avanza#comprar')

    const verBtn = page.getByRole('link', { name: 'Ver el libro' })
    await expect(verBtn).toBeVisible()
    await expect(verBtn).toHaveAttribute('href', '/avanza')

    // Sin formulario de compra directa en /main (se movió a /avanza)
    await expect(page.locator('#libro input[type="email"]')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /comprar ahora/i })).toHaveCount(0)
  })

  test('página /avanza carga correctamente', async ({ page }) => {
    await page.goto('/avanza')

    await expect(page.getByText('USD 12.99').first()).toBeVisible()
    await expect(page.locator('#comprar')).toBeVisible()
    await expect(page.locator('#comprar input[type="email"]')).toBeVisible()
    await expect(page.locator('#comprar').getByPlaceholder('Nombre completo')).toBeVisible()
  })
})
