import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import { act, activate, idle, ready, restart, startMove, state, undo } from './ui';

const journey = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getJourneyStatus());
const environment = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getEnvironmentStatus());
async function crestObservation(page: Page) {
  return page.evaluate(() => {
    const api = (window as any).__LAST_FERRY__;
    return {
      at: performance.now(),
      state: api.getState(),
      journey: api.getJourneyStatus(),
      environment: api.getEnvironmentStatus(),
      frame: api.getFrameStatus(),
    };
  });
}
const angularDistance = (a: number, b: number) =>
  Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
const totalCompletions = (counts: Record<string, number>) =>
  Object.values(counts).reduce((n, v) => n + v, 0);
async function agreedPose(page: Page) {
  const j = await journey(page);
  const r = await page.evaluate(() => (window as any).__LAST_FERRY__.getRenderStatus());
  expect(j.boatHeading).toBeCloseTo(j.pose.heading, 8);
  expect(j.pose.history).toHaveLength(r.historyLength);
  expect(r.poseHistoryLength).toBe(r.historyLength);
  return j;
}
async function cleared(page: Page) {
  expect((await environment(page)).wake).toMatchObject({
    emitting: false,
    visible: false,
    vertices: 0,
    points: [],
    contactStrength: 0,
    docking: false,
  });
}
async function beginSamples(page: Page) {
  await page.evaluate(() => {
    const target = window as any;
    target.__headingFrames = [];
    target.__headingSampling = true;
    function sample(time: number) {
      if (!target.__headingSampling) return;
      const a = target.__LAST_FERRY__,
        j = a.getJourneyStatus();
      target.__headingFrames.push({
        time,
        heading: j.boatHeading,
        position: j.boatWorldPosition,
        active: j.active,
        pose: j.pose,
      });
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
}
async function endSamples(page: Page) {
  return page.evaluate(() => {
    (window as any).__headingSampling = false;
    return (window as any).__headingFrames as any[];
  });
}
test('direction: free-water heading, both berths, transfer/tide Undo and winning pose remain paired', async ({
  browser,
}) => {
  test.setTimeout(180000);
  mkdirSync(`${reviewDir}/raw`, { recursive: true });
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
    viewport: { width: 844, height: 390 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'no-preference',
    recordVideo: { dir: `${reviewDir}/raw`, size: { width: 844, height: 390 } },
  });
  const page = await context.newPage(),
    observations: any[] = [],
    errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  let failure: string | null = null;
  async function save(label: string, shot = false) {
    const j = await agreedPose(page),
      s = await state(page),
      w = (await environment(page)).wake;
    observations.push({ label, state: s, journey: j, wave: w });
    if (shot) await page.screenshot({ path: `${reviewDir}/direction-${label}.png` });
    return j;
  }
  try {
    await ready(page, 'holding-pier');
    const initial = await save('start', true);
    await activate(page, 'map-shallows', true);
    expect((await journey(page)).pose.history).toHaveLength(0);
    expect((await state(page)).turn).toBe(0);
    await activate(page, 'close-location', true);
    await act(page, 'unload', true);
    expect((await agreedPose(page)).boatHeading).toBeCloseTo(initial.boatHeading, 8);
    await startMove(page, 'map-shallows', true);
    await page.waitForFunction(
      () => (window as any).__LAST_FERRY__.getJourneyStatus().active?.progress > 0.3,
    );
    const planned = (await journey(page)).pose;
    await idle(page);
    const shallow = await save('free-water-rest', true);
    expect(shallow.boatHeading).toBeCloseTo(planned.heading, 8);
    expect(angularDistance(shallow.boatHeading, Math.PI / 2)).toBeGreaterThan(0.1);
    await activate(page, 'map-rabbit-pier', true);
    await page.waitForTimeout(350);
    expect((await agreedPose(page)).boatHeading).toBeCloseTo(shallow.boatHeading, 8);
    expect((await state(page)).turn).toBe(2);
    await activate(page, 'close-location', true);
    await activate(page, 'menu', true);
    await activate(page, 'settings', true);
    expect((await agreedPose(page)).boatHeading).toBeCloseTo(shallow.boatHeading, 8);
    expect((await journey(page)).pose.history).toHaveLength(2);
    await activate(page, 'settings-back', true);
    await activate(page, 'cancel', true);
    await act(page, 'wait', true);
    expect((await agreedPose(page)).boatHeading).toBeCloseTo(shallow.boatHeading, 8);
    await undo(page, true);
    expect((await agreedPose(page)).boatHeading).toBeCloseTo(shallow.boatHeading, 8);
    await undo(page, true);
    expect((await agreedPose(page)).boatHeading).toBeCloseTo(initial.boatHeading, 8);
    await act(page, 'map-harbor', true);
    await undo(page, true);
    expect((await agreedPose(page)).boatHeading).toBeCloseTo(initial.boatHeading, 8);
    await act(page, 'map-shallows', true);
    await startMove(page, 'map-rabbit-pier', true);
    await page.waitForFunction(
      () => (window as any).__LAST_FERRY__.getJourneyStatus().active?.progress > 0.03,
    );
    expect((await journey(page)).pose.next.fromAngle).toBeCloseTo(shallow.boatHeading, 8);
    await idle(page);
    const rabbit = await save('rabbit-berth', true);
    expect(Math.abs(Math.sin(rabbit.boatHeading))).toBeCloseTo(1, 8);
    await activate(page, 'board', true);
    await activate(page, 'passenger-rabbit-2', true);
    expect((await journey(page)).pose.history).toHaveLength(3);
    await activate(page, 'passenger-rabbit-2', true);
    await activate(page, 'commit', true);
    await idle(page);
    await save('tide', true);
    expect(await state(page)).toMatchObject({
      turn: 4,
      tideLevel: 1,
      aboard: ['rabbit-1', 'rabbit-2'],
    });
    expect((await agreedPose(page)).boatHeading).toBeCloseTo(rabbit.boatHeading, 8);
    await undo(page, true);
    await cleared(page);
    expect((await agreedPose(page)).boatHeading).toBeCloseTo(rabbit.boatHeading, 8);
    await act(page, 'board', true);
    await beginSamples(page);
    await act(page, 'map-shallows', true);
    const reverseFrames = await endSamples(page);
    const activeFrames = reverseFrames.filter((f) => f.active);
    expect(activeFrames.length).toBeGreaterThan(4);
    expect(activeFrames[0].pose.next.fromAngle).toBeCloseTo(rabbit.boatHeading, 8);
    expect(activeFrames.every((f) => f.active.duration >= 1600 && f.active.duration <= 3000)).toBe(
      true,
    );
    let maxStep = 0;
    for (let i = 1; i < activeFrames.length; i++)
      maxStep = Math.max(maxStep, Math.abs(activeFrames[i].heading - activeFrames[i - 1].heading));
    observations.push({ label: 'reverse-samples', frames: reverseFrames,maxStep,adjacentSteps:activeFrames.slice(1).map((frame,index)=>({dt:frame.time-activeFrames[index].time,fromProgress:activeFrames[index].active.progress,toProgress:frame.active.progress,fromHeading:activeFrames[index].heading,toHeading:frame.heading,step:Math.abs(frame.heading-activeFrames[index].heading)})) });
    expect(maxStep).toBeLessThan(0.85);
    await act(page, 'map-stone', true);
    const stone = await save('opposite-berth', true);
    expect(angularDistance(stone.boatHeading, initial.boatHeading)).toBeCloseTo(Math.PI, 7);
    await act(page, 'board', true);
    expect((await agreedPose(page)).boatHeading).toBeCloseTo(stone.boatHeading, 8);
    await activate(page, 'unload', true);
    for (const id of ['rabbit-1', 'rabbit-2']) await activate(page, `passenger-${id}`, true);
    await activate(page, 'commit', true);
    await idle(page);
    expect((await state(page)).aboard).toEqual(['rabbit-1', 'rabbit-2']);
    expect((await agreedPose(page)).boatHeading).toBeCloseTo(stone.boatHeading, 8);
    await undo(page, true);
    await cleared(page);
    expect((await agreedPose(page)).boatHeading).toBeCloseTo(stone.boatHeading, 8);
    await act(page, 'map-harbor', true);
    const harbor = await agreedPose(page);
    await act(page, 'unload', true);
    expect(await state(page)).toMatchObject({ turn: 9, status: 'won' });
    await save('won', true);
    await undo(page, true);
    await cleared(page);
    expect((await agreedPose(page)).boatHeading).toBeCloseTo(harbor.boatHeading, 8);
    await save('terminal-undo', true);
    await act(page, 'unload', true);
    await page.waitForTimeout(1900);
    await cleared(page);
    expect(errors).toEqual([]);
  } catch (e) {
    failure = String(e);
    throw e;
  } finally {
    writeFileSync(
      `${reviewDir}/direction-lifecycle.json`,
      JSON.stringify(
        { outcome: failure ? 'failed' : 'passed', failure, observations, errors },
        null,
        2,
      ),
    );
    const video = page.video();
    await context.close();
    if (video) await video.saveAs(`${reviewDir}/raw/direction-lifecycle.webm`);
  }
});

test('direction: normal, hidden, device Reduced, recovery and animation failures settle the same planned pose once', async ({
  page,
}) => {
  test.setTimeout(180000);
  mkdirSync(`${reviewDir}/raw`, { recursive: true });
  const observations: any[] = [];
  let failure: string | null = null,
    normalHeading: number | null = null;
  try {
    await ready(page, 'holding-pier');
    for (const mode of [
      'complete',
      'visibility',
      'cancelled',
      'recovery',
      'error-before',
      'error-after',
    ]) {
      await restart(page);
      await act(page, 'unload');
      const prior = await agreedPose(page);
      const counts = await page.evaluate(
        () => (window as any).__LAST_FERRY__.getTransitionStatus().completionCounts,
      );
      if (mode === 'recovery' || mode.startsWith('error'))
        await page.evaluate(async (mode) => {
          const modulePath = performance
            .getEntriesByType('resource')
            .find((entry) => new URL(entry.name).pathname === '/src/scene/world.ts')?.name;
          if (!modulePath) throw Error('The live World module resource was not found');
          const { World } = await import(modulePath);
          const original = World.prototype.animate;
          (window as any).__restoreAnimate = () => {
            World.prototype.animate = original;
          };
          World.prototype.animate = function (...args: any[]) {
            if (mode === 'error-after') original.apply(this, args);
            if (mode !== 'recovery')
              throw Error('Injected animation failure for fallback verification');
          };
        }, mode);
      await startMove(page, 'map-shallows');
      if (mode === 'visibility' || mode === 'cancelled') {
        await page.waitForFunction(
          () => (window as any).__LAST_FERRY__.getJourneyStatus().active?.progress > 0.3,
        );
        if (mode === 'cancelled') await page.emulateMedia({ reducedMotion: 'reduce' });
        else
          await page.evaluate(() => {
            Object.defineProperty(document, 'hidden', { configurable: true, value: true });
            document.dispatchEvent(new Event('visibilitychange'));
          });
      }
      await idle(page);
      const j = await agreedPose(page),
        transition = await page.evaluate(() =>
          (window as any).__LAST_FERRY__.getTransitionStatus(),
        );
      if (normalHeading === null) normalHeading = j.boatHeading;
      expect(j.boatHeading).toBeCloseTo(normalHeading!, 8);
      const reason = mode.startsWith('error') ? 'error' : mode;
      expect(transition.last.reason).toBe(reason);
      expect(totalCompletions(transition.completionCounts)).toBe(totalCompletions(counts) + 1);
      expect(await state(page)).toMatchObject({ turn: 2, boatNodeId: 'shallows' });
      if (mode !== 'complete') await cleared(page);
      observations.push({
        mode,
        journey: j,
        transition,
        labels:
          mode === 'cancelled'
            ? 'Emulated prefers-reduced-motion change during travel under Follow device'
            : mode === 'visibility'
              ? 'Simulated document.hidden and visibilitychange'
              : mode === 'recovery'
                ? 'Injected no-op animate; real recovery timeout'
                : mode.startsWith('error')
                  ? 'Injected animate throw through real execute catch'
                  : 'Natural completion',
      });
      await page.evaluate(() => {
        (window as any).__restoreAnimate?.();
        delete (window as any).__restoreAnimate;
      });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: false });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await undo(page);
      await cleared(page);
      expect((await agreedPose(page)).boatHeading).toBeCloseTo(prior.boatHeading, 8);
    }
  } catch (e) {
    failure = String(e);
    throw e;
  } finally {
    writeFileSync(
      `${reviewDir}/direction-settlements.json`,
      JSON.stringify({ outcome: failure ? 'failed' : 'passed', failure, observations }, null, 2),
    );
  }
});

test('direction: released crests retain their release data as the next journey turns and tide moves their height', async ({
  page,
}) => {
  await ready(page, 'holding-pier');
  await act(page, 'unload');
  await startMove(page, 'map-shallows');
  await idle(page);
  const firstFrame = await crestObservation(page);
  const before = firstFrame.environment.wake;
  expect(before.points.length).toBeGreaterThan(0);
  const tracked = before.points.at(-1);
  const poseBefore = firstFrame.journey;
  await startMove(page, 'map-rabbit-pier');
  await page.waitForFunction((heading) => {
    const api = (window as any).__LAST_FERRY__;
    const j = api.getJourneyStatus();
    return j.active?.progress > 0.03 && Math.abs(j.boatHeading - heading) > 0.15;
  }, poseBefore.boatHeading);
  const nextFrame = await crestObservation(page);
  const after = nextFrame.environment.wake,
    poseAfter = nextFrame.journey;
  const surviving = after.points.find((p: any) => p.id === tracked.id);
  writeFileSync(
    `${reviewDir}/released-crest-observations.json`,
    JSON.stringify({ firstFrame, nextFrame, tracked, surviving: surviving ?? null }, null, 2),
  );
  expect(surviving).toBeDefined();
  for (const field of [
    'position',
    'center',
    'direction',
    'time',
    'heading',
    'strength',
    'seed',
    'segment',
  ])
    expect(surviving[field]).toEqual(tracked[field]);
  expect(surviving.evolution.age).toBeGreaterThan(tracked.evolution.age);
  expect(surviving.evolution.width).toBeGreaterThan(tracked.evolution.width);
  expect(
    Math.hypot(
      surviving.evolution.x - tracked.evolution.x,
      surviving.evolution.z - tracked.evolution.z,
    ),
  ).toBeGreaterThan(0.01);
  expect(angularDistance(poseBefore.boatHeading, poseAfter.boatHeading)).toBeGreaterThan(0.1);
  expect(after.vertices).toBeLessThanOrEqual(after.points.length * after.limits.sections * 6);
  await idle(page);
  const birthCutoff = await page.evaluate(() => performance.now());
  await activate(page, 'board');
  await activate(page, 'commit');
  await page.waitForFunction(
    () => (window as any).__LAST_FERRY__.getEnvironmentStatus().waterY > 0.02,
  );
  const tide = await environment(page);
  expect(tide.wake.points.every((p: any) => p.time <= birthCutoff)).toBe(true);
  let yError = 0;
  for (let i = 1; i < tide.wake.positions.length; i += 3)
    yError = Math.max(yError, Math.abs(tide.wake.positions[i] - tide.waterY - 0.018));
  expect(yError).toBeLessThan(0.000005);
  await idle(page);
  await page.waitForTimeout(1900);
  await cleared(page);
  await undo(page);
  await cleared(page);
  writeFileSync(
    `${reviewDir}/released-crest.json`,
    JSON.stringify(
      {
        tracked,
        surviving,
        firstFrame,
        nextFrame,
        captureMethod:
          'Runtime diagnostics without synchronous pixel readback; natural full-interface moving evidence is captured separately.',
        poseBefore,
        poseAfter,
        tide: { waterY: tide.waterY, wave: tide.wake },
        outcome: 'passed',
      },
      null,
      2,
    ),
  );
});
