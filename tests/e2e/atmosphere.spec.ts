import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import { act, ready, state, idle, undo, restart, fullyVisible, readable, tabTo } from './ui';

const transition = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getTransitionStatus());
const audio = (page: Page) => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus());
const journey = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getJourneyStatus());
const holding = [
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

async function checkCard(page: Page) {
  await fullyVisible(page, page.locator('#local-context'), false);
  await fullyVisible(page, page.locator('#unload'));
  await readable(page.locator('#unload'));
  const geometry = await page.evaluate(() => {
    const frame = (window as any).__LAST_FERRY__.getFrameStatus();
    const aboard = (window as any).__LAST_FERRY__.getState().aboard;
    const canvas = document.querySelector('#world')!.getBoundingClientRect();
    const card = document.querySelector('#local-context')!.getBoundingClientRect();
    const bodies = [
      frame.boat,
      ...frame.passengers.filter((passenger: any) => aboard.includes(passenger.id)),
    ];
    return {
      card: { left: card.left, right: card.right, top: card.top, bottom: card.bottom },
      ferry: {
        left: Math.min(...bodies.map((body: any) => body.left)) + canvas.left,
        right: Math.max(...bodies.map((body: any) => body.right)) + canvas.left,
        top: Math.min(...bodies.map((body: any) => body.top)) + canvas.top,
        bottom: Math.max(...bodies.map((body: any) => body.bottom)) + canvas.top,
      },
    };
  });
  const { card, ferry } = geometry;
  const intersection =
    Math.max(0, Math.min(card.right, ferry.right) - Math.max(card.left, ferry.left)) *
    Math.max(0, Math.min(card.bottom, ferry.bottom) - Math.max(card.top, ferry.top));
  expect(intersection, JSON.stringify(geometry)).toBe(0);
}

for (const width of [1440, 844, 780])
  test(`atmosphere: ${width}px loaded ferry stays clear of local actions and Sound works in transit`, async ({
    browser,
  }) => {
    const touch = width !== 1440;
    const context = await browser.newContext({
      viewport: { width, height: touch ? 390 : 900 },
      deviceScaleFactor: 1,
      hasTouch: touch,
      isMobile: touch,
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await ready(page, 'holding-pier');
    await checkCard(page);
    for (const id of holding.slice(0, 7)) await act(page, id, touch);
    await checkCard(page);
    const before = await state(page);
    await page.locator('#map-harbor')[touch ? 'tap' : 'click']();
    await expect(page.locator('#seascape')).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('#local-context')).toBeHidden();
    await expect(page.locator('#transition-status')).toContainText('Sailing to Harbor');
    await fullyVisible(page, page.locator('#sound-toggle'));
    await expect(page.locator('#sound-toggle')).toBeEnabled();
    if (touch) await page.locator('#sound-toggle').tap();
    else {
      await tabTo(page, 'sound-toggle');
      await page.keyboard.press('Enter');
    }
    await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed', 'true');
    await idle(page);
    expect(await state(page)).toMatchObject({
      turn: before.turn + 1,
      boatNodeId: 'harbor',
      tideLevel: 2,
    });
    expect((await transition(page)).last.reason).toBe('complete');
    expect((await transition(page)).completionCounts.recovery).toBe(0);
    await checkCard(page);
    await act(page, 'unload', touch);
    expect((await state(page)).status).toBe('won');
    await undo(page, touch);
    expect(await state(page)).toMatchObject({ turn: 8, boatNodeId: 'harbor', status: 'playing' });
    await checkCard(page);
    expect(errors).toEqual([]);
    await context.close();
  });

test('atmosphere: longest crossings finish normally, tide rises in the final phase and visibility interrupts once', async ({
  page,
}) => {
  await ready(page, 'bellwater');
  await act(page, 'map-west-buoy');
  for (const id of ['map-east-buoy', 'map-west-buoy']) {
    await page.locator(`#${id}`).click();
    const active = (await transition(page)).active;
    expect(active).not.toBeNull();
    expect(active.plan.duration).toBeGreaterThan(2000);
    expect(active.plan.recoveryDelay).toBe(active.plan.duration + 1000);
    const turn = (await state(page)).turn;
    await idle(page);
    const completed = await transition(page);
    expect(completed.last.id).toBe(active.id);
    expect(completed.last.reason).toBe('complete');
    expect(completed.last.finishedAt - completed.last.startedAt).toBeGreaterThanOrEqual(
      active.plan.duration - 100,
    );
    expect(completed.last.finishedAt - completed.last.startedAt).toBeLessThan(
      active.plan.recoveryDelay,
    );
    expect(completed.completionCounts.recovery).toBe(0);
    expect((await state(page)).turn).toBe(turn);
  }
  await restart(page);
  for (const id of [
    'map-shallows',
    'map-low-pier',
    'board',
    'map-east-buoy',
    'map-west-buoy',
    'map-east-buoy',
    'map-west-buoy',
  ])
    await act(page, id);
  expect(await state(page)).toMatchObject({ turn: 7, tideLevel: 1, aboard: ['tansy', 'lark'] });
  await page.evaluate(() => {
    const target = window as any;
    target.__tideSamples = [];
    target.__tideSampling = true;
    function sample() {
      if (!target.__tideSampling) return;
      const active = target.__LAST_FERRY__.getJourneyStatus().active;
      if (active)
        target.__tideSamples.push({
          ...active,
          waterY: target.__LAST_FERRY__.getEnvironmentStatus().waterY,
        });
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  await page.locator('#map-east-buoy').click();
  await expect(page.locator('#dialog')).toContainText('Bram is still waiting at Bell Pier');
  expect((await state(page)).turn).toBe(7);
  await page.locator('#commit').click();
  await idle(page);
  const tideSamples: any[] = await page.evaluate(() => {
    (window as any).__tideSampling = false;
    return (window as any).__tideSamples;
  });
  const early = tideSamples.filter(
    (sample) => sample.elapsed < sample.duration - sample.tideDuration - 40,
  );
  const rising = tideSamples.filter(
    (sample) => sample.elapsed > sample.duration - sample.tideDuration && sample.tideProgress < 1,
  );
  expect(early.length).toBeGreaterThanOrEqual(2);
  for (const sample of early) {
    expect(sample.tideProgress).toBe(0);
    expect(sample.waterY).toBeCloseTo(0.18, 6);
  }
  expect(rising.some((sample) => sample.waterY > 0.18 && sample.waterY < 0.36)).toBe(true);
  expect(await state(page)).toMatchObject({
    turn: 8,
    tideLevel: 2,
    boatNodeId: 'east-buoy',
    status: 'lost',
  });
  expect(
    await page.evaluate(() => (window as any).__LAST_FERRY__.getEnvironmentStatus().waterY),
  ).toBeCloseTo(0.36, 6);
  expect((await transition(page)).last.reason).toBe('complete');
  await undo(page);
  expect(await state(page)).toMatchObject({ turn: 7, tideLevel: 1, boatNodeId: 'west-buoy' });
  await restart(page);
  const prior = await transition(page);
  await page.locator('#map-west-buoy').click();
  await page.waitForFunction(
    () => (window as any).__LAST_FERRY__.getJourneyStatus().active !== null,
  );
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await idle(page);
  expect(await state(page)).toMatchObject({ turn: 1, boatNodeId: 'west-buoy' });
  expect((await journey(page)).active).toBeNull();
  expect((await transition(page)).completionCounts.visibility).toBe(
    prior.completionCounts.visibility + 1,
  );
  expect((await audio(page)).travelRequested).toBe(false);
  const settled = await transition(page);
  await page.waitForTimeout(3500);
  expect(await transition(page)).toEqual(settled);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await undo(page);
  expect(await state(page)).toMatchObject({ turn: 0, boatNodeId: 'harbor' });
});

test('atmosphere: reduced transitions finish normally with frozen water and no wake', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, 'holding-pier');
  for (const id of holding) {
    await act(page, id);
    const status = await transition(page);
    expect(status.last.plan).toEqual({ duration: 30, tideDuration: 30, recoveryDelay: 1030 });
    expect(status.last.reason).toBe('complete');
    const view = await page.evaluate(() => (window as any).__LAST_FERRY__.getEnvironmentStatus());
    expect(view.waterTime).toBe(0);
    expect(view.wake).toMatchObject({ emitting: false, visible: false, vertices: 0 });
  }
  expect((await state(page)).status).toBe('won');
  expect((await transition(page)).completionCounts).toEqual({
    complete: 9,
    recovery: 0,
    visibility: 0,
    cancelled: 0,
    error: 0,
  });
});

test('atmosphere: audio persistence, live mute, Undo and Restart retain one musical clock', async ({
  page,
}) => {
  await ready(page, 'bellwater');
  expect(await audio(page)).toMatchObject({
    contextState: 'not-created',
    contextCount: 0,
    schedulerCount: 0,
  });
  await page.locator('#inspect-west-buoy').click();
  await page.locator('#cancel').click();
  await expect.poll(async () => (await audio(page)).contextState).toBe('running');
  await expect.poll(async () => (await audio(page)).rms).toBeGreaterThan(0);
  expect(await audio(page)).toMatchObject({
    contextCount: 1,
    schedulerCount: 1,
    ambienceSources: 2,
  });
  await page.locator('#map-west-buoy').click();
  await expect.poll(async () => (await audio(page)).travelActive).toBe(true);
  await page.locator('#sound-toggle').click();
  await expect.poll(async () => (await audio(page)).contextState).toBe('suspended');
  expect(await audio(page)).toMatchObject({ muted: true, schedulerCount: 0, travelActive: false });
  expect((await audio(page)).rms).toBeLessThan(0.00001);
  await idle(page);
  const mutedPhase = (await audio(page)).currentTime;
  await page.waitForTimeout(300);
  expect((await audio(page)).currentTime).toBe(mutedPhase);
  await page.reload();
  await page.waitForFunction(() => (window as any).__LAST_FERRY__?.getMetrics().frames > 4);
  await page.locator('#inspect-west-buoy').click();
  await page.locator('#cancel').click();
  expect(await audio(page)).toMatchObject({
    muted: true,
    contextState: 'not-created',
    contextCount: 0,
    schedulerCount: 0,
  });
  await page.locator('#sound-toggle').click();
  await expect.poll(async () => (await audio(page)).contextState).toBe('running');
  for (let i = 0; i < 3; i++) {
    await page.locator('#sound-toggle').click();
    await expect.poll(async () => (await audio(page)).contextState).toBe('suspended');
    await page.locator('#sound-toggle').click();
    await expect.poll(async () => (await audio(page)).contextState).toBe('running');
  }
  const started = await audio(page);
  await act(page, 'map-west-buoy');
  await undo(page);
  await restart(page);
  const retained = await audio(page);
  expect(retained.currentTime).toBeGreaterThan(started.currentTime);
  expect(retained).toMatchObject({
    contextCount: 1,
    schedulerCount: 1,
    travelActive: false,
    arrivalActive: false,
  });
  expect(retained.sourceCount).toBeLessThanOrEqual(29);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(async () => (await audio(page)).contextState).toBe('suspended');
  const hidden = await audio(page);
  await page.waitForTimeout(350);
  expect((await audio(page)).currentTime).toBe(hidden.currentTime);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(async () => (await audio(page)).contextState).toBe('running');
  const resumed = await audio(page);
  expect(resumed).toMatchObject({ contextCount: 1, schedulerCount: 1 });
  expect(resumed.currentTime - hidden.currentTime).toBeLessThan(2);
  expect(resumed.skippedEvents).toBe(hidden.skippedEvents);
});

test('atmosphere: actual runtime mix crosses the full musical phrase while idle stays free', async ({
  page,
}) => {
  mkdirSync(`${reviewDir}/raw`, { recursive: true });
  await ready(page, 'holding-pier');
  await page.locator('#inspect-shallows').click();
  await page.locator('#cancel').click();
  await expect.poll(async () => (await audio(page)).contextState).toBe('running');
  const initial = await state(page);
  const recording = await page.evaluate(async () => {
    const api = (window as any).__LAST_FERRY__;
    const stream = api.captureAudioStream();
    if (!stream) throw Error('Actual runtime master stream unavailable');
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    const chunks: Blob[] = [],
      samples: any[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.start(1000);
    const startedAt = performance.now(),
      start = api.getAudioStatus();
    const sampler = setInterval(
      () => samples.push({ wallMs: performance.now() - startedAt, ...api.getAudioStatus() }),
      500,
    );
    await new Promise((resolve) => setTimeout(resolve, (start.phraseSeconds + 7) * 1000));
    clearInterval(sampler);
    const stopped = new Promise((resolve) => (recorder.onstop = resolve));
    recorder.stop();
    await stopped;
    const blob = new Blob(chunks, { type: recorder.mimeType });
    const data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.readAsDataURL(blob);
    });
    return {
      data,
      samples,
      start,
      end: api.getAudioStatus(),
      wallDurationMs: performance.now() - startedAt,
      mimeType: recorder.mimeType,
      bytes: blob.size,
    };
  });
  writeFileSync(`${reviewDir}/raw/runtime-music-loop.webm`, Buffer.from(recording.data, 'base64'));
  const { data: _data, ...metadata } = recording;
  writeFileSync(
    `${reviewDir}/runtime-music-loop.json`,
    JSON.stringify(
      {
        method:
          'MediaRecorder of actual running Web Audio master destination; idle after intentional inspection; no offline synthesis; source identity in source-manifest.json',
        ...metadata,
      },
      null,
      2,
    ),
  );
  expect(await state(page)).toEqual(initial);
  expect(recording.end.loopCount).toBeGreaterThanOrEqual(1);
  expect(recording.end.currentTime - recording.start.currentTime).toBeGreaterThanOrEqual(
    recording.start.phraseSeconds + 5,
  );
  expect(recording.bytes).toBeGreaterThan(100000);
  expect(recording.samples.some((sample) => sample.rms > 0.0001)).toBe(true);
  for (const sample of recording.samples) {
    expect(sample).toMatchObject({
      contextState: 'running',
      contextCount: 1,
      schedulerCount: 1,
      ambienceSources: 2,
    });
    expect(sample.sourceCount).toBeLessThanOrEqual(29);
    expect(sample.peak).toBeLessThan(0.95);
  }
});
