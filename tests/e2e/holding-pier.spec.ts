import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir, productionURL } from './evidence';
import {
  act,
  ready as baseReady,
  state,
  idle,
  undo,
  restart,
  keyAct,
  tabTo,
  fullyVisible,
} from './ui';

async function ready(page: Page) {
  mkdirSync(reviewDir, { recursive: true });
  await baseReady(page, 'holding-pier');
}
const shot = (page: Page, name: string) => page.screenshot({ path: `${reviewDir}/${name}.png` });

test('Holding Pier: uninterrupted nine-action actual UI rescue and gameplay evidence', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await ready(page);
  await shot(page, 'desktop-normal');
  const trace = [await state(page)];
  await page.waitForTimeout(700);
  await page.locator('#map-shallows').click();
  await expect(page.locator('#dialog')).toContainText(
    'Boat needs depth 2. Passage has depth 1: too shallow.',
  );
  expect(await state(page)).toEqual(trace[0]);
  await page.waitForTimeout(600);
  await page.locator('#cancel').click();
  await page.locator('#unload').click();
  await expect(page.locator('#dialog')).toContainText('After unloading: boat needs depth 1.');
  await expect(page.locator('#dialog')).toContainText('Moss will wait at Stone Pier.');
  await fullyVisible(page, page.locator('#commit'));
  await shot(page, 'desktop-unloading-preview');
  await page.waitForTimeout(600);
  await page.locator('#commit').click();
  await idle(page);
  trace.push(await state(page));
  expect(trace.at(-1)).toMatchObject({ turn: 1, waitingByPier: { 'stone-pier': ['sheep-1'] } });
  await shot(page, 'desktop-holding-sheep');
  await page.waitForTimeout(600);
  for (const id of ['map-shallows', 'map-rabbit-pier']) {
    await act(page, id);
    trace.push(await state(page));
    await page.waitForTimeout(450);
  }
  const before = await state(page);
  await page.locator('#board').click();
  await expect(page.locator('#dialog')).toContainText('After boarding: boat needs depth 2.');
  await expect(page.locator('.consequence')).toContainText(
    /Pip and Rue board(?:, then the tide rises| first\. The tide then rises)\. Both are safe aboard\./,
  );
  await expect(page.locator('.consequence')).toContainText('Both are safe aboard.');
  expect(await state(page)).toEqual(before);
  await shot(page, 'desktop-loading-preview');
  await page.waitForTimeout(900);
  await page.locator('#commit').click();
  await idle(page);
  trace.push(await state(page));
  expect(trace.at(-1)).toMatchObject({
    turn: 4,
    tideLevel: 1,
    status: 'playing',
    waitingByPier: { 'rabbit-pier': [] },
  });
  await shot(page, 'desktop-after-tide');
  await page.waitForTimeout(650);
  for (const id of ['map-shallows', 'map-stone', 'board', 'map-harbor', 'unload']) {
    await act(page, id);
    trace.push(await state(page));
    await page.waitForTimeout(450);
  }
  expect(trace.map((entry) => entry.turn)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  expect(trace.at(-1)).toMatchObject({ status: 'won', turn: 9, tideLevel: 2, aboard: [] });
  await expect(page.getByText('Everyone home.')).toBeVisible();
  await expect(page.locator('#map-harbor')).toHaveAttribute('aria-current', 'location');
  await shot(page, 'desktop-success');
  expect(errors).toEqual([]);
  await page.waitForTimeout(900);
  writeFileSync(`${reviewDir}/ui-witness.json`, JSON.stringify({ trace, errors }, null, 2));
  writeFileSync(
    `${reviewDir}/environment.json`,
    JSON.stringify(
      await page.evaluate(() => ({
        userAgent: navigator.userAgent,
        viewport: [innerWidth, innerHeight],
        dpr: devicePixelRatio,
        metrics: (window as any).__LAST_FERRY__.getMetrics(),
      })),
      null,
      2,
    ),
  );
  const video = page.video()!;
  await page.close();
  await video.saveAs(`${reviewDir}/raw/uninterrupted-rescue.webm`);
});

test('Holding Pier: unloading Undo, tide Undo, losing alternatives and baseline selector', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  const original = await state(page);
  await act(page, 'unload');
  await undo(page);
  expect(await state(page)).toEqual(original);
  const restored = await page.evaluate(() => (window as any).__LAST_FERRY__.getRenderStatus());
  expect(restored.passengers.find((passenger: any) => passenger.id === 'sheep-1').parent).toBe(
    'deck-anchor-sheep-1',
  );
  await act(page, 'unload');
  await act(page, 'map-shallows');
  await act(page, 'map-rabbit-pier');
  const dry = await state(page);
  await act(page, 'board');
  await undo(page);
  expect(await state(page)).toEqual(dry);
  const afterUndo = await page.evaluate(() => (window as any).__LAST_FERRY__.getRenderStatus());
  expect(afterUndo.waterY).toBe(0);
  expect(
    afterUndo.passengers
      .filter((passenger: any) => passenger.id.startsWith('rabbit'))
      .every((passenger: any) => !passenger.parent.startsWith('deck-anchor')),
  ).toBe(true);
  await act(page, 'board');
  expect(await state(page)).toMatchObject({ turn: 4, tideLevel: 1, status: 'playing' });
  await restart(page);
  await act(page, 'map-harbor');
  await act(page, 'unload');
  await expect(page.locator('#map-harbor')).toHaveAttribute('aria-current', 'location');
  await act(page, 'map-stone');
  await page.locator('#map-shallows').click();
  await expect(page.locator('#dialog')).toContainText(
    'still waiting at Rabbit Pier when it floods',
  );
  expect((await state(page)).turn).toBe(3);
  await page.locator('#commit').click();
  await idle(page);
  expect(await state(page)).toMatchObject({ turn: 4, status: 'lost', delivered: ['sheep-1'] });
  await shot(page, 'home-first-loss');
  await undo(page);
  expect(await state(page)).toMatchObject({ turn: 3, status: 'playing' });
  await restart(page);
  for (let count = 0; count < 3; count++) await act(page, 'wait');
  await page.locator('#map-shallows').click();
  await expect(page.locator('#commit')).toBeDisabled();
  expect((await state(page)).turn).toBe(3);
  await page.locator('#cancel').click();
  await page.locator('#wait').click();
  await expect(page.locator('#dialog')).toContainText(
    'still waiting at Rabbit Pier when it floods',
  );
  await page.locator('#commit').click();
  await idle(page);
  expect(await state(page)).toMatchObject({ turn: 4, tideLevel: 1, status: 'lost' });
  await shot(page, 'waiting-loss');
  await page.keyboard.press('Escape');
  await page.locator('#menu').click();
  await page.locator('#cove-picker').selectOption('first-crossing');
  await page.waitForFunction(() => (window as any).__LAST_FERRY__?.getState().boatNodeId === 'cut');
  expect(await state(page)).toMatchObject({
    turn: 0,
    aboard: ['rabbit-1', 'rabbit-2'],
    waitingByPier: { 'sheep-pier': ['sheep-1'] },
  });
  await expect(page.locator('#dialog')).not.toBeVisible();
});

test('Holding Pier: phone landscape touch, direct double-tap guard, preview and complete rescue', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await ready(page);
  await shot(page, 'phone-normal');
  const frame = await page.evaluate(() => (window as any).__LAST_FERRY__.getFrameStatus());
  expect(frame.lighthouse.top).toBeGreaterThanOrEqual(8);
  for (const node of frame.nodes) {
    expect(node.x).toBeGreaterThan(0);
    expect(node.x).toBeLessThan(frame.canvas.width);
    expect(node.y).toBeGreaterThan(0);
    expect(node.y).toBeLessThan(frame.canvas.height);
  }
  for (const passenger of frame.passengers) expect(passenger.height).toBeGreaterThan(22);
  await fullyVisible(page, page.locator('#unload'));
  await page.locator('#inspect-harbor').tap();
  const initial = await state(page);
  await page.locator('#cancel').tap();
  expect(await state(page)).toEqual(initial);
  await act(page, 'unload', true);
  const bounds = await page.locator('#map-shallows').boundingBox();
  await page.touchscreen.tap(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await page.touchscreen.tap(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await idle(page);
  expect((await state(page)).turn).toBe(2);
  await act(page, 'map-rabbit-pier', true);
  await page.locator('#board').tap();
  await fullyVisible(page, page.locator('#commit'));
  await shot(page, 'phone-loading-preview');
  await page.locator('#commit').tap();
  await idle(page);
  await shot(page, 'phone-after-tide');
  for (const id of ['map-shallows', 'map-stone', 'board', 'map-harbor', 'unload'])
    await act(page, id, true);
  expect(await state(page)).toMatchObject({ status: 'won', turn: 9 });
  await expect(page.locator('#map-harbor')).toHaveAttribute('aria-current', 'location');
  await shot(page, 'phone-success');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  writeFileSync(`${reviewDir}/phone-frame.json`, JSON.stringify(frame, null, 2));
  await context.close();
});

for (const [label, width, height] of [
  ['desktop', 1440, 900],
  ['phone', 844, 390],
] as const) {
  test(`Holding Pier: natural ${label} keyboard, preview cancellation, direct sailing and terminal Undo`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page);
    await tabTo(page, 'inspect-harbor');
    await page.keyboard.press('Enter');
    await expect(page.locator('#cancel')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#inspect-harbor')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#map-harbor')).toBeFocused();
    expect((await state(page)).turn).toBe(0);
    await keyAct(page, 'unload');
    await keyAct(page, 'map-shallows');
    expect((await state(page)).turn).toBe(2);
    await expect(page.locator('#dialog')).not.toBeVisible();
    for (const id of [
      'map-rabbit-pier',
      'board',
      'map-shallows',
      'map-stone',
      'board',
      'map-harbor',
      'unload',
    ])
      await keyAct(page, id);
    expect(await state(page)).toMatchObject({ status: 'won', turn: 9 });
    await expect(page.locator('#terminal-undo')).toBeFocused();
    await page.keyboard.press('Enter');
    expect(await state(page)).toMatchObject({ status: 'playing', turn: 8, delivered: [] });
    await expect(page.locator('#map-harbor')).toHaveAttribute('aria-current', 'location');
    await keyAct(page, 'unload');
    expect((await state(page)).status).toBe('won');
  });
}

test('Holding Pier: production rescue without debug controls or external requests', async ({
  page,
}) => {
  const errors: string[] = [],
    external: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (!request.url().startsWith(productionURL)) external.push(request.url());
  });
  await page.goto(`${productionURL}/?cove=holding-pier`);
  await expect(page.locator('canvas')).toBeVisible();
  expect(await page.evaluate(() => typeof (window as any).__LAST_FERRY__)).toBe('undefined');
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
  await expect(page.getByText('Everyone home.')).toBeVisible();
  await expect(page.getByTestId('turn')).toHaveText('09');
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
