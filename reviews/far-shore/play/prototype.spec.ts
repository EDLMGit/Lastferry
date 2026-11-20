import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { initial, type Action } from '../../../src/game/rules';
import type { Level } from '../../../src/levels/level';
import { startCheck } from '../../../tests/e2e/cove-eight-support';
import { directory, report, snapshot } from '../../../tests/e2e/large-cove-support';
import { activate } from '../../../tests/e2e/ui';
import { checkWon, hash, servedBuild, step } from '../../lantern-reach-difficulty/play/controls';

test('Actual early rescue with the spare staging action', async ({ page, browser }) => {
  const out = directory('390x844');
  const levelBytes = readFileSync('reviews/far-shore/play/development/level.json');
  const level: Level = JSON.parse(levelBytes.toString());
  const plan: Action[] = JSON.parse(readFileSync('reviews/far-shore/play/development/plan.json','utf8'));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?cove=far-shore');
  await startCheck(page, level, false);
  const build = await servedBuild(page);
  let state = initial(level);
  const states = [state];
  await activate(page, 'status-toggle', true);
  const firstForecast = await page.locator('.forecast-detail').innerText();
  await snapshot(page, out, 'opening-forecast');
  await activate(page, 'cancel', true);
  for (const action of plan) {
    state = await step(page, level, action, state);
    states.push(state);
    if (state.turn === 6) await snapshot(page, out, 'before-staging');
    if (state.turn === 7) await snapshot(page, out, 'after-staging');
  }
  await checkWon(page, level, state, 0);
  await snapshot(page, out, 'arrival');
  expect(states.length).toBe(plan.length + 1);
  report(out,'run',{levelSHA256:hash(levelBytes), build, browser:browser.version(), actions:plan, states, firstForecast,
    viewport:'390×844 DPR 1 touch emulation, reduced motion', source:'Compiled prototype. Level bytes and witness are preserved in this directory tree.'});
});
