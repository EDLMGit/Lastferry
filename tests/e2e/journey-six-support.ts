import { expect, type Page } from '@playwright/test';
import { copyFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { initial, type Action, type State } from '../../src/game/rules';
import type { Level } from '../../src/levels/level';
import { activate, fullyVisible, idle, state, undo } from './ui';
import { coldTouch, journeyKey, passive } from './story-support';
import { action, tipsKey } from './optional-tips-support';
import { directory, report, snapshot } from './large-cove-support';

export const route = ['holding-pier', 'bellwater', 'driftwood-yard', 'two-shelters', 'wide-berth', 'reef-return'] as const;
export const scenes = ['opening', 'another-bell', 'driftwood-light', 'among-the-reeds', 'a-wider-deck', 'lights-beyond-the-reef'] as const;
export const backupKey = 'last-ferry.journey.v1.before-six-coves';
export const oldRoute = ['holding-pier', 'bellwater', 'driftwood-yard', 'wide-berth'];
export const oldScenes = ['opening', 'another-bell', 'driftwood-light', 'a-wider-deck'];

export function oldRecord(completedCount: number, checkpoint: { kind: string; id?: string }, seen = completedCount) {
  return JSON.stringify({
    version: 1, completed: oldRoute.slice(0, completedCount),
    acknowledgedScenes: oldScenes.slice(0, seen), checkpoint,
  }, null, 2) + '\n';
}

export async function seed(page: Page, raw: string) {
  await page.addInitScript(({ key, raw }) => {
    if (!location.protocol.startsWith('http')) return;
    if (sessionStorage.getItem('six-cove-fixture') === null) {
      localStorage.setItem(key, raw);
      sessionStorage.setItem('six-cove-fixture', '1');
    }
  }, { key: journeyKey, raw });
}

export const stored = (page: Page, key = journeyKey) => passive(page, key => localStorage.getItem(key), key);
export const timeline = (page: Page) => passive(page, () => (window as any).__LAST_FERRY__.getStoryStatus().timeline);
export const campaign = (page: Page) => passive(page, () => (window as any).__LAST_FERRY__.getCampaignStatus());
export const audio = (page: Page) => passive(page, () => (window as any).__LAST_FERRY__.getAudioStatus());
export const record = async (page: Page) => JSON.parse((await stored(page))!);
const levelFor = (id: string): Level => JSON.parse(readFileSync('data/' + id + '.level.json', 'utf8'));

export async function startCheck(page: Page, id: string) {
  await idle(page);
  const level = levelFor(id);
  expect(await state(page)).toEqual(initial(level));
  expect(await campaign(page)).toMatchObject({ active: true, entry: 'journey', level: id });
  expect((await campaign(page)).progress.record.checkpoint).toEqual({ kind: 'cove', id });
  expect(await passive(page, () => (window as any).__LAST_FERRY__.getRenderStatus().historyLength)).toBe(0);
  await expect(page.locator('#undo')).toBeDisabled();
  await expect(page.locator('#load-toggle')).toContainText('/' + level.rules.capacity);
  expect(await stored(page, tipsKey)).toBeNull();
}

export async function rescue(page: Page, id: string, undoBoundaries: boolean) {
  await startCheck(page, id);
  const level = levelFor(id);
  const actions: Action[] = id === 'holding-pier'
    ? JSON.parse(readFileSync('data/experiments/holding-pier-solution.json', 'utf8')).actions
    : JSON.parse(readFileSync('data/' + id + '/witnesses.json', 'utf8')).witnesses[0].actions;
  const checkpoint = await stored(page);
  let tideUndone = false;
  let terminalUndone = false;
  for (const step of actions) {
    const before = await state(page) as State;
    const after = await action(page, step, level);
    if (undoBoundaries && ((!tideUndone && after.tideLevel > before.tideLevel) || after.status === 'won')) {
      await undo(page, true);
      expect(await state(page)).toEqual(before);
      expect(await stored(page)).toBe(checkpoint);
      await action(page, step, level);
      if (after.status === 'won') terminalUndone = true;
      else tideUndone = true;
    }
  }
  await expect(page.locator('#continue-story')).toBeVisible();
  expect((await state(page)).status).toBe('won');
  expect(await stored(page)).toBe(checkpoint);
  if (undoBoundaries) expect([tideUndone, terminalUndone]).toEqual([true, true]);
  return { id, steps: actions.length, tideUndone, terminalUndone, checkpoint, capacity: level.rules.capacity };
}

export async function inspectScene(page: Page, destination: 'two-shelters' | 'reef-return', keyboard: boolean) {
  const dir = directory(destination);
  const index = route.indexOf(destination);
  const scene = scenes[index];
  const size = page.viewportSize()!;
  const label = size.width + 'x' + size.height;
  const pending = await stored(page);
  const initialState = await state(page);
  const sample = () => passive(page, () => {
    const frame = (window as any).__LAST_FERRY__.getStoryStatus().timeline;
    return { ...frame, epoch: performance.timeOrigin + performance.now() };
  });
  const capture = async (name: string) => {
    const before = await sample();
    const fromMovie = !keyboard && name !== 'end';
    if (fromMovie) await page.waitForTimeout(100);
    else await snapshot(page, dir, label + '-' + name);
    const after = await sample();
    const observation = { name, before, after, fromMovie, wallMs: after.epoch - before.epoch };
    report(dir, label + '-' + name + '-timing', observation);
    return observation;
  };
  await expect(page.locator('#story-continue')).toBeEnabled();
  const begin = await capture('begin');
  expect(begin.before).toMatchObject({ scene, settled: false, recap: false });
  expect(begin.before.elapsed).toBeLessThan(1050);
  expect((await campaign(page)).level).toBe(route[index - 1]);
  const world = await passive(page, () => (window as any).__LAST_FERRY__.getStoryStatus().world);
  const predecessors = levelFor(route[index - 1]).passengers.map(p => p.id).sort();
  expect(world.subjects.map((s: { id: string }) => s.id).filter((id: string) => !['ferry', 'lighthouse'].includes(id)).sort()).toEqual(predecessors);
  if (keyboard) {
    await page.locator('#story-pause').tap();
    const held = await timeline(page);
    expect(held.paused).toBe(true);
    await page.waitForTimeout(250);
    expect((await timeline(page)).elapsed).toBe(held.elapsed);
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await timeline(page)).elapsed).toBeGreaterThan(held.elapsed);
  }
  const acknowledgment = destination === 'reef-return' ? 3950 : 3200;
  const advancing = await sample();
  await page.waitForTimeout(Math.max(0, acknowledgment - advancing.elapsed));
  if (keyboard) await coldTouch(page, 'story-pause');
  const beat = await capture('action');
  expect(beat.before.elapsed).toBeGreaterThan(acknowledgment - 500);
  expect(beat.before.elapsed).toBeLessThan(5400);
  expect(beat.before.settled).toBe(false);
  expect(beat.after.settled).toBe(false);
  if (keyboard) {
    expect(beat.before.paused).toBe(true);
    expect(beat.after.elapsed).toBe(beat.before.elapsed);
    await coldTouch(page, 'story-pause');
  }
  await expect(page.locator('#story-pause')).toBeDisabled({ timeout: 12000 });
  const end = await capture('end');
  expect(end.before.elapsed).toBe(end.before.duration);
  expect(end.before.interruptionGap).toBe(0);
  await fullyVisible(page, page.locator('#story-continue'));
  const fit = await page.locator('#story-caption').evaluate(el => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const fragments = [...range.getClientRects()].map(r => r.toJSON());
    const picture = el.closest('.story-picture')!.getBoundingClientRect();
    return {
      fontSize: parseFloat(getComputedStyle(el).fontSize), text: el.textContent,
      fragments, allInside: fragments.every(r => r.left >= picture.left - 1 && r.top >= picture.top - 1 &&
        r.right <= picture.right + 1 && r.bottom <= picture.bottom + 1),
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  expect(fit.allInside).toBe(true);
  expect(fit.overflow).toBe(false);
  expect(fit.fontSize).toBeGreaterThanOrEqual(14);
  const sound = await audio(page);
  expect(sound.contextCount).toBe(1);
  expect(sound.lastStoryCue).toMatchObject({ played: true });
  expect(sound.lastStoryCue.id).toContain(scene);
  expect(sound.storyToken).toBeNull();
  expect(await stored(page)).toBe(pending);
  expect(await state(page)).toEqual(initialState);
  report(dir, label + '-scene', { begin, beat, end, fit, predecessor: route[index - 1], predecessors, sound, pending });
}

export function keepRecordedPictures(dir: string) {
  const movie = JSON.parse(readFileSync(join(dir, 'two-shelters-to-reef-recording.json'), 'utf8'));
  const frames = movie.frames as { timestamp: number; path: string }[];
  for (const cove of ['two-shelters', 'reef-return']) {
    const images = directory(cove);
    for (const beat of ['begin', 'action']) {
      const name = '390x844-' + beat;
      const { before, after } = JSON.parse(readFileSync(join(images, name + '-timing.json'), 'utf8'));
      const target = (before.epoch + after.epoch) / 2;
      const phase = beat === 'begin' ? [0, 1050] : cove === 'two-shelters' ? [2650, 3950] : [3050, 5150];
      const elapsedAt = (timestamp: number) => before.elapsed + (timestamp * 1000 - before.epoch);
      const candidates = frames.filter(frame => elapsedAt(frame.timestamp) >= phase[0] && elapsedAt(frame.timestamp) < phase[1]);
      expect(candidates.length).toBeGreaterThan(0);
      const nearest = candidates.reduce((best, item) =>
        Math.abs(item.timestamp * 1000 - target) < Math.abs(best.timestamp * 1000 - target) ? item : best);
      const deltaMs = nearest.timestamp * 1000 - target;
      copyFileSync(nearest.path, join(images, name + '.jpg'));
      report(images, name + '-frame', { nearest, deltaMs, target, phase, elapsedMs: elapsedAt(nearest.timestamp), before, after });
    }
  }
}
