import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
export default defineConfig({
  testDir: '.', testMatch: 'checks.spec.ts', workers: 1, timeout: 180000,
  outputDir: resolve('.cache/cove-readability-checks'),
  reporter: [['list'], ['json', { outputFile: resolve(process.env.COVE_CHECK_REPORT ?? 'reviews/cove-readability/checks/results.json') }]],
  use: {
    baseURL: process.env.COVE_CHECK_URL ?? 'http://127.0.0.1:5400', hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce',
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
});
