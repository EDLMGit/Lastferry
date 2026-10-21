import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir, productionURL } from './evidence';
const folder = reviewDir;
const state = (p: Page) => p.evaluate(() => (window as any).__LAST_FERRY__.getState());
async function idle(p: Page) {
  await expect(p.locator('#restart')).toBeEnabled();
}
async function ready(p: Page) {
  mkdirSync(folder, { recursive: true });
  await p.goto('/?cove=holding-pier');
  await p.waitForFunction(() => ((window as any).__LAST_FERRY__?.getMetrics().frames ?? 0) > 4);
}
async function shot(p: Page, name: string) {
  await p.screenshot({ path: `${folder}/${name}.png` });
}
async function act(p: Page, id: string, touch = false) {
  if (touch) await p.locator(`#${id}`).tap();
  else await p.locator(`#${id}`).click();
  if (!id.startsWith('route-')) {
    if (touch) await p.locator('#commit').tap();
    else await p.locator('#commit').click();
  }
  await idle(p);
}
async function tabTo(p: Page, id: string, backwards = false) {
  for (let i = 0; i < 64; i++) {
    if ((await p.evaluate(() => document.activeElement?.id)) === id) return;
    await p.keyboard.press(backwards ? 'Shift+Tab' : 'Tab');
  }
  throw Error(`Tab order did not reach ${id}`);
}
async function keyAct(p: Page, id: string) {
  await tabTo(p, id);
  await p.keyboard.press('Enter');
  if (!id.startsWith('route-')) {
    await expect(p.locator('#cancel')).toBeFocused();
    await tabTo(p, 'commit');
    await p.keyboard.press('Enter');
  }
  await idle(p);
}

test('Holding Pier: uninterrupted nine-action actual UI rescue and gameplay evidence', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await ready(page);
  await shot(page, 'desktop-normal');
  const trace = [await state(page)];
  await page.waitForTimeout(700);
  await page.locator('#route-shallows').click();
  await expect(page.locator('#preview')).toContainText(
    'Boat needs depth 2. Passage has depth 1: too shallow.',
  );
  expect(await state(page)).toEqual(trace[0]);
  await page.waitForTimeout(600);
  await page.locator('#cancel').click();
  await page.locator('#unload').click();
  await expect(page.locator('#preview')).toContainText('After unloading: boat needs depth 1.');
  await expect(page.locator('#preview')).toContainText('Moss will wait at Stone Pier.');
  await expect(page.locator('#commit')).toBeInViewport({ ratio: 1 });
  await shot(page, 'desktop-unloading-preview');
  await page.waitForTimeout(600);
  await page.locator('#commit').click();
  await idle(page);
  trace.push(await state(page));
  expect(trace.at(-1)).toMatchObject({ turn: 1, waitingByPier: { 'stone-pier': ['sheep-1'] } });
  await shot(page, 'desktop-holding-sheep');
  await page.waitForTimeout(600);
  for (const id of ['route-shallows', 'route-rabbit-pier']) {
    await act(page, id);
    trace.push(await state(page));
    await page.waitForTimeout(450);
  }
  const before = await state(page);
  await page.locator('#board').click();
  await expect(page.locator('#preview')).toContainText('After boarding: boat needs depth 2.');
  await expect(page.locator('#preview')).toContainText(
    'Pip and Rue board, then the tide rises. Both are safe aboard.',
  );
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
  for (const id of ['route-shallows', 'route-stone', 'board', 'route-harbor', 'unload']) {
    await act(page, id);
    trace.push(await state(page));
    await page.waitForTimeout(450);
  }
  expect(trace.map((s) => s.turn)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  expect(trace.at(-1)).toMatchObject({ status: 'won', turn: 9, tideLevel: 2, aboard: [] });
  await expect(page.getByText('Everyone home.')).toBeVisible();
  await expect(page.locator('#map-harbor')).toHaveAttribute('aria-current', 'location');
  await shot(page, 'desktop-success');
  expect(errors).toEqual([]);
  await page.waitForTimeout(900);
  writeFileSync(`${folder}/ui-witness.json`, JSON.stringify({ trace, errors }, null, 2));
  writeFileSync(
    `${folder}/environment.json`,
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
  await video.saveAs(`${folder}/raw/uninterrupted-rescue.webm`);
});

test('Holding Pier: unloading Undo, tide Undo, losing alternatives and baseline selector', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  const original = await state(page);
  await act(page, 'unload');
  await page.locator('#undo').click();
  expect(await state(page)).toEqual(original);
  const restored = await page.evaluate(() => (window as any).__LAST_FERRY__.getRenderStatus());
  expect(restored.passengers.find((p: any) => p.id === 'sheep-1').parent).toBe(
    'deck-anchor-sheep-1',
  );
  await act(page, 'unload');
  await act(page, 'route-shallows');
  await act(page, 'route-rabbit-pier');
  const dry = await state(page);
  await act(page, 'board');
  await page.locator('#undo').click();
  expect(await state(page)).toEqual(dry);
  const afterUndo = await page.evaluate(() => (window as any).__LAST_FERRY__.getRenderStatus());
  expect(afterUndo.waterY).toBe(0);
  expect(
    afterUndo.passengers
      .filter((p: any) => p.id.startsWith('rabbit'))
      .every((p: any) => !p.parent.startsWith('deck-anchor')),
  ).toBe(true);
  await act(page, 'board');
  expect(await state(page)).toMatchObject({ turn: 4, tideLevel: 1, status: 'playing' });
  await page.locator('#restart').click();
  await act(page, 'route-harbor');
  await act(page, 'unload');
  await expect(page.locator('#map-harbor')).toHaveAttribute('aria-current', 'location');
  await act(page, 'route-stone');
  await page.locator('#route-shallows').click();
  await expect(page.locator('#preview')).toContainText(
    'still waiting at Rabbit Pier when it floods',
  );
  expect((await state(page)).turn).toBe(3);
  await page.locator('#commit').click();
  await idle(page);
  expect(await state(page)).toMatchObject({ turn: 4, status: 'lost', delivered: ['sheep-1'] });
  await shot(page, 'home-first-loss');
  await page.locator('#undo').click();
  expect(await state(page)).toMatchObject({ turn: 3, status: 'playing' });
  await page.locator('#restart').click();
  for (let i = 0; i < 3; i++) await act(page, 'wait');
  await page.locator('#route-shallows').click();
  await expect(page.locator('#commit')).toBeDisabled();
  expect((await state(page)).turn).toBe(3);
  await page.locator('#cancel').click();
  await page.locator('#wait').click();
  await expect(page.locator('#preview')).toContainText(
    'still waiting at Rabbit Pier when it floods',
  );
  await page.locator('#commit').click();
  await idle(page);
  expect(await state(page)).toMatchObject({ turn: 4, tideLevel: 1, status: 'lost' });
  await shot(page, 'waiting-loss');
  await page.locator('#cove-picker').selectOption('first-crossing');
  await page.waitForFunction(() => (window as any).__LAST_FERRY__?.getState().boatNodeId === 'cut');
  expect(await state(page)).toMatchObject({
    turn: 0,
    aboard: ['rabbit-1', 'rabbit-2'],
    waitingByPier: { 'sheep-pier': ['sheep-1'] },
  });
  await expect(page.locator('h1')).toHaveText('The First Crossing');
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
  await expect(page.locator('#unload')).toBeInViewport({ ratio: 1 });
  await page.locator('#inspect-harbor').tap();
  const initial = await state(page);
  await page.locator('#cancel').tap();
  expect(await state(page)).toEqual(initial);
  await act(page, 'unload', true);
  const bounds = await page.locator('#route-shallows').boundingBox();
  await page.touchscreen.tap(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await page.touchscreen.tap(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await idle(page);
  expect((await state(page)).turn).toBe(2);
  await act(page, 'route-rabbit-pier', true);
  await page.locator('#board').tap();
  await expect(page.locator('#commit')).toBeInViewport({ ratio: 1 });
  await shot(page, 'phone-loading-preview');
  await page.locator('#commit').tap();
  await idle(page);
  await shot(page, 'phone-after-tide');
  for (const id of ['route-shallows', 'route-stone', 'board', 'route-harbor', 'unload'])
    await act(page, id, true);
  expect(await state(page)).toMatchObject({ status: 'won', turn: 9 });
  await expect(page.locator('#map-harbor')).toHaveAttribute('aria-current', 'location');
  await shot(page, 'phone-success');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  writeFileSync(`${folder}/phone-frame.json`, JSON.stringify(frame, null, 2));
  await context.close();
});

for (const [label, width, height] of [
  ['desktop', 1440, 900],
  ['phone', 844, 390],
] as const)
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
    await expect(page.locator('#route-harbor')).toBeFocused();
    expect((await state(page)).turn).toBe(0);
    await keyAct(page, 'unload');
    await keyAct(page, 'route-shallows');
    expect((await state(page)).turn).toBe(2);
    await expect(page.locator('#commit')).toHaveCount(0);
    for (const id of [
      'route-rabbit-pier',
      'board',
      'route-shallows',
      'route-stone',
      'board',
      'route-harbor',
      'unload',
    ])
      await keyAct(page, id);
    expect(await state(page)).toMatchObject({ status: 'won', turn: 9 });
    await expect(page.locator('#undo')).toBeFocused();
    await page.keyboard.press('Enter');
    expect(await state(page)).toMatchObject({ status: 'playing', turn: 8, delivered: [] });
    await expect(page.locator('#map-harbor')).toHaveAttribute('aria-current', 'location');
    await keyAct(page, 'unload');
    expect((await state(page)).status).toBe('won');
  });

test('Holding Pier: production rescue without debug controls or external requests', async ({
  page,
}) => {
  const errors: string[] = [],
    external: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (!r.url().startsWith(productionURL)) external.push(r.url());
  });
  await page.goto(`${productionURL}/?cove=holding-pier`);
  await expect(page.locator('canvas')).toBeVisible();
  expect(await page.evaluate(() => typeof (window as any).__LAST_FERRY__)).toBe('undefined');
  for (const id of [
    'unload',
    'route-shallows',
    'route-rabbit-pier',
    'board',
    'route-shallows',
    'route-stone',
    'board',
    'route-harbor',
    'unload',
  ])
    await act(page, id);
  await expect(page.getByText('Everyone home.')).toBeVisible();
  await expect(page.getByTestId('turn')).toHaveText('09');
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
