import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
import base from './config';

export default defineConfig({
  ...base, testMatch: 'settled.spec.ts',
  reporter: [['list'], ['json', { outputFile: resolve('reviews/far-shore/play/settled.json') }]],
});
