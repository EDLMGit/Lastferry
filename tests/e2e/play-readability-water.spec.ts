import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import { act, activate, idle, ready, selectPlace, state, undo, wholeCove } from './ui';

test.setTimeout(240000);
const directory = `${reviewDir}/water`;
mkdirSync(directory, { recursive: true });
const save = (name: string, value: unknown) =>
  writeFileSync(`${directory}/${name}.json`, JSON.stringify(value, null, 2));
const walk = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`],
  );
const files = () =>
  Object.fromEntries(
    [...walk('src'), ...walk('data'), 'package.json', 'package-lock.json']
      .sort()
      .map((path) => [path, createHash('sha256').update(readFileSync(path)).digest('hex')]),
  );
async function shot(page: Page, name: string, diagnostic = false) {
  console.log(`Water capture: ${name}`);
  const style = diagnostic
    ? await page.addStyleTag({ content: '#map-labels { visibility: hidden !important; }' })
    : null;
  save(
    name,
    await page.evaluate((diagnostic) => {
      const game = (window as any).__LAST_FERRY__;
      return {
        diagnosticLabelSuppressionOnly: diagnostic,
        state: game.getState(),
        view: game.getViewStatus(),
        environment: game.getEnvironmentStatus(),
        frame: game.getFrameStatus(),
        viewport: game.getViewportStatus(),
      };
    }, diagnostic),
  );
  const cdp = await page.context().newCDPSession(page);
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const capture = await Promise.race([
      cdp.send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
        captureBeyondViewport: false,
      }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Native capture exceeded 30000ms: ${name}`)),
          30000,
        );
      }),
    ]);
    writeFileSync(`${directory}/${name}.png`, Buffer.from(capture.data, 'base64'));
  } finally {
    clearTimeout(timer);
    await cdp.detach();
  }
  if (style) await style.evaluate((element) => element.parentNode?.removeChild(element));
}
async function closePlace(page: Page) {
  if (await page.locator('#close-location').isVisible())
    await activate(page, 'close-location', true);
}
async function playView(page: Page) {
  if ((await page.locator('#view-toggle').textContent())?.includes('Play view'))
    await activate(page, 'view-toggle', true);
  else if (await page.locator('#back-to-boat').isVisible()) await activate(page, 'back-to-boat', true);
  await expect.poll(() => page.evaluate(() => (window as any).__LAST_FERRY__.getViewStatus().mode)).toBe('play');
}

test('readability water: Holding banks, deeper basins, matched loads and tide Undo at native portrait', async ({
  browser,
}) => {
  const source = files();
  save('holding-source', {
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    at: new Date().toISOString(),
    browser: browser.version(),
    node: process.version,
    files: source,
    viewport: { width: 390, height: 844 },
    reducedMotion: true,
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await ready(page, 'holding-pier');
    await shot(page, 'holding-390x844-tide0-heavy-play');
    await wholeCove(page, true);
    await shot(page, 'holding-390x844-tide0-heavy-overview');
    await selectPlace(page, 'shallows', true);
    await expect(page.locator('#sail')).toBeDisabled();
    await expect(page.locator('#local-context')).toContainText('Needs depth 2');
    await shot(page, 'holding-390x844-depth1-blocked');
    expect((await state(page)).turn).toBe(0);
    await closePlace(page);
    await act(page, 'unload', true);
    await wholeCove(page, true);
    await shot(page, 'holding-390x844-tide0-light-overview');
    await shot(page, 'holding-390x844-tide0-label-free', true);
    await act(page, 'map-shallows', true);
    await playView(page);
    await shot(page, 'holding-390x844-tide0-shallow-play');
    await shot(page, 'holding-390x844-tide0-shallow-play-label-free', true);
    await act(page, 'map-rabbit-pier', true);
    const beforeRise = await state(page);
    await act(page, 'board', true);
    expect(await state(page)).toMatchObject({ turn: 4, tideLevel: 1, status: 'playing' });
    await wholeCove(page, true);
    await shot(page, 'holding-390x844-tide1-overview');
    await undo(page, true);
    expect(await state(page)).toEqual(beforeRise);
    await shot(page, 'holding-390x844-tide-undo');
    await act(page, 'board', true);
    await act(page, 'map-shallows', true);
    await act(page, 'map-stone', true);
    await selectPlace(page, 'shallows', true);
    await expect(page.locator('#sail')).toBeEnabled();
    await shot(page, 'holding-390x844-depth1-now-legal');
    expect(await state(page)).toMatchObject({ turn: 6, tideLevel: 1 });
    await closePlace(page);
    await act(page, 'board', true);
    await act(page, 'map-harbor', true);
    expect(await state(page)).toMatchObject({ turn: 8, tideLevel: 2, status: 'playing' });
    await wholeCove(page, true);
    await shot(page, 'holding-390x844-tide2-overview');
    expect(errors).toEqual([]);
    expect(files()).toEqual(source);
    save('holding-results', {
      errors,
      states: 'actual UI through turn8, tide Undo/replay, complete rescue covered separately',
      sourceUnchangedDuringCapture: true,
    });
  } finally {
    await context.close();
  }
});

test('readability water: Driftwood three tides and stable load geography with Bellwater/Wide deep-route smoke', async ({
  browser,
}) => {
  const source = files();
  save('driftwood-source', {
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    at: new Date().toISOString(),
    browser: browser.version(),
    node: process.version,
    files: source,
    viewport: { width: 780, height: 320 },
    reducedMotion: true,
  });
  const context = await browser.newContext({
    viewport: { width: 780, height: 320 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await ready(page, 'driftwood-yard');
    await wholeCove(page, true);
    await shot(page, 'driftwood-780x320-tide0-overview');
    await act(page, 'map-yard', true);
    await act(page, 'board', true);
    await act(page, 'map-mooring', true);
    await playView(page);
    await shot(page, 'driftwood-780x320-tide0-heavy-play');
    await wholeCove(page, true);
    await shot(page, 'driftwood-780x320-tide0-heavy-overview');
    await act(page, 'unload', true);
    await wholeCove(page, true);
    await shot(page, 'driftwood-780x320-tide0-light-overview');
    await shot(page, 'driftwood-780x320-tide0-label-free', true);
    await act(page, 'map-bend', true);
    await playView(page);
    await shot(page, 'driftwood-780x320-tide0-shallow-play');
    await shot(page, 'driftwood-780x320-tide0-shallow-play-label-free', true);
    await act(page, 'map-reeds', true);
    const beforeRise = await state(page);
    await act(page, 'board', true);
    expect(await state(page)).toMatchObject({ turn: 7, tideLevel: 1, status: 'playing' });
    await wholeCove(page, true);
    await shot(page, 'driftwood-780x320-tide1-overview');
    await undo(page, true);
    expect(await state(page)).toEqual(beforeRise);
    await shot(page, 'driftwood-780x320-tide-undo');
    await act(page, 'board', true);
    for (const action of ['map-bend', 'map-mooring', 'board', 'map-harbor'])
      await act(page, action, true);
    expect(await state(page)).toMatchObject({ turn: 11, tideLevel: 2, status: 'playing' });
    await wholeCove(page, true);
    await shot(page, 'driftwood-780x320-tide2-overview');
    await page.setViewportSize({ width: 844, height: 390 });
    for (const cove of ['bellwater', 'wide-berth']) {
      await ready(page, cove);
      await wholeCove(page, true);
      await shot(page, `${cove}-844x390-water-overview`);
    }
    expect(errors).toEqual([]);
    expect(files()).toEqual(source);
    save('driftwood-results', {
      errors,
      states:
        'actual UI through turn11, tide Undo/replay; initial Bellwater/Wide water smoke; full rescue covered separately',
      sourceUnchangedDuringCapture: true,
    });
  } finally {
    await context.close();
  }
});
