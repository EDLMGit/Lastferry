import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import { measurePanel } from './cove-panel-measure';
import { act, activate, fullyVisible, idle, ready, state, tabTo, undo } from './ui';

const boundary = (page: Page) => page.evaluate(() => {
  const api = (window as any).__LAST_FERRY__;
  return { state: api.getState(), history: api.getRenderStatus().historyLength, view: api.getViewStatus(), homecoming: api.getHomecomingStatus(), audio: { victoryTarget: api.getAudioStatus().victoryTarget }, hud: document.getElementById('readout')!.textContent };
});

async function tapChild(page: Page, selector: string) {
  const box = await page.locator(selector).boundingBox();
  expect(box).not.toBeNull();
  await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);
}

test('cove panel final preview: full labels, subsets, partial delivery and native fullscreen across rotation', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 780, height: 320 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const observations: Record<string, unknown> = {};
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const save = async (name: string) => {
    observations[name] = { boundary: await boundary(page), fit: await page.evaluate(measurePanel) };
    mkdirSync(reviewDir, { recursive: true });
    await page.screenshot({ path: `${reviewDir}/panel-${name}.png` });
  };
  try {
    await ready(page, 'holding-pier');
    await activate(page, 'menu', true);
    await activate(page, 'fullscreen', true);
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
    await expect(page.locator('#fullscreen')).toHaveAccessibleName('Exit fullscreen');
    await fullyVisible(page, page.locator('#cancel'));
    observations.actualFullscreen = await page.evaluate(() => (window as any).__LAST_FERRY__.getFullscreenStatus());
    await activate(page, 'cancel', true);
    for (const id of ['unload', 'map-shallows', 'map-rabbit-pier']) await act(page, id, true);
    await activate(page, 'board', true);
    await tapChild(page, '#passenger-rabbit-2 .cove-choice-name');
    await expect(page.locator('#preview .consequence')).toContainText('Rue is still waiting');
    const overflow = await page.locator('#preview').evaluate(e => e.scrollHeight - e.clientHeight);
    if (overflow > 1) {
      const box = await page.locator('#preview').boundingBox();
      await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await page.mouse.wheel(0, 300);
      await expect.poll(() => page.locator('#preview').evaluate(e => e.scrollTop)).toBeGreaterThan(0);
    }
    await expect(page.locator('#preview .consequence')).toBeInViewport({ ratio: 1 });
    await fullyVisible(page, page.locator('#commit'));
    await save('short-warning-scrolled');
    await activate(page, 'passenger-rabbit-2', true);
    await activate(page, 'commit', true);
    await idle(page);
    expect(await state(page)).toMatchObject({ turn: 4, tideLevel: 1 });
    await undo(page, true);
    expect(await state(page)).toMatchObject({ turn: 3, tideLevel: 0 });
    for (const id of ['board', 'map-shallows', 'map-stone', 'board', 'map-harbor']) await act(page, id, true);
    const before = await boundary(page);
    expect(before.state).toMatchObject({ turn: 8, status: 'playing', aboard: ['rabbit-1', 'rabbit-2', 'sheep-1'] });
    await tapChild(page, '#unload .cove-glyph');
    let fit = await page.evaluate(measurePanel);
    expect(fit.failures).toEqual([]);
    expect(fit.choices.map(c => c.id)).toEqual(['passenger-rabbit-1', 'passenger-rabbit-2', 'passenger-sheep-1']);
    expect(fit.choices.map(c => c.lines.map(l => l.text).join(' '))).toEqual(['Pip 1 space', 'Rue 1 space', 'Moss 2 spaces']);
    await expect(page.locator('#preview .consequence')).toHaveText('Everyone will be safely home at Harbor.');
    await expect(page.locator('#preview .preview-result')).toHaveText('After this action: Boat 0/4 spaces · tide 2');
    await tapChild(page, '#dialog .eyebrow');
    expect((await boundary(page)).state).toEqual(before.state);
    expect((await boundary(page)).history).toBe(before.history);
    await expect(page.locator('#dialog')).toBeVisible();
    const footer = await page.locator('#commit').boundingBox();
    const position = await page.evaluate(() => (window as any).__LAST_FERRY__.getActionPlacement());
    for (const id of ['rabbit-2', 'sheep-1', 'rabbit-1', 'rabbit-1', 'sheep-1', 'rabbit-2']) {
      await tapChild(page, `#passenger-${id} .cove-choice-name`);
      const current = await boundary(page);
      expect(current.state).toEqual(before.state);
      expect(current.history).toBe(before.history);
      expect(current.hud).toBe(before.hud);
      expect(current.view).toEqual(before.view);
      expect(current.homecoming).toMatchObject({ active: false, celebrations: 0, camera: { factor: 1 } });
      expect(current.audio.victoryTarget).toBe(1);
      const placed = await page.evaluate(() => (window as any).__LAST_FERRY__.getActionPlacement());
      expect(placed.panel.layout).toBe(position.panel.layout);
      for (const edge of ['left', 'top', 'right', 'bottom'])
        expect(Math.abs(placed.panel[edge] - position.panel[edge])).toBeLessThanOrEqual(1);
      const box = await page.locator('#commit').boundingBox();
      expect(Math.abs(box!.x - footer!.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(box!.y - footer!.y)).toBeLessThanOrEqual(1);
      fit = await page.evaluate(measurePanel);
      expect(fit.failures).toEqual([]);
      expect(await page.locator('#commit').isDisabled()).toBe(fit.choices.every(c => c.selected === 'false'));
    }
    await save('short-three-selected');
    await tapChild(page, '#passenger-rabbit-2 .cove-choice-check .cove-glyph');
    await tapChild(page, '#passenger-sheep-1 .cove-choice-name');
    await tabTo(page, 'passenger-rabbit-1');
    await page.keyboard.press('Space');
    await expect(page.locator('#commit')).toBeDisabled();
    await page.keyboard.press('Space');
    await expect(page.locator('#passenger-rabbit-1')).toBeFocused();
    await save('short-choice-focus');
    const subsetBeforeExit = await page.locator('.passenger-options button').evaluateAll(nodes => nodes.map(n => n.getAttribute('aria-pressed')));
    const scrollBeforeExit = await page.locator('#preview').evaluate(e => e.scrollTop);
    await page.evaluate(() => document.exitFullscreen());
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null)).toBeNull();
    await expect(page.locator('#passenger-rabbit-1')).toBeFocused();
    expect(await page.locator('#preview').evaluate(e => e.scrollTop)).toBeCloseTo(scrollBeforeExit, 0);
    expect(await page.locator('.passenger-options button').evaluateAll(nodes => nodes.map(n => n.getAttribute('aria-pressed')))).toEqual(subsetBeforeExit);
    await page.setViewportSize({ width: 390, height: 844 });
    await fullyVisible(page, page.locator('#commit'));
    await fullyVisible(page, page.locator('#cancel'));
    fit = await page.evaluate(measurePanel);
    expect(fit.failures).toEqual([]);
    expect(fit.choices.map(c => c.selected)).toEqual(['true', 'false', 'false']);
    await save('portrait-one-selected');
    await tabTo(page, 'cancel', true);
    await page.keyboard.press('Escape');
    await expect(page.locator('#unload')).toBeFocused();
    await fullyVisible(page, page.locator('#unload'));
    expect((await boundary(page)).state).toEqual(before.state);
    await page.keyboard.press('Enter');
    await tabTo(page, 'passenger-rabbit-2');
    await page.keyboard.press('Space');
    await tabTo(page, 'passenger-sheep-1');
    await page.keyboard.press('Space');
    await tabTo(page, 'commit');
    await page.keyboard.press('Enter');
    await idle(page);
    expect(await state(page)).toMatchObject({ turn: 9, status: 'playing', delivered: ['rabbit-1'], aboard: ['rabbit-2', 'sheep-1'] });
    expect((await boundary(page)).homecoming.active).toBe(false);
    await undo(page, true);
    expect((await boundary(page)).state).toEqual(before.state);
    await act(page, 'unload', true);
    expect(await state(page)).toMatchObject({ turn: 9, status: 'won' });
    await expect.poll(() => boundary(page).then(v => v.homecoming.active)).toBe(true);
    await undo(page, true);
    expect((await boundary(page)).state).toEqual(before.state);
    await act(page, 'unload', true);
    expect(await state(page)).toMatchObject({ turn: 9, status: 'won' });
    observations.final = await boundary(page);
    expect(errors).toEqual([]);
  } finally {
    mkdirSync(reviewDir, { recursive: true });
    writeFileSync(`${reviewDir}/panel-subsets-lifecycle.json`, JSON.stringify({ observations, errors }, null, 2));
    await context.close();
  }
});
