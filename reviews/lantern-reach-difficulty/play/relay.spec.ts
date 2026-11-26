import { expect, test } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { initial, type Action } from '../../../src/game/rules';
import type { Level } from '../../../src/levels/level';
import { startCheck } from '../../../tests/e2e/cove-eight-support';
import { report, snapshot } from '../../../tests/e2e/large-cove-support';
import { checkWon, hash, servedBuild, step } from './controls';

test('Rejected Wick relay, minified touch rescue', async ({ page, browser }) => {
  const out = 'reviews/lantern-reach-difficulty/development';
  const data = readFileSync('.cache/lantern-quay-relay/data/lantern-reach.level.json');
  const level: Level = JSON.parse(data.toString());
  const plan: Action[] = JSON.parse(readFileSync(out + '/quay-relay.json', 'utf8')).witness;
  mkdirSync(out, { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?cove=lantern-reach');
  await startCheck(page, level, false);
  const build = await servedBuild(page);
  let state = initial(level);
  const timeline: object[] = [];
  for (const action of plan) {
    state = await step(page, level, action, state, state.turn === 0
      ? () => snapshot(page, out, 'relay-choice') : undefined);
    timeline.push({ turn: state.turn, tide: state.tideLevel, node: state.boatNodeId, load: state.aboard,
      open: state.bridgeOpen, waiting: state.waitingByPier, delivered: state.delivered, status: state.status });
  }
  await checkWon(page, level, state, 0);
  expect(state.turn).toBe(13);
  report(out, 'relay-ui', { provenance: 'Rejected production-rule prototype, separately compiled over ca89eee',
    dataSHA256: hash(data), build, browser: browser.version(), phone: '390x844 DPR 1 touch emulation, Reduced Motion',
    decisionFrameSHA256: hash(readFileSync(out + '/relay-choice.png')), plan, timeline });
});
