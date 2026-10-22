import { test, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import {
  state as api,
  rendered as render,
  active,
  idle,
  ready,
  tabTo,
  keyAct as keyAction,
  act,
  fullyVisible,
} from './ui';

for (const [name, width, height] of [
  ['desktop', 1440, 900],
  ['phone', 844, 390],
] as const) {
  test(`natural keyboard ${name}: Tab, Shift+Tab, Enter, Escape, tide undo and terminal Undo`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await ready(page);
    await tabTo(page, 'map-sheep-pier');
    await tabTo(page, 'map-harbor', true);
    await expect(page.locator('#map-harbor')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#local-heading')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#map-harbor')).toBeFocused();
    expect((await api(page)).turn).toBe(0);
    await keyAction(page, 'map-sheep-pier');
    expect(await active(page)).toMatch(/^(local-heading|board|unload|wait|map-)/);
    await fullyVisible(page, page.locator('#board'));
    await tabTo(page, 'board');
    await page.keyboard.press('Enter');
    await expect(page.locator('#cancel')).toBeFocused();
    const frame = await page.evaluate(() => (window as any).__LAST_FERRY__.getFrameStatus());
    if (name === 'phone') {
      expect(frame.lighthouse.top).toBeGreaterThanOrEqual(8);
      expect(frame.lighthouse.bottom).toBeLessThan(frame.canvas.height - 8);
      for (const node of frame.nodes) {
        expect(node.x).toBeGreaterThan(0);
        expect(node.x).toBeLessThan(frame.canvas.width);
        expect(node.y).toBeGreaterThan(0);
        expect(node.y).toBeLessThan(frame.canvas.height);
      }
      for (const passenger of frame.passengers) expect(passenger.height).toBeGreaterThan(22);
    }
    writeFileSync(`${reviewDir}/${name}-frame.json`, JSON.stringify(frame, null, 2));
    await page.screenshot({ path: `${reviewDir}/${name}-loading.png` });
    await tabTo(page, 'commit');
    await page.keyboard.press('Enter');
    await idle(page);
    await page.screenshot({ path: `${reviewDir}/${name}-loaded.png` });
    await keyAction(page, 'wait');
    await keyAction(page, 'wait');
    expect(await api(page)).toMatchObject({ turn: 4, tideLevel: 1 });
    await tabTo(page, 'undo', true);
    await page.keyboard.press('Enter');
    expect(await api(page)).toMatchObject({ turn: 3, tideLevel: 0 });
    for (const id of ['wait', 'map-cut', 'map-harbor', 'unload']) await keyAction(page, id);
    expect(await api(page)).toMatchObject({ turn: 7, status: 'won' });
    await expect(page.locator('#terminal-undo')).toBeFocused();
    await page.screenshot({ path: `${reviewDir}/${name}-keyboard-success.png` });
    await page.keyboard.press('Enter');
    expect(await api(page)).toMatchObject({ status: 'playing', turn: 6, delivered: [] });
    expect(await active(page)).toMatch(/^(local-heading|board|unload|wait|undo|map-)/);
    await keyAction(page, 'unload');
    expect((await api(page)).status).toBe('won');
  });
}
for (const reduced of [false, true])
  test(`deck attachment ${reduced ? 'reduced motion' : 'normal'}: boarding, Moss-only unload, bob, tide and Undo`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
    await ready(page);
    await act(page, 'map-sheep-pier');
    const initial = await render(page),
      feet = new Map(
        initial.passengers
          .filter((p: any) => p.id.startsWith('rabbit'))
          .map((p: any) => [p.id, p.deckLocalFoot]),
      );
    feet.set('sheep-1', [0, 0.26, 0.69]);
    await page.evaluate(() => {
      const w = window as any;
      w.__deckSamples = [];
      w.__sampleDeck = true;
      const sample = () => {
        if (!w.__sampleDeck) return;
        w.__deckSamples.push({ ...w.__LAST_FERRY__.getRenderStatus(), phase: w.__deckPhase });
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await act(page, 'board');
    await page.locator('#unload').click();
    await page.locator('#passenger-rabbit-1').click();
    await page.locator('#passenger-rabbit-2').click();
    await expect(page.locator('#dialog')).toContainText('Let Moss ashore');
    await page.locator('#commit').click();
    await idle(page);
    expect((await api(page)).aboard).toEqual(['rabbit-1', 'rabbit-2']);
    await page.evaluate(() => {
      (window as any).__deckPhase = 'idle-after-unload';
    });
    await page.waitForTimeout(650);
    await page.evaluate(() => {
      (window as any).__deckPhase = 'actions';
    });
    await page.locator('#undo').click();
    expect((await api(page)).aboard).toContain('sheep-1');
    await act(page, 'wait');
    await act(page, 'wait');
    expect((await api(page)).tideLevel).toBe(1);
    await page.locator('#undo').click();
    expect((await api(page)).tideLevel).toBe(0);
    const samples = await page.evaluate(() => {
      const w = window as any;
      w.__sampleDeck = false;
      return w.__deckSamples;
    });
    expect(samples.length).toBeGreaterThan(5);
    for (const sample of samples)
      for (const passenger of sample.passengers.filter(
        (p: any) => p.id.startsWith('rabbit') || p.parent?.startsWith('deck-anchor-'),
      )) {
        expect(passenger.parent).toBe(`deck-anchor-${passenger.id}`);
        for (let axis = 0; axis < 3; axis++)
          expect(passenger.deckLocalFoot[axis]).toBeCloseTo(
            (feet.get(passenger.id) as number[])[axis],
            8,
          );
      }
    const hullYs = samples.map((s: any) => s.hullY);
    expect(Math.max(...hullYs) - Math.min(...hullYs)).toBeGreaterThan(0.05);
    if (!reduced) expect(samples.filter((s: any) => s.pendingAnimation).length).toBeGreaterThan(2);
    const idleSamples = samples.filter((s: any) => s.phase === 'idle-after-unload');
    expect(idleSamples.length).toBeGreaterThan(1);
    const idleHullRange =
      Math.max(...idleSamples.map((s: any) => s.hullY)) -
      Math.min(...idleSamples.map((s: any) => s.hullY));
    if (reduced) expect(idleHullRange).toBeLessThan(1e-10);
    else expect(idleHullRange).toBeGreaterThan(0.0005);
    writeFileSync(
      `${reviewDir}/deck-${reduced ? 'reduced' : 'normal'}-samples.json`,
      JSON.stringify(
        {
          samples: samples.length,
          maxFootDrift: Math.max(
            ...samples.flatMap((s: any) =>
              s.passengers
                .filter((p: any) => p.parent?.startsWith('deck-anchor-'))
                .flatMap((p: any) =>
                  p.deckLocalFoot.map((v: number, i: number) =>
                    Math.abs(v - (feet.get(p.id) as number[])[i]),
                  ),
                ),
            ),
          ),
          hullRange: [Math.min(...hullYs), Math.max(...hullYs)],
          idleSamples: idleSamples.length,
          idleHullRange,
        },
        null,
        2,
      ),
    );
  });
test.afterEach(async ({ page, context }, info) => {
  if (info.title.startsWith('deck attachment normal')) {
    const video = page.video();
    await context.close();
    await video?.saveAs(`${reviewDir}/raw/boarding-unloading.webm`);
  }
});
