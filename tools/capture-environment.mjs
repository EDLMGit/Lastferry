import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import os from 'node:os';

const options = Object.fromEntries(
  process.argv.slice(2).map((arg) => arg.replace(/^--/, '').split('=')),
);
const phase = options.phase ?? 'before';
const base = options.base ?? 'http://127.0.0.1:5178';
const out = options.output ?? `reviews/environment/${phase}`;
mkdirSync(`${out}/raw`, { recursive: true });
const reference = JSON.parse(readFileSync('reviews/bellwater/source-manifest.json', 'utf8'));
const referenceCaptures = JSON.parse(
  readFileSync('reviews/bellwater/capture-manifest.json', 'utf8'),
);
const referenceRuntimeFiles = Object.keys(reference.files).filter(
  (path) =>
    /^(src\/|data\/)/.test(path) ||
    ['package.json', 'package-lock.json', 'index.html', 'vite.config.ts'].includes(path),
);
function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}
function runtimeSnapshot() {
  const files = [
    ...filesUnder('src'),
    ...filesUnder('data'),
    'package.json',
    'package-lock.json',
    'index.html',
    'vite.config.ts',
  ].sort();
  return Object.fromEntries(
    files.map((path) => [path, createHash('sha256').update(readFileSync(path)).digest('hex')]),
  );
}
const runtimeHashes = runtimeSnapshot();
const differences = referenceRuntimeFiles.filter(
  (path) => runtimeHashes[path] !== reference.files[path],
);
const source = {
  head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  branch: execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim(),
  workingTree: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
  runtimeHashes,
  captureToolHash: createHash('sha256')
    .update(readFileSync(fileURLToPath(import.meta.url)))
    .digest('hex'),
  runtimeHash: createHash('sha256').update(JSON.stringify(runtimeHashes)).digest('hex'),
  referenceSourceHash: reference.sourceHash,
  differencesFromBellwaterRuntime: differences,
};
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const captures = [],
  measurements = [],
  trace = [],
  errors = [];
const idle = (page) =>
  page.waitForFunction(
    () => document.getElementById('seascape').getAttribute('aria-busy') === 'false',
  );
const state = (page) => page.evaluate(() => window.__LAST_FERRY__.getState());
async function ready(page, cove) {
  await page.goto(`${base}/?cove=${cove}`);
  await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 4);
  await idle(page);
}
async function act(page, id) {
  const prior = await state(page);
  await page.locator(`#${id}`).click();
  if (!id.startsWith('map-')) await page.locator('#commit').click();
  await idle(page);
  const after = await state(page);
  if (after.turn !== prior.turn + 1) throw Error(`Action ${id} did not commit once`);
  trace.push({ id, state: after });
}
async function highlight(page, id) {
  const prior = await state(page);
  await page.locator(`#inspect-${id}`).click();
  await page.locator('#cancel').click();
  await page.waitForFunction(
    (destination) =>
      window.__LAST_FERRY__.getNavigationStatus().selectedDestination === destination,
    id,
  );
  if (JSON.stringify(await state(page)) !== JSON.stringify(prior))
    throw Error('Inspection changed state');
}
async function measure(page, cove) {
  const sample = await page.evaluate(async () => {
    const intervals = [],
      metrics = [];
    let prior = await new Promise(requestAnimationFrame);
    for (let count = 0; count < 120; count++) {
      const next = await new Promise(requestAnimationFrame);
      intervals.push(next - prior);
      prior = next;
      metrics.push(window.__LAST_FERRY__.getMetrics());
    }
    const sorted = [...intervals].sort((a, b) => a - b);
    return {
      intervalsMs: intervals,
      medianIntervalMs: sorted[60],
      p95IntervalMs: sorted[Math.ceil(sorted.length * 0.95) - 1],
      drawCalls: [...new Set(metrics.map((m) => m.drawCalls))],
      triangles: [...new Set(metrics.map((m) => m.triangles))],
      renderer: metrics.at(-1),
      userAgent: navigator.userAgent,
    };
  });
  measurements.push({
    cove,
    state: await state(page),
    viewport: page.viewportSize(),
    preference: 'normal',
    dpr: 1,
    sampleFrames: 120,
    ...sample,
  });
}
async function capture(page, name, reusedPath) {
  const path = `${out}/${name}.png`;
  let reuse = null;
  if (reusedPath && phase === 'before' && differences.length === 0) {
    copyFileSync(reusedPath, path);
    reuse = {
      path: reusedPath,
      sourceHash: reference.sourceHash,
      capture: referenceCaptures.captures.find((capture) => capture.path === reusedPath) ?? null,
      validation:
        'All current src/data/package/index/vite runtime hashes exactly match historical captured runtime.',
    };
  } else await page.screenshot({ path });
  captures.push({
    name,
    path,
    capturedAt: new Date().toISOString(),
    viewport: page.viewportSize(),
    state: await state(page),
    metrics: await page.evaluate(() => window.__LAST_FERRY__.getMetrics()),
    frame: await page.evaluate(() => window.__LAST_FERRY__.getFrameStatus()),
    navigation: await page.evaluate(() => window.__LAST_FERRY__.getNavigationStatus()),
    environment: await page.evaluate(() => ({
      userAgent: navigator.userAgent,
      dpr: devicePixelRatio,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    })),
    reuse,
  });
}
const desktop = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: 'no-preference',
});
const holding = await desktop.newPage();
holding.on('pageerror', (error) => errors.push(error.message));
await ready(holding, 'holding-pier');
await measure(holding, 'holding-pier');
await capture(holding, 'holding-desktop-tide-0');
for (const id of ['unload', 'map-shallows', 'map-rabbit-pier', 'board']) await act(holding, id);
await capture(holding, 'holding-desktop-tide-1');
for (const id of ['map-shallows', 'map-stone', 'board', 'map-harbor']) await act(holding, id);
await capture(holding, 'holding-desktop-tide-2');
await desktop.close();
const recording = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: 'no-preference',
  recordVideo: { dir: `${out}/raw`, size: { width: 1440, height: 900 } },
});
const bell = await recording.newPage();
bell.on('pageerror', (error) => errors.push(error.message));
await ready(bell, 'bellwater');
await measure(bell, 'bellwater');
for (const id of ['map-shallows', 'map-low-pier', 'board', 'map-east-buoy']) await act(bell, id);
await highlight(bell, 'west-buoy');
await capture(bell, 'bellwater-desktop-outer-highlight-tide-1');
for (const id of ['map-west-buoy', 'map-harbor', 'map-bell-pier', 'board', 'map-harbor'])
  await act(bell, id);
await highlight(bell, 'bell-pier');
await capture(bell, 'bellwater-desktop-harbor-bell-highlight-tide-2');
for (const id of ['map-west-buoy', 'map-east-buoy', 'map-west-buoy', 'map-harbor', 'unload'])
  await act(bell, id);
if ((await state(bell)).status !== 'won') throw Error('Recorded rescue did not finish');
const video = bell.video();
await recording.close();
await video.saveAs(`${out}/raw/bellwater-journeys.webm`);
for (const width of [844, 780]) {
  const context = await browser.newContext({
    viewport: { width, height: 390 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'no-preference',
  });
  const phone = await context.newPage();
  phone.on('pageerror', (error) => errors.push(error.message));
  await ready(phone, 'holding-pier');
  await capture(phone, `holding-phone-${width}-initial`);
  await ready(phone, 'bellwater');
  await capture(phone, `bellwater-phone-${width}-initial`);
  if (width === 780) {
    for (const id of ['map-west-buoy', 'map-east-buoy', 'map-low-pier']) await act(phone, id);
    await phone.locator('#board').tap();
    await phone.locator('#passenger-lark').tap();
    await capture(
      phone,
      'bellwater-phone-780-constrained',
      'reviews/bellwater/bellwater-phone-780-subset-warning.png',
    );
  }
  await context.close();
}
await browser.close();
const runtimeAfter = runtimeSnapshot();
const sourceUnchanged = JSON.stringify(runtimeHashes) === JSON.stringify(runtimeAfter);
if (!sourceUnchanged)
  throw Error(
    'Runtime source changed during capture; discard this run and repeat against a frozen source.',
  );
if (errors.length) throw Error(JSON.stringify(errors));
writeFileSync(
  `${out}/capture-manifest.json`,
  JSON.stringify(
    {
      phase,
      source,
      sourceUnchangedAcrossExecution: sourceUnchanged,
      generatedAt: new Date().toISOString(),
      environment: {
        os: os.platform(),
        release: os.release(),
        arch: os.arch(),
        node: process.version,
        browser: browser.version(),
        renderer:
          'Headless Chromium SwiftShader software WebGL; no physical-device frame-rate claim',
        baseURL: base,
      },
      measurementProtocol:
        'Idle turn0 at1440x900, DPR1, no-preference motion.120 consecutive requestAnimationFrame intervals after metrics.frames>4; median/p95 and render calls/triangles. Repeat same protocol after renderer changes.',
      measurements,
      captures,
      trace,
      errors,
      recording: {
        path: `${out}/raw/bellwater-journeys.webm`,
        actions:
          '14-action actual-UI Bellwater rescue, with both Harbor–Bell directions and both outer-bend directions; inspection/cancellation free; no state injection or temporal edits.',
      },
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    phase,
    captures: captures.length,
    source: source.head,
    differences,
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
