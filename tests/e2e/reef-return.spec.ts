import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, activate, idle, undo, fullyVisible, wholeCove } from './ui';
import { journeyKey, passive } from './story-support';
import { productionURL } from './evidence';

const out = process.env.LAST_FERRY_REVIEW_DIR ?? 'test-results/reef-return';
const report = (name: string, data: unknown) => writeFileSync(join(out, name + '.json'), JSON.stringify(data, null, 2));
test.beforeAll(() => { mkdirSync(out, { recursive: true }); });

async function photo(page: Page, name: string) {
  await page.waitForTimeout(350);
  await page.screenshot({ path: join(out, name + '.png'), animations: 'allow' });
}

async function playView(page: Page) {
  if ((await page.locator('#view-toggle').textContent())?.includes('Play view'))
    await activate(page, 'view-toggle', true);
}

test('portrait greedy pickup, blocked loaded return and six-step recovery', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await ctx.newPage();
  page.setDefaultTimeout(12000);
  await page.goto('/?cove=reef-return');
  await transfer(page, 'board');
  await act(page, 'map-quay', true);
  await wholeCove(page, true);
  await expect(page.locator('#view-toggle')).toContainText('Play view');
  const before = await passive(page, () => (window as any).__LAST_FERRY__.getState());
  await activate(page, 'map-harbor', true);
  await expect(page.locator('#sail')).toContainText('anyway');
  await expect(page.locator('#local-context')).toContainText('Birch');
  await activate(page, 'close-location', true);
  await act(page, 'wait', true);
  await cross(page, 'pool');
  await transfer(page, 'board');
  await activate(page, 'map-quay', true);
  await expect(page.locator('#sail')).toBeDisabled();
  await expect(page.locator('#local-context')).toContainText(/depth 4.*passage 3/i);
  await photo(page, '390x844-greedy-return');
  await activate(page, 'close-location', true);
  for (let targetTurn = 6; targetTurn <= 8; targetTurn++) {
    await activate(page, 'wait', true);
    await expect(page.locator('#dialog')).toHaveAttribute('open', '');
    if (targetTurn === 8) await expect(page.locator('#dialog')).toContainText(/reef|current/i);
    await activate(page, 'commit', true);
    await idle(page);
    await expect(page.locator('[data-testid=turn]')).toHaveText(String(targetTurn).padStart(2, '0'));
  }
  await expect(page.locator('#dialog')).toHaveAttribute('data-outcome', 'lost');
  await expect(page.locator('#dialog')).toContainText(/will not turn|away from Harbor/i);
  await photo(page, '390x844-greedy-loss');
  for (let turn = 8; turn > 2; turn--) await undo(page, true);
  expect(await passive(page, () => (window as any).__LAST_FERRY__.getState())).toEqual(before);
  await transfer(page, 'unload', ['heather']);
  await expect(page.locator('[data-testid=tide]')).toHaveText('1');
  expect(await passive(page, key => localStorage.getItem(key), journeyKey)).toBeNull();
  await ctx.close();
});

async function cross(page: Page, to: string) {
  await act(page, 'map-' + to, true);
  await playView(page);
}

async function transfer(page: Page, type: 'board' | 'unload', subset?: string[], chooserPicture?: string) {
  await activate(page, type, true);
  if (await page.locator('#dialog[open][data-mode=action]').count()) {
    const options = page.locator('.passenger-options button');
    if (subset) {
      for (const button of await options.all()) {
        const name = (await button.getAttribute('id'))!.replace('passenger-', '');
        if (((await button.getAttribute('aria-pressed')) === 'true') !== subset.includes(name))
          await button.tap();
      }
    }
    if (chooserPicture) {
      await fullyVisible(page, page.locator('#commit'));
      if (chooserPicture === '780x320-bring-home') {
        const fit = await page.locator('.reef-manifest').evaluate(element => ({
          columns: getComputedStyle(element).gridTemplateColumns.split(' ').length,
          lines: [...element.querySelectorAll('.cove-choice-name')].map(label => {
            const range = document.createRange();
            range.selectNodeContents(label);
            return range.getClientRects().length;
          })
        }));
        expect(fit).toEqual({ columns: 2, lines: [1, 1, 1, 1] });
      }
      await photo(page, chooserPicture);
    }
    await activate(page, 'commit', true);
  }
  await idle(page);
}

async function record(page: Page) {
  const directory = join(out, 'raw', 'reef-rescue');
  mkdirSync(directory, { recursive: true });
  const audioStartEpochMs = await passive(page, () => {
    const stream = (window as any).__LAST_FERRY__.captureAudioStream();
    if (!stream) throw Error('No runtime audio stream');
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    const chunks: Blob[] = [];
    const done = new Promise<number[]>((resolve) => {
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = async () => resolve(Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())));
    });
    (window as any).__reefCapture = { recorder, done };
    const start = performance.timeOrigin + performance.now();
    recorder.start();
    return start;
  });
  const cdp = await page.context().newCDPSession(page);
  const frames: { path: string; timestamp: number; receipt: number }[] = [];
  cdp.on('Page.screencastFrame', (event) => {
    const path = join(directory, 'frame-' + String(frames.length).padStart(6, '0') + '.jpg');
    writeFileSync(path, Buffer.from(event.data, 'base64'));
    frames.push({ path, timestamp: event.metadata.timestamp!, receipt: Date.now() });
    void cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId });
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, everyNthFrame: 2 });
  return async () => {
    await cdp.send('Page.stopScreencast');
    const bytes = await passive(page, async () => {
      const { recorder, done } = (window as any).__reefCapture;
      recorder.stop();
      return await done as number[];
    });
    const audio = join(directory, 'runtime-audio.webm');
    writeFileSync(audio, new Uint8Array(bytes));
    report('reef-rescue-recording', { viewport: page.viewportSize(), audioStartEpochMs, audio, frames });
    await cdp.detach();
  };
}

for (const landscape of [true, false]) {
  test(landscape ? 'short landscape production rescue, missed window and Undo' : 'portrait rescue, forecast, mixed loading and uninterrupted runtime sound', async ({ browser, baseURL }) => {
    test.setTimeout(240000);
    const viewport = landscape ? { width: 780, height: 320 } : { width: 390, height: 844 };
    const ctx = await browser.newContext({ viewport, hasTouch: true, isMobile: true, deviceScaleFactor: 1, reducedMotion: landscape ? 'reduce' : 'no-preference' });
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const progress = JSON.stringify({ version: 1, completed: ['holding-pier'], acknowledgedScenes: ['opening'], checkpoint: { kind: 'scene', id: 'another-bell' } }, null, 2);
    await page.addInitScript(({ key, progress, muted }) => {
      if (!sessionStorage.reefTestSeed) {
        localStorage.setItem(key, progress);
        localStorage.setItem('last-ferry-muted', String(muted));
        sessionStorage.reefTestSeed = '1';
      }
    }, { key: journeyKey, progress, muted: landscape });
    const origin = landscape ? (process.env.LAST_FERRY_PRODUCTION_URL ?? productionURL) : baseURL!;
    await page.goto(origin + (landscape ? '/' : '/?cove=reef-return'));
    if (landscape) {
      await activate(page, 'home-practice', true);
      await activate(page, 'practice-reef-return', true);
      expect(await page.evaluate(() => !!(window as any).__LAST_FERRY__)).toBe(false);
    }
    const prefix = viewport.width + 'x' + viewport.height;
    const tide = page.locator('[data-testid=tide]');
    const turn = page.locator('[data-testid=turn]');
    await expect(page.locator('#seascape')).toHaveAttribute('aria-label', /Reef Return/);
    await idle(page);
    const at = async (value: number) => {
      await expect(turn).toHaveText(String(value).padStart(2, '0'));
      expect(await passive(page, key => localStorage.getItem(key), journeyKey)).toBe(progress);
    };
    await at(0);
    await fullyVisible(page, page.locator('#board'));
    await fullyVisible(page, page.locator('#status-toggle'));
    await photo(page, prefix + '-start');
    await activate(page, 'status-toggle', true);
    await expect(page.locator('#dialog')).toContainText(/reef/i);
    await expect(page.locator('#dialog')).toContainText(/Harbor/);
    await expect(page.locator('#dialog')).toContainText(/8/);
    await photo(page, prefix + '-forecast');
    await activate(page, 'cancel', true);
    await at(0);
    if (!landscape) await expect.poll(() => passive(page, () => (window as any).__LAST_FERRY__.getAudioStatus().contextState)).toBe('running');
    const stop = !landscape ? await record(page) : null;
    let recordingSaved = false;
    try {
      await transfer(page, 'board');
      await at(1);
      await cross(page, 'quay');
      await at(2);
      await transfer(page, 'unload', ['heather'], prefix + '-stage-choice');
      await at(3);
      await expect(tide).toHaveText('1');
      await cross(page, 'pool');
      await transfer(page, 'board');
      await at(5);
      await photo(page, prefix + '-pool-aboard');
      await cross(page, 'quay');
      await transfer(page, 'board');
      await at(7);
      await photo(page, prefix + '-loaded');
      if (landscape) {
        await activate(page, 'wait', true);
        await expect(page.locator('#dialog')).toContainText(/reef|current/i);
        await activate(page, 'commit', true);
        await idle(page);
        await expect(page.locator('#dialog')).toHaveAttribute('data-outcome', 'lost');
        await expect(page.locator('#dialog')).toContainText(/reef|current/i);
        await photo(page, prefix + '-missed-window');
        await undo(page, true);
        await at(7);
        await expect(tide).toHaveText('1');
      }
      await activate(page, 'map-harbor', true);
      await fullyVisible(page, page.locator('#sail'));
      await expect(page.locator('#sail')).toBeEnabled();
      await expect(page.locator('#local-context')).toContainText(/reef|current/i);
      await at(7);
      await photo(page, prefix + '-last-crossing');
      await activate(page, 'sail', true);
      if (!landscape) {
        await playView(page);
        await expect(page.locator('#seascape')).toHaveAttribute('aria-busy', 'true');
        await expect(page.locator('#status-toggle')).toContainText('Needle Reef to Harbor');
        await expect(page.locator('#status-toggle')).toContainText('turns on arrival');
        const sailing = await passive(page, () => {
          const game = (window as any).__LAST_FERRY__;
          const navigation = game.getNavigationStatus();
          return {
            state: game.getState(),
            flow: navigation.routes.find((r: {id: string}) => r.id === 'needle-reef').flowFrom,
            coveredEndpoints: navigation.markers.filter((m: {id: string; visible: boolean}) => ['harbor', 'quay'].includes(m.id) && !m.visible).length,
            quayHidden: !!document.querySelector('#map-quay')?.closest('.offscreen'),
            harborHidden: !!document.querySelector('#map-harbor')?.closest('.offscreen'),
          };
        });
        expect(sailing).toMatchObject({ state: { turn: 8, tideLevel: 2 }, flow: 'quay', coveredEndpoints: 2, quayHidden: true, harborHidden: true });
        report('crossing-in-motion', sailing);
        await photo(page, prefix + '-sailing');
      }
      await idle(page);
      await at(8);
      await expect(tide).toHaveText('2');
      await expect(page.locator('#status-toggle')).toContainText('Needle Reef to Cairn Quay only');
      if (!landscape) {
        const flow = await passive(page, () => (window as any).__LAST_FERRY__.getNavigationStatus().routes.find((r: {id:string}) => r.id === 'needle-reef').flowFrom);
        expect(flow).toBe('harbor');
      }
      await playView(page);
      await photo(page, prefix + '-after-turn');
      if (landscape) {
        await undo(page, true);
        await at(7);
        await expect(tide).toHaveText('1');
        await cross(page, 'harbor');
      }
      await transfer(page, 'unload', undefined, prefix + '-bring-home');
      await at(9);
      await expect(page.locator('#dialog')).toHaveAttribute('data-outcome', 'won');
      await expect(page.locator('#continue-story')).toHaveCount(0);
      await photo(page, prefix + '-home');
      if (stop) {
        await page.waitForTimeout(2400);
        await stop();
        recordingSaved = true;
        await undo(page, true);
        await undo(page, true);
        await at(7);
        await activate(page, 'map-harbor', true);
        await activate(page, 'sail', true);
        await expect(page.locator('#status-headline')).toContainText('turns on arrival');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await idle(page);
        await expect(page.locator('#status-headline')).toContainText('Needle Reef to Cairn Quay only');
        await at(8);
        await undo(page, true);
        await expect(page.locator('#status-headline')).toContainText('Needle Reef to Harbor');
        await at(7);
      }
      expect(errors).toEqual([]);
      report(prefix + '-run', { browser: browser.version(), viewport, node: process.version, builtGame: landscape, url: page.url(), errors, savePreserved: true, tideAfterCrossing: 2, deliveredOnTurn: 9, portraitRuntimeAudio: !!stop });
    } finally {
      if (stop && !recordingSaved) await stop();
      await ctx.close();
    }
  });
}
