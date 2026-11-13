import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { initial, preview, type State } from '../../src/game/rules';
import { nodeName, orchardLanding } from '../../src/levels/level';
import { action, coveData } from './optional-tips-support';
import { checkTurn, directory, localView, recordRescue, report, snapshot, transferStart } from './large-cove-support';
import { activate, fullyVisible, idle, keyAct, ready, state, tabTo, undo, wholeCove } from './ui';
import { route, scenes } from './journey-six-support';
import { journeyKey } from './story-support';
import { productionURL } from './evidence';

const candidate = 'orchard-landing';
test.use({ hasTouch: true, isMobile: true, deviceScaleFactor: 1, video: 'off' });

function runtimeSource() {
  const files = ['index.html', 'package.json', 'package-lock.json', 'vite.config.ts'];
  for (const root of ['src', 'data', 'assets/portraits', 'cove-portrait-package/portraits', 'cove-panel-package/material', 'cove-ui-package/ui']) {
    for (const entry of readdirSync(root, { recursive: true, encoding: 'utf8' })) {
      if (/\.(?:ts|css|json|svg|png)$/.test(entry)) files.push(root + '/' + entry.replaceAll('\\', '/'));
    }
  }
  const hash = (data: Buffer | string) => createHash('sha256').update(data).digest('hex');
  const inputs = Object.fromEntries(files.sort().map(path => [path, hash(readFileSync(path))]));
  return { inputs, sha256: hash(JSON.stringify(inputs)) };
}

let capturedSource: string;
test.beforeEach(({ browser }) => {
  const source = runtimeSource();
  capturedSource = source.sha256;
  report(directory('source'), source.sha256, { ...source, head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), os: process.platform, node: process.version, browser: browser.version(), when: new Date().toISOString() });
});
test.afterEach(() => expect(runtimeSource().sha256).toBe(capturedSource));

async function settledFrame(page: Page, dir: string, name: string) {
  await idle(page);
  await expect(page.locator('#transfer-receipt')).toBeHidden();
  await page.evaluate(() => new Promise<void>(done =>
    requestAnimationFrame(() => requestAnimationFrame(() => done()))));
  await snapshot(page, dir, name);
}

async function saveFixture(page: Page, complete: boolean) {
  const original = JSON.stringify({
    version: 1, completed: complete ? route : route.slice(0, 1),
    acknowledgedScenes: complete ? scenes : scenes.slice(0, 2),
    checkpoint: complete ? { kind: 'complete' } : { kind: 'cove', id: 'bellwater' },
  }, null, 2) + '\n';
  await page.addInitScript(({ key, original }) => {
    if (!location.protocol.startsWith('http')) return;
    if (!sessionStorage.getItem('fixture')) {
      localStorage.setItem(key, original);
      sessionStorage.setItem('fixture', 'ready');
    }
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, value) {
      if (this === localStorage && k.startsWith(key)) write.call(sessionStorage, 'journey-write', k);
      return write.call(this, k, value);
    };
  }, { key: journeyKey, original });
  return async () => expect(await page.evaluate(key => [
    localStorage.getItem(key), sessionStorage.getItem('journey-write'), localStorage.getItem('last-ferry-tips'),
  ], journeyKey)).toEqual([original, null, null]);
}

for (const [width, height] of [[390, 844], [780, 320]]) {
  test(`actual Orchard rescue ${width}x${height}`, async ({ page }) => {
    test.setTimeout(600000);
    const portrait = width < height;
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: portrait ? 'no-preference' : 'reduce' });
    const saveIntact = await saveFixture(page, !portrait);
    const { actions } = coveData(candidate);
    const dir = directory(`${width}x${height}`);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await ready(page, candidate);
    expect(await state(page)).toEqual(initial(orchardLanding));
    await settledFrame(page, dir, 'start-play');
    await wholeCove(page, true);
    for (const node of orchardLanding.nodes) {
      const target = page.locator('#map-' + node.id);
      await expect(target).toHaveAccessibleName(new RegExp(nodeName(node.id, orchardLanding)));
      await fullyVisible(page, target.locator('.map-hit'));
    }
    await settledFrame(page, dir, 'start-whole');
    await localView(page);
    await activate(page, 'load-toggle', true);
    await activate(page, 'close-status', true);
    await expect.poll(() => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus().running)).toBe(true);
    const finish = portrait && process.env.LAST_FERRY_ORCHARD_RECORD
      ? await recordRescue(page, dir, 'rescue') : undefined;
    const states: State[] = [];
    const orin = orchardLanding.passengers.find(p => p.species === 'deer')!.id;
    let tideUndo = false;
    let mixed = false;
    try {
      for (const next of actions) {
        const before = await state(page) as State;
        const proposed = preview(before, next, orchardLanding);
        if (proposed.state.status === 'won' && next.type === 'unload') {
          await transferStart(page, next, async () => {
            const choice = page.locator('#passenger-' + orin);
            await expect(choice).toHaveAccessibleName(/Orin.*3 spaces/);
            await expect(choice.locator('img')).toHaveAttribute('data-portrait-state', 'loaded');
            for (const label of await page.locator('.cove-choice-name').all()) {
              const lines = await label.evaluate(el => {
                const range = document.createRange();
                range.selectNodeContents(el);
                return range.getClientRects().length;
              });
              expect(lines, await label.textContent() ?? '').toBe(1);
            }
            if (!portrait) {
              await choice.tap();
              await expect(choice).toHaveAttribute('aria-pressed', 'false');
              expect(await state(page)).toEqual(before);
              await choice.tap();
              await expect(choice).toHaveAttribute('aria-pressed', 'true');
            }
            await snapshot(page, dir, 'delivery-choices');
          });
          await idle(page);
          await checkTurn(page, proposed.state, true);
        } else await action(page, next, orchardLanding);
        states.push(await state(page));
        if (!portrait && !tideUndo && proposed.state.tideLevel > before.tideLevel) {
          await undo(page, true);
          expect(await state(page)).toEqual(before);
          await action(page, next, orchardLanding);
          tideUndo = true;
        }
        if (!mixed && proposed.state.aboard.includes(orin) && proposed.state.aboard.length > 1) {
          await localView(page);
          await settledFrame(page, dir, 'orin-aboard');
          mixed = true;
        }
      }
      expect(states.at(-1)?.status).toBe('won');
      await expect(page.locator('#dialog[open][data-outcome=won]')).toBeVisible();
      await expect(page.locator('#continue-story')).toHaveCount(0);
      await snapshot(page, dir, 'home');
      if (finish) await page.waitForTimeout(1500);
      await saveIntact();
    } finally {
      if (finish) await finish();
    }
    expect(mixed).toBe(true);
    if (!portrait) expect(tideUndo).toBe(true);
    await undo(page, true);
    expect(await state(page)).toEqual(states.at(-2));
    if (!portrait) {
      await action(page, { type: 'unload', passengerIds: [orin] }, orchardLanding);
      expect((await state(page)).delivered).toEqual([orin]);
      await undo(page, true);
      expect(await state(page)).toEqual(states.at(-2));
    }
    await saveIntact();
    expect(errors).toEqual([]);
    report(dir, 'rescued', { viewport: [width, height], states, tideUndo, terminalUndo: true, errors });
  });
}

test('boarding Orin immediately loses the shallow opportunity; Undo recovers the departure', async ({ page }) => {
  await page.setViewportSize({ width: 780, height: 320 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, candidate);
  const original = await state(page);
  await keyAct(page, 'board');
  const first = await state(page);
  expect(first.aboard).toEqual(['orin']);
  await wholeCove(page);
  const reach = orchardLanding.edges.find(edge => edge.current)!;
  const next = reach.nodes.find(node => node !== first.boatNodeId)!;
  await tabTo(page, 'map-' + next);
  await page.keyboard.press('Enter');
  await expect(page.locator('#sail')).toBeDisabled();
  await expect(page.locator('#local-context')).toContainText(/too shallow/i);
  expect(await state(page)).toEqual(first);
  await page.keyboard.press('Escape');
  const prior = [original];
  while ((await state(page)).status === 'playing') {
    prior.push(await state(page));
    expect(prior.length).toBeLessThanOrEqual(orchardLanding.rules.tide.rises.at(-1)!.afterTurn);
    await keyAct(page, 'wait');
  }
  await expect(page.locator('#dialog')).toHaveAttribute('data-outcome', 'lost');
  await expect(page.locator('.ending')).toContainText('Sorrel');
  for (const previous of prior.reverse()) {
    await undo(page, true);
    expect(await state(page)).toEqual(previous);
  }
});

test('production Practice entrance and desktop composition', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const saveIntact = await saveFixture(page, true);
  await page.goto(productionURL);
  await activate(page, 'home-practice');
  const menu = page.locator('[data-practice]');
  await expect(menu).toHaveCount(8);
  await activate(page, 'practice-orchard-landing');
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Orchard Landing');
  await settledFrame(page, directory('desktop'), 'start');
  await keyAct(page, 'wait');
  await expect(page.locator('[data-testid=turn]')).toHaveText('01');
  await keyAct(page, 'undo');
  await expect(page.locator('[data-testid=turn]')).toHaveText('00');
  await saveIntact();
});
