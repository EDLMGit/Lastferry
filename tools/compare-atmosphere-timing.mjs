import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const base = process.env.LAST_FERRY_COMPARISON_URL ?? 'http://127.0.0.1:5180';
const out = process.env.LAST_FERRY_COMPARISON_DIR ?? 'reviews/atmosphere/timing-comparison';
mkdirSync(`${out}/raw`, { recursive: true });
const digest = (data) => createHash('sha256').update(data).digest('hex');
const under = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? under(`${dir}/${entry.name}`) : [`${dir}/${entry.name}`],
  );
const snapshot = () =>
  Object.fromEntries(
    [
      ...under('src'),
      ...under('data'),
      'index.html',
      'package.json',
      'package-lock.json',
      'vite.config.ts',
    ]
      .sort()
      .map((path) => [path, digest(readFileSync(path))]),
  );
const hashes = snapshot(),
  results = [],
  errors = [];
const source = {
  head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  runtimeHashes: hashes,
  runtimeHash: digest(JSON.stringify(hashes)),
};
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const idle = (page) =>
  page.waitForFunction(
    () => document.querySelector('#seascape').getAttribute('aria-busy') === 'false',
  );
async function action(page, id) {
  await page.locator(`#${id}`).click();
  if (!id.startsWith('map-')) await page.locator('#commit').click();
  await idle(page);
}
for (const candidate of ['slower', 'restrained'])
  for (const length of ['short', 'long']) {
    const cove = length === 'short' ? 'holding-pier' : 'bellwater';
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      recordVideo: { dir: `${out}/raw`, size: { width: 1440, height: 900 } },
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${base}/?cove=${cove}`);
    await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 4);
    await page.evaluate((name) => window.__LAST_FERRY__.setTimingCandidate(name), candidate);
    for (const id of length === 'short' ? ['unload', 'map-shallows'] : ['map-west-buoy'])
      await action(page, id);
    await page.evaluate(() => {
      window.__timingSamples = [];
      window.__timingSampling = true;
      function sample(time) {
        if (!window.__timingSampling) return;
        const api = window.__LAST_FERRY__,
          journey = api.getJourneyStatus();
        if (journey.active)
          window.__timingSamples.push({
            time,
            ...journey,
            transition: api.getTransitionStatus().active,
          });
        requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    });
    const crossings = [];
    for (const id of length === 'short'
      ? ['map-rabbit-pier']
      : ['map-east-buoy', 'map-west-buoy']) {
      const started = Date.now();
      await action(page, id);
      const status = await page.evaluate(() => window.__LAST_FERRY__.getTransitionStatus());
      if (status.last.reason !== 'complete' || status.completionCounts.recovery)
        throw Error(`${candidate}/${length}: ${JSON.stringify(status)}`);
      crossings.push({ action: id, wallMs: Date.now() - started, ...status.last });
    }
    const samples = await page.evaluate(() => {
      window.__timingSampling = false;
      return window.__timingSamples;
    });
    await page.evaluate(async () => {
      for (let i = 0; i < 30; i++) await new Promise(requestAnimationFrame);
    });
    const video = page.video(),
      filename = `${out}/raw/${candidate}-${length}.webm`;
    await context.close();
    await video.saveAs(filename);
    results.push({
      candidate,
      length,
      cove,
      filename,
      crossings,
      samples,
      originalSpeed: true,
      audio: 'Silent screen recording; actual runtime master mix recorded separately',
    });
  }
await browser.close();
if (JSON.stringify(hashes) !== JSON.stringify(snapshot()))
  throw Error('Runtime changed during timing comparison');
if (errors.length) throw Error(JSON.stringify(errors));
writeFileSync(
  `${out}/comparison.json`,
  JSON.stringify(
    {
      source,
      generatedAt: new Date().toISOString(),
      sourceUnchangedAcrossExecution: true,
      environment: {
        browser: browser.version(),
        viewport: [1440, 900],
        dpr: 1,
        motion: 'normal',
        renderer: 'Chromium SwiftShader',
      },
      results,
      errors,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    results.map(({ candidate, length, filename, crossings, samples }) => ({
      candidate,
      length,
      filename,
      crossingPlans: crossings.map((crossing) => ({
        action: crossing.action,
        plan: crossing.plan,
        elapsedMs: crossing.finishedAt - crossing.startedAt,
        reason: crossing.reason,
      })),
      samples: samples.length,
    })),
  ),
);
