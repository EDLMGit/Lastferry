import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect } from '@playwright/test';

process.env.FERRY_PLAY_OUT ??= 'reviews/journey-rewards';
const { app, origin, adb, bothOffline, connect, data, json, out, packageInfo, pause, sha,
  shell, shot, stop, tap } = await import('../android-playtest/play/android.mjs');
const read = file => JSON.parse(readFileSync(file, 'utf8'));
const prior = read('reviews/harbor-log/android-package.json');
const phase = process.argv[2];
const normal = read('data/experiments/holding-pier-solution.json').actions;
const requested = [
  ...normal.slice(0, 6), { type: 'move', to: 'harbor' },
  { type: 'unload', passengerIds: ['rabbit-1', 'rabbit-2'] },
  { type: 'move', to: 'stone' }, normal[6], normal[7], { type: 'unload', passengerIds: ['sheep-1'] },
];
const bellwater = read('data/bellwater/witnesses.json').witnesses[0].actions;
const journey = 'last-ferry.journey.v1', best = 'last-ferry.mastery.v1', entries = 'last-ferry.harbor-log.v1';
const digest = () => shell('sha256sum', shell('pm', 'path', app).replace(/^package:/, '')).split(/\s/)[0];
const report = { phase, deviceUser: shell('am', 'get-current-user'), package: packageInfo(),
  apkSHA256: digest(), offline: bothOffline(), frames: [], turns: [], taps: [], pageErrors: [] };
let view;
const loc = css => view.page.locator(css);
const touch = css => tap(view, css);
async function attach() {
  view = await connect();
  view.page.setDefaultTimeout(15000);
  view.page.on('pageerror', e => report.pageErrors.push(e.message));
  await view.page.waitForFunction(() => document.documentElement.dataset.lastFerryReady === 'true',
    undefined, { timeout: 30000 });
}
async function cold() {
  await view?.device.close();
  stop();
  const activeUser = shell('am','get-current-user');
  shell('am','start','--user',activeUser,'-a','android.intent.action.MAIN','-c',
    'android.intent.category.LAUNCHER','-f','0x10200000','-n',app + '/.MainActivity');
  await attach();
  await expect(loc('#home-play')).toBeVisible({timeout: 30000});
}
async function switchUser(id) {
  await view?.device.close();
  view = null;
  stop();
  shell('am','switch-user',id);
  await expect.poll(() => shell('dumpsys','activity','users'),{timeout:40000})
    .toMatch(new RegExp('mCurrentUserId:' + id + '\\s+mTargetUserId:-10000'));
  await expect.poll(() => shell('am','get-started-user-state',id),{timeout:40000}).toBe('RUNNING_UNLOCKED');
  assert.equal(shell('am','get-current-user'),id);
  shell('wm','dismiss-keyguard');
  await cold();
}
async function saves() {
  return {
    web: await data(view.page),
    native: await view.page.evaluate(keys => Object.fromEntries(
      keys.map(k => [k, window.lastFerrySaves.read(k) ?? null])), [journey, best, entries]),
  };
}
async function orientation(landscape) {
  shell('wm', 'size', landscape ? '800x1950' : '800x1850');
  shell('settings', '--user', report.deviceUser, 'put', 'system', 'accelerometer_rotation', '0');
  shell('settings', '--user', report.deviceUser, 'put', 'system', 'user_rotation', landscape ? '1' : '0');
  const expected = landscape ? [780,320] : [320,740];
  await view.page.waitForFunction(([w,h]) => innerWidth === w && innerHeight === h, expected);
  await pause(450);
}
async function frame(name) {
  await view.page.evaluate(() => document.fonts.ready);
  const viewport = await view.page.evaluate(() => [innerWidth, innerHeight, devicePixelRatio]);
  report.frames.push({ ...shot('android-' + name), viewport });
  console.log('Captured', name);
}
async function target(css) {
  const btn = loc(css);
  await expect(btn).toBeEnabled();
  return btn.evaluate(el => {
    const r = el.getBoundingClientRect(), x = r.x + r.width / 2, y = r.y + r.height / 2;
    const safe = window.lastFerryAndroidInsets;
    return { x: Math.round(x * devicePixelRatio), y: Math.round(y * devicePixelRatio),
      exposed: el.contains(document.elementFromPoint(x,y)), label: el.innerText,
      safe: r.left * devicePixelRatio >= safe.left - 1 && r.top * devicePixelRatio >= safe.top - 1 &&
        r.right * devicePixelRatio <= innerWidth * devicePixelRatio - safe.right + 1 &&
        r.bottom * devicePixelRatio <= innerHeight * devicePixelRatio - safe.bottom + 1 };
  });
}
async function nativeTap(css) {
  const point = await target(css);
  assert.ok(point.exposed && point.safe, css + ' ' + JSON.stringify(point));
  // A brief stationary Android touch also shows the system touch indicator in the movie.
  shell('input', 'swipe', String(point.x), String(point.y), String(point.x), String(point.y), '110');
  report.taps.push({css, ...point});
}
async function turn(n, run) {
  await expect(loc('#seascape')).toHaveAttribute('aria-busy','false',{ timeout: 30000 });
  await expect(loc('[data-testid=turn]')).toHaveText(String(n).padStart(2,'0'),{ timeout: 15000 });
  report.turns.push({ run, turn:n, location: await loc('[aria-current=location]').getAttribute('id'),
    passengers: await loc('#load-toggle').getAttribute('aria-label') });
  console.log(run, n);
}
async function inspect(to) {
  for (const selector of ['#map-' + to + ' .map-hit', '#map-' + to + ' .map-name b']) {
    if (await loc(selector).count() && await loc(selector).evaluate(el => {
      const r = el.getBoundingClientRect();
      return !!r.width && !el.closest('.offscreen') && el.contains(document.elementFromPoint(
        r.x + r.width / 2, r.y + r.height / 2));
    })) {
      await touch(selector);
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
async function act(action, n, run, physical = false) {
  const press = physical ? nativeTap : touch;
  if (action.type === 'move') {
    await inspect(action.to);
    await expect(loc('#local-context')).toHaveAttribute('data-location', action.to);
    await pause(350);
    await nativeTap('#sail');
  } else {
    if (!await loc('#' + action.type).isVisible()) await touch('[aria-current=location] .map-hit');
    await press('#' + action.type);
    if (await loc('#dialog[open][data-mode=action]').count()) {
      const options = await loc('.passenger-options button').evaluateAll(all => all.map(el => el.id));
      for (const id of options) {
        const selected = (await loc('#' + id).getAttribute('aria-pressed')) === 'true';
        if (selected !== action.passengerIds.includes(id.slice('passenger-'.length))) await press('#' + id);
      }
      await press('#commit');
    }
  }
  await turn(n,run);
}
async function route(actions, run) {
  for (const [i,a] of actions.entries()) await act(a,i+1,run);
}
async function finishStory() {
  await expect(loc('#story-continue')).toBeVisible();
  for(let i=0; i<6 && await loc('#story-continue').isVisible(); i++) {
    await touch('#story-continue');
    await pause(250);
  }
  await expect(loc('#story-continue')).toBeHidden();
}
async function oldCaptain() {
  assert.equal(report.apkSHA256, prior.apkSHA256);
  const earnedTrace = read(process.env.FERRY_V4_EARNED ?? '.cache/journey-rewards/earned-on-v4/android-play.json');
  assert(earnedTrace.passed && earnedTrace.apkSHA256 === prior.apkSHA256);
  report.earningTrace = { source:earnedTrace.source, turns:earnedTrace.turns,
    nativeRecords:earnedTrace.committedRecords, coldCheckpoint:earnedTrace.finalCheckpoint };
  await cold();
  const earned = await saves();
  assert.deepEqual(JSON.parse(earned.native[entries]).entries,['moss-own-crossing','rue-lantern']);
  assert.equal(JSON.parse(earned.native[best]).results['holding-pier@1'].lanterns,3);
  await touch('#home-options');
  await loc('#motion-preference').selectOption('reduced');
  await expect(loc('#motion-preference')).toHaveValue('reduced');
  await touch('#settings-back');
  await touch('#home-play');
  await expect(loc('#seascape')).toHaveAttribute('aria-label','Bellwater Cove');
  await route(bellwater,'Bellwater on v0.1.4');
  await touch('#continue-story');
  await expect(loc('#dialog[open]')).toHaveAttribute('data-mode','story');
  await cold();
  report.before = await saves();
  assert.deepEqual(JSON.parse(report.before.web[journey]).checkpoint,{kind:'scene',id:'driftwood-light'});
  await touch('#home-practice');
  await expect(loc('#harbor-moss-page')).toHaveAttribute('data-earned','true');
  await frame('v4-captain');
}
async function upgrade() {
  const baseline = read(out + '/android-v4.json');
  const receipt = read(out + '/android-package.json');
  assert.equal(report.apkSHA256, prior.apkSHA256);
  await cold();
  assert.deepEqual(await saves(), baseline.before);
  await switchUser('0');
  report.originalOwner = await saves();
  assert.deepEqual(report.originalOwner.web,read('reviews/android-playtest/play/earn.json').earned);
  await switchUser(report.deviceUser);
  assert.deepEqual(await saves(),baseline.before);
  await view.device.close();
  view = null;
  const path = resolve(process.argv[3]);
  assert.equal(sha(readFileSync(path)),receipt.apkSHA256);
  report.install = adb('install','-r',path);
  assert.match(report.install,/Success/);
  report.updated = packageInfo();
  assert.equal(report.updated.versionCode,'5');
  assert.equal(report.updated.firstInstallTime, report.package.firstInstallTime);
  assert(report.updated.appId && report.updated.appId === report.package.appId);
  assert.equal(digest(),receipt.apkSHA256);
  report.updatedSHA256 = receipt.apkSHA256;
  await cold();
  report.after = await saves();
  assert.deepEqual(report.after,baseline.before);
  await touch('#home-practice');
  await expect(loc('#harbor-moss-page')).toHaveAttribute('data-earned','true');
  await frame('upgraded-log');
  await switchUser('0');
  assert.deepEqual(await saves(),report.originalOwner);
  report.originalOwnerUnchanged = true;
  await switchUser(report.deviceUser);
}

function finalPackage() {
  const receipt = read(out + '/android-package.json');
  assert.equal(report.apkSHA256,receipt.apkSHA256);
  assert.equal(report.package.versionCode,'5');
  report.source = receipt.apkSource;
}
async function card(name, primary, secondary) {
  const controls = secondary ? [primary,secondary,'#terminal-undo','#arrival-details summary'] :
    [primary,'#terminal-undo','#arrival-details summary'];
  const targets = {};
  for (const selector of controls) {
    const point = await target(selector);
    assert.ok(point.safe && point.exposed, name + ' ' + selector + ' ' + JSON.stringify(point));
    targets[selector] = point;
  }
  report.cards ??= {};
  report.cards[name] = { title: await loc('#dialog-title').innerText(), controls: targets,
    scroll: await loc('#dialog-content').evaluate(el => el.scrollTop) };
  assert.equal(report.cards[name].scroll,0);
  await pause(450);
  await frame(name);
}
async function pairedCard(name, primary, secondary) {
  await card(name + '-portrait',primary,secondary);
  await orientation(true);
  await card(name + '-landscape',primary,secondary);
  await orientation(false);
}
async function film(deliver) {
  const guest = '/data/local/tmp/journey-rewards-finish.mp4';
  const filename = 'android-moss-to-bellwater.mp4';
  const oldTouches = shell('settings','--user',report.deviceUser,'get','system','show_touches');
  shell('settings','--user',report.deviceUser,'put','system','show_touches','1');
  const recorder = spawn(process.env.ADB,['-s',process.env.ANDROID_SERIAL,'shell','screenrecord',
    '--size','800x1850','--bit-rate','3500000','--time-limit','100',guest],
    { windowsHide:true, stdio:'ignore' });
  const finished = new Promise((ok,fail) => { recorder.once('exit', ok); recorder.once('error', fail); });
  let pid;
  try {
    await expect.poll(() => {
      try { return shell('pidof','screenrecord'); } catch { return ''; }
    }).toMatch(/^\d+$/);
    pid = shell('pidof','screenrecord');
    await pause(900);
    await deliver();
    await pause(1500);
  } finally {
    if (pid) shell('kill','-2',pid);
    await finished;
    if (oldTouches === 'null') shell('settings','--user',report.deviceUser,'delete','system','show_touches');
    else shell('settings','--user',report.deviceUser,'put','system','show_touches',oldTouches);
    adb('pull',guest,resolve(out,filename));
    const clip = readFileSync(resolve(out,filename));
    assert(clip.length > 20000);
    report.recording = {file:filename, bytes:clip.length, sha256:sha(clip),
      source:'uninterrupted Android screenrecord with system touch indicators', audio:false};
  }
}
async function fresh() {
  finalPackage();
  await cold();
  await orientation(false);
  const empty = await saves();
  for(const key of [journey,best,entries]) assert.equal(empty.web[key],undefined);
  await view.page.goto(origin + '/index.html?cove=last-ferry');
  await expect(loc('#home-play')).toHaveText('Play');
  assert.deepEqual(await saves(),empty);
  await touch('#home-practice');
  await expect(loc('[data-practice]')).toHaveCount(0);
  await expect(loc('#harbor-take-request')).toHaveCount(0);
  await expect(loc('#dialog')).not.toContainText(/practice/i);
  await frame('fresh-log');
  await touch('#journey-title');
  await touch('#home-play');
  await finishStory();
  await turn(0,'first Journey');
  await touch('#menu');
  await expect(loc('#cove-picker')).toHaveCount(0);
  await touch('#cancel');
  await route(normal,'first Journey');
  await expect(loc('#dialog-title')).toHaveText('Rue’s Lantern');
  await expect(loc('#continue-story')).toHaveText('Continue to Bellwater');
  await pairedCard('rue','#continue-story','#take-moss-request');
  await nativeTap('#take-moss-request');
  await turn(0,'Moss request');
  const accepted = await saves();
  report.firstAcceptance = accepted;
  assert.deepEqual(JSON.parse(accepted.web[journey]).checkpoint,{kind:'scene',id:'another-bell'});
  assert.equal(JSON.parse(accepted.web[best]).results['holding-pier@1'].lanterns,3);
  await route(requested,'Moss request');
  await expect(loc('#dialog-title')).toHaveText('Moss’s Own Crossing');
  await expect(loc('#continue-journey')).toHaveText('Continue to Bellwater');
  await pairedCard('moss','#continue-journey');
  assert.deepEqual(await saves(),accepted);
  await touch('#arrival-details summary');
  await expect(loc('#arrival-details')).toHaveJSProperty('open',true);
  assert.deepEqual(await saves(),accepted);
  await touch('#arrival-details summary');
  await touch('#terminal-undo');
  await turn(11,'terminal Undo');
  assert.deepEqual(await saves(),accepted);
  await film(async () => {
    await act(requested.at(-1),12,'recorded final delivery',true);
    await expect(loc('#dialog-title')).toHaveText('Moss’s Own Crossing');
    await expect(loc('#continue-journey')).toBeEnabled();
    await pause(1700);
    await nativeTap('#continue-journey');
    await expect(loc('#dialog[open]')).toHaveAttribute('data-mode','story');
    await expect(loc('#dialog-title')).toHaveText(/Another bell/i);
    await expect(loc('#story-continue')).toContainText('Bellwater',{timeout:15000});
    await pause(2200);
    await nativeTap('#story-continue');
    await expect(loc('#seascape')).toHaveAttribute('aria-label','Bellwater Cove');
    await turn(0,'recorded Bellwater');
  });
  const atBellwater = await saves();
  assert.deepEqual(JSON.parse(atBellwater.web[journey]).checkpoint,{kind:'cove',id:'bellwater'});
  assert.deepEqual(JSON.parse(atBellwater.web[entries]).entries,['moss-own-crossing','rue-lantern']);
  assert.equal(atBellwater.web[best],accepted.web[best]);
  await cold();
  report.cold = await saves();
  assert.deepEqual(report.cold,atBellwater);
  await touch('#home-practice');
  await expect(loc('#harbor-moss-page')).toHaveAttribute('data-earned','true');
  await expect(loc('#practice-last-ferry')).toHaveCount(0);
  await frame('cold-earned-log');
  await touch('#harbor-replay-holding');
  await expect(loc('#seascape')).toHaveAttribute('aria-label','The Holding Pier');
  await turn(0,'earned revisit from log');
}
async function later() {
  finalPackage();
  if (process.argv.includes('--open-home')) {
    await attach();
    await expect(loc('#home-play')).toBeVisible();
  } else await cold();
  const before = await saves();
  assert.deepEqual(before,read(out + '/android-v4.json').before);
  await touch('#home-practice');
  await touch('#harbor-take-request');
  await route(normal,'later captain misses request');
  await expect(loc('#retry-moss-request')).toBeVisible();
  await expect(loc('#continue-journey')).toContainText(/Driftwood/);
  await frame('missed-request');
  await touch('#retry-moss-request');
  await turn(0,'request retry');
  await route(requested,'later captain repeats request');
  assert.notEqual(await loc('#dialog-title').innerText(),'Moss’s Own Crossing');
  await expect(loc('#continue-journey')).toContainText(/Driftwood/);
  await frame('repeat-ordinary');
  await nativeTap('#continue-journey');
  await expect(loc('#dialog[open]')).toHaveAttribute('data-mode','story');
  const sceneCheckpoint = JSON.parse((await saves()).web[journey]).checkpoint;
  assert.deepEqual(sceneCheckpoint,{kind:'scene',id:'driftwood-light'});
  await finishStory();
  await expect(loc('#seascape')).toHaveAttribute('aria-label','Driftwood Yard');
  await turn(0,'later captain resumes Driftwood');
  report.after = await saves();
  assert.equal(report.after.web[best],before.web[best]);
  assert.equal(report.after.web[entries],before.web[entries]);
}
try {
  if (phase === 'v4') await oldCaptain();
  else if (phase === 'upgrade') await upgrade();
  else if (phase === 'fresh') await fresh();
  else if (phase === 'later') await later();
  else throw Error('Unknown phase ' + phase);
  assert.deepEqual(report.pageErrors,[]);
  report.passed = true;
} catch (error) {
  report.failure = String(error);
  throw error;
} finally {
  json('android-' + phase, report);
  await view?.device.close();
}
