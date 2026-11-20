import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

const stage = process.env.COVE_READABILITY_STAGE ?? 'after';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
process.env.LAST_FERRY_REVIEW_DIR = stage === 'pilot' ? '.cache/cove-readability-pilot/evidence' : 'reviews/cove-readability/play/' + stage;
process.env.REACH_DIST ??= stage === 'before' ? '.cache/cove-readability-before/dist' : 'dist';

export default defineConfig({
  testDir: '.', testMatch: 'readability.spec.ts', workers: 1, timeout: 360000,
  outputDir: resolve('.cache/cove-readability-tests',stage),
  reporter: [['list'],['json',{outputFile:resolve(process.env.LAST_FERRY_REVIEW_DIR,process.env.COVE_READABILITY_REPORT ?? 'browser.json')}]],
  use: {
    baseURL: process.env.COVE_READABILITY_URL ?? 'http://127.0.0.1:' + (stage === 'before' ? 5401 : 5400),
    hasTouch: true, isMobile: true, deviceScaleFactor: 1, actionTimeout: 12000,
    launchOptions: {
      ignoreDefaultArgs: ['--autoplay-policy=no-user-gesture-required'],
      args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=document-user-activation-required']
    }
  }
});
