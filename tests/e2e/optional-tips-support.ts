import { expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { initial, preview, type Action, type State } from '../../src/game/rules';
import type { Level } from '../../src/levels/level';
import { activate, fullyVisible, idle, state, wholeCove } from './ui';
import { checkTurn, transferStart } from './large-cove-support';

export const tipsKey = 'last-ferry-tips';
export const savedJourney = JSON.stringify({
  version: 1,
  completed: ['holding-pier', 'bellwater', 'driftwood-yard'],
  acknowledgedScenes: ['opening', 'another-bell', 'driftwood-light'],
  checkpoint: { kind: 'scene', id: 'a-wider-deck' },
}, null, 2);

export function coveData(id: string) {
  const level: Level = JSON.parse(readFileSync('data/' + id + '.level.json', 'utf8'));
  const witnesses = JSON.parse(readFileSync('data/' + id + '/witnesses.json', 'utf8'));
  return { level, actions: witnesses.witnesses[0].actions as Action[] };
}

export async function settings(page: Page) {
  await activate(page, 'menu', true);
  await activate(page, 'settings', true);
  await expect(page.getByRole('combobox', { name: 'Tips', exact: true })).toHaveAttribute('id', 'tips-preference');
}

export async function setTips(page: Page, on: boolean) {
  const before = await state(page);
  await settings(page);
  await page.locator('#tips-preference').selectOption(on ? 'on' : 'off');
  await expect(page.locator('#tips-preference')).toHaveValue(on ? 'on' : 'off');
  await page.locator('#tips-preference').scrollIntoViewIfNeeded();
  await fullyVisible(page, page.locator('#tips-preference'));
  await activate(page, 'settings-back', true);
  await activate(page, 'cancel', true);
  expect(await state(page)).toEqual(before);
  return before as State;
}

export async function selectRoute(page: Page, to: string) {
  await wholeCove(page, true);
  const marker = page.locator('#map-' + to);
  await marker.locator('.map-hit').tap();
  await expect(page.locator('#local-context')).toBeVisible();
  await fullyVisible(page, page.locator('#sail'));
}

export async function chooseTransfer(page: Page, type: 'board' | 'unload', ids: string[]) {
  await activate(page, type, true);
  await expect(page.locator('#dialog')).toHaveAttribute('data-mode', 'action');
  for (const choice of await page.locator('.passenger-options button').all()) {
    const id = (await choice.getAttribute('id'))!.slice('passenger-'.length);
    if (((await choice.getAttribute('aria-pressed')) === 'true') !== ids.includes(id))
      await choice.tap();
  }
  await fullyVisible(page, page.locator('#commit'));
}

export async function action(page: Page, next: Action, level: Level) {
  const before = await state(page) as State;
  const proposed = preview(before, next, level);
  expect(proposed.error).toBeNull();
  if (next.type === 'move') {
    await selectRoute(page, next.to);
    await activate(page, 'sail', true);
  } else if (next.type === 'wait') {
    await activate(page, 'wait', true);
    await activate(page, 'commit', true);
  } else await transferStart(page, next);
  await idle(page);
  await checkTurn(page, proposed.state, true);
  return proposed.state;
}

export async function replay(page: Page, actions: Action[], level: Level) {
  let expected = initial(level);
  for (const next of actions) expected = await action(page, next, level);
  return expected;
}
