import { expect, type Locator, type Page } from '@playwright/test';

export const state = (page: Page) => page.evaluate(() => (window as any).__LAST_FERRY__.getState());
export const rendered = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getRenderStatus());
export const navigation = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getNavigationStatus());
export const active = (page: Page) => page.evaluate(() => document.activeElement?.id);
export async function idle(page: Page) {
  await expect(page.locator('#seascape')).toHaveAttribute('aria-busy', 'false');
}
export async function ready(page: Page, cove = 'first-crossing') {
  await page.goto(`/?cove=${cove}`);
  await page.waitForFunction(() => ((window as any).__LAST_FERRY__?.getMetrics().frames ?? 0) > 4);
  await idle(page);
}
export async function activate(page: Page, id: string, touch = false) {
  if (id.startsWith('map-')) {
    const inFrame = await page.locator(`#${id}`).evaluate((element) => {
      const r = element.getBoundingClientRect();
      return (
        !element.closest('.offscreen') &&
        getComputedStyle(element).opacity !== '0' &&
        r.width > 0 &&
        r.height > 0 &&
        r.left >= 0 &&
        r.top >= 0 &&
        r.right <= innerWidth &&
        r.bottom <= innerHeight
      );
    });
    if (!inFrame) await wholeCove(page, touch);
  }
  if ((id === 'board' || id === 'unload') && !(await page.locator(`#${id}`).isVisible())) {
    const current = await page.locator('.map-target[aria-current="location"]').getAttribute('id');
    if (!current) throw Error('No current location selector is available');
    await activate(page, current, touch);
  }
  if (touch) await page.locator(`#${id}`).tap();
  else await page.locator(`#${id}`).click();
}
export async function wholeCove(page: Page, touch = false) {
  const toggle = page.locator('#view-toggle');
  if ((await toggle.count()) && (await toggle.textContent())?.includes('Whole cove')) {
    if (touch) await toggle.tap();
    else await toggle.click();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
  }
}
export async function selectPlace(page: Page, id: string, touch = false) {
  await activate(page, id.startsWith('map-') ? id : `map-${id}`, touch);
  await expect(page.locator('#local-context')).toBeVisible();
}
export async function startMove(page: Page, id: string, touch = false) {
  await selectPlace(page, id, touch);
  await activate(page, 'sail', touch);
}
export async function act(page: Page, id: string, touch = false) {
  if (id.startsWith('map-')) await startMove(page, id, touch);
  else {
    await activate(page, id, touch);
    if (await page.locator('#dialog[open][data-mode=action]').count())
      await activate(page, 'commit', touch);
  }
  await idle(page);
}
export async function undo(page: Page, touch = false) {
  const terminal = await page.locator('#dialog[open] #terminal-undo').count();
  await activate(page, terminal ? 'terminal-undo' : 'undo', touch);
  await idle(page);
}
export async function closeDialog(page: Page, touch = false) {
  if (await page.locator('#dialog[open]').count()) await activate(page, 'cancel', touch);
}
export async function restart(page: Page, touch = false) {
  if (await page.locator('#dialog[open] #terminal-restart').count())
    await activate(page, 'terminal-restart', touch);
  else {
    await closeDialog(page, touch);
    await activate(page, 'menu', touch);
    await activate(page, 'restart', touch);
  }
  await idle(page);
}
export async function tabTo(page: Page, id: string, backwards = false) {
  for (let count = 0; count < 64; count++) {
    if ((await active(page)) === id) return;
    await page.keyboard.press(backwards ? 'Shift+Tab' : 'Tab');
  }
  throw Error(`Natural Tab navigation did not reach ${id}; active=${await active(page)}`);
}
export async function keyAct(page: Page, id: string) {
  if ((id === 'board' || id === 'unload') && !(await page.locator(`#${id}`).isVisible())) {
    const current = await page.locator('.map-target[aria-current="location"]').getAttribute('id');
    if (!current) throw Error('No current location selector is available');
    await tabTo(page, current);
    await page.keyboard.press('Enter');
    await expect(page.locator('#local-heading')).toBeFocused();
  }
  await tabTo(page, id);
  await page.keyboard.press('Enter');
  if (id.startsWith('map-')) {
    await expect(page.locator('#local-heading')).toBeFocused();
    await tabTo(page, 'sail');
    await page.keyboard.press('Enter');
  } else if (await page.locator('#dialog[open][data-mode=action]').count()) {
    await expect(page.locator('#cancel')).toBeFocused();
    await tabTo(page, 'commit');
    await page.keyboard.press('Enter');
  }
  await idle(page);
}
export async function fullyVisible(page: Page, locator: Locator, touchTarget = true) {
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
      const style = getComputedStyle(parent),
        clip = parent.getBoundingClientRect();
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
export async function readable(locator: Locator) {
  const fontSize = await locator.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).fontSize),
  );
  expect(fontSize).toBeGreaterThanOrEqual(14);
}
export async function dialogCycle(page: Page, initialId = 'cancel') {
  await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  await expect(page.locator(`#${initialId}`)).toBeFocused();
  const focusables = page.locator(
    '#dialog :is(button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], summary, [tabindex="0"]):visible',
  );
  const count = await focusables.count();
  expect(count).toBeGreaterThan(0);
  for (let attempt = 0; attempt < 64; attempt++) {
    if (await focusables.first().evaluate((element) => element === document.activeElement)) break;
    await page.keyboard.press('Tab');
  }
  await expect(focusables.first()).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(focusables.last()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(focusables.first()).toBeFocused();
  for (let step = 0; step < count + 1; step++) {
    await page.keyboard.press('Tab');
    expect(
      await page.locator('#dialog').evaluate((dialog) => dialog.contains(document.activeElement)),
    ).toBe(true);
  }
}
