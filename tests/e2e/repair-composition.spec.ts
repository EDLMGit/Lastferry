import { expect, test } from '@playwright/test';
import { activate, idle } from './ui';
import { journeyKey, passive } from './story-support';
import { directory, snapshot, report } from './large-cove-support';

test('matching phone views, revised launch and existing saved Wide Berth entrance', async ({
  browser,
  baseURL,
}) => {
  const dir = directory('comparison');
  for (const [width, height] of [
    [390, 844],
    [780, 320],
    [1440, 900],
  ]) {
    const ctx = await browser.newContext({
      baseURL,
      viewport: { width, height },
      deviceScaleFactor: 1,
      hasTouch: true,
    });
    try {
      const page = await ctx.newPage();
      const prefix = width + 'x' + height;
      for (const cove of ['holding-pier', 'wide-berth', 'reef-return']) {
        await page.goto('/?cove=' + cove);
        await page.waitForFunction(() => (window as any).__LAST_FERRY__?.getMetrics().frames > 4);
        await idle(page);
        await snapshot(page, dir, prefix + '-' + cove);
      }
      if (width === 1440) {
        await page.goto('/asset-gallery.html#wide-ferry');
        await page.locator('#gallery-wide-ferry').scrollIntoViewIfNeeded();
        await page.locator('#gallery-wide-ferry').screenshot({ path: dir + '/gallery.png' });
      } else {
        const previous = ['holding-pier', 'bellwater', 'driftwood-yard', 'two-shelters'];
        const saved = JSON.stringify({
          version: 1,
          completed: previous,
          acknowledgedScenes: ['opening', 'another-bell', 'driftwood-light', 'among-the-reeds'],
          checkpoint: { kind: 'scene', id: 'a-wider-deck' },
        });
        await page.evaluate(({ key, saved }) => localStorage.setItem(key, saved), {
          key: journeyKey,
          saved,
        });
        await page.goto('/');
        await activate(page, 'home-play', true);
        await expect(page.locator('#story-continue')).toHaveText('Continue to Wide Berth');
        await snapshot(page, dir, prefix + '-launch');
        expect(await passive(page, (key) => localStorage.getItem(key), journeyKey)).toBe(saved);
        await activate(page, 'story-continue', true);
        await idle(page);
        await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Wide Berth');
        const atWide = await passive(
          page,
          (key) => JSON.parse(localStorage.getItem(key)!),
          journeyKey,
        );
        expect(atWide.completed).toEqual(previous);
        expect(atWide.checkpoint).toEqual({ kind: 'cove', id: 'wide-berth' });
        await page.goto('/');
        await expect(page.locator('#home-play')).toHaveText('Continue');
        await activate(page, 'home-play', true);
        await idle(page);
        const freshWide = await passive(page, () => (window as any).__LAST_FERRY__.getState());
        expect(freshWide).toMatchObject({ turn: 0, boatNodeId: 'wide-berth', aboard: [] });
        expect(await passive(page, (key) => JSON.parse(localStorage.getItem(key)!), journeyKey)).toEqual(atWide);
        const completed = JSON.stringify({
          ...atWide,
          completed: [...previous, 'wide-berth', 'reef-return'],
          acknowledgedScenes: [...atWide.acknowledgedScenes, 'lights-beyond-the-reef'],
          checkpoint: { kind: 'complete' },
        }, null, 2);
        await page.evaluate(({ key, completed }) => localStorage.setItem(key, completed), { key: journeyKey, completed });
        await page.goto('/');
        await expect(page.locator('#home-play')).toHaveText('Play a cove');
        await expect(page.getByText('Six coves are safe.', { exact:true })).toBeVisible();
        expect(await passive(page, key => localStorage.getItem(key), journeyKey)).toBe(completed);
        report(dir, prefix + '-checkpoint', {
          saved: JSON.parse(saved),
          after: atWide,
          atWide: true,
          completionBytesPreserved: true,
        });
      }
    } finally {
      await ctx.close();
    }
  }
});
