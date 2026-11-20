import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { act, idle, ready, tabTo } from './ui';

async function sample(page: Page) {
  return page.evaluate(() => {
    const game = (window as any).__LAST_FERRY__;
    const frame = game.getFrameStatus();
    return {
      revision: frame.view.revision, scale: frame.view.scale, focus: frame.view.focus,
      lens: { x: frame.lanternCore.left, y: frame.lanternCore.top },
      boatX: (frame.boat.left + frame.boat.right) / 2,
      boatY: (frame.boat.top + frame.boat.bottom) / 2,
      turn: game.getState().turn,
    };
  });
}

async function sampleCrossing(page: Page, destination: string) {
  const before = await sample(page);
  const snapshots = [before];
  await page.locator('#map-' + destination + ' .map-hit').tap();
  await expect(page.locator('#local-context')).toBeVisible();
  snapshots.push(await sample(page));
  await page.locator('#sail').tap();
  await expect(page.locator('#seascape')).toHaveAttribute('aria-busy', 'true');
  while (await page.locator('#seascape').getAttribute('aria-busy') === 'true') {
    snapshots.push(await sample(page));
    await page.waitForTimeout(100);
  }
  const docked = await sample(page);
  snapshots.push(docked);
  await page.locator('#undo').tap();
  await idle(page);
  const restored = await sample(page);
  snapshots.push(restored);
  expect(restored.turn).toBe(before.turn);
  expect(docked.turn).toBe(before.turn + 1);
  for (const point of snapshots) {
    expect(point).toMatchObject({ lens: before.lens, scale: before.scale, focus: before.focus, revision: before.revision });
  }
  const distance = Math.hypot(docked.boatX - before.boatX, docked.boatY - before.boatY);
  expect(distance).toBeGreaterThan(40);
  expect(snapshots.some(point => {
    const fromStart = Math.hypot(point.boatX - before.boatX, point.boatY - before.boatY);
    return fromStart > 10 && fromStart < distance - 10;
  })).toBe(true);
  return { destination, snapshots, distance };
}

test('ordinary short and long crossings keep the player’s Harbor landmark fixed', async ({ browser, baseURL }, info) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
  try {
    const page = await context.newPage();
    await ready(page, 'holding-pier');
    const opening = await sample(page);
    await act(page, 'unload', true);
    expect(await sample(page)).toMatchObject({ lens: opening.lens, scale: opening.scale, revision: opening.revision });
    const short = await sampleCrossing(page, 'shallows');
    await page.locator('#view-zoom').tap();
    await page.locator('#zoom-in').tap();
    await page.locator('#view-zoom').tap();
    const water = await page.evaluate(() => {
      const game = (window as any).__LAST_FERRY__, canvas = document.querySelector('#world canvas');
      for (let y = innerHeight / 2; y < innerHeight - 60; y += 14)
        for (let x = 70; x < innerWidth - 80; x += 16)
          if (document.elementFromPoint(x, y) === canvas && !game.getPickTargetAt(x, y)) return { x, y };
      throw new Error('No empty water found');
    });
    const beforePan = await sample(page);
    const input = await context.newCDPSession(page);
    await input.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [water] });
    await input.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: water.x + 30, y: water.y + 16 }] });
    await input.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await input.detach();
    await expect.poll(async () => (await sample(page)).focus).not.toEqual(beforePan.focus);
    const long = await sampleCrossing(page, 'harbor');
    expect(long.distance / long.snapshots[0].scale).toBeGreaterThan(short.distance / short.snapshots[0].scale);
    const chosen = await sample(page);
    for (const action of ['board', 'wait']) {
      await act(page, action, true);
      expect(await sample(page)).toMatchObject({ lens: chosen.lens, revision: chosen.revision, turn: chosen.turn + 1 });
      await act(page, 'undo', true);
      expect(await sample(page)).toMatchObject({ lens: chosen.lens, revision: chosen.revision, turn: chosen.turn });
    }

    await page.locator('#view-toggle').tap();
    await expect(page.locator('#view-toggle')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#back-to-boat').tap();
    await expect(page.locator('#back-to-boat')).toBeHidden();
    const landscape = await sample(page);
    await page.evaluate(() => {
      const state = window as any, game = state.__LAST_FERRY__;
      state.portraitFrames = [];
      function observeFrame() {
        const canvas = document.querySelector<HTMLCanvasElement>('#world canvas')!;
        if (innerWidth === 390 && canvas.width === 390) {
          const view = game.getViewStatus();
          state.portraitFrames.push({ frame: game.getMetrics().frames, revision: view.revision, scale: view.scale });
        }
        if (state.portraitFrames.length < 6) requestAnimationFrame(observeFrame);
      }
      requestAnimationFrame(observeFrame);
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(async () => (await sample(page)).revision).toBeGreaterThan(landscape.revision);
    await page.waitForFunction(() => (window as any).portraitFrames.length === 6);
    const portraitFrames = await page.evaluate(() => (window as any).portraitFrames as { revision: number }[]);
    const portrait = await sample(page);
    await page.waitForTimeout(300);
    expect(await sample(page)).toMatchObject({ lens: portrait.lens, revision: portrait.revision });
    await page.locator('#view-zoom').tap();
    await page.locator('#zoom-in').tap();
    await page.locator('#zoom-in').tap();
    await page.locator('#view-zoom').tap();
    const offscreen = page.locator('.offscreen .map-target').first();
    await expect(offscreen).toBeAttached();
    const id = (await offscreen.getAttribute('id'))!;
    await tabTo(page, id);
    await expect(page.locator('#' + id)).toBeFocused();
    await expect(page.locator('#' + id)).toBeInViewport();
    await expect(page.locator('#stop-' + id.slice(4))).not.toHaveClass(/offscreen/);
    const source = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    const output = { source, browser: browser.version(), build: 'Vite development server', cssViewport: [844, 390],
      short, long, landscape, portrait, portraitFrames, revealedWithTab: id };
    await info.attach('landmark samples', { body: JSON.stringify(output, null, 2), contentType: 'application/json' });
    if (process.env.FERRY_CAMERA_RECEIPT) {
      mkdirSync(process.env.FERRY_CAMERA_RECEIPT, { recursive: true });
      writeFileSync(process.env.FERRY_CAMERA_RECEIPT + '/landmarks.json', JSON.stringify(output, null, 2) + '\n');
    }
    expect(new Set(portraitFrames.map(frame => frame.revision))).toEqual(new Set([portrait.revision]));
  } finally {
    await context.close();
  }
});
