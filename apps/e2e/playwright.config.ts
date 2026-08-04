import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config()

const baseURL = process.env.BASE_URL ?? 'http://localhost:3000'
const isRemote = baseURL.includes('railway') || baseURL.includes('diegoferreira')

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  // Timeout de las aserciones `expect(...)` — la API real es `expect: { timeout }`
  // en la config, no `expect.setTimeout()` (eso no existe en Playwright).
  expect: { timeout: 30000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // No levantar el dev server local si BASE_URL ya apunta a un ambiente remoto
  // (staging en Railway / diegoferreira.coach). auth.spec.ts es la excepción: usa
  // su propio baseURL fijo a localhost:3001 (apps/admin), que este webServer no
  // gestiona — hay que levantar apps/admin (y apps/api) a mano antes de correrlo.
  webServer: isRemote
    ? undefined
    : {
        command:             'pnpm --filter @df/web dev',
        url:                 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout:             120_000,
      },
})
