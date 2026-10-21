import { test, expect, type Page, type Locator } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';

const state = (page: Page) => page.evaluate(() => (window as any).__LAST_FERRY__.getState());
const navigation = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getNavigationStatus());
async function idle(page: Page) {
  await page.waitForFunction(
    () => !(window as any).__LAST_FERRY__.getRenderStatus().pendingAnimation,
  );
}
async function tabTo(page: Page, id: string, backwards = false) {
  for (let count = 0; count < 64; count++) {
    if ((await page.evaluate(() => document.activeElement?.id)) === id) return;
    await page.keyboard.press(backwards ? 'Shift+Tab' : 'Tab');
  }
  throw Error(`Natural Tab navigation did not reach ${id}`);
}
async function fullyVisible(page: Page, locator: Locator, touchTarget = true) {
  await expect(locator).toBeInViewport({ ratio: 1 });
  const bounds = await locator.boundingBox();
  const size = page.viewportSize()!;
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(size.width + 0.5);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(size.height + 0.5);
  if (touchTarget) {
    expect(bounds!.width).toBeGreaterThanOrEqual(44);
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
  }
  const clipping = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const failures: string[] = [];
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      const clip = parent.getBoundingClientRect();
      if (
        /(auto|scroll|hidden|clip)/.test(style.overflowY) &&
        (rect.top < clip.top - 0.5 || rect.bottom > clip.bottom + 0.5)
      )
        failures.push(`${parent.className}: vertical clipping`);
      if (
        /(auto|scroll|hidden|clip)/.test(style.overflowX) &&
        (rect.left < clip.left - 0.5 || rect.right > clip.right + 0.5)
      )
        failures.push(`${parent.className}: horizontal clipping`);
    }
    return failures;
  });
  expect(clipping).toEqual([]);
}
async function readable(locator: Locator) {
  const fontSize = await locator.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).fontSize),
  );
  expect(fontSize).toBeGreaterThanOrEqual(14);
}
async function selectedPassage(page: Page, destination: string, edgeId: string) {
  await expect.poll(async () => (await navigation(page)).selectedDestination).toBe(destination);
  const view = await navigation(page);
  expect(
    view.routes.filter((route: any) => route.highlighted).map((route: any) => route.id),
  ).toEqual([edgeId]);
  expect(view.markers.find((marker: any) => marker.id === destination).selected).toBe(true);
}

for (const [label, width, height, touch] of [
  ['desktop-navigation', 1440, 900, false],
  ['phone-navigation', 844, 390, true],
  ['phone-narrow-navigation', 780, 390, true],
] as const) {
  test(`${label}: named map targets, free inspection, readable actions and boundary subsets`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      hasTouch: touch,
      isMobile: touch,
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    mkdirSync(reviewDir, { recursive: true });
    await page.goto('/?cove=holding-pier');
    await page.waitForFunction(
      () => ((window as any).__LAST_FERRY__?.getMetrics().frames ?? 0) > 4,
    );
    const activate = async (id: string) =>
      touch ? page.locator(`#${id}`).tap() : page.locator(`#${id}`).click();
    const transfer = async (id: string) => {
      await activate(id);
      await activate('commit');
      await idle(page);
    };
    const sail = async (id: string) => {
      const before = await state(page);
      await activate(`map-${id}`);
      await idle(page);
      expect((await state(page)).turn).toBe(before.turn + 1);
      expect((await state(page)).boatNodeId).toBe(id);
      await expect(page.locator('#commit')).toHaveCount(0);
    };
    await expect(page.locator('#status-headline')).toHaveText('Rabbit Pier floods in 4 actions.');
    await expect(page.locator('#map-harbor')).toHaveAccessibleName('Sail to Harbor');
    await expect(page.locator('#map-stone')).toHaveAccessibleName('You are at Stone Pier');
    await expect(page.locator('#map-shallows')).toHaveAccessibleName(/^Sail to Shallows/);
    await expect(page.locator('#map-rabbit-pier')).toHaveAccessibleName(
      'Rabbit Pier: no direct passage',
    );
    await expect(page.locator('#map-stone')).toHaveAttribute('aria-current', 'location');
    await expect(page.locator('#map-stone')).toContainText(/here|current/i);
    await expect(page.locator('#map-shallows')).toContainText(/too shallow/i);
    await expect(page.locator('#map-rabbit-pier')).toContainText(/no direct passage/i);
    for (const id of ['harbor', 'stone', 'shallows', 'rabbit-pier']) {
      await fullyVisible(page, page.locator(`#map-${id}`));
      await readable(page.locator(`#map-${id}`));
    }
    await fullyVisible(page, page.locator('#unload'));
    await fullyVisible(page, page.locator('#undo'));
    await readable(page.locator('#unload b'));
    await readable(page.locator('#route-shallows b'));
    await readable(page.locator('#status-headline'));
    const firstNavigation = await navigation(page);
    expect(firstNavigation.markers.map((marker: any) => [marker.id, marker.status])).toEqual([
      ['harbor', 'available'],
      ['stone', 'current'],
      ['shallows', 'too-shallow'],
      ['rabbit-pier', 'nonadjacent'],
    ]);
    expect(new Set(firstNavigation.markers.map((marker: any) => marker.shape)).size).toBe(4);
    await page.screenshot({ path: `${reviewDir}/${label}-start.png` });
    const initial = await state(page);
    await activate('map-stone');
    expect(await state(page)).toEqual(initial);
    await expect(page.locator('#commit')).toHaveCount(0);
    const frame = await page.evaluate(() => (window as any).__LAST_FERRY__.getFrameStatus());
    const current = frame.nodes.find((node: any) => node.id === 'stone');
    const canvas = await page.locator('#world canvas').boundingBox();
    if (touch) await page.touchscreen.tap(canvas!.x + current.x, canvas!.y + current.y);
    else await page.mouse.click(canvas!.x + current.x, canvas!.y + current.y);
    expect(await state(page)).toEqual(initial);
    await expect(page.locator('#commit')).toHaveCount(0);
    await activate('map-rabbit-pier');
    await expect(page.locator('#preview')).toContainText(
      'No direct passage. Sail to an adjacent stop first.',
    );
    await expect(page.locator('#commit')).toBeDisabled();
    expect((await navigation(page)).routes.filter((route: any) => route.highlighted)).toEqual([]);
    await activate('cancel');
    if (!touch) {
      await page.locator('#map-harbor').hover();
      await selectedPassage(page, 'harbor', 'harbor-stone');
      await page.locator('#route-shallows').hover();
      await selectedPassage(page, 'shallows', 'stone-shallows');
      expect(await state(page)).toEqual(initial);
    }
    await activate('inspect-shallows');
    await expect(page.locator('#preview')).toContainText(
      'Boat needs depth 2. Passage has depth 1: too shallow.',
    );
    await selectedPassage(page, 'shallows', 'stone-shallows');
    expect(await state(page)).toEqual(initial);
    for (const paragraph of await page.locator('#preview p').all()) await readable(paragraph);
    await page.screenshot({ path: `${reviewDir}/${label}-route-inspection.png` });
    await activate('cancel');
    await tabTo(page, 'map-stone');
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#map-harbor')).toBeFocused();
    await selectedPassage(page, 'harbor', 'harbor-stone');
    expect(await state(page)).toEqual(initial);
    await tabTo(page, 'inspect-shallows');
    await page.keyboard.press('Enter');
    await expect(page.locator('#cancel')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#inspect-shallows')).toBeFocused();
    expect(await state(page)).toEqual(initial);
    await activate('unload');
    await expect(page.locator('#preview')).toContainText('After unloading: boat needs depth 1.');
    await expect(page.locator('#preview')).toContainText(
      'Moss will wait at Stone Pier. Stone Pier stays safe through all tide rises.',
    );
    await fullyVisible(page, page.locator('#commit'));
    await activate('commit');
    await idle(page);
    await sail('shallows');
    await sail('rabbit-pier');
    await expect(page.locator('#status-detail')).toContainText(
      'The tide rises after your next action.',
    );
    const dry = await state(page);
    await expect(page.locator('#map-shallows')).toContainText('Flood warning');
    await activate('map-shallows');
    await expect(page.locator('.consequence')).toContainText('This ends the crossing.');
    await fullyVisible(page, page.locator('.consequence'), false);
    expect(await state(page)).toEqual(dry);
    await activate('cancel');
    await activate('board');
    await expect(page.locator('#preview')).toContainText(
      'Pip and Rue board, then the tide rises. Both are safe aboard.',
    );
    for (const id of ['passenger-rabbit-1', 'passenger-rabbit-2']) {
      await fullyVisible(page, page.locator(`#${id}`));
      await readable(page.locator(`#${id}`));
    }
    await activate('passenger-rabbit-2');
    await expect(page.locator('#preview')).toContainText(
      'Pip boards, then the tide rises. Rue is still waiting at Rabbit Pier when it floods. This ends the crossing.',
    );
    await fullyVisible(page, page.locator('.requirement'), false);
    await fullyVisible(page, page.locator('.consequence'), false);
    await page.screenshot({ path: `${reviewDir}/${label}-subset-warning.png` });
    expect(await state(page)).toEqual(dry);
    await fullyVisible(page, page.locator('#commit'));
    await activate('commit');
    await idle(page);
    expect(await state(page)).toMatchObject({
      turn: 4,
      tideLevel: 1,
      status: 'lost',
      lossReason: { passengerIds: ['rabbit-2'] },
    });
    await expect(page.locator('.loss')).toContainText('Undo earlier moves, or restart');
    await activate('undo');
    expect(await state(page)).toEqual(dry);
    await activate('board');
    await expect(page.locator('#preview')).toContainText(
      'Pip and Rue board, then the tide rises. Both are safe aboard.',
    );
    await fullyVisible(page, page.locator('#commit'));
    await fullyVisible(page, page.locator('.consequence'), false);
    for (const paragraph of await page.locator('#preview p').all()) await readable(paragraph);
    await page.screenshot({ path: `${reviewDir}/${label}-critical-boarding.png` });
    await activate('commit');
    await idle(page);
    expect(await state(page)).toMatchObject({
      turn: 4,
      tideLevel: 1,
      status: 'playing',
      waitingByPier: { 'rabbit-pier': [], 'stone-pier': ['sheep-1'] },
    });
    await expect(page.locator('#status-headline')).toHaveText('Pip and Rue are safe aboard.');
    await expect(page.locator('#status-detail')).toContainText('Moss waits safely at Stone Pier.');
    await expect(page.locator('#status-headline')).not.toContainText(/flood/i);
    await page.screenshot({ path: `${reviewDir}/${label}-after-rise.png` });
    await activate('forecast-toggle');
    await expect(page.locator('.forecast-detail')).toContainText(
      'Rabbit Pier is flooded and empty.',
    );
    await activate('forecast-toggle');
    await sail('shallows');
    await sail('stone');
    await transfer('board');
    await sail('harbor');
    await transfer('unload');
    expect(await state(page)).toMatchObject({
      turn: 9,
      tideLevel: 2,
      status: 'won',
      delivered: ['rabbit-1', 'rabbit-2', 'sheep-1'],
    });
    await expect(page.locator('#map-harbor')).toHaveAttribute('aria-current', 'location');
    await fullyVisible(page, page.locator('#undo'));
    await page.screenshot({ path: `${reviewDir}/${label}-success.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
    writeFileSync(
      `${reviewDir}/${label}-verification.json`,
      JSON.stringify(
        {
          viewport: [width, height],
          touchEmulation: touch,
          initialState: initial,
          startNavigation: firstNavigation,
          finalState: await state(page),
          errors,
        },
        null,
        2,
      ),
    );
    await context.close();
  });
}
