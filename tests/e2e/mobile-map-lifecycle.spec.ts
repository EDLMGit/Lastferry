import { expect, test, type Page } from '@playwright/test';
import { savedJourney } from './optional-tips-support';
import { fullyVisible, tabTo } from './ui';

test.use({ hasTouch: true, deviceScaleFactor: 1 });

async function openPractice(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.addInitScript(raw => {
    if (location.origin === 'null' || sessionStorage.getItem('map-fixture')) return;
    localStorage.setItem('last-ferry.journey.v1', raw);
    localStorage.setItem('last-ferry-muted', 'true');
    localStorage.setItem('last-ferry-motion', 'reduced');
    sessionStorage.setItem('map-fixture', 'set');
  }, savedJourney);
  await page.goto('/?cove=wide-berth');
  await expect(page.locator('#board')).toBeVisible();
}

async function protectedPreferences(page: Page) {
  expect(await page.evaluate(() => [
    localStorage.getItem('last-ferry.journey.v1'), localStorage.getItem('last-ferry-tips'),
    localStorage.getItem('last-ferry-motion'), localStorage.getItem('last-ferry-muted'),
  ])).toEqual([savedJourney, null, 'reduced', 'true']);
}

test('360px portrait offers every named place for free and restores keyboard focus', async ({ page }) => {
  await openPractice(page, 360, 740);
  const ids = ['harbor', 'high-quay', 'wide-berth', 'shell-landing', 'outer-buoy'];
  for (const id of ids) {
    await page.locator('#load-toggle').tap();
    if (!await page.locator('#place-index').evaluate(el => (el as HTMLDetailsElement).open))
      await page.locator('#place-index summary').tap();
    const button = page.locator('[data-inspect-place="' + id + '"]');
    const name = await button.innerText();
    await button.tap();
    await expect(page.locator('#local-context')).toHaveAttribute('aria-label', name + ' · free inspection');
    await expect(page.locator('.location-toolbar')).toContainText(name);
    await expect(page.locator('#local-context')).toBeFocused();
    await fullyVisible(page, page.locator('#location-details'));
    await tabTo(page, 'location-details');
    await page.keyboard.press('Enter');
    await expect(page.locator('#location-facts')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#location-details')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#map-' + id)).toBeFocused();
  }
  await page.locator('#load-toggle').tap();
  await expect(page.getByTestId('turn')).toHaveText('00');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);
  await protectedPreferences(page);
});

test('real fullscreen entry and external exit preserve chooser, nearby controls and preferences', async ({ page }) => {
  await openPractice(page, 780, 320);
  await expect(page.locator('.forecast-short')).toHaveText('In 4 actionsWide Berth floods · Beacon Reef turns');
  await page.locator('#menu').tap();
  await page.locator('#fullscreen').tap();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
  await expect(page.locator('#fullscreen')).toHaveText('Exit fullscreen');
  await page.locator('#cancel').tap();
  await page.locator('#board').tap();
  const choice = page.locator('.passenger-options button').first();
  await choice.tap();
  await expect(choice).toHaveAttribute('aria-pressed', 'false');
  await page.evaluate(() => document.exitFullscreen());
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  await expect(choice).toHaveAttribute('aria-pressed', 'false');
  await fullyVisible(page, page.locator('#commit'));
  await page.locator('#cancel').tap();
  await expect(page.locator('#board')).toBeFocused();
  await page.locator('#menu').tap();
  await page.locator('#settings').tap();
  await expect(page.locator('#tips-preference')).toHaveValue('off');
  await expect(page.locator('#motion-preference')).toHaveValue('reduced');
  await protectedPreferences(page);
});

test('releasing a two-finger gesture over a direct transfer spends no action', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/?cove=holding-pier');
  const unload = page.locator('#unload');
  await expect(unload).toBeVisible();
  const box = (await unload.boundingBox())!;
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  const cdp = await page.context().newCDPSession(page);
  const first = {x,y,id:1};
  const second = {x: Math.max(12,x - 75),y:y - 20,id:2};
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [first] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [first,second] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [first,{...second,y:y - 55}] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.locator('#load-toggle').tap();
  await expect(page.getByTestId('turn')).toHaveText('00');
  await expect(unload).toBeVisible();
  await cdp.detach();
});
