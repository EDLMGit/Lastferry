import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
process.env.LAST_FERRY_REVIEW_DIR = 'reviews/ternhaven-journey/lifecycle';
export default defineConfig({
  testDir: '.', testMatch: 'lifecycle.spec.ts', workers: 1, timeout: 150000,
  outputDir: resolve('.cache/tern-lifecycle'), reporter: [['list'], ['json', {outputFile: resolve(process.env.TERN_REPORT ?? 'reviews/ternhaven-journey/lifecycle/results.json')}]],
  use: {baseURL:'http://127.0.0.1:5334', viewport:{width:390,height:844}, hasTouch:true,isMobile:true,deviceScaleFactor:1,
    actionTimeout:9000,video:'off',launchOptions:{args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}}
});
