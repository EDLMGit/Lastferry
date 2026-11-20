import { expect, test, type Page } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import type { Action } from '../../src/game/rules';
import { activate, fullyVisible, idle, ready, state, undo, wholeCove } from './ui';
import { directory, localView, recordRescue, report, snapshot } from './large-cove-support';
import { action, coveData, savedJourney } from './optional-tips-support';
import { nodeName, type Level } from '../../src/levels/level';

const accepted = process.env.LAST_FERRY_MAP_BASELINE === '1';
const stage = accepted ? 'before' : 'after';
const journeyKey = 'last-ferry.journey.v1';
const witnesses = (id: string) =>
  JSON.parse(readFileSync('data/' + id + '/witnesses.json', 'utf8')).witnesses as {
    id: string;
    actions: Action[];
  }[];
const cases = [
  { name: 'reed-pier', cove: 'two-shelters', w: 844, h: 390, witness: 1, count: 3, whole: false },
  { name: 'wide-whole', cove: 'wide-berth', w: 780, h: 320, witness: 1, count: 0, whole: true },
  { name: 'harbor-quay', cove: 'wide-berth', w: 844, h: 390, witness: 1, count: 5, whole: false },
  { name: 'reef-loaded', cove: 'reef-return', w: 390, h: 844, witness: 0, count: 8, whole: false },
];
test.use({ hasTouch: true, isMobile: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });

function runtimeIdentity() {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory() ? walk(dir + '/' + entry.name) : [dir + '/' + entry.name],
    );
  const files = [
    ...walk('src'),
    ...walk('data'),
    ...walk('assets/portraits'),
    ...walk('cove-portrait-package/portraits'),
    ...walk('cove-panel-package/material'),
    'assets/catalog.json',
    'index.html',
    'package.json',
    'package-lock.json',
    'vite.config.ts',
  ].sort();
  const hash = (data: Buffer | string) => createHash('sha256').update(data).digest('hex');
  const manifest = Object.fromEntries(files.map((path) => [path, hash(readFileSync(path))]));
  return { files: manifest, identity: hash(JSON.stringify(manifest)) };
}
let source = '';
test.beforeEach(async ({ browser }) => {
  if (accepted) return;
  const runtime = runtimeIdentity();
  source = runtime.identity;
  report(directory('source'), runtime.identity, {
    ...runtime,
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    at: new Date().toISOString(),
    node: process.version,
    browser: browser.version(),
    platform: process.platform,
  });
});
test.afterEach(() => {
  if (!accepted) expect(runtimeIdentity().identity).toBe(source);
});

async function inspect(page: Page) {
  return page.evaluate(() => {
    const api = (window as any).__LAST_FERRY__;
    const box = (element: Element | null) => {
      if (
        !element ||
        element.closest('[hidden], .offscreen, [inert]') ||
        !element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
      )
        return null;
      const r = element.getBoundingClientRect();
      return r.width && r.height ? { x: r.x, y: r.y, w: r.width, h: r.height } : null;
    };
    const frame = api.getFrameStatus(),
      canvas = document.querySelector('#world canvas')!.getBoundingClientRect();
    const stops = frame.nodes.map((node: { id: string; x: number; y: number }) => {
      const stop = document.querySelector('#stop-' + node.id)!;
      const marker = stop.querySelector('.map-target')!;
      const name = stop.querySelector('.map-name');
      return {
        id: node.id,
        endpoint: { x: canvas.x + node.x, y: canvas.y + node.y },
        marker: box(marker.querySelector('.map-hit') ?? marker),
        name: box(name),
        accessible: marker.getAttribute('aria-label'),
      };
    });
    return {
      viewport: [innerWidth, innerHeight, devicePixelRatio],
      visualViewport: [visualViewport?.width, visualViewport?.height],
      scrollWidth: document.documentElement.scrollWidth,
      state: api.getState(),
      camera: api.getViewStatus(),
      boat: frame.boat,
      passengers: frame.passengers,
      stops,
      dock: box(document.querySelector('#dock-actions')),
      dockText: [
        getComputedStyle(document.querySelector('#dock-actions')!, '::before').content,
        document.querySelector('#dock-actions')?.textContent,
      ].join(' '),
      dockOwner: (document.querySelector('#dock-actions') as HTMLElement)?.dataset.owner,
      dockPlacement: (document.querySelector('#dock-actions') as HTMLElement)?.dataset.placement,
      card: box(document.querySelector('#local-context')),
      forecast: document.querySelector('#status-toggle')?.textContent,
      nav: api.getNavigationStatus(),
      tips: localStorage.getItem('last-ferry-tips'),
      saved: localStorage.getItem('last-ferry.journey.v1'),
      motion: api.getMotionStatus(),
      sound: api.getAudioStatus().intent,
      fullscreen: !!document.fullscreenElement,
    };
  });
}

function associations(measured: Awaited<ReturnType<typeof inspect>>, level: Level, whole: boolean) {
  const [w, h] = measured.viewport;
  expect(measured.scrollWidth).toBeLessThanOrEqual(w + 1);
  for (const stop of measured.stops as {
    id: string;
    endpoint: { x: number; y: number };
    marker: { x: number; y: number; w: number; h: number } | null;
    name: { x: number; y: number; w: number; h: number } | null;
    accessible: string;
  }[]) {
    expect(stop.accessible).toContain(nodeName(stop.id, level));
    if (whole) expect(stop.marker, 'Whole cove target ' + stop.id).not.toBeNull();
    if (!stop.marker) {
      expect(stop.name).toBeNull();
      continue;
    }
    if (stop.id === measured.state.boatNodeId && !stop.name)
      expect(measured.dockText, 'visible identity for the current landing').toContain(
        nodeName(stop.id, level),
      );
    const { x, y, w: mw, h: mh } = stop.marker,
      cx = x + mw / 2,
      cy = y + mh / 2;
    expect(mw).toBeGreaterThanOrEqual(44);
    expect(mh).toBeGreaterThanOrEqual(44);
    expect(
      Math.hypot(cx - stop.endpoint.x, cy - stop.endpoint.y),
      stop.id + ' drift from navigation endpoint',
    ).toBeLessThan(27);
    if (whole) {
      expect(Math.min(x, y)).toBeGreaterThanOrEqual(-1);
      expect(x + mw).toBeLessThanOrEqual(w + 1);
      expect(y + mh).toBeLessThanOrEqual(h + 1);
    }
    if (stop.name) {
      const b = stop.name;
      expect(
        Math.hypot(Math.max(0, b.x - cx, cx - b.x - b.w), Math.max(0, b.y - cy, cy - b.y - b.h)),
        stop.id + ' detached visible name',
      ).toBeLessThan(25);
      expect(Math.min(stop.endpoint.x, stop.endpoint.y)).toBeGreaterThanOrEqual(0);
      expect(stop.endpoint.x).toBeLessThanOrEqual(w);
      expect(stop.endpoint.y).toBeLessThanOrEqual(h);
    }
  }
  expect(measured.nav.routes.map((edge: { id: string }) => edge.id).sort()).toEqual(
    level.edges.map((e) => e.id).sort(),
  );
  if (measured.dock) {
    const owner = nodeName(measured.state.boatNodeId, level);
    expect(measured.dockOwner).toBe(owner);
    if (measured.dockPlacement === 'edge') expect(measured.dockText).toContain(owner);
    else {
      expect(measured.dockPlacement).toBe('local');
      const d = measured.dock;
      const parts = [
        measured.boat,
        ...measured.passengers.filter((p: { id: string }) => measured.state.aboard.includes(p.id)),
      ];
      const b = {
        left: Math.min(...parts.map((x: any) => x.left)),
        right: Math.max(...parts.map((x: any) => x.right)),
        top: Math.min(...parts.map((x: any) => x.top)),
        bottom: Math.max(...parts.map((x: any) => x.bottom)),
      };
      const distance = Math.hypot(
        Math.max(0, b.left - d.x - d.w, d.x - b.right),
        Math.max(0, b.top - d.y - d.h, d.y - b.bottom),
      );
      expect(distance, 'dock group must visibly adjoin its ferry').toBeLessThanOrEqual(12);
    }
  }
}

async function settle(page: Page) {
  await idle(page);
  await page.evaluate(
    () =>
      new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))),
  );
}

async function seed(page: Page) {
  await page.addInitScript(
    ({ key, value }) => {
      if (location.protocol.startsWith('http') && localStorage.getItem(key) === null)
        localStorage.setItem(key, value);
    },
    { key: journeyKey, value: savedJourney },
  );
}

for (const item of cases) {
  test('matched composition ' + item.name, async ({ page }) => {
    await page.setViewportSize({ width: item.w, height: item.h });
    await seed(page);
    await ready(page, item.cove);
    const { level } = coveData(item.cove),
      witness = witnesses(item.cove)[item.witness];
    for (const next of witness.actions.slice(0, item.count)) await action(page, next, level);
    if (item.whole) await wholeCove(page, true);
    else await localView(page);
    await settle(page);
    await expect(page.locator('#transfer-receipt')).toBeHidden({ timeout: 6000 });
    const result = await inspect(page);
    expect(result.state.turn).toBe(item.count);
    expect(result.saved).toBe(savedJourney);
    expect(result.tips).toBeNull();
    const dir = directory(stage);
    report(dir, item.name, {
      source: accepted ? '1b7b4f05e576614f061ca4949bf5aca705dc5e0e' : source,
      witness: witness.id,
      actions: witness.actions.slice(0, item.count),
      ...result,
    });
    await snapshot(page, dir, item.name);
    if (!accepted) associations(result, level, item.whole);
  });
}

const levelFile = (cove: string): Level =>
  JSON.parse(readFileSync('data/' + cove + '.level.json', 'utf8'));
test('free whole-cove inspection across remaining Practice coves and desktop', async ({
  page: phone,
  browser,
  baseURL,
}) => {
  const results = [];
  const desktop = await browser.newPage({
    baseURL,
    isMobile: false,
    hasTouch: false,
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  try {
    for (const [cove, w, h] of [
      ['first-crossing', 780, 320],
      ['holding-pier', 390, 844],
      ['bellwater', 844, 390],
      ['driftwood-yard', 780, 320],
      ['wide-berth', 1440, 900],
      ['reef-return', 780, 320],
    ] as const) {
      const touch = w < 1000;
      const page = touch ? phone : desktop;
      await page.setViewportSize({ width: w, height: h });
      await ready(page, cove);
      const level = levelFile(cove),
        initial = await state(page);
      await settle(page);
      const play = await inspect(page);
      associations(play, level, false);
      await wholeCove(page, touch);
      await settle(page);
      const overview = await inspect(page);
      associations(overview, level, true);
      for (const node of level.nodes) {
        const target = page.locator('#map-' + node.id + ' .map-hit');
        if (touch) await target.tap();
        else await target.click();
        await expect(page.locator('#local-context')).toHaveAccessibleName(
          new RegExp(nodeName(node.id, level)),
        );
        await activate(page, 'location-details', touch);
        await expect(page.locator('#location-facts')).toBeVisible();
        await activate(page, 'close-location', touch);
        expect(await state(page)).toEqual(initial);
      }
      results.push({
        cove,
        viewport: [w, h],
        input: touch ? 'touch' : 'mouse',
        touched: level.nodes.map((n) => n.id),
        playScale: play.camera.scale,
        wholeScale: overview.camera.scale,
      });
    }
    report(directory('checks'), 'overview-sweep', { source, results });
  } finally {
    await desktop.close();
  }
});

async function pan(page: Page, multi = false) {
  const point = await page.evaluate(() => {
    const c = document.querySelector('#world canvas')!;
    for (let y = 80; y < innerHeight - 85; y += 16)
      for (let x = 55; x < innerWidth - 105; x += 20) {
        if (
          document.elementFromPoint(x, y) === c &&
          document.elementFromPoint(x + 36, y + 16) === c &&
          document.elementFromPoint(x + 68, y + 18) === c
        )
          return { x, y };
      }
    throw Error('No unoccupied water drag found');
  });
  const cdp = await page.context().newCDPSession(page);
  const first = { ...point, id: 1 };
  try {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [first] });
    if (multi)
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [first, { x: point.x + 36, y: point.y + 16, id: 2 }],
      });
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: multi
        ? [
            { x: point.x - 10, y: point.y, id: 1 },
            { x: point.x + 68, y: point.y + 18, id: 2 },
          ]
        : [{ x: point.x + 24, y: point.y + 12, id: 1 }],
    });
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: multi
        ? [
            { x: point.x - 16, y: point.y, id: 1 },
            { x: point.x + 76, y: point.y + 18, id: 2 },
          ]
        : [{ x: point.x + 56, y: point.y + 22, id: 1 }],
    });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await settle(page);
  } finally {
    await cdp.detach();
  }
}

test.describe('actual rescues', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('Two Shelters continuous pan zoom inspect sail rotate recenter and rescue', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await seed(page);
    await ready(page, 'two-shelters');
    const level = levelFile('two-shelters'),
      witness = witnesses('two-shelters')[1];
    const original = await state(page);
    await page.locator('#load-toggle').tap();
    await page.locator('#close-status').tap();
    await expect
      .poll(() => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus().running))
      .toBe(true);
    const dir = directory('interaction');
    const stop = process.env.LAST_FERRY_MAP_RECORD
      ? await recordRescue(page, dir, 'shelters-interaction')
      : null;
    const events: Record<string, unknown>[] = [];
    try {
      await pan(page, true);
      expect(await state(page)).toEqual(original);
      await pan(page);
      const panned = await inspect(page);
      expect(panned.camera.panned).toBe(true);
      expect(panned.state).toEqual(original);
      await page.locator('#view-zoom').tap();
      const outward = [];
      if (await page.locator('#zoom-out').isEnabled()) {
        await activate(page, 'zoom-out', true);
        await settle(page);
        const wider = (await inspect(page)).camera;
        expect(wider.scale).toBeLessThan(panned.camera.scale - 0.5);
        outward.push(wider);
        await activate(page, 'zoom-in', true);
        await settle(page);
      }
      const preClose = (await inspect(page)).camera;
      await fullyVisible(page, page.locator('#zoom-in'));
      await activate(page, 'zoom-in', true);
      await settle(page);
      const close = (await inspect(page)).camera;
      expect(close.scale).toBeGreaterThan(preClose.scale + 0.5);
      await activate(page, 'zoom-out', true);
      await settle(page);
      const lessClose = (await inspect(page)).camera;
      expect(lessClose.scale).toBeLessThan(close.scale - 0.5);
      outward.push(lessClose);
      await activate(page, 'zoom-in', true);
      await page.locator('#view-zoom').tap();
      await settle(page);
      const adjusted = await inspect(page);
      expect(adjusted.camera.scale).not.toBeCloseTo(panned.camera.scale, 3);
      expect(adjusted.state).toEqual(original);
      events.push({ pan: panned.camera, outward, adjusted: adjusted.camera });
      const first = page.locator('#map-refuge .map-hit');
      if (!(await first.isVisible())) await wholeCove(page, true);
      const beforeInspect = (await inspect(page)).camera;
      await first.tap();
      await expect(page.locator('#sail')).toHaveAccessibleName(/Sail to High Refuge/);
      await fullyVisible(page, page.locator('#sail'));
      const inspected = await inspect(page);
      const marker = inspected.stops.find((place: { id: string }) => place.id === 'refuge').marker;
      const card = inspected.card!;
      if ((await page.locator('#local-context').getAttribute('data-placement')) === 'local') {
        const gap = Math.hypot(
          Math.max(0, marker.x - card.x - card.w, card.x - marker.x - marker.w),
          Math.max(0, marker.y - card.y - card.h, card.y - marker.y - marker.h),
        );
        expect(gap, 'inspected Sail belongs to selected target').toBeLessThanOrEqual(12);
      }
      expect(inspected.state).toEqual(original);
      expect(inspected.camera.focus).toEqual(beforeInspect.focus);
      expect(inspected.camera.scale).toBe(beforeInspect.scale);
      await activate(page, 'sail', true);
      await settle(page);
      expect(await state(page)).toMatchObject({ boatNodeId: 'refuge', turn: 1 });
      await page.setViewportSize({ width: 390, height: 844 });
      await settle(page);
      if (!(await page.locator('#back-to-boat').isVisible())) await pan(page);
      await fullyVisible(page, page.locator('#back-to-boat'));
      await activate(page, 'back-to-boat', true);
      const returned = await inspect(page);
      expect(returned.camera.panned).toBe(false);
      expect(returned.state).toMatchObject({ boatNodeId: 'refuge', turn: 1 });
      events.push({ returned: returned.camera, viewport: returned.viewport });
      let tide = false,
        terminal = false;
      for (const step of witness.actions.slice(1)) {
        const before = await state(page);
        const after = await action(page, step, level);
        if ((!tide && before.tideLevel !== after.tideLevel) || after.status === 'won') {
          await undo(page, true);
          expect(await state(page)).toEqual(before);
          await action(page, step, level);
          if (after.status === 'won') terminal = true;
          else tide = true;
        }
      }
      expect([tide, terminal]).toEqual([true, true]);
      expect((await state(page)).status).toBe('won');
      expect(await page.evaluate((key) => localStorage.getItem(key), journeyKey)).toBe(
        savedJourney,
      );
      await expect(page.locator('#dialog[open][data-outcome="won"]')).toBeVisible();
      if (stop) {
        await snapshot(page, dir, 'won-portrait');
        await page.waitForTimeout(2500);
      }
      report(dir, 'shelters', {
        source,
        actions: witness.actions,
        tideUndo: tide,
        terminalUndo: terminal,
        events,
        final: await state(page),
      });
    } finally {
      if (stop) await stop();
    }
  });

  test('Wide Berth occupied departure, ferry subsets, reef reversal and whole rescue', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 780, height: 320 });
    await seed(page);
    await ready(page, 'wide-berth');
    const level = levelFile('wide-berth'),
      witness = witnesses('wide-berth')[0];
    await wholeCove(page, true);
    const initial = await inspect(page);
    expect(initial.forecast).toMatch(/Wide Berth/i);
    expect(initial.forecast).toMatch(/Beacon Reef/i);
    expect(initial.tips).toBeNull();
    await activate(page, 'status-toggle', true);
    await expect(page.locator('#dialog')).toContainText(/Beacon Reef/);
    await activate(page, 'cancel', true);
    const flow = (m: typeof initial) =>
      m.nav.routes.find((r: { flowFrom?: string }) => r.flowFrom)?.flowFrom;
    let reversed = false;
    for (const step of witness.actions) {
      const before = await state(page);
      const after = await action(page, step, level);
      if (!reversed && before.tideLevel !== after.tideLevel) {
        expect(flow(await inspect(page))).not.toBe(flow(initial));
        await undo(page, true);
        expect(await state(page)).toEqual(before);
        expect(flow(await inspect(page))).toBe(flow(initial));
        await action(page, step, level);
        reversed = true;
      }
    }
    expect(reversed).toBe(true);
    expect((await state(page)).status).toBe('won');
    expect(await page.evaluate((key) => localStorage.getItem(key), journeyKey)).toBe(savedJourney);
    report(directory('checks'), 'wide-rescue', {
      source,
      actions: witness.actions,
      reefReversedAndUndone: reversed,
      final: await state(page),
    });
  });
});
