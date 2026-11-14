import { expect, test } from '@playwright/test';
import { act, activate, idle, selectPlace, state, undo } from './ui';
import { journeyKey } from './story-support';

test('short landscape Practice keeps the pending launch through reef inspection, loss, Undo and direct replay', async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    baseURL, viewport: { width: 780, height: 320 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce',
  });
  const record = {
    version: 1,
    checkpoint: { kind: 'scene', id: 'a-wider-deck' },
    completed: ['holding-pier', 'bellwater', 'driftwood-yard'],
    acknowledgedScenes: ['opening', 'another-bell', 'driftwood-light'],
  };
  const bytes = '\n' + JSON.stringify(record, null, 2) + '\n';
  await context.addInitScript(({ key, bytes }) => {
    if (!sessionStorage.getItem('reef-practice-fixture')) {
      localStorage.setItem(key, bytes);
      localStorage.setItem('last-ferry-muted', 'true');
      sessionStorage.setItem('reef-practice-fixture', 'seeded');
    }
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (this === localStorage && name === key) sessionStorage.setItem('reef-journey-write', 'observed');
      return original.call(this, name, value);
    };
  }, { key: journeyKey, bytes });
  const page = await context.newPage();
  const save = () => page.evaluate((key) => ({
    bytes: localStorage.getItem(key), write: sessionStorage.getItem('reef-journey-write'),
  }), journeyKey);
  try {
    await page.goto('/');
    await expect(page.locator('#home-play')).toHaveText('Continue');
    await activate(page, 'home-practice', true);
    await expect(page.locator('#practice-two-shelters')).toHaveText('Two Shelters');
    await activate(page, 'practice-reef-return', true);
    await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Reef Return');
    await expect(page.locator('#status-toggle')).toContainText('Wrack Pier floods in 3 actions');
    await activate(page, 'status-toggle', true);
    await expect(page.locator('.current-schedule')).toContainText('After action 3');
    await expect(page.locator('.current-schedule')).toContainText('After action 9');
    await activate(page, 'cancel', true);
    expect((await state(page)).turn).toBe(0);
    const start = await state(page);
    await selectPlace(page, 'harbor', true);
    await expect(page.locator('#sail')).toBeDisabled();
    await expect(page.locator('#local-context')).toContainText('Against the current');
    expect(await state(page)).toEqual(start);
    await activate(page, 'close-location', true);
    await act(page, 'unload', true);
    await act(page, 'map-wrack', true);
    const before = await state(page);
    await act(page, 'wait', true);
    await expect(page.locator('#dialog')).toHaveAttribute('data-outcome', 'lost');
    await expect(page.locator('.ending')).toContainText('Dot');
    await undo(page, true);
    expect(await state(page)).toEqual(before);
    expect(await save()).toEqual({ bytes, write: null });
    await page.goto('/?cove=reef-return');
    await expect(page.locator('#unload')).toBeVisible();
    expect((await state(page)).turn).toBe(0);
    expect(await save()).toEqual({ bytes, write: null });
    await page.goto('/');
    await expect(page.locator('#home-play')).toHaveText('Continue');
    expect(await save()).toEqual({ bytes, write: null });
  } finally {
    await context.close();
  }
});
