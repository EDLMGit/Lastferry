import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { lastFerry } from '../../src/levels/level';
import { activate, fullyVisible, idle, tabTo } from '../../tests/e2e/ui';
import { completeSeven } from '../../tests/e2e/cove-eight-support';
import { completeSix, legacyTwo, run, witness } from '../../tests/e2e/three-lanterns-support';

const dir = process.env.HOME_CONTINUITY_DIR ?? 'reviews/journey-home/continuity';
mkdirSync(dir, { recursive: true });
const original = JSON.parse(
  readFileSync('reviews/ternhaven-journey/gameplay/390x844/route.json', 'utf8'),
).reloaded;
const key = 'last-ferry.journey.v1',
  backup = key + '.before-drowned-orchard',
  best = 'last-ferry.mastery.v1';
const older = {
  [key + '.before-six-coves']: legacyTwo,
  [key + '.before-orchard']: completeSix,
  [key + '.before-ternhaven']: completeSeven,
  [backup]: 'previously retained backup bytes',
};
const records = { ...older, [key]: original.journey as string, [best]: original.mastery as string };
async function setup(page: Page, failBackup = false) {
  await page.addInitScript(
    ({ records, backup, failBackup }) => {
      if (!sessionStorage.getItem('journey-home-seeded')) {
        for (const [k, v] of Object.entries(records)) localStorage.setItem(k, v);
        sessionStorage.setItem('journey-home-seeded', 'true');
      }
      const originalSet = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) {
        if (this === localStorage && k.startsWith('last-ferry.journey')) {
          const log = JSON.parse(sessionStorage.getItem('writes') ?? '[]');
          log.push(k);
          originalSet.call(sessionStorage, 'writes', JSON.stringify(log));
          if (failBackup && k === backup + '.2' && !sessionStorage.getItem('retry')) {
            originalSet.call(sessionStorage, 'retry', 'true');
            return;
          }
        }
        return originalSet.call(this, k, v);
      };
    },
    { records, backup, failBackup },
  );
}
const stored = (page: Page) =>
  page.evaluate(() =>
    Object.fromEntries(
      Object.entries(localStorage).filter(
        ([k]) => k.startsWith('last-ferry.journey') || k === 'last-ferry.mastery.v1',
      ),
    ),
  );
const writes = (page: Page) =>
  page.evaluate(() => JSON.parse(sessionStorage.getItem('writes') ?? '[]') as string[]);
async function orchardCheckpoint(page: Page) {
  const values = await stored(page);
  expect(values).toMatchObject({
    ...older,
    [backup + '.2']: original.journey,
    [best]: original.mastery,
  });
  const result = JSON.parse(values[key]);
  expect(result.completed).toEqual(JSON.parse(original.journey).completed);
  return result;
}
test('exact published Ternhaven completion is isolated in Practice and resumes safely at Drowned Orchard', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await setup(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#home-play')).toHaveText('Continue');
  await expect(page.locator('.home-notice')).toContainText('Drowned Orchard');
  await page.screenshot({ path: dir + '/old-eight-home.png' });
  expect(await stored(page)).toEqual(records);
  await activate(page, 'home-practice', true);
  await expect(page.locator('[data-practice]')).toHaveCount(13);
  await activate(page, 'practice-last-ferry', true);
  await run(page, lastFerry, witness('last-ferry'), false);
  await expect(page.locator('#choose-cove')).toBeVisible();
  await expect(page.locator('#continue-story')).toHaveCount(0);
  await expect(page.locator('.arrival-unrated')).toContainText('no lantern rating');
  await page.goto('/?cove=drowned-orchard');
  await idle(page);
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Drowned Orchard');
  await page.goto('/');
  expect(await stored(page)).toEqual(records);
  expect(await writes(page)).toEqual([]);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await activate(page, 'home-play', true);
  await expect(page.locator('.story-picture')).toHaveAttribute(
    'data-illustration',
    'drowned-orchard',
  );
  await expect(page.locator('#story-caption')).not.toHaveClass(/story-recap/);
  const pending = await orchardCheckpoint(page);
  expect(pending.checkpoint).toEqual({ kind: 'scene', id: 'orchard-underwater' });
  expect(pending.acknowledgedScenes).toEqual(JSON.parse(original.journey).acknowledgedScenes);
  expect(await writes(page)).toEqual([backup + '.2', key]);
  await page.reload();
  await activate(page, 'home-play', true);
  await expect(page.locator('#story-caption')).toHaveClass(/story-recap/);
  await expect(page.locator('#story-canvas')).toHaveAccessibleName(/Cider Quay/i);
  await page.screenshot({ path: dir + '/old-eight-orchard.png' });
  expect(await orchardCheckpoint(page)).toEqual(pending);
  await activate(page, 'story-continue', true);
  await idle(page);
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Drowned Orchard');
  await expect(page.locator('.gauge-load')).toContainText('Load 0/6');
  await expect(page.locator('[aria-current="location"]')).toHaveAccessibleName(/Orchard Landing/i);
  await page.screenshot({ path: dir + '/old-eight-turn-zero.png' });
  const playing = await orchardCheckpoint(page);
  expect(playing.checkpoint).toEqual({ kind: 'cove', id: 'drowned-orchard' });
  expect(playing.acknowledgedScenes).toEqual([...pending.acknowledgedScenes, 'orchard-underwater']);
  expect(errors).toEqual([]);
  writeFileSync(
    dir + '/legacy.json',
    JSON.stringify(
      {
        seed: 'reviews/ternhaven-journey/gameplay/390x844/route.json#reloaded',
        originalSHA256: createHash('sha256').update(original.journey).digest('hex'),
        pending,
        playing,
        writes: await writes(page),
        olderKeysPreserved: Object.keys(older),
        masteryUnchanged: true,
        errors,
      },
      null,
      2,
    ) + '\n',
  );
});
test('failed backup readback preserves the old bytes and Home retries on a new explicit gesture', async ({
  page,
}) => {
  await setup(page, true);
  await page.goto('/');
  await activate(page, 'home-play', true);
  await expect(page.locator('#home-play')).toBeVisible();
  await expect(page.locator('.home-notice')).toContainText(/backup|back up|save/i);
  expect(await stored(page)).toEqual(records);
  expect(await writes(page)).toEqual([backup + '.2']);
  await expect(page.locator('#home-play')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.story-picture')).toHaveAttribute(
    'data-illustration',
    'drowned-orchard',
  );
  expect((await orchardCheckpoint(page)).checkpoint.id).toBe('orchard-underwater');
});
test('the offline single file plays the opening and reaches the live Holding Pier', async ({
  page,
  context,
}) => {
  const errors: string[] = [],
    requests: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (/^https?:/.test(r.url())) requests.push(r.url());
  });
  await context.setOffline(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(pathToFileURL(resolve('../Last Ferry - The Long Tide.html')).href);
  await activate(page, 'home-play', true);
  for (const [index, label] of ['Next', 'Next', 'Take the helm'].entries()) {
    await expect(page.locator('#story-position')).toHaveText(index + 1 + ' of 3');
    await expect(page.locator('#story-continue')).toContainText(label);
    await tabTo(page, 'story-continue');
    await page.keyboard.press('Enter');
  }
  await idle(page);
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'The Holding Pier');
  await activate(page, 'unload', true);
  await idle(page);
  await tabTo(page, 'undo');
  await page.keyboard.press('Enter');
  await idle(page);
  await fullyVisible(page, page.locator('#load-toggle'));
  await expect(page.locator('.gauge-crew')).toContainText('Moss aboard');
  expect(errors).toEqual([]);
  expect(requests).toEqual([]);
});

test('the offline export restores the earned pending supper and opens credits on explicit continuation', async ({
  page,
  context,
}) => {
  const voyage = JSON.parse(readFileSync('reviews/journey-home/play/voyage.json', 'utf8'));
  const boundary = voyage.checkpoints.find(
    (entry: { label: string }) => entry.label === 'accepted last-ferry',
  ).record;
  expect(boundary.completed).toHaveLength(12);
  expect(boundary.checkpoint).toEqual({ kind: 'scene', id: 'a-place-for-the-captain' });
  await context.setOffline(true);
  const remoteRequests: string[] = [];
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (/^https?:/.test(request.url())) remoteRequests.push(request.url());
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(pathToFileURL(resolve('../Last Ferry - The Long Tide.html')).href);
  await page.evaluate(({ key, boundary }) => localStorage.setItem(key, JSON.stringify(boundary)), {
    key,
    boundary,
  });
  await page.reload();
  await activate(page, 'home-play', true);
  await expect(page.locator('#story-caption')).toHaveText('We saved you a place.');
  await expect(page.locator('#story-canvas')).toBeVisible();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key)).toEqual(
    boundary,
  );
  await tabTo(page, 'story-continue');
  await page.keyboard.press('Enter');
  await expect(page.locator('#dialog-title')).toHaveText('Credits');
  for (const id of ['journey-practice', 'journey-settings', 'journey-title']) {
    await fullyVisible(page, page.locator('#' + id));
  }
  await page.screenshot({ path: dir + '/offline-credits-desktop.png' });
  expect(
    await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).checkpoint, key),
  ).toEqual({ kind: 'complete' });
  expect(remoteRequests).toEqual([]);
  expect(errors).toEqual([]);
});
