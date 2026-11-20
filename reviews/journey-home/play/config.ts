import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
process.env.LAST_FERRY_REVIEW_DIR ??= 'reviews/journey-home/play';
process.env.REACH_DIST ??= '.cache/journey-home-release/dist';

export default defineConfig({
  testDir: '.', testMatch: 'voyage.spec.ts', workers: 1, timeout: 1_200_000,
  outputDir: resolve('.cache/journey-home-runner', process.env.VOYAGE_PILOT ? 'pilot' : 'release'),
  reporter: [['list'], ['json', { outputFile: resolve(process.env.LAST_FERRY_REVIEW_DIR, 'browser.json') }]],
  use: {
    baseURL: process.env.JOURNEY_HOME_URL ?? 'http://127.0.0.1:5420', hasTouch: true, isMobile: true,
    deviceScaleFactor: 1, actionTimeout: 8000, viewport: { width: 390, height: 844 },
    launchOptions: { ignoreDefaultArgs: ['--autoplay-policy=no-user-gesture-required'],
      args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=document-user-activation-required'] },
  },
});
