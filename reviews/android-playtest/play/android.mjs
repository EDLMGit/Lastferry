import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { _android } from 'playwright';
import { expect } from '@playwright/test';

export const app = 'com.lastferry.playtest';
export const origin = 'https://appassets.androidplatform.net';
export const serial = process.env.ANDROID_SERIAL;
export const out = process.env.FERRY_PLAY_OUT ?? 'reviews/android-playtest/play';
export const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
export const json = (file, value) =>
  writeFileSync(out + '/' + file + '.json', JSON.stringify(value, null, 2) + '\n');

assert.ok(serial?.startsWith('emulator-'), 'Use an explicitly selected disposable emulator');
mkdirSync(out, { recursive: true });

function adbRaw(...args) {
  return execFileSync(process.env.ADB ?? 'adb', ['-s', serial, ...args], {
    windowsHide: true,
    timeout: 90000,
    maxBuffer: 8e6,
  });
}
export const adb = (...args) =>
  adbRaw(...args)
    .toString()
    .trim();
export const shell = (...args) => adb('shell', ...args);
export const start = () =>
  shell(
    'am',
    'start',
    '-a',
    'android.intent.action.MAIN',
    '-c',
    'android.intent.category.LAUNCHER',
    '-f',
    '0x10200000',
    '-n',
    app + '/.MainActivity',
  );
export const stop = () => shell('am', 'force-stop', app);
export function packageInfo() {
  const dump = shell('dumpsys', 'package', app);
  return Object.fromEntries(
    ['versionCode', 'versionName', 'firstInstallTime', 'lastUpdateTime', 'userId', 'appId'].map(
      (key) => [
        key,
        dump
          .match(new RegExp('^\\s*' + key + '=([^\\r\\n]+)', 'm'))?.[1]
          .trim()
          .split(key === 'versionCode' ? ' ' : '\0')[0] ?? null,
      ],
    ),
  );
}
export function shot(name) {
  const png = adbRaw('exec-out', 'screencap', '-p');
  assert.equal(png.toString('ascii', 1, 4), 'PNG');
  writeFileSync(out + '/' + name + '.png', png);
  return {
    file: name + '.png',
    sha256: sha(png),
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
}
export async function connect() {
  const devices = await _android.devices({
    omitDriverInstall: true,
    port: Number(process.env.ANDROID_ADB_SERVER_PORT ?? 5037),
  });
  const device = devices.find((item) => item.serial() === serial);
  assert.ok(device, 'Playwright cannot see ' + serial);
  device.setDefaultTimeout(45000);
  const target = await device.webView({ pkg: app });
  const page = await target.page();
  assert.ok(page, 'The Android WebView has no page');
  await page.waitForURL((url) => url.origin === origin, { timeout: 60000, waitUntil: 'commit' });
  const cdp = await page.context().newCDPSession(page);
  return { page, device, cdp };
}
export function data(page) {
  return page.evaluate(() =>
    Object.fromEntries(
      Object.keys(localStorage)
        .filter((key) => key.startsWith('last-ferry'))
        .sort()
        .map((key) => [key, localStorage.getItem(key)]),
    ),
  );
}
export async function tap({ page, cdp }, selector) {
  const item = page.locator(selector).first();
  await expect(item).toBeVisible({ timeout: 20000 });
  await item.scrollIntoViewIfNeeded();
  const point = await item.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const x = rect.x + rect.width / 2,
      y = rect.y + rect.height / 2;
    return {
      x,
      y,
      hit: el.contains(document.elementFromPoint(x, y)),
      disabled: el.matches(':disabled'),
    };
  });
  assert.ok(
    point.hit && !point.disabled,
    selector + ' touch point is covered or disabled: ' + JSON.stringify(point),
  );
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: point.x, y: point.y, radiusX: 4, radiusY: 4, force: 1 }],
  });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
export async function nativeOption(label) {
  for (let i = 0; i < 5; i++) {
    shell('uiautomator', 'dump', '/data/local/tmp/ferry-window.xml');
    const xml = shell('cat', '/data/local/tmp/ferry-window.xml');
    const node = xml.match(/<node\b[^>]+>/g)?.find((tag) => tag.includes('text="' + label + '"'));
    const rect = node?.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (rect) {
      const [, l, t, r, b] = rect.map(Number);
      shell('input', 'tap', String(Math.round((l + r) / 2)), String(Math.round((t + b) / 2)));
      return;
    }
    await pause(250);
  }
  throw Error('Android select popup did not contain ' + label);
}
export function bothOffline() {
  const airplane = shell('settings', 'get', 'global', 'airplane_mode_on');
  const wifi = shell('settings', 'get', 'global', 'wifi_on');
  const data = shell('settings', 'get', 'global', 'mobile_data');
  const active = shell('dumpsys', 'connectivity')
    .split('\n')
    .filter((line) => /Active default network:|mActiveDefaultNetwork:/.test(line))
    .map((line) => line.trim());
  assert.equal(airplane, '1');
  assert.equal(wifi, '0');
  assert.equal(data, '0');
  if (active.length)
    assert.ok(
      active.every((line) => /none|null|-1/i.test(line)),
      active.join('; '),
    );
  return { airplane, wifi, mobileData: data, active };
}
