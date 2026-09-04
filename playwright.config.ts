import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  expect: { timeout: 15_000 },
  use: { baseURL: 'http://localhost:4187', trace: 'on-first-retry' },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm build && pnpm preview --port 4187 --strictPort',
    url: 'http://localhost:4187',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
