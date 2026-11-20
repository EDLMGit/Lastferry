import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { expect } from '@playwright/test';
process.env.FERRY_PLAY_OUT ??= 'reviews/android-cove-view/device';
const {
  adb,
  app,
  bothOffline,
  connect,
  data,
  json,
  out,
  packageInfo,
  pause,
  sha,
  shell,
  shot,
  start,
  stop,
  tap,
  nativeOption,
} = await import('../../android-playtest/play/android.mjs');
const phase = process.argv[2];
const original = JSON.parse(readFileSync('reviews/android-playtest/play/earn.json')).earned;
const witness = JSON.parse(readFileSync('data/experiments/holding-pier-solution.json')).actions;
const digest = (value) => Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sha(v)]));
const report = {
  phase,
  offline: bothOffline(),
  package: packageInfo(),
  start: new Date().toISOString(),
  sha256: shell('sha256sum', shell('pm', 'path', app).replace(/^package:/, '')).split(/\s/)[0],
  frames: [],
  states: [],
  pageErrors: [],
};
let view;
const loc = (css) => view.page.locator(css);
const touch = (css) => tap(view, css);
const wait = () =>
  expect(loc('#seascape')).toHaveAttribute('aria-busy', 'false', { timeout: 30000 });
const attach = async () => {
  view = await connect();
  view.page.on('pageerror', (e) => report.pageErrors.push(e.message));
};
async function relaunch() {
  if (view) await view.device.close();
  stop();
  start();
  await attach();
  await expect(loc('#home-play')).toHaveText('Continue', { timeout: 25000 });
}
async function cold() {
  await relaunch();
  assert.deepEqual(await data(view.page), original);
}
async function practice() {
  await touch('#home-practice');
  await touch('#practice-holding-pier');
  await turn(0);
}
async function turn(n) {
  await wait();
  await expect(loc('[data-testid=turn]')).toHaveText(String(n).padStart(2, '0'), {
    timeout: 25000,
  });
  report.states.push(
    await view.page.evaluate(() => ({
      turn: Number(document.querySelector('[data-testid=turn]').textContent),
      tide: Number(document.querySelector('[data-testid=tide]').textContent),
      ferry: document.querySelector('#load-toggle').getAttribute('aria-label'),
      location: document.querySelector('[aria-current=location]')?.id,
      dialog: document.querySelector('#dialog[open]')?.dataset.mode,
    })),
  );
}
function rotate(n) {
  shell('settings', 'put', 'system', 'user_rotation', String(n));
}
async function settled() {
  await view.page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
  await pause(900);
}
async function measure() {
  const native = shell('dumpsys', 'activity', 'top')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /android\.webkit\.WebView\{|DecorView\{.*\[MainActivity\]/.test(l));
  const rect = (line) =>
    line
      .match(/\s(-?\d+),(-?\d+)-(-?\d+),(-?\d+)\b/)
      ?.slice(1)
      .map(Number);
  const window = rect(native.find((l) => l.includes('DecorView'))),
    webView = rect(native.find((l) => l.includes('android.webkit.WebView')));
  const insets = [
    ...shell('dumpsys', 'window', 'displays').matchAll(
      /^\s*InsetsSource id=\w+ type=(displayCutout|statusBars|navigationBars|mandatorySystemGestures|systemGestures) frame=\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\] visible=(true|false)/gm,
    ),
  ].map(([, type, l, t, r, b, visible]) => ({
    type,
    bounds: [l, t, r, b].map(Number),
    visible: visible === 'true',
  }));
  const web = await view.page.evaluate(() => {
    const canvas = document.querySelector('#world canvas'),
      r = canvas.getBoundingClientRect();
    const bound = (e) => {
      const r = e.getBoundingClientRect();
      return [r.left, r.top, r.right, r.bottom];
    };
    return {
      nativeInsets: window.lastFerryAndroidInsets ?? null,
      safeCSS: Object.fromEntries(
        ['left', 'top', 'right', 'bottom'].map((side) => [
          side,
          getComputedStyle(document.querySelector('#app')).getPropertyValue('--safe-' + side),
        ]),
      ),
      viewportCSS: [innerWidth, innerHeight],
      dpr: devicePixelRatio,
      canvasCSS: bound(canvas),
      backing: [canvas.width, canvas.height],
      fullscreen: document.fullscreenElement?.id ?? null,
      interactiveCSS: [
        ...document.querySelectorAll(
          ' #menu,#undo,#sound-toggle,#wait,#load-toggle,#status-toggle,#view-toggle,#view-zoom,#back-to-boat,#zoom-tools button,#dock-actions button,#local-context button,#dialog[open] button',
        ),
      ]
        .filter(
          (e) =>
            e.getBoundingClientRect().width &&
            getComputedStyle(e).visibility !== 'hidden' &&
            (!document.querySelector('#dialog[open]') || e.closest('#dialog')),
        )
        .map((e) => ({ id: e.id, bounds: bound(e) })),
      dialogCSS: document.querySelector('#dialog[open]')
        ? bound(document.querySelector('#dialog'))
        : null,
      ready: document.documentElement.dataset.lastFerryReady,
    };
  });
  const canvas = web.canvasCSS.map((p, i) => Math.round(p * web.dpr + webView[i % 2]));
  return { window, webView, canvas, web, native, insets };
}
async function capture(name) {
  console.log(phase, 'capture', name);
  await settled();
  const bounds = await measure();
  const frame = shot(name);
  report.frames.push({ name, bounds, frame });
  return bounds;
}
async function inspect(to) {
  const marker = '#map-' + to + ' .map-hit';
  const visible = await loc(marker).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return (
      !el.closest('.offscreen') &&
      el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
    );
  });
  const mapName = '#map-' + to + ' .map-name b';
  const nameVisible = await loc(mapName).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return (
      r.width > 0 &&
      !el.closest('.offscreen') &&
      el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
    );
  });
  if (visible) await touch(marker);
  else if (nameVisible) await touch(mapName);
  else {
    await touch('#load-toggle');
    if (to === 'harbor') await touch('#find-home');
    else {
      if (!(await loc('#place-index').evaluate((e) => e.open))) await touch('#place-index summary');
      await touch('[data-inspect-place="' + to + '"]');
    }
  }
  await expect(loc('#local-context')).toHaveAttribute('data-location', to);
  return visible || nameVisible ? 'map target' : 'free place index';
}
async function act(a, n) {
  console.log(phase, 'playing', n, a.type, a.to ?? '');
  if (a.type === 'move') {
    await inspect(a.to);
    await touch('#sail');
  } else {
    if (!(await loc('#' + a.type).isVisible())) await touch('[aria-current=location] .map-hit');
    await touch('#' + a.type);
    if (await loc('#dialog[open][data-mode=action]').count()) {
      const ids = await loc('.passenger-options button').evaluateAll((nodes) =>
        nodes.map((e) => e.id),
      );
      for (const id of ids)
        if (
          ((await loc('#' + id).getAttribute('aria-pressed')) === 'true') !==
          a.passengerIds.includes(id.slice('passenger-'.length))
        )
          await touch('#' + id);
      if (phase === 'after' && n === 4 && !report.chooser) {
        report.chooser = await capture('after-boarding-chooser');
        await checkCard(report.chooser, 'commit');
      }
      await touch('#commit');
    }
  }
  await turn(n);
}
async function checkCard(m, id) {
  const ins = m.web.nativeInsets,
    edge = [ins.left, ins.top, m.window[2] - ins.right, m.window[3] - ins.bottom];
  const control = m.web.interactiveCSS.find((c) => c.id === id);
  assert(control);
  for (const css of [m.web.dialogCSS, control.bounds]) {
    const r = css.map((n) => n * m.web.dpr);
    assert(
      r[0] >= edge[0] - 2 && r[1] >= edge[1] - 2 && r[2] <= edge[2] + 2 && r[3] <= edge[3] + 2,
      JSON.stringify({ id, r, edge }),
    );
  }
}
async function frameHarbor(label) {
  await turn(8);
  await touch('#view-toggle');
  await expect(loc('#view-toggle')).toHaveAttribute('aria-pressed', 'true');
  await touch('#back-to-boat');
  await expect(loc('#view-toggle')).toHaveAttribute('aria-pressed', 'false');
  await capture(label + '-harbor-back-to-boat');
}
async function holding() {
  rotate(1);
  await cold();
  await practice();
  await capture(phase + '-start-landscape-left');
  for (const [i, a] of witness.entries()) {
    if (i === 8 && phase === 'before') break;
    await act(a, i + 1);
    if (i === 3 && phase === 'after') {
      await touch('#undo');
      await turn(3);
      assert.equal(await loc('[data-testid=tide]').textContent(), '0');
      await act(a, 4);
    }
    if (i === 7) {
      const summary = await loc('#load-toggle').getAttribute('aria-label');
      assert.match(summary, /0 (of|\/) ?3 home/i);
      assert.match(summary, /3/);
      assert.match(summary, /5/);
      await capture(phase + '-harbor-eight');
      if (phase === 'after') {
        assert.match(summary, /4 of 4 deck spaces occupied/);
        for (const name of ['Pip', 'Rue', 'Moss']) assert(summary.includes(name));
        assert.match(summary, /needs depth 3. Water here is 5 deep/);
        await touch('#load-toggle');
        await expect(loc('#readout')).toContainText('4 of 4 deck spaces occupied');
        await capture('after-harbor-free-reading');
        await touch('#close-status');
        await turn(8);
      }
      await frameHarbor(phase);
    }
  }
  if (phase === 'after') {
    await expect(loc('#arrival-cast img')).toHaveCount(3);
    const arrival = await capture('after-holding-arrival');
    await checkCard(arrival, 'terminal-undo');
  }
}
async function upgrade() {
  await cold();
  report.before = digest(await data(view.page));
  const pkg = packageInfo();
  assert.equal(pkg.versionCode, '2');
  await view.device.close();
  view = null;
  const apk = process.argv[3];
  assert.ok(apk);
  report.install = {
    sha256: sha(readFileSync(apk)),
    command: 'adb install -r',
    output: adb('install', '-r', apk),
  };
  assert.match(report.install.output, /Success/);
  const updated = packageInfo();
  report.updated = updated;
  assert.equal(updated.versionCode, '3');
  assert.equal(pkg.firstInstallTime, updated.firstInstallTime);
  assert.equal(pkg.appId, updated.appId);
  start();
  await attach();
  await expect(loc('#home-play')).toHaveText('Continue');
  assert.deepEqual(await data(view.page), original);
  await cold();
  report.cold = digest(await data(view.page));
  await touch('#home-practice');
  await expect(loc('#practice-holding-pier .mastery-badge')).toHaveAccessibleName(
    /2 of 3 lanterns/,
  );
  await capture('updated-practice');
  await cold();
  await touch('#home-play');
  await expect(loc('#seascape')).toHaveAttribute('aria-label', 'Bellwater Cove');
  await turn(0);
  assert.deepEqual(await data(view.page), original);
}
try {
  if (phase === 'before' || phase === 'after') await holding();
  else if (phase === 'match-before') {
    await attach();
    await frameHarbor('before');
  } else if (phase === 'upgrade') await upgrade();
  else if (phase.startsWith('camera') || phase.startsWith('rotation')) {
    const { camera, rotation } = await import('./walk.mjs');
    await (phase.startsWith('camera') ? camera : rotation)({
      get: () => view,
      attach,
      relaunch,
      cold,
      practice,
      turn,
      act,
      inspect,
      touch,
      wait,
      settled,
      capture,
      measure,
      rotate,
      loc,
      report,
      original,
      witness,
    });
  } else throw Error('Expected before, upgrade, after, rotation or camera');
  assert.deepEqual(report.pageErrors, []);
  report.passed = true;
} catch (e) {
  console.error(e);
  report.error = e.stack;
  process.exitCode = 1;
  try {
    report.failFrame = shot(phase + '-failure');
  } catch {}
} finally {
  json(phase + (report.passed ? '' : '-failure'), report);
  await view?.device.close();
}
