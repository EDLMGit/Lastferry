import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Action } from '../../src/game/rules';
import { resultFor } from '../../src/game/mastery';
import { MOSS_REQUEST } from '../../src/game/moss-request';
import { storyCoves, supperScene } from '../../src/campaign/registry';
import { productionURL } from './evidence';
import { simpleAction } from './large-cove-support';
import { activate, fullyVisible, idle, readable, undo } from './ui';
import { fixture, skipStory, witness } from './three-lanterns-support';

test.use({ hasTouch: true, isMobile: true, reducedMotion: 'reduce', viewport: { width: 844, height: 390 }, video: 'off' });
test.describe.configure({ timeout: 240000 });

const ordinary = witness('holding-pier');
const requested: Action[] = [
  ...ordinary.slice(0, 6), { type: 'move', to: 'harbor' }, { type: 'unload', passengerIds: ['rabbit-1', 'rabbit-2'] },
  { type: 'move', to: 'stone' }, { type: 'board', passengerIds: ['sheep-1'] },
  { type: 'move', to: 'harbor' }, { type: 'unload', passengerIds: ['sheep-1'] },
];
const proofDir = process.env.JOURNEY_REWARD_FRAMES;
const snapshots = (page: Page) => page.evaluate(() => ({
  journey: JSON.parse(localStorage.getItem('last-ferry.journey.v1') ?? 'null'),
  best: JSON.parse(localStorage.getItem('last-ferry.mastery.v1') ?? 'null')?.results['holding-pier@1'],
  entries: JSON.parse(localStorage.getItem('last-ferry.harbor-log.v1') ?? '{"entries":[]}').entries as string[],
}));
const tap = (page: Page, id: string) => activate(page, id, true);

async function sail(page: Page, actions: Action[]) {
  let turn = Number(await page.getByTestId('turn').textContent());
  for (const action of actions) {
    // Distinct intended inputs can select controls at the same physical position.
    await page.waitForTimeout(350);
    await simpleAction(page, action);
    await expect(page.getByTestId('turn')).toHaveText(String(++turn).padStart(2, '0'));
  }
}

async function frame(page: Page, name: string) {
  if (!proofDir) return;
  mkdirSync(proofDir, { recursive: true });
  await page.screenshot({ path: join(proofDir, name + '.png') });
}

async function checkArrival(page: Page, card: 'rue' | 'moss' | 'ordinary', primary: string) {
  const panel = page.locator('#arrival-content');
  await expect(panel).toHaveAttribute('data-keepsake', card === 'ordinary' ? '' : card);
  const titles = { rue: 'Rue’s Lantern', moss: 'Moss’s Own Crossing', ordinary: 'Everyone home.' };
  await expect(page.locator('#dialog-title')).toHaveText(titles[card]);
  const picture = panel.locator(card === 'ordinary' ? '#arrival-cast' : '.arrival-keepsake canvas');
  if (card !== 'ordinary') await expect(picture).toHaveAttribute('data-memory', card === 'rue' ? 'lantern' : 'moss');
  const count = panel.locator('.arrival-lantern-count');
  await expect(count).toHaveText(card === 'moss' ? '1/3 lanterns' : '3/3 lanterns');
  const offer = panel.locator('.arrival-invitation');
  if (card !== 'moss') {
    await expect(offer).toHaveAccessibleName('Moss');
    await expect(offer.locator('#arrival-request-line')).toHaveText('“' + MOSS_REQUEST + '”');
    await expect(offer.locator('.arrival-page-reward')).toHaveText('Earn a Harbor log page');
    await expect(offer.getByRole('button')).toHaveAccessibleName(card === 'ordinary' ? 'Replay for Moss' : 'Replay Holding Pier for Moss');
    await page.locator('#' + primary).focus();
    await page.keyboard.press('Tab');
    await expect(offer.getByRole('button')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#' + primary)).toBeFocused();
  }
  for (const size of [{ width: 320, height: 740 }, { width: 780, height: 320 }]) {
    await page.setViewportSize(size);
    await fullyVisible(page, picture, false);
    await fullyVisible(page, count, false);
    await readable(count);
    await fullyVisible(page, page.locator('#' + primary));
    await fullyVisible(page, page.locator('#terminal-undo'));
    await fullyVisible(page, page.locator('#arrival-details > summary'));
    if (card !== 'moss') {
      await fullyVisible(page, offer.getByRole('button'));
      for (const part of ['#arrival-request-line', '.arrival-page-reward']) {
        await fullyVisible(page, offer.locator(part), false);
        await readable(offer.locator(part));
      }
    }
    expect(await page.locator('#dialog-content').evaluate(el => el.scrollTop)).toBe(0);
    await frame(page, card + '-' + size.width + 'x' + size.height);
  }
  await page.setViewportSize({ width: 844, height: 390 });
}

async function start(page: Page) {
  await page.goto(productionURL);
  await tap(page, 'home-play');
  await skipStory(page);
  await tap(page, 'story-continue');
  await idle(page);
}

function laterCove(index: number) {
  return { version: 1, checkpoint: { kind: 'cove', id: storyCoves[index].id },
    completed: storyCoves.slice(0, index).map(c => c.id), acknowledgedScenes: storyCoves.slice(0, index + 1).map(c => c.entryScene) };
}

async function openLog(page: Page) {
  await tap(page, 'home-practice');
  await expect(page.locator('#dialog-title')).toHaveText('Harbor log');
}

test('fresh production blocks the finale and picker and still starts the first Journey', async ({ page, browser }) => {
  await page.goto(productionURL + '/?cove=last-ferry&qa=1&VITE_LAST_FERRY_QA=1');
  await expect(page.locator('#home-play')).toHaveText('Play');
  expect(await page.evaluate(() => '__LAST_FERRY__' in window)).toBe(false);
  await openLog(page);
  await expect(page.locator('[data-practice], #harbor-take-request, #harbor-replay-holding, #cove-picker')).toHaveCount(0);
  await expect(page.locator('#dialog')).toContainText('0 of 12 coves rescued');
  await frame(page, 'fresh-log');
  expect((await snapshots(page)).journey).toBeNull();
  await tap(page, 'journey-title');
  await tap(page, 'home-play');
  await skipStory(page);
  await tap(page, 'story-continue');
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label', storyCoves[0].level.title);
  await tap(page, 'menu');
  await expect(page.locator('#dialog[open]')).toBeVisible();
  await expect(page.locator('#cove-picker')).toHaveCount(0);
  await expect(page.locator('#dialog')).not.toContainText(/practice|choose cove/i);
  await frame(page, 'fresh-menu');
  if (proofDir) {
    const urls = await page.locator('script[src], link[rel="stylesheet"]').evaluateAll(nodes =>
      nodes.map(node => node.getAttribute('src') ?? node.getAttribute('href')!));
    const bundles: Record<string, string> = {};
    for (const url of urls) {
      const response = await page.request.get(new URL(url, productionURL).href);
      expect(response.ok()).toBe(true);
      bundles[url.replace(/^\.\//, '')] = createHash('sha256').update(await response.body()).digest('hex');
    }
    writeFileSync(join(proofDir, 'build.json'), JSON.stringify({ browser: browser.version(), node: process.version,
      touch: true, deviceScaleFactor: 1, reducedMotion: true, bundles }, null, 2) + '\n');
  }
});

test('first choice and illustrated reward continue straight to Another bell and Bellwater', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await start(page);
  await sail(page, ordinary);
  await expect(page.locator('#continue-story')).toHaveText('Continue to Bellwater');
  await checkArrival(page, 'rue', 'continue-story');
  await tap(page, 'take-moss-request');
  const accepted = await snapshots(page);
  expect(accepted.journey).toMatchObject({ completed: ['holding-pier'], checkpoint: { kind: 'scene', id: 'another-bell' } });
  expect(accepted.best).toMatchObject({ actions: 9, lanterns: 3 });
  expect(accepted.entries).toEqual(['rue-lantern']);
  await sail(page, requested.slice(0, 8));
  await undo(page, true);
  await expect(page.getByTestId('turn')).toHaveText('07');
  await expect(page.getByTestId('tide')).toHaveText('1');
  await sail(page, requested.slice(7));
  await checkArrival(page, 'moss', 'continue-journey');
  const details = page.locator('#arrival-details summary');
  await details.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#continue-journey')).toBeHidden();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#terminal-undo')).toBeFocused();
  await expect(page.locator('#arrival-details')).toContainText(/12 actions/);
  await expect(page.locator('#mastery-best')).toContainText('3 of 3 lanterns');
  await frame(page, 'moss-details-best');
  expect(await snapshots(page)).toEqual(accepted);
  await page.keyboard.press('Tab');
  await expect(details).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator('#continue-journey')).toBeVisible();
  await tap(page, 'cancel');
  expect(await snapshots(page)).toEqual(accepted);
  await page.waitForTimeout(250);
  await tap(page, 'menu');
  await tap(page, 'return-arrival');
  await undo(page, true);
  await expect(page.getByTestId('turn')).toHaveText('11');
  expect(await snapshots(page)).toEqual(accepted);
  await sail(page, requested.slice(-1));
  await expect(page.locator('#continue-journey')).toHaveText('Continue to Bellwater');
  const primary = (await page.locator('#continue-journey').boundingBox())!;
  await tap(page, 'continue-journey');
  await page.touchscreen.tap(primary.x + primary.width / 2, primary.y + primary.height / 2);
  await expect(page.locator('#dialog-title')).toHaveText('Another bell');
  await expect(page.locator('#home')).toBeHidden();
  const earned = await snapshots(page);
  expect(earned.entries.sort()).toEqual(['moss-own-crossing', 'rue-lantern']);
  expect(earned.journey).toEqual(accepted.journey);
  expect(earned.best).toEqual(accepted.best);
  await frame(page, 'another-bell');
  await tap(page, 'story-continue');
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Bellwater Cove');
  await expect(page.getByTestId('turn')).toHaveText('00');
  await frame(page, 'bellwater-zero');
  await page.reload();
  await openLog(page);
  await expect(page.locator('#harbor-moss-page')).toHaveAttribute('data-earned', 'true');
  await expect(page.locator('#harbor-lantern-page .mastery-badge')).toHaveAccessibleName(/3 of 3 lanterns/);
  await expect(page.locator('[data-practice]')).toHaveCount(1);
  await tap(page, 'harbor-replay-holding');
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label', storyCoves[0].level.title);
  await expect(page.locator('#seascape')).toHaveJSProperty('inert', false);
  await sail(page, ordinary.slice(0, 1));
  expect((await snapshots(page)).journey.checkpoint).toEqual({ kind: 'cove', id: 'bellwater' });
  expect(errors).toEqual([]);
});

test('continuing from Rue leaves Moss available on the log and the ordinary Holding Pier arrival', async ({ page }) => {
  await start(page);
  await sail(page, ordinary);
  await expect(page.locator('#dialog-title')).toHaveText('Rue’s Lantern');
  await tap(page, 'continue-story');
  await expect(page.locator('#dialog-title')).toHaveText('Another bell');
  await tap(page, 'story-continue');
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Bellwater Cove');
  await expect(page.getByTestId('turn')).toHaveText('00');
  await page.reload();
  await openLog(page);
  await expect(page.locator('#harbor-moss-page')).toContainText(MOSS_REQUEST);
  await expect(page.locator('#harbor-take-request')).toBeVisible();
  await tap(page, 'journey-title');
  await tap(page, 'home-new');
  await tap(page, 'journey-replace-confirm');
  await skipStory(page);
  await tap(page, 'story-continue');
  await sail(page, ordinary);
  await expect(page.locator('#continue-story')).toHaveText('Continue to Bellwater');
  await checkArrival(page, 'ordinary', 'continue-story');
  await tap(page, 'take-moss-request');
  await expect(page.getByTestId('turn')).toHaveText('00');
  await expect(page.locator('#objective')).toContainText(MOSS_REQUEST);
  expect((await snapshots(page)).journey.checkpoint).toEqual({ kind: 'scene', id: 'another-bell' });
});

test('a later captain can retry a missed request and resume their own earned chapter', async ({ page }) => {
  const record = laterCove(2);
  await fixture(page, JSON.stringify(record));
  await page.goto(productionURL);
  await openLog(page);
  await expect(page.locator('[data-practice]')).toHaveCount(2);
  await tap(page, 'harbor-take-request');
  // Unload the rabbits before Moss from the same boat, a nonqualifying win.
  await sail(page, [...ordinary.slice(0, -1), { type: 'unload', passengerIds: ['rabbit-1', 'rabbit-2'] }, { type: 'unload', passengerIds: ['sheep-1'] }]);
  await expect(page.locator('#retry-moss-request')).toHaveText('Try Moss’s request again');
  await expect(page.locator('#arrival-request-line')).toHaveText('Moss needs to be at Stone Pier when each rabbit reaches Harbor.');
  await expect(page.locator('#continue-journey')).toContainText(/Driftwood/);
  await tap(page, 'retry-moss-request');
  expect((await snapshots(page)).best).toMatchObject({ actions: 10, lanterns: 1 });
  expect((await snapshots(page)).entries).not.toContain('moss-own-crossing');
  await sail(page, requested);
  await expect(page.locator('#dialog-title')).toHaveText('Moss’s Own Crossing');
  await tap(page, 'continue-journey');
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label', storyCoves[2].level.title);
  await expect(page.getByTestId('turn')).toHaveText('00');
  expect((await snapshots(page)).journey).toEqual(record);
});

test('earning both keepsakes on the original rescue opens just one celebration', async ({ page }) => {
  await start(page);
  await sail(page, requested);
  await expect(page.locator('.arrival-keepsake canvas')).toHaveCount(1);
  await tap(page, 'continue-story');
  await expect(page.locator('#dialog-title')).toHaveText('Another bell');
  expect((await snapshots(page)).entries.sort()).toEqual(['moss-own-crossing', 'rue-lantern']);
});

test('pending supper, credits and recovered First Crossing use earned revisits', async ({ page }) => {
  const record = { version: 1, checkpoint: { kind: 'scene', id: supperScene },
    completed: storyCoves.map(c => c.id), acknowledgedScenes: storyCoves.map(c => c.entryScene) };
  const oldBest = resultFor('first-crossing', 8, 0)!;
  await fixture(page, JSON.stringify(record), JSON.stringify({ version: 1, results: { 'first-crossing@1': oldBest } }));
  await page.addInitScript(() => {
    if (!localStorage.getItem('last-ferry.harbor-log.v1')) localStorage.setItem('last-ferry.harbor-log.v1',
      JSON.stringify({ version: 1, entries: ['rue-lantern', 'moss-own-crossing'] }));
  });
  await page.goto(productionURL);
  await openLog(page);
  await expect(page.locator('[data-practice]')).toHaveCount(13);
  await tap(page, 'harbor-take-request');
  await sail(page, requested);
  await expect(page.locator('.arrival-keepsake')).toHaveCount(0);
  await expect(page.locator('#continue-journey')).toContainText(/supper/i);
  await tap(page, 'continue-journey');
  await expect(page.locator('#dialog-title')).toHaveText('A place for the captain');
  await skipStory(page);
  await tap(page, 'story-continue');
  await expect(page.locator('.credits-bill')).toBeVisible();
  await tap(page, 'journey-practice');
  await expect(page.locator('#dialog-title')).toHaveText('Harbor log');
  await tap(page, 'practice-first-crossing');
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'First Crossing');
  expect((await snapshots(page)).journey.checkpoint).toEqual({ kind: 'complete' });
  await page.goto(productionURL);
  await openLog(page);
  await tap(page, 'practice-holding-pier');
  await sail(page, ordinary);
  await expect(page.locator('#continue-journey')).toContainText(/Harbor log/i);
  await tap(page, 'continue-journey');
  await expect(page.locator('#dialog-title')).toHaveText('Harbor log');
});

test('a historical Practice best is readable without opening its unreached story cove', async ({ page }) => {
  const score = resultFor('bellwater', 10, 0)!;
  await fixture(page, undefined, JSON.stringify({ version: 1, results: { 'bellwater@1': score } }));
  await page.goto(productionURL + '/?cove=bellwater');
  await openLog(page);
  await expect(page.locator('[data-practice]')).toHaveCount(0);
  await expect(page.locator('[data-saved-best]').filter({ hasText: /Bellwater/ })).toHaveCount(1);
  await expect(page.locator('#practice-first-crossing')).toHaveCount(0);
  expect((await snapshots(page)).journey).toBeNull();
});

test('a failed keepsake write is visible and a retry saves it at the same story checkpoint', async ({ page }) => {
  const record = { version: 1, checkpoint: { kind: 'scene', id: 'another-bell' },
    completed: ['holding-pier'], acknowledgedScenes: ['opening'] };
  await fixture(page, JSON.stringify(record));
  await page.goto(productionURL);
  await openLog(page);
  await tap(page, 'harbor-take-request');
  await sail(page, requested);
  await page.evaluate(() => {
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'last-ferry.harbor-log.v1' && sessionStorage.getItem('allow-harbor-write') !== 'yes')
        throw new DOMException('Storage full', 'QuotaExceededError');
      write.call(this, key, value);
    };
  });
  await tap(page, 'continue-journey');
  await expect(page.locator('#dialog-title')).toHaveText('Another bell');
  await expect(page.locator('#retry-rescue-save')).toBeVisible();
  await expect(page.locator('#dialog')).toContainText('Saving is unavailable');
  expect((await snapshots(page)).entries).not.toContain('moss-own-crossing');
  await page.evaluate(() => sessionStorage.setItem('allow-harbor-write', 'yes'));
  await tap(page, 'retry-rescue-save');
  await expect(page.locator('#retry-rescue-save')).toBeHidden();
  expect((await snapshots(page)).entries).toContain('moss-own-crossing');
  await expect(page.locator('#dialog-title')).toHaveText('Another bell');
  expect((await snapshots(page)).journey).toEqual(record);
});
