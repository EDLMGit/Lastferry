import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { expect } from '@playwright/test';
import {
  adb,
  app,
  bothOffline,
  connect,
  data,
  json,
  nativeOption,
  origin,
  out,
  packageInfo,
  pause,
  serial,
  sha,
  shell,
  shot,
  start,
  stop,
  tap,
} from './android.mjs';

const phase = process.argv[2];
assert.ok(
  ['earn', 'update', 'after-update', 'ending'].includes(phase),
  'Choose earn, update, after-update or ending',
);
const key = 'last-ferry.journey.v1',
  best = 'last-ferry.mastery.v1',
  backup = key + '.before-drowned-orchard';
const archived = JSON.parse(readFileSync('reviews/ternhaven-journey/gameplay/390x844/route.json'))
  .reloaded.journey;
const held = JSON.parse(readFileSync('data/experiments/holding-pier-solution.json')).actions;
const final = JSON.parse(readFileSync('data/last-ferry/witnesses.json')).witnesses[0].actions;
const report = {
  phase,
  serial,
  package: app,
  offline: bothOffline(),
  started: new Date().toISOString(),
  shots: [],
  turns: [],
  pageErrors: [],
};
const screen = async (name) => {
  await page().evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  await pause(900);
  report.shots.push(shot(name));
};
let view, recording;
function beginMovie(name) {
  const path = '.cache/android-playtest/' + name + '.webm';
  const reply = adb(
    'emu',
    'screenrecord',
    'start',
    '--size',
    '390x844',
    '--fps',
    '24',
    '--bit-rate',
    '1500000',
    '--time-limit',
    '180',
    path,
  );
  assert.match(reply, /OK/);
  recording = path;
}
function finishMovie() {
  if (!recording) return;
  report.movie = { file: recording, stop: adb('emu', 'screenrecord', 'stop') };
  recording = null;
}
const page = () => view.page;
const loc = (css) => page().locator(css);
const touch = (css) => tap(view, css);
const mode = (name) =>
  expect(loc('#dialog[open]')).toHaveAttribute('data-mode', name, { timeout: 30000 });
const idle = () =>
  expect(loc('#seascape')).toHaveAttribute('aria-busy', 'false', { timeout: 30000 });
const documentIdentity = () => page().evaluate(() => performance.timeOrigin);
async function attach() {
  view = await connect();
  page().on('pageerror', (e) => report.pageErrors.push(e.message));
}
async function stopAndReopen() {
  await view.device.close();
  view = null;
  stop();
  await pause(500);
  assert.equal(
    shell('ps', '-A')
      .split('\n')
      .filter((line) => line.trimEnd().endsWith(' ' + app)).length,
    0,
  );
  start();
  await attach();
}
async function turn(actual) {
  await idle();
  await expect(loc('[data-testid=turn]')).toHaveText(String(actual).padStart(2, '0'), {
    timeout: 25000,
  });
  const v = await page().evaluate(() => ({
    turn: Number(document.querySelector('[data-testid=turn]').textContent),
    tide: Number(document.querySelector('[data-testid=tide]').textContent),
    load: document.querySelector('.gauge-load')?.textContent,
    location: document.querySelector('[aria-current=location]')?.id,
    outcome: document.querySelector('#dialog[open]')?.dataset.outcome ?? null,
  }));
  report.turns.push(v);
}
async function choose(action, interrupt = false) {
  if (!(await loc('#' + action.type).isVisible())) await touch('[aria-current=location] .map-hit');
  await touch('#' + action.type);
  if (!(await loc('#dialog[open][data-mode=action]').count())) return;
  const ids = await loc('.passenger-options button').evaluateAll((nodes) =>
    nodes.map((el) => el.id),
  );
  const picks = () =>
    loc('.passenger-options button').evaluateAll((nodes) =>
      nodes.map((el) => [el.id, el.getAttribute('aria-pressed')]),
    );
  if (interrupt) {
    const first = '#' + ids[0];
    await touch(first);
    const selected = await picks(),
      before = await data(page()),
      identity = await documentIdentity();
    const snapshot = async (label) => {
      await mode('action');
      await turn(3);
      assert.deepEqual(await picks(), selected);
      assert.deepEqual(await data(page()), before);
      assert.equal(await documentIdentity(), identity);
      report[label] = {
        selected,
        epoch: identity,
        viewport: await page().evaluate(() => [innerWidth, innerHeight]),
        sound: await loc('#sound-toggle').getAttribute('data-playback'),
      };
    };
    await screen('04-portrait-chooser');
    shell('settings', 'put', 'system', 'accelerometer_rotation', '0');
    shell('settings', 'put', 'system', 'user_rotation', '1');
    await page().waitForFunction(() => innerWidth > innerHeight);
    await pause(400);
    await snapshot('rotated');
    await screen('05-landscape-chooser');
    shell('input', 'keyevent', 'KEYCODE_HOME');
    const probe = async () => {
      const { result } = await view.cdp.send('Runtime.evaluate', {
        expression:
          "JSON.stringify({documentHidden:document.hidden,audioClock:window.__ferryReviewAudio.context.currentTime,audioContext:window.__ferryReviewAudio.context.state,sound:document.querySelector('#sound-toggle').dataset.playback})",
        userGesture: false,
        returnByValue: true,
      });
      return JSON.parse(result.value);
    };
    await expect
      .poll(async () => (await probe()).audioContext, { timeout: 12000 })
      .toBe('suspended');
    const backgroundStart = await probe();
    await pause(1400);
    const backgroundEnd = await probe();
    const foreground = shell('dumpsys', 'activity', 'activities')
      .split('\n')
      .filter((l) => l.includes('topResumedActivity'))
      .map((l) => l.trim());
    assert.ok(
      foreground.some((l) => l.includes('Launcher')),
      String(foreground),
    );
    assert.equal(backgroundEnd.audioClock, backgroundStart.audioClock);
    assert.equal(backgroundEnd.audioContext, 'suspended');
    report.background = { foreground, backgroundStart, backgroundEnd };
    start();
    await expect.poll(async () => (await probe()).audioContext, { timeout: 12000 }).toBe('running');
    await snapshot('resumed');
    shell('settings', 'put', 'system', 'user_rotation', '0');
    await page().waitForFunction(() => innerWidth < innerHeight);
    shell('input', 'keyevent', 'KEYCODE_BACK');
    await expect(loc('#dialog[open][data-mode=action]')).toHaveCount(0, { timeout: 10000 });
    await turn(3);
    assert.deepEqual(await data(page()), before);
    assert.equal(await documentIdentity(), identity);
    await choose(action);
    return;
  }
  for (const id of ids) {
    if (
      ((await loc('#' + id).getAttribute('aria-pressed')) === 'true') !==
      action.passengerIds.includes(id.slice('passenger-'.length))
    )
      await touch('#' + id);
  }
  await touch('#commit');
}
async function sail(to) {
  const marker = '#map-' + to + ' .map-hit';
  const visible = await loc(marker).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return (
      !el.closest('.offscreen') &&
      el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
    );
  });
  if (visible) await touch(marker);
  else {
    await touch('#load-toggle');
    if (to === 'harbor') await touch('#find-home');
    else {
      if (!(await loc('#place-index').evaluate((el) => el.open)))
        await touch('#place-index summary');
      await touch('[data-inspect-place="' + to + '"]');
    }
  }
  await expect(loc('#local-context')).toHaveAttribute('data-location', to);
  await touch('#sail');
}
async function doAction(a, n, interrupt = false) {
  if (a.type === 'move') await sail(a.to);
  else await choose(a, interrupt);
  await turn(n);
}
async function settings() {
  await touch('#home-options');
  await mode('settings');
  for (const [id, value, label] of [
    ['motion-preference', 'reduced', 'Reduced'],
    ['tips-preference', 'on', 'On'],
  ]) {
    await touch('#' + id);
    await nativeOption(label);
    await expect(loc('#' + id)).toHaveValue(value);
  }
  await expect(loc('#settings-sound')).toHaveAttribute('data-playback', 'running', {
    timeout: 20000,
  });
  const audio = await page().evaluate(async () => {
    const a = window.__ferryReviewAudio;
    if (!a) throw Error('Missing audio output tap');
    let peak = 0,
      sum = 0,
      samples = 0;
    const values = new Float32Array(a.fftSize);
    for (let i = 0; i < 10; i++) {
      a.getFloatTimeDomainData(values);
      for (const value of values) {
        peak = Math.max(peak, Math.abs(value));
        sum += value * value;
        samples++;
      }
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    return {
      state: a.context.state,
      sampleRate: a.context.sampleRate,
      peak,
      rms: Math.sqrt(sum / samples),
    };
  });
  assert.ok(audio.peak > 0 && audio.state === 'running');
  report.audio = audio;
  await touch('#settings-sound');
  await expect(loc('#settings-sound')).toHaveAttribute('aria-pressed', 'false');
  await touch('#settings-sound');
  await expect(loc('#settings-sound')).toHaveAttribute('data-playback', 'running');
  await touch('#settings-back');
}
async function monitorAudio() {
  await page().evaluate(() => {
    const connect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (...args) {
      const result = Reflect.apply(connect, this, args);
      if (args[0] === this.context.destination && this instanceof AnalyserNode)
        window.__ferryReviewAudio = this;
      return result;
    };
  });
}
async function fresh() {
  await expect(loc('#home-play')).toHaveText('Play');
  assert.deepEqual(await data(page()), {});
  await page().waitForFunction(() => document.documentElement.dataset.lastFerryReady === 'true');
  report.renderer = await page().evaluate(() => {
    const canvas = document.querySelector('#world canvas'),
      gl = canvas.getContext('webgl2');
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      scene: [canvas.width, canvas.height],
      cssViewport: [innerWidth, innerHeight],
      density: devicePixelRatio,
      webgl: gl.getParameter(gl.VERSION),
      renderer: info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    };
  });
  report.firstOpen = {
    url: page().url(),
    userAgent: await page().evaluate(() => navigator.userAgent),
    storage: await data(page()),
  };
  await monitorAudio();
  await screen('01-offline-home');
  await settings();
  await touch('#home-play');
  for (const [i, label] of ['Next', 'Next', 'Take the helm'].entries()) {
    await expect(loc('#story-position')).toHaveText(i + 1 + ' of 3');
    await expect(loc('#story-continue')).toContainText(label);
    await pause(700);
    await touch('#story-continue');
  }
  await turn(0);
  await screen('02-holding-turn-zero');
  for (const [i, action] of held.entries()) {
    if (i === 7) beginMovie('holding-arrival');
    await doAction(action, i + 1, i === 3);
    if (i === 3 || i === 8) {
      if (i === 3) await screen('06-aboard-after-rise');
      else await screen('07-first-arrival');
      await touch(i === 8 ? '#terminal-undo' : '#undo');
      await turn(i);
      if (i === 3) await expect(loc('[data-testid=tide]')).toHaveText('0');
      await doAction(action, i + 1);
    }
  }
  await expect(loc('#mastery-result')).toHaveAttribute('data-lanterns', '2');
  await expect(loc('#mastery-result')).toHaveAttribute('data-undos', '2');
  await expect(loc('#arrival-cast img')).toHaveCount(3);
  assert.equal(
    await loc('#arrival-cast img').evaluateAll((imgs) =>
      imgs.every((x) => x.complete && x.naturalWidth),
    ),
    true,
  );
  await screen('08-earned-holding');
  finishMovie();
  await touch('#continue-story');
  await touch('#story-continue');
  await turn(0);
  await expect(loc('#seascape')).toHaveAttribute('aria-label', 'Bellwater Cove');
  await doAction({ type: 'move', to: 'shallows' }, 1);
  await screen('09-before-update');
  await page().evaluate(({ backup, archived }) => localStorage.setItem(backup, archived), {
    backup,
    archived,
  });
  report.preparedBackup =
    'Exact original-byte record from reviews/ternhaven-journey/gameplay/390x844/route.json#reloaded.journey; only this backup key was added as a fixture.';
  report.earned = await data(page());
  assert.deepEqual(JSON.parse(report.earned[key]).checkpoint, { kind: 'cove', id: 'bellwater' });
  assert.equal(JSON.parse(report.earned[best]).results['holding-pier@1'].lanterns, 2);
  assert.equal(report.earned['last-ferry-motion'], 'reduced');
  assert.equal(report.earned['last-ferry-tips'], 'true');
  assert.equal(report.earned[backup], archived);
  await pause(1500);
}
const savedEarn = () => JSON.parse(readFileSync(out + '/earn.json', 'utf8'));
async function update() {
  const before = savedEarn();
  assert.ok(before.passed);
  assert.deepEqual(await data(page()), before.earned);
  report.preInstall = packageInfo();
  report.preHashes = Object.fromEntries(Object.entries(before.earned).map(([k, v]) => [k, sha(v)]));
  await view.device.close();
  view = null;
  const apk = process.argv[3];
  assert.ok(apk, 'Pass the version-two debug APK path');
  report.replacement = {
    apkSHA256: sha(readFileSync(apk)),
    command: 'adb install -r',
    output: adb('install', '-r', apk),
  };
  assert.match(report.replacement.output, /Success/);
  report.postInstall = packageInfo();
  assert.ok(
    report.preInstall.firstInstallTime && (report.preInstall.userId ?? report.preInstall.appId),
    'Android package manager did not report install time and UID',
  );
  assert.equal(report.postInstall.firstInstallTime, report.preInstall.firstInstallTime);
  assert.ok(Number(report.postInstall.versionCode) > Number(report.preInstall.versionCode));
  assert.equal(
    report.postInstall.userId ?? report.postInstall.appId,
    report.preInstall.userId ?? report.preInstall.appId,
  );
  start();
  await attach();
  await expect(loc('#home-play')).toHaveText('Continue');
  assert.deepEqual(await data(page()), before.earned);
  await stopAndReopen();
  await expect(loc('#home-play')).toHaveText('Continue');
  assert.deepEqual(await data(page()), before.earned);
  await verifyAfterUpdate(before.earned, '');
}
async function verifyAfterUpdate(expected, suffix) {
  await expect(loc('#home-play')).toHaveText('Continue');
  await screen('10-updated-home' + suffix);
  await touch('#home-practice');
  await expect(loc('[data-practice]')).toHaveCount(13);
  await expect(loc('#practice-holding-pier .mastery-badge')).toHaveAccessibleName(
    /2 of 3 lanterns/,
  );
  await screen('11-updated-best' + suffix);
  shell('input', 'keyevent', 'KEYCODE_BACK');
  await expect(loc('#home-play')).toHaveText('Continue');
  await touch('#home-play');
  await turn(0);
  await expect(loc('#seascape')).toHaveAttribute('aria-label', 'Bellwater Cove');
  await screen('12-cold-bellwater' + suffix);
  report.restored = await data(page());
  assert.deepEqual(report.restored, expected);
  report.postHashes = Object.fromEntries(
    Object.entries(report.restored).map(([k, v]) => [k, sha(v)]),
  );
}
async function ending() {
  const earned = savedEarn().earned;
  assert.deepEqual(await data(page()), earned);
  const journey = JSON.parse(readFileSync('reviews/journey-home/play/voyage.json'));
  const ready = journey.checkpoints.find((c) => c.label === 'at the helm last-ferry').record;
  report.preparedCheckpoint =
    'reviews/journey-home/play/voyage.json, at the helm last-ferry; eleven rescues previously accepted';
  assert.equal(ready.completed.length, 11);
  await page().evaluate(({ key, ready }) => localStorage.setItem(key, JSON.stringify(ready)), {
    key,
    ready,
  });
  try {
    await page().reload();
    await expect(loc('.home-notice')).toContainText('Last Ferry');
    await touch('#home-play');
    await expect(loc('#seascape')).toHaveAttribute('aria-label', 'Last Ferry');
    await turn(0);
    for (const [i, action] of final.entries()) {
      if (i === 5) beginMovie('last-ferry-supper');
      await doAction(action, i + 1);
    }
    await expect(loc('.arrival-unrated')).toContainText('no lantern rating');
    await expect(loc('#arrival-cast img')).toHaveCount(4);
    await screen('13-last-arrival');
    await touch('#continue-story');
    await expect(loc('#story-caption')).toHaveText('We saved you a place.');
    await screen('14-supper');
    assert.deepEqual(JSON.parse((await data(page()))[key]).checkpoint, {
      kind: 'scene',
      id: 'a-place-for-the-captain',
    });
    await touch('#story-continue');
    await expect(loc('#dialog-title')).toHaveText('Credits');
    await screen('15-credits');
    await pause(900);
    finishMovie();
    const completed = await data(page());
    assert.deepEqual(JSON.parse(completed[key]).checkpoint, { kind: 'complete' });
    assert.equal(completed[best], earned[best]);
    report.ending = JSON.parse(completed[key]);
  } finally {
    await page().evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
      key,
      raw: earned[key],
    });
    await page().reload();
    await expect(loc('.home-notice')).toContainText('Bellwater');
    await pause(1800);
    await stopAndReopen();
    assert.deepEqual(await data(page()), earned);
  }
}
try {
  if (phase === 'earn') {
    const apk = process.argv[3];
    assert.ok(apk);
    assert.equal(
      shell('pm', 'list', 'packages', app),
      '',
      'Use a fresh disposable emulator for the initial install',
    );
    report.firstInstall = { sha256: sha(readFileSync(apk)), output: adb('install', apk) };
    assert.match(report.firstInstall.output, /Success/);
    start();
  }
  await attach();
  report.installed = packageInfo();
  if (phase === 'earn') await fresh();
  else if (phase === 'update') await update();
  else if (phase === 'after-update') {
    await stopAndReopen();
    await verifyAfterUpdate(savedEarn().earned, '-settled');
  } else await ending();
  report.resourceOrigins = await page().evaluate(() => [
    ...new Set(performance.getEntriesByType('resource').map((e) => new URL(e.name).origin)),
  ]);
  assert.ok(report.resourceOrigins.every((o) => o === origin || o === 'null'));
  assert.deepEqual(report.pageErrors, []);
  report.offlineAtEnd = bothOffline();
  report.passed = true;
} catch (e) {
  report.error = e.stack;
  process.exitCode = 1;
  console.error(report.error);
  try {
    await screen(phase + '-failure');
  } catch {}
} finally {
  if (recording) {
    try {
      finishMovie();
    } catch {}
  }
  json(phase + (report.passed ? '' : '-failure'), report);
  await view?.device.close();
}
