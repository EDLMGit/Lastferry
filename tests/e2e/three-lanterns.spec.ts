import { expect, test } from '@playwright/test';
import { initial } from '../../src/game/rules';
import { holdingPier, orchardLanding } from '../../src/levels/level';
import { activate, fullyVisible, idle, ready, state, tabTo, undo } from './ui';
import { directory, recordRescue, report } from './large-cove-support';
import { productionURL } from './evidence';
import {
  acceptanceUnchanged, completeSix, fixture, frame, home, legacyTwo,
  ongoing, result, run, runtimeSource, skipStory, storage, untouched, witness,
} from './three-lanterns-support';

test.use({ hasTouch: true, isMobile: true, deviceScaleFactor: 1, video: 'off' });
let source: ReturnType<typeof runtimeSource>;
test.beforeEach(({ browser }) => {
  source = runtimeSource();
  report(directory('source'), source.sha256, {
    ...source, browser: browser.version(), node: process.version, os: process.platform,
    when: new Date().toISOString(), dpr: 1, gpu: 'SwiftShader', device: 'Chromium emulation',
  });
});
test.afterEach(() => expect(runtimeSource().sha256).toBe(source.sha256));

test('Orchard three lanterns remain provisional through menus and become two after terminal Undo', async ({ page }) => {
  test.setTimeout(420000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await fixture(page, ongoing);
  await ready(page, 'orchard-landing');
  await activate(page, 'menu', true);
  await page.locator('.mastery-criteria summary').click();
  await expect(page.locator('.mastery-criteria')).toContainText('13');
  await page.locator('.mastery-criteria li').last().scrollIntoViewIfNeeded();
  await fullyVisible(page, page.locator('.mastery-criteria ol'), false);
  await frame(page, '390x844', 'criteria');
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus().running)).toBe(true);
  const finish = process.env.LAST_FERRY_LANTERNS_RECORD
    ? await recordRescue(page, directory('390x844'), 'rescue') : undefined;
  try {
    const states = await run(page, orchardLanding, witness('orchard-landing'));
    await result(page, 3, 12, 0);
    await frame(page, '390x844', 'three-provisional');
    await acceptanceUnchanged(page);
    await activate(page, 'choose-cove', true);
    await acceptanceUnchanged(page);
    await activate(page, 'return-arrival', true);
    await tabTo(page, 'terminal-settings');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');
    await expect(page.locator('#terminal-settings')).toBeFocused();
    await result(page, 3, 12, 0);
    await acceptanceUnchanged(page);
    await tabTo(page, 'terminal-undo');
    await page.keyboard.press('Enter');
    await idle(page);
    expect(await state(page)).toEqual(states.at(-2));
    await expect(page.locator('#mastery-result')).toBeHidden();
    await run(page, orchardLanding, witness('orchard-landing').slice(-1), true, states.at(-2)!);
    await result(page, 2, 12, 1);
    await frame(page, '390x844', 'two-redelivery');
    await acceptanceUnchanged(page);
    await activate(page, 'terminal-restart', true);
    expect(await state(page)).toEqual(initial(orchardLanding));
    const saved = await storage(page);
    expect(saved.masteryWrites).toBe(1);
    expect(JSON.parse(saved.mastery!).results['orchard-landing@1']).toMatchObject({
      actions: 12, successfulUndos: 1, lanterns: 2,
    });
    await untouched(page, ongoing);
    await home(page);
    await activate(page, 'home-practice', true);
    await page.locator('#practice-orchard-landing').scrollIntoViewIfNeeded();
    await expect(page.locator('#practice-orchard-landing .mastery-badge')).toHaveAccessibleName(/2 of 3 lanterns/);
    await frame(page, '390x844', 'accepted-practice');
    if (finish) await page.waitForTimeout(1000);
    report(directory('390x844'), 'provisional-to-accepted', { source: source.sha256, saved, states });
  } finally {
    if (finish) await finish();
  }
  await page.reload();
  await expect(page.locator('#home-practice')).toBeVisible();
  await activate(page, 'home-practice', true);
  await expect(page.locator('#practice-orchard-landing .mastery-badge')).toHaveAccessibleName(/2 of 3 lanterns/);
  await untouched(page, ongoing);
});

test('Journey accepts at continuation and a worse Practice replay keeps the real best', async ({ page }) => {
  test.setTimeout(300000);
  await page.setViewportSize({ width: 780, height: 320 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await fixture(page);
  await page.goto('/');
  await activate(page, 'home-play', true);
  await skipStory(page);
  await activate(page, 'story-continue', true);
  await idle(page);
  const before = (await storage(page)).journey;
  await run(page, holdingPier, witness('holding-pier'));
  await result(page, 3, 9, 0);
  await frame(page, '780x320', 'journey-three');
  await acceptanceUnchanged(page);
  expect((await storage(page)).journey).toBe(before);
  await activate(page, 'continue-story', true);
  await expect(page.locator('#story-continue')).toBeVisible();
  const accepted = await storage(page);
  expect(accepted.masteryWrites).toBe(1);
  expect(JSON.parse(accepted.mastery!).results['holding-pier@1']).toMatchObject({ actions: 9, successfulUndos: 0, lanterns: 3 });
  await skipStory(page);
  await activate(page, 'story-continue', true);
  await home(page);
  await activate(page, 'home-practice', true);
  await frame(page, '780x320', 'practice-best');
  await activate(page, 'practice-holding-pier', true);
  const steps = witness('holding-pier');
  const first = await run(page, holdingPier, steps.slice(0, 4));
  await undo(page, true);
  expect(await state(page)).toEqual(first[2]);
  const states = await run(page, holdingPier, steps.slice(3), true, first[2]);
  await undo(page, true);
  await run(page, holdingPier, steps.slice(-1), true, states.at(-2)!);
  await result(page, 2, 9, 2);
  await expect(page.locator('#mastery-best')).toContainText(/Best rescue.*3 of 3 lanterns/s);
  await frame(page, '780x320', 'current-two-best-three');
  await page.locator('#mastery-best').scrollIntoViewIfNeeded();
  await fullyVisible(page, page.locator('#mastery-best'), false);
  await fullyVisible(page, page.locator('#next-cove'));
  await fullyVisible(page, page.locator('#terminal-undo'));
  await frame(page, '780x320', 'best-comparison');
  await activate(page, 'next-cove', true);
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Bellwater Cove');
  expect((await storage(page)).mastery).toBe(accepted.mastery);
  await home(page);
  await activate(page, 'home-new', true);
  await activate(page, 'journey-replace-confirm', true);
  await expect(page.locator('#story-continue')).toBeVisible();
  expect((await storage(page)).mastery).toBe(accepted.mastery);
  await page.reload();
  expect((await storage(page)).mastery).toBe(accepted.mastery);
  report(directory('780x320'), 'journey-and-best', { source: source.sha256, accepted, final: await storage(page) });
});

test('320px Practice keeps legacy rescue truth and accepts only confirmed Home departure', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await fixture(page, completeSix);
  await page.goto('/');
  await activate(page, 'home-practice', true);
  await expect(page.locator('#practice-holding-pier')).toContainText('Rescued · not yet rated');
  await expect(page.locator('#practice-orchard-landing')).toContainText('Not yet rated');
  await page.locator('.mastery-criteria summary').click();
  await frame(page, '320x740', 'practice-criteria');
  await activate(page, 'practice-holding-pier', true);
  const steps = witness('holding-pier');
  const beforeDelivery = await run(page, holdingPier, steps.slice(0, -1));
  await run(page, holdingPier, [{ type: 'wait' }, steps.at(-1)!], true, beforeDelivery.at(-1)!);
  await result(page, 1, 10, 0);
  await frame(page, '320x740', 'one-provisional');
  await page.keyboard.press('Escape');
  await activate(page, 'menu', true);
  await activate(page, 'journey-return', true);
  await activate(page, 'journey-return-cancel', true);
  await acceptanceUnchanged(page);
  await activate(page, 'return-arrival', true);
  await result(page, 1, 10, 0);
  await home(page, true);
  const accepted = await storage(page);
  expect(accepted.masteryWrites).toBe(1);
  await activate(page, 'home-practice', true);
  await page.locator('#practice-holding-pier').scrollIntoViewIfNeeded();
  await fullyVisible(page, page.locator('#practice-holding-pier'));
  await expect(page.locator('#practice-holding-pier .mastery-badge')).toHaveAccessibleName(/1 of 3 lanterns/);
  await frame(page, '320x740', 'accepted-practice');
  for (const button of await page.locator('[data-practice]').all()) {
    await button.scrollIntoViewIfNeeded();
    await fullyVisible(page, button);
  }
  await untouched(page, completeSix);
  report(directory('320x740'), 'legacy-and-home', { source: source.sha256, accepted });
});

test('unavailable mastery persistence keeps a live best and Journey continuation usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await fixture(page, undefined, undefined, true);
  await page.goto('/');
  await activate(page, 'home-play', true);
  await skipStory(page);
  await activate(page, 'story-continue', true);
  await run(page, holdingPier, witness('holding-pier'));
  await activate(page, 'continue-story', true);
  await expect(page.locator('#story-continue')).toBeVisible();
  expect((await storage(page)).mastery).toBeNull();
  expect(JSON.parse((await storage(page)).journey!).completed).toEqual(['holding-pier']);
  await skipStory(page);
  await activate(page, 'story-continue', true);
  await home(page);
  await activate(page, 'home-practice', true);
  await expect(page.locator('#practice-holding-pier .mastery-badge')).toHaveAccessibleName(/3 of 3 lanterns/);
  await expect(page.locator('#dialog')).toContainText(/visit|saved|device/i);
  report(directory('storage'), 'blocked-write', { source: source.sha256, final: await storage(page) });
});

test('corrupt scores and restored historical scenery award nothing or rewrite Journey', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await fixture(page, legacyTwo, '{broken');
  await page.goto('/');
  await acceptanceUnchanged(page, '{broken');
  await activate(page, 'home-practice', true);
  await expect(page.locator('#practice-holding-pier')).toContainText('Rescued · not yet rated');
  await frame(page, 'desktop', 'legacy-unrated');
  await activate(page, 'practice-orchard-landing', true);
  await home(page);
  await untouched(page, legacyTwo);
  expect((await storage(page)).masteryWrites).toBe(0);
  await page.goto('/?cove=orchard-landing');
  await idle(page);
  await untouched(page, legacyTwo);
  await acceptanceUnchanged(page, '{broken');
});

test('minified release completes the thirteen-action Orchard route and persists on cove navigation', async ({ page }) => {
  test.setTimeout(240000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await fixture(page, ongoing);
  await page.goto(productionURL);
  expect(await page.evaluate(() => typeof (window as any).__LAST_FERRY__)).toBe('undefined');
  await activate(page, 'home-practice', true);
  await page.locator('#practice-orchard-landing').scrollIntoViewIfNeeded();
  await activate(page, 'practice-orchard-landing', true);
  await run(page, orchardLanding, witness('orchard-landing', 1), false);
  await result(page, 3, 13, 0);
  await frame(page, 'release', 'thirteen-actions');
  await acceptanceUnchanged(page);
  await activate(page, 'choose-cove', true);
  await acceptanceUnchanged(page);
  await page.locator('#cove-picker').selectOption('reef-return');
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Reef Return');
  const saved = await storage(page);
  expect(saved.masteryWrites).toBe(1);
  expect(JSON.parse(saved.mastery!).results['orchard-landing@1']).toMatchObject({ actions: 13, successfulUndos: 0, lanterns: 3 });
  await untouched(page, ongoing);
  await page.reload();
  expect((await storage(page)).mastery).toBe(saved.mastery);
  report(directory('release'), 'accepted', { source: source.sha256, url: productionURL, saved });
});

test('attempt history survives settings, fullscreen and hidden-motion recovery; restored scenes award nothing', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await fixture(page);
  await ready(page, 'holding-pier');
  const history = () => page.evaluate(() => (window as any).__LAST_FERRY__.getMasteryStatus());
  await run(page, holdingPier, witness('holding-pier').slice(0, 1));
  await undo(page, true);
  expect((await history()).successfulUndos).toBe(1);
  await activate(page, 'menu', true);
  await activate(page, 'settings', true);
  await page.locator('#motion-preference').selectOption('reduced');
  await page.locator('#tips-preference').selectOption('on');
  await page.setViewportSize({ width: 780, height: 320 });
  await page.locator('#fullscreen').scrollIntoViewIfNeeded();
  await activate(page, 'fullscreen', true);
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
  expect(await page.evaluate(() => document.fullscreenElement!.contains(document.getElementById('dialog')))).toBe(true);
  await activate(page, 'fullscreen', true);
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null)).toBeNull();
  await page.locator('#motion-preference').selectOption('device');
  await page.locator('#tips-preference').selectOption('off');
  await activate(page, 'settings-back', true);
  await page.keyboard.press('Escape');
  expect((await history()).successfulUndos).toBe(1);
  await run(page, holdingPier, witness('holding-pier').slice(0, 1));
  await page.locator('#map-shallows .map-hit').tap();
  await activate(page, 'sail', true);
  await expect(page.locator('#seascape')).toHaveAttribute('aria-busy', 'true');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await idle(page);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect((await history()).successfulUndos).toBe(1);
  expect((await state(page)).boatNodeId).toBe('shallows');
  await acceptanceUnchanged(page);
  const resumed = await history();
  await page.close();
  const restored = await context.newPage();
  await restored.setViewportSize({ width: 390, height: 844 });
  const pending = JSON.stringify({
    version: 1, completed: ['holding-pier'], acknowledgedScenes: ['opening'],
    checkpoint: { kind: 'scene', id: 'another-bell' },
  });
  await fixture(restored, pending);
  await restored.goto('/');
  await activate(restored, 'home-play', true);
  await expect(restored.locator('#story-continue')).toBeVisible();
  const cosmetic = await restored.evaluate(() => (window as any).__LAST_FERRY__.getMasteryStatus());
  expect(cosmetic.current).toBeNull();
  await acceptanceUnchanged(restored);
  await skipStory(restored);
  await activate(restored, 'story-continue', true);
  await idle(restored);
  await expect(restored.locator('#seascape')).toHaveAttribute('aria-label', 'Bellwater Cove');
  expect((await restored.evaluate(() => (window as any).__LAST_FERRY__.getMasteryStatus())).current).toBeNull();
  expect((await storage(restored)).masteryWrites).toBe(0);
  report(directory('lifecycle'), 'history-and-restored-scene', {
    source: source.sha256, resumed, cosmetic, final: await storage(restored),
    visibility: 'document.hidden and visibilitychange simulated in the actual page',
    fullscreen: 'actual app fullscreenElement entered and exited with the Settings control',
  });
});
