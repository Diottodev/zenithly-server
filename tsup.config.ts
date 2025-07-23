import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  sourcemap: true,
  clean: true,
  dts: false,
  target: 'es2024',
});
