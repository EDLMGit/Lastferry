import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import {
  activate,
  ready as baseReady,
  state,
  rendered,
  navigation,
  idle,
  undo,
  restart,
  tabTo,
  fullyVisible,
  readable,
  wholeCove,
} from './ui';

async function ready(page: Page, cove = 'first-crossing') {
  await baseReady(page, cove);
  await wholeCove(page);
}

type HitKind = 'island' | 'pier' | 'landmark' | 'waypoint' | 'ferry';
type Point = { x: number; y: number; id: string; kind: HitKind; overlayControl: string | null };
const selection = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getSelectionStatus());
const frame = (page: Page) => page.evaluate(() => (window as any).__LAST_FERRY__.getFrameStatus());
const snapshot = (page: Page) =>
  page.evaluate(() => {
    const api = (window as any).__LAST_FERRY__;
    return {
      state: api.getState(),
      history: api.getRenderStatus().historyLength,
      desired: api.getAudioStatus().desiredArrangement,
      camera: api.getFrameStatus().camera,
    };
  });

async function pointFor(page: Page, id: string, kind: HitKind): Promise<Point> {
  const point = await page.evaluate(
    ({ id, kind }) => {
      const api = (window as any).__LAST_FERRY__,
        scene = api.getFrameStatus();
      const canvas = document.querySelector('#world canvas')!,
        rect = canvas.getBoundingClientRect();
      const targets =
        kind === 'ferry'
          ? [{ id, kind, ...scene.boat }]
          : scene.pickTargets.filter((target: any) => target.id === id && target.kind === kind);
      const fractions = [0.5, 0.35, 0.65, 0.2, 0.8, 0.1, 0.9];
      for (const target of targets)
        for (const fy of fractions)
          for (const fx of fractions) {
            const x = target.left + (target.right - target.left) * fx,
              y = target.top + (target.bottom - target.top) * fy;
            const hit = api.getPickDetailAt(x, y),
              top = document.elementFromPoint(rect.left + x, rect.top + y),
              overlayControl = top?.closest('button')?.id ?? null;
            if (
              hit?.id === id &&
              hit.kind === kind &&
              (top === canvas || (kind === 'waypoint' && overlayControl === `map-${id}`))
            )
              return {
                x: rect.left + x,
                y: rect.top + y,
                id,
                kind,
                overlayControl: top === canvas ? null : overlayControl,
              };
          }
      return null;
    },
    { id, kind },
  );
  expect(point, `No visible actual ${kind} hit for ${id}`).not.toBeNull();
  return point!;
}
async function emptyWater(page: Page) {
  const point = await page.evaluate(() => {
    const api = (window as any).__LAST_FERRY__,
      canvas = document.querySelector('#world canvas')!,
      rect = canvas.getBoundingClientRect();
    for (let y = 30; y < rect.height - 20; y += 30)
      for (let x = 30; x < rect.width - 20; x += 30)
        if (
          document.elementFromPoint(rect.left + x, rect.top + y) === canvas &&
          api.getPickDetailAt(x, y) === null
        )
          return { x: rect.left + x, y: rect.top + y };
    return null;
  });
  expect(point, 'A visible empty-water point must remain available').not.toBeNull();
  return point!;
}
async function hitPoint(page: Page, point: { x: number; y: number }, touch: boolean) {
  if (touch) await page.touchscreen.tap(point.x, point.y);
  else await page.mouse.click(point.x, point.y);
}
async function cardFits(page: Page) {
  await fullyVisible(page, page.locator('#local-context'), false);
  await fullyVisible(page, page.locator('#close-location'));
  for (const control of await page.locator('#local-actions button:visible').all()) {
    await fullyVisible(page, control);
    await readable(control);
  }
  for (const text of await page.locator('#local-context :is(p,h2)').all()) await readable(text);
  expect((await selection(page)).protectedOverlaps).toEqual([]);
  const overlap = await page.evaluate(() => {
    const api = (window as any).__LAST_FERRY__, scene = api.getFrameStatus();
    const canvas = document.querySelector('#world canvas')!.getBoundingClientRect();
    const card = document.querySelector('#local-context')!.getBoundingClientRect();
    const selected = api.getSelectionStatus().selectedId;
    const objects = [scene.boat, scene.lighthouse, ...(scene.bell ? [scene.bell] : []),
      ...scene.passengers, ...scene.places.filter((place: any) => place.id === selected)];
    return objects.filter((object: any) => {
      const width = Math.min(card.right, object.right + canvas.left) - Math.max(card.left, object.left + canvas.left);
      const height = Math.min(card.bottom, object.bottom + canvas.top) - Math.max(card.top, object.top + canvas.top);
      return width > 0.5 && height > 0.5;
    });
  });
  expect(overlap, 'The selected feature, ferry, passengers and defining landmarks stay outside the card').toEqual([]);
}

for (const [label, width, height, touch] of [
  ['desktop', 1440, 900, false],
  ['phone-844', 844, 390, true],
  ['phone-780', 780, 390, true],
] as const) {
  test(`selection ${label}: Whole cove island, pier, landmark, ferry and buoy hits are free and keep the camera stable`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      hasTouch: touch,
      isMobile: touch,
    });
    const page = await context.newPage();
    mkdirSync(reviewDir, { recursive: true });
    await ready(page, 'holding-pier');
    const initial = await snapshot(page),
      firstFrame = await frame(page),
      trace: any[] = [];
    expect(firstFrame.envelope.left).toBeGreaterThanOrEqual(8);
    expect(firstFrame.envelope.top).toBeGreaterThanOrEqual(8);
    expect(firstFrame.envelope.right).toBeLessThanOrEqual(firstFrame.canvas.width - 8);
    expect(firstFrame.envelope.bottom).toBeLessThanOrEqual(firstFrame.canvas.height - 8);
    await expect(page.locator('#local-context')).toBeHidden();
    if (!touch) {
      await page.locator('#map-harbor').hover();
      expect(
        (await navigation(page)).routes.filter((route: any) => route.highlighted),
      ).toHaveLength(1);
      await expect(page.locator('#local-context')).toBeHidden();
      await tabTo(page, 'map-rabbit-pier');
      expect(
        (await navigation(page)).routes.filter((route: any) => route.highlighted),
      ).toHaveLength(0);
      await expect(page.locator('#local-context')).toBeHidden();
      expect(await snapshot(page)).toEqual(initial);
    }
    for (const [id, kind] of [
      ['rabbit-pier', 'island'],
      ['harbor', 'pier'],
      ['harbor', 'landmark'],
      ['stone', 'ferry'],
      ['shallows', 'waypoint'],
    ] as [string, HitKind][]) {
      const water = await emptyWater(page);
      await hitPoint(page, water, touch);
      await expect(page.locator('#local-context')).toBeHidden();
      const point = await pointFor(page, id, kind);
      await hitPoint(page, point, touch);
      await expect(page.locator('#local-context')).toBeVisible();
      await expect(page.locator('#local-context')).toHaveAttribute('data-location', id);
      await expect(page.locator(`#map-${id}`)).toHaveAttribute('aria-expanded', 'true');
      expect((await selection(page)).selectedId).toBe(id);
      const nav = await navigation(page);
      expect(nav.markers.find((marker: any) => marker.id === id).selected).toBe(true);
      if (id === 'stone' || id === 'rabbit-pier')
        expect(nav.routes.filter((route: any) => route.highlighted)).toHaveLength(0);
      else expect(nav.routes.filter((route: any) => route.highlighted)).toHaveLength(1);
      await cardFits(page);
      expect(await snapshot(page)).toEqual(initial);
      trace.push({ point, selection: await selection(page), navigation: nav });
      await hitPoint(page, point, touch);
      expect((await selection(page)).selectedId).toBe(id);
      expect(await snapshot(page)).toEqual(initial);
    }
    await activate(page, 'close-location', touch);
    await expect(page.locator('#local-context')).toBeHidden();
    expect(await snapshot(page)).toEqual(initial);
    const currentFrame = await frame(page);
    expect(currentFrame.canvas).toEqual(firstFrame.canvas);
    expect(currentFrame.camera).toEqual(firstFrame.camera);
    const final = await snapshot(page);
    let unrelatedScenery = null;
    if (!touch) {
      await ready(page, 'first-crossing');
      await activate(page, 'map-sheep-pier');
      const beforeScenery = await snapshot(page);
      const sceneryPoint = await page.evaluate(() => {
        const api = (window as any).__LAST_FERRY__, scene = api.getFrameStatus();
        const canvas = document.querySelector('#world canvas')!, rect = canvas.getBoundingClientRect();
        for (const place of scene.nonInteractivePlaces) {
          const x = (place.left + place.right) / 2, y = (place.top + place.bottom) / 2;
          if (document.elementFromPoint(rect.left + x, rect.top + y) === canvas && api.getPickDetailAt(x, y) === null)
            return { x: rect.left + x, y: rect.top + y, place };
        }
        return null;
      });
      expect(sceneryPoint, 'The central decorative crag has an exposed noninteractive center').not.toBeNull();
      await page.mouse.click(sceneryPoint!.x, sceneryPoint!.y);
      await expect(page.locator('#local-context')).toBeHidden();
      expect((await selection(page)).selectedId).toBeNull();
      expect(await snapshot(page)).toEqual(beforeScenery);
      unrelatedScenery = { point: sceneryPoint, before: beforeScenery, after: await snapshot(page) };
    }
    writeFileSync(
      `${reviewDir}/selection-${label}-picking.json`,
      JSON.stringify(
        {
          input: touch ? 'Chromium emulated touch' : 'mouse and natural keyboard',
          viewport: [width, height],
          initial,
          frame: firstFrame,
          trace,
          final,
          unrelatedScenery,
        },
        null,
        2,
      ),
    );
    await context.close();
  });
}

test('selection regression: an explicit new place permits the next trusted Sail inside the previous 180ms fence', async ({ browser }) => {
  mkdirSync(reviewDir, { recursive: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await ready(page, 'holding-pier');
  expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getEnvironmentStatus().reducedMotion)).toBe(true);
  await activate(page, 'unload'); await activate(page, 'commit'); await idle(page);
  await activate(page, 'map-shallows');
  const first = await page.locator('#sail').boundingBox();
  await page.evaluate(() => {
    const runtime = window as any;
    runtime.__consecutiveSailClicks = [];
    runtime.__consecutiveSailTrace = (event: MouseEvent) => runtime.__consecutiveSailClicks.push({
      at: performance.now(), trusted: event.isTrusted, target: (event.target as HTMLElement).closest('button')?.id,
      x: event.clientX, y: event.clientY,
    });
    window.addEventListener('click', runtime.__consecutiveSailTrace, true);
  });
  await page.mouse.click(first!.x + first!.width / 2, first!.y + first!.height / 2);
  await page.waitForFunction(() => document.querySelector('#seascape')?.getAttribute('aria-busy') === 'false');
  const rabbit = await page.locator('#map-rabbit-pier').boundingBox();
  await page.mouse.click(rabbit!.x + rabbit!.width / 2, rabbit!.y + rabbit!.height / 2);
  const second = await page.locator('#sail').boundingBox();
  const x = second!.x + second!.width / 2, y = second!.y + second!.height / 2;
  await page.mouse.click(x, y);
  await page.waitForFunction(() => document.querySelector('#seascape')?.getAttribute('aria-busy') === 'false');
  const clicks = await page.evaluate(() => {
    const runtime = window as any;
    window.removeEventListener('click', runtime.__consecutiveSailTrace, true);
    return runtime.__consecutiveSailClicks;
  });
  const result = { clicks, gapMs: clicks[2]?.at - clicks[0]?.at, first, second, final: await snapshot(page) };
  writeFileSync(`${reviewDir}/consecutive-sail-regression.json`, JSON.stringify(result, null, 2));
  expect(clicks).toHaveLength(3);
  expect(clicks.every((click: any) => click.trusted)).toBe(true);
  expect(clicks.map((click: any) => click.target)).toEqual(['sail', 'map-rabbit-pier', 'sail']);
  expect(result.gapMs, 'The new intentional Sail must exercise the still-live old fence').toBeLessThanOrEqual(180);
  expect(result.final.state).toMatchObject({ turn: 3, boatNodeId: 'rabbit-pier' });
  expect(result.final.history).toBe(3);
  expect((await selection(page)).selectedId).toBeNull();
  await expect(page.locator('#board')).toBeVisible();
  await context.close();
});

test('selection regression: the arrived dock permits a deliberate local action inside the prior Sail fence', async ({ browser }) => {
  mkdirSync(reviewDir, { recursive: true });
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, reducedMotion: 'reduce', hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await ready(page, 'first-crossing');
  expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getEnvironmentStatus().reducedMotion)).toBe(true);
  await activate(page, 'map-sheep-pier', true);
  const sail = await page.locator('#sail').boundingBox();
  await page.evaluate(() => {
    (window as any).__localIntentClicks = [];
    window.addEventListener('click', (event) => {
      const api=(window as any).__LAST_FERRY__,v=api.getViewStatus();
      (window as any).__localIntentClicks.push({ at: performance.now(), trusted: event.isTrusted, target: (event.target as HTMLElement).closest('button')?.id ?? null,dialogOpen:!!document.querySelector('#dialog[open]'),selectedId:document.querySelector('.map-target[aria-expanded="true"]')?.id??null,snapshot:{state:api.getState(),history:api.getRenderStatus().historyLength,desiredMusic:api.getAudioStatus().desiredArrangement,view:{mode:v.mode,scale:v.scale,focus:v.focus}} });
    }, true);
  });
  await page.touchscreen.tap(sail!.x + sail!.width / 2, sail!.y + sail!.height / 2);
  await page.waitForFunction(() => document.querySelector('#seascape')?.getAttribute('aria-busy') === 'false');
  const board = await page.locator('#board').boundingBox();
  await page.touchscreen.tap(sail!.x + sail!.width / 2, sail!.y + sail!.height / 2);
  const x = board!.x + board!.width / 2, y = board!.y + board!.height / 2;
  await page.touchscreen.tap(x, y);
  const clicks = await page.evaluate(() => (window as any).__localIntentClicks);
  const arrived=clicks[1]?.snapshot;
  const final=await page.evaluate(()=>{const api=(window as any).__LAST_FERRY__,v=api.getViewStatus();return{state:api.getState(),history:api.getRenderStatus().historyLength,desiredMusic:api.getAudioStatus().desiredArrangement,view:{mode:v.mode,scale:v.scale,focus:v.focus}};});
  const result = { sail, board, gapMs: clicks[2]?.at - clicks[0]?.at, repeatGapMs: clicks[1]?.at - clicks[0]?.at, clicks, arrived, final, modalOpen: await page.locator('#dialog[open]').count() === 1 };
  writeFileSync(`${reviewDir}/arrived-local-action-regression.json`, JSON.stringify(result, null, 2));
  expect(clicks).toHaveLength(3);
  expect(clicks[0].target).toBe('sail');
  expect(clicks[2].target).toBe('board');
  expect(clicks[2].dialogOpen).toBe(false);
  expect(clicks[2].selectedId).toBeNull();
  expect(clicks[2].snapshot).toEqual(arrived);
  expect(clicks.every((click: any) => click.trusted)).toBe(true);
  expect(result.gapMs).toBeLessThanOrEqual(180);
  await expect(page.locator('#commit')).toBeVisible();
  await expect(page.locator('#cancel')).toBeFocused();
  expect(result.final).toEqual(arrived);
  expect(arrived.state).toMatchObject({ turn: 1, boatNodeId: 'sheep-pier' });
  expect(arrived.history).toBe(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('#board')).toBeFocused();
  await context.close();
});

test('selection lifecycle: repeated trusted actions, separate Escape layers, transit, visibility recovery, Undo and Restart', async ({
  browser,
}) => {
  const evidence: any[] = [];
  mkdirSync(reviewDir, { recursive: true });
  for (const reduced of [false, true]) {
    const context = await browser.newContext({
      viewport: { width: 844, height: 390 },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
      reducedMotion: reduced ? 'reduce' : 'no-preference',
    });
    const page = await context.newPage();
    await ready(page, 'holding-pier');
    const original = await snapshot(page);
    await tabTo(page, 'map-stone');
    await page.keyboard.press('Enter');
    await expect(page.locator('#local-heading')).toBeFocused();
    await page.keyboard.down('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.up('Enter');
    expect(await snapshot(page)).toEqual(original);
    await tabTo(page, 'unload');
    await page.keyboard.press('Enter');
    await expect(page.locator('#cancel')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#unload')).toBeFocused();
    await expect(page.locator('#local-context')).toBeVisible();
    expect((await selection(page)).selectedId).toBe('stone');
    await page.keyboard.press('Escape');
    await expect(page.locator('#local-context')).toBeHidden();
    await expect(page.locator('#map-stone')).toBeFocused();
    for (const id of ['wait', 'menu', 'status-toggle']) {
      await activate(page, id, true);
      await expect(page.locator('#dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator(`#${id}`)).toBeFocused();
      expect((await selection(page)).selectedId).toBeNull();
      await expect(page.locator('#local-context')).toBeHidden();
      expect(await snapshot(page)).toEqual(original);
    }
    await activate(page, 'unload', true);
    await page.evaluate(() => {
      const runtime = window as any;
      runtime.__selectionActionClicks = [];
      runtime.__selectionTrace = (event: MouseEvent) =>
        runtime.__selectionActionClicks.push({
          type: event.type,
          at: performance.now(),
          trusted: event.isTrusted,
          target: (event.target as HTMLElement).closest('button')?.id ?? '',
          x: event.clientX,
          y: event.clientY,
        });
      for (const type of ['pointerdown', 'pointerup', 'click']) window.addEventListener(type, runtime.__selectionTrace, true);
    });
    const confirm = await page.locator('#commit').boundingBox();
    await page.touchscreen.tap(confirm!.x + confirm!.width / 2, confirm!.y + confirm!.height / 2);
    await page.touchscreen.tap(confirm!.x + confirm!.width / 2, confirm!.y + confirm!.height / 2);
    await idle(page);
    expect(await state(page)).toMatchObject({
      turn: 1,
      boatNodeId: 'stone',
      aboard: [],
      waitingByPier: { 'stone-pier': ['sheep-1'] },
    });
    expect((await rendered(page)).historyLength).toBe(1);
    await expect(page.locator('#dialog')).toBeHidden();
    expect((await selection(page)).selectedId).toBe('stone');
    await activate(page, 'map-shallows', true);
    const beforeMove = await snapshot(page),
      sail = await page.locator('#sail').boundingBox();
    await page.touchscreen.tap(sail!.x + sail!.width / 2, sail!.y + sail!.height / 2);
    await page.touchscreen.tap(sail!.x + sail!.width / 2, sail!.y + sail!.height / 2);
    if (!reduced) await expect(page.locator('#local-context')).toBeHidden();
    await idle(page);
    expect(await state(page)).toMatchObject({ turn: 2, boatNodeId: 'shallows' });
    expect((await rendered(page)).historyLength).toBe(2);
    expect((await selection(page)).selectedId).toBe('shallows');
    await expect(page.locator('#local-context')).toBeVisible();
    await expect(page.locator('#local-context')).toContainText('Waypoint');
    const clicks = await page.evaluate(() => {
      const runtime = window as any;
      for (const type of ['pointerdown', 'pointerup', 'click']) window.removeEventListener(type, runtime.__selectionTrace, true);
      return runtime.__selectionActionClicks;
    });
    const downs = clicks.filter((event: any) => event.type === 'pointerdown');
    const ups = clicks.filter((event: any) => event.type === 'pointerup');
    expect(downs).toHaveLength(5);
    expect(ups).toHaveLength(5);
    expect(clicks.every((click: any) => click.trusted)).toBe(true);
    const committedClicks = clicks.filter((click: any) =>
      click.type === 'click' && ['commit', 'sail'].includes(click.target),
    );
    expect(committedClicks.filter((click: any) => click.target === 'commit')).toHaveLength(1);
    expect(committedClicks.filter((click: any) => click.target === 'sail')).toHaveLength(1);
    await activate(page, 'map-harbor', true);
    const beforeWait = await state(page);
    await activate(page, 'wait', true);
    await activate(page, 'commit', true);
    await idle(page);
    expect(await state(page)).toMatchObject({ turn: 3, boatNodeId: 'shallows' });
    expect((await selection(page)).selectedId).toBe('harbor');
    await expect(page.locator('#local-context')).toContainText('No direct passage from Shallows.');
    await undo(page, true);
    expect(await state(page)).toEqual(beforeWait);
    expect((await selection(page)).selectedId).toBeNull();
    await undo(page, true);
    expect(await state(page)).toEqual(beforeMove.state);
    expect((await selection(page)).selectedId).toBeNull();
    await expect(page.locator('#local-context')).toBeHidden();
    await activate(page, 'map-shallows', true);
    await activate(page, 'sail', true);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await idle(page);
    expect(await state(page)).toMatchObject({ turn: 2, boatNodeId: 'shallows' });
    expect((await selection(page)).selectedId).toBe('shallows');
    await expect(page.locator('#local-context')).toBeVisible();
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await restart(page, true);
    expect(await state(page)).toEqual(original.state);
    expect((await selection(page)).selectedId).toBeNull();
    await expect(page.locator('#local-context')).toBeHidden();
    evidence.push({
      reduced,
      original,
      clicks,
      confirmRepeatGapMs: downs[1].at - ups[0].at,
      sailRepeatGapMs: downs[4].at - ups[3].at,
      gapsMs: clicks.slice(1).map((click: any, i: number) => click.at - clicks[i].at),
      final: await snapshot(page),
    });
    await context.close();
  }
  writeFileSync(
    `${reviewDir}/selection-lifecycle-verification.json`,
    JSON.stringify(evidence, null, 2),
  );
});
