import process from 'node:process';
import { URL, fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { setupUnplugin } from './build/plugins/unplugin';

const viteEnv = loadEnv('test', process.cwd()) as unknown as Env.ImportMeta;

export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [vue(), vueJsx(), ...setupUnplugin(viteEnv)] as any,
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup/unit.setup.ts'],
    include: ['src/**/*.spec.ts', 'packages/**/*.spec.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage/unit'
    }
  }
});
