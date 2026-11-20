import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
process.env.LAST_FERRY_REVIEW_DIR ??= 'reviews/lantern-reach/gameplay';

export default defineConfig({
  testDir: '.',
  testMatch: 'gameplay.spec.ts',
  workers: 1,
  timeout: 420000,
  outputDir: resolve('.cache/lantern-reach-gameplay'),
  reporter: [
    ['list'],
    ['json', { outputFile: resolve(process.env.BRIDGE_RESULTS ?? process.env.LAST_FERRY_REVIEW_DIR + '/browser.json') }],
  ],
  use: {
    baseURL: process.env.BRIDGE_PREVIEW ?? 'http://127.0.0.1:5370',
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 1,
    video: 'off',
    actionTimeout: 12000,
    launchOptions: {
      ignoreDefaultArgs: ['--autoplay-policy=no-user-gesture-required'],
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=document-user-activation-required'],
    },
  },
});
