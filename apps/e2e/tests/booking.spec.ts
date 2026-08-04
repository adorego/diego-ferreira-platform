import { test, expect } from '@playwright/test'

// NOTA: el checklist original proponía selectores `[name="email"]`/`[name="name"]`,
// pero el formulario real (apps/web/src/app/components/agendar.tsx) no tiene
// atributos `name` en los inputs — solo placeholders. Se ajustaron los selectores
// al DOM real en vez de a lo propuesto.

test.describe('Agendamiento (/agendar)', () => {
  test('flujo de agendamiento carga el formulario sin completar el submit', async ({ page }) => {
    await page.goto('/agendar?plan=estandar')

    await expect(page.locator('form')).toBeVisible()

    await page.getByPlaceholder('Tu nombre').fill('Test E2E')
    await page.locator('input[type="email"]').fill('e2e-test@diegoferreira.coach')
    await page.getByPlaceholder('Argentina, Paraguay, Uruguay...').fill('Paraguay')

    // Sin Google Calendar configurado (o sin eventos "DISPONIBLE"), el componente
    // muestra este mensaje en vez de un date picker — no debe fallar el test.
    const sinDisponibilidad = page.getByText('No hay fechas disponibles en este momento.')
    if (await sinDisponibilidad.isVisible().catch(() => false)) {
      await expect(sinDisponibilidad).toBeVisible()
    } else {
      // Hay calendario configurado: el date picker debería estar interactuable.
      await expect(page.getByPlaceholder(/elegí un día|cargando disponibilidad/i)).toBeVisible()
    }

    // No se completa el submit — solo se verifica que el botón existe.
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('/agendar con plan=basico muestra el plan Básico', async ({ page }) => {
    await page.goto('/agendar?plan=basico')
    await expect(page.getByText('Plan seleccionado')).toBeVisible()
    await expect(page.getByText('Básico', { exact: true })).toBeVisible()
    await expect(page.getByText('$1,600 USD')).toBeVisible()
  })

  test('/agendar con plan=premium muestra el plan Premium', async ({ page }) => {
    await page.goto('/agendar?plan=premium')
    await expect(page.getByText('Plan seleccionado')).toBeVisible()
    await expect(page.getByText('Premium', { exact: true })).toBeVisible()
    await expect(page.getByText('$2,000 USD')).toBeVisible()
  })

  test('/agendar sin plan muestra mensaje de "no elegiste un plan"', async ({ page }) => {
    await page.goto('/agendar')
    await expect(page.getByText(/no elegiste un plan/i)).toBeVisible()
  })
})
