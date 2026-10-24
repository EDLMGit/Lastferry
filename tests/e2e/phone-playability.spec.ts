import { expect, test, type Page } from '@playwright/test';
import * as T from 'three';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import { activate, dialogCycle, fullyVisible, idle, ready, state, tabTo, undo } from './ui';

const viewport = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getViewportStatus());
const view = (page: Page) => page.evaluate(() => (window as any).__LAST_FERRY__.getViewStatus());
const frame = (page: Page) => page.evaluate(() => (window as any).__LAST_FERRY__.getFrameStatus());
const placement = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getActionPlacement());
const stable = (page: Page) =>
  page.evaluate(() => {
    const a = (window as any).__LAST_FERRY__;
    const pose = a.getJourneyStatus().pose;
    return {
      state: a.getState(),
      history: a.getRenderStatus().historyLength,
      pose: { heading: pose.heading, history: pose.history },
    };
  });
const rect = (page: Page, id: string) =>
  page.locator(`#${id}`).evaluate((e) => {
    const r = e.getBoundingClientRect();
    return {
      left: r.left,
      top: r.top,
      right: r.right,
      bottom: r.bottom,
      width: r.width,
      height: r.height,
    };
  });
async function visibleInViewport(page: Page, id: string) {
  return page.locator(`#${id}`).evaluate((e) => {
    const r = e.getBoundingClientRect();
    return (
      !e.closest('.offscreen') &&
      getComputedStyle(e).opacity !== '0' &&
      r.width > 0 &&
      r.height > 0 &&
      r.left >= 0 &&
      r.top >= 0 &&
      r.right <= innerWidth &&
      r.bottom <= innerHeight
    );
  });
}
async function press(page: Page, id: string, touch = true) {
  await fullyVisible(page, page.locator(`#${id}`));
  if (touch) await page.locator(`#${id}`).tap();
  else await page.locator(`#${id}`).click();
}
async function whole(page: Page, touch = true) {
  if ((await page.locator('#view-toggle').textContent())?.includes('Whole cove'))
    await press(page, 'view-toggle', touch);
  await page.waitForTimeout(200);
}
async function place(page: Page, id: string, touch = true) {
  if (!(await visibleInViewport(page, `map-${id}`))) await whole(page, touch);
  await press(page, `map-${id}`, touch);
  await expect(page.locator('#local-context')).toBeVisible();
}
async function move(page: Page, id: string, touch = true) {
  await place(page, id, touch);
  await press(page, 'sail', touch);
  await idle(page);
}
async function transfer(page: Page, id: 'board' | 'unload', touch = true) {
  if (!(await page.locator(`#${id}`).isVisible()))
    await place(page, (await state(page)).boatNodeId, touch);
  await press(page, id, touch);
  await press(page, 'commit', touch);
  await idle(page);
}
async function noOverflow(page: Page) {
  const result = await page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    app: document.querySelector('#app')!.getBoundingClientRect().toJSON(),
  }));
  expect(result.scrollWidth).toBeLessThanOrEqual(result.width + 1);
  expect(result.app.bottom).toBeLessThanOrEqual(result.height + 1);
  expect(result.app.height).toBeGreaterThan(result.height - 2);
}
async function activeSubjects(page: Page) {
  const f = await frame(page),
    v = await viewport(page),
    b = f.boat,
    c = v.canvas;
  expect(b.left + c.left).toBeGreaterThanOrEqual(v.usable.left - 1);
  expect(b.right + c.left).toBeLessThanOrEqual(v.usable.right + 1);
  expect(b.top + c.top).toBeGreaterThanOrEqual(v.usable.top - 1);
  expect(b.bottom + c.top).toBeLessThanOrEqual(v.usable.bottom + 1);
  return { width: b.right - b.left, height: b.bottom - b.top };
}
async function markerAlignment(page: Page, all = false) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  const data = await page.evaluate(() => {
    const a = (window as any).__LAST_FERRY__,
      f = a.getFrameStatus(),
      c = document.querySelector('canvas')!.getBoundingClientRect();
    return f.nodes.map((node: any) => {
      const e = document.querySelector<HTMLElement>(`#map-${node.id}`)!,
        r = e.getBoundingClientRect();
      return {
        id: node.id,
        node: { x: node.x + c.left, y: node.y + c.top },
        marker: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
        visible:
          !e.closest('.offscreen') &&
          r.width > 0 &&
          r.height > 0 &&
          r.left >= 0 &&
          r.top >= 0 &&
          r.right <= innerWidth &&
          r.bottom <= innerHeight,
      };
    });
  });
  for (const entry of data) {
    if (!all && !entry.visible) continue;
    if (all) await fullyVisible(page, page.locator(`#map-${entry.id}`));
    expect(Math.abs(entry.marker.x - entry.node.x)).toBeLessThan(2);
    expect(Math.abs(entry.marker.y - entry.node.y)).toBeLessThan(2);
  }
}
async function observed(
  page: Page,
  name: string,
  run: (save: (label: string, shot?: boolean) => Promise<any>) => Promise<void>,
) {
  mkdirSync(`${reviewDir}/raw`, { recursive: true });
  const observations: any[] = [],
    errors: string[] = [];
  let failure: string | null = null;
  page.on('pageerror', (error) => errors.push(error.message));
  const save = async (label: string, shot = false) => {
    const data = await page.evaluate((label) => {
      const a = (window as any).__LAST_FERRY__;
      return {
        label,
        at: performance.now(),
        state: a.getState(),
        render: a.getRenderStatus(),
        frame: a.getFrameStatus(),
        view: a.getViewStatus(),
        viewport: a.getViewportStatus(),
        action: a.getActionPlacement(),
        selection: a.getSelectionStatus(),
        metrics: a.getMetrics(),
        fullscreen: {
          element: document.fullscreenElement?.id ?? null,
          enabled: document.fullscreenEnabled,
          dialogInside: !!document.fullscreenElement?.contains(document.querySelector('#dialog')),
        },
        audio: a.getAudioStatus(),
        transition: a.getTransitionStatus(),
      };
    }, label);
    observations.push(data);
    if (shot) await page.screenshot({ path: `${reviewDir}/${name}-${label}.png` });
    return data;
  };
  try {
    await run(save);
    expect(errors).toEqual([]);
  } catch (error) {
    failure = String((error as Error).stack ?? error);
    throw error;
  } finally {
    writeFileSync(
      `${reviewDir}/${name}.json`,
      JSON.stringify(
        {
          name,
          recordedAt: new Date().toISOString(),
          input:
            'Playwright touchscreen taps except separately labeled pointer/mouse or keyboard gestures',
          observations,
          errors,
          failure,
        },
        null,
        2,
      ),
    );
  }
}

for (const [width, height] of [
  [844, 390],
  [780, 390],
  [780, 320],
  [390, 844],
  [360, 740],
])
  test(`phone layout ${width}x${height}: readable Play and deliberate complete Whole cove`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
      viewport: { width, height },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    try {
      await ready(page, 'holding-pier');
      await observed(page, `layout-${width}x${height}`, async (save) => {
        await noOverflow(page);
        const original = await stable(page),
          dimensions = await activeSubjects(page);
        const baselineWidth: Record<string, number> = {
          '844x390': 69.09490461811049,
          '780x390': 61.22599696480856,
          '780x320': 59.120034927559686,
          '390x844': 46.607412399413136,
          '360x740': 42.70176331566341,
        };
        expect(dimensions.width).toBeGreaterThan(baselineWidth[`${width}x${height}`] * 1.25);
        await fullyVisible(page, page.locator('#unload'));
        expect(
          await page.locator('#unload').evaluate((e) => parseFloat(getComputedStyle(e).fontSize)),
        ).toBeGreaterThanOrEqual(16);
        await fullyVisible(page, page.locator('#view-toggle'));
        await save('play', true);
        await whole(page);
        await markerAlignment(page, true);
        expect(await stable(page)).toEqual(original);
        await save('overview', true);
        await press(page, 'back-to-boat');
        await markerAlignment(page);
        await activeSubjects(page);
        expect(await stable(page)).toEqual(original);
        await press(page, 'unload');
        await fullyVisible(page, page.locator('#commit'));
        await fullyVisible(page, page.locator('#cancel'));
        expect(
          await page.locator('#commit').evaluate((e) => parseFloat(getComputedStyle(e).fontSize)),
        ).toBeGreaterThanOrEqual(16);
        await save('nearby-unload', true);
        await page.keyboard.press('Escape');
        expect(await stable(page)).toEqual(original);
      });
    } finally {
      await context.close();
    }
  });

for (const [width, height] of [
  [844, 390],
  [390, 844],
])
  test(`phone rescue ${width}x${height}: actual subset/tide Undo, nearby previews and terminal redelivery`, async ({
    browser,
  }) => {
    test.setTimeout(180000);
    const context = await browser.newContext({
      baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
      viewport: { width, height },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
      reducedMotion: 'no-preference',
      recordVideo: { dir: `${reviewDir}/raw`, size: { width, height } },
    });
    const page = await context.newPage();
    try {
      await ready(page, 'holding-pier');
      await observed(page, `rescue-${width}x${height}`, async (save) => {
        await save('start', true);
        await press(page, 'unload');
        await save('unload-preview', true);
        const first = await placement(page);
        expect(first.anchor).toBeTruthy();
        expect(first.panel).toBeTruthy();
        await press(page, 'commit');
        await idle(page);
        await move(page, 'shallows');
        await move(page, 'rabbit-pier');
        await press(page, 'board');
        const before = await stable(page),
          panel = await rect(page, 'dialog');
        await save('before-subset');
        await press(page, 'passenger-rabbit-2');
        await expect(page.locator('#dialog')).toContainText(/lost|flood|left|unsafe/i);
        const subset = await rect(page, 'dialog');
        await save('after-subset');
        expect(Math.abs(subset.left - panel.left)).toBeLessThan(2);
        expect(Math.abs(subset.top - panel.top)).toBeLessThan(2);
        expect(await stable(page)).toEqual(before);
        await save('subset-warning', true);
        await press(page, 'passenger-rabbit-2');
        await expect(page.locator('#dialog')).toContainText(/both are safe|safe aboard/i);
        await save('critical-boarding', true);
        await press(page, 'commit');
        await idle(page);
        expect(await state(page)).toMatchObject({ turn: 4, tideLevel: 1, status: 'playing' });
        await save('after-rise', true);
        await undo(page, true);
        expect(await stable(page)).toEqual(before);
        await save('tide-undo', true);
        await transfer(page, 'board');
        await move(page, 'shallows');
        await move(page, 'stone');
        await transfer(page, 'board');
        await move(page, 'harbor');
        const arrival = await stable(page);
        await transfer(page, 'unload');
        expect(await state(page)).toMatchObject({ turn: 9, status: 'won' });
        await fullyVisible(page, page.locator('#terminal-undo'));
        await save('won', true);
        await press(page, 'terminal-settings');
        await fullyVisible(page, page.locator('#settings-sound'));
        await press(page, 'settings-back');
        await undo(page, true);
        expect(await stable(page)).toEqual(arrival);
        await activeSubjects(page);
        await save('terminal-undo', true);
        await transfer(page, 'unload');
        expect((await state(page)).status).toBe('won');
      });
    } finally {
      await context.close();
    }
  });

test('phone camera input: real touch pan, cancellation, mode recovery and marker picking conserve state', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
    viewport: { width: 844, height: 390 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  try {
    await ready(page, 'holding-pier');
    await observed(page, 'camera-input', async (save) => {
      const original = await stable(page);
      await whole(page);
      await markerAlignment(page, true);
      await press(page, 'back-to-boat');
      const beforePan = await view(page);
      const point = await page.evaluate(() => {
        const canvas = document.querySelector('canvas')!,
          r = canvas.getBoundingClientRect(),
          a = (window as any).__LAST_FERRY__;
        for (let y = 90; y < innerHeight - 70; y += 20)
          for (let x = 25; x < innerWidth - 25; x += 20)
            if (
              document.elementFromPoint(x, y) === canvas &&
              !a.getPickTargetAt(x - r.left, y - r.top)
            )
              return { x, y };
        return null;
      });
      expect(point).not.toBeNull();
      const target = await rect(page, 'map-rabbit-pier');
      const cdp = await context.newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: point!.x, y: point!.y, id: 1 }],
      });
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: point!.x + 40, y: point!.y + 25, id: 1 }],
      });
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [
          { x: (target.left + target.right) / 2, y: (target.top + target.bottom) / 2, id: 1 },
        ],
      });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(200);
      expect(await stable(page)).toEqual(original);
      const panned = await view(page);
      expect(panned.panned).toBe(true);
      expect(panned.focus).not.toEqual(beforePan.focus);
      expect(panned.focus.x).toBeGreaterThanOrEqual(panned.bounds.minX);
      expect(panned.focus.x).toBeLessThanOrEqual(panned.bounds.maxX);
      expect(panned.focus.y).toBeGreaterThanOrEqual(panned.bounds.minY);
      expect(panned.focus.y).toBeLessThanOrEqual(panned.bounds.maxY);
      expect(
        (await page.evaluate(() => (window as any).__LAST_FERRY__.getSelectionStatus())).selectedId,
      ).toBeNull();
      await press(page, 'back-to-boat');
      await markerAlignment(page);
      await activeSubjects(page);
      await save('returned', true);
      await page.mouse.move(point!.x, point!.y);
      await page.mouse.down();
      await page.mouse.move(-12, -12, { steps: 5 });
      await page.mouse.up();
      expect(await stable(page)).toEqual(original);
      await press(page, 'back-to-boat');
      const ferryHit = await page.evaluate(() => {
        const a = (window as any).__LAST_FERRY__,
          f = a.getFrameStatus(),
          c = document.querySelector('canvas')!,
          r = c.getBoundingClientRect();
        for (const fy of [0.5, 0.2, 0.8, 0.1, 0.9])
          for (const fx of [0.5, 0.2, 0.8, 0.1, 0.9]) {
            const x = f.boat.left + (f.boat.right - f.boat.left) * fx,
              y = f.boat.top + (f.boat.bottom - f.boat.top) * fy;
            if (
              a.getPickDetailAt(x, y)?.kind === 'ferry' &&
              document.elementFromPoint(x + r.left, y + r.top) === c
            )
              return { x: x + r.left, y: y + r.top };
          }
        return null;
      });
      expect(ferryHit).not.toBeNull();
      await page.touchscreen.tap(ferryHit!.x, ferryHit!.y);
      expect(
        (await page.evaluate(() => (window as any).__LAST_FERRY__.getSelectionStatus())).selectedId,
      ).toBe('stone');
      await press(page, 'close-location');
      await whole(page);
      expect(
        await page.evaluate(({ x, y }) => {
          const c = document.querySelector('canvas')!,
            r = c.getBoundingClientRect();
          return (
            document.elementFromPoint(x, y) === c &&
            !(window as any).__LAST_FERRY__.getPickDetailAt(x - r.left, y - r.top)
          );
        }, point!),
      ).toBe(true);
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: point!.x, y: point!.y, id: 1 }],
      });
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: point!.x + 36, y: point!.y + 20, id: 1 }],
      });
      const liveTarget = await rect(page, 'map-rabbit-pier');
      const release = {
        x: (liveTarget.left + liveTarget.right) / 2,
        y: (liveTarget.top + liveTarget.bottom) / 2,
      };
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ ...release, id: 1 }],
      });
      const literalHit = await page.evaluate(
        ({ x, y }) => document.elementFromPoint(x, y)?.closest('button')?.id,
        release,
      );
      expect(literalHit).toBe('map-rabbit-pier');
      const releaseProof = await save('drag-release-over-live-marker');
      releaseProof.release = { ...release, hit: literalHit };
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      expect(
        (await page.evaluate(() => (window as any).__LAST_FERRY__.getSelectionStatus())).selectedId,
      ).toBeNull();
      expect(await stable(page)).toEqual(original);
      await press(page, 'back-to-boat');
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: point!.x, y: point!.y, id: 1 }],
      });
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [
          { x: point!.x, y: point!.y, id: 1 },
          { x: point!.x + 40, y: point!.y, id: 2 },
        ],
      });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
      expect(await stable(page)).toEqual(original);
      await whole(page);
      await press(page, 'map-rabbit-pier');
      expect((await state(page)).turn).toBe(0);
      await save('inspection', true);
      await page.keyboard.press('Escape');
      await tabTo(page, 'back-to-boat');
      await page.keyboard.press('Enter');
      await tabTo(page, 'view-toggle');
      await page.keyboard.press('Enter');
      await tabTo(page, 'map-harbor');
      await page.keyboard.press('Enter');
      expect(await page.locator('#local-context')).toBeVisible();
      expect(await stable(page)).toEqual(original);
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      const warmResources = await page.evaluate(
        () => (window as any).__LAST_FERRY__.getMetrics().resources,
      );
      await save('resource-warm');
      for (let repeat = 0; repeat < 3; repeat++) {
        await page.keyboard.press('Escape');
        if (await page.locator('#back-to-boat').isVisible()) await press(page, 'back-to-boat');
        await whole(page);
        await press(page, 'map-harbor');
      }
      await save('resource-repeat');
      const afterResources = await page.evaluate(
        () => (window as any).__LAST_FERRY__.getMetrics().resources,
      );
      expect(afterResources.geometries).toBe(warmResources.geometries);
      expect(afterResources.textures).toBe(warmResources.textures);
    });
  } finally {
    await context.close();
  }
});

test('phone rotation: selected place, open subset and confirmed journey retain state and anchors', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
    viewport: { width: 844, height: 390 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  try {
    await ready(page, 'holding-pier');
    await observed(page, 'rotation', async (save) => {
      await whole(page);
      await place(page, 'rabbit-pier');
      const original = await stable(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(200);
      expect(
        (await page.evaluate(() => (window as any).__LAST_FERRY__.getSelectionStatus())).selectedId,
      ).toBe('rabbit-pier');
      expect(await stable(page)).toEqual(original);
      await noOverflow(page);
      await markerAlignment(page);
      await save('selected-portrait', true);
      await press(page, 'back-to-boat');
      await press(page, 'unload');
      await press(page, 'passenger-sheep-1');
      const selected = await page.locator('#passenger-sheep-1').getAttribute('aria-pressed');
      await page.setViewportSize({ width: 780, height: 320 });
      await page.waitForTimeout(200);
      expect(await page.locator('#passenger-sheep-1').getAttribute('aria-pressed')).toBe(selected);
      await fullyVisible(page, page.locator('#commit'));
      await fullyVisible(page, page.locator('#cancel'));
      expect(await stable(page)).toEqual(original);
      await save('open-preview-short', true);
      await press(page, 'passenger-sheep-1');
      await press(page, 'commit');
      await idle(page);
      await place(page, 'shallows');
      await press(page, 'sail');
      await page.waitForFunction(
        () => (window as any).__LAST_FERRY__.getJourneyStatus().active?.progress > 0.2,
      );
      await page.setViewportSize({ width: 360, height: 740 });
      await idle(page);
      await noOverflow(page);
      await activeSubjects(page);
      await markerAlignment(page);
      expect(await state(page)).toMatchObject({ turn: 2, boatNodeId: 'shallows' });
      await save('journey-rotated', true);
      await undo(page, true);
      expect((await state(page)).boatNodeId).toBe('stone');
      await activeSubjects(page);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await press(page, 'view-toggle');
      await press(page, 'back-to-boat');
      expect(
        await page.evaluate(() => (window as any).__LAST_FERRY__.getMotionStatus().reduced),
      ).toBe(true);
    });
  } finally {
    await context.close();
  }
});

test('phone nearby decisions: Wait and losing Sail retain their actual control anchors', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
    viewport: { width: 780, height: 320 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  try {
    await ready(page, 'holding-pier');
    await observed(page, 'nearby-decisions', async (save) => {
      for (let turn = 0; turn < 3; turn++) {
        const original = await stable(page),
          anchor = await rect(page, 'wait');
        await press(page, 'wait');
        const p = await placement(page);
        expect(p.anchor.left).toBeCloseTo(anchor.left, 1);
        expect(p.anchor.top).toBeCloseTo(anchor.top, 1);
        await fullyVisible(page, page.locator('#commit'));
        await fullyVisible(page, page.locator('#cancel'));
        expect(await stable(page)).toEqual(original);
        if (turn === 0) {
          await save('wait-preview', true);
          await page.keyboard.press('Escape');
          expect(await page.locator('#wait')).toBeFocused();
          await press(page, 'wait');
        }
        await press(page, 'commit');
        await idle(page);
      }
      await whole(page);
      await place(page, 'harbor');
      const before = await stable(page),
        anchor = await rect(page, 'sail');
      await press(page, 'sail');
      await expect(page.locator('#dialog')).toBeVisible();
      await expect(page.locator('#dialog')).toContainText(/lost|flood|cannot|unsafe/i);
      const p = await placement(page);
      expect(p.anchor.left).toBeCloseTo(anchor.left, 1);
      expect(p.anchor.top).toBeCloseTo(anchor.top, 1);
      await fullyVisible(page, page.locator('#commit'));
      await save('risky-sail', true);
      await page.keyboard.press('Escape');
      expect(await stable(page)).toEqual(before);
      await press(page, 'sail');
      await press(page, 'commit');
      await idle(page);
      expect((await state(page)).status).toBe('lost');
      await expect(page.locator('#dialog')).toContainText(/undo|earlier|restart/i);
      await undo(page, true);
      expect(await stable(page)).toEqual(before);
    });
  } finally {
    await context.close();
  }
});

test('phone fullscreen: real API result, root includes dialogs and external exit preserves subset', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
    viewport: { width: 844, height: 390 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  try {
    await ready(page, 'holding-pier');
    await observed(page, 'fullscreen-actual', async (save) => {
      const original = await stable(page);
      const preferences = await page.evaluate(() => {
        const a = (window as any).__LAST_FERRY__;
        return { motion: a.getMotionStatus(), muted: a.getAudioStatus().muted };
      });
      await press(page, 'menu');
      const enabled = await page.evaluate(
        () =>
          document.fullscreenEnabled &&
          typeof document.querySelector('#app')!.requestFullscreen === 'function',
      );
      expect(enabled, 'Controlled supported Chromium must expose fullscreen capability').toBe(true);
      await press(page, 'fullscreen');
      await expect
        .poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null))
        .toBe('app');
      await page.waitForTimeout(300);
      const actual = await page.evaluate(() => ({
        element: document.fullscreenElement?.id ?? null,
        dialogInside: !!document.fullscreenElement?.contains(document.querySelector('#dialog')),
        enabled: document.fullscreenEnabled,
      }));
      await save('request-result', true);
      if (actual.element) {
        expect(actual).toMatchObject({ element: 'app', dialogInside: true });
        await press(page, 'fullscreen');
        await expect
          .poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null))
          .toBeNull();
        await page.waitForTimeout(200);
        await expect(page.locator('#fullscreen')).toHaveText('Fullscreen');
        await press(page, 'fullscreen');
        await expect
          .poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null))
          .toBe('app');
        await save('ui-exit-reentry', true);
        await press(page, 'cancel');
        await press(page, 'unload');
        await press(page, 'passenger-sheep-1');
        const selected = await page.locator('#passenger-sheep-1').getAttribute('aria-pressed');
        await page.evaluate(() => document.exitFullscreen());
        await page.waitForTimeout(200);
        expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
        expect(await page.locator('#passenger-sheep-1').getAttribute('aria-pressed')).toBe(
          selected,
        );
        await fullyVisible(page, page.locator('#commit'));
        await fullyVisible(page, page.locator('#cancel'));
        await page.setViewportSize({ width: 844, height: 350 });
        await page.waitForTimeout(200);
        expect(await page.locator('#passenger-sheep-1').getAttribute('aria-pressed')).toBe(
          selected,
        );
        await fullyVisible(page, page.locator('#commit'));
        await fullyVisible(page, page.locator('#cancel'));
        await save('visible-height-resize', true);
        await page.setViewportSize({ width: 844, height: 390 });
        await page.waitForTimeout(200);
        await save('external-exit-preview', true);
      } else {
        throw new Error('Supported fullscreen request did not enter the app root');
      }
      expect(await stable(page)).toEqual(original);
      expect(
        await page.evaluate(() => {
          const a = (window as any).__LAST_FERRY__;
          return { motion: a.getMotionStatus(), muted: a.getAudioStatus().muted };
        }),
      ).toEqual(preferences);
    });
  } finally {
    await context.close();
  }
});

for (const scenario of ['rejected', 'unavailable'])
  test(`phone fullscreen ${scenario}: labeled mocked fallback leaves play usable`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
    });
    await context.addInitScript((scenario) => {
      Object.defineProperty(Element.prototype, 'requestFullscreen', {
        configurable: true,
        value:
          scenario === 'unavailable'
            ? undefined
            : function () {
                return Promise.reject(new DOMException('Test rejection', 'NotAllowedError'));
              },
      });
      if (scenario === 'unavailable')
        Object.defineProperty(document, 'fullscreenEnabled', {
          configurable: true,
          get: () => false,
        });
    }, scenario);
    const page = await context.newPage();
    try {
      await ready(page, 'holding-pier');
      await observed(page, `fullscreen-mocked-${scenario}`, async (save) => {
        const original = await stable(page);
        await press(page, 'menu');
        await press(page, 'fullscreen');
        await expect(page.locator('#view-notice')).toContainText(
          /fullscreen|screen|available|supported|could/i,
        );
        expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
        expect(await stable(page)).toEqual(original);
        await save('notice', true);
        await page.keyboard.press('Escape');
        await press(page, 'unload');
        await fullyVisible(page, page.locator('#commit'));
        await page.keyboard.press('Escape');
        expect(await stable(page)).toEqual(original);
      });
    } finally {
      await context.close();
    }
  });

test('desktop and other coves: keyboard overview, Bellwater outer route, First Crossing and arrival remain coherent', async ({
  page,
}) => {
  test.setTimeout(180000);
  await ready(page, 'bellwater');
  await observed(page, 'desktop-coves', async (save) => {
    await tabTo(page, 'view-toggle');
    await page.keyboard.press('Enter');
    await markerAlignment(page, true);
    for (const id of ['shallows', 'low-pier']) await move(page, id, false);
    await transfer(page, 'board', false);
    await move(page, 'east-buoy', false);
    await move(page, 'west-buoy', false);
    await move(page, 'harbor', false);
    await move(page, 'bell-pier', false);
    await transfer(page, 'board', false);
    await move(page, 'harbor', false);
    await transfer(page, 'unload', false);
    expect((await state(page)).status).toBe('won');
    await save('bellwater-won', true);
    await page.goto('/?cove=first-crossing');
    await page.waitForFunction(() => (window as any).__LAST_FERRY__?.getMetrics().frames > 4);
    await idle(page);
    await whole(page, false);
    await markerAlignment(page, true);
    await save('first-crossing-smoke', true);
    await page.goto('/?cove=holding-pier');
    await page.waitForFunction(() => (window as any).__LAST_FERRY__?.getMetrics().frames > 4);
    await idle(page);
    await tabTo(page, 'unload');
    await page.keyboard.press('Enter');
    await dialogCycle(page, 'cancel');
    await page.keyboard.press('Escape');
    expect((await state(page)).turn).toBe(0);
  });
});

test('phone won Overview: closing arrival then Whole cove retains the complete network', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
    viewport: { width: 844, height: 390 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  try {
    await ready(page, 'holding-pier');
    await observed(page, 'won-overview', async (save) => {
      await transfer(page, 'unload');
      await move(page, 'shallows');
      await move(page, 'rabbit-pier');
      await transfer(page, 'board');
      await move(page, 'shallows');
      await move(page, 'stone');
      await transfer(page, 'board');
      await move(page, 'harbor');
      if (await page.locator('#back-to-boat').isVisible()) await press(page, 'back-to-boat');
      await transfer(page, 'unload');
      await expect
        .poll(
          async () =>
            await page.evaluate(() => (window as any).__LAST_FERRY__.getHomecomingStatus().finite),
        )
        .toBe(false);
      const won = await stable(page);
      await press(page, 'cancel');
      await whole(page);
      const f = await frame(page),
        v = await viewport(page),
        c = v.canvas;
      await save('whole-cove', true);
      expect((await view(page)).mode).toBe('overview');
      expect(f.envelope.left + c.left).toBeGreaterThanOrEqual(v.usable.left - 1);
      expect(f.envelope.top + c.top).toBeGreaterThanOrEqual(v.usable.top - 1);
      expect(f.envelope.right + c.left).toBeLessThanOrEqual(v.usable.right + 1);
      expect(f.envelope.bottom + c.top).toBeLessThanOrEqual(v.usable.bottom + 1);
      for (const n of f.nodes) {
        expect(n.x + c.left).toBeGreaterThanOrEqual(v.usable.left);
        expect(n.x + c.left).toBeLessThanOrEqual(v.usable.right);
        expect(n.y + c.top).toBeGreaterThanOrEqual(v.usable.top);
        expect(n.y + c.top).toBeLessThanOrEqual(v.usable.bottom);
      }
      expect(await stable(page)).toEqual(won);
      expect(
        await page.evaluate(
          () => (window as any).__LAST_FERRY__.getHomecomingStatus().celebrations,
        ),
      ).toBe(1);
    });
  } finally {
    await context.close();
  }
});

test('phone synthesized cutout and VisualViewport offsets: general and action surfaces fit the shared safe bounds', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
    viewport: { width: 844, height: 390 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  try {
    await ready(page, 'holding-pier');
    await observed(page, 'synthesized-viewport', async (save) => {
      const original = await stable(page);
      await page.evaluate(() => {
        const app = document.querySelector<HTMLElement>('#app')!;
        for (const [side, value] of Object.entries({ left: 32, right: 28, top: 20, bottom: 16 }))
          app.style.setProperty(`--safe-${side}`, `${value}px`);
        const v = visualViewport!;
        Object.defineProperties(v, {
          offsetLeft: { configurable: true, value: 16 },
          offsetTop: { configurable: true, value: 12 },
          width: { configurable: true, value: 812 },
          height: { configurable: true, value: 366 },
        });
        dispatchEvent(new Event('resize'));
        v.dispatchEvent(new Event('resize'));
      });
      await page.waitForTimeout(250);
      const dimensions = await viewport(page);
      expect(dimensions.viewport).toEqual({ left: 16, top: 12, right: 828, bottom: 378 });
      expect(dimensions.safe).toEqual({ left: 56, top: 40, right: 792, bottom: 354 });
      await markerAlignment(page);
      const fits = async () => {
        const bounds = (await viewport(page)).safe,
          panel = await rect(page, 'dialog');
        expect(panel.left).toBeGreaterThanOrEqual(bounds.left - 0.5);
        expect(panel.top).toBeGreaterThanOrEqual(bounds.top - 0.5);
        expect(panel.right).toBeLessThanOrEqual(bounds.right + 0.5);
        expect(panel.bottom).toBeLessThanOrEqual(bounds.bottom + 0.5);
        await fullyVisible(page, page.locator('#cancel'));
      };
      await press(page, 'menu');
      await fits();
      await save('menu', true);
      await page.locator('#settings').scrollIntoViewIfNeeded();
      await press(page, 'settings');
      await fits();
      await save('settings', true);
      await page.locator('#settings-back').scrollIntoViewIfNeeded();
      await press(page, 'settings-back');
      await press(page, 'cancel');
      await press(page, 'status-toggle');
      await fits();
      await save('forecast', true);
      await press(page, 'cancel');
      await press(page, 'unload');
      await fits();
      await fullyVisible(page, page.locator('#commit'));
      await press(page, 'passenger-sheep-1');
      await fits();
      await fullyVisible(page, page.locator('#commit'));
      await save('action', true);
      expect(await stable(page)).toEqual(original);
      await press(page, 'cancel');
      expect(await stable(page)).toEqual(original);
    });
  } finally {
    await context.close();
  }
});

test('phone rendered marker anchors: independent world projection tracks both tide rises, view changes and rotation', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
    viewport: { width: 844, height: 390 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  try {
    await ready(page, 'holding-pier');
    await observed(page, 'rendered-marker-anchors', async (save) => {
      const align = async (label: string, shot = false) => {
        await page.evaluate(
          () =>
            new Promise<void>((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
            ),
        );
        const data = await page.evaluate(() => {
          const a = (window as any).__LAST_FERRY__,
            f = a.getFrameStatus();
          return {
            camera: f.camera,
            canvas: document.querySelector('canvas')!.getBoundingClientRect().toJSON(),
            waterY: a.getEnvironmentStatus().waterY,
            markers: a.getNavigationStatus().markers.map((m: any) => {
              const e = document.querySelector<HTMLElement>(`#map-${m.id} .map-hit`)!;
              return {
                id: m.id,
                worldPosition: m.worldPosition,
                offscreen: !!e.closest('.offscreen'),
                rect: e.getBoundingClientRect().toJSON(),
              };
            }),
          };
        });
        const inverse = new T.Matrix4().fromArray(data.camera.inverse),
          projection = new T.Matrix4().fromArray(data.camera.projection);
        const comparisons = data.markers
          .filter((m: any) => !m.offscreen)
          .map((m: any) => {
            const point = new T.Vector3()
              .fromArray(m.worldPosition)
              .applyMatrix4(inverse)
              .applyMatrix4(projection);
            const actual = {
              x: data.canvas.left + ((point.x + 1) * data.canvas.width) / 2,
              y: data.canvas.top + ((1 - point.y) * data.canvas.height) / 2,
            };
            const dom = { x: m.rect.left + m.rect.width / 2, y: m.rect.top + m.rect.height / 2 };
            return {
              id: m.id,
              worldPosition: m.worldPosition,
              actual,
              dom,
              dx: dom.x - actual.x,
              dy: dom.y - actual.y,
            };
          });
        if (label === 'rising-tide1') {
          expect(data.waterY).toBeGreaterThan(0);
          expect(data.waterY).toBeLessThan(0.18);
        }
        if (label === 'rising-tide2-overview') {
          expect(data.waterY).toBeGreaterThan(0.18);
          expect(data.waterY).toBeLessThan(0.36);
        }
        expect(comparisons.length).toBeGreaterThan(0);
        const evidence = await save(label, shot);
        evidence.independentAnchorProjection = {
          ...data,
          comparisons,
          method:
            'Node Three projection from actual Object3D worldPosition and renderer camera inverse/projection; no logical frame.nodes or world.project call',
        };
        for (const comparison of comparisons) {
          expect(
            Math.abs(comparison.dx),
            `${label} ${comparison.id} actual-world horizontal anchor`,
          ).toBeLessThan(1);
          expect(
            Math.abs(comparison.dy),
            `${label} ${comparison.id} actual-world vertical anchor`,
          ).toBeLessThan(1);
        }
      };
      await align('tide0');
      await transfer(page, 'unload');
      await move(page, 'shallows');
      await move(page, 'rabbit-pier');
      await press(page, 'board');
      await press(page, 'commit');
      await page.waitForFunction(() => {
        const y = (window as any).__LAST_FERRY__.getEnvironmentStatus().waterY;
        return y > 0.015 && y < 0.16;
      });
      await align('rising-tide1');
      await idle(page);
      await align('tide1', true);
      await move(page, 'shallows');
      await move(page, 'stone');
      await press(page, 'board');
      await fullyVisible(page, page.locator('#commit'));
      await align('board-footer-tide1', true);
      await press(page, 'commit');
      await idle(page);
      await whole(page);
      await place(page, 'harbor');
      await press(page, 'sail');
      await page.waitForFunction(() => {
        const y = (window as any).__LAST_FERRY__.getEnvironmentStatus().waterY;
        return y > 0.195 && y < 0.34;
      });
      await align('rising-tide2-overview');
      await idle(page);
      await align('tide2-overview', true);
      const original = await stable(page);
      await press(page, 'back-to-boat');
      await align('tide2-play');
      const water = await page.evaluate(() => {
        const a = (window as any).__LAST_FERRY__,
          c = document.querySelector('canvas')!,
          r = c.getBoundingClientRect();
        for (let y = 90; y < innerHeight - 80; y += 20)
          for (let x = 25; x < innerWidth - 120; x += 20)
            if (document.elementFromPoint(x, y) === c && !a.getPickDetailAt(x - r.left, y - r.top))
              return { x, y };
        return null;
      });
      expect(water).not.toBeNull();
      await page.mouse.move(water!.x, water!.y);
      await page.mouse.down();
      await page.mouse.move(water!.x + 80, water!.y + 35, { steps: 5 });
      await page.mouse.up();
      await align('tide2-panned');
      await press(page, 'back-to-boat');
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(150);
      await align('tide2-portrait', true);
      await whole(page);
      await align('tide2-portrait-overview');
      await press(page, 'back-to-boat');
      await page.setViewportSize({ width: 780, height: 320 });
      await page.waitForTimeout(150);
      await align('tide2-short-landscape', true);
      expect(await stable(page)).toEqual(original);
    });
  } finally {
    await context.close();
  }
});
