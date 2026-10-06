import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  use: { baseURL: process.env['TEST_BASE_URL'] || 'http://127.0.0.1:4200', headless: true },
  webServer: process.env['TEST_BASE_URL'] ? undefined : {
    command: 'npm start -- --port 4200',
    url: 'http://127.0.0.1:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
