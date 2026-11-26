import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
const { devices, webkit, expect } = await import('@playwright/test');
const url = process.argv[2] ?? 'http://127.0.0.1:5421/';
const out = resolve(process.argv[3] ?? 'reviews/ios-playtest');
mkdirSync(out, { recursive: true });
const browser = await webkit.launch();
const profile = devices['iPhone 13'];
const landscape = devices['iPhone 13 landscape'].viewport;
const context = await browser.newContext(profile);
await context.addInitScript(() => {
  const counts = {};
  for (const type of ['touchstart', 'touchend', 'pointerdown', 'click']) {
    window.addEventListener(
      type,
      (event) => {
        if (!event.isTrusted) return;
        const key = type + (event.pointerType ? ':' + event.pointerType : '');
        counts[key] = (counts[key] ?? 0) + 1;
      },
      { capture: true, passive: true },
    );
  }
  window.__ferryReviewInputs = counts;
});
let page = await context.newPage();
page.setDefaultTimeout(10000);
const report = {
  url,
  engine: browser.version(),
  host: process.platform,
  profile: 'iPhone 13',
  screen: profile.screen,
  portrait: profile.viewport,
  landscape,
  frames: [],
  errors: [],
  consoleErrors: [],
  failedResponses: [],
  turns: [],
};
page.on('pageerror', (e) => report.errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') report.consoleErrors.push(m.text());
});
page.on('response', (r) => {
  if (r.status() >= 400) report.failedResponses.push({ url: r.url(), status: r.status() });
});
const hash = (data) => createHash('sha256').update(data).digest('hex');
const loc = (css) => page.locator(css);
const witness = JSON.parse(
  readFileSync('data/experiments/holding-pier-solution.json', 'utf8'),
).actions;

async function metrics() {
  return page.evaluate(() => {
    const canvas = document.querySelector('#world canvas');
    const gl = canvas?.getContext('webgl2');
    const ext = gl?.getExtension('WEBGL_debug_renderer_info');
    const styles = getComputedStyle(document.documentElement);
    return {
      viewport: [innerWidth, innerHeight],
      visual: [visualViewport.width, visualViewport.height, visualViewport.scale],
      dpr: devicePixelRatio,
      touchPoints: navigator.maxTouchPoints,
      ua: navigator.userAgent,
      safeInsets: ['top', 'right', 'bottom', 'left'].map((side) =>
        styles.getPropertyValue('--safe-' + side).trim(),
      ),
      canvas: canvas ? [canvas.width, canvas.height] : null,
      webgl: gl?.getParameter(gl.VERSION) ?? null,
      renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl?.getParameter(gl.RENDERER),
    };
  });
}
async function control(css) {
  return loc(css).evaluate((el) => {
    const r = el.getBoundingClientRect(),
      x = r.x + r.width / 2,
      y = r.y + r.height / 2;
    return {
      x,
      y,
      width: r.width,
      height: r.height,
      visible:
        r.width > 0 &&
        r.height > 0 &&
        r.left >= -1 &&
        r.top >= -1 &&
        r.right <= innerWidth + 1 &&
        r.bottom <= innerHeight + 1,
      hit: el.contains(document.elementFromPoint(x, y)),
    };
  });
}
async function tap(css) {
  await expect(loc(css)).toBeVisible();
  await loc(css).scrollIntoViewIfNeeded();
  const c = await control(css);
  assert(c.hit && c.visible, css + ' ' + JSON.stringify(c));
  await page.touchscreen.tap(c.x, c.y);
}
async function frame(name, controls = []) {
  const checked = {};
  for (const css of controls) {
    checked[css] = await control(css);
    assert(
      checked[css].hit && checked[css].visible,
      name + ' ' + css + ' ' + JSON.stringify(checked[css]),
    );
  }
  const file = 'webkit-' + name + '.png';
  const bytes = await page.screenshot({ path: join(out, file), scale: 'css' });
  report.frames.push({
    file,
    sha256: hash(bytes),
    viewport: page.viewportSize(),
    controls: checked,
  });
}
async function story() {
  await expect(loc('#story-continue')).toBeVisible();
  for (let n = 0; n < 6 && (await loc('#story-continue').isVisible()); n++) {
    await tap('#story-continue');
    await page.waitForTimeout(300);
  }
  await expect(loc('#story-continue')).toBeHidden();
}
async function rotate(viewport) {
  await page.setViewportSize(viewport);
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const app = getComputedStyle(document.getElementById('app'));
        return [
          parseFloat(app.getPropertyValue('--viewport-width')),
          parseFloat(app.getPropertyValue('--viewport-height')),
        ];
      }),
    )
    .toEqual([viewport.width, viewport.height]);
  // The new backing buffer needs a rendered frame after the resize.
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
}
async function shortLandscapeInsets() {
  const insets = { left: 47, right: 47, top: 0, bottom: 21 };
  const style = await page.addStyleTag({
    content: ':root {--safe-left:47px;--safe-right:47px;--safe-top:0px;--safe-bottom:21px}',
  });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  const controls = {};
  try {
    await expect
      .poll(async () => loc('#dialog').evaluate((el) => el.getBoundingClientRect().right))
      .toBeLessThanOrEqual(landscape.width - insets.right);
    for (const css of [
      '#continue-story',
      '#take-moss-request',
      '#terminal-undo',
      '#arrival-details summary',
    ]) {
      const c = await control(css);
      assert(
        c.hit &&
          c.x - c.width / 2 >= insets.left - 1 &&
          c.x + c.width / 2 <= landscape.width - insets.right + 1 &&
          c.y - c.height / 2 >= insets.top - 1 &&
          c.y + c.height / 2 <= landscape.height - insets.bottom + 1,
        'Synthetic landscape inset check ' + css + ' ' + JSON.stringify(c),
      );
      controls[css] = c;
    }
    report.syntheticLandscape = { insets, controls };
  } finally {
    await style.evaluate((el) => el.remove());
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  }
}
async function turn(turn, cove) {
  await expect(loc('#seascape')).toHaveAttribute('aria-busy', 'false');
  await expect(page.getByTestId('turn')).toHaveText(String(turn).padStart(2, '0'));
  const state = {
    cove,
    turn,
    tide: await page.getByTestId('tide').textContent(),
    place: await loc('[aria-current=location]').getAttribute('id'),
    deck: await loc('#load-toggle').getAttribute('aria-label'),
  };
  report.turns.push(state);
  console.log(cove, turn);
  return state;
}
async function inspect(to) {
  await tap('#load-toggle');
  if (to === 'harbor') await tap('#find-home');
  else {
    if (!(await loc('#place-index').evaluate((el) => el.open))) await tap('#place-index summary');
    await tap('[data-inspect-place="' + to + '"]');
  }
  await expect(loc('#local-context')).toHaveAttribute('data-location', to);
}
async function act(action, next) {
  if (action.type === 'move') {
    await inspect(action.to);
    await tap('#sail');
  } else {
    if (!(await loc('#' + action.type).isVisible())) {
      const current = await loc('[aria-current=location]').getAttribute('id');
      await inspect(current.slice(4));
    }
    await tap('#' + action.type);
    if (await loc('#dialog[open][data-mode=action]').count()) {
      for (const option of await loc('.passenger-options button').all()) {
        const id = await option.getAttribute('id');
        if (
          ((await option.getAttribute('aria-pressed')) === 'true') !==
          action.passengerIds.includes(id.slice('passenger-'.length))
        )
          await tap('#' + id);
      }
      await tap('#commit');
    }
  }
  return turn(next, 'Holding Pier');
}
async function saved() {
  return page.evaluate(() => ({
    journey: JSON.parse(localStorage.getItem('last-ferry.journey.v1') ?? 'null'),
    best:
      JSON.parse(localStorage.getItem('last-ferry.mastery.v1') ?? 'null')?.results[
        'holding-pier@1'
      ] ?? null,
    entries: JSON.parse(localStorage.getItem('last-ferry.harbor-log.v1') ?? '{"entries":[]}')
      .entries,
    motion: localStorage.getItem('last-ferry-motion'),
  }));
}
try {
  await page.goto(url);
  await expect(loc('#home-play')).toHaveText('Play');
  assert.equal(await page.evaluate(() => '__LAST_FERRY__' in window), false);
  const referenced = await page
    .locator('script[src],link[rel=stylesheet]')
    .evaluateAll((nodes) => nodes.map((el) => el.src || el.href));
  report.bundles = {};
  for (const asset of referenced) {
    const response = await context.request.get(asset);
    assert(response.ok(), asset);
    report.bundles[new URL(asset).pathname] = hash(await response.body());
  }
  report.initial = await metrics();
  assert.match(report.initial.webgl, /WebGL 2/);
  await frame('home-portrait', ['#home-play', '#home-options']);
  await tap('#home-sound');
  await tap('#home-options');
  report.available = await page.evaluate(() => ({
    audioContext: typeof AudioContext,
    webkitAudioContext: typeof window.webkitAudioContext,
    elementFullscreen: typeof Element.prototype.requestFullscreen,
    legacyFullscreen: typeof Element.prototype.webkitRequestFullscreen,
  }));
  report.audioStatus = await loc('#audio-status').innerText();
  if (
    report.available.audioContext === 'undefined' &&
    report.available.webkitAudioContext === 'undefined'
  ) {
    await tap('#settings-sound');
    await expect(loc('#audio-status')).toContainText(/waiting|unavailable/i);
    await tap('#settings-mute');
    await expect(loc('#audio-status')).toContainText(/muted/i);
  }
  if (
    report.available.elementFullscreen === 'undefined' &&
    report.available.legacyFullscreen === 'undefined'
  ) {
    await tap('#fullscreen');
    await expect(loc('#fullscreen-feedback')).toContainText(/unavailable|browser/i);
    report.fullscreenFallback = await loc('#fullscreen-feedback').innerText();
  }
  await loc('#motion-preference').selectOption('reduced');
  await expect(loc('#motion-status')).toContainText('Reduced motion is on');
  await tap('#settings-back');
  if (report.fullscreenFallback) await expect(loc('#view-notice')).toBeHidden();
  await tap('#home-play');
  await story();
  await turn(0, 'Holding Pier');
  await act(witness[0], 1);
  await act(witness[1], 2);
  await rotate(landscape);
  await turn(2, 'Holding Pier after rotation');
  const before = await act(witness[2], 3);
  const raised = await act(witness[3], 4);
  assert.notEqual(raised.tide, before.tide);
  await tap('#undo');
  const restored = await turn(3, 'Holding Pier');
  assert.deepEqual(restored, before);
  report.rotatedControls = {};
  for (const css of ['#undo', '#menu', '#load-toggle']) {
    const c = await control(css);
    assert(c.hit && c.visible, css);
    report.rotatedControls[css] = c;
  }
  for (let i = 3; i < witness.length; i++) await act(witness[i], i + 1);
  await expect(loc('#dialog-title')).toHaveText('Rue’s Lantern');
  await expect(loc('.arrival-lantern-count')).toHaveText('2/3 lanterns');
  await frame('rue-landscape', [
    '#continue-story',
    '#take-moss-request',
    '#terminal-undo',
    '#arrival-details summary',
  ]);
  await shortLandscapeInsets();
  await rotate(profile.viewport);
  await expect
    .poll(async () => (await control('#continue-story')).visible, { timeout: 3500 })
    .toBe(true);
  await frame('rue-portrait', [
    '#continue-story',
    '#take-moss-request',
    '#terminal-undo',
    '#arrival-details summary',
  ]);
  await tap('#continue-story');
  await expect(loc('#dialog-title')).toHaveText('Another bell');
  await story();
  await expect(loc('#seascape')).toHaveAttribute('aria-label', 'Bellwater Cove');
  await turn(0, 'Bellwater Cove');
  const accepted = await saved();
  report.trustedInputs = await page.evaluate(() => window.__ferryReviewInputs);
  assert(report.trustedInputs.touchstart > 0 || report.trustedInputs['pointerdown:touch'] > 0);
  assert.deepEqual(accepted.journey.checkpoint, { kind: 'cove', id: 'bellwater' });
  assert.equal(accepted.best.lanterns, 2);
  assert.deepEqual(accepted.entries, ['rue-lantern']);
  assert.equal(accepted.motion, 'reduced');
  await page.reload();
  await expect(loc('#home-play')).toHaveText('Continue');
  assert.deepEqual(await saved(), accepted);
  await tap('#home-practice');
  await expect(loc('#dialog')).toContainText('Rue’s Lantern');
  await expect(loc('#practice-holding-pier')).toBeVisible();
  await tap('#journey-title');
  await tap('#home-options');
  await expect(loc('#motion-preference')).toHaveValue('reduced');
  await tap('#settings-back');
  await tap('#home-play');
  await expect(loc('#seascape')).toHaveAttribute('aria-label', 'Bellwater Cove');
  await turn(0, 'Bellwater Cove after reload');
  await frame('bellwater-portrait', ['#menu', '#load-toggle']);
  report.accepted = accepted;
  const second = await browser.newContext(devices['iPhone 13 landscape']);
  try {
    page = await second.newPage();
    page.on('pageerror', (e) => report.errors.push(e.message));
    await page.goto(url);
    await expect(loc('#home-play')).toHaveText('Play');
    await tap('#home-play');
    await story();
    await turn(0, 'Independent landscape launch');
    await act(witness[0], 1);
    await frame('holding-landscape', ['#undo', '#menu', '#load-toggle']);
    await tap('#map-shallows');
    await expect(loc('#local-context')).toHaveAttribute('data-location', 'shallows');
    await expect(page.getByTestId('turn')).toHaveText('01');
    await tap('#sail');
    await turn(2, 'Independent landscape map tap and sail');
  } finally {
    await second.close();
  }
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.failedResponses, []);
  report.passed = true;
} catch (e) {
  report.failure = String(e);
  report.failureLayout = await page
    .evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return {
        viewport: [innerWidth, innerHeight],
        visual: [
          visualViewport.width,
          visualViewport.height,
          visualViewport.pageLeft,
          visualViewport.pageTop,
        ],
        cssViewport: [
          root.getPropertyValue('--viewport-width'),
          root.getPropertyValue('--viewport-height'),
        ],
        dialog: document.querySelector('#dialog')?.getBoundingClientRect().toJSON(),
        inputs: window.__ferryReviewInputs,
      };
    })
    .catch(() => null);
  await page.screenshot({ path: join(out, 'failure.png') }).catch(() => {});
  throw e;
} finally {
  writeFileSync(join(out, 'webkit.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
