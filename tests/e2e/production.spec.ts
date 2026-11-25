import { test, expect } from '@playwright/test';
import { productionURL } from './evidence';
import { act } from './ui';
import { fixture } from './three-lanterns-support';
import { resultFor } from '../../src/game/mastery';
test('production bundle: real rescue without debug globals or external assets', async ({
  page,
}) => {
  const errors: string[] = [],
    external: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (!r.url().startsWith(productionURL)) external.push(r.url());
  });
  // First Crossing is an earned standalone revisit for returning captains.
  await fixture(page, undefined, JSON.stringify({
    version: 1, results: { 'first-crossing@1': resultFor('first-crossing', 8, 0) },
  }));
  await page.goto(`${productionURL}/?cove=first-crossing`);
  await expect(page.locator('canvas')).toBeVisible();
  expect(await page.evaluate(() => typeof (window as any).__LAST_FERRY__)).toBe('undefined');
  await act(page, 'map-sheep-pier');
  await act(page, 'board');
  await act(page, 'wait');
  await act(page, 'wait');
  await act(page, 'map-cut');
  await act(page, 'map-harbor');
  await act(page, 'unload');
  await expect(page.getByText('Everyone home.')).toBeVisible();
  await expect(page.getByTestId('turn')).toHaveText('07');
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
