import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import {
  act,
  activate,
  dialogCycle,
  fullyVisible,
  idle,
  keyAct,
  navigation,
  readable,
  ready,
  rendered,
  state,
  tabTo,
  undo,
} from './ui';

const selection = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getSelectionStatus());
const snapshot = (page: Page) =>
  page.evaluate(() => {
    const api = (window as any).__LAST_FERRY__;
    return {
      state: api.getState(),
      history: api.getRenderStatus().historyLength,
      camera: api.getFrameStatus().camera,
      desiredMusic: api.getAudioStatus().desiredArrangement,
    };
  });
const mapRects = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('.map-target, .map-name')].map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        id: element.id || `${element.closest('button')!.id}-name`,
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
      };
    }),
  );

async function capture(page: Page, label: string, stage: string) {
  mkdirSync(reviewDir, { recursive: true });
  await page.screenshot({ path: `${reviewDir}/${label}-${stage}.png` });
}

async function surface(page: Page) {
  const observed = await page.evaluate(() => {
    const visible = (element: Element) =>
      !!(element as HTMLElement).offsetWidth &&
      !!(element as HTMLElement).offsetHeight &&
      !(element as HTMLElement).closest('[hidden]');
    const rect = (element: Element) => {
      const box = element.getBoundingClientRect();
      return {
        left: box.left,
        top: box.top,
        right: box.right,
        bottom: box.bottom,
        width: box.width,
        height: box.height,
      };
    };
    const entries = [
      ...document.querySelectorAll(
        '.map-target, .map-name, #dock-actions button, #undo, #wait, #menu, #sound-toggle, #status-toggle',
      ),
    ]
      .filter(visible)
      .map((element) => {
        const box = rect(element),
          button = element.closest('button')!,
          clipped: string[] = [];
        for (let parent = element.parentElement; parent; parent = parent.parentElement) {
          const style = getComputedStyle(parent),
            clip = rect(parent);
          if (
            /(auto|scroll|hidden|clip)/.test(style.overflowY) &&
            (box.top < clip.top - 0.5 || box.bottom > clip.bottom + 0.5)
          )
            clipped.push(`${parent.id || parent.className}: vertical`);
          if (
            /(auto|scroll|hidden|clip)/.test(style.overflowX) &&
            (box.left < clip.left - 0.5 || box.right > clip.right + 0.5)
          )
            clipped.push(`${parent.id || parent.className}: horizontal`);
        }
        const top = document.elementFromPoint(
          (box.left + box.right) / 2,
          (box.top + box.bottom) / 2,
        );
        return {
          id: element.id || `${button.id}-name`,
          owner: button.id,
          name: element.matches('.map-name'),
          disabled: button.disabled,
          hit: top?.closest('button')?.id,
          fontSize: parseFloat(getComputedStyle(element).fontSize),
          clipped,
          ...box,
        };
      });
    const canvas = document.querySelector('#world canvas')!.getBoundingClientRect(),
      scene = (window as any).__LAST_FERRY__.getFrameStatus();
    const objects = [
      scene.boat,
      scene.lighthouse,
      ...(scene.bell ? [scene.bell] : []),
      ...scene.passengers,
    ].map((item: any, i: number) => ({
      id: item.id ?? ['boat', 'lighthouse', 'bell'][i],
      left: canvas.left + item.left,
      top: canvas.top + item.top,
      right: canvas.left + item.right,
      bottom: canvas.top + item.bottom,
    }));
    return {
      entries,
      objects,
      viewport: { width: innerWidth, height: innerHeight },
      scrollWidth: document.documentElement.scrollWidth,
      scene,
    };
  });
  for (const item of observed.entries) {
    expect(item.left, `${item.id} left`).toBeGreaterThanOrEqual(0);
    expect(item.top, `${item.id} top`).toBeGreaterThanOrEqual(0);
    expect(item.right, `${item.id} right`).toBeLessThanOrEqual(observed.viewport.width + 0.5);
    expect(item.bottom, `${item.id} bottom`).toBeLessThanOrEqual(observed.viewport.height + 0.5);
    expect(item.clipped, `${item.id} ancestor clipping`).toEqual([]);
    expect(item.fontSize, `${item.id} readable text`).toBeGreaterThanOrEqual(14);
    expect(item.width, `${item.id} touch width`).toBeGreaterThanOrEqual(44);
    expect(item.height, `${item.id} touch height`).toBeGreaterThanOrEqual(44);
    if (!item.disabled) expect(item.hit, `${item.id} exposed center`).toBe(item.owner);
  }
  const intersects = (a: any, b: any) =>
    Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 &&
    Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5;
  for (let i = 0; i < observed.entries.length; i++)
    for (let j = i + 1; j < observed.entries.length; j++) {
      const a = observed.entries[i],
        b = observed.entries[j];
      if (a.owner !== b.owner)
        expect(intersects(a, b), `Overlapping controls: ${JSON.stringify({ a, b })}`).toBe(false);
    }
  for (const item of observed.entries.filter(
    (item) => item.name || ['board', 'unload'].includes(item.id),
  ))
    for (const object of observed.objects)
      expect(
        intersects(item, object),
        `${item.id} covers ${object.id}: ${JSON.stringify({ item, object })}`,
      ).toBe(false);
  expect(observed.scrollWidth).toBeLessThanOrEqual(observed.viewport.width);
  return observed;
}

async function previewFits(page: Page) {
  await expect(page.locator('#local-context')).toBeHidden();
  await expect(page.locator('#dock-actions')).toBeHidden();
  for (const selector of ['#cancel', '#commit', '.requirement', '.consequence']) {
    const element = page.locator(`#dialog ${selector}`);
    await fullyVisible(page, element, selector.startsWith('#'));
    await readable(element);
  }
  for (const option of await page.locator('.passenger-options button').all()) {
    await fullyVisible(page, option);
    await readable(option);
  }
}

async function repeatedTap(page: Page, id: string) {
  const rect = await page.locator(`#${id}`).boundingBox();
  expect(rect).not.toBeNull();
  const x = rect!.x + rect!.width / 2,
    y = rect!.y + rect!.height / 2;
  await page.touchscreen.tap(x, y);
  await page.touchscreen.tap(x, y);
  return { x, y };
}

async function modalBlocksMap(page: Page) {
  const before = await snapshot(page),
    selected = (await selection(page)).selectedId;
  const point = await page.evaluate(() => {
    const dialog = document.querySelector('#dialog')!.getBoundingClientRect();
    for (const element of document.querySelectorAll('.map-hit')) {
      const rect = element.getBoundingClientRect(),
        x = (rect.left + rect.right) / 2,
        y = (rect.top + rect.bottom) / 2;
      if (x < dialog.left || x > dialog.right || y < dialog.top || y > dialog.bottom)
        return { x, y };
    }
    return null;
  });
  expect(point).not.toBeNull();
  await page.touchscreen.tap(point!.x, point!.y);
  expect(await snapshot(page)).toEqual(before);
  expect((await selection(page)).selectedId).toBe(selected);
  await expect(page.locator('#dialog')).toBeVisible();
}

async function inspect(page: Page, id: string, content: string) {
  const before = await snapshot(page);
  await page.locator(`#map-${id} .map-name`).tap();
  await expect(page.locator('#local-context')).toContainText(content);
  await fullyVisible(page, page.locator('#local-context'), false);
  await fullyVisible(page, page.locator('#close-location'));
  expect(await snapshot(page)).toEqual(before);
  expect((await selection(page)).selectedId).toBe(id);
}

for (const [width, height] of [
  [844, 390],
  [780, 320],
]) {
  test(`cove interface Holding ${width}x${height}: free touch inspection, dock subsets, rise and complete rescue`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width, height },
      hasTouch: true,
      isMobile: true,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage(),
      errors: string[] = [],
      label = `holding-${width}x${height}`,
      checks: Record<string, any> = {};
    page.on('pageerror', (error) => errors.push(error.message));
    await ready(page, 'holding-pier');
    const initial = await snapshot(page),
      stableMap = await mapRects(page),
      initialDock = await page.locator('#dock-actions').boundingBox();
    await expect(page.locator('#local-context')).toBeHidden();
    await expect(page.locator('#dock-actions #unload')).toBeVisible();
    await expect(page.locator('#unload')).toContainText('Let ashore');
    checks.initial = await surface(page);
    expect(await page.locator('.map-target').count()).toBe(4);
    expect(await page.locator('.map-target :is(button,a,[tabindex])').count()).toBe(0);
    await capture(page, label, 'start-dock');
    await inspect(page, 'rabbit-pier', 'No direct passage from Stone Pier.');
    expect((await navigation(page)).routes.filter((route: any) => route.highlighted)).toEqual([]);
    await capture(page, label, 'remote');
    await inspect(page, 'shallows', 'Boat needs depth 2. Passage has depth 1: too shallow.');
    await expect(page.locator('#sail')).toBeDisabled();
    expect((await navigation(page)).routes.filter((route: any) => route.highlighted)).toHaveLength(
      1,
    );
    await capture(page, label, 'shallow');
    await inspect(page, 'harbor', 'Harbor');
    await fullyVisible(page, page.locator('#sail'));
    await expect(page.locator('#sail')).toContainText('1 action');
    const opening = await page.locator('#map-harbor .map-name').boundingBox(),
      sail = await page.locator('#sail').boundingBox();
    const openingCenter = {
      x: opening!.x + opening!.width / 2,
      y: opening!.y + opening!.height / 2,
    };
    expect(
      openingCenter.x < sail!.x ||
        openingCenter.x > sail!.x + sail!.width ||
        openingCenter.y < sail!.y ||
        openingCenter.y > sail!.y + sail!.height,
    ).toBe(true);
    await repeatedTap(page, 'map-harbor');
    expect(await snapshot(page)).toEqual(initial);
    expect(await mapRects(page)).toEqual(stableMap);
    expect(await page.locator('#dock-actions').boundingBox()).toEqual(initialDock);
    await capture(page, label, 'safe-travel');
    await page.keyboard.press('Escape');
    await tabTo(page, 'unload', true);
    await page.keyboard.press('Space');
    await previewFits(page);
    await dialogCycle(page);
    await modalBlocksMap(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('#unload')).toBeFocused();
    expect(await snapshot(page)).toEqual(initial);
    await page.locator('#map-stone .map-name').tap();
    await page.locator('#unload').tap();
    await previewFits(page);
    expect((await selection(page)).selectedId).toBe('stone');
    await repeatedTap(page, 'cancel');
    await expect(page.locator('#dialog')).toBeHidden();
    await expect(page.locator('#unload')).toBeFocused();
    await expect(page.locator('#local-context')).toBeVisible();
    expect(await snapshot(page)).toEqual(initial);
    await capture(page, label, 'cancel-restored');
    await page.locator('#unload').tap();
    await repeatedTap(page, 'commit');
    await idle(page);
    expect(await state(page)).toMatchObject({
      turn: 1,
      aboard: [],
      waitingByPier: { 'stone-pier': ['sheep-1'] },
    });
    expect((await rendered(page)).historyLength).toBe(1);
    await repeatedTap(page, 'map-shallows');
    expect((await state(page)).turn).toBe(1);
    await repeatedTap(page, 'sail');
    await idle(page);
    expect(await state(page)).toMatchObject({ turn: 2, boatNodeId: 'shallows' });
    await expect(page.locator('#dock-actions')).toBeHidden();
    await act(page, 'map-rabbit-pier', true);
    const dry = await state(page),
      dryView = await rendered(page);
    await activate(page, 'map-shallows', true);
    await activate(page, 'sail', true);
    await expect(page.locator('.consequence')).toContainText('This ends the crossing.');
    expect(await state(page)).toEqual(dry);
    await page.keyboard.press('Escape');
    await expect(page.locator('#sail')).toBeFocused();
    await activate(page, 'board', true);
    await previewFits(page);
    await expect(page.locator('.consequence')).toContainText('Both are safe aboard.');
    await activate(page, 'passenger-rabbit-2', true);
    await expect(page.locator('.consequence')).toContainText(
      'Rue is still waiting at Rabbit Pier when it floods. This ends the crossing.',
    );
    await previewFits(page);
    await capture(page, label, 'critical-subset');
    await activate(page, 'passenger-rabbit-2', true);
    await activate(page, 'commit', true);
    await idle(page);
    const risen = await state(page);
    expect(risen).toMatchObject({
      turn: 4,
      tideLevel: 1,
      status: 'playing',
      aboard: ['rabbit-1', 'rabbit-2'],
    });
    expect(await mapRects(page)).toEqual(stableMap);
    await expect(page.locator('#dock-actions')).toBeHidden();
    await activate(page, 'map-rabbit-pier', true);
    await expect(page.locator('#local-context')).toContainText(/flooded|under water/i);
    await activate(page, 'map-shallows', true);
    await expect(page.locator('#sail')).toBeEnabled();
    await fullyVisible(page, page.locator('#sail'));
    await capture(page, label, 'flooded-departure');
    await undo(page, true);
    expect(await state(page)).toEqual(dry);
    expect((await rendered(page)).waterY).toBe(dryView.waterY);
    await act(page, 'board', true);
    expect(await state(page)).toEqual(risen);
    await act(page, 'map-shallows', true);
    await act(page, 'map-stone', true);
    await expect(page.locator('#board')).toBeVisible();
    await expect(page.locator('#unload')).toBeVisible();
    await page.keyboard.press('Escape');
    checks.bothDirections = await surface(page);
    await act(page, 'board', true);
    await act(page, 'map-harbor', true);
    await expect(page.locator('#unload')).toContainText('Bring home');
    const beforeDelivery = await state(page);
    await act(page, 'unload', true);
    expect(await state(page)).toMatchObject({
      turn: 9,
      tideLevel: 2,
      status: 'won',
      delivered: ['rabbit-1', 'rabbit-2', 'sheep-1'],
    });
    await dialogCycle(page, 'terminal-undo');
    for (const id of ['terminal-undo', 'terminal-restart', 'next-cove'])
      await fullyVisible(page, page.locator(`#${id}`));
    await capture(page, label, 'success');
    await tabTo(page, 'terminal-undo');
    await page.keyboard.press('Enter');
    await idle(page);
    expect(await state(page)).toEqual(beforeDelivery);
    await expect(page.locator('#undo')).toBeFocused();
    expect(errors).toEqual([]);
    writeFileSync(
      `${reviewDir}/${label}-checks.json`,
      JSON.stringify(
        {
          viewport: [width, height],
          browser: browser.version(),
          input: 'Chromium emulated touch and natural keyboard',
          initial,
          dry,
          risen,
          beforeDelivery,
          checks,
          errors,
        },
        null,
        2,
      ),
    );
    await context.close();
  });

  test(`cove interface Bellwater ${width}x${height}: six stops, both dock directions and subset rescue`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width, height },
      hasTouch: true,
      isMobile: true,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage(),
      errors: string[] = [],
      label = `bellwater-${width}x${height}`;
    page.on('pageerror', (error) => errors.push(error.message));
    await ready(page, 'bellwater');
    expect(await page.locator('.map-target').count()).toBe(6);
    await expect(page.locator('#dock-actions')).toBeHidden();
    const initial = await snapshot(page),
      geometry = await surface(page);
    await capture(page, label, 'start');
    for (const id of ['harbor', 'shallows', 'low-pier', 'west-buoy', 'east-buoy', 'bell-pier']) {
      await page.locator(`#map-${id} .map-name`).tap();
      expect((await selection(page)).selectedId).toBe(id);
      await fullyVisible(page, page.locator('#local-context'), false);
      expect(await snapshot(page)).toEqual(initial);
    }
    await act(page, 'map-shallows', true);
    await act(page, 'map-low-pier', true);
    await activate(page, 'board', true);
    await previewFits(page);
    await activate(page, 'passenger-lark', true);
    await activate(page, 'commit', true);
    await idle(page);
    expect(await state(page)).toMatchObject({
      turn: 3,
      aboard: ['tansy'],
      waitingByPier: { 'low-pier': ['lark'] },
    });
    await page.keyboard.press('Escape');
    await expect(page.locator('#board')).toBeVisible();
    await expect(page.locator('#unload')).toBeVisible();
    const bothDirections = await surface(page),
      beforeLastRabbit = await state(page);
    await capture(page, label, 'both-directions');
    await activate(page, 'unload', true);
    await previewFits(page);
    await expect(page.locator('.consequence')).toContainText('This ends the crossing.');
    await page.keyboard.press('Escape');
    await expect(page.locator('#unload')).toBeFocused();
    expect(await state(page)).toEqual(beforeLastRabbit);
    await activate(page, 'board', true);
    await expect(page.locator('.consequence')).toContainText(
      'Lark boards, then the tide rises. Lark is safe aboard.',
    );
    await previewFits(page);
    await capture(page, label, 'critical-boarding');
    await activate(page, 'commit', true);
    await idle(page);
    expect(await state(page)).toMatchObject({
      turn: 4,
      tideLevel: 1,
      status: 'playing',
      aboard: ['tansy', 'lark'],
    });
    await expect(page.locator('#dock-actions')).toBeHidden();
    for (const id of [
      'map-shallows',
      'map-harbor',
      'map-bell-pier',
      'board',
      'map-harbor',
      'unload',
    ])
      await act(page, id, true);
    expect(await state(page)).toMatchObject({
      turn: 10,
      status: 'won',
      tideLevel: 2,
      delivered: ['tansy', 'lark', 'bram'],
    });
    await fullyVisible(page, page.locator('#terminal-undo'));
    await fullyVisible(page, page.locator('#terminal-restart'));
    await capture(page, label, 'success');
    expect(errors).toEqual([]);
    writeFileSync(
      `${reviewDir}/${label}-checks.json`,
      JSON.stringify(
        {
          viewport: [width, height],
          browser: browser.version(),
          initial,
          geometry,
          bothDirections,
          beforeLastRabbit,
          final: await state(page),
          errors,
        },
        null,
        2,
      ),
    );
    await context.close();
  });
}

test('cove interface desktop: natural keyboard, current ferry picking and First Crossing rescue', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page, 'first-crossing');
  const initial = await snapshot(page),
    geometry = await surface(page);
  await capture(page, 'desktop', 'first-crossing');
  await tabTo(page, 'map-sheep-pier');
  await page.keyboard.press('Space');
  await expect(page.locator('#local-heading')).toBeFocused();
  await tabTo(page, 'sail');
  await page.keyboard.down('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.up('Enter');
  await idle(page);
  expect(await state(page)).toMatchObject({ turn: 1, boatNodeId: 'sheep-pier' });
  await expect(page.locator('#board')).toBeVisible();
  await tabTo(page, 'board', true);
  await page.keyboard.press('Space');
  await previewFits(page);
  await dialogCycle(page);
  await page.keyboard.press('Escape');
  await expect(page.locator('#board')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#local-context')).toBeHidden();
  const beforePick = await snapshot(page);
  const point = await page.evaluate(() => {
    const api = (window as any).__LAST_FERRY__,
      scene = api.getFrameStatus(),
      canvas = document.querySelector('#world canvas')!,
      bounds = canvas.getBoundingClientRect();
    for (const fy of [0.5, 0.35, 0.65, 0.2, 0.8])
      for (const fx of [0.5, 0.35, 0.65, 0.2, 0.8]) {
        const x = scene.boat.left + (scene.boat.right - scene.boat.left) * fx,
          y = scene.boat.top + (scene.boat.bottom - scene.boat.top) * fy;
        if (
          api.getPickDetailAt(x, y)?.kind === 'ferry' &&
          document.elementFromPoint(bounds.left + x, bounds.top + y) === canvas
        )
          return { x: bounds.left + x, y: bounds.top + y };
      }
    return null;
  });
  expect(point).not.toBeNull();
  await page.mouse.click(point!.x, point!.y);
  expect(await snapshot(page)).toEqual(beforePick);
  expect((await selection(page)).selectedId).toBe('sheep-pier');
  await expect(page.locator('#sail')).toHaveCount(0);
  for (const id of ['board', 'wait', 'wait', 'map-cut', 'map-harbor', 'unload'])
    await keyAct(page, id);
  expect(await state(page)).toMatchObject({
    turn: 7,
    status: 'won',
    delivered: ['rabbit-1', 'rabbit-2', 'sheep-1'],
  });
  await expect(page.locator('#terminal-undo')).toBeFocused();
  await page.keyboard.press('Enter');
  await idle(page);
  expect(await state(page)).toMatchObject({ turn: 6, status: 'playing', delivered: [] });
  writeFileSync(
    `${reviewDir}/desktop-keyboard-checks.json`,
    JSON.stringify({ initial, geometry, ferryPick: point, final: await state(page) }, null, 2),
  );
});
