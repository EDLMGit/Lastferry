import { expect, test } from '@playwright/test';
import { orchardLanding, reefReturn } from '../../src/levels/level';
import { initial } from '../../src/game/rules';
import { activate, idle, state, tabTo, undo } from './ui';
import { directory, recordRescue, report, snapshot } from './large-cove-support';
import { productionURL } from './evidence';
import { audio, timeline } from './journey-six-support';
import { journeyKey } from './story-support';
import { completeSix, completed, fixture, frame, home, legacyTwo, ongoing, result, run, storage, untouched, witness } from './three-lanterns-support';
import { acceptedBest, backupKey, endpoint, fitStory, mastery, more, orchardScene, pendingOrchard, record, reefCheckpoint, scenePictures, source, startOrchard } from './orchard-journey-support';

test.use({ hasTouch: true, isMobile: true, deviceScaleFactor: 1, video: 'off', launchOptions: {
  ignoreDefaultArgs: ['--autoplay-policy=no-user-gesture-required'],
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=document-user-activation-required'],
} });
test.setTimeout(360000);
let captureSource: ReturnType<typeof source>;
test.beforeEach(({ browser }) => {
  captureSource = source();
  report(directory('source'), captureSource.sha256, { ...captureSource, browser: browser.version(), node: process.version, os: process.platform, when: new Date().toISOString(), dpr: 1, gpu: 'SwiftShader', device: 'Chromium touch emulation' });
});
test.afterEach(() => expect(source()).toEqual(captureSource));

test('completed-six continues through the actual portrait scene and rescue, preserving accepted Practice mastery', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await fixture(page, completeSix, acceptedBest);
  await page.goto('/');
  await expect(page.locator('#home-play')).toHaveText('Continue');
  await untouched(page, completeSix);
  await activate(page, 'home-sound', true);
  await expect.poll(async () => (await audio(page)).contextState).toBe('running');
  const finish = process.env.LAST_FERRY_ORCHARD_RECORD ? await recordRescue(page, directory('390x844'), 'scene-to-rescue') : undefined;
  try {
    await activate(page, 'home-play', true);
    await scenePictures(page, '390x844');
    expect(await page.evaluate(key => localStorage.getItem(key), backupKey)).toBe(completeSix);
    expect((await record(page)).checkpoint).toEqual({ kind: 'scene', id: orchardScene });
    expect((await storage(page)).mastery).toBe(acceptedBest);
    await activate(page, 'story-continue', true);
    await startOrchard(page);
    await snapshot(page, directory('390x844'), 'playable-handoff');
    const pending = (await storage(page)).journey;
    const steps = witness('orchard-landing');
    const first = await run(page, orchardLanding, steps.slice(0, 9));
    expect(first[8].tideLevel).toBeGreaterThan(first[7].tideLevel);
    await undo(page, true);
    expect(await state(page)).toEqual(first[7]);
    const final = await run(page, orchardLanding, steps.slice(8), true, first[7]);
    await result(page, 2, 12, 1);
    expect((await storage(page)).journey).toBe(pending);
    expect((await storage(page)).mastery).toBe(acceptedBest);
    await frame(page, '390x844', 'provisional-result');
    await tabTo(page, 'terminal-undo');
    await page.keyboard.press('Enter');
    await idle(page);
    expect(await state(page)).toEqual(final.at(-2));
    await run(page, orchardLanding, steps.slice(-1), true, final.at(-2)!);
    await result(page, 2, 12, 2);
    await frame(page, '390x844', 'redelivery-result');
    await activate(page, 'continue-story', true);
    await endpoint(page);
    expect((await storage(page)).mastery).toBe(acceptedBest);
    expect((await storage(page)).masteryWrites).toBe(0);
    await frame(page, '390x844', 'accepted-seven');
    if (finish) await page.waitForTimeout(700);
    report(directory('390x844'), 'rescue', { source: captureSource.sha256, final: await storage(page), backup: completeSix, tideUndo: true, terminalUndo: true, priorPracticeBest: acceptedBest });
  } finally { if (finish) await finish(); }
  await page.reload();
  await expect(page.locator('.home-notice')).toContainText('Seven coves are safe');
  expect((await storage(page)).mastery).toBe(acceptedBest);
  await activate(page, 'home-practice', true);
  await expect(page.locator('#practice-orchard-landing .mastery-badge')).toHaveAccessibleName(/3 of 3 lanterns/);
});

test('short landscape scene preserves pause, settings, hide, skip, restoration and immediate keyboard handoff', async ({ page }) => {
  await page.setViewportSize({ width: 780, height: 320 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await fixture(page, completeSix);
  await page.goto('/');
  await activate(page, 'home-sound', true);
  await activate(page, 'home-play', true);
  await scenePictures(page, '780x320');
  const pending = (await storage(page)).journey;
  await more(page);
  await activate(page, 'story-replay', true);
  await page.locator('#story-more > summary').tap();
  await activate(page, 'story-pause', true);
  const held = await timeline(page);
  expect(held.paused).toBe(true);
  await page.waitForTimeout(200);
  expect((await timeline(page)).elapsed).toBe(held.elapsed);
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await timeline(page)).elapsed).toBeGreaterThan(held.elapsed);
  await more(page);
  await tabTo(page, 'story-settings');
  await page.keyboard.press('Enter');
  const interrupted = await timeline(page), sound = await audio(page);
  expect(sound.storySources).toBe(0);
  expect(sound.storyToken).toBeNull();
  await page.locator('#fullscreen').scrollIntoViewIfNeeded();
  await activate(page, 'fullscreen', true);
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
  expect(await page.evaluate(() => document.fullscreenElement!.contains(document.getElementById('dialog')))).toBe(true);
  await activate(page, 'fullscreen', true);
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null)).toBeNull();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.setViewportSize({ width: 780, height: 320 });
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.keyboard.press('Escape');
  await expect(page.locator('#story-settings')).toBeFocused();
  expect((await timeline(page)).elapsed).toBe(interrupted.elapsed);
  expect((await audio(page)).lastStoryCue).toEqual(sound.lastStoryCue);
  await activate(page, 'story-read', true);
  await expect(page.locator('.story-description')).toContainText('Spring Steps');
  await expect(page.locator('.story-description')).toContainText('Orin');
  await page.keyboard.press('Escape');
  await expect(page.locator('#story-read')).toBeFocused();
  await activate(page, 'story-skip', true);
  expect(await timeline(page)).toMatchObject({ settled: true, recap: true });
  expect((await storage(page)).journey).toBe(pending);
  expect((await storage(page)).mastery).toBeNull();
  await page.reload();
  await tabTo(page, 'home-play');
  await page.keyboard.press('Enter');
  expect(await timeline(page)).toMatchObject({ scene: orchardScene, settled: true, recap: true });
  await expect(page.locator('#story-continue')).toBeFocused();
  expect((await audio(page)).storySources).toBe(0);
  expect((await mastery(page)).current).toBeNull();
  await more(page);
  await activate(page, 'story-replay-scene', true);
  await tabTo(page, 'story-continue');
  expect((await timeline(page)).settled).toBe(false);
  await page.keyboard.press('Enter');
  await startOrchard(page);
  expect((await audio(page)).storySources).toBe(0);
  await snapshot(page, directory('780x320'), 'playable-handoff');
  report(directory('780x320'), 'lifecycle', { source: captureSource.sha256, interrupted, sound, final: await storage(page), visibility: 'simulated document.hidden and visibilitychange', fullscreen: 'actual app fullscreenElement entered/exited with dialog contained', rotation: '780x320 to 390x844 and back while Settings covered the scene', entry: await state(page) });
});

test('minified Journey rescues Reef, explicitly enters Orchard, rescues and accepts seventh cove', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await fixture(page, reefCheckpoint);
  await page.goto(productionURL);
  expect(await page.evaluate(() => typeof (window as any).__LAST_FERRY__)).toBe('undefined');
  await activate(page, 'home-play', true);
  const reefPending = (await storage(page)).journey;
  await run(page, reefReturn, witness('reef-return'), false);
  await result(page, 3, 10, 0);
  expect((await storage(page)).journey).toBe(reefPending);
  expect((await storage(page)).mastery).toBeNull();
  await activate(page, 'continue-story', true);
  expect((await record(page)).completed).toEqual(completed);
  expect((await record(page)).checkpoint).toEqual({ kind: 'scene', id: orchardScene });
  const savedReef = JSON.parse((await storage(page)).mastery!);
  expect(savedReef.results['reef-return@1']).toMatchObject({ lanterns: 3, actions: 10, successfulUndos: 0 });
  await fitStory(page);
  await snapshot(page, directory('release'), 'reef-to-orchard');
  await activate(page, 'story-continue', true);
  await startOrchard(page, false);
  await run(page, orchardLanding, witness('orchard-landing', 1), false);
  await result(page, 3, 13, 0);
  await frame(page, 'release', 'orchard-result');
  expect(JSON.parse((await storage(page)).mastery!).results['orchard-landing@1']).toBeUndefined();
  await activate(page, 'continue-story', true);
  await endpoint(page);
  const accepted = await storage(page);
  expect(accepted.masteryWrites).toBe(2);
  expect(JSON.parse(accepted.mastery!).results['orchard-landing@1']).toMatchObject({ revision: 1, lanterns: 3, actions: 13, successfulUndos: 0 });
  await page.reload();
  await expect(page.locator('.home-notice')).toContainText('Seven coves are safe');
  expect((await storage(page)).mastery).toBe(accepted.mastery);
  report(directory('release'), 'integration', { source: captureSource.sha256, url: productionURL, saved: accepted });
});

test('Home and direct Practice leave in-progress, completed-six and historical saves byte-identical', async ({ browser, baseURL }) => {
  for (const [name, raw] of [['ongoing', ongoing], ['complete-six', completeSix], ['legacy-two', legacyTwo]]) {
    const context = await browser.newContext({ baseURL, viewport: { width: 320, height: 740 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
    const page = await context.newPage();
    try {
      await fixture(page, raw, acceptedBest);
      await page.goto('/');
      await activate(page, 'home-options', true);
      await activate(page, 'settings-back', true);
      await activate(page, 'home-practice', true);
      await expect(page.locator('[data-practice]')).toHaveCount(8);
      await page.locator('#practice-orchard-landing').scrollIntoViewIfNeeded();
      await activate(page, 'practice-orchard-landing', true);
      await idle(page);
      expect(await state(page)).toEqual(initial(orchardLanding));
      await home(page);
      await untouched(page, raw);
      await page.goto('/?cove=orchard-landing');
      await idle(page);
      await untouched(page, raw);
      expect((await storage(page)).mastery).toBe(acceptedBest);
      expect(await page.evaluate(key => localStorage.getItem(key), backupKey)).toBeNull();
      report(directory('isolation'), name, { source: captureSource.sha256, final: await storage(page) });
    } finally { await context.close(); }
  }
});

test('reduced scene and desktop recap fit; unavailable backup keeps explicit continuation usable', async ({ browser, baseURL }) => {
  for (const [width, height] of [[320, 740], [1440, 900]]) {
    const context = await browser.newContext({ baseURL, viewport: { width, height }, hasTouch: true, reducedMotion: 'reduce' });
    const page = await context.newPage();
    try {
      await fixture(page, width === 320 ? completeSix : pendingOrchard, acceptedBest);
      if (width === 320) await page.addInitScript(({ key }) => {
        const set = Storage.prototype.setItem;
        Storage.prototype.setItem = function(k, v) { if (this === localStorage && k.startsWith(key + '.before-')) throw new DOMException('Test quota', 'QuotaExceededError'); return set.call(this, k, v); };
      }, { key: journeyKey });
      await page.goto('/');
      await activate(page, 'home-play', true);
      expect(await timeline(page)).toMatchObject({ scene: orchardScene, settled: true });
      expect((await mastery(page)).current).toBeNull();
      const fit = await fitStory(page);
      await snapshot(page, directory(width + 'x' + height), 'scene-static');
      if (width === 320) {
        expect((await storage(page)).journey).toBe(completeSix);
        await expect(page.locator('#dialog')).toContainText('visit');
        await activate(page, 'story-continue', true);
        await idle(page);
        expect(await state(page)).toEqual(initial(orchardLanding));
        expect((await storage(page)).journey).toBe(completeSix);
      }
      expect((await storage(page)).mastery).toBe(acceptedBest);
      report(directory(width + 'x' + height), 'static', { source: captureSource.sha256, fit, final: await storage(page) });
    } finally { await context.close(); }
  }
});
