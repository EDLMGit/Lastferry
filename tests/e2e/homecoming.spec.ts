import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import {
  act,
  activate,
  dialogCycle,
  fullyVisible,
  idle,
  readable,
  ready,
  restart,
  state,
  tabTo,
  undo,
} from './ui';

const holdingApproach = [
  'unload',
  'map-shallows',
  'map-rabbit-pier',
  'board',
  'map-shallows',
  'map-stone',
  'board',
  'map-harbor',
];
const bellApproach = [
  'map-shallows',
  'map-low-pier',
  'board',
  'map-east-buoy',
  'map-west-buoy',
  'map-harbor',
  'map-bell-pier',
  'board',
  'map-harbor',
];
const firstApproach = ['map-sheep-pier', 'board', 'wait', 'wait', 'map-cut', 'map-harbor'];
const homecoming = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getHomecomingStatus());
const audio = (page: Page) => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus());
const scene = (page: Page) => page.evaluate(() => (window as any).__LAST_FERRY__.getFrameStatus());
async function motion(page: Page) {
  const value = await page.evaluate(() => {
    const api = (window as any).__LAST_FERRY__;
    return {
      status: api.getMotionStatus(),
      sceneReduced: api.getEnvironmentStatus().reducedMotion,
      cssMotion: document.documentElement.dataset.motion,
    };
  });
  expect(value.sceneReduced).toBe(value.status.reduced);
  expect(value.cssMotion).toBe(value.status.reduced ? 'reduced' : 'normal');
  return value.status;
}

async function snap(page: Page, label: string, image = false) {
  mkdirSync(reviewDir, { recursive: true });
  const value = await page.evaluate((name) => {
    const api = (window as any).__LAST_FERRY__;
    return {
      label: name,
      at: performance.now(),
      state: api.getState(),
      homecoming: api.getHomecomingStatus(),
      motion: api.getMotionStatus(),
      audio: api.getAudioStatus(),
      frame: api.getFrameStatus(),
      metrics: api.getMetrics(),
    };
  }, label);
  if (image) await page.screenshot({ path: `${reviewDir}/${label}.png` });
  return value;
}

async function observed(
  page: Page,
  name: string,
  run: (save: (label: string, image?: boolean) => Promise<any>) => Promise<void>,
) {
  const observations: any[] = [],
    errors: string[] = [];
  const startedAt = new Date().toISOString();
  page.on('pageerror', (error) => errors.push(error.message));
  let outcome = 'incomplete',
    failure: string | null = null;
  try {
    await run(async (label, image = false) => {
      const value = await snap(page, `${name}-${label}`, image);
      observations.push(value);
      return value;
    });
    expect(errors).toEqual([]);
    outcome = 'passed';
  } catch (error) {
    outcome = 'failed';
    failure = error instanceof Error ? error.message : String(error);
    throw error;
  } finally {
    mkdirSync(reviewDir, { recursive: true });
    writeFileSync(
      `${reviewDir}/${name}.json`,
      JSON.stringify(
        {
          startedAt,
          finishedAt: new Date().toISOString(),
          outcome,
          failure,
          environment: await page.evaluate(() => ({
            userAgent: navigator.userAgent,
            viewport: { width: innerWidth, height: innerHeight },
            devicePixelRatio,
            touch: navigator.maxTouchPoints,
            osReduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
          })),
          errors,
          observations,
        },
        null,
        2,
      ),
    );
  }
}

async function approach(page: Page, ids = holdingApproach, touch = false, tideUndo = false) {
  for (const id of ids) {
    const before = await state(page);
    await act(page, id, touch);
    if (tideUndo && before.turn === 3) {
      const risen = await state(page);
      expect(risen).toMatchObject({ tideLevel: 1, status: 'playing' });
      await undo(page, touch);
      expect(await state(page)).toEqual(before);
      await act(page, id, touch);
      expect(await state(page)).toEqual(risen);
    }
  }
}

async function settled(page: Page) {
  await expect.poll(async () => (await homecoming(page)).finite).toBe(false);
  const value = await homecoming(page);
  expect(value.active).toBe(true);
  expect(
    value.animalOffsets.every(
      (animal: any) =>
        animal.position.every((n: number) => Math.abs(n) < 1e-7) &&
        animal.rotation.every((n: number) => Math.abs(n) < 1e-7),
    ),
  ).toBe(true);
  return value;
}

async function controls(page: Page) {
  await fullyVisible(page, page.locator('#dialog'), false);
  const controls = page.locator('#dialog :is(button,select):visible');
  for (const control of await controls.all()) {
    await fullyVisible(page, control);
    await readable(control);
  }
  for (const text of await page.locator('#dialog :is(h2,p,label):visible').all())
    await readable(text);
  const entries = await controls.evaluateAll((elements) =>
    elements.map((element) => {
      const r = element.getBoundingClientRect();
      return { id: element.id, left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    }),
  );
  for (let a = 0; a < entries.length; a++)
    for (let b = a + 1; b < entries.length; b++) {
      const x = entries[a],
        y = entries[b];
      expect(
        Math.min(x.right, y.right) - Math.max(x.left, y.left) <= 0.5 ||
          Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) <= 0.5,
        `${x.id} overlaps ${y.id}`,
      ).toBe(true);
    }
}

async function framing(page: Page) {
  const value = await scene(page);
  for (const item of [value.lighthouse, value.boat, ...value.passengers]) {
    expect(item.left).toBeGreaterThanOrEqual(0);
    expect(item.top).toBeGreaterThanOrEqual(0);
    expect(item.right).toBeLessThanOrEqual(value.canvas.width);
    expect(item.bottom).toBeLessThanOrEqual(value.canvas.height);
  }
  const covered = await page.evaluate(() => {
    const api = (window as any).__LAST_FERRY__,
      f = api.getFrameStatus(),
      canvas = document.querySelector('canvas')!.getBoundingClientRect(),
      panel = document.querySelector('#dialog')!.getBoundingClientRect();
    return [f.lighthouse, f.boat, ...f.passengers].map((box: any) => ({
      id: box.id ?? 'landmark/boat',
      overlapWidth:
        Math.min(canvas.left + box.right, panel.right) -
        Math.max(canvas.left + box.left, panel.left),
      overlapHeight:
        Math.min(canvas.top + box.bottom, panel.bottom) - Math.max(canvas.top + box.top, panel.top),
    }));
  });
  for (const item of covered)
    expect(
      item.overlapWidth <= 0.5 || item.overlapHeight <= 0.5,
      `${item.id} covered by ending`,
    ).toBe(true);
  return value;
}

async function restoredMap(page: Page, camera: any) {
  expect((await scene(page)).camera).toEqual(camera);
  const markers = await page.evaluate(() => {
    const frame = (window as any).__LAST_FERRY__.getFrameStatus(),
      canvas = document.querySelector('canvas')!.getBoundingClientRect();
    return frame.nodes.map((node: any) => {
      const target = document.querySelector(`#map-${node.id} .map-hit`)!.getBoundingClientRect();
      return {
        id: node.id,
        dx: target.left + target.width / 2 - canvas.left - node.x,
        dy: target.top + target.height / 2 - canvas.top - node.y,
      };
    });
  });
  for (const marker of markers) {
    expect(Math.abs(marker.dx), `${marker.id} horizontal projection`).toBeLessThan(1);
    expect(Math.abs(marker.dy), `${marker.id} vertical projection`).toBeLessThan(1);
  }
  const point = await page.evaluate(() => {
    const api = (window as any).__LAST_FERRY__,
      f = api.getFrameStatus(),
      canvas = document.querySelector('canvas')!,
      bounds = canvas.getBoundingClientRect();
    for (const fy of [0.5, 0.25, 0.75, 0.1, 0.9])
      for (const fx of [0.5, 0.25, 0.75, 0.1, 0.9]) {
        const x = f.boat.left + (f.boat.right - f.boat.left) * fx,
          y = f.boat.top + (f.boat.bottom - f.boat.top) * fy;
        if (
          api.getPickDetailAt(x, y)?.kind === 'ferry' &&
          document.elementFromPoint(bounds.left + x, bounds.top + y) === canvas
        )
          return { x: bounds.left + x, y: bounds.top + y };
      }
    return null;
  });
  expect(
    point,
    'A visible actual ferry must remain selectable after camera restoration',
  ).not.toBeNull();
  const before = await state(page);
  await page.mouse.click(point!.x, point!.y);
  await expect(page.locator('#local-context')).toBeVisible();
  expect(await state(page)).toEqual(before);
  await page.keyboard.press('Escape');
}

test('homecoming desktop: subset and tide Undo, finite cancellation, settled Settings and honest progression', async ({
  page,
}) => {
  test.setTimeout(180000);
  await ready(page, 'holding-pier');
  await observed(page, 'desktop-holding', async (save) => {
    await save('ordinary', true);
    await approach(page, holdingApproach, false, true);
    const before = await state(page),
      normalCamera = (await scene(page)).camera;
    await activate(page, 'unload');
    await activate(page, 'passenger-rabbit-1');
    await activate(page, 'passenger-rabbit-2');
    await activate(page, 'commit');
    await idle(page);
    expect(await state(page)).toMatchObject({ status: 'playing', delivered: ['sheep-1'] });
    expect(await homecoming(page)).toMatchObject({ active: false, celebrations: 0 });
    await undo(page);
    expect(await state(page)).toEqual(before);
    await act(page, 'unload');
    expect(await homecoming(page)).toMatchObject({ active: true, finite: true, celebrations: 1 });
    await undo(page);
    expect(await state(page)).toEqual(before);
    expect(await homecoming(page)).toMatchObject({ active: false, finite: false });
    await save('finite-undo-restored');
    await restoredMap(page, normalCamera);
    await act(page, 'unload');
    await save('visible-arrival', true);
    await settled(page);
    expect(await homecoming(page)).toMatchObject({ celebrations: 2 });
    await controls(page);
    await framing(page);
    await save('settled-ending', true);
    await dialogCycle(page, 'next-cove');
    await tabTo(page, 'terminal-settings');
    const mutedBeforeSettings = (await audio(page)).muted;
    await page.keyboard.down('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.up('Enter');
    await expect(page.locator('#settings-sound')).toBeFocused();
    expect((await audio(page)).muted).toBe(mutedBeforeSettings);
    const stableState = await state(page),
      stableAudio = await audio(page),
      stableHome = await homecoming(page);
    await controls(page);
    await save('settings', true);
    await dialogCycle(page, 'settings-sound');
    await page.keyboard.press('Escape');
    await expect(page.locator('#terminal-settings')).toBeFocused();
    expect(await state(page)).toEqual(stableState);
    expect(await audio(page)).toMatchObject({
      deliveryCount: stableAudio.deliveryCount,
      arrivalEventCount: stableAudio.arrivalEventCount,
      victoryTarget: 0.5,
    });
    expect((await homecoming(page)).celebrations).toBe(stableHome.celebrations);
    expect((await homecoming(page)).startedAt).toBe(stableHome.startedAt);
    expect((await homecoming(page)).sweep.startedAt).toBe(stableHome.sweep.startedAt);
    await page.keyboard.press('Escape');
    await expect(page.locator('#dialog')).toBeHidden();
    await activate(page, 'menu');
    await activate(page, 'return-arrival');
    await expect(page.locator('#next-cove')).toBeFocused();
    expect((await homecoming(page)).celebrations).toBe(2);
    expect((await homecoming(page)).sweep.startedAt).toBe(stableHome.sweep.startedAt);
    await undo(page);
    await restoredMap(page, normalCamera);
    await save('restored-play', true);
    await act(page, 'unload');
    await activate(page, 'next-cove');
    await page.waitForURL('**/?cove=bellwater');
    await page.waitForFunction(
      () => ((window as any).__LAST_FERRY__?.getMetrics().frames ?? 0) > 4,
    );
    expect(await state(page)).toMatchObject({ turn: 0, status: 'playing' });
    expect(await homecoming(page)).toMatchObject({ active: false, finite: false, celebrations: 0 });
    await save('next-cove');
  });
});

for (const [width, height] of [
  [844, 390],
  [780, 390],
  [780, 320],
])
  test(`homecoming touch ${width}x${height}: arrival, Settings, restoration and reduced stable ending`, async ({
    browser,
  }) => {
    test.setTimeout(150000);
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await ready(page, 'holding-pier');
    await observed(page, `phone-${width}x${height}`, async (save) => {
      await save('ordinary', true);
      await approach(page, holdingApproach, true);
      const before = await state(page),
        normalCamera = (await scene(page)).camera;
      await act(page, 'unload', true);
      await save('visible-arrival', true);
      await controls(page);
      await settled(page);
      await framing(page);
      if (height === 320) expect((await homecoming(page)).camera.factor).toBe(1);
      await save('settled-ending', true);
      const celebrationCount = (await homecoming(page)).celebrations;
      await page.setViewportSize({ width: width === 844 ? 780 : 844, height: 390 });
      await page.waitForTimeout(200);
      await framing(page);
      await controls(page);
      expect((await homecoming(page)).celebrations).toBe(celebrationCount);
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(200);
      await activate(page, 'terminal-settings', true);
      await controls(page);
      await save('settings', true);
      await page.locator('#motion-preference').selectOption('reduced');
      await expect.poll(async () => (await motion(page)).reduced).toBe(true);
      expect((await homecoming(page)).camera.factor).toBe(1);
      expect((await homecoming(page)).finite).toBe(false);
      const phase = (await homecoming(page)).sweep.angle;
      await page.waitForTimeout(250);
      expect((await homecoming(page)).sweep.angle).toBe(phase);
      await activate(page, 'settings-back', true);
      await save('reduced-ending', true);
      await undo(page, true);
      expect(await state(page)).toEqual(before);
      await restoredMap(page, normalCamera);
      await save('restored-play', true);
      await act(page, 'unload', true);
      expect(await homecoming(page)).toMatchObject({
        active: true,
        finite: false,
        motionReduced: true,
      });
      await activate(page, 'terminal-restart', true);
      expect(await state(page)).toMatchObject({ turn: 0, status: 'playing' });
      expect(await homecoming(page)).toMatchObject({ active: false, finite: false });
      await save('restarted');
    });
    await context.close();
  });

for (const cove of ['bellwater', 'first-crossing'])
  test(`homecoming ${cove}: actual rescue and honest Choose a cove`, async ({ page }) => {
    if (cove === 'bellwater') await page.setViewportSize({ width: 780, height: 320 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page, cove);
    await observed(page, cove, async (save) => {
      await approach(page, cove === 'bellwater' ? bellApproach : firstApproach);
      await act(page, 'unload');
      expect(await state(page)).toMatchObject({
        status: 'won',
        turn: cove === 'bellwater' ? 10 : 7,
      });
      expect(await homecoming(page)).toMatchObject({
        active: true,
        finite: false,
        celebrations: 1,
        motionReduced: true,
      });
      await expect(page.locator('#choose-cove')).toBeFocused();
      await expect(page.locator('#next-cove')).toHaveCount(0);
      await controls(page);
      await framing(page);
      await save('ending', true);
      await activate(page, 'choose-cove');
      await expect(page.locator('#cove-picker')).toBeVisible();
      expect(await state(page)).toMatchObject({ status: 'won' });
      expect((await homecoming(page)).celebrations).toBe(1);
      await page.keyboard.press('Escape');
      await undo(page);
      expect(await state(page)).toMatchObject({ status: 'playing' });
      expect(await homecoming(page)).toMatchObject({ active: false });
    });
  });

test('homecoming settings: natural keyboard, device and persisted Reduced preference, loss has no arrival', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await ready(page, 'holding-pier');
  await observed(page, 'motion-settings', async (save) => {
    const initial = await state(page);
    await tabTo(page, 'menu');
    await page.keyboard.press('Enter');
    await tabTo(page, 'settings');
    await page.keyboard.press('Space');
    await expect(page.locator('#settings-sound')).toBeFocused();
    await tabTo(page, 'settings-sound');
    await page.keyboard.press('Space');
    expect((await audio(page)).muted).toBe(true);
    await page.keyboard.press('Space');
    expect((await audio(page)).muted).toBe(false);
    await tabTo(page, 'motion-preference');
    await page.keyboard.press('ArrowDown');
    await expect.poll(async () => (await motion(page)).reduced).toBe(true);
    expect(await state(page)).toEqual(initial);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    expect((await motion(page)).reduced).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('#settings')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#menu')).toBeFocused();
    await page.reload();
    await page.waitForFunction(
      () => ((window as any).__LAST_FERRY__?.getMetrics().frames ?? 0) > 4,
    );
    expect((await motion(page)).reduced).toBe(true);
    await activate(page, 'menu');
    await page.locator('#cove-picker').selectOption('bellwater');
    await page.waitForURL('**/?cove=bellwater');
    await page.waitForFunction(
      () => ((window as any).__LAST_FERRY__?.getMetrics().frames ?? 0) > 4,
    );
    expect((await motion(page)).reduced).toBe(true);
    await activate(page, 'menu');
    await activate(page, 'settings');
    await page.locator('#motion-preference').selectOption('device');
    expect((await motion(page)).reduced).toBe(false);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(async () => (await motion(page)).reduced).toBe(true);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect.poll(async () => (await motion(page)).reduced).toBe(false);
    await save('follow-device-restored');
    await page.keyboard.press('Escape');
    await page.locator('#cove-picker').selectOption('holding-pier');
    await page.waitForURL('**/?cove=holding-pier');
    await page.waitForFunction(
      () => ((window as any).__LAST_FERRY__?.getMetrics().frames ?? 0) > 4,
    );
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (let i = 0; i < 4; i++) await act(page, 'wait');
    expect(await state(page)).toMatchObject({ status: 'lost', turn: 4 });
    expect(await homecoming(page)).toMatchObject({ active: false, finite: false, celebrations: 0 });
    expect((await audio(page)).arrivalEventCount).toBe(0);
    await save('loss-no-celebration');
    await restart(page);
    expect(await homecoming(page)).toMatchObject({ active: false, finite: false });
  });
});

test('homecoming recovery: simulated hide and context loss settle finite motion without replay or resource growth', async ({
  page,
}) => {
  test.setTimeout(180000);
  await ready(page, 'holding-pier');
  await observed(page, 'visual-recovery', async (save) => {
    await approach(page);
    const before = await state(page),
      camera = (await scene(page)).camera;
    await act(page, 'unload');
    expect((await homecoming(page)).finite).toBe(true);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect((await homecoming(page)).finite).toBe(false);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(300);
    await settled(page);
    const hidden = await save('simulated-hide-resume');
    expect(hidden.homecoming.celebrations).toBe(1);
    expect(hidden.audio).toMatchObject({ arrivalEventCount: 1, victoryTarget: 0.5 });
    const phase = hidden.homecoming.sweep.angle;
    await page.waitForTimeout(700);
    const phaseChange =
      ((await homecoming(page)).sweep.angle - phase + Math.PI * 2) % (Math.PI * 2);
    expect(phaseChange).toBeGreaterThan(0);
    expect(phaseChange).toBeLessThan(0.4);
    const settledCount = (await homecoming(page)).celebrations;
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(150);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect((await homecoming(page)).celebrations).toBe(settledCount);
    expect((await homecoming(page)).finite).toBe(false);
    expect((await audio(page)).victoryTarget).toBe(0.5);
    await save('simulated-settled-won-hide-resume');
    await undo(page);
    expect(await state(page)).toEqual(before);
    await restoredMap(page, camera);
    await act(page, 'unload');
    await page.evaluate(() =>
      document
        .querySelector('canvas')!
        .dispatchEvent(new Event('webglcontextlost', { cancelable: true })),
    );
    expect((await homecoming(page)).finite).toBe(false);
    await page.evaluate(() =>
      document.querySelector('canvas')!.dispatchEvent(new Event('webglcontextrestored')),
    );
    await settled(page);
    const context = await save('simulated-context-recovery');
    expect(context.homecoming.celebrations).toBe(2);
    expect(context.audio).toMatchObject({ arrivalEventCount: 2, victoryTarget: 0.5 });
    await page.waitForTimeout(300);
    const priorResources = (await homecoming(page)).resources;
    expect(priorResources).toBeDefined();
    await undo(page);
    await act(page, 'unload');
    expect((await homecoming(page)).finite).toBe(true);
    await activate(page, 'terminal-settings');
    await page.locator('#motion-preference').selectOption('reduced');
    await settled(page);
    expect((await homecoming(page)).camera.factor).toBe(1);
    await page.locator('#motion-preference').selectOption('device');
    expect((await homecoming(page)).finite).toBe(false);
    await activate(page, 'settings-back');
    expect((await homecoming(page)).resources).toEqual(priorResources);
    expect((await homecoming(page)).celebrations).toBe(3);
    await save('repeated-win-settled');
    await restart(page);
    expect(await homecoming(page)).toMatchObject({ active: false, finite: false });
  });
});
