import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import { activate, fullyVisible, idle, ready, state, tabTo } from './ui';

async function tapChild(page: Page, selector: string) {
  const child = page.locator(selector);
  await expect(child).toBeVisible();
  const box = await child.boundingBox();
  expect(box).not.toBeNull();
  await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);
}

async function validGlyphs(page: Page) {
  const glyphs = await page.locator('button .cove-glyph').evaluateAll((nodes) =>
    nodes.map((node) => ({
      id: node.closest('button')!.id,
      icon: node.getAttribute('data-icon'),
      hidden: node.getAttribute('aria-hidden'),
      focusable: node.getAttribute('focusable'),
      pointers: getComputedStyle(node).pointerEvents,
      width: node.getBoundingClientRect().width,
    })),
  );
  expect(glyphs.length).toBeGreaterThan(4);
  for (const glyph of glyphs) {
    expect(glyph.hidden).toBe('true');
    expect(glyph.focusable).toBe('false');
    expect(glyph.pointers).toBe('none');
  }
  expect(await page.locator('.map-target :is(button, a, [tabindex])').count()).toBe(0);
  return glyphs;
}

for (const [width, height] of [[844, 390], [390, 844]])
  test(`cove assets nested activation ${width}x${height}: icon and label keep single native ownership and dynamic identity`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width, height }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    await context.addInitScript(() => localStorage.setItem('last-ferry-muted', 'true'));
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const observations: Record<string, unknown> = {};
    try {
      await ready(page, 'holding-pier');
      await page.evaluate(() => {
        (window as any).__coveControlNodes = ['sound-toggle', 'view-toggle'].map((id) => document.getElementById(id));
        (window as any).__coveClicks = [];
        (window as any).__coveFocus = [];
        document.addEventListener('click', (event) => {
          const button = (event.target as Element)?.closest('button');
          if (button) (window as any).__coveClicks.push({ id: button.id, trusted: event.isTrusted });
        }, true);
        document.addEventListener('focusin', () => {
          const api = (window as any).__LAST_FERRY__;
          const dock = document.getElementById('dock-actions')!;
          const trace = (window as any).__coveFocus;
          trace.push({ at: performance.now(), focus: document.activeElement?.id, view: api.getViewStatus(), dockHidden: dock.hidden, dockVisibility: getComputedStyle(dock).visibility });
          if (trace.length > 80) trace.shift();
        });
      });
      observations.initialGlyphs = await validGlyphs(page);
      expect(await state(page)).toMatchObject({ turn: 0 });
      await fullyVisible(page, page.locator('#unload'));
      await expect(page.locator('#unload')).toContainText('Let ashore');
      await expect(page.locator('#unload .cove-glyph')).toHaveAttribute('data-icon', 'unload');
      await tapChild(page, '#unload .cove-glyph');
      await expect(page.locator('#dialog')).toBeVisible();
      expect((await state(page)).turn).toBe(0);
      await tapChild(page, '#cancel .cove-glyph');
      await expect(page.locator('#dialog')).toBeHidden();
      await expect(page.locator('#unload')).toBeFocused();
      await page.waitForTimeout(200);
      await tapChild(page, '#unload .cove-label');
      await expect(page.locator('#dialog')).toBeVisible();
      await tapChild(page, '#commit .cove-glyph');
      await idle(page);
      expect(await state(page)).toMatchObject({ turn: 1, aboard: [], waitingByPier: { 'stone-pier': ['sheep-1'] } });
      expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getRenderStatus().historyLength)).toBe(1);
      await tapChild(page, '#undo .cove-label');
      await idle(page);
      expect((await state(page)).turn).toBe(0);
      expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus().muted)).toBe(true);
      await tapChild(page, '#sound-toggle .cove-glyph');
      await expect.poll(() => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus().running)).toBe(true);
      await expect(page.locator('#sound-toggle')).toHaveAccessibleName('Mute sound');
      await expect(page.locator('#sound-toggle .cove-glyph')).toHaveAttribute('data-icon', 'sound-on');
      await tapChild(page, '#sound-toggle .cove-glyph');
      await expect(page.locator('#sound-toggle')).toHaveAccessibleName('Enable sound');
      await expect(page.locator('#sound-toggle .cove-glyph')).toHaveAttribute('data-icon', 'sound-off');
      await tapChild(page, '#view-toggle .cove-glyph');
      await expect(page.locator('#view-toggle .cove-label')).toHaveText('Play view');
      await expect(page.locator('#view-toggle')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('#back-to-boat .cove-glyph')).toHaveAttribute('data-icon', 'back-to-boat');
      await expect(page.locator('#map-harbor .cove-glyph')).toHaveAttribute('data-icon', 'harbor-home');
      await tapChild(page, '#back-to-boat .cove-label');
      await expect(page.locator('#view-toggle .cove-label')).toHaveText('Whole cove');
      expect(await page.evaluate(() => (window as any).__coveControlNodes.every((node: HTMLElement) => document.getElementById(node.id) === node))).toBe(true);
      await tabTo(page, 'unload');
      await page.keyboard.press('Space');
      await expect(page.locator('#cancel')).toBeFocused();
      await tabTo(page, 'passenger-sheep-1');
      await page.keyboard.press('Space');
      await expect(page.locator('#passenger-sheep-1')).toHaveAttribute('aria-pressed', 'false');
      await expect(page.locator('#commit')).toBeDisabled();
      await page.keyboard.press('Space');
      await expect(page.locator('#passenger-sheep-1')).toHaveAttribute('aria-pressed', 'true');
      await tabTo(page, 'cancel', true);
      await page.keyboard.press('Escape');
      await expect(page.locator('#unload')).toBeFocused();
      await fullyVisible(page, page.locator('#unload'));
      observations.returnFocus = await page.evaluate(() => ({ focus: document.activeElement?.id, view: (window as any).__LAST_FERRY__.getViewStatus(), dockVisibility: getComputedStyle(document.getElementById('dock-actions')!).visibility }));
      mkdirSync(reviewDir, { recursive: true });
      await page.screenshot({ path: `${reviewDir}/nested-${width}x${height}-focus-${test.info().repeatEachIndex}.png` });
      await page.keyboard.press('Enter');
      await tabTo(page, 'commit');
      await page.keyboard.press('Enter');
      await idle(page);
      expect((await state(page)).turn).toBe(1);
      await tabTo(page, 'undo', true);
      await page.keyboard.press('Enter');
      await idle(page);
      expect((await state(page)).turn).toBe(0);
      observations.clicks = await page.evaluate(() => (window as any).__coveClicks);
      const clicks = observations.clicks as { id: string; trusted: boolean }[];
      expect(clicks.every((click) => click.trusted)).toBe(true);
      expect(clicks.filter((click) => click.id === 'commit')).toHaveLength(2);
      observations.finalGlyphs = await validGlyphs(page);
      observations.final = await state(page);
      expect(errors).toEqual([]);
      mkdirSync(reviewDir, { recursive: true });
      writeFileSync(`${reviewDir}/nested-${width}x${height}-${test.info().repeatEachIndex}.json`, JSON.stringify({ observations, errors }, null, 2));
    } finally {
      observations.focusTrace = await page.evaluate(() => (window as any).__coveFocus).catch(() => null);
      observations.exit = await page.evaluate(() => ({ focus: document.activeElement?.id, view: (window as any).__LAST_FERRY__?.getViewStatus(), dock: { hidden: document.getElementById('dock-actions')?.hidden, visibility: getComputedStyle(document.getElementById('dock-actions')!).visibility } })).catch(() => null);
      mkdirSync(reviewDir, { recursive: true });
      writeFileSync(`${reviewDir}/nested-${width}x${height}-${test.info().repeatEachIndex}.json`, JSON.stringify({ observations, errors }, null, 2));
      await context.close();
    }
  });
