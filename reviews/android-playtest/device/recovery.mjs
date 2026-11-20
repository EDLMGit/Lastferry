import assert from 'node:assert/strict';
import { expect } from '@playwright/test';
process.env.FERRY_PLAY_OUT ??= 'reviews/android-playtest/device';
const {
  adb,
  app,
  bothOffline,
  connect,
  data,
  json,
  nativeOption,
  out,
  packageInfo,
  pause,
  sha,
  shell,
  shot,
  start,
  stop,
  tap,
} = await import('../play/android.mjs');

const written = [];
const protectedDigests = (records) =>
  Object.fromEntries(Object.entries(records).map(([key, value]) => [key, sha(value)]));

function nativeControls() {
  shell('uiautomator', 'dump', '/data/local/tmp/ferry-recovery.xml');
  const xml = shell('cat', '/data/local/tmp/ferry-recovery.xml');
  return [...xml.matchAll(/<node\b[^>]+>/g)]
    .map(([tag]) => {
      const text = tag.match(/\btext="([^"]*)"/)?.[1];
      const bounds = tag.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
      return { text, bounds: bounds?.slice(1).map(Number) };
    })
    .filter((item) => item.text && item.bounds);
}

async function retry(cause, expected, prior) {
  let controls = [];
  await expect
    .poll(
      () => {
        controls = nativeControls();
        return controls.some((item) => item.text.toLowerCase() === 'try again');
      },
      { timeout: 50000 },
    )
    .toBe(true);
  assert(controls.some((item) => item.text.includes('WebGL 2')));
  const frame = shot('recovery-' + cause);
  await prior.device.close();
  const retryBounds = controls.find((item) => item.text.toLowerCase() === 'try again').bounds;
  const [left, top, right, bottom] = retryBounds;
  shell('input', 'tap', String((left + right) >> 1), String((top + bottom) >> 1));
  const next = await connect();
  await expect(next.page.locator('#home-play')).toBeVisible({ timeout: 25000 });
  assert.deepEqual(await data(next.page), expected);
  written.push({ cause, controls, frame, returnedTo: 'Home', saveBytesIdentical: true });
  return next;
}

async function readView(page) {
  const sizing = await page.evaluate(() => ({
    url: location.href,
    viewport: [innerWidth, innerHeight],
    pixelRatio: devicePixelRatio,
    visibleViewport: [visualViewport.width, visualViewport.height],
    fullscreen: document.fullscreenElement?.id ?? null,
    ready: document.documentElement.dataset.lastFerryReady,
  }));
  const hierarchy = shell('dumpsys', 'activity', 'top');
  const nativeViews = hierarchy
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /android\.webkit\.WebView\{|DecorView\{.*\[MainActivity\]/.test(line));
  const insets = [
    ...shell('dumpsys', 'window', 'displays').matchAll(
      /^\s*InsetsSource id=\w+ type=(statusBars|navigationBars|mandatorySystemGestures) frame=\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\] visible=(true|false)/gm,
    ),
  ].map(([, type, left, top, right, bottom, visible]) => ({
    type,
    rect: [left, top, right, bottom].map(Number),
    visible: visible === 'true',
  }));
  return {
    ...sizing,
    nativeViews,
    insets,
    physical: shell('wm', 'size'),
    density: shell('wm', 'density'),
  };
}

start();
let active = await connect();
const before = await data(active.page);
assert(Object.hasOwn(before, 'last-ferry.mastery.v1'), 'Run after the earned rescue and update');
const device = {
  android: shell('getprop', 'ro.build.version.release'),
  api: shell('getprop', 'ro.build.version.sdk'),
  image: shell('getprop', 'ro.build.fingerprint'),
  webView: shell('dumpsys', 'webviewupdate')
    .split('\n')
    .find((line) => line.includes('Current WebView package ('))
    .trim(),
  hardware: shell('dumpsys', 'SurfaceFlinger')
    .split('\n')
    .find((line) => line.startsWith('GLES:'))
    ?.trim(),
  gestureNav: shell(
    'cmd',
    'overlay',
    'lookup',
    'android',
    'android:integer/config_navBarInteractionMode',
  ),
  package: packageInfo(),
  apkSHA256: shell(
    'sha256sum',
    shell('pm', 'path', app)
      .split('\n')[0]
      .replace(/^package:/, ''),
  ).split(/\s/)[0],
  offline: bothOffline(),
};
const normal = await readView(active.page);
await active.cdp.send('Page.enable');
await active.cdp.send('Page.addScriptToEvaluateOnNewDocument', {
  source: `const ferryOriginalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      return type === 'webgl2' ? null : ferryOriginalGetContext.call(this, type, ...args);
    };`,
});
await active.cdp.send('Page.reload', { ignoreCache: true }).catch(() => {});
active = await retry('webgl-unavailable', before, active);
await active.cdp.send('Page.crash').catch(() => {});
active = await retry('renderer-exit', before, active);
await tap(active, '#home-practice');
await tap(active, '#practice-holding-pier');
await tap(active, '#menu');
const menu = active.page.locator('#dialog');
await expect(menu).toBeVisible();
const beforeFullscreen = await readView(active.page);
const top = beforeFullscreen.insets.find((i) => i.type === 'statusBars' && i.visible);
const bottom = beforeFullscreen.insets.find(
  (i) => i.type === 'mandatorySystemGestures' && i.visible && i.rect[1] > 0,
);
assert(top && bottom, 'Expected visible status and gesture areas in portrait');
assert.equal(
  beforeFullscreen.viewport[1] * beforeFullscreen.pixelRatio,
  bottom.rect[1] - top.rect[3],
);
await tap(active, '#fullscreen');
await expect
  .poll(() => active.page.evaluate(() => document.fullscreenElement?.id), { timeout: 15000 })
  .toBe('app');
await expect(menu).toBeVisible();
await pause(600);
const intro = shell('dumpsys', 'window')
  .split('\n')
  .find((line) => line.includes('mCurrentFocus=') && line.includes('ImmersiveModeConfirmation'));
if (intro) {
  shot('android-fullscreen-introduction');
  await nativeOption('Got it');
  await pause(500);
}
const full = await readView(active.page);
assert(full.viewport[1] >= beforeFullscreen.viewport[1]);
assert(
  full.insets
    .filter((i) => i.type === 'statusBars' || i.type === 'navigationBars')
    .every((i) => !i.visible),
);
const fullFrame = shot('fullscreen-menu');
adb('shell', 'input', 'keyevent', 'KEYCODE_BACK');
await expect
  .poll(() => active.page.evaluate(() => document.fullscreenElement?.id ?? null))
  .toBeNull();
await expect(menu).toBeVisible();
await pause(600);
const afterFullscreen = await readView(active.page);
assert.deepEqual(beforeFullscreen.viewport, afterFullscreen.viewport);
assert.deepEqual(await data(active.page), before);
await active.device.close();
stop();
start();
active = await connect();
await expect(active.page.locator('#home-play')).toHaveText('Continue');
assert.deepEqual(await data(active.page), before);
json('renderer-and-insets', {
  device,
  startingRecordSHA256: protectedDigests(before),
  restoredAfterBoth: true,
  injections: written,
  normal,
  beforeFullscreen,
  full,
  fullFrame,
  afterFullscreen,
  nativeFullscreenBackRestoredMenu: true,
  finalColdHomeKeptSave: true,
});
await active.device.close();
console.log(
  'Verified two native renderer recovery paths, saved bytes and the fullscreen Android Back handoff in ' +
    out,
);
