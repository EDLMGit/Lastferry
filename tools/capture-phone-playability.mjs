import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((v) => v.replace(/^--/, '').split('=')));
const phase = args.phase ?? 'before';
const sourceRoot = resolve(args.root ?? '.');
const output = resolve(args.output ?? `reviews/phone-playability/${phase}`);
const base = args.base ?? 'http://127.0.0.1:5210';
const digest = (value) => createHash('sha256').update(value).digest('hex');
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(resolve(dir, e.name)) : [resolve(dir, e.name)],
  );
const files = [
  ...walk(resolve(sourceRoot, 'src')),
  ...walk(resolve(sourceRoot, 'data')),
  ...['index.html', 'package.json', 'package-lock.json', 'vite.config.ts'].map((p) =>
    resolve(sourceRoot, p),
  ),
].sort();
const snapshot = () =>
  Object.fromEntries(
    files.map((p) => [relative(sourceRoot, p).replaceAll('\\', '/'), digest(readFileSync(p))]),
  );
const source = snapshot();
mkdirSync(resolve(output, 'raw'), { recursive: true });
writeFileSync(resolve(output, 'raw', 'capture-helper.mjs'), readFileSync(new URL(import.meta.url)));
const sourceIdentity = {
  recordedAt: new Date().toISOString(),
  acceptedGame: '80545cbabb0496b215cd56f25cfc0113b056da67',
  headAtCapture: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  baselineArchive:
    phase === 'before'
      ? 'a93bed3897586fbfa66ed06e54ee2d9685c87be0 (metadata-only successor to accepted game)'
      : null,
  sourceRoot,
  files: source,
  sourceHash: digest(JSON.stringify(source)),
  helperHash: digest(readFileSync(new URL(import.meta.url))),
  command: [process.execPath, ...process.argv.slice(1)],
};
writeFileSync(resolve(output, 'source.json'), JSON.stringify(sourceIdentity, null, 2));
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const result = {
  phase,
  sourceHash: sourceIdentity.sourceHash,
  browser: browser.version(),
  node: process.version,
  renderer: 'Chromium SwiftShader software WebGL2',
  input:
    'Touch-enabled mobile context, DPR1 native PNGs. Ordinary baseline views use no gameplay input; preview/sequence/Bellwater sections record their actual touchscreen input separately.',
  captures: [],
  errors: [],
};
try {
  const sizes =
    args.sizes === 'none'
      ? []
      : (args.sizes ?? '844x390,780x390,780x320,390x844,360x740')
          .split(',')
          .map((value) => value.split('x').map(Number));
  for (const [width, height] of sizes) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    page.on('pageerror', (e) =>
      result.errors.push({ viewport: [width, height], message: e.message }),
    );
    await page.goto(`${base}/?cove=holding-pier`);
    await page.waitForFunction(() => (window.__LAST_FERRY__?.getMetrics().frames ?? 0) > 5);
    await page.waitForTimeout(350);
    const observation = await page.evaluate(() => {
      const api = window.__LAST_FERRY__;
      const rect = (e) => {
        if (!e) return null;
        const r = e.getBoundingClientRect();
        return {
          left: r.left,
          top: r.top,
          right: r.right,
          bottom: r.bottom,
          width: r.width,
          height: r.height,
        };
      };
      const frame = api.getFrameStatus(),
        boat = frame.boat;
      return {
        state: api.getState(),
        render: api.getRenderStatus(),
        frame,
        ferryDimensions: { width: boat.right - boat.left, height: boat.bottom - boat.top },
        visibleViewport: {
          width: innerWidth,
          height: innerHeight,
          visual: visualViewport
            ? {
                width: visualViewport.width,
                height: visualViewport.height,
                offsetLeft: visualViewport.offsetLeft,
                offsetTop: visualViewport.offsetTop,
              }
            : null,
        },
        document: {
          scrollWidth: document.documentElement.scrollWidth,
          scrollHeight: document.documentElement.scrollHeight,
        },
        canvas: rect(document.querySelector('canvas')),
        hud: rect(document.querySelector('.hud')),
        controls: [...document.querySelectorAll('.hud button,.map-target')].map((e) => ({
          id: e.id,
          rect: rect(e),
          fontSize: getComputedStyle(e).fontSize,
        })),
      };
    });
    const path = resolve(output, `holding-${width}x${height}-play.png`);
    await page.screenshot({ path });
    result.captures.push({
      viewport: [width, height],
      dpr: 1,
      path: relative(process.cwd(), path).replaceAll('\\', '/'),
      sha256: digest(readFileSync(path)),
      ...observation,
    });
    if (args.previews === 'true') {
      const initiating = await page.locator('#unload').boundingBox();
      await page.locator('#unload').tap();
      await page.waitForTimeout(200);
      const dialog = await page.locator('#dialog').boundingBox();
      const previewPath = resolve(output, `holding-${width}x${height}-unload-preview.png`);
      await page.screenshot({ path: previewPath });
      result.captures.push({
        viewport: [width, height],
        dpr: 1,
        path: relative(process.cwd(), previewPath).replaceAll('\\', '/'),
        sha256: digest(readFileSync(previewPath)),
        kind: 'unload preview',
        initiating,
        dialog,
        state: await page.evaluate(() => window.__LAST_FERRY__.getState()),
      });
    }
    await context.close();
  }
  if (args.sequence === 'true') {
    const width = 844,
      height = 390;
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
      reducedMotion: 'no-preference',
      recordVideo: { dir: resolve(output, 'raw'), size: { width, height } },
    });
    const page = await context.newPage(),
      stages = [];
    result.sequence = {
      startedAt: new Date().toISOString(),
      viewport: [width, height],
      stages,
      complete: false,
    };
    const video = page.video();
    page.on('pageerror', (error) => result.errors.push({ sequence: true, message: error.message }));
    const idle = () =>
      page.waitForFunction(
        () => document.querySelector('#seascape')?.getAttribute('aria-busy') === 'false',
      );
    const press = async (id) => {
      await page.locator(`#${id}`).tap();
      await page.waitForTimeout(200);
    };
    const save = async (label, shot = false) => {
      const value = await page.evaluate((label) => {
        const a = window.__LAST_FERRY__;
        return {
          label,
          at: performance.now(),
          state: a.getState(),
          view: a.getViewStatus(),
          viewport: a.getViewportStatus(),
          action: a.getActionPlacement(),
          boat: a.getFrameStatus().boat,
          history: a.getRenderStatus().historyLength,
          heading: a.getJourneyStatus().pose.heading,
          fullscreen: {
            element: document.fullscreenElement?.id ?? null,
            dialogInside: !!document.fullscreenElement?.contains(document.querySelector('#dialog')),
          },
        };
      }, label);
      stages.push(value);
      if (shot && args.sequenceShots !== 'false')
        await page.screenshot({ path: resolve(output, `sequence-${label}.png`) });
    };
    const whole = async () => {
      if ((await page.locator('#view-toggle').textContent()).includes('Whole cove'))
        await press('view-toggle');
    };
    const move = async (id) => {
      const fits = await page.locator(`#map-${id}`).evaluate((e) => {
        const r = e.getBoundingClientRect();
        return (
          !e.closest('.offscreen') &&
          getComputedStyle(e).opacity !== '0' &&
          r.left >= 0 &&
          r.top >= 0 &&
          r.right <= innerWidth &&
          r.bottom <= innerHeight
        );
      });
      if (!fits) await whole();
      await press(`map-${id}`);
      await press('sail');
      await idle();
    };
    await page.goto(`${base}/?cove=holding-pier`);
    await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 5);
    await save('start');
    await press('unload');
    await press('passenger-sheep-1');
    await press('passenger-sheep-1');
    await save('nearby-preview', true);
    await press('cancel');
    await whole();
    await save('whole-cove', true);
    await press('back-to-boat');
    const water = await page.evaluate(() => {
      const c = document.querySelector('canvas'),
        r = c.getBoundingClientRect(),
        a = window.__LAST_FERRY__;
      for (let y = 90; y < innerHeight - 80; y += 20)
        for (let x = 30; x < innerWidth - 30; x += 20)
          if (document.elementFromPoint(x, y) === c && !a.getPickDetailAt(x - r.left, y - r.top))
            return { x, y };
      return null;
    });
    if (!water) throw new Error('No exposed water for natural pan');
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: water.x, y: water.y, id: 1 }],
    });
    for (let i = 1; i <= 8; i++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: water.x + (70 * i) / 8, y: water.y + (45 * i) / 8, id: 1 }],
      });
      await page.waitForTimeout(30);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await save('panned', true);
    if ((await page.evaluate(() => window.__LAST_FERRY__.getState().turn)) !== 0)
      throw new Error('Free camera operation spent an action');
    await press('back-to-boat');
    if (args.sequenceFullscreen !== 'false') {
      await press('menu');
      await press('fullscreen');
      await save('fullscreen-result', true);
      await press('cancel');
    }
    await press('unload');
    await press('commit');
    await idle();
    await move('shallows');
    await save('after-crossing', true);
    await whole();
    await move('rabbit-pier');
    if ((await page.evaluate(() => window.__LAST_FERRY__.getViewStatus().mode)) !== 'overview')
      throw new Error('Confirmed journey overrode the chosen Whole cove view');
    await press('board');
    await press('passenger-rabbit-2');
    await save('rabbit-subset', true);
    if (await page.evaluate(() => !!document.fullscreenElement)) {
      await page.evaluate(() => document.exitFullscreen());
      await page.waitForTimeout(200);
      await save('fullscreen-exit-preview');
    }
    if ((await page.locator('#passenger-rabbit-2').getAttribute('aria-pressed')) !== 'false')
      throw new Error('Fullscreen exit changed the passenger subset');
    if (args.sequenceRotation !== 'false') {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(350);
      await save('rotated-portrait', true);
      await page.setViewportSize({ width: 844, height: 390 });
      await page.waitForTimeout(350);
      await save('rotated-landscape', true);
    }
    await press('passenger-rabbit-2');
    await press('commit');
    await idle();
    await save('tide');
    await press('undo');
    await idle();
    await save('undo');
    if (await page.evaluate(() => !!document.fullscreenElement))
      await page.evaluate(() => document.exitFullscreen());
    await context.close();
    const named = resolve(output, 'raw/phone-uninterrupted.webm');
    await video.saveAs(named);
    result.sequence = {
      complete: true,
      viewport: [width, height],
      dpr: 1,
      input: 'Actual touchscreen tap/CDP touch drag; no state injection or time changes',
      recording:
        args.sequenceRotation === 'false' && args.sequenceFullscreen === 'false'
          ? 'Uninterrupted full-interface silent Playwright original, native844×390 throughout. Fullscreen and rotation have separate actual lifecycle evidence.'
          : 'Uninterrupted full-interface silent Playwright original. Fixed844×390 video surface; fullscreen/portrait segments are fitted into that surface. Native stills and a separate ordinary-browser recording provide the readable comparison.',
      video: relative(process.cwd(), named).replaceAll('\\', '/'),
      sha256: digest(readFileSync(named)),
      stages,
    };
  }
  if (args.bellwater === 'true') {
    const context = await browser.newContext({
      viewport: { width: 844, height: 390 },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage(),
      stages = [];
    result.bellwater = {
      viewport: [844, 390],
      input:
        'Actual touchscreen taps through UI; a separate instrumented course probe, not the uninterrupted natural recording',
      stages,
      complete: false,
    };
    page.on('pageerror', (error) =>
      result.errors.push({ bellwater: true, message: error.message }),
    );
    const idle = () =>
      page.waitForFunction(
        () => document.querySelector('#seascape')?.getAttribute('aria-busy') === 'false',
      );
    const press = (id) => page.locator(`#${id}`).tap();
    const save = async (label, shot = false, check = false) => {
      const data = await page.evaluate((label) => {
        const a = window.__LAST_FERRY__,
          f = a.getFrameStatus(),
          s = a.getState();
        return {
          label,
          at: performance.now(),
          state: s,
          view: a.getViewStatus(),
          boat: f.boat,
          passengers: f.passengers.filter((p) => s.aboard.includes(p.id)),
          journey: a.getJourneyStatus().active,
          metrics: a.getMetrics(),
          camera: f.camera,
          renderedMarkerAnchors: a
            .getNavigationStatus()
            .markers.map((m) => ({ id: m.id, worldPosition: m.worldPosition })),
          selection: a.getSelectionStatus(),
          controls: [...document.querySelectorAll('.map-target,#view-toggle')].map((e) => ({
            id: e.id,
            text: e.textContent,
            offscreen: !!e.closest('.offscreen'),
            rect: e.getBoundingClientRect().toJSON(),
          })),
        };
      }, label);
      stages.push(data);
      if (check)
        for (const subject of [data.boat, ...data.passengers]) {
          const b = data.view.usable;
          if (
            subject.left < b.left - 1 ||
            subject.right > b.right + 1 ||
            subject.top < b.top - 1 ||
            subject.bottom > b.bottom + 1
          )
            throw new Error(
              `Bellwater active subject outside usable Play frame at ${label}: ${JSON.stringify({ subject, b })}`,
            );
        }
      if (shot) await page.screenshot({ path: resolve(output, `bellwater-${label}.png`) });
    };
    const whole = async () => {
      if ((await page.evaluate(() => window.__LAST_FERRY__.getViewStatus().mode)) !== 'overview')
        await press('view-toggle');
      await page.waitForFunction(() => window.__LAST_FERRY__.getViewStatus().mode === 'overview');
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
    };
    const move = async (id, probe = false) => {
      if (probe) await whole();
      const visible = await page.locator(`#map-${id}`).evaluate((e) => {
        const r = e.getBoundingClientRect();
        return (
          !e.closest('.offscreen') &&
          r.left >= 0 &&
          r.top >= 0 &&
          r.right <= innerWidth &&
          r.bottom <= innerHeight
        );
      });
      if (!visible) await whole();
      if (probe) await save(`before-target-${id}`);
      await press(`map-${id}`);
      if (probe && id === 'west-buoy') await save(`inspect-${stages.length}`, true);
      await press('sail');
      if (probe) {
        if (await page.locator('#back-to-boat').isVisible()) await press('back-to-boat');
        await page.waitForFunction(
          () => window.__LAST_FERRY__.getJourneyStatus().active?.progress > 0.25,
        );
        await save(`moving-${id}-quarter`, false, true);
        await page.waitForFunction(
          () => window.__LAST_FERRY__.getJourneyStatus().active?.progress > 0.6,
        );
        await save(`moving-${id}-later`, false, true);
      }
      await idle();
      await save(`arrived-${id}`, probe, true);
    };
    const transfer = async (id) => {
      if (!(await page.locator(`#${id}`).isVisible()))
        await press(
          `map-${await page.evaluate(() => window.__LAST_FERRY__.getState().boatNodeId)}`,
        );
      await press(id);
      await press('commit');
      await idle();
    };
    await page.goto(`${base}/?cove=bellwater`);
    await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 5);
    await move('shallows');
    await move('low-pier');
    await transfer('board');
    await move('east-buoy');
    await move('west-buoy');
    await move('harbor');
    await move('bell-pier');
    await transfer('board');
    await move('harbor');
    await move('west-buoy', true);
    await move('east-buoy', true);
    await move('west-buoy', true);
    await move('harbor', true);
    await transfer('unload');
    await save('won', true);
    const final = await page.evaluate(() => window.__LAST_FERRY__.getState());
    if (final.status !== 'won' || final.turn !== 14)
      throw new Error('Bellwater actual UI outer rescue did not finish in14actions');
    result.bellwater.complete = true;
    await context.close();
  }
  if (args.homecoming === 'true') {
    const context = await browser.newContext({
      viewport: { width: 844, height: 390 },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage(), stages = [];
    result.homecoming = { complete: false, input: 'Actual touchscreen UI nine-action rescue, Play view before final disembarkation, then viewport rotation only', stages };
    page.on('pageerror', error => result.errors.push({ homecoming: true, message: error.message }));
    const flush = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const idle = () => page.waitForFunction(() => document.querySelector('#seascape')?.getAttribute('aria-busy') === 'false');
    const press = id => page.locator(`#${id}`).tap();
    const move = async id => {
      const visible = await page.locator(`#map-${id}`).evaluate(e => {
        const r = e.getBoundingClientRect();
        return !e.closest('.offscreen') && r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight;
      });
      if (!visible) { await press('view-toggle'); await flush(); }
      await press(`map-${id}`); await press('sail');
      if ((await page.evaluate(() => window.__LAST_FERRY__.getViewStatus().mode)) !== 'play') await press('back-to-boat');
      await idle(); await flush();
    };
    const transfer = async id => {
      if (!(await page.locator(`#${id}`).isVisible())) await press(`map-${await page.evaluate(() => window.__LAST_FERRY__.getState().boatNodeId)}`);
      await press(id); await press('commit'); await idle(); await flush();
    };
    const save = async label => {
      await flush();
      const data = await page.evaluate(label => {
        const a = window.__LAST_FERRY__, f = a.getFrameStatus(), s = a.getState();
        return { label, at: performance.now(), viewport: [innerWidth, innerHeight], state: s, view: a.getViewStatus(), frame: f, homecoming: a.getHomecomingStatus(), dialog: document.querySelector('#dialog').getBoundingClientRect().toJSON(), history: a.getRenderStatus().historyLength };
      }, label);
      stages.push(data);
      const safe = await page.evaluate(() => window.__LAST_FERRY__.getViewportStatus().safe);
      for (const subject of [data.frame.boat, ...data.frame.passengers.filter(p => data.state.delivered.includes(p.id))]) {
        const b = data.view.usable;
        if (subject.left < b.left - 1 || subject.right > b.right + 1 || subject.top < b.top - 1 || subject.bottom > b.bottom + 1) throw new Error(`Won Play subject outside usable frame: ${label}`);
      }
      if (data.dialog.left < safe.left - 1 || data.dialog.right > safe.right + 1 || data.dialog.top < safe.top - 1 || data.dialog.bottom > safe.bottom + 1) throw new Error(`Won completion card outside safe bounds: ${label}`);
      if (data.view.mode !== 'play' || data.state.status !== 'won' || data.state.turn !== 9) throw new Error(`Unexpected won Play state: ${label}`);
      await page.screenshot({ path: resolve(output, `holding-won-play-${label}.png`) });
    };
    await page.goto(`${base}/?cove=holding-pier`);
    await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 5);
    await transfer('unload'); await move('shallows'); await move('rabbit-pier'); await transfer('board'); await move('shallows'); await move('stone'); await transfer('board'); await move('harbor'); await transfer('unload');
    await page.waitForFunction(() => document.querySelector('#terminal-undo') && window.__LAST_FERRY__.getHomecomingStatus().settled);
    await save('844x390');
    await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(400); await save('390x844');
    await page.setViewportSize({ width: 780, height: 320 }); await page.waitForTimeout(400); await save('780x320');
    result.homecoming.complete = true;
    await context.close();
  }
  result.sourceUnchanged = JSON.stringify(snapshot()) === JSON.stringify(source);
  if (!result.sourceUnchanged) throw new Error('Capture source changed during run');
  result.outcome = result.errors.length ? 'page errors' : 'passed capture assertions';
} catch (error) {
  result.outcome = 'failed';
  result.failure = String(error.stack ?? error);
  process.exitCode = 1;
} finally {
  await browser.close();
  writeFileSync(resolve(output, 'capture.json'), JSON.stringify(result, null, 2));
  console.log(
    JSON.stringify({
      phase,
      outcome: result.outcome,
      captures: result.captures.map((c) => ({
        viewport: c.viewport,
        ferryDimensions: c.ferryDimensions,
      })),
      errors: result.errors,
    }),
  );
}

