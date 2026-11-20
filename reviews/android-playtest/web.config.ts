import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

const dist = process.env.ANDROID_WEB_DIST ?? 'dist';
const baseURL = process.env.ANDROID_WEB_URL ?? 'http://127.0.0.1:5432';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
process.env.LAST_FERRY_REVIEW_DIR = '.cache/android-playtest/web-play';
process.env.REACH_DIST = dist;
process.env.COVE_READABILITY_RECORD = '0';

export default defineConfig({
  testDir: resolve('reviews/cove-readability/play'),
  testMatch: 'readability.spec.ts',
  grep: /Fresh Journey to Holding rescue 780x320/,
  workers: 1,
  timeout: 180000,
  reporter: [['list'], ['json', { outputFile: resolve('.cache/android-playtest/web-final.json') }]],
  use: {
    baseURL, isMobile: true, hasTouch: true, deviceScaleFactor: 1,
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
});
