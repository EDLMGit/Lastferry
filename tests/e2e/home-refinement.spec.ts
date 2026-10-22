import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { reviewDir } from './evidence';
import {
  act,
  ready,
  state,
  idle,
  undo,
  restart,
  fullyVisible,
  readable,
  tabTo,
  keyAct,
  dialogCycle,
} from './ui';

const audio = (page: Page) => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus());
const view = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getEnvironmentStatus());
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
const bell = [
  'map-shallows',
  'map-low-pier',
  'board',
  'map-east-buoy',
  'map-west-buoy',
  'map-harbor',
  'map-bell-pier',
  'board',
  'map-harbor',
  'unload',
];

async function home(page: Page) {
  await expect(page.locator('#map-harbor')).toHaveAccessibleName(
    /Harbor.*Home, delivery destination/,
  );
  await expect(page.locator('#map-harbor')).toContainText('Harbor · Home');
  await fullyVisible(page, page.locator('#map-harbor'));
  const scene = await view(page);
  expect(scene.arrival.glowVisible).toBe(true);
  expect(scene.arrival.glowOpacity).toBeGreaterThan(0);
  expect(scene.arrival.emissiveIntensity).toBeGreaterThan(0);
  expect(scene.water.renderPasses).toBe(1);
  expect(scene.water.reflectionTargets).toBe(0);
  expect(scene.water.dataBytes).toBe(524288);
}

async function clearCard(page: Page) {
  await fullyVisible(page, page.locator('#unload'));
  await readable(page.locator('#unload'));
  const overlap = await page.evaluate(() => {
    const api = (window as any).__LAST_FERRY__,
      frame = api.getFrameStatus(),
      aboard = api.getState().aboard;
    const canvas = document.querySelector('#world')!.getBoundingClientRect();
    const card = document.querySelector('#local-context')!.getBoundingClientRect();
    const bodies = [
      frame.boat,
      ...frame.passengers.filter((animal: any) => aboard.includes(animal.id)),
    ];
    const left = Math.min(...bodies.map((body: any) => body.left)) + canvas.left,
      right = Math.max(...bodies.map((body: any) => body.right)) + canvas.left;
    const top = Math.min(...bodies.map((body: any) => body.top)) + canvas.top,
      bottom = Math.max(...bodies.map((body: any) => body.bottom)) + canvas.top;
    return (
      Math.max(0, Math.min(card.right, right) - Math.max(card.left, left)) *
      Math.max(0, Math.min(card.bottom, bottom) - Math.max(card.top, top))
    );
  });
  expect(overlap).toBe(0);
}

for (const width of [844, 780])
  test(`home refinement: ${width}px touch Home stays meaningful at unavailable, loaded, delivered and Undo states`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width, height: 390 },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await ready(page, 'bellwater');
    await home(page);
    const initial = await state(page);
    await page.locator('#map-harbor').tap();
    expect(await state(page)).toEqual(initial);
    await page.locator('#inspect-bell-pier').tap();
    await expect(page.locator('#dialog')).toContainText('Bell Pier');
    await page.locator('#cancel').tap();
    expect(await state(page)).toEqual(initial);
    for (const id of bell.slice(0, 9)) {
      const before = await state(page);
      await act(page, id, true);
      expect((await state(page)).turn).toBe(before.turn + 1);
      await home(page);
      if ((await state(page)).turn === 2)
        await expect(page.locator('#map-harbor')).toHaveAccessibleName(
          'Harbor: no direct passage; Home, delivery destination',
        );
      if ((await state(page)).turn === 8) {
        expect(await audio(page)).toMatchObject({ desiredArrangement: 'homeward' });
        await undo(page, true);
        expect(await audio(page)).toMatchObject({ desiredArrangement: 'deadline' });
        await act(page, 'board', true);
      }
    }
    expect(await state(page)).toMatchObject({ boatNodeId: 'harbor', status: 'playing', turn: 9 });
    expect((await view(page)).arrival.active).toBe(false);
    await clearCard(page);
    await page.locator('#inspect-bell-pier').tap();
    await fullyVisible(page, page.locator('#cancel'));
    await page.locator('#cancel').tap();
    await act(page, 'unload', true);
    expect((await state(page)).status).toBe('won');
    expect((await view(page)).arrival.active).toBe(true);
    await undo(page, true);
    expect((await state(page)).status).toBe('playing');
    await home(page);
    expect((await view(page)).arrival.active).toBe(false);
    await clearCard(page);
    await restart(page, true);
    await home(page);
    expect(await state(page)).toEqual(initial);
    expect(errors).toEqual([]);
    await context.close();
  });

test('home refinement: natural keyboard inspection, subset cancellation, boundary boarding, tide Undo and terminal recovery', async ({
  page,
}) => {
  await ready(page, 'holding-pier');
  await home(page);
  const original = await state(page);
  await tabTo(page, 'inspect-harbor');
  await page.keyboard.press('Enter');
  await dialogCycle(page);
  await page.keyboard.press('Escape');
  await expect(page.locator('#inspect-harbor')).toBeFocused();
  expect(await state(page)).toEqual(original);
  await keyAct(page, 'unload');
  expect(await audio(page)).toMatchObject({ desiredArrangement: 'ordinary' });
  await keyAct(page, 'map-shallows');
  expect(await audio(page)).toMatchObject({ desiredArrangement: 'deadline' });
  await keyAct(page, 'map-rabbit-pier');
  const before = await state(page),
    desired = (await audio(page)).desiredArrangement;
  await tabTo(page, 'board');
  await page.keyboard.press('Enter');
  await tabTo(page, 'passenger-rabbit-2');
  await page.keyboard.press('Space');
  await expect(page.locator('#passenger-rabbit-2')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#dialog')).toContainText(/still waiting|lost|flood/);
  await page.keyboard.press('Escape');
  expect(await state(page)).toEqual(before);
  expect((await audio(page)).desiredArrangement).toBe(desired);
  await keyAct(page, 'board');
  expect(await state(page)).toMatchObject({ turn: 4, tideLevel: 1 });
  expect(await audio(page)).toMatchObject({ desiredArrangement: 'ordinary' });
  await tabTo(page, 'undo', true);
  await page.keyboard.press('Enter');
  await idle(page);
  expect(await state(page)).toEqual(before);
  expect(await audio(page)).toMatchObject({ desiredArrangement: 'deadline' });
  await keyAct(page, 'board');
  for (const id of holding.slice(4)) await keyAct(page, id);
  expect((await state(page)).status).toBe('won');
  await tabTo(page, 'terminal-undo');
  await page.keyboard.press('Enter');
  await idle(page);
  await home(page);
  expect(await state(page)).toMatchObject({ turn: 8, status: 'playing', tideLevel: 2 });
  expect(await audio(page)).toMatchObject({ desiredArrangement: 'homeward' });
});

test('home refinement: reduced motion restores wet contact, baseline home light and terminal arrangements without replaying delivery', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, 'holding-pier');
  const initial = await view(page);
  expect(initial.contacts.meshes.length).toBeGreaterThan(0);
  await act(page, 'unload');
  const empty = await view(page);
  const changed = initial.contacts.meshes.filter((mesh: any) => {
    const now = empty.contacts.meshes.find((item: any) => item.name === mesh.name);
    return Math.abs(now.localWaterY - mesh.localWaterY) > 0.01;
  });
  expect(changed.length).toBeGreaterThan(0);
  await undo(page);
  expect((await view(page)).contacts).toEqual(initial.contacts);
  for (const id of holding) await act(page, id);
  expect((await state(page)).status).toBe('won');
  const won = await audio(page);
  expect(won.desiredArrangement).toBe('won');
  expect(won.pendingTerminal).toBe(false);
  await undo(page);
  await home(page);
  expect((await view(page)).arrival.active).toBe(false);
  expect((await audio(page)).deliveryCount).toBe(won.deliveryCount);
  await undo(page);
  expect(await state(page)).toMatchObject({ turn: 7, tideLevel: 1 });
  expect((await view(page)).contacts.waterY).toBeCloseTo(0.18, 6);
  await restart(page);
  for (let i = 0; i < 4; i++) await act(page, 'wait');
  expect((await state(page)).status).toBe('lost');
  expect((await audio(page)).desiredArrangement).toBe('lost');
  await undo(page);
  expect(await state(page)).toMatchObject({ turn: 3, status: 'playing' });
  expect((await audio(page)).desiredArrangement).toBe('deadline');
  await home(page);
});

test('home refinement: actual adaptive runtime mix follows rescue, Undo and a loop without a second clock', async ({
  page,
}) => {
  mkdirSync(`${reviewDir}/raw`, { recursive: true });
  await ready(page, 'holding-pier');
  await page.locator('#inspect-shallows').click();
  await page.locator('#cancel').click();
  await page.waitForFunction(
    () => (window as any).__LAST_FERRY__.getAudioStatus().contextState === 'running',
  );
  await page.evaluate(() => {
    const api = (window as any).__LAST_FERRY__;
    const stream = api.captureAudioStream();
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    const record = {
      recorder,
      chunks: [] as Blob[],
      samples: [] as any[],
      startedAt: performance.now(),
      start: api.getAudioStatus(),
      timer: 0,
    };
    recorder.ondataavailable = (event) => {
      if (event.data.size) record.chunks.push(event.data);
    };
    record.timer = window.setInterval(
      () =>
        record.samples.push({
          wallMs: performance.now() - record.startedAt,
          audio: api.getAudioStatus(),
          state: api.getState(),
          arrival: api.getEnvironmentStatus().arrival,
          contacts: api.getEnvironmentStatus().contacts,
        }),
      100,
    );
    recorder.start(1000);
    (window as any).__adaptiveRecording = record;
  });
  const start = await audio(page),
    original = await state(page);
  await page.waitForTimeout(6000);
  expect(await state(page)).toEqual(original);
  expect((await audio(page)).desiredArrangement).toBe('ordinary');
  for (const id of holding) {
    await act(page, id);
    const current = await state(page);
    if (current.turn === 3) {
      const before = await audio(page);
      expect(before.desiredArrangement).toBe('deadline');
      await page.waitForTimeout(7000);
      expect(await state(page)).toEqual(current);
      expect((await audio(page)).desiredArrangement).toBe(before.desiredArrangement);
    }
    if (current.turn === 4) {
      expect((await audio(page)).desiredArrangement).toBe('ordinary');
      await undo(page);
      expect((await audio(page)).desiredArrangement).toBe('deadline');
      await act(page, 'board');
    }
    if (current.turn === 7) {
      expect((await audio(page)).desiredArrangement).toBe('homeward');
      await page.waitForTimeout(5000);
    }
  }
  expect((await state(page)).status).toBe('won');
  const delivered = await audio(page);
  expect(delivered.deliveryCount).toBe(1);
  expect(delivered.pendingTerminal).toBe(false);
  await undo(page);
  expect((await audio(page)).desiredArrangement).toBe('homeward');
  expect((await audio(page)).deliveryCount).toBe(1);
  await act(page, 'unload');
  const terminal = await state(page);
  await page.waitForFunction(
    () =>
      (window as any).__LAST_FERRY__.getAudioStatus().currentTime -
        (window as any).__adaptiveRecording.start.currentTime >=
      82,
    undefined,
    { timeout: 100000 },
  );
  expect(await state(page)).toEqual(terminal);
  const recording = await page.evaluate(async () => {
    const record = (window as any).__adaptiveRecording;
    clearInterval(record.timer);
    const stopped = new Promise((resolve) => (record.recorder.onstop = resolve));
    record.recorder.stop();
    await stopped;
    const blob = new Blob(record.chunks, { type: record.recorder.mimeType });
    const data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.readAsDataURL(blob);
    });
    return {
      data,
      samples: record.samples,
      start: record.start,
      end: (window as any).__LAST_FERRY__.getAudioStatus(),
      wallMs: performance.now() - record.startedAt,
      bytes: blob.size,
      mimeType: record.recorder.mimeType,
    };
  });
  const media = Buffer.from(recording.data, 'base64');
  writeFileSync(`${reviewDir}/raw/adaptive-rescue-loop.webm`, media);
  const { data: _data, ...metadata } = recording;
  writeFileSync(
    `${reviewDir}/adaptive-runtime-mix.json`,
    JSON.stringify(
      {
        method:
          'Actual Web Audio master stream MediaRecorder, real UI rescue and Undo, no offline synthesis',
        path: `${reviewDir}/raw/adaptive-rescue-loop.webm`,
        sha256: createHash('sha256').update(media).digest('hex'),
        ...metadata,
      },
      null,
      2,
    ),
  );
  const moods = new Set(recording.samples.map((sample: any) => sample.audio.arrangement));
  expect([...moods]).toEqual(expect.arrayContaining(['ordinary', 'deadline', 'homeward', 'won']));
  expect(recording.end.loopCount).toBeGreaterThanOrEqual(1);
  expect(recording.end.currentTime).toBeGreaterThan(start.currentTime + 75);
  for (const sample of recording.samples) {
    expect(sample.audio.contextCount).toBe(1);
    expect(sample.audio.schedulerCount).toBe(1);
    expect(sample.audio.companionSources).toBeLessThanOrEqual(2);
    expect(sample.audio.sourceCount).toBeLessThanOrEqual(29);
    expect(sample.audio.droppedTones).toBe(0);
    expect(sample.audio.skippedEvents).toBe(0);
    expect(sample.audio.peak).toBeLessThan(0.95);
  }
  expect(recording.samples.some((sample: any) => sample.audio.companionNotes > 0)).toBe(true);
  expect(
    recording.samples.some(
      (sample: any) =>
        sample.audio.pendingTerminal === true &&
        sample.audio.desiredArrangement === 'won' &&
        sample.arrival.active === false,
    ),
  ).toBe(true);
  const initialContact = recording.samples
    .filter((sample: any) => sample.state.turn === 0)
    .map((sample: any) =>
      sample.contacts.meshes.find((mesh: any) => mesh.name === 'water-contact-hull'),
    );
  expect(initialContact.length).toBeGreaterThan(10);
  expect(
    Math.max(...initialContact.map((mesh: any) => mesh.worldY)) -
      Math.min(...initialContact.map((mesh: any) => mesh.worldY)),
  ).toBeGreaterThan(0.001);
  for (const mesh of initialContact) expect(mesh.localWaterY).toBeCloseTo(-mesh.worldY, 6);
});

test('home refinement: hidden winning unload reconciles without replaying an unseen delivery', async ({
  page,
}) => {
  await ready(page, 'holding-pier');
  for (const id of holding.slice(0, 8)) await act(page, id);
  const before = await audio(page);
  await page.locator('#unload').click();
  await page.locator('#commit').click();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await idle(page);
  expect((await state(page)).status).toBe('won');
  expect(await audio(page)).toMatchObject({
    desiredArrangement: 'won',
    pendingTerminal: false,
    deliveryCount: before.deliveryCount,
  });
  expect((await view(page)).arrival).toMatchObject({
    active: false,
    resting: true,
    glowVisible: true,
  });
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await undo(page);
  await home(page);
  expect((await audio(page)).deliveryCount).toBe(before.deliveryCount);
  expect((await state(page)).status).toBe('playing');
});
