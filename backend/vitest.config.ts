import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      JWT_SECRET: 'test-secret-key',
      JWT_EXPIRES_IN: '1h',
      NODE_ENV: 'test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/app.ts',
        'src/app-factory.ts',
        'src/**/__tests__/**',
        'src/shared/database/**',
        'src/shared/types/**',
      ],
    },
  },
});
