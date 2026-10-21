import { test, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import {
  act,
  ready,
  state,
  rendered,
  idle,
  undo,
  restart,
  keyAct,
  tabTo,
  fullyVisible,
} from './ui';

const shot = (page: import('@playwright/test').Page, name: string) =>
  page.screenshot({ path: `${reviewDir}/${name}.png` });

test.afterEach(async ({ page, context }, info) => {
  if (info.title.startsWith('desktop:')) {
    const video = page.video();
    await context.close();
    await video?.saveAs(`${reviewDir}/raw/desktop-rescue.webm`);
  }
});

test('desktop: real rescue, blocked preview, tide undo, terminal undo and restart', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await ready(page);
  await shot(page, 'normal-play');
  const original = await state(page);
  await page.locator('#status-toggle').click();
  await expect(page.locator('.forecast-detail')).toContainText('The tide rises in 4 actions.');
  expect(await state(page)).toEqual(original);
  await page.keyboard.press('Escape');
  await page.locator('#inspect-sheep-pier').click();
  expect(await state(page)).toEqual(original);
  await page.locator('#cancel').click();
  expect(await state(page)).toEqual(original);
  await act(page, 'map-sheep-pier');
  await page.locator('#board').click();
  await expect(page.locator('#dialog')).toContainText('After boarding: boat needs depth 3.');
  await expect(page.locator('#dialog')).toContainText(
    'Passage to Shallow Cut has depth 2: too shallow.',
  );
  await shot(page, 'loading-preview');
  await page.locator('#commit').click({ clickCount: 2 });
  await expect(page.locator('#undo')).toBeDisabled();
  await expect(page.locator('#wait')).toBeDisabled();
  await expect(page.locator('#menu')).toBeDisabled();
  await idle(page);
  expect((await state(page)).turn).toBe(2);
  const full = await state(page);
  await page.locator('#map-cut').click();
  await expect(page.locator('#commit')).toBeDisabled();
  await expect(page.locator('#dialog')).toContainText(
    'Boat needs depth 3. Passage has depth 2: too shallow.',
  );
  expect(await state(page)).toEqual(full);
  await page.locator('#cancel').click();
  await act(page, 'map-outer-east');
  const beforeRise = await state(page),
    beforeRender = await rendered(page);
  await act(page, 'map-outer-south');
  expect(await state(page)).toMatchObject({ turn: 4, tideLevel: 1 });
  await shot(page, 'after-tide');
  await undo(page);
  expect(await state(page)).toEqual(beforeRise);
  const restored = await rendered(page);
  for (const prior of beforeRender.passengers) {
    const actual = restored.passengers.find((passenger: any) => passenger.id === prior.id);
    expect(actual.parent).toBe(prior.parent);
    for (let axis = 0; axis < 3; axis++) {
      expect(actual.deckLocalFoot[axis]).toBeCloseTo(prior.deckLocalFoot[axis], 8);
      expect(Math.abs(actual.position[axis] - prior.position[axis])).toBeLessThan(0.025);
    }
  }
  expect(restored.boatPosition).toEqual(beforeRender.boatPosition);
  expect(restored.waterY).toBe(0);
  for (const id of ['map-outer-south', 'map-outer-west', 'map-harbor', 'unload'])
    await act(page, id);
  expect(await state(page)).toMatchObject({
    status: 'won',
    turn: 7,
    aboard: [],
    delivered: ['rabbit-1', 'rabbit-2', 'sheep-1'],
  });
  await expect(page.getByText('Everyone home.')).toBeVisible();
  await shot(page, 'success');
  await undo(page);
  expect(await state(page)).toMatchObject({ status: 'playing', turn: 6, delivered: [] });
  await act(page, 'unload');
  expect((await state(page)).status).toBe('won');
  await restart(page);
  expect(await state(page)).toEqual(original);
  await page.locator('#menu').click();
  await page.locator('#sound').click();
  await page.reload();
  await page.waitForFunction(() => (window as any).__LAST_FERRY__);
  await page.locator('#menu').click();
  await expect(page.locator('#sound')).toHaveAttribute('aria-label', 'Unmute sound');
  expect(errors).toEqual([]);
  writeFileSync(
    `${reviewDir}/browser-environment.json`,
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
});

test('emulated phone landscape: touch preview, double tap guard, tide undo and complete rescue', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    recordVideo: { dir: `${reviewDir}/raw`, size: { width: 844, height: 390 } },
  });
  const page = await context.newPage();
  await ready(page);
  await act(page, 'map-sheep-pier', true);
  await page.locator('#board').tap();
  await expect(page.locator('#dialog')).toContainText(
    'Passage to Shallow Cut has depth 2: too shallow.',
  );
  await shot(page, 'phone-loading-preview');
  const bounds = await page.locator('#commit').boundingBox();
  expect(bounds).not.toBeNull();
  await page.touchscreen.tap(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await page.touchscreen.tap(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await idle(page);
  expect((await state(page)).turn).toBe(2);
  await act(page, 'wait', true);
  const before = await state(page);
  await act(page, 'wait', true);
  expect((await state(page)).tideLevel).toBe(1);
  await undo(page, true);
  expect(await state(page)).toEqual(before);
  for (const id of ['wait', 'map-cut', 'map-harbor', 'unload']) await act(page, id, true);
  expect(await state(page)).toMatchObject({ status: 'won', turn: 7 });
  await fullyVisible(page, page.locator('#terminal-undo'));
  await fullyVisible(page, page.locator('#terminal-restart'));
  await shot(page, 'phone-success');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const video = page.video();
  await context.close();
  await video?.saveAs(`${reviewDir}/raw/phone-rescue.webm`);
});

test('keyboard-only tide-wait witness and subset selection', async ({ page }) => {
  await ready(page);
  await keyAct(page, 'map-sheep-pier');
  await tabTo(page, 'unload');
  await page.keyboard.press('Enter');
  await expect(page.locator('#passenger-rabbit-1')).toHaveAttribute('aria-pressed', 'true');
  await tabTo(page, 'passenger-rabbit-2');
  await page.keyboard.press('Enter');
  await expect(page.locator('#dialog')).toContainText('After unloading: boat needs depth 2.');
  expect((await state(page)).turn).toBe(1);
  await page.keyboard.press('Escape');
  await keyAct(page, 'board');
  await keyAct(page, 'wait');
  await tabTo(page, 'map-cut');
  await page.keyboard.press('Enter');
  await expect(page.locator('#commit')).toBeDisabled();
  expect((await state(page)).turn).toBe(3);
  await page.keyboard.press('Escape');
  for (const id of ['wait', 'map-cut', 'map-harbor', 'unload']) await keyAct(page, id);
  expect(await state(page)).toMatchObject({ status: 'won', turn: 7 });
});

test('flood loss, undo and alternate safe boarding through real interface', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  await act(page, 'map-sheep-pier');
  for (let count = 0; count < 6; count++) await act(page, 'wait');
  const saved = await state(page);
  await act(page, 'wait');
  expect(await state(page)).toMatchObject({ status: 'lost', turn: 8, tideLevel: 2 });
  await expect(page.getByText('A turn too late.')).toBeVisible();
  await shot(page, 'flood-loss');
  await undo(page);
  expect(await state(page)).toEqual(saved);
  await act(page, 'board');
  expect(await state(page)).toMatchObject({ status: 'playing', turn: 8, tideLevel: 2 });
  await expect(page.locator('#board')).toHaveCount(0);
  for (const id of ['wait', 'map-cut', 'map-harbor', 'unload']) await act(page, id);
  expect((await state(page)).status).toBe('won');
});

test('visibility cancellation releases lock and reconciles to committed state', async ({
  page,
}) => {
  await ready(page);
  await page.locator('#map-sheep-pier').click();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await idle(page);
  expect((await state(page)).turn).toBe(1);
  await expect(page.locator('#undo')).toBeEnabled();
  await undo(page);
  expect((await state(page)).turn).toBe(0);
});

test('portrait: complete frame, usable controls, reduced motion and no horizontal clipping', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  await shot(page, 'portrait');
  await fullyVisible(page, page.locator('#map-sheep-pier'));
  await fullyVisible(page, page.locator('#undo'));
  await act(page, 'map-sheep-pier');
  expect((await state(page)).turn).toBe(1);
  await undo(page);
  expect((await state(page)).turn).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
