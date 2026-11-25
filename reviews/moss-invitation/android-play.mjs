import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect } from '@playwright/test';

process.env.FERRY_PLAY_OUT = 'reviews/moss-invitation';
const { app, adb, bothOffline, connect, data, json, out, packageInfo, pause, sha,
  shell, shot, stop, tap } = await import('../android-playtest/play/android.mjs');
const read = file => JSON.parse(readFileSync(file, 'utf8'));
const prior = read('reviews/journey-rewards/android-package.json');
const phase = process.argv[2];
const normal = read('data/experiments/holding-pier-solution.json').actions;
const requested = [
  ...normal.slice(0, 6), { type: 'move', to: 'harbor' },
  { type: 'unload', passengerIds: ['rabbit-1', 'rabbit-2'] },
  { type: 'move', to: 'stone' }, normal[6], normal[7], { type: 'unload', passengerIds: ['sheep-1'] },
];
const bellwaterActions = read('data/bellwater/witnesses.json').witnesses[0].actions;
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
  await pause(2200);
  await attach();
  await expect(loc('#home-play')).toBeVisible({timeout: 30000});
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
  shell('wm','user-rotation','lock',landscape ? '1' : '0');
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
      width: r.width, height: r.height,
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
  const panel = loc('#local-context');
  await pause(500);
  for (const selector of ['#map-' + to + ' .map-hit', '#map-' + to + ' .map-name b']) {
    const marker = loc(selector);
    if (!await marker.count()) continue;
    const exposed = await marker.evaluate(el => {
      const r = el.getBoundingClientRect();
      return !!r.width && !el.closest('.offscreen') && el.contains(document.elementFromPoint(r.x + r.width / 2,r.y + r.height / 2));
    });
    if (!exposed) continue;
    try { await touch(selector); }
    catch (e) {
      if (!String(e).includes('touch point is covered or disabled')) throw e;
      break;
    }
    await pause(350);
    if (await panel.isVisible() && await panel.getAttribute('data-location') === to) return;
  }
  await touch('#load-toggle');
  if (to === 'harbor') await touch('#find-home');
  else {
    if (!await loc('#place-index').evaluate(el => el.open)) await touch('#place-index summary');
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
    if (!await loc('#' + action.type).isVisible()) {
      const current = (await loc('[aria-current=location]').getAttribute('id')).slice(4);
      await inspect(current);
    }
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

async function baseline() {
  assert.equal(report.apkSHA256, prior.apkSHA256);
  assert.equal(report.package.versionCode,'5');
  await attach();
  await expect(loc('#home-play')).toHaveText('Continue');
  const inherited = await saves();
  assert.deepEqual(JSON.parse(inherited.web[journey]).checkpoint, {kind:'cove',id:'bellwater'});
  assert.deepEqual(JSON.parse(inherited.web[entries]).entries,['moss-own-crossing','rue-lantern']);
  await touch('#home-options');
  await loc('#motion-preference').selectOption('reduced');
  await touch('#settings-back');
  await touch('#home-play');
  await turn(0,'shipped v5 Bellwater');
  await route(bellwaterActions,'shipped v5 Bellwater');
  await touch('#continue-story');
  await expect(loc('#dialog-title')).toHaveText('A light at the yard');
  await cold();
  report.before = await saves();
  assert.deepEqual(JSON.parse(report.before.web[journey]).checkpoint,{kind:'scene',id:'driftwood-light'});
  const results = JSON.parse(report.before.web[best]).results;
  assert.equal(results['holding-pier@1'].lanterns,3);
  assert.equal(results['bellwater@1'].lanterns,3);
  await frame('v5-captain');
}

async function upgrade() {
  const before = read(out + '/android-v5.json').before;
  const next = read(out + '/android-package.json');
  assert.equal(report.apkSHA256,prior.apkSHA256);
  await attach();
  assert.deepEqual(await saves(),before);
  await view.device.close();
  view = null;
  const apk = resolve(process.argv[3]);
  assert.equal(sha(readFileSync(apk)),next.apkSHA256);
  report.install = adb('install','-r',apk);
  assert.match(report.install,/Success/);
  report.updatedPackage = packageInfo();
  report.updatedSHA256 = digest();
  assert.equal(report.updatedSHA256,next.apkSHA256);
  assert.equal(report.updatedPackage.versionCode,'6');
  assert.equal(report.updatedPackage.appId,report.package.appId);
  assert.equal(report.updatedPackage.firstInstallTime,report.package.firstInstallTime);
  await cold();
  report.after = await saves();
  assert.deepEqual(report.after,before);
  await frame('v6-captain');
  await touch('#home-play');
  await expect(loc('#dialog-title')).toHaveText('A light at the yard');
  await finishStory();
  await expect(loc('#seascape')).toHaveAttribute('aria-label','Driftwood Yard');
  await turn(0,'upgraded captain');
}

const wish = 'Leave me at Stone Pier. Take Pip and Rue home, then come back for me.';

async function openV6Home() {
  const release = read(out + '/android-package.json');
  assert.equal(report.apkSHA256, release.apkSHA256);
  assert.equal(report.package.versionCode,'6');
  report.source = release.apkSource;
  await attach();
  await expect(loc('#home-play')).toBeVisible();
}

async function card(name, kind, current) {
  const offers = kind !== 'moss';
  const onward = offers ? '#continue-story' : '#continue-journey';
  const title = { rue:'Rue’s Lantern', ordinary:'Everyone home.', moss:'Moss’s Own Crossing' }[kind];
  await expect(loc('#dialog-title')).toHaveText(title);
  await expect(loc(onward)).toHaveText('Continue to Bellwater');
  await expect(loc('.arrival-lantern-count')).toHaveText(new RegExp(current + '\\s*/\\s*3\\s+lanterns','i'));
  const controls = [onward, '#terminal-undo', '#arrival-details summary'];
  const content = ['#dialog-title','.arrival-lantern-count'];
  if (offers) {
    const invitation = loc('.arrival-invitation');
    await expect(invitation).toContainText(wish);
    await expect(invitation.locator('.arrival-page-reward')).toContainText('Earn a Harbor log page');
    await expect(invitation.locator('#take-moss-request')).toHaveText(
      kind === 'ordinary' ? 'Replay for Moss' : 'Replay Holding Pier for Moss');
    controls.push('#take-moss-request');
    content.push('#arrival-request-line','.arrival-page-reward');
  }
  const measurements = {};
  for (const selector of [...controls,...content]) {
    const measured = await target(selector);
    assert.ok(measured.safe && (!controls.includes(selector) || measured.exposed),
      name + ' ' + selector + ' ' + JSON.stringify(measured));
    measurements[selector] = measured;
  }
  const scroll = await loc('#dialog-content').evaluate(el => el.scrollTop);
  assert.equal(scroll,0);
  report.cards ??= {};
  report.cards[name] = { title, measurements, scroll,
    focus:await view.page.evaluate(()=>document.activeElement?.id) };
  await frame(name);
}

async function details(name) {
  await nativeTap('#arrival-details summary');
  await expect(loc('#arrival-details')).toHaveJSProperty('open',true);
  await expect(loc('#mastery-result')).toHaveAttribute('data-lanterns','1');
  await expect(loc('#mastery-best')).toContainText(/3 of 3 lanterns/);
  await loc('#mastery-best').scrollIntoViewIfNeeded();
  await frame(name);
  await touch('#arrival-details summary');
  await expect(loc('#arrival-details')).toHaveJSProperty('open',false);
}

async function bellwater(label) {
  await expect(loc('#dialog-title')).toHaveText('Another bell');
  await expect(loc('#story-continue')).toContainText('Bellwater',{timeout:15000});
  await pause(2200);
  await nativeTap('#story-continue');
  await expect(loc('#seascape')).toHaveAttribute('aria-label','Bellwater Cove');
  await turn(0,label);
  assert.deepEqual(JSON.parse((await saves()).native[journey]).checkpoint,{kind:'cove',id:'bellwater'});
}

async function direct() {
  await openV6Home();
  await expect(loc('#home-play')).toHaveText('Play');
  const empty = await saves();
  for (const key of [journey,best,entries]) assert.equal(empty.native[key],null);
  await orientation(false);
  await touch('#home-options');
  await loc('#motion-preference').selectOption('reduced');
  await touch('#settings-back');
  await touch('#home-play');
  await finishStory();
  await route(normal,'first Journey');
  await card('rue-portrait','rue',3);
  await orientation(true);
  await card('rue-landscape','rue',3);
  await nativeTap('#continue-story');
  await bellwater('direct to Bellwater');
  await cold();
  await touch('#home-practice');
  await expect(loc('#harbor-take-request')).toBeVisible();
  await expect(loc('#dialog')).toContainText(wish);
  report.after = await saves();
  assert.deepEqual(JSON.parse(report.after.native[entries]).entries,['rue-lantern']);
  await frame('request-in-log');
  await touch('#journey-title');
}

async function portrait() {
  await openV6Home();
  await orientation(false);
  const before = await saves();
  assert.deepEqual(before,read(out + '/android-direct.json').after);
  await touch('#home-practice');
  await touch('#harbor-take-request');
  await expect(loc('#objective')).toContainText(wish);
  await route(requested,'portrait separate trip');
  await card('moss-portrait','moss',1);
  await details('moss-details-portrait');
  await cold();
  assert.deepEqual(await saves(),before);
}

async function ordinary() {
  await openV6Home();
  assert.deepEqual(await saves(),read(out + '/android-direct.json').after);
  await orientation(false);
  await touch('#home-new');
  await touch('#journey-replace-confirm');
  await finishStory();
  await route(normal,'Journey with Rue already earned');
  await card('ordinary-portrait','ordinary',3);
  await orientation(true);
  await card('ordinary-landscape','ordinary',3);
}

async function recordInvite() {
  const release = read(out + '/android-package.json');
  assert.equal(report.apkSHA256, release.apkSHA256);
  report.source = release.apkSource;
  await attach();
  await expect(loc('#dialog-title')).toHaveText('Everyone home.');
  await expect(loc('.arrival-invitation')).toContainText(wish);
  assert.deepEqual(await view.page.evaluate(()=>[innerWidth,innerHeight]),[780,320]);
  const filename = 'android-offer-to-bellwater-source.mp4';
  const guest = '/data/local/tmp/moss-invitation.mp4';
  const touches = shell('settings','--user',report.deviceUser,'get','system','show_touches');
  shell('settings','--user',report.deviceUser,'put','system','show_touches','1');
  const recorder = spawn(process.env.ADB,['-s',process.env.ANDROID_SERIAL,'shell','screenrecord',
    '--size','1950x800','--bit-rate','4500000','--time-limit','180',guest],{windowsHide:true,stdio:'ignore'});
  const finished = new Promise((ok,fail)=>{recorder.once('exit',ok);recorder.once('error',fail);});
  const epoch = performance.now();
  const times = {};
  const mark = name => {times[name] = (performance.now() - epoch)/1000;};
  let pid;
  try {
    await expect.poll(()=>{try{return shell('pidof','screenrecord')}catch{return ''}}).toMatch(/^\d+$/);
    pid = shell('pidof','screenrecord');
    await pause(4200);
    mark('replayTap');
    await nativeTap('#take-moss-request');
    await turn(0,'filmed separate trip');
    await expect(loc('#objective')).toContainText(wish);
    if ((await loc('#view-toggle').innerText()).includes('Whole cove')) {
      await nativeTap('#view-toggle');
      await pause(800);
    }
    for (const [i,action] of requested.entries()) {
      await act(action,i+1,'filmed separate trip');
      if (i===7) mark('rabbitsHome');
    }
    await card('moss-landscape','moss',1);
    mark('mossPage');
    await pause(4000);
    mark('acceptTap');
    await nativeTap('#continue-journey');
    await bellwater('recorded Bellwater');
    mark('bellwater');
    await pause(1400);
  } finally {
    if (pid) shell('kill','-2',pid);
    await finished;
    if (touches === 'null') shell('settings','--user',report.deviceUser,'delete','system','show_touches');
    else shell('settings','--user',report.deviceUser,'put','system','show_touches',touches);
    const sourcePath = resolve(process.env.FERRY_MOVIE_OUT ?? '.cache/moss-invitation',filename);
    adb('pull',guest,sourcePath);
    const bytes = readFileSync(sourcePath);
    report.originalRecording = {filename,sha256:sha(bytes),bytes:bytes.length,times};
  }
  report.after = await saves();
  const accepted = JSON.parse(report.after.native[entries]);
  assert.deepEqual(accepted.entries,['moss-own-crossing','rue-lantern']);
  assert.equal(JSON.parse(report.after.native[best]).results['holding-pier@1'].lanterns,3);
  await cold();
  assert.deepEqual(await saves(),report.after);
}

try {
  if (phase === 'v5') await baseline();
  else if (phase === 'upgrade') await upgrade();
  else if (phase === 'direct') await direct();
  else if (phase === 'portrait') await portrait();
  else if (phase === 'ordinary') await ordinary();
  else if (phase === 'film') await recordInvite();
  else throw Error('Unknown phase ' + phase);
  assert.deepEqual(report.pageErrors,[]);
  report.passed = true;
} catch (error) {
  report.failure = String(error);
  throw error;
} finally {
  json('android-' + phase,report);
  await view?.device.close();
}
