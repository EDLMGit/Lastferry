import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
export default defineConfig({
  testDir: '.',
  testMatch: 'continuity.spec.ts',
  workers: 1,
  timeout: 150000,
  outputDir: '.cache/last-ferry-checks',
  reporter: [
    ['list'],
    [
      'json',
      {
        outputFile: resolve(process.env.LAST_FERRY_CHECK_REPORT ?? 'reviews/last-ferry/checks/results.json'),
      },
    ],
  ],
  use: {
    baseURL: process.env.LAST_FERRY_CHECK_URL ?? 'http://127.0.0.1:5410',
    hasTouch: true,
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
});
