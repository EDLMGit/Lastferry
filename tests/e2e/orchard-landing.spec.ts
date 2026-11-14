import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { initial, pierAt, preview, type Action, type State } from '../../src/game/rules';
import { nodeName, orchardLanding, passengerName } from '../../src/levels/level';
import { action } from './optional-tips-support';
import { checkTurn, directory, localView, recordRescue, report, snapshot, transferStart } from './large-cove-support';
import { activate, fullyVisible, idle, keyAct, ready, selectPlace, state, tabTo, undo, wholeCove } from './ui';
import { route, scenes } from './journey-six-support';
import { journeyKey } from './story-support';
import { productionURL } from './evidence';
import witnesses from '../../data/orchard-landing/witnesses.json' with { type: 'json' };

const candidate = 'orchard-landing';
test.use({ hasTouch: true, isMobile: true, deviceScaleFactor: 1, video: 'off' });

function runtimeSource() {
  const files = ['index.html', 'package.json', 'package-lock.json', 'vite.config.ts'];
  for (const root of ['src', 'data', 'assets/portraits', 'cove-portrait-package/portraits', 'cove-panel-package/material', 'cove-ui-package/ui']) {
    for (const entry of readdirSync(root, { recursive: true, encoding: 'utf8' })) {
      if (/\.(?:ts|css|json|svg|png)$/.test(entry)) files.push(root + '/' + entry.replaceAll('\\', '/'));
    }
  }
  const hash = (data: Buffer | string) => createHash('sha256').update(data).digest('hex');
  const inputs = Object.fromEntries(files.sort().map(path => [path, hash(readFileSync(path))]));
  return { inputs, sha256: hash(JSON.stringify(inputs)) };
}

let capturedSource: string;
test.beforeEach(({ browser }) => {
  const source = runtimeSource();
  capturedSource = source.sha256;
  report(directory('source'), source.sha256, {
    ...source,
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    os: process.platform, node: process.version, browser: browser.version(),
    captureTestSha256: createHash('sha256').update(readFileSync('tests/e2e/orchard-landing.spec.ts')).digest('hex'),
    when: new Date().toISOString(),
  });
});
test.afterEach(() => expect(runtimeSource().sha256).toBe(capturedSource));

async function settledFrame(page: Page, dir: string, name: string) {
  await idle(page);
  await expect(page.locator('#transfer-receipt')).toBeHidden();
  await page.evaluate(() => new Promise<void>(done =>
    requestAnimationFrame(() => requestAnimationFrame(() => done()))));
  await snapshot(page, dir, name);
}

async function saveFixture(page: Page, complete: boolean) {
  const original = JSON.stringify({
    version: 1, completed: complete ? route : route.slice(0, 1),
    acknowledgedScenes: complete ? scenes : scenes.slice(0, 2),
    checkpoint: complete ? { kind: 'complete' } : { kind: 'cove', id: 'bellwater' },
  }, null, 2) + '\n';
  await page.addInitScript(({ key, original }) => {
    if (!location.protocol.startsWith('http')) return;
    if (!sessionStorage.getItem('fixture')) {
      localStorage.setItem(key, original);
      sessionStorage.setItem('fixture', 'ready');
    }
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, value) {
      if (this === localStorage && k.startsWith(key)) write.call(sessionStorage, 'journey-write', k);
      return write.call(this, k, value);
    };
  }, { key: journeyKey, original });
  return async () => expect(await page.evaluate(key => [
    localStorage.getItem(key), sessionStorage.getItem('journey-write'), localStorage.getItem('last-ferry-tips'),
  ], journeyKey)).toEqual([original, null, null]);
}

async function transfer(page: Page, next: Extract<Action, { passengerIds: string[] }>, before: State, onChoice?: () => Promise<void>) {
  await localView(page);
  const proposed = preview(before, next, orchardLanding);
  expect(proposed.error).toBeNull();
  await transferStart(page, next, async () => {
    const options = next.type === 'unload' ? before.aboard : before.waitingByPier[pierAt(before, orchardLanding)!.id];
    for (const id of options) {
      const choice = page.locator('#passenger-' + id);
      const passenger = orchardLanding.passengers.find(p => p.id === id)!;
      await expect(choice).toHaveAccessibleName(new RegExp(passengerName(id, orchardLanding) + '.*' + passenger.slots + ' space'));
      await expect(choice).toHaveAttribute('aria-pressed', String(next.passengerIds.includes(id)));
      await expect(choice.locator('img')).toHaveAttribute('data-portrait-state', 'loaded');
      await fullyVisible(page, choice);
      const lines = await choice.locator('.cove-choice-name').evaluate(el => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getClientRects().length;
      });
      expect(lines, passengerName(id, orchardLanding)).toBe(1);
    }
    expect(await state(page)).toEqual(before);
    await onChoice?.();
  });
  await idle(page);
  await checkTurn(page, proposed.state, true);
  return proposed.state;
}

async function keyTransfer(page: Page, next: Extract<Action, { passengerIds: string[] }>) {
  if (!(await page.locator('#' + next.type).isVisible())) {
    const current = page.locator('.map-target[aria-current="location"]');
    await tabTo(page, (await current.getAttribute('id'))!);
    await page.keyboard.press('Enter');
  }
  await tabTo(page, next.type);
  await page.keyboard.press('Enter');
  if (await page.locator('#dialog[open][data-mode=action]').count()) {
    for (const choice of await page.locator('.passenger-options button').all()) {
      const id = (await choice.getAttribute('id'))!;
      if ((await choice.getAttribute('aria-pressed') === 'true') !== next.passengerIds.includes(id.slice('passenger-'.length))) {
        await tabTo(page, id);
        await page.keyboard.press('Space');
      }
    }
    await tabTo(page, 'commit');
    await page.keyboard.press('Enter');
  }
  await idle(page);
}

for (const [width, height] of [[390, 844], [780, 320]]) {
  test(`actual Orchard rescue ${width}x${height}`, async ({ page }) => {
    test.setTimeout(600000);
    const portrait = width < height;
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: portrait ? 'no-preference' : 'reduce' });
    const saveIntact = await saveFixture(page, !portrait);
    const actions = witnesses.witnesses[0].actions as Action[];
    const dir = directory(`${width}x${height}`);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await ready(page, candidate);
    expect(await state(page)).toEqual(initial(orchardLanding));
    await settledFrame(page, dir, 'start-play');
    await wholeCove(page, true);
    for (const node of orchardLanding.nodes) {
      const target = page.locator('#map-' + node.id);
      await expect(target).toHaveAccessibleName(new RegExp(nodeName(node.id, orchardLanding)));
      await fullyVisible(page, target.locator('.map-hit'));
    }
    await settledFrame(page, dir, 'start-whole');
    await localView(page);
    const current = orchardLanding.edges.find(edge => edge.current)!;
    await activate(page, 'status-toggle', true);
    const rows = page.locator('.current-schedule li');
    await expect(rows).toHaveCount(orchardLanding.rules.tide.rises.length);
    for (const [index, rise] of orchardLanding.rules.tide.rises.entries()) {
      const phase = current.current!.phases.find(item => item.tideLevel === rise.level)!;
      await expect(rows.nth(index)).toContainText(
        'After action ' + rise.afterTurn + ' · ' + nodeName(phase.from, orchardLanding)
          + ' → ' + nodeName(phase.to, orchardLanding) + ' · depth ' + (current.baseDepth + rise.level),
      );
    }
    await activate(page, 'cancel', true);
    expect(await state(page)).toEqual(initial(orchardLanding));
    await expect.poll(() => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus().running)).toBe(true);
    const finish = portrait && process.env.LAST_FERRY_ORCHARD_RECORD
      ? await recordRescue(page, dir, 'rescue') : undefined;
    const states: State[] = [];
    let tideUndo = false;
    let subset = false;
    let mixed = false;
    try {
      for (const next of actions) {
        const before = await state(page) as State;
        const proposed = preview(before, next, orchardLanding);
        const transferring = next.type === 'unload' || next.type === 'board';
        if (transferring) {
          await transfer(page, next, before, async () => {
            if (before.turn === 0) await snapshot(page, dir, 'opening-board');
            if (!subset && next.type === 'unload' && next.passengerIds.length < before.aboard.length) {
              await snapshot(page, dir, 'subset-choices');
              subset = true;
            }
            if (proposed.state.status === 'won') await snapshot(page, dir, 'delivery-choices');
          });
        } else if (next.type === 'move') {
          await selectPlace(page, next.to, true);
          await expect(page.locator('#sail')).toHaveAccessibleName('Sail to ' + nodeName(next.to, orchardLanding) + ' · 1 action');
          await fullyVisible(page, page.locator('#sail'));
          expect(await state(page)).toEqual(before);
          await activate(page, 'sail', true);
          await idle(page);
          await checkTurn(page, proposed.state, true);
        } else {
          await action(page, next, orchardLanding);
        }
        const after = await state(page) as State;
        states.push(after);
        if (after.turn === 1) await settledFrame(page, dir, 'steps-pair-aboard');
        if (!portrait && !tideUndo && after.tideLevel > before.tideLevel) {
          await undo(page, true);
          expect(await state(page)).toEqual(before);
          await action(page, next, orchardLanding);
          tideUndo = true;
        }
        if (!mixed && after.aboard.length === 2 && after.aboard.includes('orin')) {
          await localView(page);
          await settledFrame(page, dir, 'orin-aboard');
          mixed = true;
        }
        if (next.type === 'move' && before.boatNodeId === 'orchard' && after.aboard.includes('orin')) {
          await localView(page);
          await settledFrame(page, dir, 'return-crossed');
        }
      }
      expect(states.at(-1)?.status).toBe('won');
      await expect(page.locator('#dialog[open][data-outcome=won]')).toBeVisible();
      await expect(page.locator('#continue-story')).toHaveCount(0);
      await snapshot(page, dir, 'home');
      if (finish) await page.waitForTimeout(1500);
      await saveIntact();
    } finally {
      if (finish) await finish();
    }
    expect(mixed).toBe(true);
    expect(subset).toBe(true);
    if (!portrait) expect(tideUndo).toBe(true);
    await undo(page, true);
    expect(await state(page)).toEqual(states.at(-2));
    await saveIntact();
    expect(errors).toEqual([]);
    report(dir, 'rescued', { viewport: [width, height], source: capturedSource, states, subset, tideUndo, terminalUndo: true, errors });
  });
}

test('a legal early load choice strands a later rescue; keyboard Undo returns to the choice', async ({ page }) => {
  await page.setViewportSize({ width: 780, height: 320 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, candidate);
  const dir = directory('recovery');
  const timeline: State[] = [await state(page)];
  const wrong = witnesses.losingAlternatives[0].actions as Action[];
  const winning = witnesses.witnesses[0].actions as Action[];
  const choice = wrong.findIndex((step, index) => JSON.stringify(step) !== JSON.stringify(winning[index]));
  expect(choice).toBeGreaterThanOrEqual(0);
  for (const next of wrong) {
    const before = timeline.at(-1)!;
    const prediction = preview(before, next, orchardLanding);
    expect(prediction.error).toBeNull();
    if (next.type === 'board' || next.type === 'unload') {
      await keyTransfer(page, next);
    } else if (next.type === 'move') {
      await wholeCove(page);
      await keyAct(page, 'map-' + next.to);
    } else {
      await keyAct(page, 'wait');
    }
    await checkTurn(page, prediction.state, true);
    timeline.push(await state(page));
    if (next.type === 'board' && next.passengerIds.includes('orin')) {
      const loaded = await state(page);
      expect(loaded.aboard.slice().sort()).toEqual(['orin', 'pomme']);
      await wholeCove(page);
      await tabTo(page, 'map-quay');
      await page.keyboard.press('Enter');
      await expect(page.locator('#sail')).toBeDisabled();
      const context = page.locator('#local-context');
      await expect(context).toContainText(/too shallow/i);
      if (!(await page.locator('#location-facts').isVisible())) {
        await tabTo(page, 'location-details');
        await page.keyboard.press('Enter');
      }
      await expect(context).toContainText('Boat needs depth 4. Passage has depth 3');
      await snapshot(page, dir, 'wrong-escort');
      await page.keyboard.press('Escape');
      expect(await state(page)).toEqual(loaded);
    }
  }
  expect(timeline[choice + 1].status).toBe('playing');
  expect(timeline.at(-1)?.status).toBe('lost');
  await snapshot(page, dir, 'outcome');
  expect(wrong.length - choice).toBeGreaterThanOrEqual(2);
  for (let i = wrong.length - 1; i >= choice; i--) {
    const id = i === wrong.length - 1 ? 'terminal-undo' : 'undo';
    await tabTo(page, id);
    await page.keyboard.press('Enter');
    await idle(page);
    expect(await state(page)).toEqual(timeline[i]);
  }
  const restored = await state(page);
  await localView(page);
  await settledFrame(page, dir, 'decision-restored');
  for (const next of winning.slice(choice)) await action(page, next, orchardLanding);
  expect((await state(page)).status).toBe('won');
  report(dir, 'wrong-plan', { source: capturedSource, wrong, choice, rollbackCount: wrong.length - choice, timeline, restored, recovered: await state(page) });
});

test('production Practice entrance and desktop composition', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const saveIntact = await saveFixture(page, true);
  await page.goto(productionURL);
  await activate(page, 'home-practice');
  const menu = page.locator('[data-practice]');
  await expect(menu).toHaveCount(8);
  await activate(page, 'practice-orchard-landing');
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Orchard Landing');
  await settledFrame(page, directory('desktop'), 'start');
  await keyAct(page, 'wait');
  await expect(page.locator('[data-testid=turn]')).toHaveText('01');
  await keyAct(page, 'undo');
  await expect(page.locator('[data-testid=turn]')).toHaveText('00');
  await saveIntact();
});

test('a separate return to Spring Steps rescues Medlar before the current turns', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, candidate);
  const witness = witnesses.witnesses.find(entry => entry.id === 'return-to-spring-steps')!;
  const states: State[] = [];
  for (const next of witness.actions as Action[]) states.push(await action(page, next, orchardLanding));
  expect(states[0].waitingByPier['steps-pier']).toEqual(['medlar']);
  expect(states[6].boatNodeId).toBe('steps');
  expect(states[6].aboard).toEqual(['medlar']);
  expect(states.at(-1)?.status).toBe('won');
  report(directory('recovery'), 'steps-return', { source: capturedSource, witness: witness.id, states });
});
