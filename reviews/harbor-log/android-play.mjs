import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { expect } from '@playwright/test';

process.env.FERRY_PLAY_OUT ??= 'reviews/harbor-log';
const { app, bothOffline, connect, data, json, packageInfo, pause, shell, shot, start, stop, tap } =
  await import('../android-playtest/play/android.mjs');
const normal = JSON.parse(readFileSync('data/experiments/holding-pier-solution.json')).actions;
const requested = [
  ...normal.slice(0, 6), { type: 'move', to: 'harbor' },
  { type: 'unload', passengerIds: ['rabbit-1', 'rabbit-2'] },
  { type: 'move', to: 'stone' }, normal[6], normal[7], { type: 'unload', passengerIds: ['sheep-1'] },
];
const journeyKey = 'last-ferry.journey.v1', masteryKey = 'last-ferry.mastery.v1',
  entriesKey = 'last-ferry.harbor-log.v1';
const report = { deviceUser: shell('am', 'get-current-user'), package: packageInfo(),
  offline: bothOffline(), frames: [], turns: [], coldStarts: [], pageErrors: [] };
const receipt = JSON.parse(readFileSync('reviews/harbor-log/android-package.json'));
report.apkSHA256 = shell('sha256sum', shell('pm', 'path', app).replace(/^package:/, '')).split(/\s/)[0];
assert.equal(report.apkSHA256, receipt.apkSHA256);
report.source = receipt.apkSource;
assert.notEqual(report.deviceUser, '0', 'Use a separate empty test profile on the disposable emulator.');
assert.equal(report.package.versionCode, '4');
let view;
const loc = css => view.page.locator(css);
const touch = css => tap(view, css);
async function cold() {
  await view?.device.close();
  stop();
  const began = Date.now();
  start();
  view = await connect();
  view.page.on('pageerror', e => report.pageErrors.push(e.message));
  await view.page.waitForFunction(() => document.documentElement.dataset.lastFerryReady === 'true',
    undefined, { timeout: 30000 });
  await expect(loc('#home-play')).toBeVisible({ timeout: 30000 });
  report.coldStarts.push({ readyMs: Date.now() - began, home: await loc('#home-play').innerText() });
}
async function capture(name) {
  await view.page.evaluate(() => document.fonts.ready);
  await pause(900);
  report.frames.push(shot('android-' + name));
  console.log('Captured', name);
}
async function turn(n, run) {
  await expect(loc('#seascape')).toHaveAttribute('aria-busy', 'false', { timeout: 30000 });
  await expect(loc('[data-testid=turn]')).toHaveText(String(n).padStart(2, '0'), { timeout: 30000 });
  report.turns.push({ run, turn: n, tide: await loc('[data-testid=tide]').textContent(),
    location: await loc('[aria-current=location]').getAttribute('id'),
    passengers: await loc('#load-toggle').getAttribute('aria-label') });
  console.log(run, n);
}
async function markerAvailable(css) {
  return loc(css).evaluate(el => {
    const r = el.getBoundingClientRect();
    return !!r.width && !el.closest('.offscreen') &&
      el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
  });
}
async function inspect(to) {
  const marker = '#map-' + to;
  for (const target of [marker + ' .map-hit', marker + ' .map-name b']) {
    if (await markerAvailable(target)) {
      await touch(target);
      return;
    }
  }
  await touch('#load-toggle');
  if (to === 'harbor') await touch('#find-home');
  else {
    if (!(await loc('#place-index').evaluate(el => el.open))) await touch('#place-index summary');
    await touch('[data-inspect-place="' + to + '"]');
  }
}
async function act(action, n, run) {
  if (action.type === 'move') {
    await inspect(action.to);
    await expect(loc('#local-context')).toHaveAttribute('data-location', action.to);
    await pause(250);
    await touch('#sail');
  } else {
    if (!(await loc('#' + action.type).isVisible())) await touch('[aria-current=location] .map-hit');
    await touch('#' + action.type);
    if (await loc('#dialog[open][data-mode=action]').count()) {
      const options = await loc('.passenger-options button').evaluateAll(all => all.map(el => el.id));
      for (const id of options) {
        const selected = (await loc('#' + id).getAttribute('aria-pressed')) === 'true';
        if (selected !== action.passengerIds.includes(id.slice('passenger-'.length))) await touch('#' + id);
      }
      await touch('#commit');
    }
  }
  await turn(n, run);
}
async function story() {
  for (let shot = 0; shot < 5 && await loc('#story-continue').isVisible(); shot++) {
    await touch('#story-continue');
    await pause(180);
  }
  await expect(loc('#story-continue')).toBeHidden();
}

async function firstChoice() {
  await cold();
  const fresh = await data(view.page);
  for (const key of [journeyKey, masteryKey, entriesKey]) assert.equal(fresh[key], undefined);
  report.motion = fresh['last-ferry-motion'] ?? 'device default';
  await touch('#home-play');
  await expect(loc('#story-continue')).toBeVisible();
  await story();
  await turn(0, 'Journey');
  await capture('at-the-helm');
  for (const [i, action] of normal.entries()) await act(action, i + 1, 'Journey');
  await expect(loc('#mastery-result')).toHaveAttribute('data-lanterns', '3');
  await expect(loc('#take-moss-request')).toBeVisible();
  await expect(loc('#continue-story')).toBeVisible();
  await expect(loc('#accept-moss-entry')).toHaveCount(0);
  const before = await data(view.page);
  assert.deepEqual(JSON.parse(before[journeyKey]).completed, []);
  await capture('first-arrival-choice');
  await touch('#arrival-details summary');
  await expect(loc('#arrival-details')).toHaveJSProperty('open', true);
  report.firstChoiceViewport = await view.page.evaluate(() => [innerWidth, innerHeight]);
  assert.equal(report.firstChoiceViewport[0], 320);
  await capture('first-arrival-details');
  await touch('#take-moss-request');
  await turn(0, 'Practice request');
  const accepted = await data(view.page);
  report.checkpointBeforeDetour = JSON.parse(accepted[journeyKey]);
  assert.deepEqual(report.checkpointBeforeDetour.checkpoint, { kind: 'scene', id: 'another-bell' });
  assert.deepEqual(report.checkpointBeforeDetour.completed, ['holding-pier']);
  report.strongest = JSON.parse(accepted[masteryKey]).results['holding-pier@1'];
  assert.equal(report.strongest.lanterns, 3);
  assert(!JSON.parse(accepted[entriesKey]).entries.includes('moss-own-crossing'));
  return accepted;
}

async function resumeFinalSail() {
  const partial = JSON.parse(readFileSync('reviews/harbor-log/android-before-retry.json'));
  assert.equal(partial.apkSHA256, report.apkSHA256);
  assert.equal(partial.deviceUser, report.deviceUser);
  assert.deepEqual(partial.package, report.package);
  assert.equal(partial.turns.at(-1).turn, 10);
  Object.assign(report, partial);
  view = await connect();
  view.page.on('pageerror', e => report.pageErrors.push(e.message));
  await turn(10, 'Before retry');
  await expect(loc('#local-context')).toHaveAttribute('data-location', 'harbor');
  await expect(loc('#sail')).toHaveAccessibleName('Sail to Harbor · 1 action');
  await expect(loc('#sail')).toBeEnabled();
  assert.equal(report.turns.at(-1).location, 'map-stone');
  assert.match(report.turns.at(-1).passengers, /2 of 3 home.*Moss aboard/);
  const storage = await data(view.page);
  assert.deepEqual(JSON.parse(storage[journeyKey]), partial.checkpointBeforeDetour);
  assert.deepEqual(JSON.parse(storage[masteryKey]).results['holding-pier@1'], partial.strongest);
  assert.deepEqual(JSON.parse(storage[entriesKey]).entries, ['rue-lantern']);
  report.retry = 'The first tap on Sail did not advance turn 10. Harbor was still selected at Stone.';
  await capture('before-sail-retry');
  await touch('#sail');
  await turn(11, 'Practice request');
  return storage;
}

try {
  const resumed = process.argv[2] === '--resume-final-sail';
  const accepted = resumed ? await resumeFinalSail() : await firstChoice();
  for (const [i, action] of requested.entries()) {
    if (resumed && i < 11) continue;
    await act(action, i + 1, 'Practice request');
    if (i === 7) {
      assert.match(report.turns.at(-1).passengers, /2 of 3 home/);
      await touch('#undo');
      await turn(7, 'Undo rabbit delivery');
      assert.match(report.turns.at(-1).passengers, /0 of 3 home/);
      await act(action, 8, 'Restore rabbit delivery');
    }
  }
  await expect(loc('#mastery-result')).toHaveAttribute('data-lanterns', '1');
  await expect(loc('#accept-moss-entry')).toBeVisible();
  report.rewardHeading = await view.page.evaluate(() => {
    const text = document.createRange();
    text.selectNodeContents(document.querySelector('#dialog-title'));
    const close = document.querySelector('#cancel').getBoundingClientRect();
    const lines = [...text.getClientRects()];
    return { text: text.toString(), lines: lines.map(r => [r.x, r.y, r.width, r.height]),
      close: [close.x, close.y, close.width, close.height],
      clear: lines.every(r => r.right <= close.left || r.left >= close.right ||
        r.bottom <= close.top || r.top >= close.bottom) };
  });
  assert.equal(report.rewardHeading.text, 'Moss’s Own Crossing');
  assert.ok(report.rewardHeading.clear, 'Reward title overlaps the Close control');
  assert.deepEqual(await data(view.page), accepted);
  await capture('moss-arrival');
  await touch('#accept-moss-entry');
  await expect(loc('#home-play')).toHaveText('Continue');
  const returned = await data(view.page);
  assert.equal(returned[journeyKey], accepted[journeyKey]);
  assert.equal(returned[masteryKey], accepted[masteryKey]);
  assert.deepEqual(JSON.parse(returned[entriesKey]).entries.sort(), ['moss-own-crossing', 'rue-lantern']);
  const nativeRecords = await view.page.evaluate(keys =>
    Object.fromEntries(keys.map(key => [key, window.lastFerrySaves.read(key)])), [journeyKey, masteryKey, entriesKey]);
  for (const [k, v] of Object.entries(nativeRecords)) assert.equal(v, returned[k]);
  report.committedRecords = nativeRecords;
  const closing = Date.now();
  await cold();
  report.forceStopAndReopenMs = Date.now() - closing;
  assert.deepEqual(await data(view.page), returned);
  await expect(loc('#home-practice')).toContainText('Moss’s Own Crossing');
  await capture('cold-home');
  await touch('#home-practice');
  await expect(loc('#harbor-moss-page')).toHaveAttribute('data-earned', 'true');
  await expect(loc('#harbor-lantern-page .mastery-badge')).toHaveAccessibleName(/3 of 3 lanterns/);
  await expect(loc('[data-practice]')).toHaveCount(13);
  await capture('cold-log');
  await touch('#journey-title');
  await touch('#home-play');
  await expect(loc('#dialog[open]')).toHaveAttribute('data-mode', 'story');
  await expect(loc('#story-continue')).toContainText('Bellwater');
  await capture('bellwater-story');
  await story();
  await expect(loc('#seascape')).toHaveAttribute('aria-label', 'Bellwater Cove');
  await turn(0, 'Bellwater');
  report.finalCheckpoint = JSON.parse((await data(view.page))[journeyKey]);
  assert.deepEqual(report.finalCheckpoint.checkpoint, { kind: 'cove', id: 'bellwater' });
  await capture('bellwater-helm');
  assert.deepEqual(report.pageErrors, []);
  report.passed = true;
} finally {
  json('android-play', report);
  await view?.device.close();
}
