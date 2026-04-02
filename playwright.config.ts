import process from 'node:process';
import { defineConfig, devices } from '@playwright/test';

const port = 41731;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  reporter: 'list',
  timeout: 30_000,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    headless: true
  },
  webServer: {
    command: `pnpm exec vite --mode test --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PLAYWRIGHT: '1'
    }
  },
  projects: [
    {
      name: 'msedge',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'msedge'
      }
    }
  ]
});
