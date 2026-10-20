import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const chromiumPath = process.env.CHROMIUM_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    ...devices['Desktop Chrome'],
    launchOptions: { executablePath: chromiumPath, args: ['--no-sandbox'] },
  },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:3000', reuseExistingServer: true, timeout: 30_000 },
});
