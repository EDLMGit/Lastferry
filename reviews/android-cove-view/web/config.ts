import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
export default defineConfig({
  testDir: '.',
  testMatch: 'holding.spec.ts',
  timeout: 180000,
  workers: 1,
  use: {
    baseURL: process.env.ANDROID_WEB_URL ?? 'http://127.0.0.1:5443',
    hasTouch: true,
    deviceScaleFactor: 1,
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
});
