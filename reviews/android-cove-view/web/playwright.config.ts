import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
process.env.LAST_FERRY_REVIEW_DIR ??= 'reviews/android-cove-view/web';
process.env.REACH_DIST ??= '.cache/android-cove-view/gauge-dist';

export default defineConfig({
  testDir: '.', testMatch: 'instruments.spec.ts', workers: 1, timeout: 240000,
  outputDir: resolve('.cache/android-cove-view/playwright'),
  reporter: [['list']],
  use: {
    baseURL: process.env.COVE_VIEW_URL ?? 'http://127.0.0.1:5536',
    isMobile: true, hasTouch: true, deviceScaleFactor: 1, actionTimeout: 8000,
    reducedMotion: 'reduce', launchOptions: { args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] },
  }
});
