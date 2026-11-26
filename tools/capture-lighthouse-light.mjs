import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => arg.replace(/^--/, '').split('=')),
);
const base = args.base ?? 'http://127.0.0.1:5200';
const root = resolve(args.root ?? '.');
const width = Number(args.width ?? 844),
  height = Number(args.height ?? 390);
const phase = args.phase ?? 'candidate',
  cove = args.cove ?? 'holding-pier';
const out = args.output ?? `reviews/lighthouse-light/${phase}/${width}x${height}`;
const record = args.record !== 'false',
  cycleCount = Number(args.cycles ?? 3);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const compact = (value) => {
  if (Array.isArray(value)) return value.map(compact);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      if (key === 'frame' && item?.canvas)
        return [
          key,
          Object.fromEntries(
            [
              'canvas',
              'camera',
              'boat',
              'lighthouse',
              'lantern',
              'lanternCore',
              'passengers',
              'nodes',
            ].map((name) => [name, item[name]]),
          ),
        ];
      if (key === 'audio' && typeof item?.arrivalEventCount === 'number')
        return [
          key,
          Object.fromEntries(
            [
              'muted',
              'activated',
              'hidden',
              'unavailable',
              'error',
              'contextState',
              'contextCount',
              'schedulerCount',
              'arrivalEventCount',
              'deliveryCount',
              'arrivalVoicesPlayed',
              'arrivalVoicesSkipped',
              'victorySettled',
              'victoryTarget',
              'victoryGain',
              'arrangementTarget',
              'arrangementGain',
              'effectiveMusicTarget',
              'lastVictoryMixChange',
              'lastArrival',
              'masterGain',
            ].map((name) => [name, item[name]]),
          ),
        ];
      return [key, compact(item)];
    }),
  );
};
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
const files = snapshot(),
  source = {
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    status: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
    files,
    hash: hash(JSON.stringify(files)),
    root,
    sourceKind: 'working tree',
    command: [process.execPath, ...process.argv.slice(1)],
    capturedAt: new Date().toISOString(),
    harnessHash: hash(readFileSync(new URL(import.meta.url))),
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
  hasTouch: width < 1000,
  isMobile: width < 1000,
  ...(record ? { recordVideo: { dir: `${out}/raw`, size: { width, height } } } : {}),
});
const page = await context.newPage(),
  errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const result = {
  phase,
  cove,
  sourceHash: source.hash,
  sourceHead: source.head,
  startedAt: new Date().toISOString(),
  actions: [],
  observations: [],
  screenshots: [],
  errors,
};
const read = (label) =>
  page.evaluate((label) => {
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
const observe = async (label) => {
  const value = await read(label);
  result.observations.push(value);
  return value;
};
const capture = async (label, method = 'natural runtime') => {
  const path = `${out}/${label}.png`;
  await page.screenshot({ path });
  result.screenshots.push({
    path,
    sha256: hash(readFileSync(path)),
    method,
    ...(await observe(label)),
  });
};
const activate = async (id) => {
  if ((id === 'board' || id === 'unload') && !(await page.locator(`#${id}`).isVisible())) {
    const current = await page.locator('.map-target[aria-current="location"]').getAttribute('id');
    if (!current) throw Error('No current map location');
    if (width < 1000) await page.locator(`#${current}`).tap();
    else await page.locator(`#${current}`).click();
  }
  if (width < 1000) await page.locator(`#${id}`).tap();
  else await page.locator(`#${id}`).click();
};
const idle = () =>
  page.waitForFunction(
    () => document.querySelector('#seascape').getAttribute('aria-busy') === 'false',
  );
const action = async (id) => {
  const before = await read(`${id}-before`);
  await activate(id);
  await activate(id.startsWith('map-') ? 'sail' : 'commit');
  await idle();
  const after = await read(`${id}-after`);
  if (after.state.turn !== before.state.turn + 1)
    throw Error(`${id} did not advance exactly one action`);
  result.actions.push({ id, before, after });
  await page.waitForTimeout(250);
};
const frames = (label) =>
  page.evaluate(async (label) => {
    const api = window.__LAST_FERRY__,
      intervals = [];
    let previous = await new Promise(requestAnimationFrame);
    for (let i = 0; i < 120; i++) {
      const now = await new Promise(requestAnimationFrame);
      intervals.push(now - previous);
      previous = now;
    }
    const sorted = [...intervals].sort((a, b) => a - b);
    return {
      label,
      intervals,
      count: intervals.length,
      median: sorted[60],
      p95: sorted[114],
      maximum: sorted.at(-1),
      metrics: api.getMetrics(),
      resources: api.getHomecomingStatus().resources,
    };
  }, label);
const startRuntime = () =>
  page.evaluate(() => {
    const api = window.__LAST_FERRY__,
      scene = document.querySelector('canvas').captureStream(24),
      audio = api.captureAudioStream();
    if (!audio?.getAudioTracks().length) throw Error('Runtime audio capture unavailable');
    const stream = new MediaStream([...scene.getVideoTracks(), ...audio.getAudioTracks()]);
    const mimeType = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ].find((mime) => MediaRecorder.isTypeSupported(mime));
    if (!mimeType) throw Error('No WebM MediaRecorder');
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 1800000,
      audioBitsPerSecond: 192000,
    });
    const value = {
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
      if (event.data.size) value.chunks.push(event.data);
    };
    const sample = () => {
      if (!value.running) return;
      const now = performance.now();
      if (now - value.previous >= 80) {
        value.samples.push({
          wallMs: now - value.startedAt,
          state: api.getState(),
          homecoming: api.getHomecomingStatus(),
          audio: api.getAudioStatus(),
          metrics: api.getMetrics(),
        });
        value.previous = now;
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
    recorder.start(500);
    window.__lighthouseRecording = value;
  });
const stopRuntime = async () => {
  const exported = await page.evaluate(async () => {
    const value = window.__lighthouseRecording;
    value.running = false;
    const stopped = new Promise((resolve) => (value.recorder.onstop = resolve));
    value.recorder.stop();
    await stopped;
    value.scene.getTracks().forEach((track) => track.stop());
    const blob = new Blob(value.chunks, { type: value.mimeType });
    const data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(';base64,')[1]);
      reader.readAsDataURL(blob);
    });
    return {
      data,
      bytes: blob.size,
      mimeType: value.mimeType,
      wallMs: performance.now() - value.startedAt,
      samples: value.samples,
    };
  });
  const bytes = Buffer.from(exported.data, 'base64');
  if (bytes.length !== exported.bytes) throw Error('Runtime export byte mismatch');
  const path = `${out}/raw/${cove}-lighthouse-runtime-audio.webm`,
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
      'Actual unchanged runtime master at export gain 1; no normalization, substitute audio, cuts or time edits.',
  };
};
try {
  await page.goto(`${base}/?cove=${cove}`);
  await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 4);
  await idle();
  if (
    !(await page.evaluate(
      () => typeof window.__LAST_FERRY__.setLighthouseComparisonPhase === 'function',
    ))
  )
    throw Error('Matched comparison phase hook missing');
  await activate(cove === 'holding-pier' ? 'map-stone' : 'map-harbor');
  await page.keyboard.press('Escape');
  if (record) await startRuntime();
  await capture('ordinary');
  result.ordinaryFrameSample = await frames('ordinary-warmed');
  const approach =
    cove === 'holding-pier'
      ? [
          'unload',
          'map-shallows',
          'map-rabbit-pier',
          'board',
          'map-shallows',
          'map-stone',
          'board',
          'map-harbor',
        ]
      : cove === 'bellwater'
        ? [
            'map-shallows',
            'map-low-pier',
            'board',
            'map-east-buoy',
            'map-west-buoy',
            'map-harbor',
            'map-bell-pier',
            'board',
            'map-harbor',
          ]
        : ['map-sheep-pier', 'board', 'wait', 'wait', 'map-cut', 'map-harbor'];
  for (const id of approach) await action(id);
  await action('unload');
  await capture('visible-arrival');
  await page.waitForFunction(() => !window.__LAST_FERRY__.getHomecomingStatus().finite);
  const start = await observe('natural-sweep-start');
  if (
    start.state.status !== 'won' ||
    start.audio.arrivalEventCount !== 1 ||
    start.homecoming.celebrations !== 1
  )
    throw Error('Actual UI rescue ownership mismatch');
  result.naturalSweep = { start };
  await page.waitForFunction(
    (angle) =>
      window.__LAST_FERRY__.getHomecomingStatus().sweep.angle - angle >= Math.PI * 2 + 0.02,
    start.homecoming.sweep.angle,
    { timeout: 70000 },
  );
  const end = await observe('natural-sweep-end');
  result.naturalSweep.end = end;
  result.naturalSweep.wallMs = end.at - start.at;
  result.naturalSweep.radians = end.homecoming.sweep.angle - start.homecoming.sweep.angle;
  await capture('natural-full-rotation-ending');
  result.wonFrameSample = await frames('won-warmed');
  if (record) await stopRuntime();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    await page.evaluate(
      (value) => window.__LAST_FERRY__.setLighthouseComparisonPhase(value),
      angle,
    );
    await page.waitForTimeout(120);
    await capture(
      `matched-angle-${i * 45}`,
      'Diagnostic frozen beam phase only; actual UI won state and settled accepted camera; water remains natural runtime',
    );
  }
  await page.evaluate(() => window.__LAST_FERRY__.setLighthouseComparisonPhase(null));
  await page.waitForTimeout(200);
  const beforeSettings = await observe('before-settings');
  await activate('terminal-settings');
  await page.waitForTimeout(650);
  await activate('settings-back');
  await page.waitForTimeout(250);
  const afterSettings = await observe('after-settings');
  if (
    afterSettings.homecoming.sweep.startedAt !== beforeSettings.homecoming.sweep.startedAt ||
    afterSettings.homecoming.celebrations !== 1 ||
    afterSettings.audio.arrivalEventCount !== 1 ||
    afterSettings.audio.victoryTarget !== 0.5
  )
    throw Error('Settings replayed arrival or altered accepted quiet mix');
  await activate('cancel');
  await activate('menu');
  await activate('return-arrival');
  const returned = await observe('return-arrival');
  if (
    returned.homecoming.sweep.startedAt !== beforeSettings.homecoming.sweep.startedAt ||
    returned.audio.arrivalEventCount !== 1
  )
    throw Error('Reopening arrival reset sweep or replayed sound');
  await activate('terminal-settings');
  await page.locator('#motion-preference').selectOption('reduced');
  await activate('settings-back');
  const reduced = await observe('reduced');
  await page.waitForTimeout(600);
  const reducedLater = await observe('reduced-held');
  if (
    !reduced.motion.reduced ||
    reduced.homecoming.sweep.angle !== reducedLater.homecoming.sweep.angle ||
    reduced.homecoming.camera.factor !== 1
  )
    throw Error('Reduced light/camera did not stay still');
  await capture('reduced-ending');
  await activate('terminal-settings');
  await page.locator('#motion-preference').selectOption('device');
  await activate('settings-back');
  await page.waitForTimeout(300);
  const resources = (await observe('resources-warmed')).homecoming.resources;
  result.repeatedCycleResources = [];
  for (let i = 0; i < cycleCount; i++) {
    await activate('terminal-undo');
    await idle();
    const restored = await observe(`undo-${i + 1}`);
    if (
      restored.state.status !== 'playing' ||
      restored.homecoming.active ||
      restored.homecoming.camera.factor !== 1 ||
      restored.homecoming.sweep.visible
    )
      throw Error('Undo retained won presentation');
    if (i === 0) await capture('restored-play');
    await action('unload');
    await page.waitForFunction(() => !window.__LAST_FERRY__.getHomecomingStatus().finite);
    await page.waitForTimeout(300);
    const again = await observe(`redelivery-${i + 1}`);
    result.repeatedCycleResources.push(again.homecoming.resources);
    if (JSON.stringify(again.homecoming.resources) !== JSON.stringify(resources))
      throw Error('Resource counts changed after warm win/Undo cycle');
    if (again.audio.arrivalEventCount !== i + 2 || again.audio.victoryTarget !== 0.5)
      throw Error('Redelivery audio count or persistent mix mismatch');
  }
  if (errors.length) throw Error(`Browser page errors: ${errors.join('; ')}`);
  result.sourceUnchanged = JSON.stringify(files) === JSON.stringify(snapshot());
  if (!result.sourceUnchanged) throw Error('Runtime source changed during capture');
  result.outcome = 'passed';
} catch (error) {
  result.outcome = 'failed';
  result.failure = String(error.stack ?? error);
  process.exitCode = 1;
} finally {
  const video = page.video();
  result.environment = {
    browser: browser.version(),
    node: process.version,
    platform: process.platform,
    viewport: { width, height },
    dpr: 1,
    input: width < 1000 ? 'emulated touch' : 'mouse',
    renderer: 'SwiftShader',
    base,
  };
  result.method =
    'Actual UI rescue, one uninterrupted full natural sweep before diagnostic phase captures, unchanged runtime audio when recorded, matched beam angles, normal/reduced and restored play, shared Settings and repeated actual UI Undo/redelivery. Phase override affects only comparison stills. Frame intervals are a noisy same-environment sample, not native GPU or Android performance evidence.';
  await context.close();
  if (video) {
    const path = `${out}/raw/${cove}-lighthouse-full-interface-silent.webm`;
    await video.saveAs(path);
    result.fullInterfaceVideo = { path, sha256: hash(readFileSync(path)), audio: false };
  }
  await browser.close();
  result.finishedAt = new Date().toISOString();
  const fullPath = `${out}/raw/capture-full.json`,
    fullBytes = JSON.stringify(result, null, 2);
  writeFileSync(fullPath, fullBytes);
  writeFileSync(
    `${out}/capture.json`,
    JSON.stringify(
      {
        ...compact(result),
        rawObservations: {
          path: fullPath,
          sha256: hash(fullBytes),
          available: 'Local ignored file; not present in a fresh Git clone.',
          derivation:
            'Repeated frame bounds and detailed audio diagnostics condensed; source identity, actions, state, presentation, media hashes and full 120-frame interval samples preserved.',
        },
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({
      phase,
      cove,
      viewport: { width, height },
      sourceHash: source.hash,
      outcome: result.outcome,
      naturalSweep: result.naturalSweep && {
        wallMs: result.naturalSweep.wallMs,
        radians: result.naturalSweep.radians,
      },
      recording: result.recording?.path,
      failure: result.failure,
    }),
  );
}
