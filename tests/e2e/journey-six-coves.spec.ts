import { expect, test, type Browser, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { activate, idle, tabTo } from './ui';
import { directory, recordRescue, report, snapshot } from './large-cove-support';
import { audio, backupKey, campaign, inspectScene, keepRecordedPictures, oldRecord, oldRoute, record, rescue, route, scenes, seed, startCheck, stored, timeline } from './journey-six-support';

test.setTimeout(360000);
test.use({
  launchOptions: {
    ignoreDefaultArgs: ['--autoplay-policy=no-user-gesture-required'],
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=document-user-activation-required'],
  },
});

function hash(value: string | Buffer) {
  return createHash('sha256').update(value).digest('hex');
}

function sources() {
  const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(
    entry => entry.isDirectory() ? walk(dir + '/' + entry.name) : [dir + '/' + entry.name],
  );
  const paths = [
    ...walk('src'), ...walk('data'), ...walk('assets/portraits'), ...walk('cove-portrait-package/portraits'),
    ...walk('cove-panel-package/material'), 'assets/catalog.json', 'index.html', 'package.json', 'package-lock.json', 'vite.config.ts',
  ].sort();
  const files = Object.fromEntries(paths.map(path => [path, hash(readFileSync(path))]));
  return { files, identity: hash(JSON.stringify(files)) };
}

let captureSource = '';
test.beforeEach(async ({ browser }, info) => {
  const input = sources();
  captureSource = input.identity;
  report(directory('provenance'), input.identity, {
    ...input, head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    node: process.version, browser: browser.version(), platform: process.platform,
    device: 'Chromium emulation, touch, DPR 1, ANGLE SwiftShader',
  });
  info.annotations.push({ type: 'captured working tree', description: input.identity });
});
test.afterEach(() => expect(sources().identity).toBe(captureSource));

async function phone(browser: Browser, baseURL: string | undefined, width: number, height: number, reduced = false) {
  const context = await browser.newContext({
    baseURL, viewport: { width, height }, isMobile: true, hasTouch: true, deviceScaleFactor: 1,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(60000);
  return { context, page };
}

async function openHome(page: Page, label: string) {
  await page.goto('/');
  await expect(page.locator('#home-play')).toHaveText(label);
}

async function readonlyHome(page: Page, raw: string) {
  await activate(page, 'home-options', true);
  await expect(page.locator('#tips-preference')).toHaveValue('off');
  await activate(page, 'settings-back', true);
  await activate(page, 'home-practice', true);
  await expect(page.locator('[data-practice]')).toHaveCount(8);
  await activate(page, 'practice-two-shelters', true);
  await idle(page);
  expect((await campaign(page)).active).toBe(false);
  await page.goto('/?cove=reef-return');
  await idle(page);
  expect((await campaign(page)).entry).toBe('direct');
  await page.goto('/');
  expect(await stored(page)).toBe(raw);
  expect(await stored(page, backupKey)).toBeNull();
}

test('fresh root Journey earns six rescues and the four-to-six-space launch', async ({ browser, baseURL }) => {
  const { page, context } = await phone(browser, baseURL, 390, 844, true);
  const results = [];
  try {
    await openHome(page, 'Play');
    expect(await stored(page)).toBeNull();
    await activate(page, 'home-play', true);
    for (const [index, id] of route.entries()) {
      expect((await record(page)).completed).toEqual(route.slice(0, index));
      expect(await timeline(page)).toMatchObject({ scene: scenes[index], settled: true });
      if (id === 'holding-pier') {
        await tabTo(page, 'story-continue');
        for (const shot of ['lantern', 'ferry']) {
          await page.keyboard.press('Enter');
          await expect.poll(async () => (await timeline(page)).shot).toBe(shot);
        }
      }
      if (id === 'wide-berth') {
        expect((await campaign(page)).level).toBe('two-shelters');
        expect(await timeline(page)).toMatchObject({ shot: 'launch', duration: 8000 });
        await snapshot(page, directory('fresh'), 'after-two-shelters-launch');
      }
      await expect(page.locator('#story-continue')).toBeEnabled();
      await tabTo(page, 'story-continue');
      await page.keyboard.press('Enter');
      results.push(await rescue(page, id, false));
      await activate(page, 'continue-story', true);
    }
    await expect(page.locator('#dialog')).toContainText('Six coves are safe.');
    expect(await record(page)).toMatchObject({ checkpoint: { kind: 'complete' }, completed: route, acknowledgedScenes: scenes });
    await snapshot(page, directory('fresh'), 'available-coast-complete');
    report(directory('fresh'), 'rescues', { results, record: await record(page), source: captureSource });
    await page.reload();
    await expect(page.locator('#home-play')).toHaveText('Play a cove');
    await expect(page.locator('.home-notice')).toContainText('Six coves are safe');
  } finally {
    await context.close();
  }
});

for (const [width, height] of [[390, 844], [780, 320]]) {
  test(`legacy Wide rescue to both authored scenes and actual continuation ${width}x${height}`, async ({ browser, baseURL }) => {
    const { page, context } = await phone(browser, baseURL, width, height);
    const raw = oldRecord(4, { kind: 'complete' });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    const size = width + 'x' + height;
    const dir = directory('continuation');
    let stop: Awaited<ReturnType<typeof recordRescue>> | undefined;
    try {
      await seed(page, raw);
      await openHome(page, 'Continue');
      await readonlyHome(page, raw);
      await expect(page.locator('.home-notice')).toContainText('Two Shelters');
      await expect(page.locator('.home-notice')).toContainText('Wide Berth');
      await snapshot(page, dir, size + '-earned-wide-home');
      if (width === 390) {
        if ((await audio(page)).contextState !== 'running') await activate(page, 'home-sound', true);
        await expect.poll(async () => (await audio(page)).contextState).toBe('running');
        stop = await recordRescue(page, dir, 'two-shelters-to-reef');
        await page.waitForTimeout(650);
      }
      await activate(page, 'home-play', true);
      await inspectScene(page, 'two-shelters', width === 780);
      expect(await stored(page, backupKey)).toBe(raw);
      expect((await record(page)).completed).toEqual(oldRoute);
      await activate(page, 'story-continue', true);
      const two = await rescue(page, 'two-shelters', true);
      await snapshot(page, dir, size + '-two-rescued');
      await activate(page, 'continue-story', true);
      await inspectScene(page, 'reef-return', width === 780);
      expect((await record(page)).completed).toEqual(route.slice(0, 5));
      expect((await record(page)).acknowledgedScenes).toEqual(scenes.slice(0, 5));
      if (width === 780) {
        const pending = await stored(page);
        await page.locator('#story-more > summary').tap();
        await activate(page, 'story-replay', true);
        await page.locator('#story-more > summary').tap();
        expect(await timeline(page)).toMatchObject({ settled: false, recap: false });
        await page.keyboard.press('Escape');
        expect(await timeline(page)).toMatchObject({ settled: true, recap: true });
        expect((await audio(page)).storyToken).toBeNull();
        expect(await stored(page)).toBe(pending);
        await page.reload();
        await tabTo(page, 'home-play');
        await page.keyboard.press('Enter');
        expect(await timeline(page)).toMatchObject({ scene: scenes[5], settled: true, recap: true });
        await expect(page.locator('#story-continue')).toBeFocused();
        await page.keyboard.press('Enter');
      } else await activate(page, 'story-continue', true);
      await startCheck(page, 'reef-return');
      const sound = await audio(page);
      expect(sound.storyToken).toBeNull();
      expect(sound.storySources).toBe(0);
      let reef;
      if (width === 390) {
        reef = await rescue(page, 'reef-return', true);
        await snapshot(page, dir, size + '-reef-rescued');
        await activate(page, 'continue-story', true);
        await expect(page.locator('#dialog')).toContainText('Six coves are safe.');
        expect((await record(page)).completed).toEqual(route);
        await page.waitForTimeout(700);
      }
      expect(await stored(page, backupKey)).toBe(raw);
      expect(errors).toEqual([]);
      report(dir, size + '-result', { source: captureSource, two, reef, final: await record(page), preservedOriginal: true, errors });
      if (stop) {
        await stop();
        stop = undefined;
        keepRecordedPictures(dir);
      }
    } finally {
      if (stop) await stop();
      await context.close();
    }
  });
}
