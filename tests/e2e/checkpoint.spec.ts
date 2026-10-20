import { test, expect } from '@playwright/test';
test('A: first in-engine checkpoint', async ({ page }) => {
  page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') console.log(m.text());
  });
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForFunction(() => ((window as any).__LAST_FERRY__?.getMetrics().frames ?? 0) > 5);
  await page.screenshot({ path: 'reviews/m1/checkpoint-a.png' });
});
