import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
process.env.LAST_FERRY_REVIEW_DIR = 'reviews/cove-nine-practice/isolation';
export default defineConfig({testDir:'.',testMatch:'isolation.spec.ts',workers:1,timeout:210000,
  reporter:[['list'],['json',{outputFile:resolve(process.env.C9_ISOLATION_LOG??'reviews/cove-nine-practice/isolation/results.json')}]],
  outputDir:resolve('.cache/c9-isolation'),use:{baseURL:'http://127.0.0.1:5362',viewport:{width:390,height:844},
    reducedMotion:'reduce',deviceScaleFactor:1,isMobile:true,hasTouch:true,actionTimeout:12000,video:'off',
    launchOptions:{args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}}});
