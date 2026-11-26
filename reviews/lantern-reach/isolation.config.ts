import { resolve } from 'node:path';
import { defineConfig } from '@playwright/test';
import gameplay from './gameplay.config';

export default defineConfig({
  ...gameplay,
  testMatch: 'isolation.spec.ts',
  outputDir: resolve('.cache/lantern-reach-isolation'),
  reporter: [['list'], ['json', { outputFile: resolve('reviews/lantern-reach/isolation/results.json') }]],
});
