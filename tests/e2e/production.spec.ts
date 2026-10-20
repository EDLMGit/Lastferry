import { test, expect } from '@playwright/test';
test('production bundle: real rescue without debug globals or external assets', async ({
  page,
}) => {
  const errors: string[] = [],
    external: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (!r.url().startsWith('http://127.0.0.1:4173')) external.push(r.url());
  });
  await page.goto('http://127.0.0.1:4173');
  await expect(page.locator('canvas')).toBeVisible();
  expect(await page.evaluate(() => typeof (window as any).__LAST_FERRY__)).toBe('undefined');
  async function act(id: string) {
    await page.locator(`#${id}`).click();
    await page.locator('#commit').click();
    await expect(page.locator('#restart')).toBeEnabled();
  }
  await act('route-sheep-pier');
  await act('board');
  await act('wait');
  await act('wait');
  await act('route-cut');
  await act('route-harbor');
  await act('unload');
  await expect(page.getByText('Everyone home.')).toBeVisible();
  await expect(page.getByTestId('turn')).toHaveText('07');
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
