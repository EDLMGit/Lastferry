import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, relative } from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => arg.replace(/^--/, '').split('=')),
);
const base = args.base ?? 'http://127.0.0.1:5193';
const out = args.output ?? 'reviews/transfer-audio/capture';
const root = resolve(args.root ?? '.');
const width = Number(args.width ?? 844),
  height = Number(args.height ?? 390);
mkdirSync(`${out}/raw`, { recursive: true });
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const filesIn = (folder) =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(folder, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  });
const paths = ['src', 'data', 'public']
  .filter((path) => existsSync(resolve(root, path)))
  .flatMap((path) => filesIn(resolve(root, path)))
  .concat(
    ['index.html', 'package.json', 'package-lock.json', 'vite.config.ts'].map((path) =>
      resolve(root, path),
    ),
  )
  .sort();
const snapshot = () =>
  Object.fromEntries(
    paths.map((path) => [relative(root, path).replaceAll('\\', '/'), hash(readFileSync(path))]),
  );
const files = snapshot();
const source = {
  head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  status: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
  files,
  hash: hash(JSON.stringify(files)),
  root,
  capturedAt: new Date().toISOString(),
};
writeFileSync(`${out}/source.json`, JSON.stringify(source, null, 2));
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
  hasTouch: true,
  isMobile: true,
  recordVideo: { dir: `${out}/raw`, size: { width, height } },
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const results = {
  sourceHash: source.hash,
  sourceHead: source.head,
  startedAt: new Date().toISOString(),
  actions: [],
  captures: [],
  errors,
};
const idle = () =>
  page.waitForFunction(
    () => document.querySelector('#seascape').getAttribute('aria-busy') === 'false',
  );
const apiState = () => page.evaluate(() => window.__LAST_FERRY__.getState());
const tap = (id) => page.locator(`#${id}`).tap();
const select = async (id) => {
  await tap(`map-${id}`);
  await page.locator('#local-context').waitFor({ state: 'visible' });
};
const capture = async (label) => {
  const path = `${out}/${label}.png`;
  await page.screenshot({ path });
  results.captures.push({
    label,
    path,
    sha256: hash(readFileSync(path)),
    state: await apiState(),
    audio: await page.evaluate(() => window.__LAST_FERRY__.getAudioStatus()),
  });
};
const action = async (id) => {
  const before = await apiState();
  const beforeAudio = await page.evaluate(() => window.__LAST_FERRY__.getAudioStatus());
  if (id.startsWith('map-')) {
    await select(id.slice(4));
    await tap('sail');
  } else {
    if ((id === 'board' || id === 'unload') && !(await page.locator(`#${id}`).isVisible()))
      await page.locator('.map-target[aria-current="location"]').tap();
    await tap(id);
    if (id === 'board' && before.turn === 3) {
      if (!results.captures.some((capture) => capture.label === 'phone-critical-boarding'))
        await capture('phone-critical-boarding');
      await page.waitForTimeout(750);
    }
    await tap('commit');
  }
  await idle();
  const after = await apiState();
  if (after.turn !== before.turn + 1) throw Error(`Action ${id} did not advance exactly once`);
  const afterAudio = await page.evaluate(() => window.__LAST_FERRY__.getAudioStatus());
  results.actions.push({
    id,
    before,
    after,
    audio: afterAudio,
    transferPlayed: afterAudio.transferPlayed - beforeAudio.transferPlayed,
  });
  await page.waitForTimeout(450);
};
let fullInterfaceVideo = page.video();
try {
  await page.goto(`${base}/?cove=holding-pier`);
  await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 4);
  await idle();
  await select('stone');
  await page.waitForFunction(
    () => window.__LAST_FERRY__.getAudioStatus().contextState === 'running',
  );
  await page.evaluate(() => {
    const api = window.__LAST_FERRY__;
    const scene = document.querySelector('#world canvas').captureStream(25);
    const master = api.captureAudioStream();
    const stream = new MediaStream([...scene.getVideoTracks(), ...master.getAudioTracks()]);
    const mimeType = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ].find((type) => MediaRecorder.isTypeSupported(type));
    if (!mimeType) throw Error('No audio/video MediaRecorder WebM codec');
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 1800000,
      audioBitsPerSecond: 128000,
    });
    const record = {
      recorder,
      scene,
      chunks: [],
      samples: [],
      start: api.getAudioStatus(),
      startedAt: performance.now(),
      timer: 0,
    };
    recorder.ondataavailable = (event) => {
      if (event.data.size) record.chunks.push(event.data);
    };
    record.timer = setInterval(
      () =>
        record.samples.push({
          wallMs: performance.now() - record.startedAt,
          state: api.getState(),
          audio: api.getAudioStatus(),
          transition: api.getTransitionStatus(),
          contacts: api.getTransferStatus?.().last ?? null,
        }),
      100,
    );
    recorder.start(500);
    window.__transferRecording = record;
  });
  await capture('phone-start');
  await page.waitForTimeout(1000);
  for (const id of [
    'unload',
    'map-shallows',
    'map-rabbit-pier',
    'board',
    'map-shallows',
    'map-stone',
    'board',
    'map-harbor',
    'unload',
  ]) {
    await action(id);
    const place = results.actions.at(-1).before?.boatNodeId;
    if (
      (id === 'unload' && (place === 'stone' || place === 'harbor')) ||
      (id === 'board' && place === 'rabbit-pier')
    ) {
      for (let retry = 0; retry < 2 && results.actions.at(-1).transferPlayed === 0; retry++) {
        const before = await apiState();
        await tap(before.status === 'won' ? 'terminal-undo' : 'undo');
        await idle();
        results.actions.push({
          id: 'undo-for-contact-replay',
          before,
          after: await apiState(),
          audio: await page.evaluate(() => window.__LAST_FERRY__.getAudioStatus()),
        });
        await action(id);
      }
    }
    if ((await apiState()).turn === 4) {
      await capture('phone-after-rise');
      const boundary = await apiState();
      await tap('undo');
      await idle();
      results.actions.push({
        id: 'undo-boundary',
        after: await apiState(),
        audio: await page.evaluate(() => window.__LAST_FERRY__.getAudioStatus()),
      });
      if ((await apiState()).turn !== 3) throw Error('Tide Undo did not restore action 3');
      await action('board');
      if (JSON.stringify(await apiState()) !== JSON.stringify(boundary))
        throw Error('Tide Undo/replay state differs');
    }
  }
  const won = await apiState();
  if (won.status !== 'won' || won.turn !== 9) throw Error('Nine-action rescue did not finish');
  await capture('phone-success');
  await page.waitForTimeout(4500);
  const recorded = await page.evaluate(async () => {
    const record = window.__transferRecording;
    clearInterval(record.timer);
    const stopped = new Promise((resolve) => (record.recorder.onstop = resolve));
    record.recorder.stop();
    await stopped;
    record.scene.getTracks().forEach((track) => track.stop());
    const blob = new Blob(record.chunks, { type: record.recorder.mimeType });
    const data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(';base64,')[1]);
      reader.readAsDataURL(blob);
    });
    return {
      data,
      samples: record.samples,
      start: record.start,
      end: window.__LAST_FERRY__.getAudioStatus(),
      wallMs: performance.now() - record.startedAt,
      bytes: blob.size,
      mimeType: record.recorder.mimeType,
    };
  });
  const bytes = Buffer.from(recorded.data, 'base64');
  if (bytes.length !== recorded.bytes)
    throw Error('Exported media byte length differs from the runtime Blob');
  const path = `${out}/raw/holding-transfer-runtime-audio.webm`;
  writeFileSync(path, bytes);
  const { data, samples, ...metadata } = recorded;
  const tracePath = `${out}/raw/runtime-samples.json`,
    trace = JSON.stringify(samples, null, 2);
  writeFileSync(tracePath, trace);
  results.recording = {
    path,
    sha256: hash(bytes),
    ...metadata,
    samples: samples.length,
    trace: { path: tracePath, sha256: hash(trace) },
    transferHistory: await page.evaluate(() => window.__LAST_FERRY__.getTransferStatus()),
  };
  results.method =
    'One uninterrupted actual canvas.captureStream video + actual Web Audio master stream recorded together by MediaRecorder: runtime procedural music/effects, no offline/replacement audio, time edits or game-state injection. Canvas recording excludes DOM controls. Separate full-interface Playwright video is silent and covers the same UI session. Actual UI Undo/replay is bounded to two attempts when a required contact is stale; every attempt is listed.';
  results.listening =
    'No speaker/headphone acoustic listening capability established in this agent workflow. Runtime audio is captured for human listening; diagnostics and decoded sample levels do not establish perceived mix quality.';
  results.finalState = won;
  results.sourceUnchanged = JSON.stringify(files) === JSON.stringify(snapshot());
  if (!results.sourceUnchanged) throw Error('Runtime source changed during capture');
  if (errors.length) throw Error(`Browser errors: ${errors.join('; ')}`);
  if (recorded.end.contextCount !== 1 || recorded.end.droppedTones !== 0)
    throw Error('Audio context/music source anomaly');
  for (const [kind, place] of [
    ['unload', 'stone'],
    ['board', 'rabbit-pier'],
    ['unload', 'harbor'],
  ]) {
    if (
      !results.actions.some(
        (action) =>
          action.id === kind && action.before?.boatNodeId === place && action.transferPlayed > 0,
      )
    )
      throw Error(`No played runtime contact captured for ${kind} at ${place}`);
  }
  fullInterfaceVideo = page.video();
} catch (error) {
  results.failure = String(error.stack ?? error);
  process.exitCode = 1;
} finally {
  results.environment = {
    browser: browser.version(),
    node: process.version,
    platform: process.platform,
    viewport: { width, height },
    dpr: 1,
    input: 'emulated touch',
    renderer: 'SwiftShader',
    base,
  };
  await context.close();
  if (fullInterfaceVideo) {
    const path = `${out}/raw/holding-full-interface-silent.webm`;
    await fullInterfaceVideo.saveAs(path);
    results.fullInterfaceVideo = { path, sha256: hash(readFileSync(path)), audio: false };
  }
  await browser.close();
  results.finishedAt = new Date().toISOString();
  writeFileSync(`${out}/capture.json`, JSON.stringify(results, null, 2));
  console.log(
    JSON.stringify({
      captures: results.captures.map(({ path }) => path),
      recording: results.recording?.path,
      fullInterfaceVideo: results.fullInterfaceVideo?.path,
      failure: results.failure,
    }),
  );
}
