import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: './apps/api/vitest.config.ts',
    test: {
      name: 'api',
      root: './apps/api',
    },
  },
  {
    extends: './apps/web/vitest.config.ts',
    test: {
      name: 'web',
      root: './apps/web',
    },
  },
]);
