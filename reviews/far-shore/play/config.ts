import { resolve } from 'node:path';
import { defineConfig } from '@playwright/test';

const prototype = process.env.FAR_SHORE_PROTOTYPE === '1';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
process.env.LAST_FERRY_REVIEW_DIR ??= 'reviews/far-shore/play' + (prototype ? '/development' : '');

export default defineConfig({
  testDir: '.',
  testMatch: prototype ? 'prototype.spec.ts' : 'rescue.spec.ts',
  workers: 1,
  timeout: 480000,
  outputDir: resolve('.cache/far-shore-play', prototype ? 'prototype' : 'release'),
  reporter: [['list'], ['json', { outputFile: resolve(process.env.LAST_FERRY_REVIEW_DIR, 'browser.json') }]],
  use: {
    baseURL: process.env.FAR_SHORE_URL ?? (prototype ? 'http://127.0.0.1:5391' : 'http://127.0.0.1:5390'),
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
