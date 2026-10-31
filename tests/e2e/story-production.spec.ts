import { expect, test, type Page } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { reviewDir, productionURL } from './evidence';
import { act, activate, fullyVisible, idle, state, tabTo, undo } from './ui';
import {
  checkpoint,
  coldTouch,
  passive,
  rescueBellwater,
  rescueHolding,
  title,
} from './story-support';

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
const openingText = [
  'Your first evening at the helm.\nA high tide ahead.',
  'Pip and Rue have kept a light for you.',
  'Moss is aboard.\nBring everyone to the lighthouse.',
];
const harborText = 'Pip, Rue and Moss are safe.\nBellwater is still waiting.';
const timeline = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getStoryStatus().timeline);
const audio = (page: Page) => passive(page, () => (window as any).__LAST_FERRY__.getAudioStatus());
const inspect = (page: Page) =>
  page.evaluate(() => {
    const g = (window as any).__LAST_FERRY__;
    return {
      at: Date.now(),
      story: g.getStoryStatus(),
      state: g.getState(),
      campaign: g.getCampaignStatus(),
      audio: g.getAudioStatus(),
      render: g.getRenderStatus(),
      metrics: g.getMetrics(),
      motion: g.getMotionStatus(),
    };
  });
const save = (name: string, value: unknown) =>
  writeFileSync(`${reviewDir}/${name}.json`, JSON.stringify(value, null, 2));
const hash = (value: Buffer | string) => createHash('sha256').update(value).digest('hex');
function source() {
  const walk = (path: string): string[] =>
    readdirSync(path, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(`${path}/${e.name}`) : [`${path}/${e.name}`],
    );
  const files = Object.fromEntries(
    [
      ...walk('src'),
      ...walk('data'),
      ...(existsSync('public') ? walk('public') : []),
      'package.json',
      'package-lock.json',
      'index.html',
      'vite.config.ts',
    ]
      .sort()
      .map((path) => [path, hash(readFileSync(path))]),
  );
  return {
    capturedAt: new Date().toISOString(),
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    status: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
    files,
    sha256: hash(JSON.stringify(files)),
    node: process.version,
  };
}
test.beforeAll(() => {
  save('source-manifest', source());
  const fixture = readFileSync('tests/e2e/story-production.spec.ts');
  writeFileSync(`${reviewDir}/raw/executed-story-production.spec.ts`, fixture);
  save('executed-fixture', {
    path: 'tests/e2e/story-production.spec.ts',
    sha256: hash(fixture),
    copiedBeforeExecution: true,
  });
});
test.afterAll(() => save('source-after', source()));

async function holdingStart(page: Page) {
  await idle(page);
  expect(await state(page)).toMatchObject({
    turn: 0,
    tideLevel: 0,
    boatNodeId: 'stone',
    aboard: ['sheep-1'],
    delivered: [],
    status: 'playing',
    waitingByPier: { 'rabbit-pier': ['rabbit-1', 'rabbit-2'] },
  });
  const observed = await inspect(page);
  expect(observed.render.historyLength).toBe(0);
  expect(observed.story.timeline.scene).toBeNull();
  expect(JSON.parse((await checkpoint(page))!)).toMatchObject({
    checkpoint: { kind: 'cove', id: 'holding-pier' },
    acknowledgedScenes: ['opening'],
  });
}
async function settled(page: Page) {
  await expect.poll(async () => (await timeline(page)).settled, { timeout: 12000 }).toBe(true);
  await expect(page.locator('#story-caption')).toHaveCSS('opacity', '1');
}
async function geometry(page: Page) {
  return page.evaluate(() => {
    const dialog = document.getElementById('dialog')!,
      surface = dialog.getBoundingClientRect();
    const faults: string[] = [];
    const visible = (e: HTMLElement) =>
      e.getBoundingClientRect().width > 0 &&
      !e.closest('[hidden],.sr-only') &&
      getComputedStyle(e).visibility !== 'hidden';
    const nodes = [...dialog.querySelectorAll<HTMLElement>('*')].filter(visible);
    for (const e of nodes) {
      const style = getComputedStyle(e);
      if (e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1 && style.display !== 'inline')
        faults.push(
          `${e.id || e.className}: horizontal overflow ${e.scrollWidth}/${e.clientWidth}`,
        );
    }
    const controls = nodes
      .filter((e) => e.tagName === 'BUTTON')
      .map((e) => {
        const r = e.getBoundingClientRect();
        if (
          r.left < -0.5 ||
          r.top < -0.5 ||
          r.right > innerWidth + 0.5 ||
          r.bottom > innerHeight + 0.5
        )
          faults.push(`${e.id}: outside viewport`);
        if (r.width < 44 || r.height < 44) faults.push(`${e.id}: target below44`);
        return { id: e.id, rect: r.toJSON(), label: e.textContent };
      });
    const caption = document.getElementById('story-caption');
    const textRects = caption
      ? [...caption.childNodes]
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .flatMap((node) => {
            const range = document.createRange();
            range.selectNodeContents(node);
            return [...range.getClientRects()].map((r) => r.toJSON());
          })
      : [];
    for (const r of textRects)
      if (
        r.left < surface.left - 0.5 ||
        r.right > surface.right + 0.5 ||
        r.top < surface.top - 0.5 ||
        r.bottom > surface.bottom + 0.5
      )
        faults.push('caption fragment clipped');
    if (caption)
      for (
        let ancestor: HTMLElement | null = caption.parentElement;
        ancestor;
        ancestor = ancestor.parentElement
      ) {
        const style = getComputedStyle(ancestor),
          clip = ancestor.getBoundingClientRect();
        for (const r of textRects) {
          if (
            /(hidden|clip|scroll|auto)/.test(style.overflowY) &&
            (r.top < clip.top - 0.5 || r.bottom > clip.bottom + 0.5)
          )
            faults.push(`caption clipped vertically by ${ancestor.id || ancestor.className}`);
          if (
            /(hidden|clip|scroll|auto)/.test(style.overflowX) &&
            (r.left < clip.left - 0.5 || r.right > clip.right + 0.5)
          )
            faults.push(`caption clipped horizontally by ${ancestor.id || ancestor.className}`);
        }
      }
    const canvas = document.getElementById('story-canvas')!;
    return {
      viewport: { width: innerWidth, height: innerHeight, scale: devicePixelRatio },
      surface: surface.toJSON(),
      controls,
      textRects,
      captionFont: caption ? getComputedStyle(caption).font : null,
      canvas: canvas?.getBoundingClientRect().toJSON(),
      description: canvas?.getAttribute('aria-label'),
      faults,
      pageScroll: {
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      },
    };
  });
}
async function snapshot(page: Page, name: string) {
  const before = await inspect(page);
  await page.screenshot({ path: `${reviewDir}/${name}.png` });
  const record = { before, after: await inspect(page), geometry: await geometry(page) };
  save(name, record);
  expect(record.geometry.faults).toEqual([]);
  expect(record.geometry.pageScroll.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(record.geometry.pageScroll.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  expect(record.geometry.description?.length).toBeGreaterThan(20);
  return record;
}
async function watchShot(page: Page, prefix: string) {
  const before = await inspect(page),
    pending = await checkpoint(page);
  const samples = await page.evaluate(async () => {
    const out: any[] = [];
    await new Promise<void>((done) => {
      const sample = () => {
        const g = (window as any).__LAST_FERRY__,
          s = g.getStoryStatus();
        const a = g.getAudioStatus();
        out.push({
          at: performance.now(),
          timeline: s.timeline,
          drawCount: s.view?.drawCount,
          clockPending: s.clockPending,
          coveredWorld: s.coveredWorld,
          worldFramePending: s.worldFramePending,
          opacity: getComputedStyle(document.getElementById('story-caption')!).opacity,
          audio: {
            currentTime: a.currentTime,
            running: a.running,
            contextCount: a.contextCount,
            schedulerCount: a.schedulerCount,
            sourceCount: a.sourceCount,
            storyPlayed: a.storyPlayed,
            storySkipped: a.storySkipped,
            storyToken: a.storyToken,
            storySources: a.storySources,
            storyOwnedSources: a.storyOwnedSources,
            lastStoryCue: a.lastStoryCue,
          },
        });
        if (s.timeline.settled) done();
        else requestAnimationFrame(sample);
      };
      sample();
    });
    return out;
  });
  writeFileSync(`${reviewDir}/${prefix}-temporal.json`, JSON.stringify(samples));
  await settled(page);
  await snapshot(page, `${prefix}-end`);
  const held = await inspect(page);
  await page.waitForTimeout(400);
  const later = await inspect(page);
  expect(later.story.view.drawCount).toBe(held.story.view.drawCount);
  expect(later.story.timeline).toEqual(held.story.timeline);
  expect(later.story).toMatchObject({
    clockPending: false,
    coveredWorld: true,
    worldFramePending: false,
  });
  expect(later.metrics.frames).toBe(before.metrics.frames);
  expect(await checkpoint(page)).toBe(pending);
  expect(later.state).toEqual(before.state);
  expect(samples.at(-1).timeline.elapsed).toBe(samples.at(-1).timeline.duration);
  expect(samples.some((s) => s.timeline.elapsed < 1050 && Number(s.opacity) === 0)).toBe(true);
  expect(samples.some((s) => s.timeline.elapsed > 1400 && Number(s.opacity) === 1)).toBe(true);
  return samples;
}
async function recordRuntime(page: Page, name: string) {
  const directory = `${reviewDir}/raw/${name}`;
  mkdirSync(directory, { recursive: true });
  const audioStart = await page.evaluate(() => {
    const stream = (window as any).__LAST_FERRY__.captureAudioStream();
    if (!stream) throw Error('No existing runtime audio stream');
    const chunks: Blob[] = [],
      recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    const start = performance.timeOrigin + performance.now();
    const stopped = new Promise<number[]>((resolve) => {
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () =>
        resolve(Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())));
    });
    (window as any).__storyRecording = { recorder, stopped, start };
    recorder.start();
    return start;
  });
  const cdp = await page.context().newCDPSession(page),
    frames: { path: string; timestamp: number; receipt: number }[] = [];
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
    everyNthFrame: 2,
  });
  return async () => {
    await cdp.send('Page.stopScreencast');
    const audioBytes = await page.evaluate(async () => {
      const capture = (window as any).__storyRecording;
      capture.recorder.stop();
      return capture.stopped as Promise<number[]>;
    });
    writeFileSync(`${directory}/runtime-audio.webm`, new Uint8Array(audioBytes));
    const manifest = {
      name,
      viewport: page.viewportSize(),
      audioStartEpochMs: audioStart,
      audio: `${directory}/runtime-audio.webm`,
      frames,
      method:
        'Uninterrupted native viewport CDP screencast plus existing Sound.captureStream master output; timestamp alignment only, no level adjustment, normalization, substituted audio or gameplay state injection.',
    };
    save(`${name}-recording`, manifest);
    await cdp.detach();
    return manifest;
  };
}

test('production actual audible two-cove journey and complete Undo', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage(),
    observations: any[] = [],
    errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  let stop: Awaited<ReturnType<typeof recordRuntime>> | undefined;
  try {
    await title(page);
    await activate(page, 'journey-settings', true);
    await expect.poll(async () => (await audio(page)).running).toBe(true);
    await activate(page, 'settings-back', true);
    stop = await recordRuntime(page, 'actual-journey');
    await activate(page, 'journey-new', true);
    const pending = await checkpoint(page),
      initial = await state(page);
    const gameplayCanvas = await page.locator('#world canvas').elementHandle();
    for (let shot = 0; shot < 3; shot++) {
      expect((await timeline(page)).shotIndex).toBe(shot);
      await expect(page.locator('#story-continue')).toBeEnabled();
      await watchShot(page, `844x390-opening-${shot}`);
      expect(await checkpoint(page)).toBe(pending);
      expect(await state(page)).toEqual(initial);
      const effects = await audio(page);
      expect(
        await gameplayCanvas!.evaluate(
          (element) => element.isConnected && element === document.querySelector('#world canvas'),
        ),
      ).toBe(true);
      expect(await page.locator('canvas').count()).toBe(2);
      expect(effects.storyPlayed).toBe(shot + 1);
      expect(effects.lastStoryCue.played).toBe(true);
      expect(effects.arrivalEventCount).toBe(0);
      expect(effects.transferContacts).toBe(0);
      expect(effects.travelRequested).toBe(false);
      observations.push(await inspect(page));
      await activate(page, 'story-continue', true);
    }
    await holdingStart(page);
    const accepted = await checkpoint(page);
    await rescueHolding(page, true);
    expect(await checkpoint(page)).toBe(accepted);
    await undo(page, true);
    expect(await state(page)).toMatchObject({ turn: 8, status: 'playing', delivered: [] });
    await act(page, 'unload', true);
    await expect(page.locator('#continue-story')).toBeVisible();
    const won = await state(page),
      priorAudio = await audio(page);
    await activate(page, 'continue-story', true);
    await expect(page.locator('#story-continue')).toHaveText(/Continue to Bellwater/);
    await watchShot(page, '844x390-harbor');
    const harborAudio = await audio(page);
    expect(harborAudio.storyPlayed).toBe(4);
    expect(harborAudio.arrivalEventCount).toBe(priorAudio.arrivalEventCount);
    expect(harborAudio.deliveryCount).toBe(priorAudio.deliveryCount);
    expect(harborAudio.victoryTarget).toBe(priorAudio.victoryTarget);
    expect(await state(page)).toEqual(won);
    observations.push({ harbor: await inspect(page), priorAudio });
    await activate(page, 'story-continue', true);
    expect(await state(page)).toMatchObject({
      turn: 0,
      boatNodeId: 'harbor',
      aboard: [],
      delivered: [],
      status: 'playing',
    });
    await rescueBellwater(page, true);
    await activate(page, 'continue-story', true);
    await expect(page.locator('#dialog')).toContainText('Both coves are safe.');
    await expect(page.locator('#dialog')).toContainText(
      'The next part of the journey is still being made.',
    );
    observations.push(await inspect(page));
    await page.waitForTimeout(1500);
    expect(errors).toEqual([]);
  } finally {
    if (stop) await stop();
    save('actual-journey', { observations, errors, browser: browser.version() });
    await context.close();
  }
});

test('production native temporal phone compositions and all required viewport fits', async ({
  browser,
  baseURL,
}) => {
  const records: any[] = [];
  for (const [width, height] of [
    [390, 844],
    [780, 320],
    [320, 740],
    [844, 390],
    [1440, 900],
  ]) {
    const detailed = width === 390 || width === 780;
    const context = await browser.newContext({
      baseURL,
      viewport: { width, height },
      hasTouch: true,
      isMobile: width < 1000,
      deviceScaleFactor: 1,
      recordVideo: { dir: `${reviewDir}/raw`, size: { width, height } },
    });
    const page = await context.newPage(),
      run: any = { width, height, detailed, snapshots: [] };
    try {
      await title(page);
      await activate(page, 'journey-new', true);
      const pending = await checkpoint(page);
      for (let shot = 0; shot < 3; shot++) {
        if (detailed) {
          const begin = await snapshot(page, `${width}x${height}-shot-${shot}-begin`);
          run.snapshots.push(begin);
          expect(begin.before.story.timeline.settled).toBe(false);
          expect(begin.before.story.timeline.elapsed).toBeLessThan(1050);
          await page.waitForFunction(
            () => (window as any).__LAST_FERRY__.getStoryStatus().timeline.elapsed >= 2800,
          );
          const middle = await snapshot(page, `${width}x${height}-shot-${shot}-intermediate`);
          run.snapshots.push(middle);
          expect(middle.before.story.timeline.settled).toBe(false);
          expect(middle.before.story.timeline.elapsed).toBeLessThan(4000);
          await settled(page);
        } else await page.waitForTimeout(1400);
        run.snapshots.push(
          await snapshot(page, `${width}x${height}-shot-${shot}-${detailed ? 'end' : 'fit'}`),
        );
        expect(await checkpoint(page)).toBe(pending);
        if (shot < 2) await activate(page, 'story-continue', true);
      }
      await activate(page, 'story-read', true);
      for (const copy of openingText)
        for (const line of copy.split('\n'))
          await expect(page.locator('#dialog')).toContainText(line);
      await fullyVisible(page, page.locator('#story-read-back'));
      await page.keyboard.press('Escape');
      await expect(page.locator('#story-read')).toBeFocused();
      await activate(page, 'story-continue', true);
      await holdingStart(page);
      await page.evaluate(() =>
        localStorage.setItem(
          'last-ferry.journey.v1',
          JSON.stringify({
            version: 1,
            checkpoint: { kind: 'scene', id: 'another-bell' },
            completed: ['holding-pier'],
            acknowledgedScenes: ['opening'],
          }),
        ),
      );
      await page.reload();
      await activate(page, 'journey-continue', true);
      expect(await timeline(page)).toMatchObject({
        scene: 'another-bell',
        shotIndex: 0,
        settled: true,
      });
      run.harborFixture =
        'Valid pending cove-boundary checkpoint, separate from the real uninterrupted earned-rescue sequence. Replay drives actual production illustration; no gameplay state is injected.';
      if (detailed) {
        await activate(page, 'story-replay-scene', true);
        const begin = await snapshot(page, `${width}x${height}-harbor-begin`);
        run.snapshots.push(begin);
        expect(begin.before.story.timeline.settled).toBe(false);
        expect(begin.before.story.timeline.elapsed).toBeLessThan(1050);
        await page.waitForFunction(
          () => (window as any).__LAST_FERRY__.getStoryStatus().timeline.elapsed >= 2800,
        );
        run.snapshots.push(await snapshot(page, `${width}x${height}-harbor-intermediate`));
        await settled(page);
      }
      run.snapshots.push(await snapshot(page, `${width}x${height}-harbor-end`));
    } finally {
      run.video = await page.video()!.path();
      await context.close();
      records.push(run);
      save('native-compositions', records);
    }
  }
});

test('production navigation, restored checkpoints, Reduced Motion and isolated practice', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage(),
    records: any[] = [];
  try {
    await title(page);
    await tabTo(page, 'journey-new');
    await page.keyboard.press('Enter');
    const pending = await checkpoint(page),
      original = await state(page);
    await tabTo(page, 'story-read');
    await page.keyboard.press('Enter');
    expect((await timeline(page)).shotIndex).toBe(0);
    expect((await timeline(page)).settled).toBe(true);
    for (const copy of openingText)
      for (const line of copy.split('\n'))
        await expect(page.locator('#dialog')).toContainText(line);
    await page.keyboard.press('Escape');
    await expect(page.locator('#story-read')).toBeFocused();
    await tabTo(page, 'story-settings', true);
    await page.keyboard.press('Enter');
    await page.locator('#motion-preference').selectOption('reduced');
    await page.keyboard.press('Escape');
    await expect(page.locator('#story-settings')).toBeFocused();
    expect((await timeline(page)).shotIndex).toBe(0);
    await tabTo(page, 'story-continue');
    await page.keyboard.press('Enter');
    expect(await timeline(page)).toMatchObject({
      shotIndex: 1,
      settled: true,
      captionVisible: true,
    });
    await activate(page, 'story-settings', true);
    await page.locator('#motion-preference').selectOption('device');
    await activate(page, 'settings-back', true);
    expect(await timeline(page)).toMatchObject({ shotIndex: 1, settled: true });
    await activate(page, 'story-replay', true);
    expect(await timeline(page)).toMatchObject({ shotIndex: 1, settled: false });
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
      Object.defineProperty(document, 'hidden', { configurable: true, value: false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(await timeline(page)).toMatchObject({ shotIndex: 1, settled: true });
    expect(await checkpoint(page)).toBe(pending);
    expect(await state(page)).toEqual(original);
    await page.keyboard.press('Escape');
    expect(await timeline(page)).toMatchObject({ shotIndex: 2, settled: true });
    await expect(page.locator('#story-continue')).toBeFocused();
    await expect(page.locator('#story-replay-scene')).toBeVisible();
    await snapshot(page, '390x844-skip-recap');
    await page.setViewportSize({ width: 780, height: 320 });
    await snapshot(page, '780x320-skip-recap');
    await page.setViewportSize({ width: 390, height: 844 });
    records.push(await inspect(page));
    await page.reload();
    await activate(page, 'journey-continue', true);
    expect(await timeline(page)).toMatchObject({ shotIndex: 2, settled: true });
    expect(await checkpoint(page)).toBe(pending);
    await activate(page, 'story-replay-scene', true);
    expect(await timeline(page)).toMatchObject({ shotIndex: 0, settled: false });
    await tabTo(page, 'story-continue');
    await page.keyboard.down('Enter');
    expect((await timeline(page)).shotIndex).toBe(1);
    await page.keyboard.down('Enter');
    expect((await timeline(page)).shotIndex).toBe(1);
    await page.keyboard.up('Enter');
    await page.locator('#story-continue').dblclick();
    expect(await timeline(page)).toMatchObject({ scene: 'opening', shotIndex: 2 });
    expect(await checkpoint(page)).toBe(pending);
    await expect(page.locator('#story-continue')).toBeEnabled();
    await expect(page.locator('#story-continue')).toHaveText(/Take the helm/);
    expect((await timeline(page)).settled).toBe(false);
    const final = await page.locator('#story-continue').boundingBox();
    await page.touchscreen.tap(final!.x + final!.width / 2, final!.y + final!.height / 2);
    await page.touchscreen.tap(final!.x + final!.width / 2, final!.y + final!.height / 2);
    await holdingStart(page);
    records.push(await inspect(page));
    const saved = await checkpoint(page);
    for (const cove of ['first-crossing', 'holding-pier', 'bellwater']) {
      await page.goto(`/?cove=${cove}`);
      await idle(page);
      expect((await inspect(page)).campaign.entry).toBe('direct');
      expect(await checkpoint(page)).toBe(saved);
      await activate(page, 'menu', true);
      await page.keyboard.press('Escape');
    }
    await page.goto('/');
    await activate(page, 'journey-continue', true);
    await holdingStart(page);
  } finally {
    save('navigation-lifecycle', records);
    await context.close();
  }
});

test('production cold audio, canceled story cues, mute and bounded Replay', async ({
  browser,
  baseURL,
}) => {
  const records: any[] = [];
  for (const muted of [false, true]) {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 844, height: 390 },
      hasTouch: true,
      isMobile: true,
    });
    if (muted) await context.addInitScript(() => localStorage.setItem('last-ferry-muted', 'true'));
    const page = await context.newPage();
    try {
      await page.goto('/');
      await expect
        .poll(() =>
          passive(
            page,
            () => !!document.getElementById('journey-new')?.getBoundingClientRect().width,
          ),
        )
        .toBe(true);
      const before = await passive(page, () => ({
        activation: navigator.userActivation.hasBeenActive,
        audio: (window as any).__LAST_FERRY__.getAudioStatus(),
      }));
      expect(before.activation).toBe(false);
      expect(before.audio.contextCount).toBe(0);
      await coldTouch(page, 'journey-new');
      if (!muted) await expect.poll(async () => (await audio(page)).running).toBe(true);
      const pending = await checkpoint(page);
      await activate(page, 'story-continue', true);
      await activate(page, 'story-replay', true);
      await activate(page, 'story-read', true);
      const quiet = await audio(page);
      expect(Number.isInteger(quiet.storyPlayed)).toBe(true);
      await page.waitForTimeout(1900);
      const later = await audio(page);
      expect(later.storyPlayed).toBe(quiet.storyPlayed);
      expect(later.storyOwnedSources).toBe(0);
      await page.keyboard.press('Escape');
      await activate(page, 'story-settings', true);
      if (!muted) await activate(page, 'settings-sound', true);
      await expect.poll(async () => (await audio(page)).muted).toBe(true);
      await activate(page, 'settings-back', true);
      for (let i = 0; i < 4; i++) await activate(page, 'story-replay', true);
      await settled(page);
      const silent = await audio(page);
      await activate(page, 'story-settings', true);
      await activate(page, 'settings-sound', true);
      await expect.poll(async () => (await audio(page)).running).toBe(true);
      await activate(page, 'settings-back', true);
      await page.waitForTimeout(400);
      const recovered = await audio(page);
      expect(recovered.storyPlayed).toBe(silent.storyPlayed);
      expect(recovered).toMatchObject({ contextCount: 1, schedulerCount: 1 });
      expect(recovered.sourceCount).toBeLessThanOrEqual(32);
      expect(recovered.peakStorySources).toBeLessThanOrEqual(2);
      expect(await checkpoint(page)).toBe(pending);
      await activate(page, 'story-skip', true);
      await activate(page, 'story-continue', true);
      await holdingStart(page);
      records.push({ muted, before, quiet, later, silent, recovered, handoff: await audio(page) });
    } finally {
      await context.close();
      save('audio-lifecycle', records);
    }
  }
});

test('production controlled pending resume cannot revive a skipped story cue after mute', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
  });
  await context.addInitScript(() => {
    const Native = window.AudioContext;
    const nativeState = Object.getOwnPropertyDescriptor(BaseAudioContext.prototype, 'state')!.get!;
    let context: AudioContext,
      resolveOld: () => void,
      blocked = true,
      requests = 0;
    const Controlled = function () {
      context = new Native();
      const resume = context.resume.bind(context);
      Object.defineProperty(context, 'state', {
        configurable: true,
        get: () => (blocked ? 'suspended' : nativeState.call(context)),
      });
      context.resume = () => {
        requests++;
        return requests === 1
          ? new Promise<void>((done) => (resolveOld = done))
          : ((blocked = false), resume());
      };
      (window as any).__storyResumeGate = {
        status: () => ({ blocked, requests, nativeState: nativeState.call(context) }),
        resolve: async () => {
          blocked = false;
          await resume();
          resolveOld();
        },
      };
      return context;
    };
    Controlled.prototype = Native.prototype;
    Object.setPrototypeOf(Controlled, Native);
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: Controlled });
  });
  const page = await context.newPage();
  try {
    await page.goto('/');
    await expect
      .poll(() =>
        passive(
          page,
          () => !!document.getElementById('journey-new')?.getBoundingClientRect().width,
        ),
      )
      .toBe(true);
    await coldTouch(page, 'journey-new');
    await expect
      .poll(
        async () => {
          const a = await audio(page);
          return a.storySkipped + a.storyRejected;
        },
        { timeout: 8000 },
      )
      .toBeGreaterThan(0);
    const pending = await audio(page);
    save('pending-audio-before-mute', {
      audio: pending,
      story: await timeline(page),
      gate: await passive(page, () => (window as any).__storyResumeGate.status()),
    });
    expect(pending.storyPlayed).toBe(0);
    await activate(page, 'story-settings', true);
    if (await page.locator('#settings-mute').isVisible())
      await activate(page, 'settings-mute', true);
    else if (!(await audio(page)).muted) await activate(page, 'settings-sound', true);
    await expect.poll(async () => (await audio(page)).muted).toBe(true);
    await passive(page, async () => (window as any).__storyResumeGate.resolve());
    await page.waitForTimeout(250);
    const late = await audio(page);
    expect(late.storyPlayed).toBe(0);
    expect(late.storyOwnedSources).toBe(0);
    expect(late.muted).toBe(true);
    await activate(page, 'settings-back', true);
    await activate(page, 'story-skip', true);
    expect(await timeline(page)).toMatchObject({ shotIndex: 2, settled: true });
    save('pending-audio', {
      method:
        'Controlled first resume promise/state gate around a real native AudioContext; not a new browser-policy or physical Android reproduction.',
      pending,
      late,
      gate: await passive(page, () => (window as any).__storyResumeGate.status()),
    });
  } finally {
    await context.close();
  }
});

test('production native fullscreen dialog ownership and built root entry', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  try {
    await title(page);
    await activate(page, 'journey-new', true);
    const pending = await checkpoint(page);
    await tabTo(page, 'story-settings');
    await page.keyboard.press('Enter');
    await tabTo(page, 'fullscreen');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
    await activate(page, 'settings-back');
    await expect(page.locator('#dialog')).toHaveAttribute('open', '');
    await expect(page.locator('#story-settings')).toBeFocused();
    expect((await timeline(page)).shotIndex).toBe(0);
    await activate(page, 'story-read');
    await page.keyboard.press('Escape');
    await expect(page.locator('#story-read')).toBeFocused();
    await activate(page, 'story-settings');
    await activate(page, 'fullscreen');
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
    await activate(page, 'settings-back');
    await page.setViewportSize({ width: 780, height: 320 });
    await snapshot(page, '780x320-rotation-held');
    expect(await checkpoint(page)).toBe(pending);
    save('fullscreen', await inspect(page));
  } finally {
    await context.close();
  }
  const production = await browser.newContext({
    viewport: { width: 320, height: 740 },
    hasTouch: true,
    isMobile: true,
  });
  const built = await production.newPage(),
    errors: string[] = [];
  built.on('pageerror', (error) => errors.push(error.message));
  try {
    await built.goto(`${productionURL}/`);
    await expect(built.locator('#journey-new')).toBeVisible();
    expect(await built.evaluate(() => '__LAST_FERRY__' in window)).toBe(false);
    expect(
      await built.evaluate(
        () =>
          '__COVE_STORY_TEXT__' in window ||
          ('speechSynthesis' in window &&
            document.querySelector('[data-narration],#narration-toggle') !== null),
      ),
    ).toBe(false);
    await expect(built.locator('iframe')).toHaveCount(0);
    await activate(built, 'journey-new', true);
    await expect(built.locator('#story-continue')).toHaveText(/Next/);
    await expect(
      built.getByRole('button', { name: /Play story|Finish story|Enable narration|Voice/i }),
    ).toHaveCount(0);
    await activate(built, 'story-skip', true);
    await expect(built.locator('#story-continue')).toHaveText(/Take the helm/);
    await fullyVisible(built, built.locator('#story-continue'));
    await activate(built, 'story-continue', true);
    await idle(built);
    await act(built, 'unload', true);
    await expect(built.locator('#readout')).toContainText('01 actions');
    expect(errors).toEqual([]);
    save('production', {
      url: built.url(),
      errors,
      scripts: await built
        .locator('script[src]')
        .evaluateAll((nodes) => nodes.map((n) => (n as HTMLScriptElement).src)),
    });
  } finally {
    await production.close();
  }
});

test('production narrow Harbor native portrait captures and held restoration', async ({
  browser,
  baseURL,
}) => {
  const records: any[] = [];
  for (const [width, height] of [
    [320, 740],
    [390, 844],
    [780, 320],
  ]) {
    const context = await browser.newContext({
      baseURL,
      viewport: { width, height },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
    });
    await context.addInitScript(() =>
      localStorage.setItem(
        'last-ferry.journey.v1',
        JSON.stringify({
          version: 1,
          checkpoint: { kind: 'scene', id: 'another-bell' },
          completed: ['holding-pier'],
          acknowledgedScenes: ['opening'],
        }),
      ),
    );
    const page = await context.newPage();
    try {
      await title(page);
      await activate(page, 'journey-continue', true);
      expect(await timeline(page)).toMatchObject({
        scene: 'another-bell',
        shotIndex: 0,
        settled: true,
      });
      const before = await checkpoint(page);
      const held = await snapshot(page, `${width}x${height}-harbor-final-fit`);
      if (width === 320) {
        await activate(page, 'story-replay-scene', true);
        await snapshot(page, `${width}x${height}-harbor-final-begin`);
        await settled(page);
        await snapshot(page, `${width}x${height}-harbor-final-end`);
      }
      expect(await checkpoint(page)).toBe(before);
      records.push({
        width,
        height,
        fixture:
          'Valid pending Harbor scene checkpoint; illustration bounds judged from native captures, not a fabricated gameplay rescue.',
        held,
      });
    } finally {
      await context.close();
    }
  }
  save('narrow-harbor', records);
});
