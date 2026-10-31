import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => arg.replace(/^--/, '').split('=')),
);
const base = args.base ?? 'http://127.0.0.1:5180',
  out = args.output ?? 'reviews/refinement/audio-comparison';
mkdirSync(`${out}/raw`, { recursive: true });
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const paths = readdirSync('src/audio')
  .filter((path) => path.endsWith('.ts'))
  .map((path) => `src/audio/${path}`);
const snapshot = () =>
  Object.fromEntries(
    [...paths, 'src/main.ts', 'src/game/rescue-facts.ts'].map((path) => [
      path,
      hash(readFileSync(path)),
    ]),
  );
const files = snapshot();
const source = {
  head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  files,
  hash: hash(JSON.stringify(files)),
};
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const context = await browser.newContext({
  viewport: { width: 844, height: 390 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const results = { source, recordings: [], startedAt: new Date().toISOString() };
try {
  await page.goto(`${base}/?cove=holding-pier`);
  await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 4);
  for (const id of [
    'unload',
    'map-shallows',
    'map-rabbit-pier',
    'board',
    'map-shallows',
    'map-stone',
    'board',
  ]) {
    await page.locator(`#${id}`).click();
    if (!id.startsWith('map-')) await page.locator('#commit').click();
    await page.waitForFunction(
      () => document.querySelector('#seascape').getAttribute('aria-busy') === 'false',
    );
  }
  const original = await page.evaluate(() => window.__LAST_FERRY__.getState());
  if (original.turn !== 7 || original.status !== 'playing') throw Error('Homeward setup failed');
  const target = await page.evaluate(
    () => (Math.ceil((window.__LAST_FERRY__.getAudioStatus().phaseSeconds + 2) / 7.5) * 7.5) % 75,
  );
  for (const [label, enabled] of [
    ['accepted-base', false],
    ['companion', true],
  ]) {
    await page.evaluate(
      (enabled) => window.__LAST_FERRY__.setAccompanimentEnabled(enabled),
      enabled,
    );
    await page.waitForFunction(
      (target) => {
        const phase = window.__LAST_FERRY__.getAudioStatus().phaseSeconds;
        return phase >= target && phase < target + 0.35;
      },
      target,
      { timeout: 85000 },
    );
    const recording = await page.evaluate(async () => {
      const api = window.__LAST_FERRY__,
        stream = api.captureAudioStream();
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      const chunks = [],
        samples = [],
        start = api.getAudioStatus(),
        startedAt = performance.now();
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.start(500);
      const timer = setInterval(() => samples.push(api.getAudioStatus()), 100);
      await new Promise((resolve) => setTimeout(resolve, 12000));
      clearInterval(timer);
      const stop = new Promise((resolve) => (recorder.onstop = resolve));
      recorder.stop();
      await stop;
      const blob = new Blob(chunks, { type: recorder.mimeType });
      const data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.readAsDataURL(blob);
      });
      return {
        data,
        start,
        end: api.getAudioStatus(),
        samples,
        state: api.getState(),
        bytes: blob.size,
        wallMs: performance.now() - startedAt,
      };
    });
    const media = Buffer.from(recording.data, 'base64'),
      path = `${out}/raw/${label}.webm`;
    writeFileSync(path, media);
    const { data, ...metadata } = recording;
    results.recordings.push({ label, path, sha256: hash(media), ...metadata });
    if (JSON.stringify(recording.state) !== JSON.stringify(original))
      throw Error('Listening changed game state');
    if (
      recording.samples.some(
        (sample) =>
          sample.contextCount !== 1 ||
          sample.schedulerCount !== 1 ||
          sample.droppedTones ||
          sample.skippedEvents,
      )
    )
      throw Error('Audio lifecycle/resource anomaly');
  }
  results.phaseTargetSeconds = target;
  results.method =
    'Two actual runtime master-stream recordings at the same authored phrase position on consecutive loops, same page/state/homeward music gain/master. Only DEV accompaniment switch changes; no synthesized offline playback or time edits.';
  results.listening =
    'Actual speaker/headphone listening unavailable. Authored voicing/source/lifecycle/levels are assessed separately; these captures are for listening review.';
  results.sourceUnchanged = JSON.stringify(files) === JSON.stringify(snapshot());
  if (!results.sourceUnchanged) throw Error('Audio source changed during comparison');
} catch (error) {
  results.failure = String(error.stack ?? error);
  throw error;
} finally {
  results.environment = {
    browser: browser.version(),
    viewport: { width: 844, height: 390 },
    dpr: 1,
    renderer: 'SwiftShader',
    base,
  };
  results.finishedAt = new Date().toISOString();
  writeFileSync(`${out}/comparison.json`, JSON.stringify(results, null, 2));
  await browser.close();
  console.log(
    JSON.stringify({
      recordings: results.recordings.map(({ label, path, start, wallMs }) => ({
        label,
        path,
        phase: start.phaseSeconds,
        wallMs,
      })),
      failure: results.failure,
    }),
  );
}
