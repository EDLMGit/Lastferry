import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { initial, preview, type Action, type State } from '../../src/game/rules';
import { nodeName, passengerName, type Level } from '../../src/levels/level';
import { candidate, execute, startCheck } from '../../tests/e2e/cove-eight-support';
import { checkTurn, directory, localView, recordRescue, report, snapshot } from '../../tests/e2e/large-cove-support';
import { runtimeSource } from '../../tests/e2e/three-lanterns-support';
import { activate, fullyVisible, idle, undo, wholeCove } from '../../tests/e2e/ui';

const id = 'lantern-reach';
const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');

async function monitorOutput(page: Page) {
  await page.addInitScript(() => {
    const connect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function(this: AudioNode, ...args: unknown[]) {
      const result = Reflect.apply(connect, this, args);
      if (args[0] === this.context.destination) {
        const tap = (this.context as AudioContext).createMediaStreamDestination();
        Reflect.apply(connect, this, [tap]);
        Object.assign(window, { __lastFerryOutputMonitor: tap.stream, __lastFerryMonitoredContext: this.context });
      }
      return result;
    } as typeof connect;
  });
}

async function servedBuild(page: Page) {
  const paths = await page.locator('head script[type=module][src], head link[rel=stylesheet][href]').evaluateAll(els =>
    els.map(el => el.getAttribute('src') ?? el.getAttribute('href')!));
  expect(paths.some(path => /assets\/index-.+\.js$/.test(path))).toBe(true);
  expect(await page.evaluate(() => '__LAST_FERRY__' in window)).toBe(false);
  const bundles: Record<string, string> = {};
  for (const path of paths) {
    bundles[path] = hash(await (await page.request.get(path)).body());
    expect(bundles[path]).toBe(hash(readFileSync((process.env.BRIDGE_DIST ?? 'dist') + '/' + path.replace(/^\.?\//, ''))));
  }
  return bundles;
}

async function selectStop(page: Page, stop: string) {
  const hit = page.locator('#map-' + stop + ' .map-hit');
  const available = await hit.evaluate(el => {
    const r = el.getBoundingClientRect();
    const front = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return !el.closest('.offscreen') && r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight && el.contains(front);
  });
  if (available) {
    try {
      await hit.tap({ timeout: 1000 });
    } catch (error) {
      if (!(error instanceof Error) || error.name !== 'TimeoutError') throw error;
      await wholeCove(page, true);
      await hit.tap();
    }
  } else {
    await wholeCove(page, true);
    await hit.tap();
  }
  await expect(page.locator('#local-context')).toBeVisible();
}

async function openPreview(page: Page, before: State) {
  if (!await page.locator('#open-bridge').isVisible()) await selectStop(page, before.boatNodeId);
  await fullyVisible(page, page.locator('#open-bridge'));
  await activate(page, 'open-bridge', true);
  await expect(page.locator('#dialog[open]')).toContainText(/bridge/i);
  await fullyVisible(page, page.locator('#commit'));
  await checkTurn(page, before, false);
}

async function playStep(page: Page, level: Level, action: Action, before: State, bridgeFrames?: string) {
  if (action.type !== 'move' && action.type !== 'open-bridge') return execute(page, level, action, before, false);
  const proposed = preview(before, action, level);
  expect(proposed.error).toBeNull();
  if (action.type === 'move') {
    await selectStop(page, action.to);
    await fullyVisible(page, page.locator('#sail'));
    await expect(page.locator('#local-context')).toContainText(nodeName(action.to, level));
    await activate(page, 'sail', true);
  } else {
    await localView(page);
    await openPreview(page, before);
    if (bridgeFrames) await snapshot(page, bridgeFrames, 'open-preview');
    if (bridgeFrames) await page.locator('#commit').evaluate(el => {
      el.addEventListener('click', () => {
        Object.assign(window, { __bridgeInputAt: performance.timeOrigin + performance.now() });
      }, { capture: true, once: true });
    });
    await activate(page, 'commit', true);
  }
  await idle(page);
  await checkTurn(page, proposed.state, false);
  if (proposed.state.status === 'playing') await localView(page);
  if (bridgeFrames) {
    const opening = await page.evaluate(() => ({ inputMs: (window as any).__bridgeInputAt, idleObservedMs: performance.timeOrigin + performance.now() }));
    report(bridgeFrames, 'opening-time', opening);
    await snapshot(page, bridgeFrames, 'bridge-open');
  }
  return proposed.state;
}

async function unscored(page: Page, level: Level, turn: number, undos: number) {
  await expect(page.locator('#dialog[open]')).toHaveAttribute('data-outcome', 'won');
  await expect(page.locator('.arrival-unrated')).toHaveText('Rescued · no lantern rating');
  await expect(page.locator('.arrival-lantern, #mastery-result')).toHaveCount(0);
  await expect(page.locator('.arrival-result')).toHaveAttribute('data-actions', String(turn));
  await expect(page.locator('.arrival-result')).toHaveAttribute('data-undos', String(undos));
  await expect(page.locator('.arrival-name')).toHaveText(level.objective.requiredPassengerIds.map(i => passengerName(i, level)));
  await fullyVisible(page, page.locator('#terminal-undo'));
}

async function inspectBridge(page: Page, before: State, closed: boolean, out?: string) {
  await selectStop(page, 'harbor');
  const sail = page.locator('#sail');
  if (closed) {
    await expect(sail).toBeDisabled();
    await expect(page.locator('#local-context .location-reason')).toContainText(/closed/i);
  } else {
    await expect(sail).toBeEnabled();
  }
  if (out) await snapshot(page, out, closed ? 'closed-passage' : 'open-passage');
  await checkTurn(page, before, false);
  await activate(page, 'close-location', true);
  await localView(page);
}

async function recoverEarlyOpening(page: Page, level: Level, out: string) {
  const start = initial(level);
  await openPreview(page, start);
  await activate(page, 'cancel', true);
  await expect(page.locator('#undo')).toBeDisabled();
  await inspectBridge(page, start, true);
  const early = await playStep(page, level, { type: 'open-bridge' }, start);
  await inspectBridge(page, early, false);
  await selectStop(page, 'wick');
  await expect(page.locator('#sail')).toBeEnabled();
  await snapshot(page, out, 'early-opening-next-action');
  await activate(page, 'sail', true);
  await idle(page);
  const lost = preview(early, { type: 'move', to: 'wick' }, level).state;
  expect(lost.status).toBe('lost');
  await checkTurn(page, lost, false);
  await expect(page.locator('#dialog[open]')).toContainText('Tallow');
  await snapshot(page, out, 'early-opening-loss');
  await undo(page, true);
  await checkTurn(page, early, false);
  await inspectBridge(page, early, false);
  await undo(page, true);
  await checkTurn(page, start, false);
  await expect(page.locator('#undo')).toBeDisabled();
  await inspectBridge(page, start, true);
  return { early, lost, recovered: 'Turn 00, bridge closed, Undo disabled' };
}

for (const [width, height, shortcut] of [[390, 844, true], [780, 320, false]] as const) {
  const size = width + 'x' + height;
  test('Release touch rescue via ' + (shortcut ? 'shortcut' : 'detour') + ' at ' + size, async ({ page, browser }) => {
    const { level, witnesses } = candidate(id);
    const route = witnesses.find(w => w.actions.some(a => a.type === 'open-bridge') === shortcut)!;
    expect(route).toBeTruthy();
    const source = runtimeSource(), out = directory(size), errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: shortcut ? 'no-preference' : 'reduce' });
    if (shortcut) await monitorOutput(page);
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
    await snapshot(page, out, 'start-overview');
    await localView(page);
    const start = initial(level);
    await inspectBridge(page, start, true, out);
    const earlyOpening = shortcut ? null : await recoverEarlyOpening(page, level, out);
    const recoveryUndos = earlyOpening ? 2 : 0;
    let stopRecording: (() => Promise<void>) | undefined;
    if (shortcut && process.env.BRIDGE_RECORD !== '0') {
      await expect.poll(() => page.evaluate(() => (window as any).__lastFerryMonitoredContext?.state)).toBe('running');
      stopRecording = await recordRescue(page, out, 'final-arrival', true);
    }
    const timeline = [initial(level)];
    try {
      for (const action of route.actions) {
        const before = timeline.at(-1)!;
        const next = await playStep(page, level, action, before, action.type === 'open-bridge' ? out : undefined);
        timeline.push(next);
        if (action.type === 'open-bridge') await inspectBridge(page, next, false, out);
        if (!shortcut && next.turn === Math.ceil(route.actions.length / 2)) await snapshot(page, out, 'detour');
      }
      const terminal = timeline.at(-1)!;
      await unscored(page, level, terminal.turn, recoveryUndos);
      await snapshot(page, out, 'arrival');
      if (stopRecording) {
        await page.waitForTimeout(600);
        const finish = stopRecording;
        stopRecording = undefined;
        await finish();
      }
      const beforeDelivery = timeline.at(-2)!;
      await undo(page, true);
      await checkTurn(page, beforeDelivery, false);
      await expect(page.locator('#dialog[open][data-outcome=won]')).toHaveCount(0);
      await playStep(page, level, route.actions.at(-1)!, beforeDelivery);
      await unscored(page, level, terminal.turn, recoveryUndos + 1);
    } finally {
      if (stopRecording) await stopRecording();
    }
    expect(errors).toEqual([]);
    expect(runtimeSource().sha256).toBe(source.sha256);
    const tests = Object.fromEntries(['reviews/lantern-reach/gameplay.spec.ts', 'reviews/lantern-reach/gameplay.config.ts', 'tests/e2e/cove-eight-support.ts', 'tests/e2e/large-cove-support.ts', 'tests/e2e/ui.ts', 'tests/e2e/three-lanterns-support.ts'].map(file => [file, hash(readFileSync(file))]));
    report(directory('source'), source.sha256, { head: source.head, inputs: source.inputs, sha256: source.sha256, tests, build, browser: browser.version(), node: process.version, os: process.platform, input: 'Chromium touch emulation, DPR 1, SwiftShader' });
    report(out, 'actual-route', { source: source.sha256, build, route: route.id, actions: route.actions, timeline, earlyOpening, terminalUndoAndRedelivery: true, errors, time: new Date().toISOString(), stateMethod: 'Production reducer expectations compared to visible release turn, tide, local map/action controls, terminal status and arrival roster. No debug API.' });
  });
}
