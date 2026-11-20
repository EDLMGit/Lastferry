import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

const prototype = process.env.LAST_FERRY_PILOT === '1';
const dir = 'reviews/last-ferry/play';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
process.env.LAST_FERRY_REVIEW_DIR = prototype ? dir + '/prototype' : dir;

export default defineConfig({
  testDir: '.', testMatch: 'crossing.spec.ts', workers: 1, timeout: 240000,
  outputDir: resolve('.cache/last-ferry-play', prototype ? 'prototype' : 'release'),
  reporter: [['list'], ['json', { outputFile: resolve(process.env.LAST_FERRY_REVIEW_DIR, process.env.LAST_FERRY_PLAY_REPORT ?? 'browser.json') }]],
  use: {
    baseURL: 'http://127.0.0.1:' + (prototype ? 5411 : 5410), hasTouch: true, isMobile: true,
    deviceScaleFactor: 1, actionTimeout: 10000,
    launchOptions: {
      ignoreDefaultArgs: ['--autoplay-policy=no-user-gesture-required'],
      args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=document-user-activation-required'],
    },
  },
});

