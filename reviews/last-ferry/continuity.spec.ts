import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { lastFerry, passengerName } from '../../src/levels/level';
import { initial } from '../../src/game/rules';
import { completeSeven } from '../../tests/e2e/cove-eight-support';
import { completeSix, home, legacyTwo, run, witness } from '../../tests/e2e/three-lanterns-support';
import { activate, fullyVisible, idle, restart, tabTo } from '../../tests/e2e/ui';

const accepted = JSON.parse(
  readFileSync('reviews/ternhaven-journey/gameplay/390x844/route.json', 'utf8'),
).reloaded;
const journeyKey = 'last-ferry.journey.v1';
const dir = process.env.LAST_FERRY_CHECK_DIR ?? 'reviews/last-ferry/checks';
mkdirSync(dir, { recursive: true });

async function preserveRecords(page: Page, journey: string) {
  const values = {
    [journeyKey]: journey,
    'last-ferry.mastery.v1': accepted.mastery as string,
    [journeyKey + '.before-six-coves']: legacyTwo,
    [journeyKey + '.before-orchard']: completeSix,
    [journeyKey + '.before-ternhaven']: completeSeven,
  };
  await page.addInitScript((records) => {
    if (!sessionStorage.getItem('seeded')) {
      for (const [k, v] of Object.entries(records)) localStorage.setItem(k, v);
      sessionStorage.setItem('seeded', '1');
    }
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (this === localStorage && k in records) sessionStorage.setItem('protected-write', k);
      original.call(this, k, v);
    };
  }, values);
  return async () => {
    expect(
      await page.evaluate(
        (keys) => ({
          values: Object.fromEntries(keys.map((k) => [k, localStorage.getItem(k)])),
          write: sessionStorage.getItem('protected-write'),
        }),
        Object.keys(values),
      ),
    ).toEqual({ values, write: null });
  };
}

test('complete-eight save and backups survive a full deck lingering at the buoy, unloading and leaving Practice', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const untouched = await preserveRecords(page, accepted.journey);
  await page.goto('/?cove=last-ferry');
  await idle(page);
  await expect(page.locator('#load-toggle')).toContainText('Bring all 4 to Harbor');
  const plan = witness('last-ferry');
  const atBuoy = (await run(page, lastFerry, plan.slice(0, -2), false)).at(-1)!;
  await expect(page.locator('#map-lantern')).toHaveAttribute('aria-current', 'location');
  await expect(page.locator('#load-toggle')).toContainText('Load 6/6');
  await activate(page, 'map-lantern', true);
  await activate(page, 'location-details', true);
  for (const id of lastFerry.objective.requiredPassengerIds) {
    await expect(page.locator('#location-facts')).toContainText(passengerName(id, lastFerry));
  }
  await activate(page, 'close-location', true);
  const lingering = (
    await run(
      page,
      lastFerry,
      [{ type: 'wait' }, { type: 'wait' }, { type: 'wait' }, { type: 'wait' }],
      false,
      atBuoy,
    )
  ).at(-1)!;
  expect(lingering.aboard).toEqual(atBuoy.aboard);
  await expect(page.locator('#status-toggle')).toContainText('No more tide rises.');
  await page.screenshot({ path: dir + '/desktop-all-aboard.png' });
  const [docked, delivered] = await run(page, lastFerry, plan.slice(-2), false, lingering);
  expect(docked.status).toBe('playing');
  expect(delivered.status).toBe('won');
  await expect(page.locator('.arrival-unrated')).toContainText('no lantern rating');
  await expect(page.locator('#arrival-cast li')).toHaveCount(4);
  await page.screenshot({ path: dir + '/desktop-arrival.png' });
  await untouched();
  await home(page, true);
  await untouched();
  writeFileSync(
    dir + '/desktop.json',
    JSON.stringify(
      { turnAtBuoy: atBuoy.turn, atBuoy, lingering, docked, delivered, protectedKeys: 5 },
      null,
      2,
    ) + '\n',
  );
});

test('320px Home practice, free keyboard inspection and Restart preserve a historical seven-cove save', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const untouched = await preserveRecords(page, completeSeven);
  await page.goto('/');
  await activate(page, 'home-practice', true);
  await expect(page.locator('[data-practice]')).toHaveCount(13);
  await expect(page.locator('#practice-last-ferry')).toContainText('no lantern rating');
  await activate(page, 'practice-last-ferry', true);
  await idle(page);
  await tabTo(page, 'load-toggle');
  await page.keyboard.press('Enter');
  await tabTo(page, 'find-home');
  await page.keyboard.press('Enter');
  await expect(page.locator('#local-context')).toHaveAttribute('data-location', 'harbor');
  await fullyVisible(page, page.locator('#location-details'));
  await page.keyboard.press('Escape');
  await expect(page.locator('#map-harbor')).toBeFocused();
  await expect(page.getByTestId('turn')).toHaveText('00');
  await run(page, lastFerry, witness('last-ferry').slice(0, 1), false, initial(lastFerry));
  await restart(page, true);
  await expect(page.locator('#undo')).toBeDisabled();
  await expect(page.locator('#map-lantern')).toHaveAttribute('aria-current', 'location');
  await page.screenshot({ path: dir + '/narrow-restart.png' });
  await home(page);
  await untouched();
});

test('offline portable file opens its thirteenth Practice cove and loads both rabbit choices', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', (r) => {
    if (/^https?:/.test(r.url())) requests.push(r.url());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  await context.setOffline(true);
  await page.goto(pathToFileURL(resolve('../Last Ferry - Final Crossing.html')).href);
  await activate(page, 'home-practice', true);
  await activate(page, 'practice-last-ferry', true);
  await idle(page);
  await run(page, lastFerry, [{ type: 'move', to: 'lace' }], false);
  await activate(page, 'board', true);
  const pictures = page.locator('.cove-choice-portrait img');
  await expect(pictures).toHaveCount(2);
  expect(
    await pictures.evaluateAll((images) =>
      images.every((img) => (img as HTMLImageElement).naturalWidth > 0),
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  expect(requests).toEqual([]);
});
