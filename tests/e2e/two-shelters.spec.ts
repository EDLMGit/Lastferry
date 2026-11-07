import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import type { Action, State } from '../../src/game/rules';
import type { Level } from '../../src/levels/level';
import { ready, act, activate, wholeCove, state, idle, undo, tabTo, fullyVisible } from './ui';
import { reviewDir } from './evidence';
import { passive } from './story-support';

mkdirSync(reviewDir, { recursive: true });
const witnesses = JSON.parse(readFileSync('data/two-shelters/witnesses.json', 'utf8')) as {
  witnesses: { id: string; actions: Action[] }[];
};
const twoShelters = JSON.parse(readFileSync('data/two-shelters.level.json', 'utf8')) as Level;
const save = (name: string, data: unknown) =>
  writeFileSync(`${reviewDir}/${name}.json`, JSON.stringify(data, null, 2));
const source = () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
    );
  return Object.fromEntries(
    [...walk('src'), ...walk('data'), 'package.json', 'package-lock.json'].map((p) => [
      p,
      createHash('sha256').update(readFileSync(p)).digest('hex'),
    ]),
  );
};
test.beforeAll(async ({ browser }) =>
  save('source-before', {
    at: new Date().toISOString(),
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    files: source(),
    node: process.version,
    browser: browser.version(),
    platform: process.platform,
    renderer: 'ANGLE SwiftShader',
    capture: 'Native CSS viewport DPR1; real UI on development build',
  }),
);
test.afterAll(() => save('source-after', { files: source() }));
async function snap(page: Page, name: string) {
  await page.waitForTimeout(200);
  const cdp = await page.context().newCDPSession(page);
  const image = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  });
  writeFileSync(`${reviewDir}/${name}.png`, Buffer.from(image.data, 'base64'));
  await cdp.detach();
  save(
    name,
    await page.evaluate(() => {
      const g = (window as any).__LAST_FERRY__;
      return {
        state: g.getState(),
        view: g.getViewStatus(),
        render: g.getRenderStatus(),
        navigation: g.getNavigationStatus(),
        audio: g.getAudioStatus(),
        active: document.activeElement?.id,
      };
    }),
  );
}
async function playView(page: Page) {
  if ((await page.locator('#view-toggle').textContent())?.includes('Play view')) {
    await activate(page, 'view-toggle', true);
    await expect(page.locator('#view-toggle')).toContainText('Whole cove');
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
  }
}
async function execute(page: Page, action: Action, touch = true) {
  if (action.type === 'move') await act(page, `map-${action.to}`, touch);
  else if (action.type === 'wait') await act(page, 'wait', touch);
  else {
    await activate(page, action.type, touch);
    if (await page.locator('#dialog[open][data-mode=action]').count()) {
      for (const choice of await page.locator('.passenger-options button').all()) {
        const id = (await choice.getAttribute('id'))!.replace('passenger-', '');
        if (
          ((await choice.getAttribute('aria-pressed')) === 'true') !==
          action.passengerIds.includes(id)
        )
          await choice.click();
      }
      await fullyVisible(page, page.locator('#commit'));
      await activate(page, 'commit', touch);
    }
    await idle(page);
  }
}

test('native candidate Play and Overview plus matched earlier cove', async ({
  browser,
  baseURL,
}) => {
  for (const [width, height] of [
    [390, 844],
    [780, 320],
    [320, 740],
    [844, 390],
    [1440, 900],
  ]) {
    const ctx = await browser.newContext({
      baseURL,
      viewport: { width, height },
      deviceScaleFactor: 1,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    await ready(page, 'two-shelters');
    for (const id of [
      'unload',
      'wait',
      'undo',
      'menu',
      'sound-toggle',
      'load-toggle',
      'status-toggle',
      'view-toggle',
    ])
      await fullyVisible(page, page.locator('#' + id));
    await expect(page.locator('#status-toggle')).toContainText('Reed Pier floods in 4 actions');
    await snap(page, `${width}x${height}-start-play`);
    await wholeCove(page, true);
    for (const node of twoShelters.nodes)
      await fullyVisible(page, page.locator('#map-' + node.id), false);
    await snap(page, `${width}x${height}-overview`);
    const before = await state(page);
    await activate(page, 'map-reeds', true);
    await expect(page.locator('#local-context')).toContainText('Needs depth 3 · passage 1');
    await expect(page.locator('#sail')).toBeDisabled();
    await fullyVisible(page, page.locator('#location-details'));
    await snap(page, `${width}x${height}-blocked-inspection`);
    expect(await state(page)).toEqual(before);
    await ready(page, 'holding-pier');
    await snap(page, `${width}x${height}-holding-matched-play`);
    await ready(page, 'driftwood-yard');
    await snap(page, `${width}x${height}-driftwood-matched-play`);
    await ctx.close();
  }
});

for (const [width, height, witnessId] of [
  [390, 844, 'low-separate-subsets'],
  [780, 320, 'high-mixed-first'],
] as const) {
  test(`actual ${width}x${height} rescue ${witnessId}, tide and terminal Undo`, async ({
    browser,
    baseURL,
  }) => {
    const ctx = await browser.newContext({
      baseURL,
      viewport: { width, height },
      hasTouch: true,
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on('pageerror', (e) => {
      errors.push(e.message);
      console.log('Runtime error:', e.message);
    });
    await ready(page, 'two-shelters');
    const witness = witnesses.witnesses.find((w) => w.id === witnessId)!;
    expect(witness).toBeTruthy();
    let expected: State = await state(page);
    const observations = [];
    for (const action of witness.actions as Action[]) {
      const before = await state(page);
      expected = await page.evaluate(
        async ({ before, action, level }) => {
          const path = '/src/game/rules.ts';
          const { reduce } = await import(path);
          return reduce(before, action, level);
        },
        { before, action, level: twoShelters },
      );
      await execute(page, action);
      expect(await state(page)).toEqual(expected);
      if (expected.turn === 1 && action.type === 'unload') {
        await expect(page.locator('#transfer-receipt')).toContainText('Hazel');
      }
      if (expected.status === 'playing') await playView(page);
      observations.push({ action, state: expected });
      if (
        expected.turn === 1 ||
        expected.turn === 2 ||
        expected.turn === 4 ||
        expected.turn === 5 ||
        expected.turn === 6 ||
        expected.turn === 9
      ) {
        await playView(page);
        await snap(page, `${width}x${height}-turn${expected.turn}-play`);
      }
      if (expected.turn === 4 || expected.turn === 9) {
        await undo(page, true);
        expect(await state(page)).toEqual(before);
        await execute(page, action);
        expect(await state(page)).toEqual(expected);
      }
      if (expected.status === 'won') {
        await snap(page, `${width}x${height}-rescue`);
        await undo(page, true);
        expect(await state(page)).toEqual(before);
        await execute(page, action);
        expect(await state(page)).toEqual(expected);
      }
    }
    expect(expected.status).toBe('won');
    expect(errors).toEqual([]);
    save(`${width}x${height}-rescue-sequence`, { witnessId, observations, errors });
    await ctx.close();
  });
}

test('natural keyboard inspection, immediate loss and reduced fullscreen recovery', async ({
  browser,
  baseURL,
}) => {
  const ctx = await browser.newContext({
    baseURL,
    viewport: { width: 780, height: 320 },
    deviceScaleFactor: 1,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await ready(page, 'two-shelters');
  const press = async (id: string) => {
    await tabTo(page, id);
    await page.keyboard.press('Enter');
  };
  await press('view-toggle');
  await press('map-low');
  const start = await state(page);
  await press('location-details');
  await expect(page.locator('#location-facts')).toContainText('Low Landing');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  expect(await state(page)).toEqual(start);
  await press('map-harbor');
  await press('sail');
  await idle(page);
  await press('unload');
  await press('commit');
  await idle(page);
  await press('map-low');
  await press('sail');
  await idle(page);
  await press('map-reeds');
  await expect(page.locator('#local-context')).toContainText('Mica');
  await expect(page.locator('#sail')).toContainText('Sail anyway');
  await fullyVisible(page, page.locator('#sail'));
  await snap(page, '780x320-immediate-loss');
  const before = await state(page);
  await press('sail');
  await idle(page);
  expect((await state(page)).status).toBe('lost');
  await press('terminal-undo');
  expect(await state(page)).toEqual(before);
  await expect(page.locator('#undo')).toBeFocused();
  await activate(page, 'menu', true);
  await activate(page, 'fullscreen', true);
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
  await page.setViewportSize({ width: 320, height: 740 });
  await fullyVisible(page, page.locator('#cancel'));
  await activate(page, 'settings', true);
  await page.locator('#motion-preference').selectOption('reduced');
  await activate(page, 'settings-sound', true);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.exitFullscreen());
  await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  await undo(page, true);
  expect((await state(page)).turn).toBe(2);
  await playView(page);
  await snap(page, '320x740-rotation-recovery');
  await ctx.close();
});

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
    (window as any).__sheltersRecording = { recorder, start, stopped };
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
          const r = (window as any).__sheltersRecording;
          r.recorder.stop();
          return { start: r.start, bytes: await r.stopped };
        })
      : null;
    if (recording)
      writeFileSync(`${directory}/runtime-audio.webm`, new Uint8Array(recording.bytes));
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

test('candidate free touch pan and earlier four-space transfer smoke', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await ctx.newPage();
  await ready(page, 'two-shelters');
  const original = await state(page);
  const point = await page.evaluate(() => {
    const canvas = document.querySelector('canvas')!, r = canvas.getBoundingClientRect();
    for (let y = 120; y < innerHeight - 90; y += 24)
      for (let x = 30; x < innerWidth - 30; x += 24)
        if (document.elementFromPoint(x, y) === canvas && !(window as any).__LAST_FERRY__.getPickTargetAt(x-r.left,y-r.top)) return { x,y };
    throw Error('No unobstructed water for real touch pan');
  });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[{...point,id:1}] });
  for (let step=1;step<=6;step++)
    await cdp.send('Input.dispatchTouchEvent', { type:'touchMove', touchPoints:[{x:point.x+step*20,y:point.y+step*12,id:1}] });
  await cdp.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] });
  const view = await page.evaluate(() => (window as any).__LAST_FERRY__.getViewStatus());
  expect(view.panned).toBe(true);
  expect(view.focus.x).toBeGreaterThanOrEqual(view.bounds.minX);
  expect(view.focus.x).toBeLessThanOrEqual(view.bounds.maxX);
  expect(view.focus.y).toBeGreaterThanOrEqual(view.bounds.minY);
  expect(view.focus.y).toBeLessThanOrEqual(view.bounds.maxY);
  expect(await state(page)).toEqual(original);
  await activate(page,'back-to-boat',true);
  await expect(page.locator('#back-to-boat')).toBeHidden();
  expect(await state(page)).toEqual(original);
  await cdp.detach();
  const records = [];
  for (const cove of ['holding-pier','driftwood-yard']) {
    await ready(page,cove);
    if (cove === 'driftwood-yard') await act(page,'map-yard',true);
    const before=await state(page);
    await act(page,cove === 'driftwood-yard' ? 'board' : 'unload',true);
    expect((await state(page)).turn).toBe(before.turn+1);
    await snap(page,`${cove}-transfer-smoke`);
    await undo(page,true);
    expect(await state(page)).toEqual(before);
    records.push({cove,restored:await state(page)});
  }
  save('pan-and-earlier-cove-smoke',{view,records});
  await ctx.close();
});

test('uninterrupted actual candidate rescue with runtime audio', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await ready(page, 'two-shelters');
  await activate(page, 'load-toggle', true);
  await activate(page, 'close-status', true);
  await expect
    .poll(() => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus().contextState))
    .toBe('running');
  const stop = await recordRuntime(page, 'actual-two-shelters-rescue');
  const events = [];
  try {
    await snap(page, 'recording-start');
    const actions = witnesses.witnesses.find((w) => w.id === 'low-separate-subsets')!.actions;
    for (const action of actions) {
      const before = await state(page);
      await execute(page, action);
      await playView(page);
      const after = await state(page);
      events.push({ action, before, after, at: Date.now() });
      if (after.turn === 4) {
        await page.waitForTimeout(700);
        await undo(page, true);
        expect(await state(page)).toEqual(before);
        await execute(page, action);
        expect(await state(page)).toEqual(after);
      }
      await page.waitForTimeout(450);
    }
    expect((await state(page)).status).toBe('won');
    await page.waitForTimeout(2400);
    await snap(page, 'recording-success');
    save('recording-actual-events', events);
  } finally {
    await stop();
    await ctx.close();
  }
});
