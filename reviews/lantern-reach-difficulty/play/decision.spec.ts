import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { initial, type Action, type State } from '../../../src/game/rules';
import { nodeName, passengerName, type Level } from '../../../src/levels/level';
import { candidate, startCheck } from '../../../tests/e2e/cove-eight-support';
import { directory, localView, recordRescue, report, snapshot } from '../../../tests/e2e/large-cove-support';
import { runtimeSource } from '../../../tests/e2e/three-lanterns-support';
import { activate, fullyVisible, undo, wholeCove } from '../../../tests/e2e/ui';
import { checkWon, expectState, forecast, hash, listenToOutput, selectStop, servedBuild, step } from './controls';

const id = 'lantern-reach';
type Plan = { id: string; actions: Action[] };
const same = (left: Action, right: Action) => JSON.stringify(left) === JSON.stringify(right);

async function inspectWaiting(page: Page, level: Level, s: State, pierId: string, out: string) {
  const pier = level.piers.find(p => p.id === pierId)!;
  await selectStop(page, pier.nodeId);
  await activate(page, 'location-details', true);
  const facts = page.locator('#location-facts');
  const names = s.waitingByPier[pierId].map(id => passengerName(id, level));
  for (const name of names) await expect(facts).toContainText(name);
  await snapshot(page, out, 'neighbor-still-waiting');
  await activate(page, 'close-location', true);
  await localView(page);
  await expectState(page, level, s);
  return { place: nodeName(pier.nodeId, level), names };
}

for (const [width, height, routeIndex] of [[390, 844, 0], [780, 320, 1]] as const) {
  const size = width + 'x' + height;
  test('Actual decision, mistake, Undo and unscored rescue at ' + size, async ({ page, browser }) => {
    const { level, witnesses } = candidate(id);
    const plan = witnesses.find(witness => witness.id === 'signal-first')!;
    const data = JSON.parse(readFileSync('data/lantern-reach/witnesses.json', 'utf8'));
    const mistake = data.losingAlternatives.find((row: Plan) => row.id === 'board-at-six') as Plan;
    expect(plan.id).toBeTruthy();
    const start = initial(level);
    const source = runtimeSource();
    const out = directory(size);
    const errors: string[] = [];
    const second: State[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: routeIndex === 0 ? 'no-preference' : 'reduce' });
    if (routeIndex === 0) await listenToOutput(page);
    await page.goto('/?cove=' + id);
    await startCheck(page, level, false);
    const build = await servedBuild(page);
    await snapshot(page, out, 'start-play');
    await wholeCove(page, true);
    for (const node of level.nodes) {
      const marker = page.locator('#map-' + node.id);
      await expect(marker).toHaveAccessibleName(new RegExp(nodeName(node.id, level)));
      await fullyVisible(page, marker.locator('.map-hit'));
    }
    await snapshot(page, out, 'whole-cove');
    await localView(page);
    await forecast(page, level, start);
    let stopRecording: (() => Promise<void>) | undefined;
    if (routeIndex === 0 && process.env.REACH_RECORD !== '0') {
      await expect.poll(() => page.evaluate(() => (window as any).__lastFerryMonitoredContext?.state)).toBe('running');
      stopRecording = await recordRescue(page, out, 'final-arrival', true);
    }
    const clock: { event: string, turn: number, epochMs: number }[] = [];
    const mark = async (event: string, turn: number) => {
      clock.push({ event, turn, epochMs: await page.evaluate(() => performance.timeOrigin + performance.now()) });
    };
    const trial: State[] = [start];
    let common = 0;
    while (common < Math.min(mistake.actions.length, plan.actions.length) && same(mistake.actions[common], plan.actions[common])) common++;
    expect(common).toBe(6);
    const played: State[] = [];
    let forecastText = '';
    let waiting: Awaited<ReturnType<typeof inspectWaiting>> | undefined;
    try {
      for (const [index, action] of mistake.actions.entries()) {
        const s = trial.at(-1)!;
        if (index === common) {
          await localView(page);
          await mark('fork', s.turn);
          await snapshot(page, out, 'decision-before');
          forecastText = await forecast(page, level, s, out, 'decision-forecast');
          const landing = level.piers.filter(p => s.waitingByPier[p.id].length && p.nodeId !== s.boatNodeId)
            .find(p => p.id === 'east-pier') ?? level.piers.find(p => s.waitingByPier[p.id].length);
          if (landing) waiting = await inspectWaiting(page, level, s, landing.id, out);
        }
        const n = await step(page, level, action, s, index === common
          ? () => snapshot(page, out, 'tempting-action') : undefined);
        trial.push(n);
        if (action.type === 'open-bridge') {
          await mark('bridge open', n.turn);
          await snapshot(page, out, 'bridge-open');
          await forecast(page, level, n);
        }
        if (index === common) {
          await snapshot(page, out, 'decision-after');
          expect(n.status).toBe('playing');
          expect(n.turn).toBe(7);
          expect(n.aboard).toEqual(expect.arrayContaining(['tallow','ember']));
          expect(n.waitingByPier['east-pier']).toEqual(['sorbus']);
        }
      }
      const failed = trial.at(-1)!;
      expect(failed.status).toBe('lost');
      if (failed.lossReason?.code === 'PASSENGER_STRANDED') {
        for (const id of failed.lossReason.passengerIds) await expect(page.locator('#dialog')).toContainText(passengerName(id, level));
      }
      await mark('loss', failed.turn);
      await snapshot(page, out, 'mistake-consequence');
      for (let index = mistake.actions.length - 1; index >= common; index--) {
        await undo(page, true);
        await expectState(page, level, trial[index]);
      }
      let current = trial[common];
      expect(current.bridgeOpen).toBe(true);
      expect(current.aboard).toEqual([]);
      await forecast(page, level, current);
      await mark('restored choice', current.turn);
      await snapshot(page, out, 'undo-restored');
      for (const [index, action] of plan.actions.entries()) {
        if (index < common) { played.push(trial[index+1]); continue; }
        current = await step(page, level, action, current, index === common
          ? () => snapshot(page, out, 'different-choice') : undefined);
        played.push(current);
        if (current.turn === 8) {
          expect(current.aboard).toEqual(['sorbus']);
          await mark('Sorbus aboard', current.turn);
          await snapshot(page, out, 'sorbus-aboard');
        }
      }
      const undos = mistake.actions.length - common;
      await checkWon(page, level, current, undos);
      await mark('arrival', current.turn);
      await snapshot(page, out, 'arrival');
      if (stopRecording) {
        await page.waitForTimeout(500);
        const finish = stopRecording;
        stopRecording = undefined;
        await finish();
      }
      await undo(page, true);
      const beforeDelivery = played.at(-2)!;
      await expectState(page, level, beforeDelivery);
      const fresh = await step(page, level, plan.actions.at(-1)!, beforeDelivery);
      await checkWon(page, level, fresh, undos + 1);
    } finally {
      if (stopRecording) await stopRecording();
    }
    if (routeIndex === 1) {
      const outer = witnesses.find(witness => witness.id === 'reserve-room')!;
      await activate(page, 'terminal-restart', true);
      await expectState(page, level, start);
      let s = start;
      for (const [i, action] of outer.actions.entries()) {
        s = await step(page, level, action, s, i === 0 ? () => snapshot(page, out, 'reserve-room-choice') : undefined);
        second.push(s);
        if (s.turn === 3) {
          expect(s.aboard).toEqual(expect.arrayContaining(['flax','tallow','sorbus']));
          expect(s.bridgeOpen).toBe(false);
          await snapshot(page, out, 'reserve-room-full');
        }
      }
      await checkWon(page, level, s, 0);
      await snapshot(page, out, 'outer-arrival');
    }
    expect(errors).toEqual([]);
    expect(runtimeSource().sha256).toBe(source.sha256);
    const tests = Object.fromEntries(['reviews/lantern-reach-difficulty/play/config.ts','reviews/lantern-reach-difficulty/play/decision.spec.ts',
      'reviews/lantern-reach-difficulty/play/controls.ts','tests/e2e/cove-eight-support.ts','tests/e2e/large-cove-support.ts',
      'tests/e2e/ui.ts','tests/e2e/three-lanterns-support.ts'].map(path => [path, hash(readFileSync(path))]));
    report(directory('source'), source.sha256, { head:source.head, sha256:source.sha256, inputs:source.inputs, tests, build,
      browser:browser.version(), node:process.version, os:process.platform, rendering:'SwiftShader, touch emulation, device scale factor 1' });
    report(out,'run',{ source:source.sha256, build, browser:browser.version(), width,height, route:plan.id,
      correctActions:plan.actions, mistake:mistake.id, mistakeActions:mistake.actions, sharedOpeningActions:common,
      secondStrategy:second.length ? { id:'reserve-room', states:second } : null,
      forecastText, waiting, trialStates:trial, winningStates:played, terminalUndoRedelivery:true, pageErrors:errors, clock,
      method:'Per action, compared the release turn, tide, current location and load with production reducer expectations; observed final roster, loss and bridge facts through UI. No debug API.' });
  });
}
