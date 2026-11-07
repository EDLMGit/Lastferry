import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, relative } from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => arg.replace(/^--/, '').split('=')),
);
const base = args.base ?? 'http://127.0.0.1:5199';
const out = args.output ?? 'reviews/victory-mix/before';
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
  head: args.revision ?? execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  status: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
  files,
  hash: hash(JSON.stringify(files)),
  root,
  sourceKind: args.revision ? 'isolated git archive' : 'working tree',
  command: [process.execPath, ...process.argv.slice(1)],
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
await context.addInitScript(() => {
  const gains = [],
    edges = [],
    automation = [],
    nodes = new WeakMap(),
    parameters = new WeakMap();
  let sequence = 0;
  const identify = (node) => {
    if (!nodes.has(node)) nodes.set(node, `${node.constructor.name}-${++sequence}`);
    return nodes.get(node);
  };
  const createGain = BaseAudioContext.prototype.createGain;
  BaseAudioContext.prototype.createGain = function (...values) {
    const node = createGain.apply(this, values),
      id = identify(node);
    gains.push({ node, id, at: this.currentTime });
    parameters.set(node.gain, { id, context: this });
    return node;
  };
  const connect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (...values) {
    const result = connect.apply(this, values);
    if (values[0] instanceof AudioNode)
      edges.push({ from: identify(this), to: identify(values[0]), at: this.context.currentTime });
    return result;
  };
  for (const name of [
    'setValueAtTime',
    'linearRampToValueAtTime',
    'exponentialRampToValueAtTime',
    'cancelScheduledValues',
    'cancelAndHoldAtTime',
  ]) {
    const operation = AudioParam.prototype[name];
    if (typeof operation !== 'function') continue;
    AudioParam.prototype[name] = function (...values) {
      const parameter = parameters.get(this);
      if (parameter)
        automation.push({
          id: parameter.id,
          operation: name,
          values,
          at: parameter.context.currentTime,
          currentValue: this.value,
        });
      return operation.apply(this, values);
    };
  }
  window.__victoryGraph = {
    status: () => ({
      gains: gains.slice(0, 10).map(({ node, id, at }) => ({ id, at, value: node.gain.value })),
      edges,
      automation,
    }),
    values: () => gains.slice(0, 10).map(({ node, id }) => ({ id, value: node.gain.value })),
  };
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const results = {
  sourceHash: source.hash,
  sourceHead: source.head,
  startedAt: new Date().toISOString(),
  actions: [],
  observations: [],
  captures: [],
  errors,
};
const idle = () =>
  page.waitForFunction(
    () => document.querySelector('#seascape').getAttribute('aria-busy') === 'false',
  );
const apiState = () => page.evaluate(() => window.__LAST_FERRY__.getState());
const audio = () => page.evaluate(() => window.__LAST_FERRY__.getAudioStatus());
const tap = (id) => page.locator(`#${id}`).tap();
const observe = async (label) => {
  const observation = await page.evaluate((name) => {
    const api = window.__LAST_FERRY__;
    return {
      label: name,
      wallMs: performance.now() - (window.__victoryRecording?.startedAt ?? performance.now()),
      state: api.getState(),
      audio: api.getAudioStatus(),
      transition: api.getTransitionStatus(),
      gains: window.__victoryGraph.values(),
    };
  }, label);
  results.observations.push(observation);
  return observation;
};
const capture = async (label) => {
  const path = `${out}/${label}.png`;
  await page.screenshot({ path });
  results.captures.push({ label, path, sha256: hash(readFileSync(path)) });
};
const action = async (id, label = id) => {
  const before = await observe(`${label}-before`);
  if (id.startsWith('map-')) {
    await tap(id);
    await page.locator('#local-context').waitFor({ state: 'visible' });
    await tap('sail');
  } else {
    await tap(id);
    await tap('commit');
  }
  await idle();
  const after = await observe(`${label}-after`);
  if (after.state.turn !== before.state.turn + 1)
    throw Error(`Action ${id} did not advance exactly once`);
  results.actions.push({ id, label, before, after });
  await page.waitForTimeout(450);
};
const terminalUndo = async (label) => {
  const before = await observe(`${label}-before`);
  await tap('terminal-undo');
  await idle();
  const after = await observe(`${label}-after`);
  if (after.state.status !== 'playing' || after.state.turn !== 8)
    throw Error('Terminal Undo did not restore the Harbor state');
  results.actions.push({ id: 'terminal-undo', label, before, after });
  await page.waitForTimeout(1000);
  await observe(`${label}-restored`);
};
const holdWon = async (label) => {
  await page.waitForTimeout(11000);
  const result = await observe(`${label}-held-11s`);
  if (result.state.status !== 'won' || result.audio.arrivalSources !== 0)
    throw Error('Settled won hold did not finish after the arrival tail');
};
const redeliverAt = async (phase, label) => {
  await terminalUndo(`${label}-undo`);
  await tap('unload');
  const before = await observe(`${label}-preview`);
  if (before.audio.phaseSeconds > phase - 1.2)
    throw Error(`Missed target ${phase}s while at ${before.audio.phaseSeconds}s`);
  await page.waitForFunction(
    (target) => window.__LAST_FERRY__.getAudioStatus().phaseSeconds >= target,
    phase - 0.85,
    { timeout: 90000, polling: 20 },
  );
  const commit = await observe(`${label}-commit-before`);
  await tap('commit');
  await idle();
  const after = await observe(`${label}-after`);
  results.actions.push({ id: 'unload', label, before: commit, after });
  if (after.state.status !== 'won' || after.audio.deliveryCount !== results.arrivals + 1)
    throw Error(`${label} did not invoke exactly one new arrival`);
  results.arrivals++;
  await holdWon(label);
};
let video = page.video();
try {
  await page.goto(`${base}/?cove=holding-pier`);
  await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 4);
  await idle();
  await tap('map-stone');
  await page.waitForFunction(
    () => window.__LAST_FERRY__.getAudioStatus().contextState === 'running',
  );
  await page.evaluate(() => {
    const api = window.__LAST_FERRY__,
      scene = document.querySelector('#world canvas').captureStream(25),
      master = api.captureAudioStream();
    if (!master) throw Error('Runtime master capture stream unavailable');
    const stream = new MediaStream([...scene.getVideoTracks(), ...master.getAudioTracks()]),
      mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(
        (type) => MediaRecorder.isTypeSupported(type),
      );
    if (!mimeType) throw Error('No runtime audio/video MediaRecorder codec');
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 1500000,
      audioBitsPerSecond: 128000,
    });
    const record = {
      recorder,
      scene,
      chunks: [],
      samples: [],
      start: api.getAudioStatus(),
      startedAt: performance.now(),
      running: true,
      previousTime: 0,
      previousKey: '',
    };
    recorder.ondataavailable = (event) => {
      if (event.data.size) record.chunks.push(event.data);
    };
    const sample = () => {
      if (!record.running) return;
      const now = performance.now(),
        state = api.getState(),
        audio = api.getAudioStatus(),
        transition = api.getTransitionStatus(),
        key = JSON.stringify([
          state.turn,
          audio.deliveryCount,
          audio.pendingTerminal,
          audio.arrangement,
          audio.arrivalSources,
          audio.victorySettled,
        ]);
      if (key !== record.previousKey || now - record.previousTime >= 100) {
        record.samples.push({
          wallMs: now - record.startedAt,
          state,
          audio,
          transition,
          gains: window.__victoryGraph.values(),
        });
        record.previousTime = now;
        record.previousKey = key;
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
    recorder.start(500);
    window.__victoryRecording = record;
  });
  await capture('phone-start');
  await observe('recording-start');
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
  ])
    await action(id, id === 'unload' && (await apiState()).turn === 8 ? 'ordinary-arrival' : id);
  const won = await observe('first-won');
  if (won.state.status !== 'won' || won.state.turn !== 9 || won.audio.deliveryCount !== 1)
    throw Error('Nine-action actual UI rescue did not invoke one arrival');
  results.arrivals = 1;
  await capture('phone-success');
  await holdWon('ordinary-arrival');
  await redeliverAt(46.875, 'dense-arrival');
  await redeliverAt(74.4, 'phrase-return-arrival');
  const recorded = await page.evaluate(async () => {
    const record = window.__victoryRecording;
    record.running = false;
    const stopped = new Promise((resolve) => (record.recorder.onstop = resolve));
    record.recorder.stop();
    await stopped;
    record.scene.getTracks().forEach((track) => track.stop());
    const blob = new Blob(record.chunks, { type: record.recorder.mimeType }),
      data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(';base64,')[1]);
        reader.readAsDataURL(blob);
      });
    return {
      data,
      samples: record.samples,
      start: record.start,
      end: window.__LAST_FERRY__.getAudioStatus(),
      graph: window.__victoryGraph.status(),
      wallMs: performance.now() - record.startedAt,
      bytes: blob.size,
      mimeType: record.recorder.mimeType,
    };
  });
  const bytes = Buffer.from(recorded.data, 'base64');
  if (bytes.length !== recorded.bytes) throw Error('Runtime media export byte mismatch');
  const path = `${out}/raw/holding-runtime-audio.webm`,
    tracePath = `${out}/raw/runtime-samples.json`,
    graphPath = `${out}/raw/audio-graph.json`,
    trace = JSON.stringify(recorded.samples, null, 2),
    graph = JSON.stringify(recorded.graph, null, 2);
  writeFileSync(path, bytes);
  writeFileSync(tracePath, trace);
  writeFileSync(graphPath, graph);
  const { data, samples, graph: fullGraph, ...metadata } = recorded;
  results.recording = {
    path,
    sha256: hash(bytes),
    ...metadata,
    samples: samples.length,
    trace: { path: tracePath, sha256: hash(trace) },
    graph: { path: graphPath, sha256: hash(graph) },
  };
  results.method =
    'One uninterrupted real UI rescue with two terminal Undo/redeliveries at observed score phases. Actual canvas.captureStream video and existing runtime master Web Audio stream recorded together by MediaRecorder through the final 11-second won hold. No game-state injection, score-clock adjustment, audio substitution, normalization, export gain or time editing. Separate silent full-interface video covers that session and the subsequent Next cove navigation. Native gain/connect wrappers only observe calls and preserve original audio operations.';
  results.playbackLevels = {
    exportedFrom: 'Sound.captureStream(): unchanged runtime master gain output',
    masterTarget: 0.65,
    effectsBus: 0.34,
    ambienceBus: 0.11,
    normalization: false,
    exportGain: 1,
    note: 'Music attenuation and arrival synthesis may differ by source version as the authored change under test; media playback/export adds no gain adjustment.',
  };
  results.listening =
    'No speaker/headphone acoustic listening capability established in this workflow. Captured runtime master is retained for human comparison at unchanged playback volume. Source/gain/counter observations cannot establish subjective recognition or Android balance.';
  results.sourceUnchanged = JSON.stringify(files) === JSON.stringify(snapshot());
  if (!results.sourceUnchanged) throw Error('Runtime source changed during capture');
  if (errors.length) throw Error(`Browser errors: ${errors.join('; ')}`);
  if (recorded.end.contextCount !== 1 || recorded.end.droppedTones !== 0)
    throw Error('Audio context/source anomaly');
  await tap('next-cove');
  await page.waitForURL('**/?cove=bellwater');
  await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 4);
  await idle();
  await tap('map-harbor');
  await page.waitForTimeout(1800);
  const next = await observe('next-cove');
  if (next.state.status !== 'playing' || next.state.turn !== 0)
    throw Error('Next cove did not return to a fresh playable state');
  results.outcome = 'passed';
} catch (error) {
  results.failure = String(error.stack ?? error);
  results.outcome = 'failed';
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
  video = page.video();
  await context.close();
  if (video) {
    const path = `${out}/raw/holding-full-interface-silent.webm`;
    await video.saveAs(path);
    results.fullInterfaceVideo = { path, sha256: hash(readFileSync(path)), audio: false };
  }
  await browser.close();
  results.finishedAt = new Date().toISOString();
  writeFileSync(`${out}/capture.json`, JSON.stringify(results, null, 2));
  console.log(
    JSON.stringify({
      sourceHash: source.hash,
      outcome: results.outcome,
      arrivals: results.arrivals,
      recording: results.recording?.path,
      fullInterfaceVideo: results.fullInterfaceVideo?.path,
      failure: results.failure,
    }),
  );
}
