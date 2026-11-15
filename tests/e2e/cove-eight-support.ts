import { expect, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { initial, preview, type Action, type State } from '../../src/game/rules';
import type { Level } from '../../src/levels/level';
import { activate, fullyVisible, idle, state, wholeCove } from './ui';
import { checkTurn, directory, localView, report, snapshot, transferStart } from './large-cove-support';
import { completed, scenes, runtimeSource, storage } from './three-lanterns-support';

export const seven = [...completed, 'orchard-landing'];
export const sevenScenes = [...scenes, 'orchard-paths'];
export const completeSeven = JSON.stringify({ version: 1, completed: seven, acknowledgedScenes: sevenScenes, checkpoint: { kind: 'complete' } }, null, 2) + '\n';
export const acceptedBest: string = JSON.parse(readFileSync('reviews/three-lanterns/release/accepted.json', 'utf8')).saved.mastery;
export const recordOnly = process.env.LAST_FERRY_C8_RECORD_ONLY === '1';

export function sources() {
  const current = runtimeSource();
  const tests = Object.fromEntries([
    'tests/e2e/cove-eight-practice.spec.ts', 'tests/e2e/cove-eight-support.ts',
    'tests/e2e/three-lanterns-support.ts', 'tests/e2e/large-cove-support.ts',
    'tests/e2e/ui.ts', 'tests/e2e/story-support.ts', 'playwright.config.ts',
  ].map(path => [path, createHash('sha256').update(readFileSync(path)).digest('hex')]));
  return { ...current, tests };
}

export function candidate(id: string) {
  const level: Level = JSON.parse(readFileSync('data/' + id + '.level.json', 'utf8'));
  const data = JSON.parse(readFileSync('data/' + id + '/witnesses.json', 'utf8'));
  return { level, witnesses: data.witnesses as { id: string; actions: Action[] }[] };
}

export async function capture(page: Page, folder: string, name: string) {
  if (!recordOnly) await snapshot(page, directory(folder), name);
  const fit = await page.evaluate(() => {
    const failures: string[] = [];
    const dialog = document.querySelector<HTMLElement>('#dialog[open]');
    const controls = [...document.querySelectorAll<HTMLElement>(dialog ? '#dialog button:not([hidden]), #dialog select' : '#menu, #undo, #load-toggle, #view-toggle, #view-zoom')];
    const measurements = controls.filter(el => el.getBoundingClientRect().width && getComputedStyle(el).visibility !== 'hidden').map(el => {
      const bounds = el.getBoundingClientRect();
      return { id: el.id, rect: bounds.toJSON(), font: getComputedStyle(el).fontSize };
    });
    const scope = dialog ?? document.getElementById('app')!;
    for (const el of [scope, ...scope.querySelectorAll<HTMLElement>('*')]) {
      const closed = el.closest('details:not([open])');
      if (closed && !el.closest('summary') && closed !== el) continue;
      if (el.closest('.sr-only') || !el.getBoundingClientRect().width || getComputedStyle(el).display === 'inline') continue;
      if (dialog && el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1) failures.push((el.id || el.className) + ': horizontal overflow');
    }
    if (document.documentElement.scrollWidth > innerWidth) failures.push('page horizontal overflow');
    return { viewport: [innerWidth, innerHeight], measurements, failures };
  });
  expect(fit.failures).toEqual([]);
  report(directory(folder), name + '-fit', fit);
}

export async function startCheck(page: Page, level: Level, development = true) {
  await idle(page);
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label', level.title);
  await expect(page.locator('[data-testid=turn]')).toHaveText('00');
  await expect(page.locator('#undo')).toBeDisabled();
  for (const id of ['menu', 'undo', 'load-toggle', 'view-toggle', 'view-zoom'])
    await fullyVisible(page, page.locator('#' + id));
  if (development) expect(await state(page)).toEqual(initial(level));
}

export async function execute(page: Page, level: Level, action: Action, before: State, development = true, previewCapture?: () => Promise<void>) {
  const proposed = preview(before, action, level);
  expect(proposed.error).toBeNull();
  if (proposed.state.status !== 'playing') await localView(page);
  if (action.type === 'move') {
    await wholeCove(page, true);
    await page.locator('#map-' + action.to + ' .map-hit').tap();
    await fullyVisible(page, page.locator('#sail'));
    if (development) expect(await state(page)).toEqual(before);
    if (previewCapture) await previewCapture();
    await activate(page, 'sail', true);
  } else if (action.type === 'wait') {
    await activate(page, 'wait', true);
    if (development) expect(await state(page)).toEqual(before);
    if (previewCapture) await previewCapture();
    await activate(page, 'commit', true);
  } else {
    await localView(page);
    await transferStart(page, action, async () => {
    if (development) expect(await state(page)).toEqual(before);
    await fullyVisible(page, page.locator('#commit'));
    for (const tile of await page.locator('.passenger-options button').all()) {
      const labelsFit = await tile.evaluate(el => {
        const box = el.getBoundingClientRect();
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          if (!node.textContent?.trim()) continue;
          const range = document.createRange(); range.selectNodeContents(node);
          if ([...range.getClientRects()].some(r => r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1)) return false;
        }
        return true;
      });
      expect(labelsFit).toBe(true);
    }
    if (previewCapture) await previewCapture();
    });
  }
  await idle(page);
  await checkTurn(page, proposed.state, development);
  const all = [...proposed.state.aboard, ...proposed.state.delivered, ...Object.values(proposed.state.waitingByPier).flat()];
  expect([...all].sort()).toEqual(level.passengers.map(p => p.id).sort());
  expect(new Set(all).size).toBe(all.length);
  return development ? await state(page) : proposed.state;
}

export async function replay(page: Page, level: Level, actions: Action[], development = true, from = initial(level)) {
  const states: State[] = [];
  let current = from;
  for (const action of actions) {
    current = await execute(page, level, action, current, development);
    states.push(current);
  }
  return states;
}

export async function scoredWin(page: Page, turn: number, undos = 0) {
  await expect(page.locator('#dialog[open]')).toHaveAttribute('data-outcome', 'won');
  await expect(page.locator('#mastery-result')).toHaveAttribute('data-actions', String(turn));
  await expect(page.locator('#mastery-result')).toHaveAttribute('data-undos', String(undos));
  await expect(page.locator('#mastery-result')).toHaveAttribute('data-lanterns', undos ? '2' : '3');
  await expect(page.locator('#arrival-cast li')).toHaveCount(4);
  await fullyVisible(page, page.locator('#terminal-undo'));
  await fullyVisible(page, page.locator('#terminal-restart'));
  await fullyVisible(page, page.locator('#choose-cove'));
  expect((await storage(page)).mastery).toBe(acceptedBest);
  expect((await storage(page)).masteryWrites).toBe(0);
}

export async function scoredMenu(page: Page) {
  await activate(page, 'menu', true);
  await expect(page.locator('.mastery-criteria summary')).toContainText('14 actions');
  await page.keyboard.press('Escape');
}
