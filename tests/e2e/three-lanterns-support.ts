import { expect, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { initial, preview, type Action, type State } from '../../src/game/rules';
import type { Level } from '../../src/levels/level';
import { checkTurn, directory, localView, report, snapshot, transferStart } from './large-cove-support';
import { activate, fullyVisible, idle, wholeCove } from './ui';
import { journeyKey } from './story-support';

export const masteryKey = 'last-ferry.mastery.v1';
export const completed = ['holding-pier', 'bellwater', 'driftwood-yard', 'two-shelters', 'wide-berth', 'reef-return'];
export const scenes = ['opening', 'another-bell', 'driftwood-light', 'among-the-reeds', 'a-wider-deck', 'lights-beyond-the-reef'];
export const ongoing = JSON.stringify({ version: 1, completed: completed.slice(0, 1), acknowledgedScenes: scenes.slice(0, 2), checkpoint: { kind: 'cove', id: 'bellwater' } }, null, 2) + '\n';
export const completeSix = JSON.stringify({ version: 1, completed, acknowledgedScenes: scenes, checkpoint: { kind: 'complete' } }, null, 2) + '\n';
export const legacyTwo = JSON.stringify({ version: 1, completed: completed.slice(0, 2), acknowledgedScenes: scenes.slice(0, 2), checkpoint: { kind: 'complete' } }, null, 2) + '\n';

export function runtimeSource() {
  const paths = ['index.html', 'package.json', 'package-lock.json', 'vite.config.ts'];
  for (const root of ['src', 'data', 'assets', 'cove-ui-package/ui', 'cove-panel-package/material', 'cove-portrait-package/portraits'])
    for (const file of readdirSync(root, { recursive: true, encoding: 'utf8' }))
      if (/\.(ts|css|json|svg|png)$/.test(file) && !file.endsWith('catalog.json'))
        paths.push(root + '/' + file.replaceAll('\\', '/'));
  const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
  const inputs = Object.fromEntries(paths.sort().map(path => [path, hash(readFileSync(path))]));
  return {
    inputs, sha256: hash(JSON.stringify(inputs)),
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    tests: Object.fromEntries([
      'tests/e2e/three-lanterns.spec.ts', 'tests/e2e/three-lanterns-support.ts',
      'tests/e2e/large-cove-support.ts', 'tests/e2e/ui.ts', 'tests/e2e/story-support.ts',
      'playwright.config.ts',
    ].map(path => [path, hash(readFileSync(path))])),
  };
}

export async function fixture(page: Page, journey?: string, mastery?: string, denyWrites = false) {
  await page.addInitScript(({ journey, mastery, denyWrites, journeyKey, masteryKey }) => {
    if (!location.protocol.startsWith('http')) return;
    const original = Storage.prototype.setItem;
    if (!sessionStorage.getItem('lantern-fixture')) {
      if (journey !== undefined) original.call(localStorage, journeyKey, journey);
      if (mastery !== undefined) original.call(localStorage, masteryKey, mastery);
      original.call(sessionStorage, 'lantern-fixture', '1');
      original.call(sessionStorage, 'mastery-writes', '0');
      original.call(sessionStorage, 'journey-writes', '0');
    }
    Storage.prototype.setItem = function(key, value) {
      if (this === localStorage && key === masteryKey) {
        original.call(sessionStorage, 'mastery-writes', String(Number(sessionStorage.getItem('mastery-writes')) + 1));
        if (denyWrites) throw new DOMException('Test quota', 'QuotaExceededError');
      }
      if (this === localStorage && key.startsWith(journeyKey))
        original.call(sessionStorage, 'journey-writes', String(Number(sessionStorage.getItem('journey-writes')) + 1));
      return original.call(this, key, value);
    };
  }, { journey, mastery, denyWrites, journeyKey, masteryKey });
}

export const storage = (page: Page) => page.evaluate(({ journeyKey, masteryKey }) => ({
  mastery: localStorage.getItem(masteryKey), journey: localStorage.getItem(journeyKey),
  masteryWrites: Number(sessionStorage.getItem('mastery-writes')),
  journeyWrites: Number(sessionStorage.getItem('journey-writes')),
}), { journeyKey, masteryKey });

export async function untouched(page: Page, original: string) {
  const saved = await storage(page);
  expect(saved.journey).toBe(original);
  expect(saved.journeyWrites).toBe(0);
}

export function witness(id: string, index = 0) {
  const path = id === 'holding-pier' ? 'data/experiments/holding-pier-solution.json' : 'data/' + id + '/witnesses.json';
  const data = JSON.parse(readFileSync(path, 'utf8'));
  return (data.actions ?? data.witnesses[index].actions) as Action[];
}

export async function run(page: Page, level: Level, actions: Action[], development = true, before = initial(level)) {
  const states: State[] = [];
  let expected = before;
  for (const action of actions) {
    const next = preview(expected, action, level);
    expect(next.error).toBeNull();
    if (next.state.status === 'won') await localView(page);
    if (action.type === 'move') {
      await wholeCove(page, true);
      await page.locator('#map-' + action.to + ' .map-hit').tap();
      await fullyVisible(page, page.locator('#sail'));
      await activate(page, 'sail', true);
    } else if (action.type === 'wait') {
      await activate(page, 'wait', true);
      await activate(page, 'commit', true);
    } else await transferStart(page, action);
    await idle(page);
    expected = next.state;
    await checkTurn(page, expected, development);
    states.push(expected);
  }
  return states;
}

export async function result(page: Page, lanterns: number, actions: number, undos: number) {
  const card = page.locator('#mastery-result');
  await expect(page.locator('#dialog[open]')).toHaveAttribute('data-outcome', 'won');
  await expect(card).toHaveAttribute('data-lanterns', String(lanterns));
  await expect(card).toHaveAttribute('data-actions', String(actions));
  await expect(card).toHaveAttribute('data-undos', String(undos));
  await expect(card).toContainText('This rescue');
  await card.locator('.mastery-metrics').scrollIntoViewIfNeeded();
  await fullyVisible(page, card.locator('.mastery-metrics'), false);
  const primary = page.locator('#continue-story, #next-cove, #choose-cove');
  await fullyVisible(page, primary);
  await fullyVisible(page, page.locator('#terminal-undo'));
  await fullyVisible(page, page.locator('#terminal-restart'));
}

export async function frame(page: Page, folder: string, name: string) {
  await page.evaluate(() => new Promise<void>(resolve =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  const measurement = await page.locator('#dialog[open]').evaluate(dialog => {
    const failures: string[] = [];
    for (const el of [dialog, ...dialog.querySelectorAll<HTMLElement>('*')]) {
      const bounds = el.getBoundingClientRect(), style = getComputedStyle(el);
      if (!bounds.width || el.closest('.sr-only') || style.display === 'inline') continue;
      if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0)
        failures.push((el.id || el.className) + ' horizontal overflow');
    }
    const root = document.documentElement;
    if (root.scrollWidth > innerWidth) failures.push('page horizontal overflow');
    return { failures, viewport: [innerWidth, innerHeight], dialog: dialog.getBoundingClientRect().toJSON() };
  });
  expect(measurement.failures).toEqual([]);
  await snapshot(page, directory(folder), name);
  report(directory(folder), name + '-fit', measurement);
}

export async function acceptanceUnchanged(page: Page, expected: string | null = null) {
  expect((await storage(page)).mastery).toBe(expected);
}

export async function skipStory(page: Page) {
  await page.locator('#story-more summary').tap();
  await activate(page, 'story-skip', true);
}

export async function home(page: Page, won = false) {
  if (won) await page.keyboard.press('Escape');
  await activate(page, 'menu', true);
  await activate(page, 'journey-return', true);
  await activate(page, 'journey-return-confirm', true);
  await expect(page.locator('#home-practice')).toBeVisible();
}
