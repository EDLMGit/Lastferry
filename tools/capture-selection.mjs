import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const option = (name, fallback) => process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const phase = option('phase', 'after'), baseURL = option('base', 'http://127.0.0.1:5186');
const sourceRoot = resolve(option('source', '.')), output = option('output', `reviews/selection/${phase}`);
const perfOnly = process.argv.includes('--perf-only'), archive = `${output}/raw`;
mkdirSync(archive, { recursive: true });
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const walk = (dir) => readdirSync(resolve(sourceRoot, dir), { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(`${dir}/${entry.name}`) : [`${dir}/${entry.name}`]);
const runtimeFiles = [...walk('src'), ...walk('data'), 'index.html', 'package.json', 'package-lock.json', 'vite.config.ts', 'tsconfig.json'].sort();
const runtimeHashes = Object.fromEntries(runtimeFiles.map((path) => [path, hash(readFileSync(resolve(sourceRoot, path)))]));
const runtimeHash = hash(JSON.stringify(runtimeHashes));
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const source = { head: git('rev-parse', 'HEAD'), branch: git('branch', '--show-current'), workingTree: git('status', '--short'), root: relative(process.cwd(), sourceRoot), runtimeHash, toolHash: hash(readFileSync(new URL(import.meta.url))) };
writeFileSync(`${output}/source-manifest.json`, JSON.stringify({ ...source, runtimeHashes }, null, 2));
const report = { phase, source, startedAt: new Date().toISOString(), captures: [], actions: [], measurements: [], recordings: [], errors: [] };
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const finalUI = !phase.includes('before');
const idle = (page) => page.waitForFunction(() => document.querySelector('#seascape')?.getAttribute('aria-busy') === 'false');
const state = (page) => page.evaluate(() => window.__LAST_FERRY__.getState());
async function activate(page, id, touch = false) { await page.locator(`#${id}`)[touch ? 'tap' : 'click'](); }
async function select(page, id, touch = false) {
  await activate(page, `map-${id}`, touch);
  if (finalUI) await page.locator('#local-context').waitFor({ state: 'visible' });
}
async function transfer(page, type, touch = false) {
  if (!(await page.locator(`#${type}`).isVisible())) {
    const current = await page.locator('.map-target[aria-current="location"]').getAttribute('id');
    await activate(page, current, touch);
  }
  await activate(page, type, touch);
}
async function act(page, id, touch = false) {
  const before = await state(page);
  if (id.startsWith('map-')) {
    await select(page, id.slice(4), touch);
    if (finalUI) await activate(page, 'sail', touch);
  } else {
    if (id === 'board' || id === 'unload') await transfer(page, id, touch);
    else await activate(page, id, touch);
    await activate(page, 'commit', touch);
  }
  await idle(page);
  const after = await state(page);
  if (after.turn !== before.turn + 1) throw Error(`Expected one committed action for ${id}: ${before.turn} -> ${after.turn}`);
  report.actions.push({ at: new Date().toISOString(), id, before, after });
}
async function undo(page, touch = false) {
  await activate(page, await page.locator('#dialog[open] #terminal-undo').count() ? 'terminal-undo' : 'undo', touch);
  await idle(page);
}
async function closeLocation(page, touch = false) {
  if (await page.locator('#local-context').isVisible()) await activate(page, 'close-location', touch);
}
async function shot(page, name) {
  const path = `${output}/${name}.png`;
  await page.screenshot({ path });
  const observation = await page.evaluate(() => {
    const api = window.__LAST_FERRY__, frame = api.getFrameStatus(), env = api.getEnvironmentStatus();
    return { state: api.getState(), selection: api.getSelectionStatus?.() ?? null, historyLength: api.getRenderStatus().historyLength,
      desiredArrangement: api.getAudioStatus().desiredArrangement,
      canvas: frame.canvas, camera: frame.camera ?? null, lighthouse: frame.lighthouse,
      boat: frame.boat, passengers: frame.passengers,
      environment: { waterY: env.waterY, arrival: env.arrival, water: env.water },
      muted: api.getAudioStatus().muted };
  });
  report.captures.push({ path, sha256: hash(readFileSync(path)), at: new Date().toISOString(), viewport: page.viewportSize(), input: page.viewportSize().height === 390 ? 'Chromium emulated touch' : 'Mouse', ...observation });
}
async function ready(context, cove) {
  const page = await context.newPage();
  page.on('pageerror', (error) => report.errors.push({ at: new Date().toISOString(), message: error.message }));
  await page.goto(`${baseURL}/?cove=${cove}`);
  await page.waitForFunction(() => (window.__LAST_FERRY__?.getMetrics().frames ?? 0) > 8);
  await idle(page);
  return page;
}
async function geometry(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('#world canvas'), rect = canvas.getBoundingClientRect();
    const api = window.__LAST_FERRY__;
    return { viewport: [innerWidth, innerHeight], dpr: devicePixelRatio,
      canvas: { cssWidth: rect.width, cssHeight: rect.height, x: rect.x, y: rect.y, bufferWidth: canvas.width, bufferHeight: canvas.height, renderedPixels: canvas.width * canvas.height },
      metrics: api.getMetrics(), state: api.getState(), audio: api.getAudioStatus() };
  });
}
async function measureIdle(page, cove, label) {
  const before = await geometry(page);
  if (before.audio.contextState !== 'not-created') throw Error('Matched idle requires audio to remain uncreated');
  const timestamps = await page.evaluate(() => new Promise((done) => {
    const timestamps = [];
    const sample = (time) => { timestamps.push(time); if (timestamps.length === 121) done(timestamps); else requestAnimationFrame(sample); };
    requestAnimationFrame(sample);
  }));
  const intervals = timestamps.slice(1).map((time, index) => time - timestamps[index]);
  const sorted = [...intervals].sort((a, b) => a - b);
  const after = await geometry(page);
  if (JSON.stringify(before.state) !== JSON.stringify(after.state)) throw Error('Idle measurement changed the puzzle');
  report.measurements.push({ cove, label, method: '121 requestAnimationFrame timestamps / exactly120 intervals; no per-frame state/audio diagnostics; untouched overview; audio uncreated',
    count: intervals.length, medianMs: sorted[Math.floor(sorted.length / 2)], p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1], timestamps, intervals, before, after });
}
async function scenePoint(page, id, kind) {
  return page.evaluate(({ id, kind }) => {
    const api = window.__LAST_FERRY__, canvas = document.querySelector('#world canvas').getBoundingClientRect();
    const targets = api.getFrameStatus().pickTargets.filter((target) => target.id === id && target.kind === kind);
    for (const target of targets) for (const fy of [0.5, 0.35, 0.65, 0.2, 0.8]) for (const fx of [0.5, 0.35, 0.65, 0.2, 0.8]) {
      const x = target.left + (target.right - target.left) * fx, y = target.top + (target.bottom - target.top) * fy;
      const hit = api.getPickDetailAt?.(x, y);
      const element = document.elementFromPoint(canvas.x + x, canvas.y + y);
      if (api.getPickTargetAt(x, y) === id && (!hit || hit.kind === kind) && element?.tagName === 'CANVAS') return { x: canvas.x + x, y: canvas.y + y, kind, id, hit };
    }
    throw Error(`No exposed ${kind} point for ${id}`);
  }, { id, kind });
}
async function recordVideo(page, name) {
  const video = page.video();
  await page.close();
  if (video) {
    const path = `${archive}/${name}.webm`;
    await video.saveAs(path);
    report.recordings.push({ path, sha256: hash(readFileSync(path)), method: 'Uninterrupted original-speed actual UI recording, silent Playwright video; no cuts or state injection. Includes idle diagnostic samples if recorded during the session.' });
  }
}

try {
  for (const cove of ['holding-pier', 'bellwater']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
      ...(!perfOnly && finalUI ? { recordVideo: { dir: archive, size: { width: 1440, height: 900 } } } : {}) });
    const page = await ready(context, cove);
    await measureIdle(page, cove, 'desktop1440x900');
    if (!perfOnly && finalUI) {
      if (await page.locator('#sound-toggle').getAttribute('aria-pressed') === 'false') await activate(page, 'sound-toggle');
      await shot(page, `${cove}-ordinary`);
      if (cove === 'holding-pier') {
        const point = await scenePoint(page, 'stone', 'island');
        await page.mouse.click(point.x, point.y);
        report.actions.push({ type: 'actual island selection', point, state: await state(page) });
        await shot(page, 'holding-current-stone');
        for (const [id, name] of [['shallows', 'holding-blocked-shallows'], ['rabbit-pier', 'holding-remote-rabbits'], ['harbor', 'holding-safe-harbor']]) { await select(page, id); await shot(page, name); }
        await act(page, 'unload'); await act(page, 'map-shallows'); await act(page, 'map-rabbit-pier');
        await transfer(page, 'board');
        await activate(page, 'passenger-rabbit-2'); await shot(page, 'holding-passenger-subset-preview');
        await activate(page, 'passenger-rabbit-2'); await activate(page, 'commit'); await idle(page);
        const risen = await state(page); report.actions.push({ id: 'board-boundary', after: risen });
        await shot(page, 'holding-after-first-rise');
        await undo(page); await shot(page, 'holding-first-rise-undo'); await act(page, 'board');
        for (const id of ['map-shallows', 'map-stone', 'board', 'map-harbor']) await act(page, id);
        await shot(page, 'holding-loaded-harbor');
        await act(page, 'unload'); if ((await state(page)).status !== 'won') throw Error('Holding rescue did not win');
        await page.waitForTimeout(500); await shot(page, 'holding-delivery');
        await undo(page); await shot(page, 'holding-delivery-undo');
        await act(page, 'unload'); await page.waitForTimeout(700);
      } else {
        for (const id of ['map-shallows', 'map-low-pier', 'board', 'map-east-buoy', 'map-west-buoy', 'map-harbor', 'map-bell-pier', 'board', 'map-harbor']) await act(page, id);
        await shot(page, 'bellwater-loaded-harbor');
        await act(page, 'unload'); if ((await state(page)).status !== 'won') throw Error('Bellwater rescue did not win');
        await page.waitForTimeout(500); await shot(page, 'bellwater-delivery');
      }
      await recordVideo(page, `${cove}-selection-rescue`);
    } else await page.close();
    await context.close();
  }
  for (const width of [844, 780]) {
    const context = await browser.newContext({ viewport: { width, height: 390 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
    const page = await ready(context, 'bellwater');
    await measureIdle(page, 'bellwater', `phone${width}x390`);
    if (!perfOnly && finalUI) {
      if (await page.locator('#sound-toggle').getAttribute('aria-pressed') === 'false') await activate(page, 'sound-toggle', true);
      await shot(page, `phone-${width}-ordinary`);
      await select(page, 'harbor', true); await shot(page, `phone-${width}-current-harbor`);
      await select(page, 'low-pier', true); await shot(page, `phone-${width}-remote-low-pier`);
      for (const id of ['map-shallows', 'map-low-pier', 'board', 'map-east-buoy', 'map-west-buoy', 'map-harbor', 'map-bell-pier', 'board', 'map-harbor']) await act(page, id, true);
      await shot(page, `phone-${width}-loaded-harbor`);
      await act(page, 'unload', true); if ((await state(page)).status !== 'won') throw Error(`Phone${width} rescue did not win`);
    }
    await context.close();
  }
  const afterHashes = Object.fromEntries(runtimeFiles.map((path) => [path, hash(readFileSync(resolve(sourceRoot, path)))]));
  if (JSON.stringify(afterHashes) !== JSON.stringify(runtimeHashes)) throw Error('Runtime source changed during capture');
  report.sourceUnchangedAcrossExecution = true;
  report.environment = { os: 'Windows 11 Pro', node: process.version, browser: browser.version(), renderer: 'Headless Chromium SwiftShader; DPR1; desktop mouse and emulated phone touch; no physical-device claim', baseURL };
} catch (error) {
  report.errors.push({ at: new Date().toISOString(), error: error.stack });
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  writeFileSync(`${output}/capture-manifest.json`, JSON.stringify(report, null, 2));
  await browser.close();
  console.log(JSON.stringify({ phase, runtimeHash, captures: report.captures.length, measurements: report.measurements.map(({ cove, label, count, medianMs, p95Ms, before }) => ({ cove, label, count, medianMs, p95Ms, canvas: before.canvas })), errors: report.errors }));
}
