import { chromium, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { measurePanel } from '../tests/e2e/cove-panel-measure.ts';

const options = Object.fromEntries(process.argv.slice(2).map(arg => arg.replace(/^--/, '').split('=')));
const root = resolve(options.source ?? '.');
const output = options.output ?? 'reviews/cove-panel-refinement/after';
const base = options.base ?? 'http://127.0.0.1:5240';
const baseline = options.baseline === 'true';
const digest = value => createHash('sha256').update(value).digest('hex');
const walk = folder => readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(resolve(folder, entry.name)) : [resolve(folder, entry.name)]);
const paths = ['src', 'data', 'public', 'cove-ui-package/ui', 'cove-panel-package/material'].map(p => resolve(root, p)).filter(existsSync).flatMap(walk).filter(p => !relative(root, p).replaceAll('\\', '/').startsWith('src/dev/') && !p.endsWith('.md')).concat(['index.html', 'package.json', 'package-lock.json', 'vite.config.ts'].map(p => resolve(root, p))).sort();
const snapshot = () => Object.fromEntries(paths.map(p => [relative(root, p).replaceAll('\\', '/'), digest(readFileSync(p))]));
const files = snapshot();
const source = { head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), runtimeHash: digest(JSON.stringify(files)), files, actualSourceDirectory: root, note: baseline ? 'Exact Git archive of a432535 runtime/data/build inputs, parent node_modules resolution; capture helper is current tooling.' : 'Current working-tree runtime, source stability checked after capture.', captureHelperSha256: digest(readFileSync(new URL(import.meta.url))), measureHelperSha256: digest(readFileSync(new URL('../tests/e2e/cove-panel-measure.ts', import.meta.url))), command: [process.execPath, ...process.argv.slice(1)], startedAt: new Date().toISOString() };
mkdirSync(`${output}/raw`, { recursive: true });
writeFileSync(`${output}/source.json`, JSON.stringify(source, null, 2));
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const result = { sourceHash: source.runtimeHash, environment: { node: process.version, browser: browser.version(), platform: process.platform, renderer: 'SwiftShader', dpr: 1 }, runs: [] };
const sizes = options.sizes ? options.sizes.split(',').map(s => s.split('x').map(Number)) : [[844,390], [780,320], [390,844], [360,740], [1440,900]];
try {
  for (const [width, height] of sizes) {
    const touch = width < 1000;
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch, reducedMotion: 'no-preference', ...(width === 844 ? { recordVideo: { dir: `${output}/raw`, size: { width, height } } } : {}) });
    const page = await context.newPage();
    const run = { viewport: { width, height }, input: touch ? 'emulated touch; mouse wheel for native vertical scrolling' : 'mouse', startedAt: Date.now(), captures: [], errors: [], actions: [], subsetObservations: [], navigations: [], viteMessages: [] };
    result.runs.push(run);
    page.on('pageerror', error => run.errors.push(error.message));
    page.on('framenavigated', frame => { if (frame === page.mainFrame()) run.navigations.push({ at: Date.now(), url: frame.url() }); });
    page.on('console', message => { if (message.text().includes('[vite]')) run.viteMessages.push({ at: Date.now(), text: message.text() }); });
    const state = () => page.evaluate(() => window.__LAST_FERRY__.getState());
    const idle = () => expect(page.locator('#seascape')).toHaveAttribute('aria-busy', 'false');
    const activate = async id => { const e = page.locator(`#${id}`); if (touch) await e.tap(); else await e.click(); run.actions.push({ id, at: Date.now(), state: await state() }); };
    const whole = async () => { if ((await page.locator('#view-toggle').textContent()).includes('Whole cove')) await activate('view-toggle'); };
    const place = async id => {
      const visible = await page.locator(`#map-${id}`).evaluate(e => { const r = e.getBoundingClientRect(); return !e.closest('.offscreen') && r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; });
      if (!visible) await whole();
      await activate(`map-${id}`);
      await expect(page.locator('#local-context')).toBeVisible();
    };
    const move = async id => { await place(id); await activate('sail'); await idle(); };
    const transfer = async id => { await activate(id); await activate('commit'); await idle(); };
    const boundary = () => page.evaluate(() => { const a = window.__LAST_FERRY__; return { state: a.getState(), history: a.getRenderStatus().historyLength, view: a.getViewStatus(), homecoming: a.getHomecomingStatus(), audio: { victoryTarget: a.getAudioStatus().victoryTarget, victoryActive: a.getAudioStatus().victoryActive, arrivalCount: a.getAudioStatus().arrivalCount }, hud: document.getElementById('readout').textContent }; });
    const scrollPreview = async () => {
      if (await page.locator('#preview').evaluate(e => e.scrollHeight > e.clientHeight + 1)) {
        const box = await page.locator('#preview').boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.wheel(0, 600);
        await expect.poll(() => page.locator('#preview').evaluate(e => e.scrollTop)).toBeGreaterThan(0);
      }
    };
    const save = async (label, fit = false) => {
      await page.waitForTimeout(150);
      const path = `${output}/${width}x${height}-${label}.png`;
      await page.screenshot({ path });
      const observation = await page.evaluate(() => { const a = window.__LAST_FERRY__; return { state: a.getState(), frame: a.getFrameStatus(), view: a.getViewStatus(), viewport: a.getViewportStatus(), placement: a.getActionPlacement(), heading: a.getJourneyStatus().pose, hudRect: document.querySelector('.hud').getBoundingClientRect().toJSON() }; });
      const measurement = fit ? await page.evaluate(measurePanel) : undefined;
      run.captures.push({ label, path, sha256: digest(readFileSync(path)), observation, measurement });
      console.log(`${width}x${height} ${label}${measurement ? ': ' + measurement.failures.length + ' fit failures' : ''}`);
      if (measurement && !baseline) expect(measurement.failures).toEqual([]);
      return measurement;
    };
    try {
      await page.goto(`${base}/?cove=holding-pier`);
      await page.waitForFunction(() => (window.__LAST_FERRY__?.getMetrics().frames ?? 0) > 4);
      await page.evaluate(() => {
        window.__panelInput = [];
        for (const type of ['pointerdown', 'pointerup', 'click']) document.addEventListener(type, event => {
          window.__panelInput.push({ type, at: performance.now(), target: event.target?.closest?.('button')?.id, trusted: event.isTrusted, turn: window.__LAST_FERRY__?.getState().turn });
          if (window.__panelInput.length > 100) window.__panelInput.shift();
        }, true);
      });
      await idle();
      await save('play');
      await activate('menu');
      await save('menu');
      await activate('settings');
      await save('settings');
      await activate('settings-back');
      await activate('cancel');
      await transfer('unload');
      await move('shallows');
      await move('rabbit-pier');
      await activate('board');
      await activate('passenger-rabbit-2');
      await save('losing-subset', true);
      await scrollPreview();
      await save('warning-scrolled');
      await activate('passenger-rabbit-2');
      await activate('commit');
      await idle();
      expect(await state()).toMatchObject({ turn: 4, tideLevel: 1, status: 'playing' });
      await activate('undo');
      await idle();
      expect(await state()).toMatchObject({ turn: 3, tideLevel: 0, status: 'playing' });
      await transfer('board');
      await move('shallows');
      await move('stone');
      await transfer('board');
      await move('harbor');
      const before = await boundary();
      expect(before.state).toMatchObject({ turn: 8, tideLevel: 2, status: 'playing', aboard: ['rabbit-1', 'rabbit-2', 'sheep-1'] });
      await activate('unload');
      await save('harbor-preview', true);
      if (!baseline) {
        await expect(page.locator('#preview .consequence')).toHaveText('Everyone will be safely home at Harbor.');
        await expect(page.locator('#preview .preview-result')).toContainText('After this action:');
        await scrollPreview();
        await save('harbor-consequence');
        const fixed = await page.locator('#commit').boundingBox();
        for (const id of ['rabbit-2', 'sheep-1', 'rabbit-1', 'rabbit-1', 'sheep-1', 'rabbit-2']) {
          await activate(`passenger-${id}`);
          const fit = await page.evaluate(measurePanel);
          expect(fit.failures).toEqual([]);
          const commit = await page.locator('#commit').boundingBox();
          expect(Math.abs(commit.x - fixed.x)).toBeLessThanOrEqual(1);
          expect(Math.abs(commit.y - fixed.y)).toBeLessThanOrEqual(1);
          const now = await boundary();
          expect(now.state).toEqual(before.state);
          expect(now.history).toBe(before.history);
          expect(now.hud).toBe(before.hud);
          expect(now.view).toEqual(before.view);
          expect(now.homecoming.active).toBe(false);
          expect(now.homecoming.celebrations).toBe(0);
          expect(now.homecoming.camera.factor).toBe(1);
          expect(now.audio.victoryTarget).toBe(1);
          const chosen = await page.locator('.passenger-options button[aria-pressed="true"]').count();
          expect(await page.locator('#commit').isDisabled()).toBe(chosen === 0);
          run.subsetObservations.push({ chosen, fit, boundary: now, commit });
        }
        await activate('cancel');
        expect((await boundary()).state).toEqual(before.state);
        expect((await boundary()).history).toBe(before.history);
        await activate('unload');
      }
      await activate('commit');
      await idle();
      expect(await state()).toMatchObject({ turn: 9, status: 'won' });
      await page.waitForTimeout(1500);
      await save('arrival');
      await activate('terminal-undo');
      await idle();
      expect(await state()).toMatchObject({ turn: 8, status: 'playing', delivered: [] });
      await transfer('unload');
      expect(await state()).toMatchObject({ turn: 9, status: 'won' });
      run.outcome = 'passed';
      expect(run.errors).toEqual([]);
    } catch(error) {
      run.outcome = 'failed'; run.failure = String(error.stack ?? error);
      await page.screenshot({ path: `${output}/${width}x${height}-failure.png` }).catch(() => {});
      throw error;
    } finally {
      run.inputTrace = await page.evaluate(() => window.__panelInput).catch(() => null);
      run.finalBoundary = await boundary().catch(() => null);
      if (page.video()) run.video = await page.video().path();
      await context.close();
      writeFileSync(`${output}/capture-manifest.json`, JSON.stringify(result, null, 2));
    }
  }
  expect(snapshot()).toEqual(files);
  result.runtimeUnchanged = true;
} finally {
  result.finishedAt = new Date().toISOString();
  await browser.close();
  writeFileSync(`${output}/capture-manifest.json`, JSON.stringify(result, null, 2));
}
