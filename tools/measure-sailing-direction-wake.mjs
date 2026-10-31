import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const args = Object.fromEntries(process.argv.slice(2).map((v) => v.replace(/^--/, '').split('=')));
const out = args.output ?? 'reviews/sailing-direction-wake/performance';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const result = {
  environment: {
    node: process.version,
    browser: browser.version(),
    renderer: 'SwiftShader',
    viewport: [844, 390],
    dpr: 1,
    method:
      'Matched warmed natural timing, no video or geometry-array sampling; rAF intervals and small transition reads.',
  },
  runs: [],
};
const idle = (p) =>
  p.waitForFunction(
    () => document.querySelector('#seascape')?.getAttribute('aria-busy') === 'false',
  );
const act = async (p, id) => {
  if ((id === 'unload' || id === 'board') && !(await p.locator(`#${id}`).isVisible()))
    await p.locator('.map-target[aria-current="location"]').click();
  await p.locator(`#${id}`).click();
  await p.locator(id.startsWith('map-') ? '#sail' : '#commit').click();
  await idle(p);
};
for (const [label, base] of [
  ['baseline', args.baseline ?? 'http://127.0.0.1:5205'],
  ['candidate', args.candidate ?? 'http://127.0.0.1:5206'],
]) {
  const context = await browser.newContext({
      viewport: { width: 844, height: 390 },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
      reducedMotion: 'no-preference',
    }),
    page = await context.newPage();
  await page.goto(`${base}/?cove=holding-pier`);
  await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 6);
  for (const id of [
    'unload',
    'map-shallows',
    'map-rabbit-pier',
    'board',
    'map-shallows',
    'map-stone',
    'map-shallows',
    'map-stone',
  ])
    await act(page, id);
  await page.waitForTimeout(2000);
  const idleSample = await page.evaluate(async () => {
    const frames = [];
    let last = await new Promise(requestAnimationFrame);
    for (let i = 0; i < 90; i++) {
      const now = await new Promise(requestAnimationFrame);
      frames.push(now - last);
      last = now;
    }
    return { frames, metrics: window.__LAST_FERRY__.getMetrics() };
  });
  await page.evaluate(() => {
    window.__perfSample = { running: true, frames: [], last: 0 };
    function read(time) {
      const s = window.__perfSample;
      if (!s.running) return;
      const a = window.__LAST_FERRY__,
        t = a.getTransitionStatus();
      if (t.active?.action.type === 'move' && s.last) s.frames.push(time - s.last);
      s.last = time;
      requestAnimationFrame(read);
    }
    requestAnimationFrame(read);
  });
  for (const id of ['map-shallows', 'map-stone']) await act(page, id);
  const activeSample = await page.evaluate(() => {
    window.__perfSample.running = false;
    return {
      frames: window.__perfSample.frames,
      metrics: window.__LAST_FERRY__.getMetrics(),
      state: window.__LAST_FERRY__.getState(),
      transition: window.__LAST_FERRY__.getTransitionStatus(),
    };
  });
  await page.waitForTimeout(2000);
  const afterMetrics = await page.evaluate(() => window.__LAST_FERRY__.getMetrics());
  result.runs.push({ label, base, idleSample, activeSample, afterMetrics });
  await context.close();
}
await browser.close();
const summary = (values) => {
  const a = [...values].sort((a, b) => a - b);
  return {
    count: a.length,
    median: a[Math.floor(a.length * 0.5)],
    p95: a[Math.min(a.length - 1, Math.floor(a.length * 0.95))],
    maximum: Math.max(...a),
  };
};
for (const run of result.runs) {
  run.idleSummary = summary(run.idleSample.frames);
  run.activeSummary = summary(run.activeSample.frames);
}
result.helperHash = createHash('sha256')
  .update(readFileSync(new URL(import.meta.url)))
  .digest('hex');
writeFileSync(`${out}/comparison.json`, JSON.stringify(result, null, 2));
process.stdout.write(
  JSON.stringify(
    result.runs.map((r) => ({
      label: r.label,
      idle: r.idleSummary,
      active: r.activeSummary,
      resources: r.afterMetrics,
    })),
  ) + '\n',
);
