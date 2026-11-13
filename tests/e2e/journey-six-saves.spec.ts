import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { productionURL, reviewDir } from './evidence';
import { activate, fullyVisible } from './ui';

const primary = 'last-ferry.journey.v1';
const backup = primary + '.before-six-coves';
const coves = ['holding-pier', 'bellwater', 'driftwood-yard', 'wide-berth'];
const scenes = ['opening', 'another-bell', 'driftwood-light', 'a-wider-deck'];
const fixtures = [
  { name: 'complete-two', count: 2, seen: 2, checkpoint: { kind: 'complete' }, next: 'driftwood-light' },
  { name: 'complete-three', count: 3, seen: 3, checkpoint: { kind: 'complete' }, next: 'among-the-reeds' },
  { name: 'pending-launch', count: 3, seen: 3, checkpoint: { kind: 'scene', id: 'a-wider-deck' }, next: 'among-the-reeds' },
  { name: 'active-wide', count: 3, seen: 4, checkpoint: { kind: 'cove', id: 'wide-berth' }, next: 'among-the-reeds' },
  { name: 'complete-four', count: 4, seen: 4, checkpoint: { kind: 'complete' }, next: 'among-the-reeds' },
];
function original(fixture: typeof fixtures[number]) {
  return {
    version: 1,
    completed: coves.slice(0, fixture.count),
    acknowledgedScenes: scenes.slice(0, fixture.seen),
    checkpoint: fixture.checkpoint,
  };
}

async function seed(page: Page, raw: string, denied = '') {
  await page.addInitScript(({ primary, backup, raw, denied }) => {
    if (location.origin === 'null') return;
    if (!sessionStorage.getItem('fixture-ready')) {
      localStorage.setItem(primary, raw);
      localStorage.setItem('last-ferry-muted', 'true');
      sessionStorage.setItem('fixture-ready', '1');
      sessionStorage.setItem('journey-writes', '[]');
    }
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (this === localStorage && (key === primary || key.startsWith(backup))) {
        const writes: string[] = JSON.parse(sessionStorage.getItem('journey-writes')!);
        writes.push(key);
        write.call(sessionStorage, 'journey-writes', JSON.stringify(writes));
        if (key === denied) throw new DOMException('Storage denied for verification', 'QuotaExceededError');
      }
      write.call(this, key, value);
    };
  }, { primary, backup, raw, denied });
}

function bytes(page: Page, key = primary) {
  return page.evaluate(key => localStorage.getItem(key), key);
}
function writes(page: Page) {
  return page.evaluate(() => JSON.parse(sessionStorage.getItem('journey-writes')!));
}
test.use({ viewport: { width: 780, height: 320 }, hasTouch: true, reducedMotion: 'reduce' });

for (const fixture of fixtures) {
  test('production Continue preserves ' + fixture.name + ' and restores the new entry', async ({ page }) => {
    const saved = original(fixture);
    const raw = '\n' + JSON.stringify(saved, null, 2) + '\n';
    const nextLabel = fixture.count === 2 ? 'Continue to Driftwood' : 'Continue to Two Shelters';
    await seed(page, raw);
    await page.goto(productionURL + '/?cove=reef-return');
    await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Reef Return');
    await page.goto(productionURL);
    await expect(page.locator('#home-play')).toHaveText('Continue');
    if (fixture.count > 2) await expect(page.locator('.home-notice')).toContainText('Two Shelters');
    if (fixture.count === 4) await expect(page.locator('.home-notice')).toContainText('Wide Berth is already safe');
    await fullyVisible(page, page.locator('#home-play'));
    if (fixture.name === 'complete-four') {
      mkdirSync(reviewDir, { recursive: true });
      await page.screenshot({ path: reviewDir + '/780x320-legacy-home.png' });
      await activate(page, 'home-options', true);
      await expect(page.locator('#tips-preference')).toHaveValue('off');
      await activate(page, 'settings-back', true);
      await activate(page, 'home-practice', true);
      await expect(page.locator('button[data-practice]')).toHaveCount(8);
      await activate(page, 'practice-two-shelters', true);
      await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Two Shelters');
      await page.reload();
    }
    expect(await bytes(page)).toBe(raw);
    expect(await bytes(page, backup)).toBeNull();
    expect(await writes(page)).toEqual([]);
    await activate(page, 'home-play', true);
    await expect(page.locator('#story-continue')).toHaveText(nextLabel);
    await expect(page.locator('#story-caption')).not.toHaveClass(/story-recap/);
    expect(await bytes(page, backup)).toBe(raw);
    expect(JSON.parse((await bytes(page))!)).toEqual({ ...saved, checkpoint: { kind: 'scene', id: fixture.next } });
    expect(await writes(page)).toEqual([backup, primary]);
    await page.reload();
    await activate(page, 'home-play', true);
    await expect(page.locator('#story-caption')).toHaveClass(/story-recap/);
    expect(await writes(page)).toEqual([backup, primary]);
    await activate(page, 'story-continue', true);
    const active = JSON.parse((await bytes(page))!);
    expect(active.completed).toEqual(saved.completed);
    expect([...active.acknowledgedScenes].sort()).toEqual([...saved.acknowledgedScenes, fixture.next].sort());
    expect(active.checkpoint).toEqual({ kind: 'cove', id: fixture.count === 2 ? 'driftwood-yard' : 'two-shelters' });
    expect(await bytes(page, backup)).toBe(raw);
  });
}

for (const kind of ['scene', 'cove'] as const) {
  test('earlier ' + kind + ' checkpoint reopens in place without conversion', async ({ page }) => {
    const record = {
      version: 1,
      completed: coves.slice(0, 1),
      acknowledgedScenes: scenes.slice(0, kind === 'scene' ? 1 : 2),
      checkpoint: { kind, id: kind === 'scene' ? 'another-bell' : 'bellwater' },
    };
    const raw = JSON.stringify(record, null, 2);
    await seed(page, raw);
    await page.goto(productionURL);
    await activate(page, 'home-play', true);
    if (kind === 'scene') {
      await expect(page.locator('#story-continue')).toHaveText('Continue to Bellwater');
      await expect(page.locator('#story-caption')).toHaveClass(/story-recap/);
    } else {
      await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Bellwater Cove');
      await expect(page.locator('#undo')).toBeDisabled();
    }
    expect(await bytes(page)).toBe(raw);
    expect(await writes(page)).toEqual([]);
  });
}

for (const denied of [backup, primary]) {
  test('storage denial at ' + denied + ' preserves the original and allows this visit', async ({ page }) => {
    const raw = JSON.stringify(original(fixtures[4]), null, 2);
    await seed(page, raw, denied);
    await page.goto(productionURL);
    await activate(page, 'home-play', true);
    await expect(page.locator('.story-storage-notice')).toBeVisible();
    await fullyVisible(page, page.locator('#story-continue'));
    await activate(page, 'story-continue', true);
    await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Two Shelters');
    await activate(page, 'menu', true);
    await expect(page.locator('#dialog')).toContainText('Journey progress lasts for this visit');
    expect(await writes(page)).toEqual(denied === backup ? [backup] : [backup, primary]);
    expect(await bytes(page)).toBe(raw);
    expect(await bytes(page, backup)).toBe(denied === backup ? null : raw);
    await page.reload();
    await expect(page.locator('.home-notice')).toContainText('Wide Berth is already safe');
    expect(await bytes(page)).toBe(raw);
  });
}

for (const raw of ['{unfinished', '{"version":2,"future":true}']) {
  test('unreadable or future save is recoverable ' + raw, async ({ page }) => {
    await seed(page, raw);
    await page.goto(productionURL);
    await expect(page.locator('.home-notice')).toContainText('stored progress has been kept');
    await activate(page, 'home-play', true);
    await activate(page, 'journey-replace-cancel', true);
    await activate(page, 'home-practice', true);
    await activate(page, 'practice-reef-return', true);
    await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Reef Return');
    expect(await bytes(page)).toBe(raw);
    expect(await writes(page)).toEqual([]);
  });
}
