import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { activate, idle, ready, restart, undo } from '../../tests/e2e/ui';
import { runtimeSource } from '../../tests/e2e/three-lanterns-support';

const folder = 'reviews/lantern-reach/world';
const pose = (page: Page) => page.evaluate(() => (window as any).__LAST_FERRY__.getEnvironmentStatus().swingBridge);

test('bridge swing, finite endpoints, Undo, reduced motion, restart and visibility settlement', async ({ page, browser }) => {
  mkdirSync(folder, { recursive: true });
  await ready(page, 'lantern-reach');
  const closed = await pose(page);
  await page.screenshot({ path: folder + '/signal-closed.png' });
  expect(closed.angle).toBeCloseTo(0, 8);
  const open = async () => {
    await activate(page, 'open-bridge', true);
    await activate(page, 'commit', true);
  };
  await page.evaluate(() => {
    const values: { t: number; angle: number }[] = [];
    (window as any).__observation = values;
    function sample(t: number) {
      const s = (window as any).__LAST_FERRY__.getEnvironmentStatus().swingBridge;
      values.push({ t, angle: s.angle });
      if (s.progress < 1 && values.length < 600) requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  await open();
  await page.waitForFunction(() => (window as any).__LAST_FERRY__.getEnvironmentStatus().swingBridge.angle < -0.5);
  const during = await pose(page);
  expect(during.progress).toBeLessThan(1);
  await page.screenshot({ path: folder + '/signal-swinging.png' });
  await idle(page);
  const opened = await pose(page);
  await page.screenshot({ path: folder + '/signal-open.png' });
  expect(opened.angle).toBeCloseTo(-Math.PI / 2, 8);
  expect(opened.pivot).toEqual(closed.pivot);
  const samples = await page.evaluate(() => (window as any).__observation as {t: number; angle: number}[]);
  expect(samples.some(s => s.angle < -0.01 && s.angle > -Math.PI / 2 + 0.01)).toBe(true);
  await undo(page, true);
  expect(await pose(page)).toEqual(closed);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open();
  await idle(page);
  expect(await pose(page)).toEqual(opened);
  await restart(page, true);
  expect(await pose(page)).toEqual(closed);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await open();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    delete (document as {hidden?: boolean}).hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await idle(page);
  expect(await pose(page)).toEqual(opened);
  const transition = await page.evaluate(() => (window as any).__LAST_FERRY__.getTransitionStatus().last);
  expect(transition.reason).toBe('visibility');
  const source = runtimeSource();
  writeFileSync(folder + '/observations.json', JSON.stringify({
    head: source.head, runtimeSha256: source.sha256, browser: browser.version(), viewport: page.viewportSize(),
    closed, during, opened, samples: samples.filter(s => s.angle !== 0),
    visibility: transition, restoredByUndo: true, restoredByRestart: true, reducedMotionOpened: true,
  }, null, 2) + '\n');
});
