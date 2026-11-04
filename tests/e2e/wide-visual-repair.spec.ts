import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { act, activate, idle, ready, wholeCove, tabTo, state } from './ui';
import { reviewDir } from './evidence';
const witnesses = JSON.parse(readFileSync('data/wide-berth/witnesses.json', 'utf8'));

mkdirSync(reviewDir, { recursive: true });
test.setTimeout(600000);
const save = (name: string, data: unknown) =>
  writeFileSync(`${reviewDir}/${name}.json`, JSON.stringify(data, null, 2));

test('Driftwood current cue leaves the next passage available after rabbit boarding', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ baseURL, viewport: { width: 780, height: 320 }, hasTouch: true });
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);
  await ready(page, 'driftwood-yard');
  for (const id of ['map-yard', 'board', 'map-mooring', 'unload', 'map-bend', 'map-reeds', 'board']) await act(page, id, true);
  await wholeCove(page, true);
  await snapshot(page, '780x320-driftwood-cue');
  const hits = await page.locator('.map-hit').evaluateAll((elements) => elements.map((e) => {
    const r = e.getBoundingClientRect();
    return { owner: e.closest('button')!.id, top: document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('button')?.id };
  }));
  save('driftwood-hit-owners', hits);
  await act(page, 'map-bend', true);
  expect((await state(page)).boatNodeId).toBe('bend');
  await ctx.close();
});
function source(name: string) {
  const prefix = process.env.VISUAL_BASELINE ? '.cache/visual-repair-baseline/' : '';
  const walk = (dir: string): string[] =>
    readdirSync(prefix + dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
    );
  save(name, {
    at: new Date().toISOString(),
    base: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    runtime: prefix ? 'reviewed45ab976 isolated archive' : 'current working tree',
    files: Object.fromEntries(
      [...walk('src'), ...walk('data'), 'package.json', 'package-lock.json'].map((p) => [
        p,
        createHash('sha256')
          .update(readFileSync(prefix + p))
          .digest('hex'),
      ]),
    ),
  });
}
test.beforeAll(async ({ browser, baseURL }) => {
  source('source-before');
  save('environment', {
    browser: browser.version(),
    node: process.version,
    baseURL,
    method:
      'Released UI, actual mouse/natural keyboard/emulated touch; native DPR1 frames, no cropped or developer-camera proof',
  });
});
test.afterAll(() => source('source-after'));
async function transfer(page: Page, type: string, ids: string[]) {
  await activate(page, type, true);
  if (await page.locator('#dialog[open][data-mode="action"]').count()) {
    for (const b of await page.locator('.passenger-options button').all()) {
      const id = (await b.getAttribute('id'))!.slice(10);
      if (((await b.getAttribute('aria-pressed')) === 'true') !== ids.includes(id)) await b.tap();
    }
    await activate(page, 'commit', true);
  }
  await idle(page);
}
async function snapshot(page: Page, name: string) {
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${reviewDir}/${name}.png` });
  save(
    name,
    await page.evaluate(() => {
      const g = (window as any).__LAST_FERRY__;
      const rect = (e: Element) => {
        const r = e.getBoundingClientRect();
        return {
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
          width: r.width,
          height: r.height,
        };
      };
      return {
        state: g.getState(),
        render: g.getRenderStatus(),
        navigation: g.getNavigationStatus(),
        frame: g.getFrameStatus(),
        markers: [...document.querySelectorAll('.map-target')].map((e) => ({
          id: e.id,
          hit: rect(e.querySelector('.map-hit')!),
          symbol: rect(e.querySelector('.map-symbol')!),
          current: e.getAttribute('aria-current'),
        })),
      };
    }),
  );
}
async function views(page: Page, name: string) {
  await page.keyboard.press('Escape');
  if ((await page.locator('#view-toggle').innerText()).includes('Play view'))
    await activate(page, 'view-toggle', true);
  else if (await page.locator('#back-to-boat').isVisible())
    await activate(page, 'back-to-boat', true);
  await page.waitForTimeout(2200);
  await snapshot(page, `${name}-play`);
  if (!process.env.VISUAL_BASELINE) {
    const clipped = await page.evaluate(() => {
      const g = (window as any).__LAST_FERRY__;
      const state = g.getState();
      const frame = g.getFrameStatus();
      const local = [...state.aboard, ...(state.waitingByPier[state.boatNodeId + '-pier'] ?? [])];
      const bounds = frame.view.usable;
      return [
        { id: 'ferry', ...frame.boat },
        ...frame.passengers.filter((p: { id: string }) => local.includes(p.id)),
      ]
        .filter(
          (r) =>
            r.left < bounds.left - 1 ||
            r.right > bounds.right + 1 ||
            r.top < bounds.top - 1 ||
            r.bottom > bounds.bottom + 1,
        )
        .map((r) => r.id);
    });
    expect(clipped, `${name}: actual local bodies must fit Play's unobscured scene`).toEqual([]);
  }
  await wholeCove(page, true);
  await snapshot(page, `${name}-overview`);
}
test('released visual matrix with actual full loads, compact shores and marker focus', async ({
  browser,
  baseURL,
}) => {
  for (const size of [
    { width: 390, height: 844 },
    { width: 780, height: 320 },
  ]) {
    if (process.env.VISUAL_BASELINE_PORTRAIT && size.width !== 390) continue;
    const ctx = await browser.newContext({
      baseURL,
      viewport: size,
      hasTouch: true,
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const prefix = `${size.width}x${size.height}`;
    await ready(page, 'wide-berth');
    await views(page, `${prefix}-empty`);
    const actions = witnesses.witnesses[1].actions;
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      if (action.type === 'move') await act(page, 'map-' + action.to, true);
      else if (action.type === 'wait') await act(page, 'wait', true);
      else await transfer(page, action.type, action.passengerIds!);
      if (i === 0 || i === 1 || i === 9)
        await views(page, prefix + '-' + (i === 0 ? 'full-wide' : i === 1 ? 'full-quay' : 'five-shell'));
      if (i === 11) {
        const ids = [...(await state(page)).aboard];
        await transfer(page, 'unload', ids);
        expect((await state(page)).waitingByPier['high-quay-pier']).toHaveLength(5);
        await views(page, prefix + '-five-ashore');
        await transfer(page, 'board', ids);
      }
    }
    expect((await state(page)).status).toBe('won');
    await snapshot(page, `${prefix}-six-delivered`);
    await ctx.close();
  }
});
test('released overview aspect matrix and natural marker focus', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);
  await ready(page, 'wide-berth');
  for (const [width, height] of [
    [320, 740],
    [844, 390],
    [1440, 900],
    [1782, 1225],
  ]) {
    await page.setViewportSize({ width, height });
    await wholeCove(page, true);
    await snapshot(page, `${width}x${height}-empty-overview`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await views(page, '390x844-marker');
  await tabTo(page, 'map-harbor');
  await snapshot(page, '390x844-marker-focused');
  await page.keyboard.press('Enter');
  expect((await state(page)).turn).toBe(0);
  await snapshot(page, '390x844-marker-selected');
  await page.keyboard.press('Escape');
  if (!process.env.VISUAL_BASELINE) {
    const clear = await page.evaluate(() => {
      const f = (window as any).__LAST_FERRY__.getFrameStatus();
      const canvas = document.querySelector('#seascape canvas')!.getBoundingClientRect();
      const marker = document
        .querySelector('.map-target[aria-current] .map-hit')!
        .getBoundingClientRect();
      const b = f.boat;
      return (
        marker.right < canvas.left + b.left ||
        marker.left > canvas.left + b.right ||
        marker.bottom < canvas.top + b.top ||
        marker.top > canvas.top + b.bottom
      );
    });
    expect(clear).toBe(true);
  }
  await ctx.close();
});

test('occupied ferry marker survives free touch pan, rotation and keyboard cancellation', async ({
  browser,
  baseURL,
}) => {
  const ctx = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);
  await ready(page, 'wide-berth');
  await transfer(page, 'board', ['alder', 'clover', 'poppy', 'wren']);
  const before = await state(page);
  await views(page, '390x844-recovery-loaded');
  await activate(page, 'view-toggle', true);
  const point = await page.evaluate(() => {
    const canvas = document.querySelector('canvas')!;
    const rect = canvas.getBoundingClientRect();
    for (let y = 180; y < innerHeight - 170; y += 25)
      for (let x = 25; x < innerWidth - 90; x += 25)
        if (
          document.elementFromPoint(x, y) === canvas &&
          !(window as any).__LAST_FERRY__.getPickTargetAt(x - rect.left, y - rect.top)
        )
          return { x, y };
    return null;
  });
  expect(point).not.toBeNull();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ ...point!, id: 1 }],
  });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: point!.x + 65, y: point!.y + 45, id: 1 }],
  });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getViewStatus().panned)).toBe(
    true,
  );
  expect(await state(page)).toEqual(before);
  await activate(page, 'back-to-boat', true);
  await page.setViewportSize({ width: 780, height: 320 });
  await snapshot(page, '780x320-recovery-rotated');
  await tabTo(page, 'map-wide-berth');
  await page.keyboard.press('Enter');
  expect(await state(page)).toEqual(before);
  await page.keyboard.press('Escape');
  await expect(page.locator('#map-wide-berth')).toBeFocused();
  await snapshot(page, '780x320-recovery-focused');
  await act(page, 'map-high-quay', true);
  await snapshot(page, '780x320-recovery-opposite-berth');
  await activate(page, 'undo', true);
  await idle(page);
  expect(await state(page)).toEqual(before);
  await cdp.detach();
  await ctx.close();
});

test('short landscape staging keeps the next passage touch target free', async ({
  browser,
  baseURL,
}) => {
  const ctx = await browser.newContext({
    baseURL,
    viewport: { width: 780, height: 320 },
    hasTouch: true,
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);
  await ready(page, 'wide-berth');
  await wholeCove(page, true);
  await transfer(page, 'board', ['alder', 'clover', 'poppy', 'wren']);
  await act(page, 'map-high-quay', true);
  await transfer(page, 'unload', ['alder', 'clover']);
  await snapshot(page, '780x320-staged-controls');
  const target = page.locator('#map-harbor .map-hit');
  const r = await target.boundingBox();
  expect(r!.width).toBeGreaterThanOrEqual(44);
  expect(r!.height).toBeGreaterThanOrEqual(44);
  expect(
    await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('.map-target')?.id, {
      x: r!.x + r!.width / 2,
      y: r!.y + r!.height / 2,
    }),
  ).toBe('map-harbor');
  await act(page, 'map-harbor', true);
  expect(await state(page)).toMatchObject({ boatNodeId: 'harbor', turn: 4, tideLevel: 1 });
  await ctx.close();
});
