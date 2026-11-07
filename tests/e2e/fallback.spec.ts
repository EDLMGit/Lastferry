import { test, expect } from '@playwright/test';
test('fallback completes a stalled presentation without another gameplay action', async ({
  page,
}) => {
  await page.goto('/?cove=first-crossing');
  await page.waitForFunction(() => (window as any).__LAST_FERRY__);
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  await page.locator('#map-sheep-pier').click();
  await page.locator('#sail').click();
  await page.waitForFunction(
    () => !(window as any).__LAST_FERRY__.getRenderStatus().pendingAnimation,
  );
  expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getState())).toMatchObject({
    turn: 1,
    boatNodeId: 'sheep-pier',
  });
  expect(
    await page.evaluate(() => (window as any).__LAST_FERRY__.getRenderStatus().boatPosition),
  ).toEqual([6, 0, 0]);
  await expect(page.locator('#undo')).toBeEnabled();
  await page.locator('#undo').click();
  expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getState().turn)).toBe(0);
});
