import { defineConfig } from 'vitest/config';

export default defineConfig({
  css: false,
  test: {
    globals: true,
    environment: 'node',
    root: './',
    css: false,
  },
});
