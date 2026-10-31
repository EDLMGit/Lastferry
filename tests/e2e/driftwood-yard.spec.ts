import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { reviewDir } from './evidence';
import { act, activate, idle, state, undo, tabTo, keyAct, ready, fullyVisible } from './ui';
import { passive, journeyKey, rescueBellwater, measureStory, coldTouch } from './story-support';
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
const timeline = (page: Page) =>
  passive(page, () => (window as any).__LAST_FERRY__.getStoryStatus().timeline);
const snapshot = (page: Page) =>
  passive(page, () => {
    const g = (window as any).__LAST_FERRY__;
    return {
      state: g.getState(),
      story: g.getStoryStatus(),
      campaign: g.getCampaignStatus(),
      render: g.getRenderStatus(),
      audio: g.getAudioStatus(),
      images: [...document.querySelectorAll<HTMLImageElement>('img')].map((i) => ({
        src: i.currentSrc || i.src,
        complete: i.complete,
        width: i.naturalWidth,
        state: i.dataset.portraitState,
      })),
    };
  });
async function snap(page: Page, name: string) {
  await page.screenshot({ path: `${reviewDir}/${name}.png` });
  save(name, await snapshot(page));
}
const bell = {
  version: 1,
  checkpoint: { kind: 'cove', id: 'bellwater' },
  completed: ['holding-pier'],
  acknowledgedScenes: ['opening', 'another-bell'],
};
const legacy = {
  version: 1,
  checkpoint: { kind: 'complete' },
  completed: ['holding-pier', 'bellwater'],
  acknowledgedScenes: ['opening', 'another-bell'],
};
async function seeded(page: Page, record: unknown) {
  await page.addInitScript(
    ({ key, record }) => {
      if (!sessionStorage.seeded) {
        localStorage.setItem(key, JSON.stringify(record));
        sessionStorage.seeded = '1';
      }
    },
    { key: journeyKey, record },
  );
}
function source(name: string) {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
    );
  save(name, {
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    at: new Date().toISOString(),
    files: Object.fromEntries(
      [...walk('src'), ...walk('data'), 'package.json', 'package-lock.json']
        .sort()
        .map((p) => [p, createHash('sha256').update(readFileSync(p)).digest('hex')]),
    ),
    node: process.version,
  });
}
test.beforeAll(() => source('source-before'));
test.afterAll(() => source('source-after'));
async function endScene(page: Page, prefix: string) {
  await snap(page, `${prefix}-begin`);
  let middle = false;
  const interruptions: any[] = [];
  await expect
    .poll(
      async () => {
        const t = await timeline(page);
        if (!middle && t.elapsed >= 2800) {
          middle = true;
          await snap(page, `${prefix}-middle`);
        }
        if (t.paused && !t.settled && !t.recap) {
          interruptions.push(t);
          await activate(page, 'story-pause', true);
        }
        return t.settled;
      },
      { timeout: 30000, intervals: [180] },
    )
    .toBe(true);
  await snap(page, `${prefix}-end`);
  save(`${prefix}-interruptions`, interruptions);
}
async function namedFit(page: Page, name: string) {
  const result = await page.locator('.map-stop:not(.offscreen) .map-name').evaluateAll((nodes) => {
    const rects = nodes.map((n) => ({
      text: n.textContent,
      rect: n.getBoundingClientRect().toJSON(),
    }));
    const failures: string[] = [];
    for (let i = 0; i < rects.length; i++)
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i].rect,
          b = rects[j].rect;
        if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top)
          failures.push(`${rects[i].text}/${rects[j].text}`);
      }
    return { rects, failures };
  });
  save(name, result);
  expect(result.failures).toEqual([]);
}
async function driftRescue(page: Page, prefix: string) {
  expect(await state(page)).toMatchObject({ turn: 0, boatNodeId: 'harbor', aboard: [] });
  await snap(page, `${prefix}-start`);
  await activate(page, 'view-toggle', true);
  await namedFit(page, `${prefix}-overview-labels`);
  await snap(page, `${prefix}-overview`);
  for (const id of ['map-yard', 'board', 'map-mooring']) await act(page, id, true);
  await snap(page, `${prefix}-nell-aboard`);
  await act(page, 'unload', true);
  await snap(page, `${prefix}-nell-staged`);
  for (const id of ['map-bend', 'map-reeds']) await act(page, id, true);
  const before = await state(page);
  await activate(page, 'board', true);
  await activate(page, 'passenger-oat', true);
  await expect(page.locator('#preview')).toContainText(/Oat.*floods/);
  expect(await state(page)).toEqual(before);
  await activate(page, 'cancel', true);
  expect(await state(page)).toEqual(before);
  await activate(page, 'board', true);
  await expect
    .poll(() =>
      page
        .locator('#preview img')
        .evaluateAll((images) =>
          images.every(
            (i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  await snap(page, `${prefix}-rabbits-preview`);
  for (const id of ['passenger-fern', 'passenger-oat', 'commit'])
    await fullyVisible(page, page.locator(`#${id}`));
  await activate(page, 'commit', true);
  await idle(page);
  expect(await state(page)).toMatchObject({
    turn: 7,
    tideLevel: 1,
    status: 'playing',
    aboard: ['fern', 'oat'],
  });
  await snap(page, `${prefix}-first-rise`);
  await undo(page, true);
  expect(await state(page)).toEqual(before);
  await act(page, 'board', true);
  for (const id of ['map-bend', 'map-mooring', 'board']) await act(page, id, true);
  if (await page.locator('#back-to-boat').isVisible()) await activate(page, 'back-to-boat', true);
  await page.waitForTimeout(3400);
  await snap(page, `${prefix}-full-deck`);
  await act(page, 'map-harbor', true);
  expect(await state(page)).toMatchObject({ turn: 11, tideLevel: 2 });
  await activate(page, 'unload', true);
  save(`${prefix}-delivery-images-before`, await snapshot(page));
  await expect
    .poll(() =>
      page
        .locator('#preview img')
        .evaluateAll((images) =>
          images.every(
            (i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  await snap(page, `${prefix}-delivery-preview`);
  const fit = await page.evaluate(measureStory);
  save(`${prefix}-delivery-fit`, fit);
  expect(fit.failures).toEqual([]);
  await activate(page, 'commit', true);
  await idle(page);
  expect(await state(page)).toMatchObject({ turn: 12, status: 'won' });
  await snap(page, `${prefix}-arrival`);
  await undo(page, true);
  expect(await state(page)).toMatchObject({ turn: 11, status: 'playing', delivered: [] });
  await act(page, 'unload', true);
  expect(await state(page)).toMatchObject({ turn: 12, status: 'won' });
}
async function recordRuntime(page: Page, name: string) {
  const directory = `${reviewDir}/raw/${name}`;
  mkdirSync(directory, { recursive: true });
  await passive(page, () => {
    const startAudio = () => {
      const stream = (window as any).__LAST_FERRY__.captureAudioStream();
      if (!stream || (window as any).__storyRecording) return;
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
    };
    document.addEventListener('click', startAudio, { capture: true, once: true });
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
    everyNthFrame: 3,
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
      audioStartEpochMs: await passive(page, () => (window as any).__storyRecording.start),
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

test('earned Bellwater boundary, new scene and uninterrupted actual Driftwood rescue with audio', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 780, height: 320 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  const assetEvents: unknown[] = [];
  page.on('requestfailed', (request) =>
    assetEvents.push({ url: request.url(), failure: request.failure() }),
  );
  page.on('response', (response) => {
    if (response.url().includes('.png'))
      assetEvents.push({ url: response.url(), status: response.status() });
  });
  page.on('pageerror', (e) => errors.push(e.message));
  let stop: any;
  try {
    await seeded(page, bell);
    await page.goto('/');
    await coldTouch(page, 'home-play');
    await idle(page);
    stop = await recordRuntime(page, 'actual-boundary-rescue');
    await rescueBellwater(page, true);
    await undo(page, true);
    await act(page, 'unload', true);
    await activate(page, 'continue-story', true);
    await endScene(page, '780x320-driftwood-scene');
    await activate(page, 'story-continue', true);
    await idle(page);
    await driftRescue(page, '780x320');
    await activate(page, 'continue-story', true);
    await expect(page.locator('#dialog')).toContainText('Three coves are safe.');
    await snap(page, '780x320-complete');
    expect(errors).toEqual([]);
  } finally {
    save('actual-at-stop', await snapshot(page));
    save('asset-network-events', assetEvents);
    if (stop) await stop();
    save('actual-boundary-errors', errors);
    await context.close();
  }
});
test('portrait scene, actual rescue, Help and image failure fallback', async ({
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
    await seeded(page, legacy);
    await page.route('**/*beaver-brown*', async (route) => {
      if (route.request().resourceType() === 'image') await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.continue();
    });
    await page.goto('/');
    await coldTouch(page, 'home-play');
    await endScene(page, '390x844-driftwood-scene');
    await activate(page, 'story-continue', true);
    await idle(page);
    await activate(page, 'menu', true);
    await page.locator('#help-details summary').tap();
    await expect(page.locator('#help-details')).toContainText('Nell uses 2 spaces');
    await page.keyboard.press('Escape');
    await driftRescue(page, '390x844');
    await undo(page, true);
    await page.route('**/*beaver-brown*', (route) => route.request().resourceType() === 'image' ? route.abort() : route.continue());
    await activate(page, 'unload', true);
    await page.locator('#passenger-nell img').evaluate((image: HTMLImageElement) => {
      const url = new URL(image.src);
      url.searchParams.set('failure', '1');
      image.src = url.href;
    });
    await expect(page.locator('#passenger-nell img')).toHaveAttribute('data-portrait-state', 'failed');
    await snap(page, '390x844-portrait-failure-fallback');
    await expect(page.locator('#passenger-nell')).toContainText('Nell');
    await expect(page.locator('#passenger-nell')).toContainText('2 spaces');
    await fullyVisible(page, page.locator('#passenger-nell'));
    await tabTo(page, 'passenger-fern');
    await page.keyboard.press('Space');
    await page.keyboard.press('Escape');
    await idle(page);
    await keyAct(page, 'unload');
    expect(await state(page)).toMatchObject({ status: 'won' });
  } finally {
    await context.close();
  }
});
test('legacy read-only Home, explicit fresh continuation, restored recap and native fit', async ({
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
    await seeded(page, legacy);
    await page.goto('/');
    const bytes = await page.evaluate((key) => localStorage.getItem(key), journeyKey);
    await expect(page.locator('#home-play')).toHaveText('Continue');
    await activate(page, 'home-options', true);
    await activate(page, 'settings-back', true);
    await activate(page, 'home-practice', true);
    await expect(page.locator('#practice-driftwood-yard')).toBeVisible();
    await activate(page, 'journey-title', true);
    expect(await page.evaluate((key) => localStorage.getItem(key), journeyKey)).toBe(bytes);
    await activate(page, 'home-play', true);
    expect((await timeline(page)).recap).toBe(false);
    await page.reload();
    await activate(page, 'home-play', true);
    expect((await timeline(page)).recap).toBe(true);
    for (const size of [
      { width: 320, height: 740 },
      { width: 390, height: 844 },
      { width: 780, height: 320 },
      { width: 844, height: 390 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(size);
      await expect.poll(async () => (await page.evaluate(measureStory)).failures).toEqual([]);
      await snap(page, `${size.width}x${size.height}-recap-fit`);
    }
    await page.setViewportSize({ width: 780, height: 320 });
    await activate(page, 'story-continue', true);
    await idle(page);
    await act(page, 'map-yard', true);
    await activate(page, 'map-yard', true);
    await expect(page.locator('#local-context')).toContainText(/Board Nell.*Needs depth 1 → 2/);
    const before = await state(page);
    await activate(page, 'close-location', true);
    if (await page.locator('#back-to-boat').isVisible()) await keyAct(page, 'back-to-boat');
    await fullyVisible(page, page.locator('#board'));
    await snap(page, 'keyboard-visible-board');
    await keyAct(page, 'board');
    expect((await state(page)).turn).toBe(before.turn + 1);
    await undo(page, true);
    expect(await state(page)).toEqual(before);
    await page.reload();
    await activate(page, 'home-play', true);
    expect(await state(page)).toMatchObject({ turn: 0, boatNodeId: 'harbor' });
    await activate(page, 'menu', true);
    await activate(page, 'settings', true);
    await activate(page, 'fullscreen', true);
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
    await snap(page, 'actual-fullscreen-entry');
    await page.evaluate(() => document.exitFullscreen());
  } finally {
    await context.close();
  }
});
test('compact Bram controls, safe boundary and original last-safe loss warning', async ({
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
    await ready(page, 'bellwater');
    for (const id of [
      'map-shallows',
      'map-low-pier',
      'board',
      'map-east-buoy',
      'map-west-buoy',
      'map-harbor',
      'map-bell-pier',
    ])
      await act(page, id, true);
    for (const size of [
      { width: 390, height: 844 },
      { width: 780, height: 320 },
    ]) {
      await page.setViewportSize(size);
      await expect.poll(() => page.locator('#board').boundingBox()).not.toBeNull();
      await expect(page.locator('#board')).toHaveText('Board Bram');
      await expect(page.locator('#unload')).toHaveText('Let ashore');
      expect(await page.locator('.dock-facts,.dock-consequence').count()).toBe(0);
      await fullyVisible(page, page.locator('#board'));
      await fullyVisible(page, page.locator('#unload'));
      await snap(page, `${size.width}x${size.height}-bram-compact`);
    }
    await act(page, 'board', true);
    expect(await state(page)).toMatchObject({ turn: 8, tideLevel: 2, status: 'playing' });
    await undo(page, true);
    expect(await state(page)).toMatchObject({ turn: 7, tideLevel: 1 });
    await ready(page, 'holding-pier');
    for (const id of ['unload', 'map-shallows', 'map-rabbit-pier']) await act(page, id, true);
    await activate(page, 'board', true);
    await activate(page, 'passenger-rabbit-2', true);
    await expect(page.locator('#preview')).toContainText(/Rue.*floods/);
    const before = await state(page);
    await activate(page, 'cancel', true);
    expect(await state(page)).toEqual(before);
    await ready(page, 'first-crossing');
    await keyAct(page, 'map-sheep-pier');
    await keyAct(page, 'board');
    expect((await state(page)).aboard).toContain('sheep-1');
    await undo(page, true);
    expect((await state(page)).aboard).not.toContain('sheep-1');
  } finally {
    await context.close();
  }
});

test('fresh Home opening autoplay and reduced transfer regression', async ({
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
    await page.goto('/');
    await coldTouch(page, 'home-play');
    const seen = new Set<string>();
    await expect
      .poll(
        async () => {
          const t = await timeline(page);
          seen.add(t.shot);
          if (t.paused && !t.settled) await activate(page, 'story-pause', true);
          return t.final && t.settled;
        },
        { timeout: 45000, intervals: [300] },
      )
      .toBe(true);
    expect([...seen]).toEqual(['tide', 'lantern', 'ferry']);
    await snap(page, '390x844-opening-regression');
    await activate(page, 'story-continue', true);
    expect(await state(page)).toMatchObject({ turn: 0, boatNodeId: 'stone', aboard: ['sheep-1'] });
    await page.goto('/?cove=driftwood-yard');
    await idle(page);
    await activate(page, 'menu', true);
    await activate(page, 'settings', true);
    await page.locator('#motion-preference').selectOption('reduced');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await keyAct(page, 'map-yard');
    await keyAct(page, 'board');
    await undo(page, true);
    expect(await state(page)).toMatchObject({ turn: 1, aboard: [] });
  } finally {
    await context.close();
  }
});
