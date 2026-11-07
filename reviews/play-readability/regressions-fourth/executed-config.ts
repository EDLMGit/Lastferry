import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
export default defineConfig({
  testDir: resolve('tests/e2e'),
  testMatch: 'play-readability-regressions.spec.ts',
  timeout: 240000,
  expect: { timeout: 10000 },
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'reviews/play-readability/regressions-fourth/automation-results.json' }]],
  use: { baseURL: 'http://127.0.0.1:5282', viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, headless: true, actionTimeout: 15000, navigationTimeout: 20000, launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } }
});



