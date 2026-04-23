import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,          // use describe/it/expect without importing them
    environment: 'jsdom',   // simulate a browser DOM in Node.js
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['src/data/**', 'src/main.tsx'],
    },
  },
})
