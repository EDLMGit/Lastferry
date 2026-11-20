import { expect, test, type Page } from '@playwright/test';
import { measurePanel } from './cove-panel-measure';
import { directory, report, snapshot } from './large-cove-support';
import { measurePortraits } from './portrait-measure';
import { activate, fullyVisible, ready, state } from './ui';

test.use({ hasTouch: true, isMobile: true, viewport: { width: 780, height: 320 }, deviceScaleFactor: 1, reducedMotion: 'reduce', video: 'off' });

async function choiceFrame(page: Page, name: string) {
  const fit = await page.evaluate(measurePanel);
  const portraits = await page.evaluate(measurePortraits);
  expect(fit.failures).toEqual([]);
  expect(portraits.canvasCount).toBe(1);
  for (const choice of portraits.choices) {
    expect(choice.button.height).toBeGreaterThanOrEqual(48);
    expect(choice.imageContained && choice.checkContained && !choice.checkOverlapsPortrait).toBe(true);
    expect(choice.image?.rect?.width).toBe(54);
    expect(choice.image?.rect?.height).toBe(54);
    expect(choice.image?.pointerEvents).toBe('none');
    const accessible = page.locator('#' + choice.id);
    await expect(accessible).toHaveAccessibleName(choice.name + ' ' + choice.capacity);
  }
  await fullyVisible(page, page.locator('#commit'));
  await fullyVisible(page, page.locator('#cancel'));
  const hit = await page.locator('#commit').evaluate(button => {
    const box = button.getBoundingClientRect();
    return button.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2));
  });
  expect(hit).toBe(true);
  if (name) {
    const path = directory('choices');
    await snapshot(page, path, name);
    report(path, name, { fit, portraits, source: 'Live Wide Berth Practice; driven through ordinary game controls.' });
  }
  return { button: fit.confirm.rect, dialog: fit.nested[0].rect, tiles: portraits.choices.map(choice => choice.button) };
}

test('a real four-neighbor chooser holds the commit target during selection, failed images and portrait rotation', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\/choice\/sheep-wool\.png(?:\?|$)/, async route => {
    if (route.request().resourceType() !== 'image') return route.continue();
    await gate;
    return route.continue();
  });
  await page.route(/\/choice\/rabbit-tan\.png(?:\?|$)/, route =>
    route.request().resourceType() === 'image' ? route.abort() : route.continue());
  try {
    await ready(page, 'wide-berth');
    await activate(page, 'board', true);
    const grid = page.locator('.passenger-options');
    await expect(grid.locator('button')).toHaveCount(4);
    await expect(grid.locator('img[data-portrait-state=pending]')).toHaveCount(2);
    await expect(grid.locator('img[data-portrait-state=failed]')).toHaveCount(1);
    const before = await choiceFrame(page, 'wide-four-pending-failed');
    release();
    await expect(grid.locator('img[data-portrait-state=loaded]')).toHaveCount(3);
    expect(await choiceFrame(page, '')).toEqual(before);
    const current = await state(page);
    const choices = grid.getByRole('button');
    const baseline = await choiceFrame(page, 'wide-four-landscape');
    for (const selected of [false, true, false]) {
      for (const choice of await choices.all()) {
        if (await choice.getAttribute('aria-pressed') !== String(selected)) await choice.tap();
      }
      expect(await state(page)).toEqual(current);
      await expect(page.locator('#commit')).toBeEnabled({ enabled: selected });
      const measured = await choiceFrame(page, '');
      expect(measured.button).toEqual(baseline.button);
      expect(measured.dialog).toEqual(baseline.dialog);
    }
    await activate(page, 'passenger-wren', true);
    await expect(page.locator('#commit')).toBeEnabled();
    const after = await choiceFrame(page, 'wide-four-one-selected');
    expect(after.button).toEqual(baseline.button);
    await page.setViewportSize({ width: 320, height: 740 });
    await expect(grid.locator('button[aria-pressed=true]')).toHaveCount(1);
    await choiceFrame(page, 'wide-four-narrow');
    await page.keyboard.press('Escape');
    expect(await state(page)).toEqual(current);
  } finally { release(); }
});
