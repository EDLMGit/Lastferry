import { expect, test } from '@playwright/test';
import { activate, idle, undo } from './ui';
import { productionURL } from './evidence';
import { directory, report, snapshot, transferStart } from './large-cove-support';
import { coveData, selectRoute } from './optional-tips-support';

test('built game defaults Tips Off and completes Reef Return after a real loss and Undo', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 780, height: 320 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const { actions } = coveData('reef-return');
  try {
    await page.goto(productionURL + '/?cove=reef-return');
    expect(await page.evaluate(() => !!(window as any).__LAST_FERRY__)).toBe(false);
    await activate(page, 'menu', true);
    await activate(page, 'settings', true);
    await expect(page.getByRole('combobox', { name: 'Tips', exact: true })).toHaveValue('off');
    await activate(page, 'settings-back', true);
    await activate(page, 'cancel', true);
    for (const [index, action] of actions.entries()) {
      if (index === 8) {
        await activate(page, 'wait', true);
        await expect(page.locator('#preview')).not.toHaveClass(/warning/);
        await expect(page.locator('#preview')).not.toContainText('no dry landing');
        await activate(page, 'commit', true);
        await idle(page);
        await expect(page.locator('.ending')).toContainText('cannot reach a dry landing');
        await undo(page, true);
        await expect(page.getByTestId('turn')).toHaveText('08');
        await expect(page.getByTestId('tide')).toHaveText('1');
      }
      if (action.type === 'move') {
        await selectRoute(page, action.to);
        await activate(page, 'sail', true);
      } else if (action.type === 'wait') {
        await activate(page, 'wait', true);
        await activate(page, 'commit', true);
      } else await transferStart(page, action);
      await idle(page);
      await expect(page.getByTestId('turn')).toHaveText(String(index + 1).padStart(2, '0'));
    }
    await expect(page.locator('#dialog')).toHaveAttribute('data-outcome', 'won');
    await expect(page.locator('.ending')).toContainText('4 passengers safe at Harbor · 10 actions.');
    const dir = directory('production');
    await snapshot(page, dir, '780x320-reef-home');
    await undo(page, true);
    await expect(page.getByTestId('turn')).toHaveText('09');
    report(dir, 'result', { browser: browser.version(), defaultTips: 'off', rescueActions: 10, actualLoss: 'RETURN_DEPTH', tideUndo: true, terminalUndo: true, developmentApi: false });
  } finally {
    await context.close();
  }
});
