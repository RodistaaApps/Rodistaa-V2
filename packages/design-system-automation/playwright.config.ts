import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { toHaveScreenshot: { threshold: 0.02 } }, // 2% pixel tolerance
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    viewport: { width: 1200, height: 800 },
    actionTimeout: 10_000,
    baseURL: process.env.VISUAL_BASE_URL || 'http://localhost:6006', // Storybook default
    trace: 'off'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});

