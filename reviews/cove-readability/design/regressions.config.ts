import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
process.env.LAST_FERRY_REVIEW_DIR ??= '.cache/cove-readability-hud-regressions';

export default defineConfig({
  testDir: resolve('tests/e2e'),
  testMatch: ['mobile-map-lifecycle.spec.ts', 'play-readability.spec.ts'],
  grep: /mobile-map-lifecycle|native collapsed controls|Whole cove keeps actual shore passengers/,
  outputDir: resolve('.cache/cove-readability-hud-regressions/test-results'),
  timeout: 180000,
  expect: { timeout: 10000 },
  workers: 1,
  reporter: [['list'], ['json', { outputFile: resolve('reviews/cove-readability/design/regressions.json') }]],
  use: {
    baseURL: process.env.COVE_DESIGN_URL ?? 'http://127.0.0.1:5403',
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
});
