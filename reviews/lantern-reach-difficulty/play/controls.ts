import { expect, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { bridgeStatus, draft, load, preview, type Action, type State } from '../../../src/game/rules';
import { nodeName, passengerName, type Level } from '../../../src/levels/level';

import { execute } from '../../../tests/e2e/cove-eight-support';
import { checkTurn, localView, snapshot } from '../../../tests/e2e/large-cove-support';
import { activate, fullyVisible, idle, wholeCove } from '../../../tests/e2e/ui';

export const hash = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
export async function servedBuild(page: Page) {
  const paths = await page.locator('head script[type=module][src], head link[rel=stylesheet][href]').evaluateAll(els =>
    els.map(el => el.getAttribute('src') ?? el.getAttribute('href')!));
  expect(paths.some(path => /assets\/index-.+\.js$/.test(path))).toBe(true);
  expect(await page.evaluate(() => '__LAST_FERRY__' in window)).toBe(false);
  const assets: Record<string, string> = {};
  for (const path of paths) {
    assets[path] = hash(await (await page.request.get(path)).body());
    expect(assets[path]).toBe(hash(readFileSync(join(process.env.REACH_DIST ?? 'dist', path.replace(/^\.?\//, '')))));
  }
  return assets;
}

export async function listenToOutput(page: Page) {
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

export async function selectStop(page: Page, id: string) {
  const hit = page.locator('#map-' + id + ' .map-hit');
  const tappable = await hit.evaluate(el => {
    const r = el.getBoundingClientRect();
    return !el.closest('.offscreen') && r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight
      && el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
  });
  if (!tappable) await wholeCove(page, true);
  try {
    await hit.tap({ timeout: 1400 });
  } catch (error) {
    if (!(error instanceof Error) || error.name !== 'TimeoutError') throw error;
    await wholeCove(page, true);
    await hit.tap();
  }
  await expect(page.locator('#local-context')).toBeVisible();
}

export async function expectState(page: Page, level: Level, state: State) {
  await checkTurn(page, state, false);
  if (state.status === 'playing') {
    await expect(page.locator('#map-' + state.boatNodeId)).toHaveAttribute('aria-current', 'location');
    await expect(page.locator('#load-toggle')).toHaveAccessibleName(
      `${load(state, level)} of ${level.rules.capacity} spaces · boat needs depth ${draft(state, level)} · crossing status`);
  }
}

export async function forecast(page: Page, level: Level, state: State, out?: string, name = 'forecast') {
  await activate(page, 'status-toggle', true);
  const facts = page.locator('#dialog[open] .forecast-detail');
  await expect(facts).toContainText(bridgeStatus(state, level));
  for (const pier of level.piers) {
    const ids = state.waitingByPier[pier.id];
    if (!ids?.length) continue;
    const row = facts.locator('[aria-label="Waiting passengers"] li').filter({ hasText: nodeName(pier.nodeId, level) });
    const slots = level.passengers.filter(p => ids.includes(p.id)).reduce((sum,p) => sum+p.slots,0);
    await expect(row).toContainText(`(${slots} ${slots === 1 ? 'space' : 'spaces'})`);
    for (const id of ids) await expect(row).toContainText(passengerName(id,level));
  }
  const text = await facts.innerText();
  if (out) await snapshot(page, out, name);
  await activate(page, 'cancel', true);
  await expectState(page, level, state);
  return text;
}

export async function step(page: Page, level: Level, action: Action, before: State, showPreview?: () => Promise<void>) {
  const result = preview(before, action, level);
  expect(result.error).toBeNull();
  if (action.type === 'move') {
    await selectStop(page, action.to);
    await fullyVisible(page, page.locator('#sail'));
    await expect(page.locator('#sail')).toHaveAccessibleName(new RegExp(nodeName(action.to, level)));
    if (showPreview) await showPreview();
    await activate(page, 'sail', true);
  } else {
    await execute(page, level, action, before, false, showPreview);
  }
  await idle(page);
  await expectState(page, level, result.state);
  if (result.state.status === 'playing') await localView(page);
  return result.state;
}

export async function checkWon(page: Page, level: Level, state: State, undos: number) {
  expect(state.status).toBe('won');
  await expect(page.locator('#dialog[open]')).toHaveAttribute('data-outcome','won');
  await expect(page.locator('.arrival-unrated')).toHaveText('Rescued · no lantern rating');
  await expect(page.locator('.arrival-lantern, #mastery-result')).toHaveCount(0);
  await expect(page.locator('.arrival-result')).toHaveAttribute('data-actions', String(state.turn));
  await expect(page.locator('.arrival-result')).toHaveAttribute('data-undos', String(undos));
  await expect(page.locator('.arrival-name')).toHaveText(level.objective.requiredPassengerIds.map(id => passengerName(id, level)));
}
