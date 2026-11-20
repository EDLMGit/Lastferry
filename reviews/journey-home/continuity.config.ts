import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
export default defineConfig({
  testDir: '.',
  testMatch: 'continuity.spec.ts',
  workers: 1,
  timeout: 180000,
  outputDir: resolve('.cache/journey-home-release/continuity-results'),
  reporter: [
    ['list'],
    [
      'json',
      {
        outputFile: resolve(
          process.env.HOME_CONTINUITY_DIR ?? 'reviews/journey-home/continuity',
          'browser.json',
        ),
      },
    ],
  ],
  use: {
    baseURL: process.env.HOME_CONTINUITY_URL ?? 'http://127.0.0.1:5420',
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
    viewport: { width: 390, height: 844 },
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
});
