import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
process.env.LAST_FERRY_REVIEW_DIR = 'reviews/cove-nine-practice/world';
export default defineConfig({testDir:'.',testMatch:'world.spec.ts',workers:1,timeout:120000,
  reporter:[['list'],['json',{outputFile:resolve(process.env.C9_WORLD_REPORT ?? 'reviews/cove-nine-practice/world/results.json')}]],
  outputDir:resolve('.cache/c9-world'),use:{baseURL:'http://127.0.0.1:5366',deviceScaleFactor:1,isMobile:true,hasTouch:true,
    reducedMotion:'reduce',actionTimeout:9000,launchOptions:{args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}}});
