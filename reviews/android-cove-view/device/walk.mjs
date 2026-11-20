import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { expect } from '@playwright/test';
import {
  adb,
  pause,
  shell,
  nativeOption,
  data,
  shot,
} from '../../android-playtest/play/android.mjs';

async function motion(h, reduced) {
  await h.touch('#home-options');
  await h.touch('#motion-preference');
  await nativeOption(reduced ? 'Reduced' : 'Follow device');
  await expect(h.loc('#motion-preference')).toHaveValue(reduced ? 'reduced' : 'device');
  await h.touch('#settings-back');
}

async function instrumentMatrices(v) {
  const proto = await v.cdp.send('Runtime.evaluate', { expression: 'WebGLProgram.prototype' });
  const list = await v.cdp.send('Runtime.queryObjects', {
    prototypeObjectId: proto.result.objectId,
  });
  const result = await v.cdp.send('Runtime.callFunctionOn', {
    objectId: list.objects.objectId,
    functionDeclaration: function () {
      const canvas = document.querySelector('#world canvas'),
        gl = canvas.getContext('webgl2');
      const available = this.filter((p) => gl.isProgram(p))
        .map((p) => [
          p,
          gl.getUniformLocation(p, 'projectionMatrix'),
          gl.getUniformLocation(p, 'viewMatrix'),
        ])
        .filter((row) => row[1] && row[2]);
      window.coveReviewProjection = () => {
        const current = gl.getParameter(gl.CURRENT_PROGRAM);
        const camera = current && gl.getUniformLocation(current, 'projectionMatrix');
        if (!camera) return null;
        const projection = gl.getUniform(current, camera);
        const match = available.find(
          ([p, loc]) =>
            gl.isProgram(p) && gl.getUniform(p, loc).every((n, i) => n === projection[i]),
        );
        if (!match) return null;
        const view = gl.getUniform(match[0], match[2]);
        const multiply = (m, v) =>
          [0, 1, 2, 3].map((row) => v.reduce((sum, n, col) => sum + n * m[col * 4 + row], 0));
        const point = multiply(projection, multiply(view, [-6.15, 1, -3.25, 1]));
        const r = canvas.getBoundingClientRect();
        return {
          x: r.left + ((point[0] / point[3] + 1) * r.width) / 2,
          y: r.top + ((1 - point[1] / point[3]) * r.height) / 2,
          scale: projection[0],
          busy: document.querySelector('#seascape').getAttribute('aria-busy') === 'true',
          t: performance.now(),
        };
      };
      return { registered: available.length };
    }.toString(),
    returnByValue: true,
  });
  assert(result.result.value.registered > 0);
}
async function point(v) {
  for (let i = 0; i < 20; i++) {
    const p = await v.page.evaluate(() => window.coveReviewProjection());
    if (p) return p;
    await pause(80);
  }
  throw Error('No matching scene view/projection uniforms');
}
async function drag(v) {
  const from = await v.page.evaluate(() => {
    const canvas = document.querySelector('#world canvas');
    for (const dy of [0.85, 0.78, 0.64, 0.55])
      for (const dx of [0.53, 0.6, 0.46, 0.7]) {
        const x = innerWidth * dx,
          y = innerHeight * dy;
        if (
          document.elementFromPoint(x, y) === canvas &&
          document.elementFromPoint(x + 36, y - 14) === canvas
        )
          return { x, y };
      }
    throw Error('No open water for dragging');
  });
  const dispatch = (type, x, y) =>
    v.cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' ? [] : [{ x, y, radiusX: 4, radiusY: 4, force: 1 }],
    });
  await dispatch('touchStart', from.x, from.y);
  for (let i = 1; i <= 8; i++) {
    await dispatch('touchMove', from.x + i * 4.5, from.y - i * 1.75);
    await pause(45);
  }
  await dispatch('touchEnd');
  await pause(240);
  return { from, to: { x: from.x + 36, y: from.y - 14 } };
}
function maximumError(samples, first) {
  return Math.max(...samples.map((s) => Math.hypot(s.x - first.x, s.y - first.y)));
}
async function passage(h, to, n, name) {
  const v = h.get(),
    start = await point(v);
  const target = await h.inspect(to);
  const inspected = await point(v);
  const samples = [];
  let collecting = true;
  const collect = (async () => {
    while (collecting) {
      samples.push(await point(v));
      await pause(70);
    }
  })();
  try {
    await h.touch('#sail');
    await h.turn(n);
    await pause(350);
  } finally {
    collecting = false;
    await collect;
  }
  const docked = await point(v);
  await h.touch('#undo');
  await h.turn(n - 1);
  await pause(350);
  const undone = await point(v);
  const observed = [inspected, ...samples, docked, undone];
  const result = {
    name,
    to,
    target,
    start,
    inspected,
    samples,
    docked,
    undone,
    maxDisplacementCSS: maximumError(observed, start),
  };
  h.report.passages.push(result);
  assert.equal(target, 'map target', 'Need an already visible destination for this check');
  assert(
    samples.some((s) => s.busy),
    'No motion sample taken',
  );
  if (h.report.phase === 'camera-before') return result;
  assert(result.maxDisplacementCSS < 0.7, JSON.stringify(result));
  assert(
    observed.every((p) => Math.abs(p.scale - start.scale) < 0.00001),
    'Scale changed during the passage',
  );
  return result;
}
export async function camera(h) {
  h.rotate(1);
  await h.cold();
  await motion(h, false);
  try {
    await h.practice();
    await h.act(h.witness[0], 1);
    const v = h.get();
    await instrumentMatrices(v);
    const start = await point(v);
    const guest = '/data/local/tmp/ferry-cove-pan-sail-undo.mp4';
    const clip = resolve(
      process.env.FERRY_PLAY_OUT ?? 'reviews/android-cove-view/device',
      'pan-sail-undo.mp4',
    );
    const recorder = spawn(
      process.env.ADB,
      [
        '-s',
        process.env.ANDROID_SERIAL,
        'shell',
        'screenrecord',
        '--size',
        '1024x478',
        '--bit-rate',
        '2500000',
        '--time-limit',
        '180',
        guest,
      ],
      { windowsHide: true, stdio: 'ignore' },
    );
    const finished = new Promise((resolve) => recorder.once('exit', resolve));
    await expect
      .poll(() => {
        try {
          return shell('pidof', 'screenrecord');
        } catch {
          return '';
        }
      })
      .toMatch(/^\d+$/);
    h.report.recording = {
      file: 'pan-sail-undo.mp4',
      device: 'Android native screenrecord',
      audio: false,
    };
    try {
      await pause(450);
      await h.touch('#view-zoom');
      await h.touch('#zoom-out');
      if (
        (await h.loc('#view-toggle').getAttribute('aria-pressed')) === 'true' ||
        (await h.loc('#zoom-level').textContent()) === 'Normal'
      ) {
        await h.touch('#zoom-in');
        if ((await h.loc('#zoom-level').textContent()) === 'Normal') await h.touch('#zoom-in');
      }
      await h.touch('#view-zoom');
      await pause(450);
      const zoomed = await point(v);
      assert(Math.abs(zoomed.scale - start.scale) > 0.0001, 'Zoom did not change');
      const gesture = await drag(v);
      const panned = await point(v);
      assert(maximumError([panned], zoomed) > 3, 'Drag did not change camera');
      h.report.chosen = { start, zoomed, panned, gesture };
      h.report.passages = [];
      await passage(h, 'shallows', 2, 'Stone Pier to Shallows');
      await pause(1100);
    } finally {
      const pid = shell('pidof', 'screenrecord');
      assert(/^\d+$/.test(pid));
      const running = shell('cat', '/proc/' + pid + '/cmdline');
      assert(running.includes(guest));
      shell('kill', '-2', pid);
      await finished;
      adb('pull', guest, clip);
    }
    for (let i = 1; i <= 6; i++) await h.act(h.witness[i], i + 1);
    await h.touch('#back-to-boat');
    await h.inspect('harbor');
    await h.touch('#close-location');
    await h.settled();
    await passage(h, 'harbor', 8, 'Stone Pier to Harbor');
    await h.touch('#view-toggle');
    await expect(h.loc('#view-toggle')).toHaveAttribute('aria-pressed', 'true');
    await h.touch('#back-to-boat');
    await expect(h.loc('#view-toggle')).toHaveAttribute('aria-pressed', 'false');
    await h.turn(7);
  } finally {
    await h.relaunch();
    await motion(h, true);
    assert.deepEqual(await data(h.get().page), h.original);
  }
}
function assertSafe(measurement, violations, name) {
  const { web, window, webView, canvas } = measurement;
  assert.deepEqual(webView, window);
  assert(
    canvas.every((p, i) => Math.abs(p - window[i]) <= 2),
    'World did not fill window',
  );
  const ins = web.nativeInsets;
  assert(ins && Object.values(ins).some((n) => n > 0));
  const controls = web.interactiveCSS.filter((c) => c.id);
  for (const { id, bounds } of controls) {
    const physical = bounds.map((p) => p * web.dpr);
    if (!(
      physical[0] >= ins.left - 2 &&
      physical[1] >= ins.top - 2 &&
      physical[2] <= window[2] - ins.right + 2 &&
      physical[3] <= window[3] - ins.bottom + 2
    ))
      violations.push({ name, id, physical, ins, window });
  }
}
export async function rotation(h) {
  const violations = [];
  h.report.controlOverruns = violations;
  h.rotate(0);
  await h.cold();
  await h.practice();
  await h.get().page.waitForFunction(() => innerHeight > innerWidth);
  const first = await h.capture('portrait-first-open');
  assertSafe(first, violations, 'first');
  for (const [direction, label] of [
    [1, 'landscape-cutout-left'],
    [3, 'landscape-cutout-right'],
    [0, 'portrait-return'],
  ]) {
    h.rotate(direction);
    await h
      .get()
      .page.waitForFunction(({ direction }) => screen.orientation.angle === direction * 90, {
        direction,
      });
    await pause(900);
    await h.turn(0);
    const b = await h.capture(label);
    assertSafe(b, violations, label);
  }
  await h.touch('#menu');
  await h.touch('#fullscreen');
  await expect.poll(() => h.get().page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
  const full = await h.capture('fullscreen-menu');
  assertSafe(full, violations, 'full');
  shell('input', 'keyevent', 'KEYCODE_BACK');
  await expect
    .poll(() => h.get().page.evaluate(() => document.fullscreenElement?.id ?? null))
    .toBeNull();
  const bars = await h.capture('returned-bars');
  assertSafe(bars, violations, 'bars');
  const prior = h.get();
  await prior.cdp.send('Page.crash').catch(() => {});
  await expect
    .poll(
      () => {
        shell('uiautomator', 'dump', '/data/local/tmp/ferry-cove-recovery.xml');
        return shell('cat', '/data/local/tmp/ferry-cove-recovery.xml');
      },
      { timeout: 50000 },
    )
    .toContain('TRY AGAIN');
  const xml = shell('cat', '/data/local/tmp/ferry-cove-recovery.xml');
  const nativeControls = [...xml.matchAll(/<node\b[^>]+>/g)]
    .map(([t]) => ({
      text: t.match(/\btext="([^"]*)"/)?.[1],
      bounds: t
        .match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/)
        ?.slice(1)
        .map(Number),
    }))
    .filter((n) => n.text && n.bounds);
  const retry = nativeControls.find((n) => n.text.toUpperCase() === 'TRY AGAIN');
  assert(retry);
  for (const n of nativeControls) {
    const [l, t, r, b] = n.bounds,
      ins = bars.web.nativeInsets;
    assert(
      l >= ins.left &&
        t >= ins.top &&
        r <= bars.window[2] - ins.right &&
        b <= bars.window[3] - ins.bottom,
    );
  }
  h.report.recovery = { controls: nativeControls, frame: shot('recovery-safe'), returnsTo: 'Home' };
  await prior.device.close();
  const [l, t, r, b] = retry.bounds;
  shell('input', 'tap', String((l + r) >> 1), String((t + b) >> 1));
  await h.attach();
  await expect(h.loc('#home-play')).toHaveText('Continue');
  assert.deepEqual(await data(h.get().page), h.original);
  assert.deepEqual(violations, []);
}
