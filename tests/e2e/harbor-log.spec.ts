import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import type { Action } from '../../src/game/rules';
import { storyCoves, supperScene } from '../../src/campaign/registry';
import { productionURL } from './evidence';
import { simpleAction } from './large-cove-support';
import { activate, fullyVisible, idle, undo } from './ui';
import { fixture, home, skipStory, witness } from './three-lanterns-support';

test.use({ hasTouch: true, isMobile: true, reducedMotion: 'reduce', actionTimeout: 15000, video: 'off' });
test.describe.configure({ timeout: 300000 });
const ordinary = witness('holding-pier');
const rabbits = ['rabbit-1', 'rabbit-2'];
const moss = ['sheep-1'];
const rabbitTrip: Action[] = [
  ...ordinary.slice(0, 6), { type: 'move', to: 'harbor' }, { type: 'unload', passengerIds: rabbits },
];
const mossTrip: Action[] = [
  { type: 'move', to: 'stone' }, { type: 'board', passengerIds: moss },
  { type: 'move', to: 'harbor' }, { type: 'unload', passengerIds: moss },
];
const saves = (page: Page) => page.evaluate(() => ({
  journey: JSON.parse(localStorage.getItem('last-ferry.journey.v1') ?? 'null'),
  best: JSON.parse(localStorage.getItem('last-ferry.mastery.v1') ?? 'null')?.results['holding-pier@1'],
  log: localStorage.getItem('last-ferry.harbor-log.v1'),
}));

async function play(page: Page, actions: Action[]) {
  let turn = Number(await page.getByTestId('turn').textContent());
  for (const action of actions) {
    // Let the preceding tap's repeated-input fence expire before the next
    // intentional action, including direct single-passenger transfers.
    await page.waitForTimeout(350);
    await simpleAction(page, action);
    await expect(page.getByTestId('turn')).toHaveText(String(++turn).padStart(2, '0'));
  }
}
async function frame(page: Page, name: string) {
  if (process.env.HARBOR_FRAMES) await page.screenshot({ path: process.env.HARBOR_FRAMES + '/' + name + '.png' });
}
async function closeArrival(page: Page) {
  await activate(page, 'cancel', true);
  await expect(page.locator('#dialog')).toBeHidden();
}

test('first arrival saves Bellwater, opens Moss’s Practice and keeps both rescues on return', async ({ page, browser }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(productionURL);
  expect(await page.evaluate(() => '__LAST_FERRY__' in window)).toBe(false);
  if (process.env.HARBOR_FRAMES) {
    const urls = await page.locator('script[src], link[rel="stylesheet"]').evaluateAll(nodes =>
      nodes.map(node => node.getAttribute('src') ?? node.getAttribute('href')!));
    const bundles: Record<string, string> = {};
    for (const url of urls) {
      const response = await page.request.get(new URL(url, productionURL).href);
      expect(response.ok()).toBe(true);
      bundles[url.replace(/^\.\//, '')] = createHash('sha256').update(await response.body()).digest('hex');
    }
    mkdirSync(process.env.HARBOR_FRAMES, { recursive: true });
    writeFileSync(process.env.HARBOR_FRAMES + '/build.json', JSON.stringify({
      browser: browser.version(), node: process.version, bundles, touch: true, deviceScaleFactor: 1,
      reducedMotion: true, renderer: 'Chromium headless / SwiftShader', capturedAt: new Date().toISOString(),
    }, null, 2) + '\n');
  }
  await activate(page, 'home-play', true);
  await skipStory(page);
  await activate(page, 'story-continue', true);
  await idle(page);
  await expect(page.locator('#load-toggle')).toContainText('Moss aboard');
  await expect(page.locator('#status-toggle')).toContainText('Pip and Rue waiting');
  await frame(page, '01-helm');
  await activate(page, 'map-shallows', true);
  await expect(page.locator('#sail')).toBeDisabled();
  await expect(page.locator('#local-context')).toContainText('With Moss aboard');
  await expect(page.getByTestId('turn')).toHaveText('00');
  await frame(page, '02-shallows');
  await activate(page, 'close-location', true);
  await play(page, ordinary);
  await expect(page.locator('#mastery-result')).toHaveAttribute('data-lanterns', '3');
  await expect(page.locator('#continue-story')).toBeVisible();
  await expect(page.locator('#take-moss-request')).toBeVisible();
  await frame(page, '03-first-choice');
  await page.setViewportSize({ width: 320, height: 740 });
  for (const id of ['continue-story', 'take-moss-request', 'terminal-restart', 'terminal-undo', 'accept-harbor-home'])
    await fullyVisible(page, page.locator('#' + id));
  await frame(page, 'portrait-first-choice');
  await page.setViewportSize({ width: 844, height: 390 });
  expect((await saves(page)).journey.completed).toEqual([]);
  await closeArrival(page);
  expect((await saves(page)).best).toBeUndefined();
  // The Menu sits behind the Close target at this width. Leave the game's
  // 180 ms touch-through guard before a separate, deliberate tap.
  await page.waitForTimeout(220);
  await activate(page, 'menu', true);
  await expect(page.locator('#return-arrival')).toBeVisible();
  await activate(page, 'return-arrival', true);
  await page.waitForTimeout(220);
  await activate(page, 'take-moss-request', true);
  const accepted = await saves(page);
  expect(accepted.journey).toMatchObject({ completed: ['holding-pier'], checkpoint: { kind: 'scene', id: 'another-bell' } });
  expect(accepted.best).toMatchObject({ actions: 9, lanterns: 3, successfulUndos: 0 });
  await expect(page.getByTestId('turn')).toHaveText('00');
  await play(page, rabbitTrip);
  await expect(page.getByTestId('turn')).toHaveText('08');
  await expect(page.locator('#progress')).toContainText('2');
  await frame(page, '04-rabbits-home');
  await undo(page, true);
  await expect(page.getByTestId('turn')).toHaveText('07');
  await expect(page.getByTestId('tide')).toHaveText('1');
  await expect(page.locator('#progress')).toContainText('0');
  await frame(page, '05-delivery-undone');
  await play(page, [...rabbitTrip.slice(-1), ...mossTrip]);
  await expect(page.locator('#mastery-result')).toHaveAttribute('data-lanterns', '1');
  await expect(page.locator('#mastery-result')).toHaveAttribute('data-actions', '12');
  await expect(page.locator('#accept-moss-entry')).toBeVisible();
  await frame(page, '06-moss-arrival');
  await page.setViewportSize({ width: 320, height: 740 });
  const heading = page.locator('.arrival-with-keepsake h2');
  await expect(heading).toHaveText('Moss’s Own Crossing');
  await expect.poll(async () => heading.evaluate(title =>
    title.getBoundingClientRect().right <= document.querySelector('.arrival-close')!.getBoundingClientRect().left,
  )).toBe(true);
  await frame(page, 'portrait-moss-arrival');
  await page.setViewportSize({ width: 844, height: 390 });
  expect(await saves(page)).toEqual(accepted);
  await activate(page, 'accept-moss-entry', true);
  const earned = await saves(page);
  expect(earned.log).not.toEqual(accepted.log);
  expect(earned.journey).toEqual(accepted.journey);
  expect(earned.best).toEqual(accepted.best);
  await page.reload();
  await expect(page.locator('#home-practice')).toContainText(/1 of 12 coves rescued/i);
  await expect(page.locator('#home-practice')).toContainText('Moss’s Own Crossing');
  await frame(page, '07-home');
  await activate(page, 'home-practice', true);
  await expect(page.locator('#dialog')).toContainText(/Pip.*Rue.*Moss/s);
  await expect(page.locator('#practice-holding-pier .mastery-badge')).toHaveAccessibleName(/3 of 3 lanterns/);
  await expect(page.locator('[data-practice]')).toHaveCount(13);
  await expect(page.locator('#harbor-moss-page')).toHaveAttribute('data-earned', 'true');
  await frame(page, '08-log');
  await page.setViewportSize({ width: 780, height: 320 });
  await fullyVisible(page, page.locator('#harbor-take-request'));
  await fullyVisible(page, page.locator('#harbor-replay-holding'));
  await page.setViewportSize({ width: 844, height: 390 });
  await activate(page, 'journey-title', true);
  await activate(page, 'home-play', true);
  await expect(page.locator('#story-continue')).toBeVisible();
  await skipStory(page);
  await expect(page.locator('#story-continue')).toHaveText('Continue to Bellwater');
  await frame(page, '09-another-bell');
  await activate(page, 'story-continue', true);
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Bellwater Cove');
  await expect(page.getByTestId('turn')).toHaveText('00');
  expect((await saves(page)).journey.checkpoint).toEqual({ kind: 'cove', id: 'bellwater' });
  expect(errors).toEqual([]);
});

test('Undo can discard the rabbit delivery and unloading rabbits from the shared boat earns no entry', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(productionURL + '/?cove=holding-pier');
  await frame(page, 'desktop-helm');
  await play(page, rabbitTrip);
  await undo(page, true);
  await undo(page, true);
  await expect(page.getByTestId('turn')).toHaveText('06');
  await play(page, [...ordinary.slice(6, 8), { type: 'unload', passengerIds: rabbits }, { type: 'unload', passengerIds: moss }]);
  await expect(page.locator('#mastery-result')).toHaveAttribute('data-actions', '10');
  await expect(page.locator('#accept-moss-entry')).toHaveCount(0);
  await frame(page, 'desktop-shared-boat-result');
  await home(page, true);
  const saved = await saves(page);
  expect(saved.journey).toBeNull();
  expect(saved.best).toMatchObject({ lanterns: 1, actions: 10 });
  expect(saved.log).toBeNull();
});

test('a fresh Practice captain can independently earn Moss’s entry without starting the Journey', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(productionURL + '/?cove=holding-pier');
  await play(page, [...rabbitTrip, ...mossTrip]);
  await expect(page.locator('#accept-moss-entry')).toBeVisible();
  await undo(page, true);
  await expect(page.getByTestId('turn')).toHaveText('11');
  expect((await saves(page)).log).toBeNull();
  await play(page, mossTrip.slice(-1));
  await activate(page, 'accept-moss-entry', true);
  await expect(page.locator('#home-play')).toHaveText('Play');
  const saved = await saves(page);
  expect(saved.journey).toBeNull();
  expect(saved.best).toMatchObject({ lanterns: 1, actions: 12, successfulUndos: 1 });
  expect(saved.log).toBeTruthy();
  await activate(page, 'home-practice', true);
  await expect(page.locator('#dialog')).toContainText(/0 of 12 coves rescued/i);
  await frame(page, 'portrait-practice-log');
});

test('all twelve story chapters count at supper and First Crossing stays a separate Practice', async ({ page }) => {
  const record = JSON.stringify({
    version: 1, checkpoint: { kind: 'scene', id: supperScene },
    completed: storyCoves.map(cove => cove.id),
    acknowledgedScenes: storyCoves.map(cove => cove.entryScene),
  });
  await fixture(page, record);
  await page.goto(productionURL);
  await activate(page, 'home-practice', true);
  await expect(page.locator('.harbor-log-head')).toContainText('12 of 12 coves rescued');
  for (const cove of storyCoves.slice(-4)) {
    const row = page.locator('#practice-' + cove.id);
    await expect(row).toContainText('Replay');
    await expect(row).toContainText('no lantern rating');
  }
  await expect(page.locator('#practice-first-crossing')).not.toContainText('Replay');
  await expect(page.locator('#harbor-moss-page')).toHaveAttribute('data-earned', 'false');
  await activate(page, 'practice-first-crossing', true);
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'First Crossing');
  expect((await saves(page)).journey).toEqual(JSON.parse(record));
});

test('one failed checkpoint readback still accepts the rescue and lanterns before Practice', async ({ page }) => {
  await fixture(page, JSON.stringify({
    version: 1, checkpoint: { kind: 'cove', id: 'holding-pier' },
    completed: [], acknowledgedScenes: ['opening'],
  }));
  await page.goto(productionURL);
  await activate(page, 'home-play', true);
  await play(page, ordinary);
  await expect(page.locator('#take-moss-request')).toBeVisible();
  await page.evaluate(() => {
    const read = Storage.prototype.getItem, write = Storage.prototype.setItem;
    let verify = false;
    Storage.prototype.setItem = function(key, value) {
      write.call(this, key, value);
      if (key === 'last-ferry.journey.v1') verify = true;
    };
    Storage.prototype.getItem = function(key) {
      if (verify && key === 'last-ferry.journey.v1') {
        Storage.prototype.getItem = read;
        Storage.prototype.setItem = write;
        throw new DOMException('First verification read failed', 'UnknownError');
      }
      return read.call(this, key);
    };
  });
  await activate(page, 'take-moss-request', true);
  await expect(page.getByTestId('turn')).toHaveText('00');
  const saved = await saves(page);
  expect(saved.journey.checkpoint).toEqual({ kind: 'scene', id: 'another-bell' });
  expect(saved.best).toMatchObject({ actions: 9, lanterns: 3 });
  expect(JSON.parse(saved.log!)).toMatchObject({ entries: ['rue-lantern'] });
});
