import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { expect } from '@playwright/test';

process.env.FERRY_PLAY_OUT = 'reviews/harbor-log';
const { app, adb, bothOffline, connect, data, json, packageInfo, pause, sha, shell,
  shot, start, stop, tap } = await import('../android-playtest/play/android.mjs');
const priorReceipt = JSON.parse(readFileSync('reviews/android-cove-view/package.json')).update;
const earned = JSON.parse(readFileSync('reviews/android-playtest/play/earn.json')).earned;
const phase = process.argv[2];
const report = { phase, offline: bothOffline(), package: packageInfo(), frames: [] };
let view;
const hashRecords = store => Object.fromEntries(Object.entries(store).map(([k, v]) => [k, sha(v)]));
const store = () => data(view.page);
const loc = css => view.page.locator(css);
const touch = css => tap(view, css);

async function cold() {
  await view?.device.close();
  stop();
  start();
  view = await connect();
  await expect(loc('#home-play')).toHaveText('Continue', { timeout: 30000 });
}
async function capture(name) {
  await view.page.evaluate(() => document.fonts.ready);
  await pause(900);
  report.frames.push(shot('android-' + name));
}
function installedDigest() {
  return shell('sha256sum', shell('pm', 'path', app).replace(/^package:/, '')).split(/\s/)[0];
}

try {
  if (phase === 'baseline') {
    assert.equal(report.package.versionCode, '3');
    assert.equal(installedDigest(), priorReceipt.apkSHA256);
    await cold();
    const records = await store();
    assert.deepEqual(records, earned);
    report.originalAPK = priorReceipt.apkSHA256;
    report.recordHashes = hashRecords(records);
    report.checkpoint = JSON.parse(records['last-ferry.journey.v1']);
    report.best = JSON.parse(records['last-ferry.mastery.v1']).results['holding-pier@1'];
    await touch('#home-practice');
    await expect(loc('#practice-holding-pier .mastery-badge')).toHaveAccessibleName(/2 of 3 lanterns/);
    await capture('v3-practice');
  } else if (phase === 'install') {
    assert.equal(report.package.versionCode, '3');
    const apk = process.argv[3];
    assert.ok(apk);
    assert.equal(installedDigest(), priorReceipt.apkSHA256);
    await cold();
    assert.deepEqual(await store(), earned);
    await view.device.close();
    view = undefined;
    report.apkSHA256 = sha(readFileSync(apk));
    report.install = adb('install', '-r', apk);
    assert.match(report.install, /Success/);
    report.updated = packageInfo();
    assert.equal(report.updated.versionCode, '4');
    assert(report.package.appId && report.package.firstInstallTime);
    assert.equal(report.updated.firstInstallTime, report.package.firstInstallTime);
    assert.equal(report.updated.appId, report.package.appId);
    assert.equal(installedDigest(), report.apkSHA256);
    await cold();
    const records = await store();
    for (const [k, v] of Object.entries(earned)) assert.equal(records[k], v);
    report.recordHashes = hashRecords(records);
    await capture('upgraded-home');
    await touch('#home-practice');
    await expect(loc('#dialog')).toContainText(/Moss/);
    await expect(loc('#dialog')).toContainText(/Pip/);
    await expect(loc('#dialog')).toContainText(/Rue/);
    await expect(loc('#dialog')).toContainText(/1 of 12 coves rescued/i);
    await expect(loc('#harbor-lantern-page .mastery-badge')).toHaveAccessibleName(/2 of 3 lanterns/);
    await expect(loc('#harbor-moss-page')).toHaveAttribute('data-earned', 'false');
    await expect(loc('#harbor-take-request')).toBeVisible();
    await capture('upgraded-log');
    await cold();
    await touch('#home-play');
    await expect(loc('#seascape')).toHaveAttribute('aria-label', 'Bellwater Cove');
  } else throw Error('Expected baseline or install <v4.apk>');
  report.passed = true;
} finally {
  json('android-' + phase, report);
  await view?.device.close();
}
