import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
process.env.LAST_FERRY_REVIEW_DIR ??= 'reviews/cove-nine-practice/gameplay';
export default defineConfig({
  testDir: '.', testMatch: 'gameplay.spec.ts', workers: 1, timeout: 360000,
  outputDir: resolve('.cache/drowned-gameplay'),
  reporter: [['list'], ['json', { outputFile:resolve(process.env.C9_RESULTS ?? process.env.LAST_FERRY_REVIEW_DIR+'/browser.json') }]],
  use: {baseURL:process.env.C9_PREVIEW ?? 'http://127.0.0.1:5360', hasTouch:true, isMobile:true, deviceScaleFactor:1, video:'off', actionTimeout:10000,
    launchOptions:{ignoreDefaultArgs:['--autoplay-policy=no-user-gesture-required'],args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=document-user-activation-required']}}
});
