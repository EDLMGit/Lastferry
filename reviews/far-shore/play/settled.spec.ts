import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { initial, type Action } from '../../../src/game/rules';
import { farShore } from '../../../src/levels/level';
import { activate, fullyVisible, idle } from '../../../tests/e2e/ui';
import { directory, snapshot } from '../../../tests/e2e/large-cove-support';
import { servedBuild, step } from '../../lantern-reach-difficulty/play/controls';
import plans from '../../../data/far-shore/witnesses.json' with { type: 'json' };

for (const [width, height] of [[780, 320], [390, 844]]) {
  test('Settled Rush companions ' + width + 'x' + height, async ({page}) => {
    const dir = directory(width + 'x' + height);
    const previous = JSON.parse(readFileSync(dir + '/run.json','utf8'));
    await page.setViewportSize({width,height});
    await page.emulateMedia({reducedMotion:'reduce'});
    for (const [companion, plan] of [['thistle', plans.losingAlternatives[0]], ['button', plans.witnesses[0]]] as const) {
      await page.goto('/?cove=far-shore'); await idle(page);
      expect(await servedBuild(page)).toEqual(previous.build);
      if (width === 780 && companion === 'thistle') {
        await activate(page,'status-toggle',true);
        const row = page.getByRole('listitem').filter({hasText:'Rowan (3)'});
        const panel = page.locator('.forecast-detail');
        const rect = (await panel.boundingBox())!;
        await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
        await page.mouse.wheel(0, 164);
        await expect.poll(() => row.evaluate(el => {
          const range = document.createRange();
          range.selectNodeContents(el);
          const body = el.closest('.forecast-detail')!.getBoundingClientRect();
          return [...range.getClientRects()].every(r => r.top >= body.top && r.bottom <= body.bottom && r.left >= body.left && r.right <= body.right);
        })).toBe(true);
        await snapshot(page,dir,'forecast-rowan');
        await activate(page,'cancel',true);
        await expect(page.getByTestId('turn')).toHaveText('00');
      }
      let state = initial(farShore);
      for (const action of plan.actions.slice(0,7) as Action[])
        state = await step(page, farShore, action, state);
      expect(state.boatNodeId).toBe('rush');
      expect(state.aboard).toEqual([companion]);
      await expect(page.locator('#view-toggle')).toContainText('Whole cove');
      await page.waitForTimeout(1800);
      const button = page.locator(companion === 'thistle' ? '#board-unavailable' : '#board');
      await fullyVisible(page,button);
      await snapshot(page,dir,'settled-rush-' + companion);
    }
  });
}
