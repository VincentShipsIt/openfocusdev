import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['apps/api/vitest.config.ts', 'apps/web/vitest.config.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/.next/**'],
  },
});
