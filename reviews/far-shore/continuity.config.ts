import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
export default defineConfig({
  testDir: '.', testMatch: 'continuity.spec.ts', workers: 1, timeout: 360000,
  outputDir: resolve('.cache/far-shore-continuity'),
  reporter: [['list'], ['json', { outputFile: resolve('reviews/far-shore/continuity/results.json') }]],
  use: { baseURL: 'http://127.0.0.1:5390', hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce',
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } },
});
