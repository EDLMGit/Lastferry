import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
const phase = process.env.ANIMAL_PHASE ?? 'after';
process.env.LAST_FERRY_REVIEW_DIR ??= 'reviews/animal-presentation/'+phase;
export default defineConfig({
  testDir: '.', testMatch: 'actual-play.spec.ts', workers: 1, timeout: 210000,
  expect: {timeout: 7000}, outputDir: resolve('.cache/animal-presentation-results',phase),
  reporter: [['list'], ['json', {outputFile: resolve(process.env.ANIMAL_RESULTS ?? 'reviews/animal-presentation/'+phase+'/browser-results.json')}]],
  use:{baseURL:process.env.ANIMAL_URL ?? 'http://127.0.0.1:5315', viewport:{width:390,height:844},
    hasTouch:true, isMobile:true, deviceScaleFactor:1, reducedMotion:'reduce', video:'off',actionTimeout:12000,
    launchOptions:{args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}}
});
