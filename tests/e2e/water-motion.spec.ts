import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import { act, activate, idle, ready, restart, startMove, state, undo } from './ui';

const environment = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getEnvironmentStatus());
async function movementClear(page: Page) {
  const view = await environment(page);
  expect(view.wake).toMatchObject({
    emitting: false,
    visible: false,
    vertices: 0,
    points: [],
    docking: false,
  });
  if (view.water.boat) expect(view.water.boat.strength).toBe(0);
}

test('water motion: finite docking, immediate follow-up, tide Undo and mid-crossing device reduction clear correctly', async ({
  browser,
}) => {
  test.setTimeout(180000);
  mkdirSync(`${reviewDir}/raw`, { recursive: true });
  const context = await browser.newContext({
    baseURL: String(
      test.info().project.use.baseURL ??
        `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
    ),
    viewport: { width: 844, height: 390 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'no-preference',
    recordVideo: { dir: `${reviewDir}/raw`, size: { width: 844, height: 390 } },
  });
  const page = await context.newPage();
  const observations: any[] = [],
    errors: string[] = [];
  let failure: string | null = null;
  page.on('pageerror', (error) => errors.push(error.message));
  async function save(label: string, screenshot = false) {
    const item = await page.evaluate((label) => {
      const api = (window as any).__LAST_FERRY__,
        view = api.getEnvironmentStatus(),
        wake = view.wake;
      return {
        label,
        at: performance.now(),
        state: api.getState(),
        transition: api.getTransitionStatus(),
        motion: api.getMotionStatus(),
        wake: {
          emitting: wake.emitting,
          visible: wake.visible,
          vertices: wake.vertices,
          points: wake.points,
          docking: wake.docking,
          speed: wake.speed,
          strength: wake.strength,
          contactStrength: wake.contactStrength,
        },
        waterY: view.waterY,
        boatInteraction: view.water.boat ?? null,
        homecoming: api.getHomecomingStatus(),
        audio: api.getAudioStatus(),
        metrics: api.getMetrics(),
      };
    }, label);
    observations.push(item);
    if (screenshot) await page.screenshot({ path: `${reviewDir}/water-motion-${label}.png` });
    return item;
  }
  try {
    await ready(page, 'holding-pier');
    await page.waitForTimeout(900);
    await movementClear(page);
    await save('ordinary', true);
    await activate(page, 'map-harbor', true);
    await page.waitForTimeout(250);
    await movementClear(page);
    expect((await state(page)).turn).toBe(0);
    await activate(page, 'close-location', true);
    await act(page, 'unload', true);
    await movementClear(page);
    await startMove(page, 'map-shallows', true);
    await page.waitForFunction(
      () => (window as any).__LAST_FERRY__.getEnvironmentStatus().wake.points.length > 5,
    );
    await idle(page);
    const docking = await save('natural-docking');
    expect(docking.wake.emitting).toBe(false);
    expect(docking.wake.visible).toBe(true);
    await expect(page.locator('#undo')).toBeEnabled();
    const nextStartedAt = await page.evaluate(() => performance.now());
    await startMove(page, 'map-rabbit-pier', true);
    await page.waitForFunction(
      () => (window as any).__LAST_FERRY__.getJourneyStatus().active?.progress > 0.15,
    );
    const follow = await save('immediate-follow-up');
    expect(follow.state.turn).toBe(3);
    expect(follow.transition.active.startedAt - nextStartedAt).toBeLessThan(1600);
    expect(follow.wake.points.length).toBeLessThanOrEqual(96);
    for (let i = 1; i < follow.wake.points.length; i++) {
      const a = follow.wake.points[i - 1],
        b = follow.wake.points[i];
      if (a.segment === b.segment)
        expect(Math.hypot(b.center[0] - a.center[0], b.center[2] - a.center[2])).toBeLessThan(0.1);
    }
    await idle(page);
    const beforeTide = await state(page);
    await activate(page, 'board', true);
    await activate(page, 'passenger-rabbit-2', true);
    expect(await state(page)).toEqual(beforeTide);
    await expect(page.locator('#dialog')).toContainText('Rue');
    await activate(page, 'passenger-rabbit-2', true);
    const boardingTime = await page.evaluate(() => performance.now());
    await activate(page, 'commit', true);
    await idle(page);
    const rise = await save('after-tide', true);
    expect(rise.state).toMatchObject({
      turn: 4,
      tideLevel: 1,
      aboard: ['rabbit-1', 'rabbit-2'],
      status: 'playing',
    });
    expect(rise.wake.emitting).toBe(false);
    for (const point of rise.wake.points) expect(point.time).toBeLessThanOrEqual(boardingTime);
    await undo(page, true);
    expect(await state(page)).toEqual(beforeTide);
    await movementClear(page);
    await save('tide-undo', true);
    await act(page, 'board', true);
    await startMove(page, 'map-shallows', true);
    await page.waitForFunction(
      () => (window as any).__LAST_FERRY__.getJourneyStatus().active?.progress > 0.28,
    );
    await save('before-device-reduction');
    const countsBefore = await page.evaluate(
      () => (window as any).__LAST_FERRY__.getTransitionStatus().completionCounts,
    );
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await idle(page);
    expect(await state(page)).toMatchObject({ turn: 5, boatNodeId: 'shallows' });
    await movementClear(page);
    const reduced = await save('device-reduced', true);
    expect(reduced.motion).toMatchObject({ mode: 'device', reduced: true });
    expect(reduced.transition.last.reason).toBe('cancelled');
    expect(reduced.transition.completionCounts.cancelled).toBe(countsBefore.cancelled + 1);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForTimeout(300);
    await movementClear(page);
    expect((await state(page)).turn).toBe(5);
    await activate(page, 'menu', true);
    await activate(page, 'settings', true);
    await page.locator('#motion-preference').selectOption('reduced');
    expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getMotionStatus())).toEqual({
      mode: 'reduced',
      reduced: true,
    });
    await movementClear(page);
    await save('manual-reduced-settings', true);
    await page.locator('#motion-preference').selectOption('device');
    await activate(page, 'settings-back', true);
    await activate(page, 'cancel', true);
    for (const action of ['map-stone', 'board', 'map-harbor', 'unload'])
      await act(page, action, true);
    expect(await state(page)).toMatchObject({
      turn: 9,
      status: 'won',
    });
    expect((await state(page)).delivered.slice().sort()).toEqual([
      'rabbit-1',
      'rabbit-2',
      'sheep-1',
    ]);
    await save('arrival', true);
    await undo(page, true);
    await movementClear(page);
    await act(page, 'unload', true);
    expect((await state(page)).status).toBe('won');
    await page.waitForTimeout(2300);
    await movementClear(page);
    await save('redelivery-settled', true);
    await restart(page, true);
    await movementClear(page);
    await startMove(page, 'map-harbor', true);
    await page.waitForFunction(
      () => (window as any).__LAST_FERRY__.getJourneyStatus().active?.progress > 0.25,
    );
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await idle(page);
    await movementClear(page);
    const hidden = await save('simulated-hidden');
    expect(hidden.state).toMatchObject({ turn: 1, boatNodeId: 'harbor' });
    expect(hidden.transition.last.reason).toBe('visibility');
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(350);
    await movementClear(page);
    expect((await state(page)).turn).toBe(1);
    await undo(page, true);
    await restart(page, true);
    await activate(page, 'menu', true);
    await page.locator('#cove-picker').selectOption('first-crossing');
    await idle(page);
    await movementClear(page);
    expect(await state(page)).toMatchObject({ turn: 0, boatNodeId: 'cut' });
    await save('first-crossing-smoke', true);
    expect(errors).toEqual([]);
  } catch (error) {
    failure = String(error);
    throw error;
  } finally {
    writeFileSync(
      `${reviewDir}/water-motion-lifecycle.json`,
      JSON.stringify(
        {
          outcome: failure ? 'failed' : 'passed',
          failure,
          environment: {
            viewport: [844, 390],
            dpr: 1,
            input: 'emulated touch',
            midCrossingMotion: 'emulated prefers-reduced-motion change under Follow device',
            visibility: 'simulated document.hidden/visibilitychange',
          },
          observations,
          errors,
        },
        null,
        2,
      ),
    );
    const video = page.video();
    await context.close();
    if (video) await video.saveAs(`${reviewDir}/raw/water-motion-lifecycle.webm`);
  }
});
