import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import { act, activate, fullyVisible, idle, restart, state, tabTo, undo, wholeCove } from './ui';
import {
  captureStory,
  checkpoint,
  coldTouch,
  connectionCopy,
  endpointCopy,
  exposeBellwaterEast,
  journey,
  journeyKey,
  measureStory,
  openingCopy,
  passive,
  rescueBellwater,
  rescueHolding,
  startJourney,
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

const newJourney = () => ({
  version: 1,
  checkpoint: { kind: 'scene', id: 'opening' },
  completed: [],
  acknowledgedScenes: [],
});
const holding = {
  version: 1,
  checkpoint: { kind: 'cove', id: 'holding-pier' },
  completed: [],
  acknowledgedScenes: ['opening'],
};
const transition = {
  version: 1,
  checkpoint: { kind: 'scene', id: 'another-bell' },
  completed: ['holding-pier'],
  acknowledgedScenes: ['opening'],
};
const bellwater = {
  ...transition,
  checkpoint: { kind: 'cove', id: 'bellwater' },
  acknowledgedScenes: ['opening', 'another-bell'],
};
const complete = {
  ...bellwater,
  checkpoint: { kind: 'complete' },
  completed: ['holding-pier', 'bellwater'],
};
mkdirSync(reviewDir, { recursive: true });
async function seed(context: BrowserContext, raw: string, preferences = false) {
  await context.addInitScript(
    ({ key, raw, preferences }) => {
      if (!sessionStorage.getItem('story-fixture-installed')) {
        localStorage.setItem(key, raw);
        if (preferences) {
          localStorage.setItem('last-ferry-muted', 'true');
          localStorage.setItem('last-ferry-motion', 'reduced');
        }
        sessionStorage.setItem('story-fixture-installed', 'true');
      }
    },
    { key: journeyKey, raw, preferences },
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
  });
  expect(
    await page.evaluate(() => (window as any).__LAST_FERRY__.getRenderStatus().historyLength),
  ).toBe(0);
}
async function resume(page: Page) {
  await expect(page.locator('#journey-continue')).toBeVisible();
  await activate(page, 'journey-continue', true);
}
async function screenshot(page: Page, name: string) {
  mkdirSync(reviewDir, { recursive: true });
  await page.screenshot({ path: `${reviewDir}/${name}.png` });
}

test('story full phone journey: actual rescues, explicit acceptance, tide and terminal Undo, checkpoint endpoint', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 780, height: 320 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 1,
    recordVideo: { dir: `${reviewDir}/raw`, size: { width: 780, height: 320 } },
  });
  const page = await context.newPage();
  const observations: Record<string, unknown> = {
    environment: {
      node: process.version,
      browser: browser.version(),
      renderer: 'SwiftShader',
      viewport: { width: 780, height: 320 },
      dpr: 1,
      input: 'Chromium emulated touch',
      audioPolicy: 'document-user-activation-required',
    },
  };
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    await title(page);
    observations.title = await captureStory(page, '780x320-title');
    expect(await checkpoint(page)).toBeNull();
    await activate(page, 'journey-new', true);
    const opening = await checkpoint(page);
    observations.opening = await captureStory(page, '780x320-opening');
    await expect(page.locator('#story-continue')).toBeEnabled({ timeout: 12000 });
    for (const line of openingCopy) await expect(page.locator('#dialog')).toContainText(line);
    observations.openingSettled = await captureStory(page, '780x320-opening-settled');
    expect(await checkpoint(page)).toBe(opening);
    expect(await state(page)).toMatchObject({ turn: 0, tideLevel: 0, aboard: ['sheep-1'] });
    await activate(page, 'story-continue', true);
    await holdingStart(page);
    expect(JSON.parse((await checkpoint(page))!)).toEqual(holding);
    await screenshot(page, '780x320-holding-start');
    const accepted = await checkpoint(page);
    await rescueHolding(page, true);
    expect(await checkpoint(page)).toBe(accepted);
    observations.holdingWon = await captureStory(page, '780x320-holding-arrival');
    await undo(page, true);
    expect(await state(page)).toMatchObject({ turn: 8, status: 'playing', delivered: [] });
    expect(await checkpoint(page)).toBe(accepted);
    await act(page, 'unload', true);
    expect(await checkpoint(page)).toBe(accepted);
    await activate(page, 'continue-story', true);
    expect(JSON.parse((await checkpoint(page))!)).toEqual(transition);
    await expect(page.locator('#dialog')).toContainText(connectionCopy);
    observations.transition = await captureStory(page, '780x320-transition');
    expect(await state(page)).toMatchObject({
      status: 'won',
      delivered: ['rabbit-1', 'rabbit-2', 'sheep-1'],
    });
    await activate(page, 'story-skip', true);
    expect(JSON.parse((await checkpoint(page))!)).toEqual(transition);
    await activate(page, 'story-continue', true);
    expect(JSON.parse((await checkpoint(page))!)).toEqual(bellwater);
    expect(await state(page)).toMatchObject({
      turn: 0,
      tideLevel: 0,
      boatNodeId: 'harbor',
      aboard: [],
      delivered: [],
    });
    await screenshot(page, '780x320-bellwater-start');
    await rescueBellwater(page, true);
    expect(JSON.parse((await checkpoint(page))!)).toEqual(bellwater);
    observations.bellwaterWon = await captureStory(page, '780x320-bellwater-arrival');
    await activate(page, 'continue-story', true);
    expect(JSON.parse((await checkpoint(page))!)).toEqual(complete);
    await expect(page.locator('#dialog')).toContainText(endpointCopy);
    observations.endpoint = await captureStory(page, '780x320-endpoint');
    await page.reload();
    await resume(page);
    await expect(page.locator('#dialog')).toContainText(endpointCopy);
    expect(JSON.parse((await checkpoint(page))!)).toEqual(complete);
    observations.endpointRestored = await captureStory(page, '780x320-endpoint-restored');
    expect(errors).toEqual([]);
  } finally {
    observations.errors = errors;
    observations.finalJourney = await journey(page).catch(() => null);
    observations.video = await page.video()!.path();
    await context.close();
    mkdirSync(reviewDir, { recursive: true });
    writeFileSync(`${reviewDir}/full-sequence.json`, JSON.stringify(observations, null, 2));
  }
});

test('story reload checkpoints: mid-cove, won before acceptance, pending transition and duplicate Continue', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await seed(context, JSON.stringify(holding));
  try {
    await title(page);
    await expect(page.locator('#journey-continue')).toContainText('from cove start');
    await page.reload();
    await resume(page);
    await holdingStart(page);
    await act(page, 'unload', true);
    await page.reload();
    await expect(page.locator('#dialog')).toContainText('An unfinished cove starts again.');
    await resume(page);
    await holdingStart(page);
    await rescueHolding(page, true, false);
    expect(JSON.parse((await checkpoint(page))!)).toEqual(holding);
    await page.reload();
    await resume(page);
    await holdingStart(page);
    await rescueHolding(page, true, false);
    await activate(page, 'continue-story', true);
    expect(JSON.parse((await checkpoint(page))!)).toEqual(transition);
    await page.reload();
    await resume(page);
    await expect(page.locator('#story-continue')).toBeEnabled();
    await expect(page.locator('#dialog')).toContainText(connectionCopy);
    await captureStory(page, '844x390-restored-transition');
    const button = await page.locator('#story-continue').boundingBox();
    await page.touchscreen.tap(button!.x + button!.width / 2, button!.y + button!.height / 2);
    await page.touchscreen.tap(button!.x + button!.width / 2, button!.y + button!.height / 2);
    await idle(page);
    expect(JSON.parse((await checkpoint(page))!)).toEqual(bellwater);
    expect(await state(page)).toMatchObject({ turn: 0, tideLevel: 0 });
    expect(await page.locator('canvas').count()).toBe(1);
    if (!(await page.locator('#dialog').isVisible())) await activate(page, 'menu', true);
    const menuCamera = await page.evaluate(
      () => (window as any).__LAST_FERRY__.getFrameStatus().camera,
    );
    await activate(page, 'journey-return', true);
    await expect(page.locator('#dialog')).toContainText('starts again');
    await activate(page, 'journey-return-cancel', true);
    expect(await state(page)).toMatchObject({ turn: 0 });
    await expect(page.locator('#dialog')).toHaveAttribute('data-mode', 'menu');
    expect(
      await page.evaluate(() => (window as any).__LAST_FERRY__.getFrameStatus().camera),
    ).toEqual(menuCamera);
    await activate(page, 'journey-return', true);
    await activate(page, 'journey-return-confirm', true);
    await expect(page.locator('#journey-continue')).toBeVisible();
    expect(JSON.parse((await checkpoint(page))!)).toEqual(bellwater);
  } finally {
    await context.close();
  }
});

test('story saved-record recovery: malformed, unsupported, unknown and inconsistent records are retained until replacement', async ({
  browser,
  baseURL,
}) => {
  const fixtures = [
    '{bad-json',
    JSON.stringify({ ...holding, version: 0 }),
    JSON.stringify({ ...holding, checkpoint: { kind: 'cove', id: 'not-built' } }),
    JSON.stringify({ ...holding, completed: ['bellwater'] }),
  ];
  const observations = [];
  for (const [index, raw] of fixtures.entries()) {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 320, height: 740 },
      hasTouch: true,
      isMobile: true,
    });
    await seed(context, raw, true);
    const page = await context.newPage();
    try {
      await title(page);
      await expect(page.locator('#dialog')).toContainText('kept');
      await expect(page.locator('#journey-continue')).toHaveCount(0);
      expect(await checkpoint(page)).toBe(raw);
      observations.push(await captureStory(page, `320x740-invalid-${index}`));
      await activate(page, 'journey-new', true);
      await activate(page, 'journey-replace-cancel', true);
      expect(await checkpoint(page)).toBe(raw);
      await activate(page, 'journey-new', true);
      await activate(page, 'journey-replace-confirm', true);
      expect(JSON.parse((await checkpoint(page))!)).toEqual(newJourney());
      for (const line of openingCopy) await expect(page.locator('#dialog')).toContainText(line);
      await expect(page.locator('#story-continue')).toBeEnabled();
      expect(
        await page.evaluate(() => ({
          mute: localStorage.getItem('last-ferry-muted'),
          motion: localStorage.getItem('last-ferry-motion'),
        })),
      ).toEqual({ mute: 'true', motion: 'reduced' });
      await activate(page, 'story-continue', true);
      await holdingStart(page);
    } finally {
      await context.close();
    }
  }
  writeFileSync(`${reviewDir}/invalid-recovery.json`, JSON.stringify(observations, null, 2));
});

test('story practice isolation: explicit three-cove and unknown links never read or overwrite journey progress', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ baseURL });
  await seed(context, JSON.stringify(transition));
  await context.addInitScript((key) => {
    (window as any).__journeyStorageAccess = [];
    const get = Storage.prototype.getItem,
      set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (name) {
      if (name === key) (window as any).__journeyStorageAccess.push('read');
      return get.call(this, name);
    };
    Storage.prototype.setItem = function (name, value) {
      if (name === key) (window as any).__journeyStorageAccess.push('write');
      return set.call(this, name, value);
    };
  }, journeyKey);
  const page = await context.newPage();
  const observations = [];
  try {
    for (const cove of ['first-crossing', 'holding-pier', 'bellwater', 'unknown-cove']) {
      await page.goto(`/?cove=${cove}`);
      await page.waitForFunction(
        () => ((window as any).__LAST_FERRY__?.getMetrics().frames ?? 0) > 4,
      );
      await idle(page);
      expect(await page.locator('#journey-new').count()).toBe(0);
      const accesses = await page.evaluate(() => (window as any).__journeyStorageAccess);
      observations.push({ cove, accesses, state: await state(page) });
      expect(accesses).toEqual([]);
      expect(await checkpoint(page)).toBe(JSON.stringify(transition));
      await act(page, 'wait');
      expect(await checkpoint(page)).toBe(JSON.stringify(transition));
    }
  } finally {
    await context.close();
  }
  writeFileSync(`${reviewDir}/practice-isolation.json`, JSON.stringify(observations, null, 2));
});

test('story unavailable storage: denied read and quota failure keep an honest playable in-memory journey', async ({
  browser,
  baseURL,
}) => {
  for (const failure of ['read', 'write']) {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 780, height: 320 },
      hasTouch: true,
      isMobile: true,
    });
    await context.addInitScript(
      ({ key, failure }) => {
        const get = Storage.prototype.getItem,
          set = Storage.prototype.setItem;
        Storage.prototype.getItem = function (name) {
          if (name === key && failure === 'read')
            throw new DOMException('Controlled storage denied', 'SecurityError');
          return get.call(this, name);
        };
        Storage.prototype.setItem = function (name, value) {
          if (name === key && failure === 'write')
            throw new DOMException('Controlled quota full', 'QuotaExceededError');
          return set.call(this, name, value);
        };
      },
      { key: journeyKey, failure },
    );
    const page = await context.newPage();
    try {
      await title(page);
      await activate(page, 'journey-new', true);
      await expect(page.locator('#dialog')).toContainText('will not survive closing');
      await activate(page, 'story-skip', true);
      await captureStory(page, `780x320-storage-${failure}`);
      await activate(page, 'story-continue', true);
      await holdingStart(page);
      await act(page, 'unload', true);
      expect(await state(page)).toMatchObject({ turn: 1 });
      await undo(page, true);
      await holdingStart(page);
    } finally {
      await context.close();
    }
  }
});

test('story native portrait: keyboard, Reduced Motion, mute preferences, cancellation and fullscreen identity', async ({
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
  await seed(context, JSON.stringify(holding));
  try {
    await title(page);
    await captureStory(page, '320x740-title');
    await tabTo(page, 'journey-settings');
    await page.keyboard.press('Enter');
    await tabTo(page, 'motion-preference');
    await page.locator('#motion-preference').selectOption('reduced');
    await tabTo(page, 'settings-sound');
    await page.keyboard.press('Enter');
    if (!(await page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus().muted))) {
      if (await page.locator('#settings-mute').isVisible())
        await activate(page, 'settings-mute', true);
      else await activate(page, 'settings-sound', true);
    }
    await tabTo(page, 'fullscreen');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
    await expect(page.locator('#dialog')).toHaveAttribute('open', '');
    await fullyVisible(page, page.locator('#settings-back'));
    await captureStory(page, '320x740-settings-fullscreen');
    await tabTo(page, 'settings-back');
    await page.keyboard.press('Enter');
    await tabTo(page, 'journey-new');
    await page.keyboard.press('Enter');
    await captureStory(page, '320x740-replace');
    await page.keyboard.press('Escape');
    expect(JSON.parse((await checkpoint(page))!)).toEqual(holding);
    await tabTo(page, 'journey-new');
    await page.keyboard.press('Enter');
    await tabTo(page, 'journey-replace-confirm');
    await page.keyboard.press('Enter');
    await expect(page.locator('#story-continue')).toBeEnabled();
    for (const line of openingCopy) await expect(page.locator('#dialog')).toContainText(line);
    await captureStory(page, '320x740-opening-reduced');
    await tabTo(page, 'story-continue');
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#story-continue')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#story-continue')).toBeFocused();
    expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus().muted)).toBe(
      true,
    );
    await page.evaluate(() => document.exitFullscreen());
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
    await expect(page.locator('#dialog')).toHaveAttribute('open', '');
    await tabTo(page, 'story-continue');
    await page.keyboard.press('Enter');
    await holdingStart(page);
    await screenshot(page, '320x740-holding-start');
    await activate(page, 'unload', true);
    await fullyVisible(page, page.locator('#commit'));
    await activate(page, 'cancel', true);
    await expect(page.locator('#unload')).toBeFocused();
  } finally {
    await context.close();
  }
});

test('story cold touch and background: real audio activation, settled readable scene, no turn or duplicate start', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  try {
    await page.goto('/');
    await expect
      .poll(() =>
        passive(
          page,
          () =>
            ((window as any).__LAST_FERRY__?.getMetrics().frames ?? 0) > 4 &&
            !!document.getElementById('journey-new')?.getBoundingClientRect().width,
        ),
      )
      .toBe(true);
    const cold = await passive(page, () => ({
      activation: navigator.userActivation.hasBeenActive,
      audio: (window as any).__LAST_FERRY__.getAudioStatus(),
    }));
    writeFileSync(`${reviewDir}/cold-precondition.json`, JSON.stringify(cold, null, 2));
    expect(cold.activation).toBe(false);
    expect(cold.audio).toMatchObject({ contextCount: 0, requested: false });
    await coldTouch(page, 'journey-new');
    await expect
      .poll(() => passive(page, () => (window as any).__LAST_FERRY__.getAudioStatus().running))
      .toBe(true);
    const initial = await checkpoint(page);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.locator('#story-continue')).toBeEnabled();
    for (const line of openingCopy) await expect(page.locator('#dialog')).toContainText(line);
    expect(await checkpoint(page)).toBe(initial);
    expect(await state(page)).toMatchObject({ turn: 0, tideLevel: 0 });
    await captureStory(page, '844x390-background-settled');
    await activate(page, 'story-continue', true);
    await holdingStart(page);
    const audio = await passive(page, () => (window as any).__LAST_FERRY__.getAudioStatus());
    expect(audio).toMatchObject({ contextCount: 1, schedulerCount: 1 });
    writeFileSync(
      `${reviewDir}/cold-story-audio.json`,
      JSON.stringify(
        {
          cold,
          audio,
          visibility: 'Controlled document.hidden/visibilitychange; not physical backgrounding',
        },
        null,
        2,
      ),
    );
  } finally {
    await context.close();
  }
});

test('story Bellwater route diagnosis: short landscape overview exposes the next adjacent passage', async ({
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
  const observations: Record<string, unknown> = {};
  page.setDefaultTimeout(30000);
  const snapshot = () =>
    page.evaluate(() => {
      const a = (window as any).__LAST_FERRY__;
      return {
        state: a.getState(),
        viewport: a.getViewportStatus(),
        view: a.getViewStatus(),
        frame: a.getFrameStatus(),
        target: [...document.querySelectorAll('.map-target')].map((e) => ({
          id: e.id,
          rect: e.getBoundingClientRect().toJSON(),
          parentRect: e.parentElement?.getBoundingClientRect().toJSON(),
          parentClass: e.parentElement?.className,
          style: e.getAttribute('style'),
          parentStyle: e.parentElement?.getAttribute('style'),
          centerHit: (() => {
            const r = e.getBoundingClientRect();
            return document
              .elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
              ?.closest('button')?.id;
          })(),
        })),
      };
    });
  try {
    await page.goto('/?cove=bellwater');
    await page.waitForFunction(
      () => ((window as any).__LAST_FERRY__?.getMetrics().frames ?? 0) > 4,
    );
    for (const id of ['map-shallows', 'map-low-pier', 'board']) await act(page, id, true);
    observations.before = await snapshot();
    await screenshot(page, '780x320-direct-bellwater-before-overview');
    await wholeCove(page, true);
    observations.overview = await snapshot();
    await screenshot(page, '780x320-direct-bellwater-overview');
    writeFileSync(`${reviewDir}/bellwater-overview.json`, JSON.stringify(observations, null, 2));
    await exposeBellwaterEast(page);
    observations.panned = await snapshot();
    await screenshot(page, '780x320-direct-bellwater-panned');
    writeFileSync(`${reviewDir}/bellwater-overview.json`, JSON.stringify(observations, null, 2));
    await fullyVisible(page, page.locator('#map-east-buoy'));
    await page.locator('#map-east-buoy').tap({ timeout: 15000 });
    await page.locator('#sail').tap({ timeout: 15000 });
    await idle(page);
    expect(await state(page)).toMatchObject({ turn: 4, boatNodeId: 'east-buoy', tideLevel: 1 });
  } finally {
    writeFileSync(`${reviewDir}/bellwater-overview.json`, JSON.stringify(observations, null, 2));
    await context.close();
  }
});

test('story production entry: title, opening and a real transfer use the built assets without debug hooks', async ({
  browser,
}) => {
  const port = process.env.LAST_FERRY_PRODUCTION_PORT ?? '4173';
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${port}`,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto('/');
    await expect(page.locator('#journey-new')).toBeVisible();
    expect(await page.evaluate(() => '__LAST_FERRY__' in window)).toBe(false);
    await activate(page, 'journey-new', true);
    await activate(page, 'story-skip', true);
    for (const line of openingCopy) await expect(page.locator('#dialog')).toContainText(line);
    const measurement = await page.evaluate(measureStory);
    expect(measurement.failures).toEqual([]);
    await screenshot(page, '390x844-production-opening');
    await activate(page, 'story-continue', true);
    await expect(page.locator('#readout')).toContainText('00 actions');
    await activate(page, 'unload', true);
    await expect(page.locator('#passenger-sheep-1')).toHaveAccessibleName('Moss 2 spaces');
    await fullyVisible(page, page.locator('#commit'));
    await activate(page, 'commit', true);
    await idle(page);
    await expect(page.locator('#readout')).toContainText('01 actions');
    expect(JSON.parse((await checkpoint(page))!)).toEqual(holding);
    expect(errors).toEqual([]);
    writeFileSync(
      `${reviewDir}/production-smoke.json`,
      JSON.stringify(
        {
          url: page.url(),
          measurement,
          errors,
          readout: await page.locator('#readout').textContent(),
          sourceScripts: await page
            .locator('script[src]')
            .evaluateAll((scripts) => scripts.map((script) => (script as HTMLScriptElement).src)),
        },
        null,
        2,
      ),
    );
  } finally {
    await context.close();
  }
});

test('story return cancellation: desktop entrance, restart, panned phone camera and practice chooser retain their state', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 1440, height: 900 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const observations: Record<string, unknown> = {};
  try {
    await title(page);
    await activate(page, 'journey-new');
    await activate(page, 'story-skip');
    observations.opening = await captureStory(page, '1440x900-opening');
    await activate(page, 'story-continue');
    await holdingStart(page);
    await screenshot(page, '1440x900-holding-start');
    await activate(page, 'unload');
    observations.preview = await captureStory(page, '1440x900-holding-preview');
    await activate(page, 'commit');
    await idle(page);
    const saved = await checkpoint(page);
    expect(await state(page)).toMatchObject({ turn: 1 });
    await restart(page);
    await holdingStart(page);
    expect(await checkpoint(page)).toBe(saved);
    await page.setViewportSize({ width: 844, height: 390 });
    await exposeBellwaterEast(page);
    await expect
      .poll(() => page.evaluate(() => (window as any).__LAST_FERRY__.getViewStatus().panned))
      .toBe(true);
    const before = await page.evaluate(() => {
      const a = (window as any).__LAST_FERRY__;
      const { revision, ...view } = a.getViewStatus();
      return {
        state: a.getState(),
        history: a.getRenderStatus().historyLength,
        camera: a.getFrameStatus().camera,
        view,
      };
    });
    await activate(page, 'menu', true);
    await activate(page, 'journey-return', true);
    observations.confirmation = await captureStory(page, '844x390-return-confirmation');
    await activate(page, 'journey-return-cancel', true);
    const after = await page.evaluate(() => {
      const a = (window as any).__LAST_FERRY__;
      const { revision, ...view } = a.getViewStatus();
      return {
        state: a.getState(),
        history: a.getRenderStatus().historyLength,
        camera: a.getFrameStatus().camera,
        view,
      };
    });
    expect(after).toEqual(before);
    expect(await checkpoint(page)).toBe(saved);
    observations.camera = { before, after };
    await activate(page, 'journey-return', true);
    await activate(page, 'journey-return-confirm', true);
    await activate(page, 'journey-practice', true);
    observations.practice = await captureStory(page, '844x390-practice-chooser');
    await expect(page.locator('#practice-first-crossing')).toContainText('practice');
    await activate(page, 'practice-first-crossing', true);
    expect(await state(page)).toMatchObject({
      turn: 0,
      boatNodeId: 'cut',
      aboard: ['rabbit-1', 'rabbit-2'],
    });
    expect(await checkpoint(page)).toBe(saved);
    await act(page, 'map-sheep-pier', true);
    await undo(page, true);
    expect(await state(page)).toMatchObject({ turn: 0, boatNodeId: 'cut' });
    expect(await checkpoint(page)).toBe(saved);
    expect(await page.locator('canvas').count()).toBe(1);
  } finally {
    writeFileSync(`${reviewDir}/return-cancellation.json`, JSON.stringify(observations, null, 2));
    await context.close();
  }
});
