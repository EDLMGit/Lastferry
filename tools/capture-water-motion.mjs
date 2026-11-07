import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((v) => v.replace(/^--/, '').split('=')));
if (args.stills === 'true' && args.metricsOnly === 'true')
  throw Error('Metrics-only sampling cannot capture phase images');
const base = args.base ?? 'http://127.0.0.1:5202',
  phase = args.phase ?? 'baseline';
const width = Number(args.width ?? 844),
  height = Number(args.height ?? 390);
const root = resolve(args.root ?? '.'),
  out = args.output ?? `reviews/water-motion/${phase}/${width}x${height}`;
const hash = (value) => createHash('sha256').update(value).digest('hex');
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
    paths.map((p) => [relative(root, resolve(p)).replaceAll('\\', '/'), hash(readFileSync(p))]),
  );
const files = snapshot(),
  runtimeHash = hash(JSON.stringify(files));
mkdirSync(`${out}/raw`, { recursive: true });
const source = {
  head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  workingTree: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
  files,
  runtimeHash,
  capturedAt: new Date().toISOString(),
  command: [process.execPath, ...process.argv.slice(1)],
  helperHash: hash(readFileSync(new URL(import.meta.url))),
};
writeFileSync(`${out}/source.json`, JSON.stringify(source, null, 2) + '\n');
writeFileSync(`${out}/raw/capture-helper.mjs`, readFileSync(new URL(import.meta.url)));
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const result = {
  phase,
  sourceHead: source.head,
  runtimeHash,
  startedAt: new Date().toISOString(),
  environment: {
    node: process.version,
    browser: browser.version(),
    platform: process.platform,
    renderer: 'SwiftShader',
    width,
    height,
    dpr: 1,
    input: width < 1000 ? 'emulated touch' : 'mouse',
    sampling:
      args.metricsOnly === 'true'
        ? 'rAF intervals and small transition/metrics/state reads; no per-frame environment or route-buffer copy'
        : 'Full presentation diagnostics per rAF; instrumented capture, not native GPU performance',
  },
  routes: [],
  errors: [],
};
const idle = (page) =>
  page.waitForFunction(
    () => document.querySelector('#seascape')?.getAttribute('aria-busy') === 'false',
  );
const press = async (page, id) => {
  if ((id === 'board' || id === 'unload') && !(await page.locator(`#${id}`).isVisible()))
    await page.locator('.map-target[aria-current="location"]').click();
  await page.locator(`#${id}`).click();
  if (id.startsWith('map-')) await page.locator('#sail').click();
  else await page.locator('#commit').click();
};
const act = async (page, id) => {
  await press(page, id);
  await idle(page);
};
for (const length of args.cases ? args.cases.split(',') : ['short', 'long']) {
  const cove = length === 'short' ? 'holding-pier' : 'bellwater';
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    hasTouch: width < 1000,
    isMobile: width < 1000,
    reducedMotion: 'no-preference',
    ...(args.record === 'false'
      ? {}
      : { recordVideo: { dir: `${out}/raw`, size: { width, height } } }),
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => result.errors.push(e.message));
  await page.goto(`${base}/?cove=${cove}`);
  await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 6);
  if (args.timing)
    await page.evaluate((name) => window.__LAST_FERRY__.setTimingCandidate(name), args.timing);
  if (args.response !== undefined)
    await page.evaluate(
      (enabled) => window.__LAST_FERRY__.setBoatResponseCandidate(enabled),
      Number(args.response),
    );
  const setup =
    length === 'short' ? ['unload'] : ['map-shallows', 'map-low-pier', 'board', 'map-east-buoy'];
  for (const id of setup) await act(page, id);
  const route = {
    length,
    cove,
    timing: args.timing ?? 'active',
    response: args.response ?? 'active',
    setup,
    crossings: [],
    screenshots: [],
  };
  const idleSample = await page.evaluate(async () => {
    const values = [],
      api = window.__LAST_FERRY__;
    let last = performance.now();
    for (let i = 0; i < 60; i++) {
      const t = await new Promise(requestAnimationFrame);
      values.push(t - last);
      last = t;
    }
    return { intervals: values, metrics: api.getMetrics() };
  });
  route.idleSample = idleSample;
  await page.evaluate(
    ({ stills, targets, metricsOnly }) => {
      window.__waterMotionSamples = [];
      window.__waterMotionShots = [];
      window.__waterMotionSampling = true;
      function read(time) {
        if (!window.__waterMotionSampling) return;
        const api = window.__LAST_FERRY__,
          transition = metricsOnly ? api.getTransitionStatus().active : null,
          journey = metricsOnly
            ? {
                active:
                  transition?.action.type === 'move'
                    ? {
                        progress: Math.min(
                          1,
                          (time - transition.startedAt) / transition.plan.duration,
                        ),
                        duration: transition.plan.duration,
                      }
                    : null,
                boatWorldPosition: [],
                boatHeading: 0,
              }
            : api.getJourneyStatus(),
          environment = metricsOnly ? null : api.getEnvironmentStatus();
        window.__waterMotionSamples.push({
          time,
          state: api.getState(),
          journey: {
            active: journey.active,
            boatWorldPosition: journey.boatWorldPosition,
            boatHeading: journey.boatHeading,
          },
          wake: environment?.wake ?? { points: [], opacity: [] },
          waterY: environment?.waterY ?? null,
          waterInteraction:
            environment?.boatInteraction ??
            environment?.interaction ??
            environment?.water?.interaction ??
            environment?.water?.boat ??
            null,
          metrics: api.getMetrics(),
        });
        if (stills && journey.active)
          for (const target of targets) {
            const key = `${api.getState().turn}-${target}`;
            if (
              journey.active.progress >= target &&
              !window.__waterMotionShots.some((s) => s.key === key)
            )
              window.__waterMotionShots.push({
                key,
                target,
                at: time,
                state: api.getState(),
                journey,
                environment,
                frame: api.getFrameStatus(),
                dataUrl: document.querySelector('#seascape canvas').toDataURL('image/png'),
              });
          }
        requestAnimationFrame(read);
      }
      requestAnimationFrame(read);
    },
    {
      stills: args.stills === 'true',
      targets: (args.targets ?? '.5').split(',').map(Number),
      metricsOnly: args.metricsOnly === 'true',
    },
  );
  for (const [index, id] of (length === 'short'
    ? ['map-shallows', 'map-stone']
    : ['map-west-buoy', 'map-east-buoy']
  ).entries()) {
    const before = await page.evaluate(() => window.__LAST_FERRY__.getState());
    await press(page, id);
    await idle(page);
    const completed = await page.evaluate(() => ({
      transition: window.__LAST_FERRY__.getTransitionStatus(),
      state: window.__LAST_FERRY__.getState(),
      environment: window.__LAST_FERRY__.getEnvironmentStatus(),
    }));
    if (completed.transition.last.reason !== 'complete')
      throw Error(JSON.stringify(completed.transition));
    await page.waitForTimeout(2250);
    const settled = await page.evaluate(() => ({
      state: window.__LAST_FERRY__.getState(),
      environment: window.__LAST_FERRY__.getEnvironmentStatus(),
    }));
    route.crossings.push({
      index,
      action: id,
      before,
      after: completed.state,
      transition: completed.transition.last,
      postDockHoldMs: 2250,
      afterHold: {
        state: settled.state,
        wake: settled.environment.wake,
        waterInteraction:
          settled.environment.boatInteraction ??
          settled.environment.interaction ??
          settled.environment.water?.interaction ??
          settled.environment.water?.boat ??
          null,
      },
    });
  }
  const samples = await page.evaluate(() => {
    window.__waterMotionSampling = false;
    return window.__waterMotionSamples;
  });
  const samplesPath = `${out}/raw/${length}-samples.json`;
  writeFileSync(samplesPath, JSON.stringify(samples));
  route.samples = {
    path: samplesPath,
    sha256: hash(readFileSync(samplesPath)),
    count: samples.length,
  };
  const shots = await page.evaluate(() => window.__waterMotionShots);
  writeFileSync(
    `${out}/raw/${length}-phase-observations.json`,
    JSON.stringify(shots.map(({ dataUrl, ...s }) => s)),
  );
  route.phaseStills = [];
  for (const shot of shots) {
    const crossing = route.crossings.find((c) => c.after.turn === shot.state.turn);
    const direction = crossing?.index === 0 ? 'outward' : 'return';
    const path = `${out}/${length}-${direction}-progress-${Math.round(shot.target * 100)}.png`;
    writeFileSync(path, Buffer.from(shot.dataUrl.split(',')[1], 'base64'));
    const { dataUrl, environment, frame, journey, ...observation } = shot;
    route.phaseStills.push({
      path,
      sha256: hash(readFileSync(path)),
      method:
        'Native canvas-only PNG captured synchronously with pose/state in rAF; full DOM belongs to the separate natural full-interface recording',
      ...observation,
      journey: {
        active: journey.active,
        boatWorldPosition: journey.boatWorldPosition,
        boatHeading: journey.boatHeading,
      },
      waterY: environment.waterY,
      wake: {
        emitting: environment.wake.emitting,
        visible: environment.wake.visible,
        vertices: environment.wake.vertices,
        points: environment.wake.points,
      },
      water: environment.water,
      camera: frame.camera,
    });
  }
  route.pageClockAtCaptureEnd = await page.evaluate(() => ({
    now: performance.now(),
    timeOrigin: performance.timeOrigin,
  }));
  route.activeSamples = samples
    .filter((s) => s.journey.active)
    .map((s) => ({
      time: s.time,
      active: s.journey.active,
      pose: s.journey.boatWorldPosition,
      heading: s.journey.boatHeading,
      metrics: s.metrics,
      wakeSummary:
        args.metricsOnly === 'true'
          ? null
          : {
              emitting: s.wake.emitting,
              visible: s.wake.visible,
              vertices: s.wake.vertices,
              points: s.wake.points?.length,
              maximumOpacity: Math.max(0, ...(s.wake.opacity ?? [])),
            },
    }));
  const video = page.video(),
    videoPath = `${out}/raw/${length}-natural-full-interface.webm`;
  await context.close();
  if (video) await video.saveAs(videoPath);
  route.recording = video
    ? {
        path: videoPath,
        sha256: hash(readFileSync(videoPath)),
        bytes: readFileSync(videoPath).length,
        method:
          'Uninterrupted actual full interface at natural runtime speed; no timing override unless named. Silent Playwright original; at least2.25saftereachdocking. Setup also recorded. No cuts,slowdown or state injection.',
      }
    : null;
  result.routes.push(route);
}
await browser.close();
result.sourceUnchanged = JSON.stringify(files) === JSON.stringify(snapshot());
result.finishedAt = new Date().toISOString();
result.outcome = result.sourceUnchanged && result.errors.length === 0 ? 'passed' : 'failed';
writeFileSync(`${out}/capture.json`, JSON.stringify(result, null, 2) + '\n');
if (result.outcome !== 'passed') throw Error('Capture source changed or browser errors');
process.stdout.write(
  JSON.stringify(
    result.routes.map((r) => ({
      length: r.length,
      recording: r.recording?.path ?? null,
      crossings: r.crossings.map((c) => ({
        action: c.action,
        plan: c.transition.plan,
        elapsed: c.transition.finishedAt - c.transition.startedAt,
      })),
      samples: r.samples.count,
    })),
  ) + '\n',
);
