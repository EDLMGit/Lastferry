import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir, productionURL } from './evidence';
import { act, activate, fullyVisible, idle, state, tabTo, undo } from './ui';
import {
  checkpoint,
  coldTouch,
  connectionCopy,
  endpointCopy,
  journeyKey,
  measureStory,
  openingCopy,
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

const openingCheckpoint = {
  version: 1,
  checkpoint: { kind: 'scene', id: 'opening' },
  completed: [],
  acknowledgedScenes: [],
};
const holdingCheckpoint = {
  ...openingCheckpoint,
  checkpoint: { kind: 'cove', id: 'holding-pier' },
  acknowledgedScenes: ['opening'],
};
const connectionCheckpoint = {
  ...holdingCheckpoint,
  checkpoint: { kind: 'scene', id: 'another-bell' },
  completed: ['holding-pier'],
};
const bellwaterCheckpoint = {
  ...connectionCheckpoint,
  checkpoint: { kind: 'cove', id: 'bellwater' },
  acknowledgedScenes: ['opening', 'another-bell'],
};
mkdirSync(reviewDir, { recursive: true });
const scene = (page: Page) => page.evaluate(() => (window as any).__LAST_FERRY__.getStoryStatus());
const elapsed = async (page: Page) => (await scene(page)).timeline.elapsed;
const boundary = (page: Page) =>
  page.evaluate(() => {
    const game = (window as any).__LAST_FERRY__;
    return {
      state: game.getState(),
      history: game.getRenderStatus().historyLength,
      motion: game.getMotionStatus(),
      campaign: game.getCampaignStatus(),
    };
  });
async function seed(
  context: BrowserContext,
  value: typeof openingCheckpoint | typeof connectionCheckpoint,
  reduced = false,
) {
  await context.addInitScript(
    ({ key, value, reduced }) => {
      if (!sessionStorage.getItem('story-scene-fixture')) {
        localStorage.setItem(key, JSON.stringify(value));
        if (reduced) localStorage.setItem('last-ferry-motion', 'reduced');
        sessionStorage.setItem('story-scene-fixture', 'true');
      }
    },
    { key: journeyKey, value, reduced },
  );
}
async function holdingStart(page: Page) {
  await idle(page);
  expect(await state(page)).toMatchObject({
    turn: 0,
    tideLevel: 0,
    boatNodeId: 'stone',
    aboard: ['sheep-1'],
    delivered: [],
    status: 'playing',
  });
  expect((await boundary(page)).history).toBe(0);
  expect(await checkpoint(page)).toBe(JSON.stringify(holdingCheckpoint));
  const presentation = await scene(page);
  expect(presentation.timeline.scene).toBeNull();
  expect(presentation.world.active).toBe(false);
  expect(presentation.world.routesVisible.every((route: any) => route.visible)).toBe(true);
  expect(presentation.world.markersVisible.every((marker: any) => marker.visible)).toBe(true);
  for (const animal of presentation.world.animals)
    expect(animal.rotation.slice(0, 3).every((angle: number) => Math.abs(angle) < 1e-8)).toBe(true);
}
async function captions(page: Page, connection = false) {
  for (const text of connection ? [connectionCopy] : openingCopy)
    await expect(page.locator('#dialog')).toContainText(text);
  await expect(page.locator('#story-continue')).toBeEnabled();
  await fullyVisible(page, page.locator('#story-continue'));
  await expect(page.locator('#dialog')).not.toContainText('Animation settled');
}
async function ambientAfterSettlement(page: Page, reduced: boolean) {
  const observation = await page.evaluate(async () => {
    const game = (window as any).__LAST_FERRY__;
    const before = game.getEnvironmentStatus();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    return { before, after: game.getEnvironmentStatus() };
  });
  expect(observation.before.reducedMotion).toBe(reduced);
  expect(observation.after.reducedMotion).toBe(reduced);
  if (reduced) {
    expect(observation.before.waterTime).toBe(0);
    expect(observation.after.waterTime).toBe(0);
  } else expect(observation.after.waterTime).toBeGreaterThan(observation.before.waterTime);
  return observation;
}
async function observeBeats(page: Page, connection = false) {
  return page.evaluate(async (connection) => {
    const game = (window as any).__LAST_FERRY__;
    const targets = connection ? [0, 1000, 2600, 4000] : [0, 1000, 3600, 7200];
    const samples: any[] = [];
    return new Promise<any[]>((resolve) => {
      const observe = () => {
        const story = game.getStoryStatus();
        if (story.timeline.elapsed >= targets[samples.length]) {
          const panel = document.getElementById('dialog')!.getBoundingClientRect();
          const captionLines: any[] = [];
          for (const paragraph of document.querySelectorAll<HTMLElement>('#story-captions p')) {
            const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
            let text: Node | null;
            while ((text = walker.nextNode())) {
              const range = document.createRange();
              range.selectNodeContents(text);
              for (const rectangle of range.getClientRects())
                captionLines.push({
                  text: text.textContent,
                  fontSize: parseFloat(getComputedStyle(paragraph).fontSize),
                  rect: rectangle.toJSON(),
                  fits:
                    rectangle.left >= panel.left &&
                    rectangle.right <= panel.right &&
                    rectangle.top >= panel.top &&
                    rectangle.bottom <= panel.bottom,
                });
            }
          }
          samples.push({
            at: new Date().toISOString(),
            requestedElapsed: targets[samples.length],
            boundary: {
              state: game.getState(),
              history: game.getRenderStatus().historyLength,
              motion: game.getMotionStatus(),
              campaign: game.getCampaignStatus(),
            },
            diagnostics: {
              scene: story,
              frame: game.getFrameStatus(),
              viewport: game.getViewportStatus(),
              render: game.getRenderStatus(),
              audio: game.getAudioStatus(),
            },
            measurement: {
              surface: panel.toJSON(),
              captionLines,
              buttons: [
                ...document.querySelectorAll<HTMLButtonElement>('#story-continue, #story-skip'),
              ]
                .map((button) => ({ id: button.id, rect: button.getBoundingClientRect().toJSON() }))
                .filter((button) => button.rect.width > 0),
              continueEnabled: !(document.getElementById('story-continue') as HTMLButtonElement)
                .disabled,
              skipVisible: !!document.getElementById('story-skip')?.getBoundingClientRect().width,
            },
          });
        }
        if (samples.length === targets.length) resolve(samples);
        else requestAnimationFrame(observe);
      };
      requestAnimationFrame(observe);
    });
  }, connection);
}
function assertObservedBeats(samples: any[], connection = false) {
  expect(samples).toHaveLength(4);
  const first = samples[0];
  for (const sample of samples) {
    expect(sample.boundary.state).toEqual(first.boundary.state);
    expect(sample.boundary.history).toBe(first.boundary.history);
    expect(sample.measurement.continueEnabled).toBe(true);
    for (const copy of connection ? [connectionCopy] : openingCopy)
      expect(sample.measurement.captionLines.some((line: any) => line.text === copy)).toBe(true);
    for (const button of sample.measurement.buttons) {
      expect(button.rect.width).toBeGreaterThanOrEqual(44);
      expect(button.rect.height).toBeGreaterThanOrEqual(44);
      expect(button.rect.left).toBeGreaterThanOrEqual(-0.75);
      expect(button.rect.top).toBeGreaterThanOrEqual(-0.75);
      expect(button.rect.right).toBeLessThanOrEqual(sample.diagnostics.frame.canvas.width + 0.75);
      expect(button.rect.bottom).toBeLessThanOrEqual(sample.diagnostics.frame.canvas.height + 0.75);
    }
    expect(
      sample.measurement.captionLines.every((line: any) => line.fontSize >= 14 && line.fits),
    ).toBe(true);
  }
  expect(samples[1].diagnostics.scene.timeline.elapsed).toBeLessThan(connection ? 1300 : 1900);
  expect(samples[1].diagnostics.scene.world.stage[connection ? 'hop' : 'nod']).toBeGreaterThan(
    0.01,
  );
  expect(samples[0].diagnostics.frame.camera.projection).not.toEqual(
    samples[2].diagnostics.frame.camera.projection,
  );
  for (const sample of samples) {
    expect(sample.diagnostics.scene.world.routesVisible.every((route: any) => !route.visible)).toBe(
      true,
    );
    expect(
      sample.diagnostics.scene.world.markersVisible.every((marker: any) => !marker.visible),
    ).toBe(true);
    if (connection) {
      const boat = sample.diagnostics.frame.boat;
      expect(boat.top).toBeGreaterThanOrEqual(-0.75);
      expect(boat.bottom).toBeLessThanOrEqual(sample.measurement.surface.top + 0.75);
    }
  }
  expect(samples[3].diagnostics.scene.timeline.settled).toBe(true);
  expect(samples[3].diagnostics.scene.world.stage.hop).toBe(0);
  expect(samples[3].diagnostics.scene.world.stage.nod).toBe(0);
}
async function snapshot(page: Page, label: string, subjects: 'ferry' | 'both' | 'home') {
  const measurement = await page.evaluate(measureStory);
  const diagnostics = await page.evaluate(() => {
    const game = (window as any).__LAST_FERRY__;
    return {
      scene: game.getStoryStatus(),
      frame: game.getFrameStatus(),
      viewport: game.getViewportStatus(),
      render: game.getRenderStatus(),
      audio: game.getAudioStatus(),
      campaign: game.getCampaignStatus(),
    };
  });
  const info = {
    at: new Date().toISOString(),
    url: page.url(),
    viewport: page.viewportSize(),
    boundary: await boundary(page),
    measurement,
    diagnostics,
  };
  await page.screenshot({ path: `${reviewDir}/${label}.png` });
  writeFileSync(`${reviewDir}/${label}.json`, JSON.stringify(info, null, 2));
  expect(measurement.canvasCount).toBe(1);
  expect(measurement.failures).toEqual([]);
  expect(measurement.lines.every((line) => line.fontSize >= 14)).toBe(true);
  expect(
    measurement.nested.filter((item) => item.tag !== 'BUTTON').every((item) => !item.overflow),
  ).toBe(true);
  const panel = measurement.surface;
  const selected =
    subjects === 'home'
      ? diagnostics.frame.passengers.filter((passenger: any) =>
          ['rabbit-1', 'rabbit-2', 'sheep-1'].includes(passenger.id),
        )
      : [
          diagnostics.frame.boat,
          diagnostics.frame.passengers.find((passenger: any) => passenger.id === 'sheep-1'),
        ];
  if (subjects === 'both' || subjects === 'home') selected.push(diagnostics.frame.lighthouse);
  for (const rectangle of selected) {
    expect(rectangle.left).toBeGreaterThanOrEqual(-0.75);
    expect(rectangle.right).toBeLessThanOrEqual(page.viewportSize()!.width + 0.75);
    expect(rectangle.top).toBeGreaterThanOrEqual(-0.75);
    expect(rectangle.bottom).toBeLessThanOrEqual(panel.top + 0.75);
  }
  return info;
}

test('scene native opening recordings: ferry acknowledgment, lighthouse reveal and playable handoff on both phone orientations', async ({
  browser,
  baseURL,
}) => {
  const runs: unknown[] = [];
  for (const [width, height] of [
    [320, 740],
    [780, 320],
  ]) {
    const context = await browser.newContext({
      baseURL,
      viewport: { width, height },
      hasTouch: true,
      isMobile: true,
      deviceScaleFactor: 1,
      recordVideo: { dir: `${reviewDir}/raw`, size: { width, height } },
    });
    const page = await context.newPage();
    const run: Record<string, any> = {
      width,
      height,
      startedAt: Date.now(),
      captures: [],
      errors: [],
    };
    page.on('pageerror', (error) => run.errors.push(error.message));
    try {
      await title(page);
      await activate(page, 'journey-new', true);
      run.captures = await observeBeats(page);
      assertObservedBeats(run.captures);
      await captions(page);
      const pending = await checkpoint(page),
        initial = await state(page);
      await snapshot(page, `${width}x${height}-opening-end`, 'both');
      expect(await state(page)).toEqual(initial);
      expect(await checkpoint(page)).toBe(pending);
      await captions(page);
      await expect(page.locator('#story-skip')).not.toBeVisible();
      expect((await boundary(page)).motion.reduced).toBe(false);
      run.ambient = await ambientAfterSettlement(page, false);
      await activate(page, 'story-continue', true);
      await holdingStart(page);
      await page.screenshot({ path: `${reviewDir}/${width}x${height}-opening-gameplay.png` });
      run.handoff = { at: Date.now(), boundary: await boundary(page), scene: await scene(page) };
      expect(run.errors).toEqual([]);
    } finally {
      run.video = await page.video()!.path();
      await context.close();
      runs.push(run);
      writeFileSync(`${reviewDir}/opening-recordings.json`, JSON.stringify(runs, null, 2));
    }
  }
});

test('scene actual two-cove journey: safe Harbor acknowledgment, terminal Undo and explicit next crossing', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 1,
    recordVideo: { dir: `${reviewDir}/raw`, size: { width: 844, height: 390 } },
  });
  const page = await context.newPage();
  const run: Record<string, any> = { startedAt: Date.now(), connection: [], errors: [] };
  page.on('pageerror', (error) => run.errors.push(error.message));
  try {
    await title(page);
    await activate(page, 'journey-new', true);
    await activate(page, 'story-continue', true);
    await holdingStart(page);
    const accepted = await checkpoint(page);
    await rescueHolding(page, true);
    expect(await checkpoint(page)).toBe(accepted);
    await undo(page, true);
    expect(await state(page)).toMatchObject({ turn: 8, status: 'playing', delivered: [] });
    await act(page, 'unload', true);
    const won = await boundary(page);
    const audioBefore = await page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus());
    run.connectionStartedAt = Date.now();
    await activate(page, 'continue-story', true);
    run.connection = await observeBeats(page, true);
    assertObservedBeats(run.connection, true);
    await captions(page, true);
    await snapshot(page, '844x390-connection-end', 'home');
    run.ambient = await ambientAfterSettlement(page, false);
    expect(await state(page)).toEqual(won.state);
    expect((await boundary(page)).history).toBe(won.history);
    expect(JSON.parse((await checkpoint(page))!)).toEqual(connectionCheckpoint);
    run.connectionEndedAt = Date.now();
    run.audio = {
      before: audioBefore,
      after: await page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus()),
    };
    await activate(page, 'story-continue', true);
    expect(await state(page)).toMatchObject({
      turn: 0,
      boatNodeId: 'harbor',
      aboard: [],
      delivered: [],
      status: 'playing',
    });
    run.bellwaterStartedAt = Date.now();
    expect((await scene(page)).world.active).toBe(false);
    expect(JSON.parse((await checkpoint(page))!)).toEqual(bellwaterCheckpoint);
    await rescueBellwater(page, true);
    await activate(page, 'continue-story', true);
    await expect(page.locator('#dialog')).toContainText(endpointCopy);
    run.end = await boundary(page);
    expect(run.errors).toEqual([]);
  } finally {
    run.video = await page.video()!.path();
    await context.close();
    writeFileSync(`${reviewDir}/two-cove-journey.json`, JSON.stringify(run, null, 2));
  }
});

test('scene progression equivalence: immediate, Skip, Reduced and restored scenes keep original starts and no stale jobs', async ({
  browser,
  baseURL,
}) => {
  const observations: unknown[] = [];
  for (const mode of ['immediate', 'skip', 'reduced', 'restored']) {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
      reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference',
    });
    if (mode === 'restored') await seed(context, openingCheckpoint);
    const page = await context.newPage();
    try {
      await title(page);
      await activate(page, mode === 'restored' ? 'journey-continue' : 'journey-new', true);
      await captions(page);
      const before = await boundary(page),
        pending = await checkpoint(page);
      if (mode === 'skip') {
        await activate(page, 'story-skip', true);
        await expect(page.locator('#story-skip')).not.toBeVisible();
        expect(await checkpoint(page)).toBe(pending);
        expect(await state(page)).toEqual(before.state);
        await expect(page.locator('#story-continue')).toBeFocused();
      }
      if (mode === 'reduced' || mode === 'restored') {
        expect((await scene(page)).timeline.settled).toBe(true);
        await expect(page.locator('#story-skip')).not.toBeVisible();
      }
      const ambient =
        mode === 'skip' || mode === 'reduced' || mode === 'restored'
          ? await ambientAfterSettlement(page, mode === 'reduced')
          : null;
      if (mode === 'immediate') expect(await elapsed(page)).toBeLessThan(2000);
      await activate(page, 'story-continue', true);
      await holdingStart(page);
      observations.push({
        mode,
        before,
        after: await boundary(page),
        scene: await scene(page),
        ambient,
      });
      if (mode === 'immediate') {
        await act(page, 'unload', true);
        const afterAction = await state(page);
        await page.waitForTimeout(7600);
        expect(await state(page)).toEqual(afterAction);
        expect((await boundary(page)).history).toBe(1);
        await undo(page, true);
        await holdingStart(page);
      }
    } finally {
      await context.close();
    }
  }
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  await seed(context, connectionCheckpoint);
  const page = await context.newPage();
  try {
    await title(page);
    await activate(page, 'journey-continue', true);
    await captions(page, true);
    expect((await scene(page)).timeline.settled).toBe(true);
    await expect(page.locator('#story-skip')).not.toBeVisible();
    await snapshot(page, '390x844-connection-restored', 'home');
    await activate(page, 'story-continue', true);
    expect(await state(page)).toMatchObject({
      turn: 0,
      boatNodeId: 'harbor',
      aboard: [],
      delivered: [],
    });
    expect(JSON.parse((await checkpoint(page))!)).toEqual(bellwaterCheckpoint);
  } finally {
    await context.close();
  }
  writeFileSync(`${reviewDir}/equivalent-entries.json`, JSON.stringify(observations, null, 2));
});

test('scene native navigation and recovery: keyboard, fullscreen, rotation, background and double activation', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 320, height: 740 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  try {
    await title(page);
    await tabTo(page, 'journey-settings');
    await page.keyboard.press('Enter');
    await tabTo(page, 'fullscreen');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
    await page.keyboard.press('Escape');
    if (await page.locator('#settings-back').isVisible()) await activate(page, 'settings-back');
    await tabTo(page, 'journey-new');
    await page.keyboard.press('Enter');
    await captions(page);
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#story-skip')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#story-skip')).not.toBeVisible();
    await expect(page.locator('#story-continue')).toBeFocused();
    await page.evaluate(() => document.exitFullscreen());
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
    await expect(page.locator('#dialog')).toHaveAttribute('open', '');
    await expect(page.locator('#story-continue')).toBeFocused();
    await page.setViewportSize({ width: 780, height: 320 });
    await captions(page);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
      Object.defineProperty(document, 'hidden', { configurable: true, value: false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect.poll(async () => (await scene(page)).timeline.settled).toBe(true);
    await expect(page.locator('#story-skip')).not.toBeVisible();
    await captions(page);
    await snapshot(page, '780x320-background-rotation-settled', 'both');
    const button = await page.locator('#story-continue').boundingBox();
    await page.touchscreen.tap(button!.x + button!.width / 2, button!.y + button!.height / 2);
    await page.touchscreen.tap(button!.x + button!.width / 2, button!.y + button!.height / 2);
    await holdingStart(page);
    if (await page.locator('#dialog').isVisible()) await page.keyboard.press('Escape');
    await tabTo(page, 'menu');
    await page.keyboard.press('Enter');
    await tabTo(page, 'settings');
    await page.keyboard.press('Enter');
    await tabTo(page, 'fullscreen');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
    await tabTo(page, 'fullscreen');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
    await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  } finally {
    await context.close();
  }
});

test('scene cold touch and mute: immediate controls retain native audio intent and one context', async ({
  browser,
  baseURL,
}) => {
  const observations: unknown[] = [];
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
      const cold = await passive(page, () => ({
        activation: navigator.userActivation.hasBeenActive,
        audio: (window as any).__LAST_FERRY__.getAudioStatus(),
      }));
      expect(cold.activation).toBe(false);
      expect(cold.audio).toMatchObject({ contextCount: 0 });
      await coldTouch(page, 'journey-new');
      if (muted)
        expect(
          (await passive(page, () => (window as any).__LAST_FERRY__.getAudioStatus())).muted,
        ).toBe(true);
      else
        await expect
          .poll(() => passive(page, () => (window as any).__LAST_FERRY__.getAudioStatus().running))
          .toBe(true);
      await captions(page);
      const pending = await checkpoint(page);
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        document.dispatchEvent(new Event('visibilitychange'));
        Object.defineProperty(document, 'hidden', { configurable: true, value: false });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      expect((await scene(page)).timeline.settled).toBe(true);
      expect(await checkpoint(page)).toBe(pending);
      expect((await state(page)).turn).toBe(0);
      await activate(page, 'story-continue', true);
      await holdingStart(page);
      const after = await passive(page, () => (window as any).__LAST_FERRY__.getAudioStatus());
      if (muted) expect(after.muted).toBe(true);
      else expect(after).toMatchObject({ contextCount: 1, schedulerCount: 1 });
      observations.push({ muted, cold, after });
    } finally {
      await context.close();
    }
  }
  writeFileSync(`${reviewDir}/audio-intent.json`, JSON.stringify(observations, null, 2));
});

test('scene remaining composition sizes and production: complete captions and immediate handoff', async ({
  browser,
  baseURL,
}) => {
  const compositions: unknown[] = [];
  for (const [width, height] of [
    [390, 844],
    [844, 390],
    [1440, 900],
  ]) {
    const context = await browser.newContext({
      baseURL,
      viewport: { width, height },
      hasTouch: true,
      isMobile: width < 1000,
      deviceScaleFactor: 1,
      recordVideo: { dir: `${reviewDir}/raw`, size: { width, height } },
    });
    const page = await context.newPage();
    const run: Record<string, any> = { width, height, startedAt: Date.now(), captures: [] };
    try {
      await title(page);
      await activate(page, 'journey-new', true);
      run.captures = await observeBeats(page);
      assertObservedBeats(run.captures);
      await captions(page);
      run.ambient = await ambientAfterSettlement(page, false);
      await activate(page, 'story-continue', true);
      await holdingStart(page);
      run.handoff = { at: Date.now(), boundary: await boundary(page), scene: await scene(page) };
    } finally {
      run.video = await page.video()!.path();
      await context.close();
      compositions.push(run);
      writeFileSync(
        `${reviewDir}/composition-recordings.json`,
        JSON.stringify(compositions, null, 2),
      );
    }
  }
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(productionURL + '/');
    await expect(page.locator('#journey-new')).toBeVisible();
    expect(await page.evaluate(() => '__LAST_FERRY__' in window)).toBe(false);
    await activate(page, 'journey-new', true);
    await captions(page);
    await activate(page, 'story-continue', true);
    await idle(page);
    await activate(page, 'unload', true);
    await activate(page, 'commit', true);
    await idle(page);
    await expect(page.locator('#readout')).toContainText('01 actions');
    expect(JSON.parse((await checkpoint(page))!)).toEqual(holdingCheckpoint);
    expect(errors).toEqual([]);
    writeFileSync(
      `${reviewDir}/production.json`,
      JSON.stringify(
        {
          url: page.url(),
          errors,
          scripts: await page
            .locator('script[src]')
            .evaluateAll((nodes) => nodes.map((node) => (node as HTMLScriptElement).src)),
        },
        null,
        2,
      ),
    );
  } finally {
    await context.close();
  }
});

test('scene Harbor entry variants: actual rescues support immediate Continue, free Skip and Reduced stills', async ({
  browser,
  baseURL,
}) => {
  const outcomes: any[] = [];
  for (const mode of ['immediate', 'skip', 'reduced']) {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 844, height: 390 },
      hasTouch: true,
      isMobile: true,
    });
    await seed(context, holdingCheckpoint);
    const page = await context.newPage();
    try {
      await title(page);
      if (mode === 'reduced') {
        await activate(page, 'journey-settings', true);
        await page.locator('#motion-preference').selectOption('reduced');
        await activate(page, 'settings-back', true);
      }
      await activate(page, 'journey-continue', true);
      await holdingStart(page);
      await rescueHolding(page, true, false);
      const won = await state(page),
        history = (await boundary(page)).history;
      await activate(page, 'continue-story', true);
      await captions(page, true);
      const pending = await checkpoint(page);
      expect(JSON.parse(pending!)).toEqual(connectionCheckpoint);
      if (mode === 'immediate') expect(await elapsed(page)).toBeLessThan(4000);
      if (mode === 'skip') {
        await activate(page, 'story-skip', true);
        expect(await checkpoint(page)).toBe(pending);
        expect(await state(page)).toEqual(won);
        expect((await boundary(page)).history).toBe(history);
        await expect(page.locator('#story-continue')).toBeFocused();
      }
      if (mode !== 'immediate') {
        const settled = await scene(page);
        expect(settled.timeline.settled).toBe(true);
        expect(settled.world.stage.hop).toBe(0);
        expect(settled.world.stage.turn).toBe(0);
        await expect(page.locator('#story-skip')).not.toBeVisible();
        await ambientAfterSettlement(page, mode === 'reduced');
      }
      await activate(page, 'story-continue', true);
      const after = await boundary(page),
        cleared = await scene(page);
      expect(after.state).toMatchObject({
        turn: 0,
        tideLevel: 0,
        boatNodeId: 'harbor',
        aboard: [],
        delivered: [],
        status: 'playing',
      });
      expect(after.history).toBe(0);
      expect(JSON.parse((await checkpoint(page))!)).toEqual(bellwaterCheckpoint);
      expect(cleared.world.active).toBe(false);
      expect(cleared.timeline.scene).toBeNull();
      if (outcomes.length) expect(after.state).toEqual(outcomes[0].after.state);
      outcomes.push({ mode, after, cleared });
    } finally {
      await context.close();
    }
  }
  writeFileSync(`${reviewDir}/harbor-entry-variants.json`, JSON.stringify(outcomes, null, 2));
});
