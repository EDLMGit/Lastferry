import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { relative, resolve } from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => arg.replace(/^--/, '').split('=')),
);
const base = args.base ?? 'http://127.0.0.1:5200';
const out = args.output ?? 'reviews/homecoming/recording';
const root = resolve(args.root ?? '.');
const width = Number(args.width ?? 844),
  height = Number(args.height ?? 390);
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
  sourceKind: 'working tree',
  command: [process.execPath, ...process.argv.slice(1)],
  capturedAt: new Date().toISOString(),
};
mkdirSync(`${out}/raw`, { recursive: true });
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
const page = await context.newPage(),
  errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const result = {
  sourceHash: source.hash,
  sourceHead: source.head,
  startedAt: new Date().toISOString(),
  actions: [],
  observations: [],
  screenshots: [],
  errors,
};
const observe = async (label) => {
  const value = await page.evaluate((label) => {
    const api = window.__LAST_FERRY__;
    return {
      label,
      at: performance.now(),
      state: api.getState(),
      homecoming: api.getHomecomingStatus(),
      motion: api.getMotionStatus(),
      audio: api.getAudioStatus(),
      metrics: api.getMetrics(),
      frame: api.getFrameStatus(),
    };
  }, label);
  result.observations.push(value);
  return value;
};
const capture = async (label) => {
  const path = `${out}/${label}.png`;
  await page.screenshot({ path });
  result.screenshots.push({ path, sha256: hash(readFileSync(path)), ...(await observe(label)) });
};
const tap = (id) => page.locator(`#${id}`).tap();
const idle = () =>
  page.waitForFunction(
    () => document.querySelector('#seascape').getAttribute('aria-busy') === 'false',
  );
const action = async (id) => {
  const before = await observe(`${id}-before`);
  await tap(id);
  if (id.startsWith('map-')) await tap('sail');
  else await tap('commit');
  await idle();
  const after = await observe(`${id}-after`);
  if (after.state.turn !== before.state.turn + 1)
    throw Error(`${id} did not advance exactly one action`);
  result.actions.push({ id, before, after });
  await page.waitForTimeout(250);
};
let video;
try {
  await page.goto(`${base}/?cove=holding-pier`);
  await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 4);
  await idle();
  await tap('map-stone');
  await page.keyboard.press('Escape');
  await page.evaluate(() => {
    const api = window.__LAST_FERRY__,
      scene = document.querySelector('canvas').captureStream(24),
      audio = api.captureAudioStream();
    if (!audio || !audio.getAudioTracks().length)
      throw Error('Runtime master audio capture unavailable');
    const stream = new MediaStream([...scene.getVideoTracks(), ...audio.getAudioTracks()]);
    const mimeType = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ].find((mime) => MediaRecorder.isTypeSupported(mime));
    if (!mimeType) throw Error('No supported WebM MediaRecorder format');
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 1800000,
      audioBitsPerSecond: 192000,
    });
    const recording = {
      recorder,
      scene,
      chunks: [],
      samples: [],
      startedAt: performance.now(),
      running: true,
      previous: 0,
      mimeType,
    };
    recorder.ondataavailable = (event) => {
      if (event.data.size) recording.chunks.push(event.data);
    };
    const sample = () => {
      if (!recording.running) return;
      const now = performance.now();
      if (now - recording.previous >= 80) {
        recording.samples.push({
          wallMs: now - recording.startedAt,
          state: api.getState(),
          homecoming: api.getHomecomingStatus(),
          audio: api.getAudioStatus(),
          metrics: api.getMetrics(),
        });
        recording.previous = now;
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
    recorder.start(500);
    window.__homecomingRecording = recording;
  });
  await capture('ordinary');
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
  ])
    await action(id);
  const won = await observe('first-arrival');
  if (
    won.state.status !== 'won' ||
    won.audio.arrivalEventCount !== 1 ||
    won.homecoming.celebrations !== 1
  )
    throw Error(
      'Actual UI rescue did not produce exactly one visible arrival and finite celebration',
    );
  await capture('visible-arrival');
  await page.waitForFunction(() => !window.__LAST_FERRY__.getHomecomingStatus().finite);
  await capture('settled-ending');
  await tap('terminal-settings');
  await capture('settings');
  await page.waitForTimeout(2000);
  await tap('settings-back');
  await capture('ending-after-settings');
  await tap('terminal-undo');
  await idle();
  const restored = await observe('undo-restored');
  if (
    restored.state.status !== 'playing' ||
    restored.homecoming.active ||
    restored.homecoming.camera.factor !== 1
  )
    throw Error('Terminal Undo left stale homecoming presentation');
  await capture('restored-play');
  await page.waitForTimeout(800);
  await action('unload');
  await page.waitForFunction(() => !window.__LAST_FERRY__.getHomecomingStatus().finite);
  await capture('redelivery');
  await page.waitForTimeout(11000);
  const end = await observe('redelivery-sweep-held');
  if (
    end.audio.arrivalEventCount !== 2 ||
    end.audio.deliveryCount !== 2 ||
    end.audio.victoryTarget !== 0.5 ||
    end.homecoming.celebrations !== 2
  )
    throw Error('Redelivery changed accepted sound/event ownership or persistent mix');
  const exported = await page.evaluate(async () => {
    const record = window.__homecomingRecording;
    record.running = false;
    const stopped = new Promise((resolve) => (record.recorder.onstop = resolve));
    record.recorder.stop();
    await stopped;
    record.scene.getTracks().forEach((track) => track.stop());
    const blob = new Blob(record.chunks, { type: record.mimeType });
    const data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(';base64,')[1]);
      reader.readAsDataURL(blob);
    });
    return {
      data,
      bytes: blob.size,
      mimeType: record.mimeType,
      wallMs: performance.now() - record.startedAt,
      samples: record.samples,
    };
  });
  const bytes = Buffer.from(exported.data, 'base64');
  if (bytes.length !== exported.bytes) throw Error('Runtime capture export byte mismatch');
  const path = `${out}/raw/holding-homecoming-runtime-audio.webm`,
    samplesPath = `${out}/raw/presentation-samples.json`;
  writeFileSync(path, bytes);
  writeFileSync(samplesPath, JSON.stringify(exported.samples, null, 2));
  result.recording = {
    path,
    sha256: hash(bytes),
    bytes: bytes.length,
    mimeType: exported.mimeType,
    wallMs: exported.wallMs,
    samplesPath,
    samples: exported.samples.length,
    audio:
      'Actual unchanged runtime master capture; export gain 1; no normalization, substitute audio, cuts or time edits.',
  };
  result.sourceUnchanged = JSON.stringify(files) === JSON.stringify(snapshot());
  if (!result.sourceUnchanged) throw Error('Runtime source changed during capture');
  if (errors.length) throw Error(`Browser errors: ${errors.join('; ')}`);
  result.outcome = 'passed';
} catch (error) {
  result.outcome = 'failed';
  result.failure = String(error.stack ?? error);
  process.exitCode = 1;
} finally {
  result.environment = {
    browser: browser.version(),
    node: process.version,
    platform: process.platform,
    viewport: { width, height },
    dpr: 1,
    input: 'emulated touch',
    renderer: 'SwiftShader',
    base,
  };
  result.method =
    'One uninterrupted real-interface nine-action rescue, Settings → Back → terminal Undo → redelivery with 11-second won hold. Read-only source/presentation diagnostics; no state injection. Native canvas and actual runtime master recorded together. Separate whole-interface Playwright video is silent and shows dialog controls. Software-renderer capture does not establish physical-phone performance or acoustic listening.';
  video = page.video();
  await context.close();
  if (video) {
    const path = `${out}/raw/holding-homecoming-full-interface-silent.webm`;
    await video.saveAs(path);
    result.fullInterfaceVideo = { path, sha256: hash(readFileSync(path)), audio: false };
  }
  await browser.close();
  result.finishedAt = new Date().toISOString();
  writeFileSync(`${out}/capture.json`, JSON.stringify(result, null, 2));
  console.log(
    JSON.stringify({
      sourceHash: source.hash,
      outcome: result.outcome,
      recording: result.recording?.path,
      fullInterfaceVideo: result.fullInterfaceVideo?.path,
      failure: result.failure,
    }),
  );
}
