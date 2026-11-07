import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import os from 'node:os';

const options = Object.fromEntries(
  process.argv.slice(2).map((arg) => arg.replace(/^--/, '').split('=')),
);
const phase = options.phase ?? 'before';
const base =
  options.base ?? (phase === 'before' ? 'http://127.0.0.1:5179' : 'http://127.0.0.1:5180');
const out = options.output ?? `reviews/atmosphere/${phase}`;
mkdirSync(`${out}/raw`, { recursive: true });
const reference = JSON.parse(readFileSync('reviews/environment/source-manifest.json'));
function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? filesUnder(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`],
  );
}
const runtimePaths =
  phase === 'before'
    ? Object.keys(reference.files).filter(
        (path) =>
          /^(src\/|data\/)/.test(path) ||
          ['index.html', 'package.json', 'package-lock.json', 'vite.config.ts'].includes(path),
      )
    : [
        ...filesUnder('src'),
        ...filesUnder('data'),
        'index.html',
        'package.json',
        'package-lock.json',
        'vite.config.ts',
      ].sort();
const digest = (value) => createHash('sha256').update(value).digest('hex');
const snapshot = () =>
  Object.fromEntries(runtimePaths.map((path) => [path, digest(readFileSync(path))]));
const hashes = snapshot();
const changed = runtimePaths.filter((path) => hashes[path] !== reference.files[path]);
if (phase === 'before' && changed.length)
  throw Error(`Baseline runtime changed: ${changed.join(', ')}`);
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const source = {
  head: git('rev-parse', 'HEAD'),
  branch: git('branch', '--show-current'),
  workingTree: git('status', '--short'),
  runtimeHashes: hashes,
  runtimeHash: digest(JSON.stringify(hashes)),
  captureToolHash: digest(readFileSync(new URL(import.meta.url))),
  referenceSourceHash: reference.sourceHash,
  differencesFromReference: changed,
};
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const captures = [],
  measurements = [],
  recordings = [],
  actions = [],
  errors = [];
const state = (page) => page.evaluate(() => window.__LAST_FERRY__.getState());
const idle = (page) =>
  page.waitForFunction(
    () => document.querySelector('#seascape').getAttribute('aria-busy') === 'false',
  );
async function ready(page, cove) {
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${base}/?cove=${cove}`);
  await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 4);
  await idle(page);
}
async function act(page, id, touch = false) {
  const before = await state(page),
    started = Date.now();
  await page.locator(`#${id}`)[touch ? 'tap' : 'click']();
  if (!id.startsWith('map-')) await page.locator('#commit')[touch ? 'tap' : 'click']();
  await idle(page);
  const after = await state(page);
  if (after.turn !== before.turn + 1) throw Error(`Action ${id} did not commit once`);
  actions.push({
    id,
    startedAt: new Date(started).toISOString(),
    completedAt: new Date().toISOString(),
    elapsedMs: Date.now() - started,
    state: after,
  });
}
async function capture(page, name, input = 'Mouse') {
  const path = `${out}/${name}.png`;
  await page.screenshot({ path });
  captures.push({
    path,
    name,
    capturedAt: new Date().toISOString(),
    sha256: digest(readFileSync(path)),
    viewport: page.viewportSize(),
    input,
    state: await state(page),
    frame: await page.evaluate(() => window.__LAST_FERRY__.getFrameStatus()),
    environment: await page.evaluate(() => window.__LAST_FERRY__.getEnvironmentStatus()),
  });
}
async function measure(page, cove) {
  const samples = await page.evaluate(async () => {
    const intervals = [],
      metrics = [];
    let last = await new Promise(requestAnimationFrame);
    for (let i = 0; i < 120; i++) {
      const current = await new Promise(requestAnimationFrame);
      intervals.push(current - last);
      last = current;
      metrics.push(window.__LAST_FERRY__.getMetrics());
    }
    const sorted = [...intervals].sort((a, b) => a - b);
    return {
      intervalsMs: intervals,
      medianIntervalMs: sorted[60],
      p95IntervalMs: sorted[113],
      drawCalls: [...new Set(metrics.map((item) => item.drawCalls))],
      triangles: [...new Set(metrics.map((item) => item.triangles))],
      renderer: metrics.at(-1),
    };
  });
  measurements.push({
    cove,
    state: await state(page),
    viewport: page.viewportSize(),
    dpr: 1,
    preference: 'normal',
    sampleFrames: 120,
    audio: await page.evaluate(() => window.__LAST_FERRY__.getAudioStatus?.() ?? null),
    ...samples,
  });
}
async function hold(page, frames = 30) {
  await page.evaluate(async (count) => {
    for (let i = 0; i < count; i++) await new Promise(requestAnimationFrame);
  }, frames);
}
async function recorded(cove, filename, play) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    recordVideo: { dir: `${out}/raw`, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await ready(page, cove);
  const initial = await state(page);
  await measure(page, cove);
  if (JSON.stringify(await state(page)) !== JSON.stringify(initial))
    throw Error('Idle measurement changed state');
  await capture(page, `${cove}-desktop-ordinary`);
  await play(page);
  await hold(page);
  const video = page.video();
  await context.close();
  await video.saveAs(`${out}/raw/${filename}.webm`);
  recordings.push({
    path: `${out}/raw/${filename}.webm`,
    cove,
    method:
      'Original-speed Playwright screen recording of actual UI,120-rAF idle measurement followed by uninterrupted play;30 rendered success frames held before close',
    audio: 'Silent video; soundtrack requires separate runtime mix evidence',
    edited: false,
  });
}
const holding = [
  'unload',
  'map-shallows',
  'map-rabbit-pier',
  'board',
  'map-shallows',
  'map-stone',
  'board',
  'map-harbor',
  'unload',
];
await recorded('holding-pier', 'holding-short-crossing-idle', async (page) => {
  for (let i = 0; i < holding.length; i++) {
    await act(page, holding[i]);
    if (i === 7) {
      await capture(page, 'holding-desktop-flooded-tide-2');
      await page.locator('#undo').click();
      await idle(page);
      if ((await state(page)).turn !== 7) throw Error('Tide Undo failed');
      await capture(page, 'holding-desktop-undo-tide-1');
      await act(page, 'map-harbor');
    }
  }
  if ((await state(page)).status !== 'won') throw Error('Holding rescue failed');
  await capture(page, 'holding-desktop-delivery');
});
const bell = [
  'map-shallows',
  'map-low-pier',
  'board',
  'map-east-buoy',
  'map-west-buoy',
  'map-harbor',
  'map-bell-pier',
  'board',
  'map-harbor',
  'map-west-buoy',
  'map-east-buoy',
  'map-west-buoy',
  'map-harbor',
  'unload',
];
await recorded('bellwater', 'bellwater-long-crossing-idle', async (page) => {
  for (let i = 0; i < bell.length; i++) {
    await act(page, bell[i]);
    if (i === 8) await capture(page, 'bellwater-desktop-loaded-tide-2');
  }
  if ((await state(page)).status !== 'won') throw Error('Bellwater rescue failed');
  await capture(page, 'bellwater-desktop-delivery');
});
for (const width of [844, 780]) {
  const context = await browser.newContext({
    viewport: { width, height: 390 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  await ready(page, 'bellwater');
  for (const id of bell.slice(0, 9)) await act(page, id, true);
  await page.locator('#inspect-bell-pier').tap();
  await page.locator('#cancel').tap();
  await capture(page, `bellwater-phone-${width}-loaded`, 'Chromium emulated touch');
  await context.close();
}
await browser.close();
if (JSON.stringify(hashes) !== JSON.stringify(snapshot()))
  throw Error('Active runtime changed during capture');
if (errors.length) throw Error(JSON.stringify(errors));
writeFileSync(
  `${out}/capture-manifest.json`,
  JSON.stringify(
    {
      phase,
      source,
      generatedAt: new Date().toISOString(),
      sourceUnchangedAcrossExecution: true,
      environment: {
        os: os.platform(),
        release: os.release(),
        node: process.version,
        browser: browser.version(),
        renderer: 'Chromium SwiftShader software WebGL; no physical-device performance claim',
        baseURL: base,
      },
      measurementProtocol:
        'Idle turn0 at1440x900,DPR1,normal motion;120 consecutive requestAnimationFrame intervals after metrics.frames>4. Median/p95 and unique drawcall/triangle counts.',
      captures,
      measurements,
      recordings,
      actions,
      errors,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    phase,
    captures: captures.length,
    recordings: recordings.map((recording) => recording.path),
    runtimeHash: source.runtimeHash,
    measurements: measurements.map(
      ({ cove, medianIntervalMs, p95IntervalMs, drawCalls, triangles }) => ({
        cove,
        medianIntervalMs,
        p95IntervalMs,
        drawCalls,
        triangles,
      }),
    ),
  }),
);
