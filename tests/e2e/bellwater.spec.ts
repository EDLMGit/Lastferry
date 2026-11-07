import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir, productionURL } from './evidence';
import {
  activate,
  act,
  ready,
  state,
  rendered,
  navigation,
  idle,
  undo,
  keyAct,
  tabTo,
  fullyVisible,
  readable,
  wholeCove,
} from './ui';

const residents = ['tansy', 'lark', 'bram'];
const stops = ['harbor', 'shallows', 'low-pier', 'west-buoy', 'east-buoy', 'bell-pier'];
const outerOutward = ['map-west-buoy', 'map-east-buoy', 'map-low-pier'];
const homeward = ['map-shallows', 'map-harbor', 'map-bell-pier'];

async function bellReady(page: Page) {
  mkdirSync(`${reviewDir}/raw`, { recursive: true });
  await ready(page, 'bellwater');
  await expect(page.locator('h1')).toHaveText('Bellwater Cove');
  expect(await state(page)).toMatchObject({
    turn: 0,
    tideLevel: 0,
    boatNodeId: 'harbor',
    aboard: [],
    delivered: [],
    status: 'playing',
  });
}
async function capture(page: Page, label: string, scene: string) {
  await page.screenshot({ path: `${reviewDir}/bellwater-${label}-${scene}.png` });
}
async function readableMap(page: Page, input: 'mouse' | 'touch' | 'keyboard' = 'mouse') {
  if (input === 'keyboard') {
    if ((await page.locator('#view-toggle').textContent())?.includes('Whole cove')) {
      await tabTo(page, 'view-toggle');
      await page.keyboard.press('Enter');
    }
  } else await wholeCove(page, input === 'touch');
  for (const id of stops) {
    const button = page.locator(`#map-${id}`);
    await fullyVisible(page, button);
    await readable(button.locator('b'));
    await expect(button).toHaveAttribute('aria-controls', 'local-context');
    await expect(button).toHaveAttribute('aria-expanded', /^(true|false)$/);
  }
  for (const button of await page
    .locator(
      '#local-actions button:visible, #close-location:visible, #undo, #wait, #menu, #status-toggle',
    )
    .all()) {
    await fullyVisible(page, button);
    await readable(button);
  }
  const groups = await page.locator('.map-stop, #local-context, #status-toggle').all();
  const visible = [];
  for (const group of groups) {
    if (!(await group.isVisible())) continue;
    const bounds = await group.boundingBox();
    if (bounds) visible.push({ id: await group.getAttribute('id'), ...bounds });
  }
  for (let i = 0; i < visible.length; i++)
    for (let j = i + 1; j < visible.length; j++) {
      const a = visible[i],
        b = visible[j];
      const width = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      const height = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      expect(
        width <= 0.5 || height <= 0.5,
        JSON.stringify({ viewport: page.viewportSize(), first: a, second: b, width, height }),
      ).toBe(true);
    }
  const frame = await page.evaluate(() => (window as any).__LAST_FERRY__.getFrameStatus());
  expect(frame.envelope.left).toBeGreaterThanOrEqual(8);
  expect(frame.envelope.top).toBeGreaterThanOrEqual(8);
  expect(frame.envelope.right).toBeLessThanOrEqual(frame.canvas.width - 8);
  expect(frame.envelope.bottom).toBeLessThanOrEqual(frame.canvas.height - 8);
  expect(frame.lighthouse.top).toBeGreaterThanOrEqual(8);
  expect(frame.lighthouse.bottom).toBeLessThan(frame.canvas.height - 8);
  expect(frame.bell).not.toBeNull();
  expect(frame.bell.top).toBeGreaterThanOrEqual(8);
  expect(frame.bell.bottom).toBeLessThan(frame.canvas.height - 8);
  expect(frame.bell.left).toBeGreaterThanOrEqual(8);
  expect(frame.bell.right).toBeLessThan(frame.canvas.width - 8);
  for (const node of frame.nodes) {
    expect(node.x).toBeGreaterThan(0);
    expect(node.x).toBeLessThan(frame.canvas.width);
    expect(node.y).toBeGreaterThan(0);
    expect(node.y).toBeLessThan(frame.canvas.height);
  }
  for (const passenger of frame.passengers) expect(passenger.height).toBeGreaterThan(22);
  return frame;
}
async function lowPierLabelClearsAboardRabbits(page: Page) {
  expect(await state(page)).toMatchObject({
    turn: 4,
    tideLevel: 1,
    boatNodeId: 'east-buoy',
    aboard: ['tansy', 'lark'],
  });
  const label = await page.locator('#stop-low-pier').boundingBox();
  const canvas = await page.locator('#world canvas').boundingBox();
  const frame = await page.evaluate(() => (window as any).__LAST_FERRY__.getFrameStatus());
  expect(label).not.toBeNull();
  expect(canvas).not.toBeNull();
  for (const id of ['tansy', 'lark']) {
    const model = frame.passengers.find((passenger: any) => passenger.id === id);
    const left = canvas!.x + model.left,
      right = canvas!.x + model.right;
    const top = canvas!.y + model.top,
      bottom = canvas!.y + model.bottom;
    const width = Math.min(label!.x + label!.width, right) - Math.max(label!.x, left);
    const height = Math.min(label!.y + label!.height, bottom) - Math.max(label!.y, top);
    expect(
      width <= 0.5 || height <= 0.5,
      JSON.stringify({
        label,
        passenger: id,
        renderedBounds: { left, right, top, bottom },
        width,
        height,
      }),
    ).toBe(true);
  }
}
async function previewFits(page: Page) {
  for (const selector of ['#commit', '.requirement', '.consequence'])
    await fullyVisible(page, page.locator(selector), selector === '#commit');
  for (const paragraph of await page.locator('#dialog p').all()) await readable(paragraph);
  for (const button of await page.locator('.passenger-options button').all()) {
    await fullyVisible(page, button);
    await readable(button);
  }
}
async function won(page: Page) {
  const final = await state(page);
  expect(final).toMatchObject({
    turn: 10,
    tideLevel: 2,
    boatNodeId: 'harbor',
    status: 'won',
    aboard: [],
    lossReason: null,
  });
  expect([...final.delivered].sort()).toEqual([...residents].sort());
  expect(Object.values(final.waitingByPier).flat()).toEqual([]);
  await expect(page.locator('#dialog-title')).toHaveText('Bellwater is safe.');
  await fullyVisible(page, page.locator('#terminal-undo'));
  await fullyVisible(page, page.locator('#terminal-restart'));
  return final;
}
async function restored(page: Page, prior: any, priorRender: any, touch = false) {
  await undo(page, touch);
  expect(await state(page)).toEqual(prior);
  const view = await rendered(page);
  expect(view.boatPosition).toEqual(priorRender.boatPosition);
  expect(view.waterY).toBe(priorRender.waterY);
  expect(view.passengers.map((passenger: any) => [passenger.id, passenger.parent])).toEqual(
    priorRender.passengers.map((passenger: any) => [passenger.id, passenger.parent]),
  );
}

test('Bellwater mouse: uninterrupted shallow outward, blocked return, deep return and ten-action rescue', async ({
  page,
}) => {
  await bellReady(page);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const initial = await state(page),
    frame = await readableMap(page),
    trace = [initial];
  await capture(page, 'desktop', 'start');
  for (const id of ['map-shallows', 'map-low-pier', 'board']) {
    await act(page, id);
    trace.push(await state(page));
    if (id === 'map-low-pier') await readableMap(page);
  }
  const blocked = await state(page),
    history = (await rendered(page)).historyLength;
  await activate(page, 'map-shallows');
  await expect(page.locator('#local-context')).toContainText(
    'Boat needs depth 2. Passage has depth 1: too shallow.',
  );
  await expect(page.locator('#sail')).toBeDisabled();
  expect(await state(page)).toEqual(blocked);
  expect((await rendered(page)).historyLength).toBe(history);
  const highlight = await navigation(page);
  expect(highlight.selectedDestination).toBe('shallows');
  expect(highlight.routes.filter((route: any) => route.highlighted)).toHaveLength(1);
  expect(highlight.routes.find((route: any) => route.highlighted).nodes.sort()).toEqual([
    'low-pier',
    'shallows',
  ]);
  await capture(page, 'desktop', 'blocked-return');
  await activate(page, 'close-location');
  for (const id of ['map-east-buoy', 'map-west-buoy', 'map-harbor', 'map-bell-pier']) {
    await act(page, id);
    trace.push(await state(page));
    if ((await state(page)).turn === 4) {
      await readableMap(page);
      await lowPierLabelClearsAboardRabbits(page);
      await capture(page, 'desktop', 'after-rise');
    }
  }
  await readableMap(page);
  await activate(page, 'board');
  await expect(page.locator('.requirement')).toHaveText('After boarding: boat needs depth 3.');
  await expect(page.locator('.consequence')).toContainText(
    'Bram boards, then the tide rises. Bram is safe aboard.',
  );
  await previewFits(page);
  await capture(page, 'desktop', 'critical-boarding');
  await activate(page, 'commit');
  await idle(page);
  trace.push(await state(page));
  expect(await state(page)).toMatchObject({ turn: 8, tideLevel: 2, status: 'playing' });
  await capture(page, 'desktop', 'after-second-rise');
  for (const id of ['map-harbor', 'unload']) {
    await act(page, id);
    trace.push(await state(page));
  }
  const final = await won(page);
  expect(trace.map((step) => step.turn)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  expect(errors).toEqual([]);
  await capture(page, 'desktop', 'success');
  writeFileSync(
    `${reviewDir}/bellwater-mouse-witness.json`,
    JSON.stringify(
      {
        initial,
        frame,
        trace,
        final,
        errors,
        browser: await page.evaluate(() => navigator.userAgent),
      },
      null,
      2,
    ),
  );
  const video = page.video();
  await page.close();
  await video?.saveAs(`${reviewDir}/raw/bellwater-uninterrupted.webm`);
});

test('Bellwater natural keyboard: deep outward, shallow return, both tide Undo and terminal Undo', async ({
  page,
}) => {
  await bellReady(page);
  const original = await state(page);
  await tabTo(page, 'map-shallows');
  await page.keyboard.press('Enter');
  await expect(page.locator('#local-heading')).toBeFocused();
  await tabTo(page, 'sail');
  await expect(page.locator('#sail')).toBeFocused();
  await tabTo(page, 'close-location', true);
  await expect(page.locator('#close-location')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#map-shallows')).toBeFocused();
  expect(await state(page)).toEqual(original);
  for (const id of outerOutward) await keyAct(page, id);
  await readableMap(page, 'keyboard');
  const beforeFirst = await state(page),
    firstView = await rendered(page);
  await keyAct(page, 'board');
  expect(await state(page)).toMatchObject({
    turn: 4,
    tideLevel: 1,
    aboard: ['tansy', 'lark'],
    status: 'playing',
  });
  await tabTo(page, 'undo', true);
  await page.keyboard.press('Enter');
  expect(await state(page)).toEqual(beforeFirst);
  expect((await rendered(page)).waterY).toBe(firstView.waterY);
  await keyAct(page, 'board');
  await readableMap(page, 'keyboard');
  for (const id of homeward) await keyAct(page, id);
  await readableMap(page, 'keyboard');
  const beforeSecond = await state(page),
    secondView = await rendered(page);
  await keyAct(page, 'board');
  expect(await state(page)).toMatchObject({ turn: 8, tideLevel: 2, status: 'playing' });
  await tabTo(page, 'undo', true);
  await page.keyboard.press('Enter');
  expect(await state(page)).toEqual(beforeSecond);
  expect((await rendered(page)).waterY).toBe(secondView.waterY);
  await keyAct(page, 'board');
  await keyAct(page, 'map-harbor');
  const beforeDelivery = await state(page);
  await keyAct(page, 'unload');
  await won(page);
  await expect(page.locator('#terminal-undo')).toBeFocused();
  await page.keyboard.press('Enter');
  expect(await state(page)).toEqual(beforeDelivery);
  await keyAct(page, 'unload');
  await won(page);
});

for (const width of [844, 780]) {
  test(`Bellwater ${width}x390 touch: six stops, actual subset loss, safe boundaries, complete Undo and rescue`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width, height: 390 },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage(),
      errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await bellReady(page);
    const frame = await readableMap(page, 'touch'),
      label = `phone-${width}`;
    await capture(page, label, 'start');
    const initial = await state(page);
    await activate(page, 'map-west-buoy', true);
    await expect(page.locator('#local-context')).toBeVisible();
    await fullyVisible(page, page.locator('#sail'));
    expect(await state(page)).toEqual(initial);
    const inspected = await navigation(page);
    expect(inspected.selectedDestination).toBe('west-buoy');
    expect(inspected.routes.filter((route: any) => route.highlighted)).toHaveLength(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('#map-west-buoy')).toBeFocused();
    for (const id of outerOutward) await act(page, id, true);
    await readableMap(page, 'touch');
    const beforeFirst = await state(page),
      firstView = await rendered(page);
    await activate(page, 'board', true);
    await expect(page.locator('.consequence')).toContainText(
      'Tansy and Lark board, then the tide rises. Both are safe aboard.',
    );
    await previewFits(page);
    await capture(page, label, 'critical-boarding');
    await activate(page, 'passenger-lark', true);
    await expect(page.locator('.consequence')).toContainText(
      'Tansy boards, then the tide rises. Lark is still waiting at Low Pier when it floods. This ends the crossing.',
    );
    await previewFits(page);
    await capture(page, label, 'subset-warning');
    await activate(page, 'commit', true);
    await idle(page);
    expect(await state(page)).toMatchObject({
      turn: 4,
      tideLevel: 1,
      status: 'lost',
      lossReason: { passengerIds: ['lark'] },
    });
    await restored(page, beforeFirst, firstView, true);
    await act(page, 'board', true);
    expect(await state(page)).toMatchObject({
      turn: 4,
      tideLevel: 1,
      status: 'playing',
      aboard: ['tansy', 'lark'],
    });
    await restored(page, beforeFirst, firstView, true);
    await act(page, 'board', true);
    await readableMap(page, 'touch');
    await capture(page, label, 'after-rise');
    for (const id of homeward) await act(page, id, true);
    await readableMap(page, 'touch');
    const beforeSecond = await state(page),
      secondView = await rendered(page);
    await activate(page, 'board', true);
    await expect(page.locator('.consequence')).toContainText(
      'Bram boards, then the tide rises. Bram is safe aboard.',
    );
    await expect(page.locator('.requirement')).toHaveText('After boarding: boat needs depth 3.');
    await previewFits(page);
    await capture(page, label, 'sheep-boarding');
    await activate(page, 'commit', true);
    await idle(page);
    expect(await state(page)).toMatchObject({ turn: 8, tideLevel: 2, status: 'playing' });
    await restored(page, beforeSecond, secondView, true);
    await act(page, 'board', true);
    await act(page, 'map-harbor', true);
    const beforeDelivery = await state(page),
      deliveryView = await rendered(page);
    await act(page, 'unload', true);
    const final = await won(page);
    await capture(page, label, 'success');
    await restored(page, beforeDelivery, deliveryView, true);
    expect(errors).toEqual([]);
    writeFileSync(
      `${reviewDir}/bellwater-${label}-witness.json`,
      JSON.stringify(
        {
          viewport: [width, 390],
          input: 'emulated touch',
          frame,
          beforeFirst,
          beforeSecond,
          final,
          errors,
          browser: browser.version(),
        },
        null,
        2,
      ),
    );
    await context.close();
  });
}

test('default Holding entry, accessible Next cove and Menu selection reset Bellwater and baseline', async ({
  page,
}) => {
  mkdirSync(reviewDir, { recursive: true });
  await page.goto('/');
  await page.waitForFunction(() => (window as any).__LAST_FERRY__?.getMetrics().frames > 4);
  await expect(page.locator('h1')).toHaveText('The Holding Pier');
  expect(await state(page)).toMatchObject({ turn: 0, boatNodeId: 'stone', aboard: ['sheep-1'] });
  for (const id of [
    'unload',
    'map-shallows',
    'map-rabbit-pier',
    'board',
    'map-shallows',
    'map-stone',
    'board',
    'map-harbor',
    'unload',
  ])
    await act(page, id);
  await fullyVisible(page, page.locator('#next-cove'));
  await tabTo(page, 'next-cove');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/cove=bellwater/);
  await page.waitForFunction(() => (window as any).__LAST_FERRY__?.getMetrics().frames > 4);
  await expect(page.locator('h1')).toHaveText('Bellwater Cove');
  expect(await state(page)).toMatchObject({
    turn: 0,
    tideLevel: 0,
    boatNodeId: 'harbor',
    aboard: [],
    delivered: [],
    status: 'playing',
  });
  expect(
    Object.values((await state(page)).waitingByPier)
      .flat()
      .sort(),
  ).toEqual([...residents].sort());
  await activate(page, 'menu');
  await page.locator('#cove-picker').selectOption('first-crossing');
  await expect(page).toHaveURL(/cove=first-crossing/);
  await page.waitForFunction(() => (window as any).__LAST_FERRY__?.getState().boatNodeId === 'cut');
  await expect(page.locator('h1')).toHaveText('The First Crossing');
  expect(await state(page)).toMatchObject({ turn: 0, aboard: ['rabbit-1', 'rabbit-2'] });
  await activate(page, 'menu');
  await page.locator('#cove-picker').selectOption('bellwater');
  await expect(page).toHaveURL(/cove=bellwater/);
  await page.waitForFunction(
    () => (window as any).__LAST_FERRY__?.getState().boatNodeId === 'harbor',
  );
  expect((await state(page)).turn).toBe(0);
  await expect(page.locator('#status-headline')).toContainText('Low Pier');
});

for (const plan of ['Bell Pier first', 'deep route both ways', 'early rabbit delivery']) {
  test(`Bellwater unsuccessful plan: ${plan} has its actual deadline consequence and Undo`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await bellReady(page);
    const setup =
      plan === 'Bell Pier first'
        ? ['map-bell-pier', 'board', 'map-harbor']
        : [
            ...outerOutward,
            'board',
            ...(plan === 'deep route both ways'
              ? ['map-east-buoy', 'map-west-buoy', 'map-harbor']
              : ['map-shallows', 'map-harbor', 'unload']),
          ];
    for (const id of setup) await act(page, id);
    const before = await state(page),
      beforeRender = await rendered(page);
    const lossTarget = plan === 'Bell Pier first' ? 'map-west-buoy' : 'map-bell-pier';
    await activate(page, lossTarget);
    await activate(page, 'sail');
    await expect(page.locator('.consequence')).toContainText('This ends the crossing.');
    await expect(page.locator('.consequence')).toContainText(
      plan === 'Bell Pier first' ? 'Tansy and Lark' : 'Bram',
    );
    expect(await state(page)).toEqual(before);
    await activate(page, 'commit');
    await idle(page);
    expect(await state(page)).toMatchObject({
      status: 'lost',
      turn: plan === 'Bell Pier first' ? 4 : 8,
      tideLevel: plan === 'Bell Pier first' ? 1 : 2,
    });
    await restored(page, before, beforeRender);
  });
}

test('Bellwater production: real ten-action rescue without debug controls or external assets', async ({
  page,
}) => {
  const errors: string[] = [],
    external: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (!request.url().startsWith(productionURL)) external.push(request.url());
  });
  await page.goto(`${productionURL}/?cove=bellwater`);
  await expect(page.locator('canvas')).toBeVisible();
  expect(await page.evaluate(() => typeof (window as any).__LAST_FERRY__)).toBe('undefined');
  for (const id of [
    'map-shallows',
    'map-low-pier',
    'board',
    'map-east-buoy',
    'map-west-buoy',
    'map-harbor',
    'map-bell-pier',
    'board',
    'map-harbor',
    'unload',
  ])
    await act(page, id);
  await expect(page.locator('#dialog-title')).toHaveText('Bellwater is safe.');
  await expect(page.getByTestId('turn')).toHaveText('10');
  await expect(page.locator('#progress')).toHaveText('Home 3/3');
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
