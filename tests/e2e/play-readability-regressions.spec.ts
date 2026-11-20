import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import { act, activate, fullyVisible, idle, ready, state, tabTo, undo, wholeCove } from './ui';

test.setTimeout(240000);
const witnesses = (path: string) =>
  JSON.parse(readFileSync(path, 'utf8')) as {
    witnesses: { id: string; actions: { type: string; to?: string }[] }[];
  };
const bellwaterWitnesses = witnesses('data/bellwater/witnesses.json');
const wideWitnesses = witnesses('data/wide-berth/witnesses.json');
const sizes = [
  { width: 390, height: 844 },
  { width: 780, height: 320 },
];
const save = (name: string, value: unknown) =>
  writeFileSync(`${reviewDir}/${name}.json`, JSON.stringify(value, null, 2));
const hash = (value: Buffer | string) => createHash('sha256').update(value).digest('hex');
function source() {
  const walk = (directory: string): string[] =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory() ? walk(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`],
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
      'tests/e2e/play-readability-regressions.spec.ts',
      'tests/e2e/ui.ts',
    ]
      .sort()
      .map((path) => [path, hash(readFileSync(path))]),
  );
  return {
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    capturedAt: new Date().toISOString(),
    node: process.version,
    files,
    sha256: hash(JSON.stringify(files)),
  };
}
test.beforeAll(async ({ browser }) => {
  mkdirSync(reviewDir, { recursive: true });
  save('regressions-source-before', {
    ...source(),
    browser: browser.version(),
    evidence:
      'Actual UI, native CSS viewport DPR1, emulated touch and natural keyboard, development runtime, no state injection.',
  });
  writeFileSync(
    `${reviewDir}/executed-play-readability-regressions.spec.ts`,
    readFileSync('tests/e2e/play-readability-regressions.spec.ts'),
  );
});
test.afterAll(() => save('regressions-source-after', source()));
async function shot(page: Page, name: string) {
  await page.waitForTimeout(250);
  const session = await page.context().newCDPSession(page);
  const image = await session.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  const bytes = Buffer.from(image.data, 'base64');
  writeFileSync(`${reviewDir}/${name}.png`, bytes);
  await session.detach();
  expect(bytes.length).toBeGreaterThan(5000);
  save(
    name,
    await page.evaluate(() => {
      const g = (window as any).__LAST_FERRY__;
      return {
        viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
        state: g.getState(),
        frame: g.getFrameStatus(),
        view: g.getViewStatus(),
        selection: g.getSelectionStatus(),
        audio: g.getAudioStatus(),
        active: document.activeElement?.id,
      };
    }),
  );
}
async function fitChoices(page: Page) {
  for (const choice of await page.locator('.passenger-options button').all()) {
    await fullyVisible(page, choice);
    await expect(choice).toHaveAttribute('aria-pressed', /true|false/);
    const overflow = await choice.evaluate((button) =>
      [...button.querySelectorAll<HTMLElement>('*')]
        .filter(
          (element) =>
            element.scrollWidth > element.clientWidth + 1 &&
            getComputedStyle(element).overflowX !== 'visible',
        )
        .map((element) => element.className),
    );
    expect(overflow).toEqual([]);
  }
  await fullyVisible(page, page.locator('#commit'));
  await fullyVisible(page, page.locator('#cancel'));
}
async function cameraFrames(page: Page, name: string) {
  const before = await state(page);
  await page.keyboard.press('Escape');
  for (const size of sizes) {
    await page.setViewportSize(size);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    if ((await page.locator('#view-toggle').innerText()).includes('Play view')) {
      await activate(page, 'view-toggle', true);
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
    }
    if (await page.locator('#back-to-boat').isVisible()) await activate(page, 'back-to-boat', true);
    await expect(page.locator('#view-toggle')).toContainText('Whole cove');
    for (const id of ['load-toggle', 'undo', 'menu', 'view-toggle'])
      await fullyVisible(page, page.locator(`#${id}`));
    await shot(page, `${name}-${size.width}x${size.height}-play`);
    await wholeCove(page, true);
    await expect(page.locator('#view-toggle')).toContainText('Play view');
    await shot(page, `${name}-${size.width}x${size.height}-overview`);
    expect(await state(page)).toEqual(before);
  }
}

test('Bellwater actual rabbit pickup retains free subsets, loaded views and Undo', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: sizes[0],
    deviceScaleFactor: 1,
    hasTouch: true,
  });
  const page = await context.newPage(),
    errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await ready(page, 'bellwater');
  const prefix = bellwaterWitnesses.witnesses
    .find((witness) => witness.id === 'shallow-outward-deep-return')!
    .actions.slice(0, 2);
  for (const action of prefix) await act(page, `map-${action.to}`, true);
  const before = await state(page);
  await activate(page, 'board', true);
  await expect(page.locator('.passenger-options button')).toHaveCount(2);
  await fitChoices(page);
  await activate(page, 'passenger-lark', true);
  await expect(page.locator('#passenger-lark')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#passenger-tansy')).toHaveAttribute('aria-pressed', 'true');
  expect(await state(page)).toEqual(before);
  await shot(page, 'bellwater-390x844-subset');
  await activate(page, 'passenger-lark', true);
  await activate(page, 'commit', true);
  await idle(page);
  expect(await state(page)).toMatchObject({
    turn: 3,
    aboard: ['tansy', 'lark'],
    status: 'playing',
  });
  await cameraFrames(page, 'bellwater-loaded');
  await activate(page, 'unload', true);
  await fitChoices(page);
  await activate(page, 'passenger-lark', true);
  await expect(page.locator('.consequence')).toContainText('This ends the crossing');
  await shot(page, 'bellwater-780x320-unload-warning');
  await page.keyboard.press('Escape');
  expect((await state(page)).turn).toBe(3);
  await undo(page, true);
  expect(await state(page)).toEqual(before);
  expect(errors).toEqual([]);
  await context.close();
});

test('Wide Berth full-six pickup and staged subset retain native controls and both camera modes', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: sizes[0],
    deviceScaleFactor: 1,
    hasTouch: true,
  });
  const page = await context.newPage(),
    errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await ready(page, 'wide-berth');
  const prefix = wideWitnesses.witnesses
    .find((witness) => witness.id === 'light-through-beacon')!
    .actions.slice(0, 2);
  for (const action of prefix)
    await act(page, action.type === 'move' ? `map-${action.to}` : action.type, true);
  const full = await state(page);
  expect(full).toMatchObject({
    turn: 2,
    tideLevel: 0,
    aboard: ['alder', 'clover', 'poppy', 'wren'],
    boatNodeId: 'high-quay',
    status: 'playing',
  });
  await expect(page.locator('#load-toggle')).toContainText('6/6');
  await cameraFrames(page, 'wide-full-six');
  await activate(page, 'unload', true);
  await expect(page.locator('.passenger-options button')).toHaveCount(4);
  await fitChoices(page);
  for (const id of ['poppy', 'wren']) await activate(page, `passenger-${id}`, true);
  await expect(page.locator('#commit')).toContainText('Let Alder and Clover ashore');
  expect(await state(page)).toEqual(full);
  await shot(page, 'wide-780x320-staging-subset');
  await activate(page, 'commit', true);
  await idle(page);
  expect(await state(page)).toMatchObject({
    turn: 3,
    aboard: ['poppy', 'wren'],
    status: 'playing',
  });
  await shot(page, 'wide-780x320-staged');
  await undo(page, true);
  expect(await state(page)).toEqual(full);
  expect(errors).toEqual([]);
  await context.close();
});

test('First Crossing initial practice retains its original roster and free inspection', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: sizes[0],
    deviceScaleFactor: 1,
    hasTouch: true,
  });
  const page = await context.newPage();
  await ready(page, 'first-crossing');
  const initial = await state(page);
  expect(initial).toMatchObject({ turn: 0, aboard: ['rabbit-1', 'rabbit-2'], status: 'playing' });
  await cameraFrames(page, 'first-crossing-initial');
  await activate(page, 'map-harbor', true);
  await expect(page.locator('#local-context')).toBeVisible();
  expect(await state(page)).toEqual(initial);
  await page.keyboard.press('Escape');
  await expect(page.locator('#map-harbor')).toBeFocused();
  expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getCampaignStatus().entry)).toBe(
    'direct',
  );
  await context.close();
});

test('Home Options preserve natural focus, sound mute and inactive gameplay after phone rotation', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: sizes[0],
    deviceScaleFactor: 1,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('#home-play')).toBeVisible();
  const before = await state(page);
  await activate(page, 'home-sound', true);
  await expect
    .poll(() => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus().muted))
    .toBe(false);
  for (const size of sizes) {
    await page.setViewportSize(size);
    for (const id of ['home-play', 'home-options', 'home-practice', 'home-sound'])
      await fullyVisible(page, page.locator(`#${id}`));
    await shot(page, `home-${size.width}x${size.height}`);
  }
  await tabTo(page, 'home-options');
  await page.keyboard.press('Enter');
  for (const id of ['settings-sound', 'settings-back', 'motion-preference'])
    await fullyVisible(page, page.locator(`#${id}`));
  await expect(page.locator('#settings-sound')).toHaveText(/Mute sound/);
  await tabTo(page, 'settings-sound');
  await page.keyboard.press('Enter');
  await expect
    .poll(() => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus().muted))
    .toBe(true);
  await shot(page, 'home-780x320-settings-muted');
  await activate(page, 'settings-back', true);
  await expect(page.locator('#home-options')).toBeFocused();
  expect(await state(page)).toEqual(before);
  await expect(page.locator('#seascape')).toHaveAttribute('inert', '');
  expect(await page.evaluate(() => localStorage.getItem('last-ferry-muted'))).toBe('true');
  await context.close();
});
