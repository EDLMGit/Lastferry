import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import { act, activate, idle, ready, restart, state, undo } from './ui';

const audio = (page: Page) => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus());
const approach = [
  'unload',
  'map-shallows',
  'map-rabbit-pier',
  'board',
  'map-shallows',
  'map-stone',
  'board',
  'map-harbor',
];

async function observation(page: Page, label: string) {
  return page.evaluate((name) => {
    const api = (window as any).__LAST_FERRY__;
    return {
      label: name,
      time: performance.now(),
      state: api.getState(),
      audio: api.getAudioStatus(),
      transition: api.getTransitionStatus(),
    };
  }, label);
}

async function observeCommits(page: Page) {
  await page.evaluate(() => {
    const api = (window as any).__LAST_FERRY__;
    (window as any).__victoryCommits = [];
    document.querySelector('#dialog')!.addEventListener('click', (event) => {
      if ((event.target as Element).closest('#commit'))
        (window as any).__victoryCommits.push({
          time: performance.now(),
          state: api.getState(),
          audio: api.getAudioStatus(),
          transition: api.getTransitionStatus(),
        });
    });
  });
}

async function mix(page: Page, victory: 0.5 | 1, arrangement: 0.62 | 0.72) {
  await expect
    .poll(async () => {
      const value = await audio(page);
      return (
        value.victoryTarget === victory &&
        value.arrangementTarget === arrangement &&
        Math.abs(value.victoryGain - victory) < 0.002 &&
        Math.abs(value.arrangementGain - arrangement) < 0.002
      );
    })
    .toBe(true);
  const value = await audio(page);
  expect(value.effectiveMusicTarget).toBeCloseTo(victory * arrangement, 5);
  expect(value.victorySettled).toBe(victory === 0.5);
  return value;
}

async function hidden(page: Page, value: boolean) {
  await page.evaluate((next) => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: next });
    document.dispatchEvent(new Event('visibilitychange'));
  }, value);
}

async function atHarbor(page: Page, tideUndo = false) {
  for (const id of approach) {
    const before =
      tideUndo && id === 'board' && (await state(page)).turn === 3 ? await state(page) : null;
    await act(page, id);
    if (before) {
      const risen = await state(page);
      expect(risen).toMatchObject({ turn: 4, tideLevel: 1 });
      await undo(page);
      expect(await state(page)).toEqual(before);
      await act(page, 'board');
      expect(await state(page)).toEqual(risen);
    }
  }
  expect(await state(page)).toMatchObject({ turn: 8, boatNodeId: 'harbor', status: 'playing' });
}

async function observed(
  page: Page,
  name: string,
  run: (snap: (label: string) => Promise<any>) => Promise<void>,
) {
  const snapshots: any[] = [],
    errors: string[] = [],
    startedAt = new Date().toISOString();
  let outcome = 'incomplete',
    failure: string | null = null;
  page.on('pageerror', (error) => errors.push(error.message));
  const snap = async (label: string) => {
    const value = await observation(page, label);
    snapshots.push(value);
    return value;
  };
  try {
    await run(snap);
    expect(errors).toEqual([]);
    outcome = 'passed';
  } catch (error) {
    outcome = 'failed';
    failure = error instanceof Error ? error.message : String(error);
    throw error;
  } finally {
    const environment = await page.evaluate(() => ({
      userAgent: navigator.userAgent,
      viewport: { width: innerWidth, height: innerHeight },
      devicePixelRatio,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    }));
    const commits = await page.evaluate(() => (window as any).__victoryCommits ?? []);
    mkdirSync(reviewDir, { recursive: true });
    writeFileSync(
      `${reviewDir}/${name}.json`,
      JSON.stringify(
        {
          startedAt,
          finishedAt: new Date().toISOString(),
          outcome,
          failure,
          environment,
          errors,
          snapshots,
          commits,
          listening:
            'Not performed; runtime assertions establish timing and ownership, not perceived sound quality.',
        },
        null,
        2,
      ),
    );
  }
}

test('victory mix: visible final arrival, persistent ending, Undo/redelivery and next cove', async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 844, height: 390 });
  await ready(page, 'holding-pier');
  await observeCommits(page);
  await observed(page, 'visible-arrival-lifecycle', async (snap) => {
    await atHarbor(page, true);
    const before = await snap('harbor-before-delivery');
    expect(before.audio).toMatchObject({
      arrivalEventCount: 0,
      deliveryCount: 0,
      victoryTarget: 1,
      victorySettled: false,
    });
    await activate(page, 'unload');
    await activate(page, 'passenger-rabbit-1');
    await activate(page, 'passenger-rabbit-2');
    await activate(page, 'commit');
    await idle(page);
    const partial = await snap('partial-delivery-no-victory');
    expect(partial.state).toMatchObject({ status: 'playing', delivered: ['sheep-1'] });
    expect(partial.audio).toMatchObject({
      arrivalEventCount: 0,
      deliveryCount: 0,
      victoryTarget: 1,
      victorySettled: false,
    });
    await undo(page);
    expect(await state(page)).toEqual(before.state);
    await activate(page, 'unload');
    await activate(page, 'commit');
    await idle(page);
    const arrival = await snap('visible-arrival');
    const commit = await page.evaluate(() => (window as any).__victoryCommits.at(-1));
    expect(commit.state.status).toBe('won');
    expect(commit.transition.active).not.toBeNull();
    expect(commit.audio).toMatchObject({
      arrivalEventCount: 0,
      deliveryCount: 0,
      pendingTerminal: true,
      victoryTarget: 1,
      victorySettled: false,
    });
    expect(arrival.state).toMatchObject({ turn: 9, status: 'won' });
    expect(arrival.audio).toMatchObject({
      arrivalEventCount: 1,
      deliveryCount: 1,
      arrivalVoicesPlayed: 3,
      arrivalVoicesSkipped: 0,
      victoryTarget: 0.5,
      victorySettled: true,
    });
    expect(arrival.audio.lastVictoryMixChange.time).toBeCloseTo(arrival.audio.lastArrival.time, 2);
    await mix(page, 0.5, 0.62);
    await page.waitForFunction(
      () => {
        const value = (window as any).__LAST_FERRY__.getAudioStatus();
        return value.currentTime - value.lastArrival.time >= 10;
      },
      undefined,
      { timeout: 15000 },
    );
    const settled = await snap('ten-seconds-after-arrival-with-success-open');
    expect(settled.audio).toMatchObject({
      arrivalSources: 0,
      arrivalActive: false,
      deliveryCount: 1,
      victoryTarget: 0.5,
      victorySettled: true,
    });
    await expect(page.locator('#dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#dialog')).toBeHidden();
    await mix(page, 0.5, 0.62);
    await activate(page, 'menu');
    await expect(page.locator('#dialog-title')).toHaveText('Crossing menu');
    await page.waitForTimeout(900);
    await mix(page, 0.5, 0.62);
    await snap('menu-retains-ending');
    await page.keyboard.press('Escape');
    await undo(page);
    expect(await state(page)).toEqual(before.state);
    await mix(page, 1, 0.72);
    const undone = await snap('terminal-undo-restored');
    expect(undone.audio).toMatchObject({
      arrivalSources: 0,
      arrivalActive: false,
      deliveryCount: 1,
      arrivalEventCount: 1,
    });
    await act(page, 'unload');
    await mix(page, 0.5, 0.62);
    const redelivered = await snap('redelivery-fresh-duck');
    expect(redelivered.audio).toMatchObject({
      deliveryCount: 2,
      arrivalEventCount: 2,
      victoryTarget: 0.5,
    });
    await undo(page);
    await act(page, 'unload');
    await mix(page, 0.5, 0.62);
    const rapid = await snap('rapid-undo-redelivery-no-accumulation');
    expect(rapid.audio).toMatchObject({
      deliveryCount: 3,
      arrivalEventCount: 3,
      victoryTarget: 0.5,
      contextCount: 1,
      schedulerCount: 1,
      droppedTones: 0,
    });
    expect(rapid.audio.peakOwnedSources).toBeLessThanOrEqual(29);
    await activate(page, 'next-cove');
    await page.waitForURL('**/?cove=bellwater');
    await page.waitForFunction(
      () => ((window as any).__LAST_FERRY__?.getMetrics().frames ?? 0) > 4,
    );
    expect(await state(page)).toMatchObject({ turn: 0, status: 'playing' });
    expect(await audio(page)).toMatchObject({
      arrivalEventCount: 0,
      deliveryCount: 0,
      victoryTarget: 1,
      victorySettled: false,
      arrangementTarget: 0.72,
    });
    await snap('next-cove-clears-ending');
  });
});

test('victory mix: finish muted before lazy graph, activate ending, mute recovery and Restart', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('last-ferry-muted', 'true'));
  await ready(page, 'holding-pier');
  await observeCommits(page);
  await observed(page, 'muted-lazy-recovery', async (snap) => {
    await atHarbor(page);
    expect(await audio(page)).toMatchObject({
      muted: true,
      contextCount: 0,
      contextState: 'not-created',
    });
    await act(page, 'unload');
    const mutedWin = await snap('finished-muted-without-graph');
    expect(mutedWin.state.status).toBe('won');
    expect(mutedWin.audio).toMatchObject({
      arrivalEventCount: 1,
      deliveryCount: 0,
      arrivalVoicesPlayed: 0,
      contextCount: 0,
      contextState: 'not-created',
      victoryTarget: 0.5,
      victorySettled: true,
      victoryGain: null,
    });
    await page.keyboard.press('Escape');
    await activate(page, 'sound-toggle');
    await mix(page, 0.5, 0.62);
    const activated = await snap('unmute-creates-reduced-graph-without-cue');
    expect(activated.audio).toMatchObject({
      contextState: 'running',
      contextCount: 1,
      schedulerCount: 1,
      arrivalEventCount: 1,
      deliveryCount: 0,
      arrivalVoicesPlayed: 0,
      arrivalActive: false,
    });
    await activate(page, 'sound-toggle');
    await page.waitForFunction(
      () => (window as any).__LAST_FERRY__.getAudioStatus().contextState === 'suspended',
    );
    const muted = await snap('mute-retains-ending-intent');
    expect(muted.audio).toMatchObject({
      muted: true,
      victoryTarget: 0.5,
      victorySettled: true,
      arrivalSources: 0,
    });
    await activate(page, 'sound-toggle');
    await mix(page, 0.5, 0.62);
    expect(await audio(page)).toMatchObject({
      arrivalEventCount: 1,
      deliveryCount: 0,
      arrivalVoicesPlayed: 0,
    });
    await restart(page);
    expect(await state(page)).toMatchObject({ turn: 0, status: 'playing' });
    await mix(page, 1, 0.72);
    await snap('restart-restores-normal-mix');
    await activate(page, 'menu');
    await page.locator('#cove-picker').selectOption('first-crossing');
    await page.waitForURL('**/?cove=first-crossing');
    await page.waitForFunction(
      () => ((window as any).__LAST_FERRY__?.getMetrics().frames ?? 0) > 4,
    );
    expect(await state(page)).toMatchObject({ turn: 0, status: 'playing' });
    expect(await audio(page)).toMatchObject({
      victoryTarget: 1,
      victorySettled: false,
      arrivalEventCount: 0,
      arrangementTarget: 0.72,
    });
    await snap('chosen-cove-has-no-stale-ending');
  });
});

test('victory mix: hidden final transition settles silently and won hide/resume retains mix', async ({
  page,
}) => {
  test.setTimeout(150000);
  await page.setViewportSize({ width: 844, height: 390 });
  await ready(page, 'holding-pier');
  await observeCommits(page);
  await observed(page, 'hidden-arrival-recovery', async (snap) => {
    await atHarbor(page);
    await activate(page, 'unload');
    await activate(page, 'commit');
    await hidden(page, true);
    await idle(page);
    await page.waitForFunction(
      () => (window as any).__LAST_FERRY__.getAudioStatus().contextState === 'suspended',
    );
    const interrupted = await snap('hidden-before-visible-arrival');
    expect(interrupted.state.status).toBe('won');
    expect(interrupted.transition.last.reason).toBe('visibility');
    expect(interrupted.audio).toMatchObject({
      hidden: true,
      arrivalEventCount: 0,
      deliveryCount: 0,
      arrivalActive: false,
      victoryTarget: 0.5,
      victorySettled: true,
    });
    await hidden(page, false);
    await mix(page, 0.5, 0.62);
    await page.waitForTimeout(900);
    const recovered = await snap('recovered-won-no-delayed-cue');
    expect(recovered.audio).toMatchObject({
      hidden: false,
      contextState: 'running',
      arrivalEventCount: 0,
      deliveryCount: 0,
      arrivalSources: 0,
      victoryTarget: 0.5,
    });
    await undo(page);
    await mix(page, 1, 0.72);
    await act(page, 'unload');
    const delivered = await snap('genuine-redelivery-after-hidden-recovery');
    expect(delivered.audio).toMatchObject({
      arrivalEventCount: 1,
      deliveryCount: 1,
      arrivalVoicesPlayed: 3,
      victoryTarget: 0.5,
    });
    await hidden(page, true);
    await page.waitForFunction(
      () => (window as any).__LAST_FERRY__.getAudioStatus().contextState === 'suspended',
    );
    expect(await audio(page)).toMatchObject({
      victoryTarget: 0.5,
      victorySettled: true,
      arrivalSources: 0,
    });
    await hidden(page, false);
    await mix(page, 0.5, 0.62);
    await page.waitForTimeout(1000);
    const returned = await snap('won-hide-resume-no-replay');
    expect(returned.audio).toMatchObject({
      contextCount: 1,
      schedulerCount: 1,
      arrivalEventCount: 1,
      deliveryCount: 1,
      arrivalVoicesPlayed: 3,
      arrivalSources: 0,
      droppedTones: 0,
    });
    await restart(page);
    await mix(page, 1, 0.72);
    await snap('recovery-restart-restores-normal');
  });
});
