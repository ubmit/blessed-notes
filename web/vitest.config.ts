import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  resolve: {
    alias: {
      '@web': fileURLToPath(new URL('./src', import.meta.url)),
      '@cli': fileURLToPath(new URL('../cli', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
