import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import os from 'node:os';

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => arg.replace(/^--/, '').split('=')),
);
const phase = args.phase ?? 'before';
const base = args.base ?? 'http://127.0.0.1:5182';
const root = args.source ?? (phase === 'before' ? '.cache/refinement-baseline' : '.');
const out = args.output ?? `reviews/refinement/${phase}`;
mkdirSync(`${out}/raw`, { recursive: true });
const hash = (value) => createHash('sha256').update(value).digest('hex');
const walk = (folder) =>
  readdirSync(`${root}/${folder}`, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(`${folder}/${entry.name}`) : [`${folder}/${entry.name}`],
  );
const paths = [
  ...walk('src'),
  ...walk('data'),
  'index.html',
  'package.json',
  'vite.config.ts',
].sort();
const snapshot = () =>
  Object.fromEntries(paths.map((path) => [path, hash(readFileSync(`${root}/${path}`))]));
const hashes = snapshot();
const git = (...values) => execFileSync('git', values, { encoding: 'utf8' }).trim();
const source = {
  head: git('rev-parse', 'HEAD'),
  branch: git('branch', '--show-current'),
  workingTree: git('status', '--short'),
  root,
  runtimeHashes: hashes,
  runtimeHash: hash(JSON.stringify(hashes)),
  toolHash: hash(readFileSync(new URL(import.meta.url))),
};
const results = {
  phase,
  source,
  startedAt: new Date().toISOString(),
  measurements: [],
  construction: [],
  captures: [],
  actions: [],
  recordings: [],
  errors: [],
};
writeFileSync(`${out}/source-manifest.json`, JSON.stringify(source, null, 2));
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const state = (page) => page.evaluate(() => window.__LAST_FERRY__.getState());
const idle = (page) =>
  page.waitForFunction(
    () => document.querySelector('#seascape').getAttribute('aria-busy') === 'false',
  );
const hold = (page, frames) =>
  page.evaluate(async (count) => {
    for (let i = 0; i < count; i++) await new Promise(requestAnimationFrame);
  }, frames);
async function ready(page, cove) {
  page.on('pageerror', (error) => results.errors.push(error.message));
  await page.goto(`${base}/?cove=${cove}`);
  await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 4);
  await idle(page);
}
async function act(page, id, touch = false) {
  const before = await state(page),
    start = Date.now();
  await page.locator(`#${id}`)[touch ? 'tap' : 'click']();
  if (!id.startsWith('map-')) await page.locator('#commit')[touch ? 'tap' : 'click']();
  await idle(page);
  const after = await state(page);
  if (after.turn !== before.turn + 1)
    throw Error(`Action ${id} committed ${after.turn - before.turn} times`);
  results.actions.push({
    id,
    elapsedMs: Date.now() - start,
    at: new Date().toISOString(),
    state: after,
  });
}
async function undo(page, touch = false) {
  const terminal = await page.locator('#terminal-undo').count();
  await page.locator(terminal ? '#terminal-undo' : '#undo')[touch ? 'tap' : 'click']();
  await idle(page);
}
async function capture(page, name, input = 'Mouse') {
  const path = `${out}/${name}.png`;
  await page.screenshot({ path });
  results.captures.push({
    path,
    sha256: hash(readFileSync(path)),
    at: new Date().toISOString(),
    viewport: page.viewportSize(),
    input,
    state: await state(page),
    environment: await page.evaluate(() => window.__LAST_FERRY__.getEnvironmentStatus()),
  });
}
async function measure(page, cove, kind, action) {
  if (args.quick) {
    if (action) await action();
    return;
  }
  await page.evaluate((fixed) => {
    window.__frameSample = {
      intervals: [],
      metrics: [],
      audio: [],
      last: performance.now(),
      active: true,
    };
    const tick = (now) => {
      const sample = window.__frameSample;
      if (!sample.active) return;
      sample.intervals.push(now - sample.last);
      sample.last = now;
      sample.metrics.push(window.__LAST_FERRY__.getMetrics());
      sample.audio.push(window.__LAST_FERRY__.getAudioStatus());
      if (fixed && sample.intervals.length === 121) {
        sample.active = false;
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, !action);
  if (action) await action();
  else await page.waitForFunction(() => !window.__frameSample.active);
  const sample = await page.evaluate(() => {
    const sample = window.__frameSample;
    sample.active = false;
    sample.intervals.shift();
    sample.metrics.shift();
    sample.audio.shift();
    const sorted = [...sample.intervals].sort((a, b) => a - b);
    return {
      intervalsMs: sample.intervals,
      medianIntervalMs: sorted[Math.floor(sorted.length / 2)],
      p95IntervalMs: sorted[Math.floor((sorted.length - 1) * 0.95)],
      drawCalls: [...new Set(sample.metrics.map((v) => v.drawCalls))],
      triangles: [...new Set(sample.metrics.map((v) => v.triangles))],
      audio: sample.audio,
      renderer: sample.metrics.at(-1),
    };
  });
  results.measurements.push({
    cove,
    kind,
    state: await state(page),
    viewport: page.viewportSize(),
    dpr: 1,
    ...sample,
  });
}
async function construction(page, cove) {
  if (args.quick) return;
  const samples = await page.evaluate(async (name) => {
    const { CoastalWater } = await import('/src/scene/water.ts');
    const levels = await import('/src/levels/level.ts');
    const { getLevelPaths } = await import('/src/scene/paths.ts');
    const level = name === 'holding-pier' ? levels.holdingPier : levels.bellwater;
    const paths = getLevelPaths(level),
      samples = [];
    for (let i = 0; i < 3; i++) {
      const start = performance.now();
      const water = new CoastalWater(level, paths);
      samples.push({ ms: performance.now() - start, presentation: water.presentation() });
      water.dispose();
    }
    return samples;
  }, cove);
  results.construction.push({
    cove,
    method:
      'Three sequential CoastalWater constructions with cached canonical paths, disposal after each; synchronous CPU time, no GPU render; distinct from steady frame timings',
    samples,
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
  'unload',
];
try {
  for (const cove of ['holding-pier', 'bellwater']) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      ...(phase === 'after'
        ? { recordVideo: { dir: `${out}/raw`, size: { width: 1440, height: 900 } } }
        : {}),
    });
    const page = await context.newPage();
    await ready(page, cove);
    const initial = await state(page);
    await measure(page, cove, 'idle, audio not created');
    if (JSON.stringify(initial) !== JSON.stringify(await state(page)))
      throw Error('Idle changed game state');
    await capture(page, `${cove}-ordinary`);
    await page
      .locator(cove === 'holding-pier' ? '#inspect-shallows' : '#inspect-west-buoy')
      .click();
    await page.locator('#cancel').click();
    await page.waitForFunction(
      () => window.__LAST_FERRY__.getAudioStatus().contextState === 'running',
    );
    if (cove === 'holding-pier') {
      await act(page, 'unload');
      await measure(page, cove, 'audio-enabled short crossing', () => act(page, 'map-shallows'));
      if (phase === 'after') {
        for (const id of holding.slice(2)) {
          await act(page, id);
          if (id === 'board' && (await state(page)).turn === 4) {
            await capture(page, 'holding-after-first-rise');
            await undo(page);
            await capture(page, 'holding-first-rise-undo');
            await act(page, 'board');
          }
          if (id === 'map-harbor') {
            await capture(page, 'holding-flooded-tide-2');
            await undo(page);
            await capture(page, 'holding-tide-undo');
            await act(page, 'map-harbor');
          }
        }
        await capture(page, 'holding-delivery');
      }
    } else {
      await act(page, 'map-west-buoy');
      await measure(page, cove, 'audio-enabled longest crossing', () => act(page, 'map-east-buoy'));
      if (phase === 'after') {
        await page.locator('#menu').click();
        await page.locator('#restart').click();
        await idle(page);
        for (const id of bell) {
          await act(page, id);
          if (id === 'board' && (await state(page)).turn === 8) {
            await capture(page, 'bellwater-after-second-rise');
            await undo(page);
            await capture(page, 'bellwater-second-rise-undo');
            await act(page, 'board');
          }
          if (id === 'map-harbor' && (await state(page)).turn === 9)
            await capture(page, 'bellwater-loaded-harbor');
        }
        await capture(page, 'bellwater-delivery');
      }
    }
    if (phase === 'after') {
      if ((await state(page)).status !== 'won') throw Error(`${cove} rescue failed`);
      await hold(page, 25);
    }
    const video = page.video();
    await construction(page, cove);
    await context.close();
    if (video) {
      const path = `${out}/raw/${cove}-uninterrupted.webm`;
      await video.saveAs(path);
      results.recordings.push({
        path,
        sha256: hash(readFileSync(path)),
        method:
          'Uninterrupted Playwright actual UI original-speed silent video. Idle, crossing, complete rescue, tide Undo, delivery; Bellwater includes explicit restart after long crossing performance sample. No state injection/cuts/speed change.',
      });
    }
  }
  if (phase === 'after')
    for (const width of [844, 780]) {
      const context = await browser.newContext({
        viewport: { width, height: 390 },
        deviceScaleFactor: 1,
        hasTouch: true,
        isMobile: true,
      });
      const page = await context.newPage();
      await ready(page, 'bellwater');
      await capture(page, `bellwater-phone-${width}-ordinary`, 'Chromium emulated touch');
      for (const id of bell.slice(0, 9)) await act(page, id, true);
      await page.locator('#inspect-bell-pier').tap();
      await page.locator('#cancel').tap();
      await capture(page, `bellwater-phone-${width}-loaded`, 'Chromium emulated touch');
      await context.close();
    }
  results.sourceUnchangedAcrossExecution = JSON.stringify(hashes) === JSON.stringify(snapshot());
  if (!results.sourceUnchangedAcrossExecution)
    throw Error('Runtime changed during evidence capture');
  if (results.errors.length) throw Error(JSON.stringify(results.errors));
} catch (error) {
  results.failure = String(error.stack ?? error);
  throw error;
} finally {
  results.environment = {
    os: os.version(),
    node: process.version,
    browser: browser.version(),
    renderer: 'SwiftShader software WebGL; DPR1; no physical-device claim',
    baseURL: base,
  };
  results.finishedAt = new Date().toISOString();
  writeFileSync(`${out}/capture-manifest.json`, JSON.stringify(results, null, 2));
  await browser.close();
  console.log(
    JSON.stringify({
      phase,
      runtimeHash: source.runtimeHash,
      captures: results.captures.length,
      measurements: results.measurements.map(({ cove, kind, medianIntervalMs, p95IntervalMs }) => ({
        cove,
        kind,
        medianIntervalMs,
        p95IntervalMs,
      })),
      construction: results.construction.map(({ cove, samples }) => ({
        cove,
        ms: samples.map((sample) => sample.ms),
      })),
      failure: results.failure,
    }),
  );
}
