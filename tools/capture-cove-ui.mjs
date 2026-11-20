import { chromium, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const options = Object.fromEntries(process.argv.slice(2).map((arg) => arg.replace(/^--/, '').split('=')));
const root = resolve('.');
const output = options.output ?? 'reviews/cove-ui-assets/before';
const base = options.base ?? 'http://127.0.0.1:5230';
const digest = (value) => createHash('sha256').update(value).digest('hex');
const walk = (folder) => readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
  const path = resolve(folder, entry.name);
  return entry.isDirectory() ? walk(path) : [path];
});
const paths = ['src', 'data', 'public', 'cove-ui-package/ui'].filter(existsSync).flatMap(walk).filter((path) => !relative(root, path).replaceAll('\\', '/').startsWith('src/dev/')).concat(['index.html', 'package.json', 'package-lock.json', 'vite.config.ts'].map((path) => resolve(path))).sort();
const snapshot = () => Object.fromEntries(paths.map((path) => [relative(root, path).replaceAll('\\', '/'), digest(readFileSync(path))]));
const files = snapshot();
const source = {
  head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  status: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
  runtimeHash: digest(JSON.stringify(files)), files,
  actualSourceDirectory: root,
  sourceNote: options.note ?? 'Current working tree runtime.',
  captureHelperSha256: digest(readFileSync(new URL(import.meta.url))),
  scope: 'Gameplay runtime/data/build and supplied UI sources. Developer catalog/gallery and continuity metadata excluded.',
  command: [process.execPath, ...process.argv.slice(1)], startedAt: new Date().toISOString(),
  method: 'Actual UI controls; state and camera read only. No injected gameplay state.',
};
mkdirSync(`${output}/raw`, { recursive: true });
writeFileSync(`${output}/source.json`, JSON.stringify(source, null, 2));
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const result = { sourceHash: source.runtimeHash, environment: { node: process.version, browser: browser.version(), platform: process.platform, renderer: 'SwiftShader', deviceScaleFactor: 1 }, runs: [] };
const sizes = options.sizes ? options.sizes.split(',').map((size) => size.split('x').map(Number)) : options.size ? [options.size.split('x').map(Number)] : [[844, 390], [780, 320], [390, 844], [360, 740], [1440, 900]];
try {
  for (const [width, height] of sizes) {
    const touch = width < 1000;
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch, reducedMotion: 'no-preference', ...(width === 844 ? { recordVideo: { dir: `${output}/raw`, size: { width, height } } } : {}) });
    const page = await context.newPage();
    const run = { viewport: { width, height }, input: touch ? 'emulated touch' : 'mouse', startedAt: Date.now(), captures: [], errors: [], actions: [], berths: [] };
    result.runs.push(run);
    page.on('pageerror', (error) => run.errors.push(error.message));
    const state = () => page.evaluate(() => window.__LAST_FERRY__.getState());
    const idle = () => expect(page.locator('#seascape')).toHaveAttribute('aria-busy', 'false');
    const activate = async (id) => {
      const locator = page.locator(`#${id}`);
      if (touch) await locator.tap(); else await locator.click();
      run.actions.push({ id, at: Date.now(), state: await state() });
    };
    const whole = async () => {
      if ((await page.locator('#view-toggle').textContent()).includes('Whole cove')) await activate('view-toggle');
    };
    const place = async (id) => {
      const marker = page.locator(`#map-${id}`);
      const visible = await marker.evaluate((e) => {
        const r = e.getBoundingClientRect();
        return !e.closest('.offscreen') && r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight;
      });
      if (!visible) await whole();
      await activate(`map-${id}`);
      await expect(page.locator('#local-context')).toBeVisible();
    };
    const berth = async () => {
      const observation = await page.evaluate(() => {
        const api = window.__LAST_FERRY__;
        return {
          node: api.getState().boatNodeId, heading: api.getJourneyStatus().pose.heading,
          buttons: [...document.querySelectorAll('#dock-actions button')].filter((button) => !button.closest('[hidden]')).map((button) => ({ id: button.id, label: button.textContent, glyph: button.querySelector('.cove-glyph')?.getAttribute('data-icon'), transform: button.querySelector('.cove-glyph') ? getComputedStyle(button.querySelector('.cove-glyph')).transform : null })),
        };
      });
      for (const button of observation.buttons) {
        if (button.glyph) expect(button.transform).toBe('none');
        if (button.id === 'board') expect(button.label).toContain('Board');
        if (button.id === 'unload') expect(button.label).toContain(observation.node === 'harbor' ? 'Bring home' : 'Let ashore');
      }
      run.berths.push(observation);
    };
    const move = async (id) => { await place(id); await activate('sail'); await idle(); await berth(); };
    const transfer = async (id) => {
      if (!(await page.locator(`#${id}`).isVisible())) await place((await state()).boatNodeId);
      await activate(id); await activate('commit'); await idle(); await berth();
    };
    const save = async (label) => {
      await page.waitForTimeout(150);
      const path = `${output}/${width}x${height}-${label}.png`;
      await page.screenshot({ path });
      const observation = await page.evaluate(() => {
        const api = window.__LAST_FERRY__;
        return { state: api.getState(), frame: api.getFrameStatus(), viewport: api.getViewportStatus(), view: api.getViewStatus(), placement: api.getActionPlacement(), heading: api.getJourneyStatus().pose, activeElement: document.activeElement?.id };
      });
      run.captures.push({ label, path, capturedAt: Date.now(), sha256: digest(readFileSync(path)), observation });
      console.log(`${width}x${height} ${label}`);
    };
    try {
      await page.goto(`${base}/?cove=holding-pier`);
      await page.waitForFunction(() => (window.__LAST_FERRY__?.getMetrics().frames ?? 0) > 4);
      await idle();
      await berth();
      await save('play');
      await place('stone');
      await save('selected');
      await activate('close-location');
      await transfer('unload');
      await move('shallows');
      await move('rabbit-pier');
      await activate('board');
      await activate('passenger-rabbit-2');
      await expect(page.locator('#passenger-rabbit-2')).toHaveAttribute('aria-pressed', 'false');
      await save('mixed-subset');
      if (options.preview === 'true') {
        run.outcome = 'planned-preview-only';
        continue;
      }
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
      await transfer('unload');
      expect(await state()).toMatchObject({ turn: 9, status: 'won' });
      await page.waitForTimeout(1500);
      await save('arrival');
      await activate('terminal-undo');
      await idle();
      expect(await state()).toMatchObject({ turn: 8, status: 'playing' });
      await transfer('unload');
      expect(await state()).toMatchObject({ turn: 9, status: 'won' });
      run.outcome = 'passed';
    } catch (error) {
      run.outcome = 'failed';
      run.failure = String(error.stack ?? error);
      await page.screenshot({ path: `${output}/${width}x${height}-failure.png` }).catch(() => {});
      throw error;
    } finally {
      if (page.video()) run.video = await page.video().path();
      await context.close();
      writeFileSync(`${output}/capture-manifest.json`, JSON.stringify(result, null, 2));
    }
  }
  result.finalSourceFiles = snapshot();
  expect(result.finalSourceFiles).toEqual(files);
  result.runtimeUnchanged = true;
} finally {
  result.finishedAt = new Date().toISOString();
  await browser.close();
  writeFileSync(`${output}/capture-manifest.json`, JSON.stringify(result, null, 2));
}
