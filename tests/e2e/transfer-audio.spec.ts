import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { reviewDir } from './evidence';
import { act, activate, ready, state, idle, undo, restart, selectPlace } from './ui';

const audio = (page: Page) => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus());
const contacts = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getTransferStatus());
const settled = (page: Page) =>
  page.waitForFunction(
    () => document.querySelector('#seascape')?.getAttribute('aria-busy') === 'false',
  );
const route = [
  'unload',
  'map-shallows',
  'map-rabbit-pier',
  'board',
  'map-shallows',
  'map-stone',
  'board',
  'map-harbor',
  'unload',
];

async function observe(page: Page) {
  await page.evaluate(() => {
    const api = (window as any).__LAST_FERRY__;
    const log = { commits: [] as any[], samples: [] as any[], running: true };
    document.querySelector('#dialog')!.addEventListener('click', (event) => {
      if ((event.target as Element)?.closest('#commit'))
        log.commits.push({
          state: api.getState(),
          audio: api.getAudioStatus(),
          transition: api.getTransitionStatus(),
        });
    });
    let previousKey = '',
      previousTime = 0;
    const sample = () => {
      if (!log.running) return;
      const time = performance.now(),
        state = api.getState(),
        audio = api.getAudioStatus(),
        contacts = api.getTransferStatus().last;
      const key = JSON.stringify([
        state.turn,
        audio.transferContacts,
        audio.transferSources,
        audio.deliveryCount,
        audio.arrangement,
        contacts,
      ]);
      if (key !== previousKey || time - previousTime >= 250) {
        log.samples.push({ time, state, audio, contacts });
        previousKey = key;
        previousTime = time;
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
    (window as any).__transferTest = log;
  });
}

async function save(page: Page, name: string) {
  mkdirSync(`${reviewDir}/raw`, { recursive: true });
  const log = await page.evaluate(() => {
    const log = (window as any).__transferTest;
    log.running = false;
    return {
      ...log,
      state: (window as any).__LAST_FERRY__.getState(),
      audio: (window as any).__LAST_FERRY__.getAudioStatus(),
      contacts: (window as any).__LAST_FERRY__.getTransferStatus(),
    };
  });
  const path = `${reviewDir}/raw/${name}-trace.json`,
    trace = JSON.stringify(log, null, 2);
  writeFileSync(path, trace);
  writeFileSync(
    `${reviewDir}/${name}.json`,
    JSON.stringify(
      {
        trace: { path, sha256: createHash('sha256').update(trace).digest('hex') },
        samples: log.samples.length,
        commits: log.commits,
        state: log.state,
        audio: log.audio,
        contacts: log.contacts,
      },
      null,
      2,
    ),
  );
  return log;
}

async function stableClock(page: Page) {
  const samples = await page.evaluate(() => (window as any).__transferTest.samples);
  let lastTime = 0;
  for (const sample of samples) {
    expect(sample.audio.currentTime).toBeGreaterThanOrEqual(lastTime);
    expect(sample.audio.contextCount).toBeLessThanOrEqual(1);
    expect(sample.audio.schedulerCount).toBeLessThanOrEqual(1);
    expect(sample.audio.droppedTones).toBe(0);
    expect(sample.audio.peakTransferSources).toBeLessThanOrEqual(2);
    lastTime = sample.audio.currentTime;
  }
}

async function transfer(page: Page, kind: 'board' | 'unload', ids?: string[], touch = false) {
  await activate(page, kind, touch);
  if (ids) {
    for (const button of await page.locator('#dialog [id^="passenger-"]').all()) {
      const id = (await button.getAttribute('id'))!.replace(/^passenger-/, '');
      if ((await button.getAttribute('aria-pressed')) === 'true' && !ids.includes(id)) {
        if (touch) await button.tap();
        else await button.click();
      }
    }
  }
  const before = await audio(page);
  await activate(page, 'commit', touch);
  await settled(page);
  const after = await audio(page);
  const visual = (await contacts(page)).last;
  const commit = await page.evaluate(() => (window as any).__transferTest.commits.at(-1));
  expect(commit.audio.transferContacts).toBe(before.transferContacts);
  expect(commit.transition.active).not.toBeNull();
  const played = after.transferPlayed - before.transferPlayed;
  expect(after.transferContacts - before.transferContacts).toBeLessThanOrEqual(2);
  expect(after.transferContacts - before.transferContacts).toBe(
    visual.records.filter((record: any) => record.outcome === 'emitted').length,
  );
  expect(visual).toMatchObject({ action: kind, pending: 0, completion: 'complete' });
  expect(visual.records.map((record: any) => record.stage)).toEqual(
    kind === 'unload' ? ['crossing'] : ['crossing', 'settling'],
  );
  if (ids) expect(visual.passengerIds).toEqual(ids);
  expect(new Set(visual.records.map((record: any) => record.stage)).size).toBe(
    visual.records.length,
  );
  for (const record of visual.records) {
    const upper = kind === 'board' ? (record.stage === 'crossing' ? 0.62 : 0.87) : 0.37;
    if (record.outcome === 'stale') {
      expect(record.progress).toBeGreaterThan(upper);
      continue;
    }
    expect(record.outcome).toBe('emitted');
    expect(record.progress).toBeGreaterThanOrEqual(
      kind === 'board'
        ? record.stage === 'crossing'
          ? 0.5
          : 0.75
        : record.stage === 'crossing'
          ? 0.25
          : 0.5,
    );
    expect(record.progress).toBeLessThanOrEqual(upper);
  }
  expect(after.transferPlayed - before.transferPlayed).toBe(
    after.transferContacts - before.transferContacts,
  );
  if (played)
    expect(after.lastTransferContact.count).toBe(
      ids?.length ??
        (kind === 'board'
          ? (await state(page)).aboard.length
          : commit.transition.active.action.passengerIds.length),
    );
  else expect(after.lastTransferContact).toEqual(before.lastTransferContact);
  expect(after.peakTransferSources).toBeLessThanOrEqual(2);
  return { before, after, visual, played };
}

test('transfer audio: real UI normal rescue, subsets, tide Undo/replay and separate Harbor delivery', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await ready(page, 'holding-pier');
  await observe(page);
  try {
    const initial = await state(page);
    await selectPlace(page, 'shallows', true);
    await expect(page.locator('#local-context')).toContainText('too shallow');
    await expect(page.locator('#sail')).toBeDisabled();
    await page.locator('#close-location').tap();
    await activate(page, 'unload', true);
    await page.locator('#cancel').tap();
    expect(await state(page)).toEqual(initial);
    expect((await audio(page)).transferContacts).toBe(0);
    const sheep = await transfer(page, 'unload', ['sheep-1'], true);
    expect(sheep.after.arrivalActive).toBe(false);
    if (sheep.played) expect(sheep.after.lastTransferContact.weight).toBe('full');
    await act(page, 'map-shallows', true);
    await act(page, 'map-rabbit-pier', true);
    const boundary = await state(page),
      beforePreview = await audio(page);
    await activate(page, 'board', true);
    await page.locator('#passenger-rabbit-2').tap();
    await expect(page.locator('#dialog')).toContainText(/lost|waiting|flood/);
    await page.locator('#passenger-rabbit-1').tap();
    await expect(page.locator('#commit')).toBeDisabled();
    await page.locator('#cancel').tap();
    expect(await state(page)).toEqual(boundary);
    expect((await audio(page)).transferContacts).toBe(beforePreview.transferContacts);
    const rabbits = await transfer(page, 'board', ['rabbit-1', 'rabbit-2'], true);
    if (rabbits.played) expect(rabbits.after.lastTransferContact.weight).toBe('light');
    expect(await state(page)).toMatchObject({
      turn: 4,
      tideLevel: 1,
      aboard: ['rabbit-1', 'rabbit-2'],
    });
    const beforeUndo = await audio(page);
    await undo(page, true);
    expect(await state(page)).toEqual(boundary);
    expect((await audio(page)).transferContacts).toBe(beforeUndo.transferContacts);
    const rabbitReplay = await transfer(page, 'board', ['rabbit-1', 'rabbit-2'], true);
    expect(rabbits.played + rabbitReplay.played).toBeGreaterThan(0);
    await act(page, 'map-shallows', true);
    await act(page, 'map-stone', true);
    await transfer(page, 'board', ['sheep-1'], true);
    const allAboard = await state(page);
    const subset = await transfer(page, 'unload', ['rabbit-1'], true);
    if (subset.played) expect(subset.after.lastTransferContact.count).toBe(1);
    expect(sheep.played + subset.played).toBeGreaterThan(0);
    expect((await state(page)).aboard).toEqual(['rabbit-2', 'sheep-1']);
    expect((await state(page)).waitingByPier['stone-pier']).toEqual(['rabbit-1']);
    await undo(page, true);
    expect(await state(page)).toEqual(allAboard);
    await act(page, 'map-harbor', true);
    const atHome = await state(page);
    const partial = await transfer(page, 'unload', ['sheep-1'], true);
    expect(partial.after.deliveryCount).toBe(0);
    expect(partial.after.arrivalActive).toBe(false);
    expect(await state(page)).toMatchObject({ status: 'playing', delivered: ['sheep-1'] });
    await undo(page, true);
    expect(await state(page)).toEqual(atHome);
    const final = await transfer(page, 'unload', ['rabbit-1', 'rabbit-2', 'sheep-1'], true);
    expect(await state(page)).toMatchObject({ status: 'won', turn: 9, tideLevel: 2 });
    expect(final.after.deliveryCount).toBe(1);
    expect(final.after.pendingTerminal).toBe(false);
    expect(final.after.desiredArrangement).toBe('won');
    await undo(page, true);
    expect(await state(page)).toEqual(atHome);
    expect((await audio(page)).deliveryCount).toBe(1);
    const finalReplay = await transfer(page, 'unload', ['rabbit-1', 'rabbit-2', 'sheep-1'], true);
    expect(final.played + finalReplay.played).toBeGreaterThan(0);
    expect((await audio(page)).deliveryCount).toBe(2);
    await page.waitForFunction(
      () => {
        const sound = (window as any).__LAST_FERRY__.getAudioStatus();
        return sound.transferSources === 0 && sound.arrivalActive === false;
      },
      undefined,
      { timeout: 8000 },
    );
    const end = await audio(page);
    expect(end.transferContacts).toBe(finalReplay.after.transferContacts);
    expect(end).toMatchObject({
      contextCount: 1,
      schedulerCount: 1,
      droppedTones: 0,
      transferSources: 0,
    });
    expect(end.currentTime).toBeGreaterThan(sheep.before.currentTime);
    expect(end.sourceCount).toBeLessThanOrEqual(29);
    expect(errors).toEqual([]);
    await stableClock(page);
  } finally {
    await save(page, 'normal-transfers');
    await context.close();
  }
});

test('transfer audio: muted contacts are consumed, hidden interruption is silent on recovery and reduced motion is compact', async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await ready(page, 'holding-pier');
  await observe(page);
  try {
    await selectPlace(page, 'stone');
    await page.waitForFunction(
      () => (window as any).__LAST_FERRY__.getAudioStatus().contextState === 'running',
    );
    await page.locator('#sound-toggle').click();
    await page.waitForFunction(
      () => (window as any).__LAST_FERRY__.getAudioStatus().contextState === 'suspended',
    );
    const muted = await audio(page);
    await act(page, 'unload');
    const consumed = await audio(page);
    expect(consumed.transferContacts).toBeGreaterThan(muted.transferContacts);
    expect(consumed.transferPlayed).toBe(muted.transferPlayed);
    expect(consumed.transferSources).toBe(0);
    await page.locator('#sound-toggle').click();
    await page.waitForFunction(
      () => (window as any).__LAST_FERRY__.getAudioStatus().contextState === 'running',
    );
    await page.waitForTimeout(650);
    const resumed = await audio(page);
    expect(resumed.transferContacts).toBe(consumed.transferContacts);
    expect(resumed.transferPlayed).toBe(consumed.transferPlayed);
    expect(resumed.currentTime).toBeGreaterThanOrEqual(muted.currentTime);
    await undo(page);
    await transfer(page, 'unload', ['sheep-1']);
    await undo(page);
    await activate(page, 'unload');
    await page.locator('#commit').click();
    const interrupted = await page.evaluate(() => {
      const before = (window as any).__LAST_FERRY__.getAudioStatus();
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
      return before;
    });
    await idle(page);
    expect((await state(page)).turn).toBe(1);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(650);
    const recovered = await audio(page);
    expect(recovered.transferContacts).toBe(interrupted.transferContacts);
    expect(recovered.transferSources).toBe(0);
    expect(
      (await page.evaluate(() => (window as any).__LAST_FERRY__.getTransitionStatus())).last.reason,
    ).toBe('visibility');
    await restart(page);
    expect((await audio(page)).transferContacts).toBe(recovered.transferContacts);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const id of route) {
      const before = await audio(page);
      await act(page, id);
      const after = await audio(page);
      if (id === 'unload' || id === 'board') {
        expect(after.transferContacts - before.transferContacts).toBe(1);
        expect(after.lastTransferContact.compact).toBe(true);
      } else expect(after.transferContacts).toBe(before.transferContacts);
    }
    expect((await state(page)).status).toBe('won');
    expect(await audio(page)).toMatchObject({ deliveryCount: 1, contextCount: 1, droppedTones: 0 });
    await undo(page);
    expect((await audio(page)).deliveryCount).toBe(1);
    await page.waitForFunction(
      () => (window as any).__LAST_FERRY__.getAudioStatus().transferSources === 0,
    );
    await stableClock(page);
  } finally {
    await save(page, 'lifecycle-transfers');
  }
});
