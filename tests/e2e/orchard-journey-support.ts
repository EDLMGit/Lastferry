import { expect, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { initial } from '../../src/game/rules';
import { orchardLanding } from '../../src/levels/level';
import { activate, fullyVisible, idle, state } from './ui';
import { directory, report, snapshot } from './large-cove-support';
import { runtimeSource, completed, scenes, storage } from './three-lanterns-support';
import { audio, campaign, timeline } from './journey-six-support';

export const orchardScene = 'orchard-paths';
export const backupKey = 'last-ferry.journey.v1.before-orchard';
export const seven = [...completed, 'orchard-landing'];
export const sevenScenes = [...scenes, orchardScene];
export const reefCheckpoint = JSON.stringify({ version: 1, completed: completed.slice(0, -1), acknowledgedScenes: scenes, checkpoint: { kind: 'cove', id: 'reef-return' } }, null, 2) + '\n';
export const pendingOrchard = JSON.stringify({ version: 1, completed, acknowledgedScenes: scenes, checkpoint: { kind: 'scene', id: orchardScene } }, null, 2) + '\n';
export const acceptedBest: string = JSON.parse(readFileSync('reviews/three-lanterns/release/accepted.json', 'utf8')).saved.mastery;
export const record = async (page: Page) => JSON.parse((await storage(page)).journey!);
export const mastery = (page: Page) => page.evaluate(() => (window as any).__LAST_FERRY__.getMasteryStatus());

export function source() {
  const current = runtimeSource();
  const tests = Object.fromEntries([
    'tests/e2e/orchard-journey.spec.ts', 'tests/e2e/orchard-journey-support.ts',
    'tests/e2e/three-lanterns-support.ts', 'tests/e2e/journey-six-support.ts',
    'tests/e2e/large-cove-support.ts', 'tests/e2e/ui.ts', 'tests/e2e/story-support.ts',
    'playwright.config.ts',
  ].map(path => [path, createHash('sha256').update(readFileSync(path)).digest('hex')]));
  return { ...current, tests };
}

export async function startOrchard(page: Page, development = true) {
  await idle(page);
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Orchard Landing');
  await expect(page.locator('[data-testid=turn]')).toHaveText('00');
  await expect(page.locator('[data-testid=tide]')).toHaveText('0');
  await expect(page.locator('#load-toggle')).toContainText('0/6');
  await expect(page.locator('#undo')).toBeDisabled();
  expect((await record(page)).checkpoint).toEqual({ kind: 'cove', id: 'orchard-landing' });
  expect((await record(page)).completed).toEqual(completed);
  if (development) {
    expect(await state(page)).toEqual(initial(orchardLanding));
    expect(await mastery(page)).toMatchObject({ successfulUndos: 0, current: null });
    expect(await campaign(page)).toMatchObject({ active: true, level: 'orchard-landing' });
    expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getRenderStatus().historyLength)).toBe(0);
  }
}

export async function fitStory(page: Page) {
  await fullyVisible(page, page.locator('#story-continue'));
  const fit = await page.locator('#story-caption').evaluate(el => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const bounds = el.closest('.story-picture')!.getBoundingClientRect();
    const fragments = [...range.getClientRects()].map(r => r.toJSON());
    const overflow = [...document.querySelectorAll<HTMLElement>('#dialog, #dialog *')]
      .filter(e => e.getBoundingClientRect().width && !e.closest('.sr-only') && getComputedStyle(e).display !== 'inline' && e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1)
      .map(e => e.id || e.className);
    return { fontSize: parseFloat(getComputedStyle(el).fontSize), text: el.textContent, fragments,
      allInside: fragments.every(r => r.left >= bounds.left - 1 && r.top >= bounds.top - 1 && r.right <= bounds.right + 1 && r.bottom <= bounds.bottom + 1),
      overflow, pageOverflow: document.documentElement.scrollWidth > innerWidth };
  });
  expect(fit.allInside).toBe(true);
  expect(fit.overflow).toEqual([]);
  expect(fit.pageOverflow).toBe(false);
  expect(fit.fontSize).toBeGreaterThanOrEqual(14);
  return fit;
}

export async function scenePictures(page: Page, size: string) {
  const dir = directory(size), observations: { name: string; before: unknown; after: unknown }[] = [];
  const saved = await storage(page), beforeState = await state(page);
  const capture = async (name: string) => {
    const before = await timeline(page);
    await snapshot(page, dir, name);
    const after = await timeline(page);
    observations.push({ name, before, after });
    return { before, after };
  };
  await expect(page.locator('#story-continue')).toBeEnabled();
  const begin = await capture('scene-begin');
  expect(begin.before).toMatchObject({ scene: orchardScene, settled: false, recap: false });
  expect(begin.before.elapsed).toBeLessThan(1050);
  expect((await campaign(page)).level).toBe('reef-return');
  expect((await mastery(page)).current).toBeNull();
  await page.waitForTimeout(Math.max(0, 3500 - (await timeline(page)).elapsed));
  const beat = await capture('scene-acknowledgment');
  expect(beat.before.elapsed).toBeGreaterThan(2900);
  expect(beat.before.elapsed).toBeLessThan(5200);
  expect(beat.after.settled).toBe(false);
  await expect(page.locator('#story-pause')).toBeDisabled({ timeout: 12000 });
  const endpoint = await capture('scene-end');
  expect(endpoint.before.elapsed).toBe(endpoint.before.duration);
  expect(endpoint.before.interruptionGap).toBe(0);
  await expect(page.locator('#story-caption')).toHaveText('Orin knows every path through the orchard. Tonight, he needs the ferry.');
  expect(await state(page)).toEqual(beforeState);
  expect(await storage(page)).toEqual(saved);
  const sound = await audio(page);
  expect(sound.contextCount).toBe(1);
  expect(sound.lastStoryCue).toMatchObject({ id: 'orchard-paths.approach.water', played: true });
  expect(sound.storyToken).toBeNull();
  report(dir, 'scene', { source: source().sha256, observations, fit: await fitStory(page), sound, saved, beforeState });
}

export async function more(page: Page) {
  if (!(await page.locator('#story-more').getAttribute('open'))) {
    const isOpen = await page.locator('#story-more').evaluate(el => (el as HTMLDetailsElement).open);
    if (!isOpen) await page.locator('#story-more > summary').tap();
  }
}

export async function endpoint(page: Page) {
  await expect(page.locator('#dialog')).toContainText('Seven coves are safe.');
  expect(await record(page)).toMatchObject({ completed: seven, acknowledgedScenes: sevenScenes, checkpoint: { kind: 'complete' } });
}
