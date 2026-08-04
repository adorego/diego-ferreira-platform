import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Espeja el alias "@/*" -> "./src/*" definido en tsconfig.json (paths).
    // Sin esto, vitest no puede resolver los imports "@/..." que usa casi
    // todo el árbol de componentes, y ningún test de componentes puede correr.
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
})
