import { test, expect } from '@playwright/test';
import { productionURL } from './evidence';
import { act } from './ui';
test('production bundle: real rescue without debug globals or external assets', async ({
  page,
}) => {
  const errors: string[] = [],
    external: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (!r.url().startsWith(productionURL)) external.push(r.url());
  });
  await page.goto(productionURL);
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
