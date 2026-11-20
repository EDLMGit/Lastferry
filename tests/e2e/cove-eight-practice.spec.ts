import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { initial, type Action, type State } from '../../src/game/rules';
import { nodeName } from '../../src/levels/level';
import { activate, fullyVisible, idle, ready, state, tabTo, undo, wholeCove } from './ui';
import { directory, localView, recordRescue, report } from './large-cove-support';
import { fixture, home, ongoing, storage, untouched } from './three-lanterns-support';
import { productionURL } from './evidence';
import { acceptedBest, candidate, capture, completeSeven, execute, recordOnly, replay, sources, startCheck, scoredMenu, scoredWin } from './cove-eight-support';

const candidateId = 'ternhaven';
test.use({ hasTouch: true, isMobile: true, deviceScaleFactor: 1, video: 'off' });
test.setTimeout(420000);
let source: ReturnType<typeof sources>;
let errors: string[];
test.beforeEach(({ browser, page }) => {
  errors = [];
  page.on('pageerror', error => errors.push(error.message));
  source = sources();
  report(directory('source'), source.sha256, { ...source, browser: browser.version(), node: process.version, os: process.platform, when: new Date().toISOString(), dpr: 1, gpu: 'SwiftShader', device: 'Chromium touch emulation' });
});
test.afterEach(() => {
  expect(sources()).toEqual(source);
  expect(errors).toEqual([]);
});

test('portrait first strategy rescues the scored candidate with tide and terminal Undo', async ({ page }) => {
  const { level, witnesses } = candidate(candidateId);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await fixture(page, ongoing, acceptedBest);
  await ready(page, candidateId);
  await startCheck(page, level);
  await capture(page, '390x844', 'start-play');
  await wholeCove(page, true);
  for (const node of level.nodes) {
    await expect(page.locator('#map-' + node.id)).toHaveAccessibleName(new RegExp(nodeName(node.id, level)));
    await fullyVisible(page, page.locator('#map-' + node.id + ' .map-hit'));
  }
  await capture(page, '390x844', 'start-whole');
  await localView(page);
  await scoredMenu(page);
  await activate(page, 'status-toggle', true);
  const currentPassage = level.edges.find(edge => edge.current);
  if (currentPassage) {
    const rows = page.locator('.current-schedule li');
    await expect(rows).toHaveCount(level.rules.tide.rises.length);
    for (const [index, rise] of level.rules.tide.rises.entries()) {
      const phase = currentPassage.current!.phases.find(entry => entry.tideLevel === rise.level)!;
      await expect(rows.nth(index)).toContainText('After action ' + rise.afterTurn + ' · ' + nodeName(phase.from, level) + ' → ' + nodeName(phase.to, level) + ' · depth ' + (currentPassage.baseDepth + rise.level));
    }
  }
  expect(await state(page)).toEqual(initial(level));
  await capture(page, '390x844', 'forecast');
  await activate(page, 'cancel', true);
  await expect.poll(() => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus().running)).toBe(true);
  const finish = recordOnly ? await recordRescue(page, directory('390x844'), 'rescue') : undefined;
  const timeline: State[] = [initial(level)];
  let current = timeline[0], tideUndo = false, subset = false;
  try {
    for (const action of witnesses[0].actions) {
      const before = current;
      const shot = !subset && action.type === 'unload'
        ? async () => { await capture(page, '390x844', 'staging-preview'); subset = true; } : undefined;
      current = await execute(page, level, action, before, true, shot);
      if (current.tideLevel > before.tideLevel && !tideUndo) {
        await localView(page);
        await capture(page, '390x844', 'after-tide');
        await undo(page, true);
        expect(await state(page)).toEqual(before);
        current = await execute(page, level, action, before);
        tideUndo = true;
      }
      timeline.push(current);
    }
    expect(tideUndo).toBe(true);
    expect(subset).toBe(true);
    await scoredWin(page, witnesses[0].actions.length, 1);
    await capture(page, '390x844', 'rescue');
    await tabTo(page, 'terminal-undo');
    await page.keyboard.press('Enter');
    await idle(page);
    expect(await state(page)).toEqual(timeline.at(-2));
    current = await execute(page, level, witnesses[0].actions.at(-1)!, timeline.at(-2)!);
    await scoredWin(page, witnesses[0].actions.length, 2);
    await capture(page, '390x844', 'redelivery');
    if (finish) await page.waitForTimeout(900);
    report(directory('390x844'), recordOnly ? 'recorded-rescue' : 'rescue-run', { source: source.sha256, strategy: witnesses[0].id, timeline, final: current, tideUndo, terminalUndo: true, saved: await storage(page) });
  } finally { if (finish) await finish(); }
  await activate(page, 'terminal-restart', true);
  await startCheck(page, level);
  expect((await storage(page)).masteryWrites).toBe(1);
  const accepted = (await storage(page)).mastery!;
  expect(JSON.parse(accepted).results['ternhaven@1']).toMatchObject({ actions: 14, successfulUndos: 2, lanterns: 2 });
  await home(page);
  await untouched(page, ongoing);
  expect((await storage(page)).mastery).toBe(accepted);
  await page.reload();
  await untouched(page, ongoing);
});

test('short landscape production route uses the second strategy and preserves completed-seven and mastery', async ({ page }) => {
  const { level, witnesses } = candidate(candidateId);
  await page.setViewportSize({ width: 780, height: 320 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await fixture(page, completeSeven, acceptedBest);
  await page.goto(productionURL);
  expect(await page.evaluate(() => typeof (window as any).__LAST_FERRY__)).toBe('undefined');
  await activate(page, 'home-practice', true);
  await expect(page.locator('[data-practice]')).toHaveCount(12);
  await expect(page.locator('#practice-' + candidateId)).toContainText('Not yet rated');
  await page.locator('#practice-' + candidateId).scrollIntoViewIfNeeded();
  await fullyVisible(page, page.locator('#practice-' + candidateId));
  await activate(page, 'practice-' + candidateId, true);
  await startCheck(page, level, false);
  await capture(page, '780x320', 'start-play');
  await scoredMenu(page);
  let current = initial(level), choice = false, change = false;
  const timeline: State[] = [current];
  for (const action of witnesses[1].actions) {
    const before = current;
    current = await execute(page, level, action, before, false, !choice && action.type === 'unload'
      ? async () => { await capture(page, '780x320', 'staging-preview'); choice = true; } : undefined);
    if (!change && current.tideLevel > before.tideLevel) {
      await localView(page);
      await capture(page, '780x320', 'after-tide');
      change = true;
    }
    timeline.push(current);
  }
  await scoredWin(page, witnesses[1].actions.length);
  await capture(page, '780x320', 'rescue');
  await activate(page, 'choose-cove', true);
  await expect(page.locator('.mastery-criteria summary')).toContainText('14 actions');
  await page.locator('#cove-picker').selectOption('orchard-landing');
  await idle(page);
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Orchard Landing');
  await untouched(page, completeSeven);
  expect(JSON.parse((await storage(page)).mastery!).results['ternhaven@1']).toMatchObject({ actions: 14, successfulUndos: 0, lanterns: 3 });
  expect((await storage(page)).masteryWrites).toBe(1);
  report(directory('780x320'), 'release-rescue', { source: source.sha256, url: productionURL, strategy: witnesses[1].id, timeline, saved: await storage(page) });
});

test('a tempting placement is recovered through the real earlier choice and a complete rescue', async ({ page }) => {
  const { level, witnesses } = candidate(candidateId);
  const data = JSON.parse(readFileSync('data/' + candidateId + '/witnesses.json', 'utf8'));
  const alternative = data.losingAlternatives.find((entry: { id: string }) => entry.id === 'wrong-early-load');
  const wrong: Action[] = alternative.actions;
  const correct = witnesses[0].actions;
  let choice = 0;
  while (JSON.stringify(wrong[choice]) === JSON.stringify(correct[choice]) && choice < Math.min(wrong.length, correct.length)) choice++;
  expect(choice).toBeLessThan(wrong.length);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await fixture(page, completeSeven, acceptedBest);
  await ready(page, candidateId);
  const timeline = [initial(level)];
  for (const [index, action] of wrong.entries()) {
    const next = await execute(page, level, action, timeline.at(-1)!);
    timeline.push(next);
    if (index === 1) {
      expect(next.status).toBe('playing');
      await capture(page, 'recovery', 'wrong-subset-still-playing');
    }
    if (index === 2) {
      await wholeCove(page, true);
      await page.locator('#map-harbor .map-hit').tap();
      await expect(page.locator('#sail')).toBeDisabled();
      await expect(page.locator('#local-context')).toContainText('Boat needs depth 3');
      await expect(page.locator('#local-context')).toContainText('Passage has depth 2');
      await capture(page, 'recovery', 'blocked-early-load');
      expect(await state(page)).toEqual(next);
    }
  }
  expect(timeline.at(-1)!.status).not.toBe('won');
  await localView(page);
  await capture(page, 'recovery', 'tempting-outcome');
  for (let index = wrong.length; index > choice; index--) {
    const id = await page.locator('#dialog[open] #terminal-undo').count() ? 'terminal-undo' : 'undo';
    await tabTo(page, id);
    await page.keyboard.press('Enter');
    await idle(page);
    expect(await state(page)).toEqual(timeline[index - 1]);
  }
  await capture(page, 'recovery', 'early-choice-restored');
  const recovered = await replay(page, level, correct.slice(choice), true, timeline[choice]);
  await scoredWin(page, correct.length, wrong.length - choice);
  await untouched(page, completeSeven);
  report(directory('recovery'), 'mistake-and-recovery', { source: source.sha256, wrong: alternative.id, actions: wrong, choice, undoCount: wrong.length - choice, outcomeBeforeUndo: timeline.at(-1), timeline, recovered: recovered.at(-1), saved: await storage(page) });
});

test('320px Practice criteria, candidate menu, orientation and fullscreen retain honest progress', async ({ page }) => {
  const { level, witnesses } = candidate(candidateId);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await fixture(page, completeSeven, acceptedBest);
  await page.goto('/');
  await expect(page.locator('.home-notice')).toContainText('Seven coves are safe. Ternhaven is next.');
  await activate(page, 'home-practice', true);
  await expect(page.locator('[data-practice]')).toHaveCount(12);
  await page.locator('.mastery-criteria summary').tap();
  await expect(page.locator('.mastery-targets dt')).toHaveCount(9);
  await expect(page.locator('.mastery-targets')).toContainText(level.title);
  await expect(page.locator('.mastery-targets')).toContainText('Orchard Landing');
  await page.locator('#practice-' + candidateId).scrollIntoViewIfNeeded();
  await fullyVisible(page, page.locator('#practice-' + candidateId));
  await capture(page, '320x740', 'practice-list');
  await activate(page, 'practice-' + candidateId, true);
  await startCheck(page, level);
  await capture(page, '320x740', 'start-play');
  await scoredMenu(page);
  const before = await execute(page, level, witnesses[0].actions[0], initial(level));
  await activate(page, 'menu', true);
  await tabTo(page, 'settings');
  await page.keyboard.press('Enter');
  await expect(page.locator('#tips-preference')).toHaveValue('off');
  await page.setViewportSize({ width: 780, height: 320 });
  await page.locator('#fullscreen').scrollIntoViewIfNeeded();
  await activate(page, 'fullscreen', true);
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
  expect(await page.evaluate(() => document.fullscreenElement!.contains(document.getElementById('dialog')))).toBe(true);
  await activate(page, 'fullscreen', true);
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null)).toBeNull();
  await page.keyboard.press('Escape');
  await expect(page.locator('#settings')).toBeFocused();
  await page.keyboard.press('Escape');
  expect(await state(page)).toEqual(before);
  await undo(page, true);
  expect(await state(page)).toEqual(initial(level));
  await home(page);
  await untouched(page, completeSeven);
  await page.goto('/?cove=' + candidateId);
  await idle(page);
  await untouched(page, completeSeven);
  expect((await storage(page)).mastery).toBe(acceptedBest);
  report(directory('320x740'), 'lifecycle', { source: source.sha256, saved: await storage(page), fullscreen: 'actual app fullscreenElement entered/exited; dialog contained', rotation: '320x740 to 780x320 while Settings open' });
});

test('the low landing requires the direct retrieval and Undo restores that approach', async ({ page }) => {
  const { level, witnesses } = candidate(candidateId);
  const data = JSON.parse(readFileSync('data/' + candidateId + '/witnesses.json', 'utf8'));
  const alternative = data.losingAlternatives.find((entry: { id: string }) => entry.id === 'low-return-via-buoy');
  const wrong: Action[] = alternative.actions;
  const correct = witnesses.find(entry => entry.id === alternative.recoveryWitness)!;
  await page.setViewportSize({ width: 780, height: 320 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await fixture(page, ongoing, acceptedBest);
  await ready(page, candidateId);
  const timeline: State[] = [initial(level)];
  for (const [index, action] of wrong.entries()) {
    const next = await execute(page, level, action, timeline.at(-1)!);
    timeline.push(next);
    if (index + 1 === alternative.firstNoWinningContinuationTurn) {
      expect(next.status).toBe('playing');
      await wholeCove(page, true);
      await page.locator('#map-low .map-hit').tap();
      expect(await state(page)).toEqual(next);
      await capture(page, 'low-recovery', 'missed-retrieval-still-playing');
    }
  }
  expect(timeline.at(-1)!.status).toBe('lost');
  await capture(page, 'low-recovery', 'flood-outcome');
  for (let index = wrong.length; index > alternative.recoveryToTurn; index--) {
    await undo(page, true);
    expect(await state(page)).toEqual(timeline[index - 1]);
  }
  await localView(page);
  await capture(page, 'low-recovery', 'direct-approach-restored');
  const final = await replay(page, level, correct.actions.slice(alternative.recoveryToTurn), true, timeline[alternative.recoveryToTurn]);
  await scoredWin(page, correct.actions.length, wrong.length - alternative.recoveryToTurn);
  await untouched(page, ongoing);
  report(directory('low-recovery'), 'retrieval-recovery', { source: source.sha256, wrong: alternative.id, recoveredStrategy: correct.id, firstUnwinnableTurn: alternative.firstNoWinningContinuationTurn, recoveredTurn: alternative.recoveryToTurn, timeline, final: final.at(-1), saved: await storage(page) });
});

test('desktop candidate is readable and accepted Orchard scoring remains available', async ({ page }) => {
  const { level } = candidate(candidateId);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await fixture(page, ongoing, acceptedBest);
  await ready(page, candidateId);
  await startCheck(page, level);
  await capture(page, 'desktop', 'start-play');
  await scoredMenu(page);
  await home(page);
  await activate(page, 'home-practice');
  await expect(page.locator('#practice-orchard-landing .mastery-badge')).toHaveAccessibleName(/3 of 3 lanterns/);
  await activate(page, 'practice-orchard-landing');
  await activate(page, 'menu');
  await expect(page.locator('.mastery-criteria summary')).toContainText('13 actions');
  await untouched(page, ongoing);
  report(directory('desktop'), 'scored-regression', { source: source.sha256, saved: await storage(page) });
});
