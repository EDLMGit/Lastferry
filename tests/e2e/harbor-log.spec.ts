import { expect, test, type Page } from '@playwright/test';
import type { Action } from '../../src/game/rules';
import { productionURL } from './evidence';
import { simpleAction } from './large-cove-support';
import { activate, idle, undo } from './ui';
import { home, skipStory, witness } from './three-lanterns-support';

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
  for (const action of actions) await simpleAction(page, action);
}
async function frame(page: Page, name: string) {
  if (process.env.HARBOR_FRAMES) await page.screenshot({ path: process.env.HARBOR_FRAMES + '/' + name + '.png' });
}
async function closeArrival(page: Page) {
  await activate(page, 'cancel', true);
  await expect(page.locator('#dialog')).toBeHidden();
}

test('first arrival saves Bellwater, opens Moss’s Practice and keeps both rescues on return', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(productionURL);
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
  expect((await saves(page)).journey.completed).toEqual([]);
  await closeArrival(page);
  expect((await saves(page)).best).toBeUndefined();
  // The Menu sits behind the Close target at this width. Leave the game's
  // 180 ms touch-through guard before a separate, deliberate tap.
  await page.waitForTimeout(220);
  await activate(page, 'menu', true);
  await expect(page.locator('#return-arrival')).toBeVisible();
  await activate(page, 'return-arrival', true);
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
