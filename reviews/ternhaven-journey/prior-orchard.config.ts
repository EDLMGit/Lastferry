import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
process.env.LAST_FERRY_REVIEW_DIR = 'reviews/ternhaven-journey/prior-orchard';
process.env.LAST_FERRY_PRODUCTION_PORT ??= '5342';

export default defineConfig({
  testDir: '../../tests/e2e', testMatch: 'orchard-journey.spec.ts',
  grep: /completed-six continues through the actual portrait scene|minified Journey rescues Reef/,
  workers: 1, timeout: 360000, expect: { timeout: 10000 },
  outputDir: resolve('.cache/ternhaven-prior-orchard'),
  reporter: [['list'], ['json', { outputFile: resolve(process.env.ORCHARD_PRIOR_REPORT ?? 'reviews/ternhaven-journey/prior-orchard/results.json') }]],
  use: { baseURL: 'http://127.0.0.1:5334', viewport: { width: 390, height: 844 }, actionTimeout: 12000, video: 'off' },
});
