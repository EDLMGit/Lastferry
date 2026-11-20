import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
process.env.LAST_FERRY_REVIEW_DIR ??= 'reviews/animal-presentation/components';
export default defineConfig({
  testDir: '../../tests/e2e',
  testMatch: ['animal-choice.spec.ts', 'arrival-bubble.spec.ts'],
  grep: /real four-neighbor chooser|isolated six-neighbor renderer|isolated initial pending/,
  workers: 1,
  timeout: 150000,
  outputDir: resolve('.cache/animal-component-results'),
  reporter: [['list'], ['json', { outputFile: resolve(process.env.LAST_FERRY_REVIEW_DIR, 'browser-results.json') }]],
  use: {
    baseURL: process.env.ANIMAL_COMPONENT_URL ?? 'http://127.0.0.1:5326',
    hasTouch: true, isMobile: true, deviceScaleFactor: 1, actionTimeout: 9000, video: 'off',
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }
  }
});
