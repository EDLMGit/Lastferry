import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import { act, activate, fullyVisible, idle, state, undo } from './ui';
import { coldTouch, journeyKey, measureStory, passive } from './story-support';

test.use({
  launchOptions: {
    ignoreDefaultArgs: ['--autoplay-policy=no-user-gesture-required'],
    args: [
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--autoplay-policy=document-user-activation-required',
    ],
  },
});
test.setTimeout(240000);
mkdirSync(`${reviewDir}/raw`, { recursive: true });
const save = (name: string, data: unknown) =>
  writeFileSync(`${reviewDir}/${name}.json`, JSON.stringify(data, null, 2));
const inspect = (page: Page) =>
  passive(page, () => {
    const g = (window as any).__LAST_FERRY__;
    return {
      at: performance.timeOrigin + performance.now(),
      state: g.getState(),
      story: g.getStoryStatus(),
      campaign: g.getCampaignStatus(),
      render: g.getRenderStatus(),
      audio: g.getAudioStatus(),
    };
  });
const checkpoint = (page: Page) => passive(page, (key) => localStorage.getItem(key), journeyKey);
async function snap(page: Page, name: string) {
  await nativeFrame(page, name);
  const observation = await inspect(page);
  save(name, observation);
  return observation;
}
async function nativeFrame(page: Page, name: string) {
  const session = await page.context().newCDPSession(page);
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const image = await Promise.race([
      session.send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
        captureBeyondViewport: false,
      }),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error(`Native capture exceeded 30s: ${name}`)), 30000);
      }),
    ]);
    writeFileSync(`${reviewDir}/${name}.png`, Buffer.from(image.data, 'base64'));
  } finally {
    if (timeout) clearTimeout(timeout);
    await session.detach().catch(() => undefined);
  }
}
function source(name: string) {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
    );
  save(name, {
    at: new Date().toISOString(),
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    status: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
    files: Object.fromEntries(
      [...walk('src'), ...walk('data'), 'package.json', 'package-lock.json', 'index.html', 'vite.config.ts']
        .sort()
        .map((p) => [p, createHash('sha256').update(readFileSync(p)).digest('hex')]),
    ),
    node: process.version,
  });
}
test.beforeAll(() => {
  source('journey-source-before');
  const fixture = readFileSync('tests/e2e/play-readability-journey.spec.ts');
  writeFileSync(`${reviewDir}/raw/executed-play-readability-journey.spec.ts`, fixture);
  save('journey-fixture', { sha256: createHash('sha256').update(fixture).digest('hex') });
});
test.afterAll(() => source('journey-source-after'));

async function recordRuntime(page: Page, name: string) {
  const directory = `${reviewDir}/raw/${name}`;
  mkdirSync(directory, { recursive: true });
  const audioAvailable = await passive(page, () => {
    const stream = (window as any).__LAST_FERRY__.captureAudioStream();
    if (!stream) return false;
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    const start = performance.timeOrigin + performance.now();
    const stopped = new Promise<number[]>((resolve) => {
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () =>
        resolve(Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())));
    });
    (window as any).__readabilityRecording = { recorder, start, stopped };
    recorder.start();
    return true;
  });
  const cdp = await page.context().newCDPSession(page);
  const frames: { path: string; timestamp: number; receipt: number }[] = [];
  cdp.on('Page.screencastFrame', (event) => {
    const path = `${directory}/frame-${String(frames.length).padStart(6, '0')}.jpg`;
    writeFileSync(path, Buffer.from(event.data, 'base64'));
    frames.push({ path, timestamp: event.metadata.timestamp!, receipt: Date.now() });
    void cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId });
  });
  await cdp.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 87,
    maxWidth: page.viewportSize()!.width,
    maxHeight: page.viewportSize()!.height,
    everyNthFrame: 3,
  });
  return async () => {
    await cdp.send('Page.stopScreencast');
    const recording = audioAvailable
      ? await passive(page, async () => {
          const r = (window as any).__readabilityRecording;
          r.recorder.stop();
          return { start: r.start, bytes: await r.stopped };
        })
      : null;
    if (recording) writeFileSync(`${directory}/runtime-audio.webm`, new Uint8Array(recording.bytes));
    const manifest = {
      name,
      viewport: page.viewportSize(),
      audioStartEpochMs: recording?.start ?? null,
      audio: recording ? `${directory}/runtime-audio.webm` : null,
      frames,
      method:
        'Uninterrupted native viewport CDP frames and existing Sound capture stream at runtime levels. Actual UI actions at natural animation speed; no game state injection, cuts, time scaling or substituted audio. Frame timestamps retain capture stalls.',
    };
    save(`${name}-recording`, manifest);
    await cdp.detach();
    return manifest;
  };
}

test('actual portrait Holding rescue, tide and terminal Undo, then uninterrupted Harbor handoff', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors: string[] = [];
  const observations: unknown[] = [];
  let stop: Awaited<ReturnType<typeof recordRuntime>> | undefined;
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    await page.goto('/');
    await expect(page.locator('#home-play')).toBeVisible();
    await coldTouch(page, 'home-play');
    await expect(page.locator('#story-continue')).toBeVisible();
    for (const shot of ['lantern', 'ferry']) {
      await page.waitForTimeout(550);
      await activate(page, 'story-continue', true);
      await expect.poll(async () => (await inspect(page)).story.timeline.shot).toBe(shot);
    }
    await page.waitForTimeout(550);
    await activate(page, 'story-continue', true);
    await expect(page.locator('#story-continue')).toBeHidden();
    await idle(page);
    expect(await state(page)).toMatchObject({ turn: 0, tideLevel: 0, boatNodeId: 'stone', aboard: ['sheep-1'] });
    const coveStart = await checkpoint(page);
    stop = await recordRuntime(page, 'actual-holding-harbor');
    await snap(page, '390x844-holding-start');
    await act(page, 'unload', true);
    for (const id of ['map-shallows', 'map-rabbit-pier']) {
      const before = await state(page);
      await activate(page, id, true);
      expect(await state(page)).toEqual(before);
      await fullyVisible(page, page.locator('#sail'));
      await activate(page, 'sail', true);
      await idle(page);
      expect((await state(page)).turn).toBe(before.turn + 1);
    }
    const beforeRise = await state(page);
    await activate(page, 'board', true);
    await expect(page.locator('#preview')).toContainText(/Pip.*Rue/s);
    for (const id of ['passenger-rabbit-1', 'passenger-rabbit-2', 'commit']) await fullyVisible(page, page.locator(`#${id}`));
    await snap(page, '390x844-critical-boarding');
    await activate(page, 'commit', true);
    await idle(page);
    expect(await state(page)).toMatchObject({ turn: 4, tideLevel: 1, status: 'playing' });
    await snap(page, '390x844-holding-first-rise');
    await undo(page, true);
    expect(await state(page)).toEqual(beforeRise);
    await act(page, 'board', true);
    for (const id of ['map-shallows', 'map-stone', 'board', 'map-harbor']) await act(page, id, true);
    const beforeVictory = await state(page);
    await act(page, 'unload', true);
    expect(await state(page)).toMatchObject({ turn: 9, tideLevel: 2, status: 'won' });
    expect(await checkpoint(page)).toBe(coveStart);
    await undo(page, true);
    expect(await state(page)).toEqual(beforeVictory);
    await act(page, 'unload', true);
    await snap(page, '390x844-holding-arrival');
    observations.push(await inspect(page));
    await activate(page, 'continue-story', true);
    await fullyVisible(page, page.locator('#story-continue'));
    const pending = await checkpoint(page);
    expect(JSON.parse(pending!)).toMatchObject({ checkpoint: { kind: 'scene', id: 'another-bell' }, completed: ['holding-pier'] });
    await snap(page, '390x844-earned-harbor-begin');
    const interruptions: unknown[] = [];
    await expect.poll(async () => {
      const frame = (await inspect(page)).story.timeline;
      if (frame.paused && !frame.settled) interruptions.push(frame);
      return frame.settled;
    }, { timeout: 20000, intervals: [150] }).toBe(true);
    save('harbor-uninterrupted-observations', interruptions);
    expect(interruptions).toEqual([]);
    expect(await checkpoint(page)).toBe(pending);
    const fit = await page.evaluate(measureStory);
    save('390x844-earned-harbor-fit', fit);
    expect(fit.failures).toEqual([]);
    await snap(page, '390x844-earned-harbor-end');
    await activate(page, 'story-continue', true);
    await idle(page);
    expect((await inspect(page)).campaign.level).toBe('bellwater');
    expect(await state(page)).toMatchObject({ turn: 0, tideLevel: 0, status: 'playing', boatNodeId: 'harbor', aboard: [], delivered: [] });
    const bellCheckpoint = await checkpoint(page);
    expect(JSON.parse(bellCheckpoint!)).toMatchObject({ completed: ['holding-pier'], acknowledgedScenes: ['opening', 'another-bell'] });
    await snap(page, '390x844-earned-bellwater-start');
    observations.push(await inspect(page));
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  } finally {
    if (stop) await stop();
    await nativeFrame(page, 'holding-final-observed').catch(() => undefined);
    save('holding-journey-result', { browser: browser.version(), node: process.version, baseURL, viewport: page.viewportSize(), errors, observations, final: await inspect(page).catch(() => null) });
    await context.close();
  }
});

test('actual short landscape Driftwood rescue preserves subset warnings, tide Undo and practice isolation', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 780, height: 320 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const saved = JSON.stringify({ version: 1, checkpoint: { kind: 'cove', id: 'holding-pier' }, completed: [], acknowledgedScenes: ['opening'] });
  try {
    await page.addInitScript(({ key, saved }) => localStorage.setItem(key, saved), { key: journeyKey, saved });
    await page.goto('/?cove=driftwood-yard');
    await idle(page);
    await snap(page, '780x320-driftwood-start');
    for (const id of ['map-yard', 'board', 'map-mooring', 'unload', 'map-bend', 'map-reeds']) {
      save('driftwood-last-action', { id, phase: 'before', observation: await inspect(page) });
      await act(page, id, true);
      save('driftwood-last-action', { id, phase: 'after', observation: await inspect(page) });
    }
    const beforeRise = await state(page);
    await activate(page, 'board', true);
    await activate(page, 'passenger-oat', true);
    await expect(page.locator('#preview')).toContainText(/Oat.*floods/s);
    expect(await state(page)).toEqual(beforeRise);
    await snap(page, '780x320-driftwood-subset-loss-preview');
    await activate(page, 'cancel', true);
    await activate(page, 'board', true);
    for (const id of ['passenger-fern', 'passenger-oat', 'commit']) await fullyVisible(page, page.locator(`#${id}`));
    await snap(page, '780x320-driftwood-critical-boarding');
    await activate(page, 'commit', true);
    await idle(page);
    expect(await state(page)).toMatchObject({ turn: 7, tideLevel: 1, status: 'playing', aboard: ['fern', 'oat'] });
    await snap(page, '780x320-driftwood-first-rise');
    await undo(page, true);
    expect(await state(page)).toEqual(beforeRise);
    await act(page, 'board', true);
    for (const id of ['map-bend', 'map-mooring', 'board', 'map-harbor']) await act(page, id, true);
    const beforeVictory = await state(page);
    expect(beforeVictory).toMatchObject({ turn: 11, tideLevel: 2 });
    await activate(page, 'unload', true);
    const fit = await page.evaluate(measureStory);
    save('780x320-driftwood-delivery-fit', fit);
    expect(fit.failures).toEqual([]);
    await snap(page, '780x320-driftwood-delivery');
    await activate(page, 'commit', true);
    await idle(page);
    expect(await state(page)).toMatchObject({ turn: 12, status: 'won' });
    await undo(page, true);
    expect(await state(page)).toEqual(beforeVictory);
    await act(page, 'unload', true);
    expect(await state(page)).toMatchObject({ turn: 12, status: 'won' });
    expect(await checkpoint(page)).toBe(saved);
    await snap(page, '780x320-driftwood-arrival');
    expect(errors).toEqual([]);
  } finally {
    await nativeFrame(page, 'driftwood-final-observed').catch(() => undefined);
    save('driftwood-journey-result', { browser: browser.version(), node: process.version, baseURL, viewport: page.viewportSize(), errors, final: await inspect(page).catch(() => null), saved, actual: await checkpoint(page).catch(() => null) });
    await context.close();
  }
});
