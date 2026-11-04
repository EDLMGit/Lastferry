import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { reviewDir } from './evidence';
import type { Action } from '../../src/game/rules';
import { act, activate, idle, state, undo, tabTo, keyAct, ready, fullyVisible, restart } from './ui';
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
test.setTimeout(300000);
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
test.beforeAll(() => {
  source('source-before');
  const executed = readFileSync('tests/e2e/wide-berth.spec.ts');
  writeFileSync(`${reviewDir}/raw/executed-wide-berth.spec.ts`, executed);
  save('executed-fixture', {
    sha256: createHash('sha256').update(executed).digest('hex'),
    path: 'tests/e2e/wide-berth.spec.ts',
  });
});
test.afterAll(() => source('source-after'));
async function endScene(page: Page, prefix: string) {
  await snap(page, `${prefix}-begin`);
  let middle = false,
    release = false;
  const interruptions: any[] = [];
  await expect
    .poll(
      async () => {
        const t = await timeline(page);
        if (!release && t.elapsed >= 1800) {
          release = true;
          await snap(page, `${prefix}-release`);
        }
        if (!middle && t.elapsed >= 4600) {
          middle = true;
          await snap(page, `${prefix}-glide`);
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
    startAudio();
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

const drift = {
  version: 1,
  checkpoint: { kind: 'cove', id: 'driftwood-yard' },
  completed: ['holding-pier', 'bellwater'],
  acknowledgedScenes: ['opening', 'another-bell', 'driftwood-light'],
};
const complete2 = {
  version: 1,
  checkpoint: { kind: 'complete' },
  completed: ['holding-pier', 'bellwater'],
  acknowledgedScenes: ['opening', 'another-bell'],
};
const complete3 = {
  version: 1,
  checkpoint: { kind: 'complete' },
  completed: ['holding-pier', 'bellwater', 'driftwood-yard'],
  acknowledgedScenes: ['opening', 'another-bell', 'driftwood-light'],
};
const recordBytes = (page: Page) => passive(page, (key) => localStorage.getItem(key), journeyKey);
async function seeded(page: Page, record: unknown) {
  await page.addInitScript(
    ({ key, record }) => {
      if (!sessionStorage.wideSeed) {
        localStorage.setItem(key, JSON.stringify(record));
        sessionStorage.wideSeed = '1';
      }
    },
    { key: journeyKey, record },
  );
}
async function choose(page: Page, type: 'board' | 'unload', ids?: string[], commit = true) {
  const before = await state(page);
  await activate(page, type, true);
  if (await page.locator('#dialog[open][data-mode="action"]').count()) {
    for (const button of await page.locator('.passenger-options button').all()) {
      const id = (await button.getAttribute('id'))!.replace('passenger-', '');
      if (ids && ((await button.getAttribute('aria-pressed')) === 'true') !== ids.includes(id))
        await button.tap();
    }
    expect(await state(page)).toEqual(before);
    if (commit) {
      await activate(page, 'commit', true);
      await idle(page);
    }
  } else {
    if (!commit) throw Error('Expected free group chooser');
    await idle(page);
  }
  if (commit) expect((await state(page)).turn).toBe(before.turn + 1);
}
async function executeWide(page: Page, actions: Action[]) {
  for (const action of actions) {
    if (action.type === 'move') await act(page, 'map-' + action.to, true);
    else if (action.type === 'wait') await act(page, 'wait', true);
    else await choose(page, action.type, action.passengerIds);
  }
}
const widePlans = JSON.parse(readFileSync('data/wide-berth/witnesses.json', 'utf8')) as {
  witnesses: { actions: Action[] }[];
};
const lightRoute = widePlans.witnesses[0].actions;
const outerRoute = widePlans.witnesses[1].actions;
async function beginWide(page: Page) {
  await ready(page, 'wide-berth');
  await snap(page, 'wide-entry');
  await choose(page, 'board');
  expect(await state(page)).toMatchObject({turn: 1, aboard: ['alder', 'clover', 'poppy', 'wren']});
  await expect(page.locator('#boat-summary')).toContainText('Depth 4 · 6/6 spaces');
  await snap(page, 'six-space-pickup');
  await act(page, 'map-high-quay', true);
}
async function repeatCommit(page: Page, name: string) {
  const button = page.locator('#commit');
  const rect = (await button.boundingBox())!;
  await page.evaluate(() => {
    (window as any).__widePointer = [];
    const observe = (e: PointerEvent) =>
      (window as any).__widePointer.push({
        time: e.timeStamp,
        trusted: e.isTrusted,
        turn: (window as any).__LAST_FERRY__.getState().turn,
        busy: (window as any).__LAST_FERRY__.getRenderStatus().pendingAnimation,
      });
    (window as any).__widePointerHandler = observe;
    document.addEventListener('pointerdown', observe, true);
  });
  await page.touchscreen.tap(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.waitForTimeout(35);
  await page.touchscreen.tap(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await idle(page);
  const observations = await page.evaluate(() => {
    document.removeEventListener('pointerdown', (window as any).__widePointerHandler, true);
    return (window as any).__widePointer;
  });
  save(name, {
    observations,
    claim:
      'Measured busy-transition inputs only; inherited universal <=180ms guarantee remains open.',
  });
}
async function fullDeep(page: Page, prefix: string) {
  await choose(page, 'board', undefined, false);
  await repeatCommit(page, 'repeat-six-space-commit');
  expect((await state(page)).turn).toBe(1);
  await snap(page, prefix + '-six-spaces');
  await act(page, 'map-high-quay', true);
  const fork = await state(page);
  await activate(page, 'map-harbor', true);
  await expect(page.locator('#local-context')).toContainText(/Needs depth 4.*passage 2/i);
  await expect(page.locator('#sail')).toBeDisabled();
  expect(await state(page)).toEqual(fork);
  await activate(page, 'close-location', true);
  await executeWide(page, outerRoute.slice(2, 3));
  const staged = await state(page);
  await act(page, 'map-harbor', true);
  expect(await state(page)).toMatchObject({ turn: 4, tideLevel: 1, aboard: ['alder'] });
  await snap(page, prefix + '-first-rise');
  await undo(page, true);
  expect(await state(page)).toEqual(staged);
  await executeWide(page, outerRoute.slice(3, 9));
  const before = await state(page);
  await choose(page, 'board', ['sorrel'], false);
  await expect(page.locator('#preview')).toContainText(/Finch.*flood/i);
  await activate(page, 'commit', true);
  await idle(page);
  expect(await state(page)).toMatchObject({ status: 'lost', turn: 10 });
  await undo(page, true);
  expect(await state(page)).toEqual(before);
  await choose(page, 'board');
  expect(await state(page)).toMatchObject({ turn: 10, tideLevel: 2, status: 'playing' });
  await snap(page, prefix + '-second-rise');
  await executeWide(page, outerRoute.slice(10));
  expect(await state(page)).toMatchObject({ turn: 14, status: 'won' });
  await snap(page, prefix + '-arrival');
  await undo(page, true);
  expect(await state(page)).toMatchObject({ turn: 13, status: 'playing' });
  await choose(page, 'unload');
}

test('earned Driftwood launch and full six-space deep-route rescue with runtime audio', async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(420000);
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 780, height: 320 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  let stop: any;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    await seeded(page, drift);
    await page.goto('/');
    await coldTouch(page, 'home-play');
    await idle(page);
    stop = await recordRuntime(page, 'actual-launch-rescue');
    for (const id of [
      'map-yard',
      'board',
      'map-mooring',
      'unload',
      'map-bend',
      'map-reeds',
      'board',
      'map-bend',
      'map-mooring',
      'board',
      'map-harbor',
      'unload',
    ])
      await act(page, id, true);
    expect(await state(page)).toMatchObject({ turn: 12, status: 'won' });
    await undo(page, true);
    await act(page, 'unload', true);
    await activate(page, 'continue-story', true);
    await endScene(page, '780x320-launch');
    expect((await snapshot(page)).campaign.level).toBe('driftwood-yard');
    await activate(page, 'story-continue', true);
    await idle(page);
    expect((await snapshot(page)).campaign.level).toBe('wide-berth');
    await snap(page, '780x320-wide-start');
    await fullDeep(page, '780x320-deep');
    await activate(page, 'continue-story', true);
    await expect(page.locator('#dialog')).toContainText('Four coves are safe.');
    await snap(page, '780x320-complete');
    expect(errors).toEqual([]);
  } finally {
    save('actual-end', await snapshot(page));
    save('actual-errors', errors);
    if (stop) await stop();
    await context.close();
  }
});

test('portrait staging strategy and current-depth shortcut with real full rescue', async ({
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
  page.setDefaultTimeout(15000);
  let stop: Awaited<ReturnType<typeof recordRuntime>> | undefined;
  try {
    await seeded(page, complete3);
    await page.goto('/');
    await coldTouch(page, 'home-play');
    stop = await recordRuntime(page, 'actual-close-staging');
    await endScene(page, '390x844-launch');
    await activate(page, 'story-continue', true);
    await idle(page);
    await executeWide(page, lightRoute.slice(0, 2));
    const before = await state(page);
    await choose(page, 'unload', ['alder', 'clover']);
    expect(await state(page)).toMatchObject({ turn: 3, tideLevel: 0, aboard: ['poppy', 'wren'] });
    await undo(page, true);
    expect(await state(page)).toEqual(before);
    await executeWide(page, lightRoute.slice(2, 4));
    await snap(page, '390x844-shallow-homeward');
    await executeWide(page, lightRoute.slice(4));
    expect(await state(page)).toMatchObject({ turn: 12, status: 'won' });
    await snap(page, '390x844-staging-arrival');
    await undo(page, true);
    expect(await state(page)).toMatchObject({ turn: 11, status: 'playing' });
    await choose(page, 'unload');
  } finally {
    if (stop) await stop();
    await context.close();
  }
});

test('five-body final load, all reachable manifest choices and usable portrait fallback', async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(300000);
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  try {
    await ready(page, 'wide-berth');
    await executeWide(page, outerRoute.slice(0,10));
    expect((await state(page)).aboard).toHaveLength(5);
    await snap(page, '390x844-five-bodies');
    await executeWide(page, outerRoute.slice(10,12));
    const aboard = await state(page);
    await choose(page, 'unload');
    const before = await state(page);
    expect(before.waitingByPier['high-quay-pier']).toHaveLength(5);
    expect(aboard.delivered).toEqual(['alder']);
    await snap(page, '390x844-five-ashore');
    await choose(page, 'board', undefined, false);
    await expect(page.locator('#preview .requirement')).toContainText('6/6 spaces');
    await expect(page.locator('#commit')).toBeEnabled();
    expect(await state(page)).toEqual(before);
    for (const size of [
      { width: 390, height: 844 },
      { width: 780, height: 320 },
      { width: 320, height: 740 },
      { width: 844, height: 390 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(size);
      await expect.poll(async () => (await page.evaluate(measureStory)).failures).toEqual([]);
      for (const id of ['clover', 'poppy', 'wren', 'sorrel', 'finch'])
        await fullyVisible(page, page.locator(`#passenger-${id}`));
      await fullyVisible(page, page.locator('#preview .requirement'), false);
      await snap(page, `${size.width}x${size.height}-five-chooser`);
      save(`${size.width}x${size.height}-five-fit`, await page.evaluate(measureStory));
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('#commit')).toBeEnabled();
    await expect(page.locator('#preview .requirement')).toContainText('6/6 spaces');
    await page.route('**/*rabbit-tan*', (route) =>
      route.request().resourceType() === 'image' ? route.abort() : route.continue(),
    );
    await page.locator('#passenger-finch img').evaluate((img: HTMLImageElement) => {
      const u = new URL(img.src);
      u.searchParams.set('fail', '1');
      img.src = u.href;
    });
    await expect(page.locator('#passenger-finch img')).toHaveAttribute(
      'data-portrait-state',
      'failed',
    );
    await expect(page.locator('#passenger-finch')).toContainText('Finch');
    await snap(page, '390x844-five-chooser-fallback');
    await tabTo(page, 'commit');
    await page.keyboard.press('Enter');
    await idle(page);
    expect((await state(page)).aboard).toHaveLength(5);
    await act(page, 'map-harbor', true);
    await choose(page, 'unload');
  } finally {
    await context.close();
  }
});

test('historical two and three boundaries stay read-only then advance fresh and restore recap', async ({
  browser,
  baseURL,
}) => {
  for (const [record, scene, previous] of [
    [complete2, 'driftwood-light', 'bellwater'],
    [complete3, 'a-wider-deck', 'driftwood-yard'],
  ] as const) {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
  page.setDefaultTimeout(15000);
    try {
      await seeded(page, record);
      await page.goto('/');
      const raw = await recordBytes(page);
      await expect(page.locator('#home-play')).toHaveText('Continue');
      await activate(page, 'home-options', true);
      await activate(page, 'settings-back', true);
      await activate(page, 'home-practice', true);
      await expect(page.locator('#practice-wide-berth')).toBeVisible();
      await activate(page, 'journey-title', true);
      expect(await recordBytes(page)).toBe(raw);
      await activate(page, 'home-play', true);
      expect((await timeline(page)).scene).toBe(scene);
      expect((await timeline(page)).recap).toBe(false);
      expect((await snapshot(page)).campaign.level).toBe(previous);
      await page.reload();
      await activate(page, 'home-play', true);
      expect((await timeline(page)).recap).toBe(true);
      expect((await snapshot(page)).campaign.level).toBe(previous);
      await snap(page, `390x844-${scene}-restored`);
      await activate(page, 'story-continue', true);
      await idle(page);
      expect((await state(page)).turn).toBe(0);
    } finally {
      await context.close();
    }
  }
});

test('original profiles, dynamic Help, reduced transfers, keyboard and fullscreen lifecycle', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 780, height: 320 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  try {
    await ready(page, 'wide-berth');
    await activate(page, 'menu', true);
    await page.locator('#help-details summary').tap();
    await expect(page.locator('#help-details')).toContainText('5–6 spaces = 4');
    await activate(page, 'settings', true);
    await page.locator('#motion-preference').selectOption('reduced');
    await activate(page, 'fullscreen', true);
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
    const metrics = await context.newCDPSession(page);
    await metrics.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
      screenOrientation: { type: 'portraitPrimary', angle: 0 },
    });
    await expect.poll(() => page.evaluate(() => innerWidth)).toBe(390);
    expect(await page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
    await snap(page, '390x844-fullscreen-rotation');
    await page.evaluate(() => document.exitFullscreen());
    await metrics.send('Emulation.clearDeviceMetricsOverride');
    await metrics.detach();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await keyAct(page, 'board');
    await keyAct(page, 'map-high-quay');
    await undo(page, true);
    expect(await state(page)).toMatchObject({ turn: 1, boatNodeId: 'wide-berth', aboard: ['alder', 'clover', 'poppy', 'wren'] });
    await activate(page, 'menu', true);
    await activate(page, 'settings', true);
    await page.locator('#motion-preference').selectOption('device');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    for (const cove of ['first-crossing', 'holding-pier', 'bellwater', 'driftwood-yard']) {
      await ready(page, cove);
      await expect(page.locator('#boat-summary')).toContainText('/4 spaces');
      await activate(page, 'menu', true);
      await page.locator('#help-details summary').tap();
      await expect(page.locator('#help-details')).not.toContainText('5–6 spaces');
      await page.keyboard.press('Escape');
    }
    await ready(page, 'holding-pier');
    await keyAct(page, 'unload');
    await undo(page, true);
    expect((await state(page)).aboard).toEqual(['sheep-1']);
    await ready(page, 'first-crossing');
    await keyAct(page, 'map-sheep-pier');
    await keyAct(page, 'board');
    await undo(page, true);
    expect((await state(page)).aboard).toHaveLength(2);
  } finally {
    await context.close();
  }
});

test('launch playback intent, pause, skip, replay, mute and controlled background recovery', async ({
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
  page.setDefaultTimeout(15000);
  try {
    await seeded(page, complete3);
    await page.goto('/');
    await coldTouch(page, 'home-play');
    await expect.poll(async () => (await timeline(page)).elapsed).toBeGreaterThan(1300);
    await activate(page, 'story-pause', true);
    const paused = await timeline(page);
    const saved = await recordBytes(page);
    await page.waitForTimeout(220);
    expect((await timeline(page)).elapsed).toBe(paused.elapsed);
    await activate(page, 'story-sound', true);
    await expect(page.locator('#story-sound')).toContainText(/Enable|Retry/);
    await activate(page, 'story-sound', true);
    await activate(page, 'story-pause', true);
    await expect.poll(async () => (await timeline(page)).elapsed).toBeGreaterThan(paused.elapsed);
    await page.locator('#story-more summary').tap();
    await activate(page, 'story-skip', true);
    expect((await timeline(page)).recap).toBe(true);
    expect(await recordBytes(page)).toBe(saved);
    await page.locator('#story-more summary').tap();
    await activate(page, 'story-replay-scene', true);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect((await timeline(page)).settled).toBe(true);
    expect(await recordBytes(page)).toBe(saved);
    if (!(await page.locator('#story-read').isVisible()))
      await page.locator('#story-more summary').tap();
    await activate(page, 'story-read', true);
    await expect(page.locator('#dialog')).toContainText(
      'Nell had a bigger boat ready. Now there are hands to launch it.',
    );
    await page.keyboard.press('Escape');
    await snap(page, '390x844-launch-recovery');
    await activate(page, 'story-continue', true);
    await idle(page);
    expect(await state(page)).toMatchObject({ turn: 0, boatNodeId: 'wide-berth', aboard: [] });
    save('launch-recovery', await snapshot(page));
  } finally {
    await context.close();
  }
});

test('High Quay free inspection names the current, the deep outer branch and the shell deadline', async ({ browser, baseURL }) => {
  const context = await browser.newContext({baseURL,viewport:{width:780,height:320},hasTouch:true,isMobile:true});
  const page=await context.newPage();
  page.setDefaultTimeout(12000);
  try {
    await beginWide(page);
    const before=await state(page);
    for (const [id, depth] of [['harbor',2], ['outer-buoy',4], ['shell-landing',1]] as const) {
      await activate(page,'map-high-quay',true);
      await activate(page,'location-details',true);
      await page.locator('.route-details summary').tap();
      await page.locator('[data-inspect-route="' + id + '"]').tap();
      if (await page.locator('#location-details').getAttribute('aria-expanded') !== 'true')
        await activate(page,'location-details',true);
      await expect(page.locator('#location-facts')).toContainText('Passage has depth ' + depth);
      if (id === 'shell-landing') await expect(page.locator('#location-facts')).toContainText(/floods in 8 actions/i);
      expect(await state(page)).toEqual(before);
      await snap(page, '780x320-inspect-' + id);
      await activate(page, 'close-location', true);
    }
    await executeWide(page, outerRoute.slice(2, 8));
    expect(await state(page)).toMatchObject({ turn: 8, boatNodeId: 'outer-buoy' });
    await activate(page, 'map-shell-landing', true);
    const sail = page.locator('#sail');
    await fullyVisible(page, sail);
    const hit = await sail.evaluate(button => {
      const r = button.getBoundingClientRect();
      return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest('button')?.id;
    });
    expect(hit).toBe('sail');
    await snap(page, '780x320-outer-to-shell-sail');
    await activate(page, 'sail', true);
    await idle(page);
    expect(await state(page)).toMatchObject({ turn: 9, boatNodeId: 'shell-landing' });
    expect(await recordBytes(page)).toBeNull();
  } finally { await context.close(); }
});

test('launch repeated handoff, real Restart and cove-change recovery preserve campaign bytes', async ({
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
  page.setDefaultTimeout(15000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await seeded(page, complete3);
    await page.goto('/');
    await coldTouch(page, 'home-play');
    await expect(page.locator('#story-continue')).toHaveText('Continue to Wide Berth');
    const bounds = (await page.locator('#story-continue').boundingBox())!;
    await page.evaluate(() => {
      (window as any).__wideHandoffPointers = [];
      document.addEventListener('pointerdown', (event) => {
        (window as any).__wideHandoffPointers.push({
          time: event.timeStamp,
          trusted: event.isTrusted,
          target: (event.target as Element).closest('[id]')?.id,
        });
      }, true);
    });
    await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await idle(page);
    expect(await state(page)).toMatchObject({ turn: 0, boatNodeId: 'wide-berth', aboard: [] });
    const progress = JSON.parse((await recordBytes(page))!);
    expect(progress.checkpoint).toEqual({ kind: 'cove', id: 'wide-berth' });
    expect(progress.acknowledgedScenes).toEqual([
      'opening', 'another-bell', 'driftwood-light', 'a-wider-deck',
    ]);
    save('repeated-handoff', {
      pointers: await page.evaluate(() => (window as any).__wideHandoffPointers),
      snapshot: await snapshot(page),
      claim: 'Two actual trusted taps delivered at their recorded times; no universal <=180ms claim.',
    });
    const checkpoint = await recordBytes(page);
    if (await page.locator('#dialog[open]').count()) await page.keyboard.press('Escape');
    await choose(page, 'board');
    await act(page, 'map-high-quay', true);
    await restart(page, true);
    expect(await state(page)).toMatchObject({ turn: 0, boatNodeId: 'wide-berth', aboard: [] });
    expect((await snapshot(page)).render.historyLength).toBe(0);
    expect((await snapshot(page)).render.poseHistoryLength).toBe(0);
    expect(await recordBytes(page)).toBe(checkpoint);
    await snap(page, '390x844-wide-restarted');
    await ready(page, 'wide-berth');
    expect(await recordBytes(page)).toBe(checkpoint);
    await act(page, 'map-high-quay', true);
    await activate(page, 'menu', true);
    await page.locator('#cove-picker').selectOption('holding-pier');
    await page.waitForURL('**/?cove=holding-pier');
    await page.waitForFunction(() => !!(window as any).__LAST_FERRY__);
    await expect.poll(async () => (await snapshot(page)).campaign.level).toBe('holding-pier');
    await idle(page);
    const restored = await state(page);
    expect(restored).toMatchObject({ turn: 0, boatNodeId: 'stone', aboard: ['sheep-1'] });
    await page.waitForTimeout(2000);
    expect(await state(page)).toEqual(restored);
    const settled = await snapshot(page);
    expect(settled.render.profile.id).toBe('four-space');
    expect(settled.render.historyLength).toBe(0);
    expect(settled.story.timeline.scene).toBeNull();
    expect(await recordBytes(page)).toBe(checkpoint);
    expect(await page.evaluate(() =>
      (window as any).__LAST_FERRY__.getEnvironmentStatus().wake.points.length,
    )).toBe(0);
    save('cove-recovery', { snapshot: settled, errors, checkpoint });
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});
