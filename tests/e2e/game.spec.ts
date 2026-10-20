import { test, expect, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const state = (p: Page) => p.evaluate(() => (window as any).__LAST_FERRY__.getState());
const rendered = (p: Page) => p.evaluate(() => (window as any).__LAST_FERRY__.getRenderStatus());
test.afterEach(async ({ page, context }, info) => {
  if (info.title.startsWith('desktop:')) {
    const video = page.video();
    await context.close();
    await video?.saveAs('reviews/m1/raw/desktop-rescue.webm');
  }
});
async function ready(p: Page) {
  await p.goto('/');
  await p.waitForFunction(() => ((window as any).__LAST_FERRY__?.getMetrics().frames ?? 0) > 3);
}
async function idle(p: Page) {
  await p.waitForFunction(() => !(window as any).__LAST_FERRY__.getRenderStatus().pendingAnimation);
}
async function action(p: Page, id: string) {
  await p.locator(`#${id}`).click();
  await expect(p.locator('#commit')).toBeEnabled();
  await p.locator('#commit').click();
  await idle(p);
}
async function shot(p: Page, name: string) {
  await p.screenshot({ path: `reviews/m1/${name}.png` });
}
test('desktop: real rescue, blocked preview, tide undo, terminal undo and restart', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await ready(page);
  await shot(page, 'normal-play');
  const original = await state(page);
  await page.locator('#forecast-toggle').click();
  await expect(page.locator('.forecast-detail')).toContainText('Tide 1 after turn 4');
  expect(await state(page)).toEqual(original);
  await page.locator('#forecast-toggle').click();
  await page.locator('#route-sheep-pier').click();
  expect(await state(page)).toEqual(original);
  await page.locator('#cancel').click();
  expect(await state(page)).toEqual(original);
  await action(page, 'route-sheep-pier');
  await page.locator('#board').click();
  await expect(page.locator('#preview')).toContainText('4 / 4 spaces · draft 3');
  await expect(page.locator('#preview')).toContainText('Shallow cut blocked');
  await shot(page, 'loading-preview');
  // A double click is still one atomic action; presentation disables all mutation controls.
  await page.locator('#commit').click({ clickCount: 2 });
  await expect(page.locator('#undo')).toBeDisabled();
  await expect(page.locator('#restart')).toBeDisabled();
  await idle(page);
  expect((await state(page)).turn).toBe(2);
  const full = await state(page);
  await page.locator('#route-cut').click();
  await expect(page.locator('#commit')).toBeDisabled();
  await expect(page.locator('#preview')).toContainText('depth 2 is below draft 3');
  expect(await state(page)).toEqual(full);
  await page.locator('#cancel').click();
  await action(page, 'route-outer-east');
  const beforeRise = await state(page),
    beforeRender = await rendered(page);
  await action(page, 'route-outer-south');
  expect(await state(page)).toMatchObject({ turn: 4, tideLevel: 1 });
  await shot(page, 'after-tide');
  await page.locator('#undo').click();
  expect(await state(page)).toEqual(beforeRise);
  const restored = await rendered(page);
  expect(restored.passengers).toEqual(beforeRender.passengers);
  expect(restored.boatPosition).toEqual(beforeRender.boatPosition);
  expect(restored.waterY).toBe(0);
  await action(page, 'route-outer-south');
  await action(page, 'route-outer-west');
  await action(page, 'route-harbor');
  await action(page, 'unload');
  expect(await state(page)).toMatchObject({
    status: 'won',
    turn: 7,
    aboard: [],
    delivered: ['rabbit-1', 'rabbit-2', 'sheep-1'],
  });
  await expect(page.getByText('Everyone home.')).toBeVisible();
  await shot(page, 'success');
  await page.locator('#undo').click();
  expect(await state(page)).toMatchObject({ status: 'playing', turn: 6, delivered: [] });
  await action(page, 'unload');
  expect((await state(page)).status).toBe('won');
  await page.locator('#restart').click();
  expect(await state(page)).toEqual(original);
  await page.locator('#sound').click();
  await page.reload();
  await page.waitForFunction(() => (window as any).__LAST_FERRY__);
  await expect(page.locator('#sound')).toHaveAttribute('aria-label', 'Unmute sound');
  expect(errors).toEqual([]);
  writeFileSync(
    'reviews/m1/browser-environment.json',
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
    recordVideo: { dir: 'reviews/m1/raw', size: { width: 844, height: 390 } },
  });
  const page = await context.newPage();
  await ready(page);
  async function tapAction(id: string) {
    await page.locator(`#${id}`).tap();
    await page.locator('#commit').tap();
    await idle(page);
  }
  await tapAction('route-sheep-pier');
  await page.locator('#board').tap();
  await expect(page.locator('#preview')).toContainText('Shallow cut blocked');
  await shot(page, 'phone-loading-preview');
  const bounds = await page.locator('#commit').boundingBox();
  expect(bounds).not.toBeNull();
  await page.touchscreen.tap(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await page.touchscreen.tap(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await idle(page);
  expect((await state(page)).turn).toBe(2);
  await tapAction('wait');
  const before = await state(page);
  await tapAction('wait');
  expect((await state(page)).tideLevel).toBe(1);
  await page.locator('#undo').tap();
  expect(await state(page)).toEqual(before);
  await tapAction('wait');
  await tapAction('route-cut');
  await tapAction('route-harbor');
  await tapAction('unload');
  expect(await state(page)).toMatchObject({ status: 'won', turn: 7 });
  await expect(page.locator('.panel')).toHaveJSProperty('scrollTop', 0);
  await shot(page, 'phone-success');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const video = page.video();
  await context.close();
  await video?.saveAs('reviews/m1/raw/phone-rescue.webm');
});
test('keyboard-only tide-wait witness and subset selection', async ({ page }) => {
  await ready(page);
  async function key(id: string) {
    await page.locator(`#${id}`).focus();
    await page.keyboard.press('Enter');
  }
  async function keyAction(id: string) {
    await key(id);
    await key('commit');
    await idle(page);
  }
  await keyAction('route-sheep-pier');
  await key('unload');
  await expect(page.locator('#passenger-rabbit-1')).toHaveAttribute('aria-pressed', 'true');
  await key('passenger-rabbit-2');
  await expect(page.locator('#preview')).toContainText('1 / 4 spaces · draft 2');
  expect((await state(page)).turn).toBe(1);
  await page.keyboard.press('Escape');
  await keyAction('board');
  await keyAction('wait');
  await key('route-cut');
  await expect(page.locator('#commit')).toBeDisabled();
  expect((await state(page)).turn).toBe(3);
  await page.keyboard.press('Escape');
  await keyAction('wait');
  await keyAction('route-cut');
  await keyAction('route-harbor');
  await keyAction('unload');
  expect(await state(page)).toMatchObject({ status: 'won', turn: 7 });
});
test('flood loss, undo and alternate safe boarding through real interface', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  await action(page, 'route-sheep-pier');
  for (let i = 0; i < 6; i++) await action(page, 'wait');
  const saved = await state(page);
  await action(page, 'wait');
  expect(await state(page)).toMatchObject({ status: 'lost', turn: 8, tideLevel: 2 });
  await expect(page.getByText('A turn too late.')).toBeVisible();
  await shot(page, 'flood-loss');
  await page.locator('#undo').click();
  expect(await state(page)).toEqual(saved);
  await action(page, 'board');
  expect(await state(page)).toMatchObject({ status: 'playing', turn: 8, tideLevel: 2 });
  await expect(page.locator('#board')).toHaveCount(0);
  await action(page, 'wait');
  expect((await state(page)).status).toBe('playing');
  await action(page, 'route-cut');
  await action(page, 'route-harbor');
  await action(page, 'unload');
  expect((await state(page)).status).toBe('won');
});
test('visibility cancellation releases lock and reconciles to committed state', async ({
  page,
}) => {
  await ready(page);
  await page.locator('#route-sheep-pier').click();
  await page.locator('#commit').click();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await idle(page);
  expect((await state(page)).turn).toBe(1);
  await expect(page.locator('#undo')).toBeEnabled();
  await page.locator('#undo').click();
  expect((await state(page)).turn).toBe(0);
});
test('portrait: complete frame, usable controls, reduced motion and no horizontal clipping', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  await shot(page, 'portrait');
  await expect(page.locator('.portrait-note')).toBeVisible();
  await action(page, 'route-sheep-pier');
  expect((await state(page)).turn).toBe(1);
  await page.locator('#undo').click();
  expect((await state(page)).turn).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
