import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { initial, type Action, type State } from '../../../src/game/rules';
import { nodeName, passengerName, type Level } from '../../../src/levels/level';
import { startCheck } from '../../../tests/e2e/cove-eight-support';
import { directory, localView, recordRescue, report, snapshot } from '../../../tests/e2e/large-cove-support';
import { runtimeSource } from '../../../tests/e2e/three-lanterns-support';
import { activate, fullyVisible, undo, wholeCove } from '../../../tests/e2e/ui';
import { checkWon, expectState, hash, listenToOutput, servedBuild, step } from '../../lantern-reach-difficulty/play/controls';

type Plan = { id: string; actions: Action[] };
const task = 'far-shore';
const file = (name: string) => readFileSync(name, 'utf8');
const same = (left: Action, right: Action) => {
  if (left.type !== right.type) return false;
  if (left.type === 'move' && right.type === 'move') return left.to === right.to;
  if ('passengerIds' in left && 'passengerIds' in right) return [...left.passengerIds].sort().join() === [...right.passengerIds].sort().join();
  return true;
};

async function chooserFrame(page: Page, out: string, name: string) {
  await expect(page.locator('.passenger-options img[data-portrait-state=loaded]')).toHaveCount(2);
  await snapshot(page,out,name);
}

async function forecast(page: Page, level: Level, state: State, out: string) {
  await activate(page, 'status-toggle', true);
  const facts = page.locator('#dialog[open] .forecast-detail');
  for (const pier of level.piers) {
    const ids = state.waitingByPier[pier.id] ?? [];
    if (!ids.length) continue;
    const row = facts.getByRole('list', { name: 'Waiting passengers' }).getByRole('listitem').filter({ hasText: nodeName(pier.nodeId, level) });
    for (const id of ids) {
      const slots = level.passengers.find(p => p.id === id)!.slots;
      await expect(row).toContainText(passengerName(id, level) + ' (' + slots + ')');
    }
  }
  for (const rise of level.rules.tide.rises.filter(r => r.afterTurn > state.turn))
    await expect(facts).toContainText('After action ' + rise.afterTurn);
  const text = await facts.innerText();
  await expect(facts).toContainText('After action 6: depth 3, up to 4 spaces');
  await expect(facts).toContainText('After action 8: flooded');
  await snapshot(page,out,'decision-forecast');
  await activate(page,'cancel',true);
  await expectState(page,level,state);
  return text;
}

for (const [width,height] of [[390,844],[780,320]]) {
  test('Touch rescue, mistake and Undo at ' + width + 'x' + height, async ({page,browser}) => {
    const level: Level = JSON.parse(file('data/' + task + '.level.json'));
    const plans = JSON.parse(file('data/' + task + '/witnesses.json')) as { witnesses: Plan[]; losingAlternatives: Plan[] };
    const plan = plans.witnesses[0];
    const mistake = plans.losingAlternatives[0];
    const start = initial(level);
    const source = runtimeSource();
    const out = directory(width + 'x' + height);
    const clock: {event:string;turn:number;epochMs:number}[] = [];
    const mark = async (event: string, state: State) => {
      clock.push({event,turn:state.turn,epochMs:await page.evaluate(() => performance.timeOrigin + performance.now())});
    };
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({width,height});
    await page.emulateMedia({reducedMotion: width === 390 ? 'no-preference' : 'reduce'});
    if (width === 390) await listenToOutput(page);
    await page.goto('/?cove=' + task);
    await startCheck(page,level,false);
    const build = await servedBuild(page);
    await snapshot(page,out,'start-play');
    await wholeCove(page,true);
    for (const node of level.nodes) {
      const marker = page.locator('#map-' + node.id);
      await expect(marker).toHaveAccessibleName(new RegExp(nodeName(node.id,level)));
      await fullyVisible(page,marker.locator('.map-hit'));
    }
    await snapshot(page,out,'whole-cove');
    await localView(page);
    let stopRecording: (() => Promise<void>) | undefined;
    if (width === 390 && process.env.FAR_SHORE_RECORD !== '0') {
      await expect.poll(() => page.evaluate(() => (window as any).__lastFerryMonitoredContext?.state)).toBe('running');
      stopRecording = await recordRescue(page,out,'final-arrival',true);
    }
    let common = 0;
    while (common < Math.min(mistake.actions.length,plan.actions.length) && same(mistake.actions[common],plan.actions[common])) common++;
    expect(common).toBeLessThan(plan.actions.length);
    const trial = [start];
    const winning = [start];
    let forecastText = '';
    try {
      for (const [index,action] of mistake.actions.entries()) {
        const s = trial.at(-1)!;
        if (index === common) {
          await mark('decisive choice',s);
          await snapshot(page,out,'decision-before');
          forecastText = await forecast(page,level,s,out);
        }
        const next = await step(page,level,action,s,index === common ? () => chooserFrame(page,out,'tempting-action') : undefined);
        trial.push(next);
        if (index < common) winning.push(next);
        if (index === common) await snapshot(page,out,'decision-after');
        if (next.turn === 7) {
          expect(next.boatNodeId).toBe('rush');
          expect(next.aboard).toEqual(['thistle']);
          const blocked = page.locator('#board-unavailable');
          await expect(blocked).toBeDisabled();
          await expect(blocked).toHaveAccessibleName(/Board Rowan.*needs depth 4.*berth 3/);
          await fullyVisible(page,blocked);
          await mark('Rowan cannot board',next);
          await snapshot(page,out,'rush-with-thistle');
        }
      }
      const loss = trial.at(-1)!;
      expect(loss.status).toBe('lost');
      if (loss.lossReason?.code === 'PASSENGER_STRANDED')
        for (const id of loss.lossReason.passengerIds) await expect(page.locator('#dialog')).toContainText(passengerName(id,level));
      await mark('consequence', loss);
      const shownLoss = await page.locator('#dialog[open]').innerText();
      await snapshot(page,out,'mistake-consequence');
      for (let n = mistake.actions.length - 1; n >= common; n--) {
        await undo(page,true);
        await expectState(page,level,trial[n]);
      }
      const undos = mistake.actions.length - common;
      let state = trial[common];
      await mark('restored choice',state);
      await snapshot(page,out,'undo-restored');
      for (let n = common; n < plan.actions.length; n++) {
        state = await step(page,level,plan.actions[n],state,n === common ? () => chooserFrame(page,out,'alternative-action') : undefined);
        winning.push(state);
        if (state.turn === common+1) await snapshot(page,out,'alternative-after');
        if (state.turn === 6 || state.turn === 9) await snapshot(page,out,'turn-' + state.turn);
        if (state.turn === 7) {
          expect(state.boatNodeId).toBe('rush');
          expect(state.aboard).toEqual(['button']);
          await expect(page.locator('#board')).toBeEnabled();
          await expect(page.locator('#board')).toHaveAccessibleName('Board Rowan');
          await fullyVisible(page,page.locator('#board'));
          await mark('Rowan can board',state);
          await snapshot(page,out,'rush-with-button');
        }
        if (state.turn === 8) {
          expect(state.aboard).toEqual(['button','rowan']);
          await mark('Rowan aboard at the flood',state);
          await snapshot(page,out,'rowan-aboard');
        }
      }
      await checkWon(page,level,state,undos);
      await expect(page.locator('#arrival-cast img[data-portrait-state=loaded]')).toHaveCount(4);
      await mark('unscored arrival',state);
      await snapshot(page,out,'arrival');
      if (stopRecording) {
        await page.waitForTimeout(500);
        const finish = stopRecording;
        stopRecording = undefined;
        await finish();
      }
      await undo(page,true);
      await expectState(page,level,winning.at(-2)!);
      const fresh = await step(page,level,plan.actions.at(-1)!,winning.at(-2)!);
      await checkWon(page,level,fresh,undos+1);
      expect(errors).toEqual([]);
      expect(runtimeSource().sha256).toBe(source.sha256);
      const tests = Object.fromEntries(['reviews/far-shore/play/config.ts','reviews/far-shore/play/rescue.spec.ts',
        'reviews/lantern-reach-difficulty/play/controls.ts','tests/e2e/cove-eight-support.ts','tests/e2e/large-cove-support.ts',
        'tests/e2e/ui.ts','tests/e2e/three-lanterns-support.ts'].map(path => [path,hash(readFileSync(path))]));
      report(directory('source'),source.sha256,{head:source.head, sha256:source.sha256, inputs:source.inputs, tests, build,
        browser:browser.version(), node:process.version, os:process.platform, renderer:'SwiftShader · DPR 1 touch emulation'});
      report(out,'run',{source:source.sha256,build,browser:browser.version(),width,height,route:plan.id,actions:plan.actions,
        mistake:mistake.id,mistakeActions:mistake.actions,sharedActions:common,forecastText,shownLoss,
        trial,winning,successfulUndos:undos,terminalUndoRedelivery:true,pageErrors:errors,clock});
    } finally {
      if (stopRecording) await stopRecording();
    }
  });
}
