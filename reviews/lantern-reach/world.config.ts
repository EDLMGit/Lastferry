import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
export default defineConfig({
  testDir: '.', testMatch: 'world.spec.ts', workers: 1, timeout: 150000,
  outputDir: resolve('.cache/lantern-world'),
  use: {
    baseURL: process.env.LANTERN_WORLD_URL ?? 'http://127.0.0.1:5374',
    viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1,
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
});
