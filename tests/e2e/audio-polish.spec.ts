import { expect, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import { act, activate, idle, ready, state, undo } from './ui';

test('arrival polish: actual rescue at phrase return, tail Undo, redelivery and live mute', async ({
  page,
}, testInfo) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const snapshots: unknown[] = [],
    errors: string[] = [],
    startedAt = new Date().toISOString(),
    video = page.video();
  let outcome = 'incomplete',
    failure: string | null = null;
  page.on('pageerror', (error) => errors.push(error.message));
  const snapshot = async (label: string) => {
    const result = await page.evaluate((name) => {
      const api = (window as any).__LAST_FERRY__;
      return {
        label: name,
        time: performance.now(),
        state: api.getState(),
        audio: api.getAudioStatus(),
        transition: api.getTransitionStatus(),
      };
    }, label);
    snapshots.push(result);
    return result;
  };
  try {
    await ready(page, 'holding-pier');
    for (const id of [
      'unload',
      'map-shallows',
      'map-rabbit-pier',
      'board',
      'map-shallows',
      'map-stone',
      'board',
      'map-harbor',
    ])
      await act(page, id);
    const atHarbor = await snapshot('at-harbor');
    expect(atHarbor.state).toMatchObject({ turn: 8, status: 'playing', boatNodeId: 'harbor' });
    expect(atHarbor.audio).toMatchObject({ deliveryCount: 0, contextState: 'running' });
    await activate(page, 'unload');
    await page.waitForFunction(
      () => {
        const sound = (window as any).__LAST_FERRY__.getAudioStatus();
        return sound.loopCount > 0 || sound.phaseSeconds >= 74.2;
      },
      undefined,
      { timeout: 90000, polling: 50 },
    );
    const beforeCommit = await snapshot('preview-near-phrase-return');
    expect(beforeCommit.audio.loopCount).toBe(0);
    expect(beforeCommit.audio.phaseSeconds).toBeGreaterThanOrEqual(74.2);
    await activate(page, 'commit');
    await idle(page);
    const final = await snapshot('first-arrival');
    expect(final.state).toMatchObject({ status: 'won', turn: 9, tideLevel: 2 });
    expect(final.audio).toMatchObject({
      deliveryCount: 1,
      arrivalActive: true,
      arrivalSources: 3,
      arrivalVoicesPlayed: 3,
      arrivalVoicesSkipped: 0,
      arrivalVoicesReclaimed: 0,
    });
    expect(final.audio.lastArrival.phase).toBeGreaterThanOrEqual(74.2);
    expect(final.audio.lastArrival.phase).toBeLessThan(75);
    expect(final.audio.lastArrival.notes.map((note: any) => note.stage)).toEqual([
      'opening',
      'answer',
      'settle',
    ]);
    expect(final.audio.lastArrival.notes[0].offset).toBe(0);
    await page.waitForFunction(
      () => {
        const sound = (window as any).__LAST_FERRY__.getAudioStatus();
        return sound.currentTime - sound.lastArrival.time >= 1.15;
      },
      undefined,
      { timeout: 5000 },
    );
    const duringTail = await snapshot('tail-before-terminal-undo');
    expect(duringTail.audio.arrivalActive).toBe(true);
    expect(duringTail.audio.loopCount).toBe(1);
    await undo(page);
    expect(await state(page)).toEqual(atHarbor.state);
    await page.waitForFunction(
      () => (window as any).__LAST_FERRY__.getAudioStatus().arrivalSources === 0,
    );
    const undone = await snapshot('terminal-undo-cleared-tail');
    expect(undone.audio).toMatchObject({
      deliveryCount: 1,
      arrivalActive: false,
      arrivalSources: 0,
      contextCount: 1,
      schedulerCount: 1,
      schedulerStarts: duringTail.audio.schedulerStarts,
    });
    expect(undone.audio.currentTime).toBeGreaterThan(duringTail.audio.currentTime);
    expect(undone.audio.musicSources).toBeGreaterThan(0);
    await act(page, 'unload');
    const replay = await snapshot('second-arrival');
    expect(replay.state.status).toBe('won');
    expect(replay.audio).toMatchObject({
      deliveryCount: 2,
      arrivalActive: true,
      arrivalVoicesPlayed: 6,
    });
    await page.keyboard.press('Escape');
    await expect(page.locator('#dialog')).not.toHaveAttribute('open');
    await page.waitForFunction(
      () => {
        const sound = (window as any).__LAST_FERRY__.getAudioStatus();
        return sound.currentTime - sound.lastArrival.time >= 1.15;
      },
      undefined,
      { timeout: 5000 },
    );
    const beforeMute = await snapshot('second-tail-before-mute');
    expect(beforeMute.audio.arrivalActive).toBe(true);
    await page.locator('#sound-toggle').click();
    await page.waitForFunction(
      () => (window as any).__LAST_FERRY__.getAudioStatus().contextState === 'suspended',
    );
    const muted = await snapshot('muted-tail-cleared');
    expect(muted.audio).toMatchObject({
      muted: true,
      arrivalActive: false,
      arrivalSources: 0,
      deliveryCount: 2,
      masterGain: 0,
    });
    await page.locator('#sound-toggle').click();
    await page.waitForFunction(
      () => (window as any).__LAST_FERRY__.getAudioStatus().contextState === 'running',
    );
    await page.waitForTimeout(2400);
    const resumed = await snapshot('unmuted-no-victory-replay');
    expect(resumed.audio).toMatchObject({
      muted: false,
      arrivalActive: false,
      arrivalSources: 0,
      deliveryCount: 2,
      arrivalVoicesPlayed: 6,
      contextCount: 1,
      schedulerCount: 1,
      droppedTones: 0,
      arrivalVoicesSkipped: 0,
      arrivalVoicesReclaimed: 0,
    });
    expect(resumed.audio.currentTime).toBeGreaterThan(muted.audio.currentTime);
    expect(resumed.audio.musicSources).toBeGreaterThan(0);
    expect(resumed.audio.peakTransferSources).toBeLessThanOrEqual(2);
    expect(resumed.audio.peakOwnedSources).toBeLessThanOrEqual(29);
    expect(errors).toEqual([]);
    outcome = 'passed';
  } catch (error) {
    outcome = 'failed';
    failure = error instanceof Error ? error.message : String(error);
    throw error;
  } finally {
    mkdirSync(`${reviewDir}/raw`, { recursive: true });
    const environment = await page.evaluate(() => ({
      userAgent: navigator.userAgent,
      viewport: { width: innerWidth, height: innerHeight },
      devicePixelRatio,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    }));
    writeFileSync(
      `${reviewDir}/arrival-phrase-return.json`,
      JSON.stringify(
        {
          startedAt,
          finishedAt: new Date().toISOString(),
          outcome,
          failure,
          environment,
          errors,
          snapshots,
          recording: video ? 'raw/arrival-phrase-return-silent.webm' : null,
          listening: 'Not performed; this check verifies runtime ownership and timing.',
        },
        null,
        2,
      ),
    );
    await page.close();
    if (video) {
      const path = `${reviewDir}/raw/arrival-phrase-return-silent.webm`;
      await video.saveAs(path);
      await testInfo.attach('arrival phrase return UI, silent', {
        path,
        contentType: 'video/webm',
      });
    }
  }
});
