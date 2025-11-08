import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Prefer explicit non-watch runs; the CLI flag `--run` is still recommended.
  watch: false,
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx,js}'],
  },
});
