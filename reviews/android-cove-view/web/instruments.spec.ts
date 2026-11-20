import { expect, test, type Page } from '@playwright/test';
import { initial, reduce, type Action, type State } from '../../../src/game/rules';
import { farShore, holdingPier, type Level } from '../../../src/levels/level';
import { activate, fullyVisible, idle, tabTo, undo } from '../../../tests/e2e/ui';
import { checkTurn, directory, localView, report, snapshot, transferStart } from '../../../tests/e2e/large-cove-support';
import { servedBuild, selectStop } from '../../lantern-reach-difficulty/play/controls';
import holding from '../../../data/experiments/holding-pier-solution.json' with { type: 'json' };
import far from '../../../data/far-shore/witnesses.json' with { type: 'json' };

async function apply(page: Page, state: State, level: Level, action: Action, examineChoice?: () => Promise<void>) {
  if (action.type === 'move') {
    await selectStop(page, action.to);
    await activate(page, 'sail', true);
  } else if (action.type === 'board' || action.type === 'unload') {
    await transferStart(page, action, examineChoice);
  } else throw Error('Unexpected witness action ' + action.type);
  await idle(page);
  const next = reduce(state, action, level);
  await checkTurn(page, next, false);
  if (next.status === 'playing') await localView(page);
  return next;
}

for (const [width, height] of [[390,844],[780,320]]) {
  const size = width + 'x' + height;
  test('Holding from fresh Home with graphical readings ' + size, async ({ page, browser }) => {
    const out = directory(size);
    await page.setViewportSize({ width, height });
    await page.goto('/');
    const build = await servedBuild(page);
    await activate(page, 'home-play', true);
    for (const [index,caption] of ['Next','Next','Take the helm'].entries()) {
      await expect(page.locator('#story-position')).toHaveText((index + 1) + ' of 3');
      await page.waitForTimeout(650);
      await expect(page.locator('#story-continue')).toContainText(caption);
      await activate(page, 'story-continue', true);
    }
    let state = initial(holdingPier);
    const gauge = page.locator('#load-toggle');
    await fullyVisible(page, gauge);
    await expect(gauge.locator('.deck-slot')).toHaveCount(4);
    await expect(gauge.locator('.deck-slot.occupied')).toHaveCount(2);
    await expect(gauge).toHaveAccessibleName(/2 of 4 deck spaces occupied. Moss aboard. Boat needs depth 2. Water here is 3 deep/);
    await expect(page.locator('#status-headline')).toHaveText('Rabbit Pier floods');
    await expect(page.locator('.tide-countdown')).toHaveText('In 4 actions');
    await activate(page, 'status-toggle', true);
    await expect(page.locator('#dialog[open] .forecast-detail')).toContainText('Rabbit Pier');
    await activate(page, 'cancel', true);
    await checkTurn(page, state, false);
    for (const [index, action] of (holding.actions as Action[]).entries()) {
      const before = state;
      state = await apply(page, state, holdingPier, action, index === 3 ? async () => {
        await page.locator('#passenger-rabbit-2').tap();
        await expect(page.locator('#preview .depth-reading')).toContainText('1/4 spaces');
        await page.locator('#passenger-rabbit-2').tap();
        await expect(page.locator('#preview .depth-reading')).toContainText('2/4 spaces');
        await checkTurn(page, before, false);
      } : undefined);
      if (state.turn === 4) {
        await expect(gauge).toHaveAccessibleName(/Pip and Rue aboard. Boat needs depth 2. Water here is 4 deep/);
        await undo(page, true);
        await checkTurn(page, before, false);
        await expect(gauge.locator('.deck-slot.occupied')).toHaveCount(0);
        await expect(gauge).toHaveAccessibleName(/Nobody aboard. Boat needs depth 1. Water here is 3 deep/);
        state = await apply(page, before, holdingPier, action);
      }
      if (state.turn === 8) {
        await expect(gauge.locator('.deck-slot.occupied')).toHaveCount(4);
        await expect(gauge).toHaveAccessibleName(/0 of 3 home. 4 of 4 deck spaces occupied. Pip, Rue and Moss aboard. Boat needs depth 3. Water here is 5 deep/);
        await snapshot(page,out,'harbor');
        await tabTo(page, 'load-toggle');
        await page.keyboard.press('Enter');
        const details = page.locator('#crossing-details');
        await fullyVisible(page, details, false);
        await expect(details).toContainText('Pip, Rue and Moss aboard');
        await expect(details).toContainText('Boat needs depth 3. Water here is 5 deep.');
        await snapshot(page,out,'harbor-details');
        await activate(page,'close-status',true);
        await expect(gauge).toBeFocused();
        await checkTurn(page, state, false);
      }
    }
    await expect(page.locator('#dialog[open]')).toHaveAttribute('data-outcome','won');
    report(out, 'holding', { size, browser: browser.version(), build, rescue:state, tideUndo:true, keyboardDisclosure:true });
  });

  test('Rush Landing offered and blocked with the same berth ' + size, async ({ page, browser }) => {
    const out = directory(size);
    await page.setViewportSize({ width, height });
    const cases = [];
    for (const [name, plan, required] of [
      ['thistle', far.losingAlternatives[0].actions, 4], ['button', far.witnesses[0].actions, 3],
    ] as const) {
      await page.goto('/?cove=far-shore');
      const build = await servedBuild(page);
      let state = initial(farShore);
      for (const action of plan.slice(0,7) as Action[]) state = await apply(page, state, farShore, action);
      expect(state.boatNodeId).toBe('rush');
      expect(state.aboard).toEqual([name]);
      const button = page.locator(name === 'button' ? '#board' : '#board-unavailable');
      await fullyVisible(page, button);
      await expect(button).toContainText('Rowan');
      const preview = button.locator('.boarding-reading');
      await expect(preview).toHaveAttribute('data-water','3');
      await expect(preview).toHaveAttribute('data-needed',String(required));
      await expect(preview).toContainText('Needs depth ' + required + ' · berth 3');
      expect(await preview.evaluate(el => {
        const label = el.querySelector('span:not(.depth-mark)')!.getBoundingClientRect();
        return [label.left + 2, label.right - 2].every(x =>
          el.closest('button')!.contains(document.elementFromPoint(x, (label.top + label.bottom) / 2)));
      })).toBe(true);
      if (required === 4) await expect(button).toBeDisabled();
      else await expect(button).toBeEnabled();
      await page.waitForTimeout(500);
      await snapshot(page,out,'rush-' + name);
      const reading = await button.innerText();
      if (required === 3) {
        state = await apply(page,state,farShore,{type:'board',passengerIds:['rowan']});
        await expect(page.locator('#load-toggle .deck-slot.occupied')).toHaveCount(4);
        await expect(page.locator('#load-toggle')).toHaveAccessibleName(/Button and Rowan aboard. Boat needs depth 3/);
      }
      cases.push({name, build, reading, final:state});
    }
    report(out, 'rush', {size, browser:browser.version(), cases});
  });
}
