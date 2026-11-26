import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { initial, reduce, type Action } from '../../../src/game/rules';
import { holdingPier } from '../../../src/levels/level';
import witness from '../../../data/experiments/holding-pier-solution.json' with { type: 'json' };
import { selectStop, servedBuild } from '../../lantern-reach-difficulty/play/controls';
import { checkTurn, localView, report, snapshot, transferStart } from '../../../tests/e2e/large-cove-support';
import { activate, idle, undo } from '../../../tests/e2e/ui';

for (const [width, height] of [[1440, 900], [780, 320]]) {
  test('Home to Holding Pier ' + width + '×' + height, async ({ page, browser }) => {
    const dir = 'reviews/android-cove-view/web/home-' + width + 'x' + height;
    mkdirSync(dir, { recursive: true });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const bundles = await servedBuild(page);
    await activate(page, 'home-play', true);
    for (const [index, label] of ['Next', 'Next', 'Take the helm'].entries()) {
      await expect(page.locator('#story-position')).toHaveText((index + 1) + ' of 3');
      await page.waitForTimeout(650);
      await expect(page.locator('#story-continue')).toContainText(label);
      await activate(page, 'story-continue', true);
    }

    let state = initial(holdingPier);
    await checkTurn(page, state, false);
    for (const action of witness.actions as Action[]) {
      const before = state;
      if (action.type === 'move') {
        await selectStop(page, action.to);
        await activate(page, 'sail', true);
      } else if (action.type === 'board' || action.type === 'unload') {
        await transferStart(page, action);
      } else throw Error('Unexpected Holding Pier witness action ' + action.type);
      await idle(page);
      state = reduce(before, action, holdingPier);
      await checkTurn(page, state, false);
      if (state.status === 'playing') await localView(page);
      if (state.turn === 4 && action.type === 'board') {
        await undo(page, true);
        await checkTurn(page, before, false);
        await expect(page.locator('#map-rabbit-pier .map-countdown')).toHaveText('1');
        await transferStart(page, action);
        await idle(page);
        await checkTurn(page, state, false);
      }
      if (state.turn === 8) {
        const gauge = page.locator('#load-toggle');
        await expect(gauge).toHaveAccessibleName(/4 of 4 deck spaces occupied/);
        await expect(gauge.locator('.deck-slot.occupied')).toHaveCount(4);
        await expect(gauge).toHaveAccessibleName(/Boat needs depth 3. Water here is 5 deep/);
        await snapshot(page, dir, 'harbor');
      }
    }
    await expect(page.locator('#dialog[open]')).toHaveAttribute('data-outcome', 'won');
    await expect(page.locator('.arrival-name')).toHaveCount(3);
    await snapshot(page, dir, 'arrival');
    expect(errors).toEqual([]);
    report(dir, 'result', { bundles, browser: browser.version(), viewport: [width, height],
      turn: state.turn, result: state.status, undoAcrossAction: 4, errors });
  });
}
