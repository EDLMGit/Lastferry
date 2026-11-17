import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
process.env.LAST_FERRY_REVIEW_DIR ??= 'reviews/ternhaven-journey/gameplay';
export default defineConfig({
  testDir: '.', testMatch: 'gameplay.spec.ts', timeout: 360000, workers: 1,
  outputDir: resolve('.cache/ternhaven-journey-gameplay'), expect: { timeout: 12000 },
  reporter: [['list'], ['json', { outputFile: resolve(process.env.LAST_FERRY_REVIEW_DIR, 'browser.json') }]],
  use: { baseURL: process.env.TERN_PLAY_URL ?? 'http://127.0.0.1:5342', viewport: {width:390,height:844},
    hasTouch:true, isMobile:true, deviceScaleFactor:1, video:'off', actionTimeout:12000,
    launchOptions: { ignoreDefaultArgs:['--autoplay-policy=no-user-gesture-required'], args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=document-user-activation-required'] } }
});
