import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((v) => v.replace(/^--/, '').split('=')));
const base = args.base ?? 'http://127.0.0.1:5206';
const phase = args.phase ?? 'after';
const width = Number(args.width ?? 844),
  height = Number(args.height ?? 390);
const root = resolve(args.root ?? '.'),
  out = args.output ?? `reviews/sailing-direction-wake/${phase}/${width}x${height}`;
const hash = (v) => createHash('sha256').update(v).digest('hex');
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
  );
const paths = ['src', 'data', 'public']
  .map((p) => resolve(root, p))
  .filter(existsSync)
  .flatMap(walk)
  .concat(
    ['index.html', 'package.json', 'package-lock.json', 'vite.config.ts'].map((p) =>
      resolve(root, p),
    ),
  )
  .sort();
const snapshot = () =>
  Object.fromEntries(
    paths.map((p) => [relative(root, p).replaceAll('\\', '/'), hash(readFileSync(p))]),
  );
const files = snapshot(),
  runtimeHash = hash(JSON.stringify(files));
mkdirSync(`${out}/raw`, { recursive: true });
writeFileSync(
  `${out}/source.json`,
  JSON.stringify(
    {
      head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      sourceRoot: root,
      baselineArchive: args.baselineSha ?? null,
      workingTree: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
      files,
      runtimeHash,
      capturedAt: new Date().toISOString(),
      command: [process.execPath, ...process.argv.slice(1)],
      helperHash: hash(readFileSync(new URL(import.meta.url))),
    },
    null,
    2,
  ),
);
writeFileSync(`${out}/raw/capture-helper.mjs`, readFileSync(new URL(import.meta.url)));
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const result = {
  phase,
  runtimeHash,
  environment: {
    node: process.version,
    browser: browser.version(),
    renderer: 'SwiftShader',
    width,
    height,
    dpr: 1,
    input:
      width < 1000
        ? 'Touch-enabled mobile context; mouse click activation of the actual UI'
        : 'Mouse click activation of the actual UI',
    recording:
      'Uninterrupted silent full-interface Playwright originals at natural runtime speed; all gameplay uses actual UI.',
  },
  sequences: [],
  errors: [],
};
const idle = (p) =>
  p.waitForFunction(
    () => document.querySelector('#seascape')?.getAttribute('aria-busy') === 'false',
  );
const read = (p) =>
  p.evaluate(() => {
    const a = window.__LAST_FERRY__,
      j = a.getJourneyStatus(),
      w = a.getEnvironmentStatus();
    return {
      at: performance.now(),
      state: a.getState(),
      pose: { position: j.boatWorldPosition, heading: j.boatHeading, active: j.active },
      transition: a.getTransitionStatus(),
      wave: w.wake,
      waterY: w.waterY,
      camera: a.getFrameStatus().camera,
      metrics: a.getMetrics(),
    };
  });
const press = async (p, id) => {
  if ((id === 'board' || id === 'unload') && !(await p.locator(`#${id}`).isVisible()))
    await p.locator('.map-target[aria-current="location"]').click();
  await p.locator(`#${id}`).click();
  if (id.startsWith('map-')) await p.locator('#sail').click();
  else await p.locator('#commit').click();
};
const cases = {
  holding: {
    cove: 'holding-pier',
    actions: [
      'unload',
      'map-shallows',
      'map-rabbit-pier',
      'board',
      'map-shallows',
      'map-stone',
      'board',
      'map-harbor',
      'unload',
    ],
  },
  bellwater: {
    cove: 'bellwater',
    actions: [
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
    ],
  },
};
for (const name of (args.cases ?? 'holding,bellwater').split(',')) {
  const scenario = cases[name];
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    hasTouch: width < 1000,
    isMobile: width < 1000,
    reducedMotion: 'no-preference',
    recordVideo: { dir: `${out}/raw`, size: { width, height } },
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => result.errors.push(e.message));
  await page.goto(`${base}/?cove=${scenario.cove}`);
  await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 6);
  await idle(page);
  await page.waitForTimeout(600);
  const sequence = {
    name,
    cove: scenario.cove,
    actions: [],
    screenshots: [],
    start: await read(page),
  };
  if (args.stills !== 'false') {
    const path = `${out}/${name}-start.png`;
    await page.screenshot({ path });
    sequence.screenshots.push({
      path,
      sha256: hash(readFileSync(path)),
      observation: sequence.start,
    });
  }
  await page.evaluate(() => {
    window.__directionSamples = [];
    window.__directionSampling = true;
    let previous = 0;
    function sample(time) {
      if (!window.__directionSampling) return;
      const a = window.__LAST_FERRY__,
        j = a.getJourneyStatus();
      const sample = {
        time,
        position: j.boatWorldPosition,
        heading: j.boatHeading,
        active: j.active,
      };
      if (time - previous >= 95) {
        const e = a.getEnvironmentStatus();
        sample.wave = e.wake;
        sample.waterY = e.waterY;
        sample.state = a.getState();
        sample.metrics = a.getMetrics();
        previous = time;
      }
      window.__directionSamples.push(sample);
      requestAnimationFrame(sampleFn);
    }
    const sampleFn = sample;
    requestAnimationFrame(sampleFn);
  });
  for (const [index, id] of scenario.actions.entries()) {
    const before = await read(page);
    await press(page, id);
    await idle(page);
    const completed = await read(page);
    if (completed.transition.last?.reason !== 'complete')
      throw Error(JSON.stringify(completed.transition));
    const restMs = id.startsWith('map-') ? Number(args.rest ?? 650) : 250;
    await page.waitForTimeout(restMs);
    const rest = await read(page);
    sequence.actions.push({ index, id, before, completed, restMs, rest });
    if (
      args.stills !== 'false' &&
      ((name === 'holding' && [1, 2, 3, 4, 5, 6, 8].includes(index)) ||
        (name === 'bellwater' && [3, 4, 5, 8, 9].includes(index)))
    ) {
      const path = `${out}/${name}-${String(index + 1).padStart(2, '0')}-${id}-rest.png`;
      await page.screenshot({ path });
      sequence.screenshots.push({
        path,
        sha256: hash(readFileSync(path)),
        observation: await read(page),
      });
    }
  }
  await page.waitForTimeout(1600);
  const samples = await page.evaluate(() => {
    window.__directionSampling = false;
    return window.__directionSamples;
  });
  const samplePath = `${out}/raw/${name}-samples.json`;
  writeFileSync(samplePath, JSON.stringify(samples));
  sequence.samples = {
    path: samplePath,
    sha256: hash(readFileSync(samplePath)),
    count: samples.length,
  };
  sequence.end = await read(page);
  const video = page.video(),
    path = `${out}/raw/${name}-arrival-rest-departure.webm`;
  await context.close();
  await video.saveAs(path);
  sequence.recording = { path, sha256: hash(readFileSync(path)), bytes: readFileSync(path).length };
  result.sequences.push(sequence);
  writeFileSync(`${out}/capture-in-progress.json`, JSON.stringify(result, null, 2));
}
await browser.close();
result.sourceUnchanged = JSON.stringify(files) === JSON.stringify(snapshot());
result.outcome = result.sourceUnchanged && result.errors.length === 0 ? 'passed' : 'failed';
writeFileSync(`${out}/capture.json`, JSON.stringify(result, null, 2));
process.stdout.write(
  JSON.stringify({
    outcome: result.outcome,
    runtimeHash,
    sequences: result.sequences.map((s) => ({
      name: s.name,
      recording: s.recording.path,
      turn: s.end.state.turn,
      status: s.end.state.status,
      samples: s.samples.count,
    })),
  }) + '\n',
);
if (result.outcome !== 'passed') throw Error('Capture failed or runtime source changed');
