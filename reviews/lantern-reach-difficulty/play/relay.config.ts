import { resolve } from 'node:path';
import { defineConfig } from '@playwright/test';
import config from './config';

export default defineConfig({
  ...config,
  testMatch: 'relay.spec.ts',
  reporter: [['list'],['json',{ outputFile:resolve('.cache/reach-relay-ui-results.json') }]],
  use: { ...config.use, baseURL: 'http://127.0.0.1:5383' },
});
