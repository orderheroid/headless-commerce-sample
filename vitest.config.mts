import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
      // Penanda 'server-only' milik Next.js; di test cukup modul kosong.
      'server-only': fileURLToPath(new URL('./tests/server-only.ts', import.meta.url)),
    },
  },
  test: { include: ['tests/**/*.test.ts'] },
})
