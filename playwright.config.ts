import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
const devPort = Number(process.env.LAST_FERRY_DEV_PORT ?? 5173),
  productionPort = Number(process.env.LAST_FERRY_PRODUCTION_PORT ?? 4173);
const reviewDir = process.env.LAST_FERRY_REVIEW_DIR ?? 'reviews/m1';
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60000,
  expect: { timeout: 10000 },
  workers: 1,
  reporter: [['list'], ['json', { outputFile: `${reviewDir}/automation-results.json` }]],
  use: {
    baseURL: `http://127.0.0.1:${devPort}`,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    headless: true,
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
    video: { mode: 'on', size: { width: 1440, height: 900 } },
  },
  webServer: [
    {
      command: `npm run dev -- --port ${devPort}`,
      url: `http://127.0.0.1:${devPort}`,
      reuseExistingServer: true,
    },
    {
      command: `npm run build && npm run preview -- --port ${productionPort}`,
      url: `http://127.0.0.1:${productionPort}`,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
