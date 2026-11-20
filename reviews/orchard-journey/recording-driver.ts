import { expect, test } from '@playwright/test';
import { orchardLanding, reefReturn } from '../src/levels/level';
import { initial } from '../src/game/rules';
import { activate, idle, state, tabTo, undo } from '../tests/e2e/ui';
import { directory, recordRescue, report, snapshot } from '../tests/e2e/large-cove-support';
import { productionURL } from '../tests/e2e/evidence';
import { audio, timeline } from '../tests/e2e/journey-six-support';
import { journeyKey } from '../tests/e2e/story-support';
import { completeSix, completed, fixture, frame, home, legacyTwo, ongoing, result, run, storage, untouched, witness } from '../tests/e2e/three-lanterns-support';
import { acceptedBest, backupKey, endpoint, fitStory, mastery, more, orchardScene, pendingOrchard, record, reefCheckpoint, source, startOrchard } from '../tests/e2e/orchard-journey-support';

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
    await observeScene(page);
    expect(await page.evaluate(key => localStorage.getItem(key), backupKey)).toBe(completeSix);
    expect((await record(page)).checkpoint).toEqual({ kind: 'scene', id: orchardScene });
    expect((await storage(page)).mastery).toBe(acceptedBest);
    await activate(page, 'story-continue', true);
    await startOrchard(page);

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

    await tabTo(page, 'terminal-undo');
    await page.keyboard.press('Enter');
    await idle(page);
    expect(await state(page)).toEqual(final.at(-2));
    await run(page, orchardLanding, steps.slice(-1), true, final.at(-2)!);
    await result(page, 2, 12, 2);

    await activate(page, 'continue-story', true);
    await endpoint(page);
    expect((await storage(page)).mastery).toBe(acceptedBest);
    expect((await storage(page)).masteryWrites).toBe(0);

    if (finish) await page.waitForTimeout(700);
    report(directory('390x844'), 'rescue', { source: captureSource.sha256, final: await storage(page), backup: completeSix, tideUndo: true, terminalUndo: true, priorPracticeBest: acceptedBest });
  } finally { if (finish) await finish(); }
  await page.reload();
  await expect(page.locator('.home-notice')).toContainText('Seven coves are safe');
  expect((await storage(page)).mastery).toBe(acceptedBest);
  await activate(page, 'home-practice', true);
  await expect(page.locator('#practice-orchard-landing .mastery-badge')).toHaveAccessibleName(/3 of 3 lanterns/);
});


async function observeScene(page: import('@playwright/test').Page) {
 const pending=await storage(page), before=await state(page);
 const sample=()=>page.evaluate(()=>({...(window as any).__LAST_FERRY__.getStoryStatus().timeline, epoch:performance.timeOrigin+performance.now()}));
 const begin=await sample();
 expect(begin).toMatchObject({scene:orchardScene,settled:false,recap:false});
 await page.waitForTimeout(Math.max(0,3500-begin.elapsed));
 const acknowledgment=await sample();
 expect(acknowledgment.settled).toBe(false);
 await expect(page.locator('#story-pause')).toBeDisabled({timeout:12000});
 const end=await sample();
 expect(end.interruptionGap).toBe(0);
 expect(await state(page)).toEqual(before);
 expect(await storage(page)).toEqual(pending);
 report(directory('390x844'),'recorded-scene-timing',{source:source().sha256,begin,acknowledgment,end});
}
