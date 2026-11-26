import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { setTimeout as pause } from 'node:timers/promises';

const output = '.cache/iphone-safari';
const origin = 'http://127.0.0.1:4173';
const udid = process.env.IPHONE_UDID;
const witness = JSON.parse(readFileSync('data/experiments/holding-pier-solution.json', 'utf8'));
const report = { source: process.env.GITHUB_SHA, udid, turns: [], taps: [] };
const elementKey = 'element-6066-11e4-a52e-4f735466cecf';
let session = '';

async function command(path, body, method = body === undefined ? 'GET' : 'POST') {
  const response = await fetch('http://127.0.0.1:4445' + path, {
    method, headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(90000),
  });
  const { value } = await response.json();
  if (!response.ok || value?.error) throw Error(path + ' ' + JSON.stringify(value));
  return value;
}

function inspect(script, ...args) {
  return command(session + '/execute/sync', { script, args });
}

async function until(description, probe) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const observed = await probe();
    if (observed) return observed;
    await pause(250);
  }
  throw Error('Timed out waiting for ' + description);
}

async function tap(selector) {
  const el = await until(selector, () => inspect(`
    const e = document.querySelector(arguments[0]);
    return e && !e.disabled && !e.closest('[inert]') && e.getClientRects().length ? e : null;
  `, selector));
  await command(session + '/element/' + el[elementKey] + '/click', {});
  report.taps.push(selector);
  await pause(350);
}

function screenshot(name) {
  execFileSync('xcrun', ['simctl', 'io', udid, 'screenshot', output + '/' + name + '.png']);
}

async function selectPlace(place) {
  await tap('#load-toggle');
  if (place === 'harbor') {
    await tap('#find-home');
  } else {
    if (!await inspect("return document.querySelector('#place-index').open")) await tap('#place-index summary');
    await tap('[data-inspect-place="' + place + '"]');
  }
  await until('place ' + place, () => inspect("return document.querySelector('#local-context').dataset.location === arguments[0]", place));
}

async function crossingAction(action, turn) {
  if (action.type === 'move') {
    await selectPlace(action.to);
    await tap('#sail');
  } else {
    const id = '#' + action.type;
    if (!await inspect('return !!document.querySelector(arguments[0])?.getClientRects().length', id)) {
      const current = await inspect("return document.querySelector('.map-target[aria-current=location]').id.slice(4)");
      await selectPlace(current);
    }
    await tap(id);
    if (await inspect('return !!document.querySelector("#dialog[open][data-mode=action]")')) {
      const choices = await inspect("return [...document.querySelectorAll('.passenger-options button')].map(e => [e.id, e.getAttribute('aria-pressed') === 'true'])");
      for (const [button, selected] of choices) {
        if (selected !== action.passengerIds.includes(button.slice('passenger-'.length))) await tap('#' + button);
      }
      await tap('#commit');
    }
  }
  await until('committed turn ' + turn, () => inspect(`
    return document.querySelector('#seascape').getAttribute('aria-busy') === 'false'
      && Number(document.querySelector('[data-testid=turn]').textContent) === arguments[0];
  `, turn));
  report.turns.push(turn);
  console.log('Holding Pier turn', turn);
}

async function finishScene() {
  await tap('#story-more summary');
  await tap('#story-skip');
  await tap('#story-continue');
}

try {
  await until('Safari driver', async () => {
    try { return (await fetch('http://127.0.0.1:4445/status')).ok; } catch { return false; }
  });
  const created = await command('/session', { capabilities: { alwaysMatch: {
    browserName: 'Safari', platformName: 'iOS', 'safari:useSimulator': true, 'safari:deviceUDID': udid,
  } } });
  session = '/session/' + created.sessionId;
  report.capabilities = created.capabilities;
  assert.equal(created.capabilities.platformName.toLowerCase(), 'ios');
  await command(session + '/url', { url: origin });
  await until('Home', () => inspect("return document.querySelector('#home-play')?.textContent === 'Play'"));
  report.home = await inspect(`
    const canvas = document.querySelector('#world canvas'), gl = canvas.getContext('webgl2');
    return {userAgent:navigator.userAgent, maxTouchPoints:navigator.maxTouchPoints, gl:gl?.getParameter(gl.VERSION),
      contextLost:gl?.isContextLost(), canvas:[canvas.width,canvas.height],
      viewport:[visualViewport.width,visualViewport.height,visualViewport.scale], qa:('__LAST_FERRY__' in window)};
  `);
  assert.match(report.home.userAgent, /iPhone/);
  assert.match(report.home.gl, /WebGL 2/);
  assert.ok(report.home.maxTouchPoints > 0 && !report.home.contextLost && !report.home.qa);
  screenshot('home');
  await tap('#home-play');
  await finishScene();
  for (const [index, action] of witness.actions.entries()) await crossingAction(action, index + 1);
  assert.equal(await inspect("return document.querySelector('#dialog-title').textContent"), 'Rue’s Lantern');
  assert.equal(await inspect("return document.querySelector('.arrival-lantern-count').textContent.trim()"), '3/3 lanterns');
  screenshot('rue');
  await tap('#continue-story');
  await finishScene();
  await command(session + '/refresh', {});
  await until('saved Home', () => inspect("return document.querySelector('#home-play')?.textContent === 'Continue'"));
  await tap('#home-practice');
  assert.match(await inspect("return document.querySelector('#harbor-lantern-page').textContent"), /Rue’s Lantern/);
  assert.match(await inspect("return document.querySelector('#harbor-lantern-page .mastery-badge').getAttribute('aria-label')"), /3 of 3 lanterns/);
  await tap('#journey-title');
  await tap('#home-play');
  await until('saved Bellwater', () => inspect("return document.querySelector('#seascape')?.getAttribute('aria-label') === 'Bellwater Cove' && document.querySelector('[data-testid=turn]')?.textContent === '00'"));
  screenshot('restored-bellwater');
  report.passed = true;
} catch (error) {
  report.failure = String(error);
  if (session) {
    try { report.screen = await inspect('return document.body.innerText.slice(0, 2500)'); } catch {}
  }
  try { screenshot('failure'); } catch {}
  throw error;
} finally {
  writeFileSync(output + '/result.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
  if (session) await command(session, undefined, 'DELETE').catch(() => {});
}
