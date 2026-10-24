import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type CDPSession,
  type Page,
} from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import { act, activate as appActivate, fullyVisible, idle, restart, tabTo, undo } from './ui';

test.use({
  launchOptions: {
    ignoreDefaultArgs: ['--autoplay-policy=no-user-gesture-required'],
    args: [
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--autoplay-policy=document-user-activation-required',
      '--enable-automation',
    ],
  },
});

const passiveSessions = new WeakMap<Page, CDPSession>();
async function passive<T, A = undefined>(
  page: Page,
  fn: (argument: A) => T | Promise<T>,
  argument?: A,
): Promise<T> {
  let session = passiveSessions.get(page);
  if (!session) {
    session = await page.context().newCDPSession(page);
    passiveSessions.set(page, session);
  }
  const result = await session.send('Runtime.evaluate', {
    expression: `(${fn.toString()})(${JSON.stringify(argument) ?? 'undefined'})`,
    returnByValue: true,
    awaitPromise: true,
    userGesture: false,
  });
  if (result.exceptionDetails)
    throw Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value as T;
}
async function nativeTouch(page: Page, id: string) {
  const point = await passive(
    page,
    (id) => {
      const r = document.getElementById(id)!.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },
    id,
  );
  const session = passiveSessions.get(page)!;
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ ...point, id: 1 }],
  });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
async function activate(page: Page, id: string, touch = false) {
  if (touch && !(await passive(page, () => navigator.userActivation.hasBeenActive)))
    await nativeTouch(page, id);
  else await appActivate(page, id, touch);
}
const puzzleState = (page: Page) => passive(page, () => (window as any).__LAST_FERRY__.getState());

const audio = (page: Page) => passive(page, () => (window as any).__LAST_FERRY__.getAudioStatus());
const flush = (page: Page) =>
  passive(
    page,
    () =>
      new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))),
  );
const playing = async (page: Page) => {
  await expect.poll(async () => (await audio(page)).running).toBe(true);
  expect(await audio(page)).toMatchObject({
    contextCount: 1,
    schedulerCount: 1,
    contextState: 'running',
  });
};

async function heldResume(context: BrowserContext, count: number) {
  await context.addInitScript((holdCount) => {
    const Native = window.AudioContext;
    const context = new Native({ latencyHint: 'interactive' });
    const nativeResume = context.resume.bind(context);
    const stateGetter = Object.getOwnPropertyDescriptor(BaseAudioContext.prototype, 'state')!.get!;
    let blocked = true;
    Object.defineProperty(context, 'state', {
      configurable: true,
      get: () => (blocked ? 'suspended' : stateGetter.call(context)),
    });
    const pending: Array<{ resolve: () => void; reject: (error: Error) => void }> = [];
    const requests: unknown[] = [];
    let constructions = 0;
    context.resume = () => {
      requests.push({
        at: performance.now(),
        active: navigator.userActivation.isActive,
        state: context.state,
      });
      if (requests.length <= holdCount)
        return new Promise<void>((resolve, reject) => pending.push({ resolve, reject }));
      blocked = false;
      return nativeResume();
    };
    const Controlled = function () {
      constructions++;
      return context;
    };
    Controlled.prototype = Native.prototype;
    Object.setPrototypeOf(Controlled, Native);
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: Controlled });
    (window as any).__resumeGate = {
      status: () => ({
        requests: [...requests],
        constructions,
        nativeState: stateGetter.call(context),
        reportedState: context.state,
        blocked,
      }),
      suspend: () => context.suspend(),
      settle: async (index: number, result: string, resumeNative = false) => {
        if (resumeNative && stateGetter.call(context) !== 'closed') {
          blocked = false;
          await nativeResume();
        }
        if (result === 'resolve') pending[index].resolve();
        else
          pending[index].reject(new DOMException('Controlled stale rejection', 'NotAllowedError'));
      },
    };
  }, count);
}

async function scenario(
  browser: Browser,
  name: string,
  options: {
    cove?: string;
    viewport?: { width: number; height: number };
    muted?: boolean;
    held?: number;
    policyDenied?: boolean;
    fullscreenMock?: 'rejected' | 'unavailable';
  },
  run: (
    page: Page,
    save: (label: string, screenshot?: boolean) => Promise<any>,
    context: BrowserContext,
  ) => Promise<void>,
) {
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
    viewport: options.viewport ?? { width: 844, height: 390 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  });
  await context.addInitScript((muted) => {
    if (localStorage.getItem('last-ferry-muted') === null)
      localStorage.setItem('last-ferry-muted', String(muted));
  }, options.muted ?? false);
  if (options.held) await heldResume(context, options.held);
  if (options.fullscreenMock)
    await context.addInitScript((scenario) => {
      Object.defineProperty(Element.prototype, 'requestFullscreen', {
        configurable: true,
        value:
          scenario === 'unavailable'
            ? undefined
            : () =>
                Promise.reject(
                  new DOMException('Controlled fullscreen rejection', 'NotAllowedError'),
                ),
      });
      if (scenario === 'unavailable')
        Object.defineProperty(document, 'fullscreenEnabled', {
          configurable: true,
          get: () => false,
        });
    }, options.fullscreenMock);
  if (options.policyDenied)
    await context.route('**/*', async (route) => {
      if (route.request().isNavigationRequest()) {
        const response = await route.fetch();
        await route.fulfill({
          response,
          headers: { ...response.headers(), 'Permissions-Policy': 'fullscreen=()' },
        });
      } else await route.continue();
    });
  const page = await context.newPage(),
    observations: unknown[] = [],
    errors: string[] = [];
  let failure: string | null = null;
  const cdp = await browser.newBrowserCDPSession();
  const command = await cdp.send('Browser.getBrowserCommandLine');
  await cdp.detach();
  const autoplayFlags = command.arguments.filter((argument: string) =>
    argument.includes('autoplay-policy'),
  );
  expect(autoplayFlags).toContain('--autoplay-policy=document-user-activation-required');
  expect(autoplayFlags).not.toContain('--autoplay-policy=no-user-gesture-required');
  page.on('pageerror', (error) => errors.push(error.message));
  const save = async (label: string, screenshot = false) => {
    const value = await passive(
      page,
      (label) => {
        const api = (window as any).__LAST_FERRY__;
        return {
          label,
          at: performance.now(),
          state: api.getState(),
          history: api.getRenderStatus().historyLength,
          audio: api.getAudioStatus(),
          view: api.getViewStatus(),
          viewport: api.getViewportStatus(),
          action: api.getActionPlacement(),
          homecoming: api.getHomecomingStatus(),
          fullscreen: {
            element: document.fullscreenElement?.id ?? null,
            enabled: document.fullscreenEnabled,
            topLevel: window.top === window,
            policyAllows:
              (document as any).permissionsPolicy?.allowsFeature('fullscreen') ??
              (document as any).featurePolicy?.allowsFeature('fullscreen') ??
              null,
            diagnostic: api.getFullscreenStatus?.() ?? null,
          },
          userActivation: {
            active: navigator.userActivation.isActive,
            hasBeenActive: navigator.userActivation.hasBeenActive,
          },
          copiedSupport: (window as any).__copiedFullscreenSupport ?? null,
          gate: (window as any).__resumeGate?.status() ?? null,
          input: (window as any).__coldInput ?? [],
        };
      },
      label,
    );
    observations.push(value);
    if (screenshot) await page.screenshot({ path: `${reviewDir}/${name}-${label}.png` });
    return value;
  };
  mkdirSync(`${reviewDir}/raw`, { recursive: true });
  try {
    await page.goto('/?cove=' + (options.cove ?? 'holding-pier'));
    for (let attempt = 0; attempt < 200; attempt++) {
      if (await passive(page, () => ((window as any).__LAST_FERRY__?.getMetrics().frames ?? 0) > 4))
        break;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    expect(await passive(page, () => !!(window as any).__LAST_FERRY__)).toBe(true);
    await passive(page, () => {
      (window as any).__coldInput = [];
      for (const name of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown', 'keyup'])
        window.addEventListener(
          name,
          (event) => {
            (window as any).__coldInput.push({
              type: event.type,
              at: performance.now(),
              trusted: event.isTrusted,
              repeat: (event as KeyboardEvent).repeat ?? false,
              pointerType: (event as PointerEvent).pointerType ?? null,
              target: (event.target as Element).closest('button')?.id ?? null,
              active: navigator.userActivation.isActive,
              hasBeenActive: navigator.userActivation.hasBeenActive,
            });
          },
          true,
        );
    });
    await run(page, save, context);
    expect(errors).toEqual([]);
  } catch (error) {
    failure = String(error);
    throw error;
  } finally {
    writeFileSync(
      `${reviewDir}/${name}.json`,
      JSON.stringify(
        {
          recordedAt: new Date().toISOString(),
          environment: {
            autoplayFlags,
            browser: browser.version(),
            viewport: options.viewport ?? [844, 390],
            input:
              'Trusted touchscreen input, fresh context, no prior mouse/keyboard activation or permissive autoplay flag',
            renderer: 'SwiftShader, DPR1',
          },
          method: options.held
            ? 'Controlled delayed resume/state gate around one native AudioContext; graph and UI are real. The simulated state gate prevents native source-start auto-unlock from bypassing the held request. Not a browser policy or Android reproduction.'
            : options.fullscreenMock
              ? 'Explicitly mocked fullscreen API rejection/unavailability; short-phone copy fallback uses a separately mocked rejected clipboard write. Native audio remains unmodified.'
              : options.policyDenied
                ? 'Real Chromium Permissions-Policy enforcement using an intercepted HTML response header; not a hosted restriction.'
                : 'Unmodified native browser audio/fullscreen APIs under interaction-required autoplay policy',
          failure,
          errors,
          observations,
        },
        null,
        2,
      ),
    );
    await context.close();
  }
}

async function sustained(page: Page) {
  const samples = await passive(page, async () => {
    const values = [];
    for (let i = 0; i < 20; i++) {
      const s = (window as any).__LAST_FERRY__.getAudioStatus();
      values.push({
        at: performance.now(),
        time: s.currentTime,
        rms: s.rms,
        peak: s.peak,
        running: s.running,
        sources: s.sourceCount,
        contextCount: s.contextCount,
        schedulerCount: s.schedulerCount,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return values;
  });
  expect(samples.at(-1)!.time - samples[0].time).toBeGreaterThan(1.5);
  expect(samples.filter((s) => s.rms > 0.0005).length).toBeGreaterThanOrEqual(12);
  expect(Math.max(...samples.map((s) => s.peak))).toBeGreaterThan(0.005);
  expect(samples.every((s) => s.running && s.contextCount === 1 && s.schedulerCount === 1)).toBe(
    true,
  );
  expect(Math.max(...samples.map((s) => s.sources))).toBeLessThanOrEqual(32);
  return samples;
}

async function runtimeSample(page: Page, name: string) {
  const bytes = await passive(page, async () => {
    const stream = (window as any).__LAST_FERRY__.captureAudioStream();
    if (!stream || !MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return null;
    return new Promise<number[]>((resolve, reject) => {
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' }),
        chunks: Blob[] = [];
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onerror = (event) => reject(String(event));
      recorder.onstop = async () =>
        resolve(Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())));
      recorder.start();
      setTimeout(() => recorder.stop(), 2400);
    });
  });
  if (bytes) writeFileSync(`${reviewDir}/raw/${name}.webm`, new Uint8Array(bytes));
  return {
    available: !!bytes,
    bytes: bytes?.length ?? 0,
    path: bytes ? `${reviewDir}/raw/${name}.webm` : null,
    listening: 'Runtime capture only; speaker/hardware listening not performed.',
  };
}

test('phone native autoplay policy calibration: untrusted resume stays pending until trusted touch', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.route('**/__audio-policy-calibration', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<button id="activate" style="width:180px;height:60px">Activate audio</button><script>const context=new AudioContext();let settled=false;context.resume().then(()=>settled=true);window.policyStatus=()=>({state:context.state,time:context.currentTime,settled,active:navigator.userActivation.isActive,hasBeenActive:navigator.userActivation.hasBeenActive});document.querySelector("button").onclick=()=>context.resume();</script>',
    }),
  );
  let before: unknown, after: unknown;
  try {
    await page.goto(
      `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}/__audio-policy-calibration`,
    );
    await page.waitForTimeout(250);
    before = await passive(page, () => (window as any).policyStatus());
    expect(before).toMatchObject({ state: 'suspended', settled: false, hasBeenActive: false });
    await nativeTouch(page, 'activate');
    await expect
      .poll(() => passive(page, () => (window as any).policyStatus().state))
      .toBe('running');
    await page.waitForTimeout(150);
    after = await passive(page, () => (window as any).policyStatus());
    expect(after).toMatchObject({ state: 'running', settled: true, hasBeenActive: true });
  } finally {
    mkdirSync(reviewDir, { recursive: true });
    writeFileSync(
      `${reviewDir}/audio-policy-calibration.json`,
      JSON.stringify(
        {
          method:
            'Unmodified native Web Audio in a minimal response fixture, separate fresh context from every game check; no fake AudioContext or playback bypass. Confirms the launch policy actually requires interaction.',
          before,
          after,
        },
        null,
        2,
      ),
    );
    await context.close();
  }
});

for (const cove of ['holding-pier', 'first-crossing'])
  test(`phone audio cold ${cove}: first completed touch starts sustained real output`, async ({
    browser,
  }) => {
    await scenario(browser, `cold-${cove}`, { cove }, async (page, save) => {
      const cold = await save('cold');
      expect(cold.audio).toMatchObject({
        muted: false,
        contextCount: 0,
        schedulerCount: 0,
        requested: false,
      });
      expect(cold.userActivation.hasBeenActive).toBe(false);
      await activate(page, 'view-toggle', true);
      await playing(page);
      await expect(page.locator('#sound-toggle')).toHaveAccessibleName('Mute sound');
      const [samples, recording] = await Promise.all([
        sustained(page),
        cove === 'holding-pier'
          ? runtimeSample(page, 'cold-holding-runtime')
          : Promise.resolve(null),
      ]);
      writeFileSync(
        `${reviewDir}/cold-${cove}-output.json`,
        JSON.stringify({ samples, recording }, null, 2),
      );
      const running = await save('running', true);
      expect(running.input[0]).toMatchObject({
        type: 'pointerdown',
        pointerType: 'touch',
        trusted: true,
      });
      expect(running.input.some((e: any) => e.type === 'pointerup' && e.active && e.trusted)).toBe(
        true,
      );
      expect(running.state).toEqual(cold.state);
      expect(running.audio.schedulerStarts).toBe(1);
    });
  });

test('phone audio cold pan: consumed touch drag starts audio without a click or puzzle action', async ({
  browser,
}) => {
  await scenario(browser, 'cold-pan-audio', {}, async (page, save, context) => {
    const before = await save('cold');
    expect(before.userActivation.hasBeenActive).toBe(false);
    expect(before.audio).toMatchObject({ contextCount: 0, schedulerCount: 0 });
    const water = await passive(page, () => {
      const canvas = document.querySelector('canvas')!,
        r = canvas.getBoundingClientRect(),
        api = (window as any).__LAST_FERRY__;
      for (let y = 100; y < innerHeight - 100; y += 20)
        for (let x = 40; x < innerWidth - 160; x += 20)
          if (
            document.elementFromPoint(x, y) === canvas &&
            !api.getPickDetailAt(x - r.left, y - r.top)
          )
            return { x, y };
      return null;
    });
    expect(water).not.toBeNull();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ ...water!, id: 1 }],
    });
    for (let step = 1; step <= 6; step++)
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: water!.x + step * 12, y: water!.y + step * 6, id: 1 }],
      });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await playing(page);
    const samples = await sustained(page);
    const after = await save('panned-running', true);
    expect(after.view.panned).toBe(true);
    expect(after.state).toEqual(before.state);
    expect(after.history).toBe(before.history);
    expect(after.audio).toMatchObject({ contextCount: 1, schedulerCount: 1, schedulerStarts: 1 });
    expect(after.input.find((event: any) => event.type === 'pointerdown')).toMatchObject({
      trusted: true,
      pointerType: 'touch',
      active: false,
    });
    expect(
      after.input.some((event: any) => event.type === 'pointerup' && event.trusted && event.active),
    ).toBe(true);
    expect(after.input.filter((event: any) => event.type === 'click')).toHaveLength(0);
    writeFileSync(`${reviewDir}/cold-pan-output.json`, JSON.stringify({ samples }, null, 2));
    await cdp.detach();
  });
});

test('phone saved mute: ordinary touch stays silent and one explicit Enable starts audio', async ({
  browser,
}) => {
  await scenario(browser, 'saved-mute-enable', { muted: true }, async (page, save) => {
    await activate(page, 'view-toggle', true);
    expect(await audio(page)).toMatchObject({ muted: true, contextCount: 0, schedulerCount: 0 });
    await expect(page.locator('#sound-toggle')).toHaveAccessibleName('Enable sound');
    await activate(page, 'sound-toggle', true);
    await playing(page);
    const enabled = await save('enabled', true);
    expect(enabled.audio.muted).toBe(false);
    expect(await passive(page, () => localStorage.getItem('last-ferry-muted'))).toBe('false');
    await activate(page, 'sound-toggle', true);
    await expect.poll(async () => (await audio(page)).schedulerCount).toBe(0);
    expect(await audio(page)).toMatchObject({ muted: true, state: 'muted' });
    await activate(page, 'view-toggle', true);
    expect(await audio(page)).toMatchObject({ muted: true, schedulerCount: 0, contextCount: 1 });
    await save('muted-after-inspection');
    await activate(page, 'menu', true);
    await page.locator('#cove-picker').selectOption('first-crossing');
    await page.waitForURL(/cove=first-crossing/);
    await idle(page);
    await activate(page, 'view-toggle', true);
    expect(await audio(page)).toMatchObject({ muted: true, contextCount: 0, schedulerCount: 0 });
    await tabTo(page, 'sound-toggle');
    await page.keyboard.press('Enter');
    await playing(page);
    await save('new-cove-keyboard-enable');
  });
});

for (const stale of ['resolve', 'reject'])
  test(`phone controlled resume ${stale}: Retry owns newer pending request and Mute wins late completion`, async ({
    browser,
  }) => {
    await scenario(browser, `controlled-resume-${stale}`, { held: 2 }, async (page, save) => {
      await activate(page, 'view-toggle', true);
      await expect.poll(async () => (await audio(page)).retryPending).toBe(true);
      await expect(page.locator('#sound-toggle')).toHaveAccessibleName('Retry sound');
      await activate(page, 'sound-toggle', true);
      let value = await save('two-pending', true);
      expect(value.gate.requests).toHaveLength(2);
      expect(value.audio).toMatchObject({
        muted: false,
        requested: true,
        running: false,
        contextCount: 1,
        schedulerCount: 0,
        retryPending: true,
      });
      await passive(page, async (result) => (window as any).__resumeGate.settle(0, result), stale);
      value = await save('old-settled-new-pending');
      expect(value.audio).toMatchObject({
        muted: false,
        running: false,
        retryPending: true,
        schedulerCount: 0,
      });
      await activate(page, 'sound-toggle', true);
      await playing(page);
      value = await save('retry-running');
      expect(value.gate.requests).toHaveLength(3);
      expect(value.audio.schedulerStarts).toBe(1);
      await activate(page, 'sound-toggle', true);
      await page.waitForTimeout(200);
      await passive(
        page,
        async (result) => (window as any).__resumeGate.settle(1, result, result === 'resolve'),
        stale,
      );
      await page.waitForTimeout(200);
      value = await save('late-after-mute');
      expect(value.audio).toMatchObject({
        muted: true,
        state: 'muted',
        running: false,
        schedulerCount: 0,
        schedulerStarts: 1,
        contextCount: 1,
      });
      expect(value.gate.requests).toHaveLength(3);
      expect(value.audio.rms).toBeLessThan(0.00001);
    });
  });

test('phone controlled pending mute: explicit Settings mute never activates playback first', async ({
  browser,
}) => {
  await scenario(browser, 'controlled-pending-mute', { held: 20 }, async (page, save) => {
    await activate(page, 'menu', true);
    await activate(page, 'settings', true);
    const before = await save('before-explicit-mute');
    expect(before.audio).toMatchObject({
      muted: false,
      running: false,
      retryPending: true,
      schedulerCount: 0,
    });
    await expect(page.locator('#settings-mute')).toBeVisible();
    await activate(page, 'settings-mute', true);
    const muted = await save('explicit-mute', true);
    expect(muted.audio).toMatchObject({
      muted: true,
      requested: false,
      running: false,
      schedulerCount: 0,
    });
    expect(muted.gate.requests).toHaveLength(before.gate.requests.length);
    await passive(page, () => (window as any).__resumeGate.settle(0, 'resolve', true));
    await page.waitForTimeout(200);
    expect(await audio(page)).toMatchObject({
      muted: true,
      running: false,
      schedulerCount: 0,
      schedulerStarts: 0,
      contextCount: 1,
    });
  });
});

test('phone controlled explicit touch intent: late running or suspension cannot invert Retry or Mute', async ({
  browser,
}) => {
  await scenario(browser, 'controlled-touch-intent', { held: 1 }, async (page, save, context) => {
    await activate(page, 'view-toggle', true);
    await expect(page.locator('#sound-toggle')).toHaveAccessibleName('Retry sound');
    const cdp = await context.newCDPSession(page);
    const down = async () => {
      const r = await page.locator('#sound-toggle').boundingBox();
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: r!.x + r!.width / 2, y: r!.y + r!.height / 2, id: 1 }],
      });
    };
    await down();
    await passive(page, () => (window as any).__resumeGate.settle(0, 'resolve', true));
    await playing(page);
    await expect(page.locator('#sound-toggle')).toHaveAccessibleName('Mute sound');
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    expect(await audio(page)).toMatchObject({ muted: false, running: true, schedulerStarts: 1 });
    await save('retry-intent-preserved');
    await down();
    await passive(page, () => (window as any).__resumeGate.suspend());
    await expect(page.locator('#sound-toggle')).toHaveAccessibleName('Retry sound');
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(150);
    const muted = await save('mute-intent-preserved', true);
    expect(muted.audio).toMatchObject({
      muted: true,
      running: false,
      schedulerCount: 0,
      schedulerStarts: 1,
    });
    expect(muted.gate.requests).toHaveLength(1);
    await cdp.detach();
  });
});

test('phone controlled held Space: auto-repeat cannot replace the original Retry intent after late running', async ({
  browser,
}) => {
  await scenario(browser, 'controlled-space-intent', { held: 1 }, async (page, save, context) => {
    await activate(page, 'view-toggle', true);
    await expect(page.locator('#sound-toggle')).toHaveAccessibleName('Retry sound');
    await tabTo(page, 'sound-toggle');
    const before = await save('before-space');
    const cdp = await context.newCDPSession(page);
    const key = { key: ' ', code: 'Space', windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32 };
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', ...key, text: ' ' });
    await passive(page, () => (window as any).__resumeGate.settle(0, 'resolve', true));
    await playing(page);
    await expect(page.locator('#sound-toggle')).toHaveAccessibleName('Mute sound');
    await cdp.send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      ...key,
      text: ' ',
      autoRepeat: true,
    });
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...key });
    const after = await save('held-space-released', true);
    const clicks = (value: any) =>
      value.input.filter((event: any) => event.type === 'click' && event.target === 'sound-toggle');
    expect(clicks(after).length).toBe(clicks(before).length + 1);
    expect(
      after.input.some((event: any) => event.type === 'keydown' && event.repeat && event.trusted),
    ).toBe(true);
    expect(after.audio).toMatchObject({
      muted: false,
      running: true,
      schedulerStarts: 1,
      contextCount: 1,
    });
    expect(after.state).toEqual(before.state);
    await cdp.detach();
  });
});

async function dialogHit(page: Page, id: string) {
  await fullyVisible(page, page.locator(`#${id}`));
  const hit = await page.locator(`#${id}`).evaluate((element) => {
    const r = element.getBoundingClientRect();
    return (
      document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest('button') ===
      element
    );
  });
  expect(hit, `Actual top-layer hit must reach ${id}`).toBe(true);
}

for (const audioState of ['cold-muted', 'pending', 'running'])
  test(`phone supported fullscreen ${audioState}: real entry, visible dialog hit and external exit retain subset`, async ({
    browser,
  }) => {
    await scenario(
      browser,
      `fullscreen-${audioState}`,
      { muted: audioState === 'cold-muted', held: audioState === 'pending' ? 20 : undefined },
      async (page, save) => {
        if (audioState === 'running') {
          await activate(page, 'view-toggle', true);
          await playing(page);
        }
        const original = await puzzleState(page);
        await activate(page, 'menu', true);
        expect(
          await passive(
            page,
            () =>
              document.fullscreenEnabled &&
              typeof document.querySelector('#app')!.requestFullscreen === 'function',
          ),
        ).toBe(true);
        await dialogHit(page, 'fullscreen');
        await activate(page, 'fullscreen', true);
        await expect
          .poll(() => passive(page, () => document.fullscreenElement?.id ?? null))
          .toBe('app');
        await flush(page);
        await dialogHit(page, 'fullscreen');
        await dialogHit(page, 'cancel');
        await expect(page.locator('#fullscreen')).toHaveText('Exit fullscreen');
        const entered = await save('entered', true);
        expect(entered.fullscreen.diagnostic.latest).toMatchObject({
          intent: 'enter',
          trusted: true,
          outcome: 'entered',
          before: {
            api: true,
            enabled: true,
            topLevel: true,
            policyAllows: true,
            activation: { active: true },
          },
          modal: { frontAfter: true, focusRestored: true },
        });
        expect(entered.fullscreen.diagnostic.samples.length).toBeLessThanOrEqual(8);
        expect(entered.fullscreen.diagnostic.attempts.length).toBeLessThanOrEqual(6);
        if (audioState === 'cold-muted')
          expect(entered.audio).toMatchObject({ muted: true, contextCount: 0 });
        if (audioState === 'pending')
          expect(entered.audio).toMatchObject({ muted: false, running: false, retryPending: true });
        await activate(page, 'fullscreen', true);
        await expect
          .poll(() => passive(page, () => document.fullscreenElement?.id ?? null))
          .toBeNull();
        await dialogHit(page, 'fullscreen');
        await activate(page, 'fullscreen', true);
        await expect
          .poll(() => passive(page, () => document.fullscreenElement?.id ?? null))
          .toBe('app');
        await activate(page, 'cancel', true);
        await activate(page, 'unload', true);
        await activate(page, 'passenger-sheep-1', true);
        expect(await page.locator('#passenger-sheep-1').getAttribute('aria-pressed')).toBe('false');
        await dialogHit(page, 'cancel');
        await passive(page, () => document.exitFullscreen());
        await expect
          .poll(() => passive(page, () => document.fullscreenElement?.id ?? null))
          .toBeNull();
        await page.setViewportSize({ width: 390, height: 844 });
        await flush(page);
        await fullyVisible(page, page.locator('#commit'));
        await dialogHit(page, 'cancel');
        expect(await page.locator('#passenger-sheep-1').getAttribute('aria-pressed')).toBe('false');
        expect(await puzzleState(page)).toEqual(original);
        await save('external-exit-portrait-subset', true);
      },
    );
  });

test('phone fullscreen real header policy denial: effective restriction is separate from unsupported API', async ({
  browser,
}) => {
  await scenario(
    browser,
    'fullscreen-header-policy',
    { policyDenied: true },
    async (page, save) => {
      await activate(page, 'menu', true);
      const policy = await passive(page, () => ({
        exists: typeof document.querySelector('#app')!.requestFullscreen === 'function',
        enabled: document.fullscreenEnabled,
        allows:
          (document as any).permissionsPolicy?.allowsFeature('fullscreen') ??
          (document as any).featurePolicy?.allowsFeature('fullscreen'),
      }));
      expect(policy).toEqual({ exists: true, enabled: false, allows: false });
      await dialogHit(page, 'fullscreen');
      await activate(page, 'fullscreen', true);
      expect(await passive(page, () => document.fullscreenElement)).toBeNull();
      await expect(page.locator('#fullscreen-feedback')).toContainText(/blocks fullscreen/i);
      const denied = await save('denied', true);
      expect(denied.fullscreen.diagnostic.latest.before).toMatchObject({
        api: true,
        enabled: false,
        policyAllows: false,
        activation: { active: true },
      });
      await passive(page, () => {
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: {
            writeText: async (text: string) => {
              (window as any).__copiedFullscreenSupport = JSON.parse(text);
            },
          },
        });
      });
      await dialogHit(page, 'fullscreen-support');
      await activate(page, 'fullscreen-support', true);
      await expect(page.locator('#fullscreen-support')).toHaveText('Support details copied');
      const copied = await save('controlled-clipboard-copy');
      expect(copied.copiedSupport).toMatchObject({
        schema: 1,
        build: { mode: 'development' },
        latest: { trusted: true, before: { policyAllows: false } },
      });
      expect(copied.copiedSupport.build.artifact).toContain('main.ts');
      await activate(page, 'cancel', true);
      await activate(page, 'unload', true);
      await dialogHit(page, 'cancel');
      expect((await puzzleState(page)).turn).toBe(0);
    },
  );
});

for (const result of ['rejected', 'unavailable'] as const)
  test(`phone fullscreen mocked ${result}: short landscape feedback and manual support copy remain reachable`, async ({
    browser,
  }) => {
    await scenario(
      browser,
      `fullscreen-mocked-${result}-short`,
      { fullscreenMock: result, viewport: { width: 780, height: 320 } },
      async (page, save) => {
        const before = await puzzleState(page);
        await activate(page, 'menu', true);
        await activate(page, 'fullscreen', true);
        await fullyVisible(page, page.locator('#fullscreen-support'));
        const failed = await save('feedback', true);
        expect(failed.fullscreen.diagnostic.latest).toMatchObject({
          trusted: true,
          outcome: result === 'rejected' ? 'rejected' : 'unavailable',
        });
        if (result === 'rejected')
          expect(failed.fullscreen.diagnostic.latest.error).toMatchObject({
            name: 'NotAllowedError',
            message: 'Controlled fullscreen rejection',
          });
        await passive(page, () => {
          Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
              writeText: () =>
                Promise.reject(
                  new DOMException('Controlled clipboard rejection', 'NotAllowedError'),
                ),
            },
          });
        });
        await activate(page, 'fullscreen-support', true);
        await expect(page.locator('#fullscreen-details')).toBeFocused();
        await fullyVisible(page, page.locator('#fullscreen-details'), false);
        await dialogHit(page, 'cancel');
        const support = JSON.parse(await page.locator('#fullscreen-details').inputValue());
        expect(support).toMatchObject({
          schema: 1,
          build: { mode: 'development' },
          latest: { trusted: true },
        });
        const dimensions = await passive(page, () => ({
          width: innerWidth,
          scroll: document.documentElement.scrollWidth,
        }));
        expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
        await save('manual-copy', true);
        await activate(page, 'cancel', true);
        expect(await puzzleState(page)).toEqual(before);
        await activate(page, 'unload', true);
        await dialogHit(page, 'cancel');
      },
    );
  });

for (const [width, height] of [
  [844, 390],
  [390, 844],
])
  test(`phone audio rescue ${width}x${height}: UI subsets, tide and terminal Undo, restart and visibility preserve ownership`, async ({
    browser,
  }) => {
    await scenario(
      browser,
      `audio-rescue-${width}x${height}`,
      { viewport: { width, height } },
      async (page, save) => {
        await act(page, 'unload', true);
        await playing(page);
        await act(page, 'map-shallows', true);
        await act(page, 'map-rabbit-pier', true);
        const before = await puzzleState(page);
        await activate(page, 'board', true);
        await activate(page, 'passenger-rabbit-2', true);
        await expect(page.locator('#preview')).toContainText(
          /Rue.*still waiting|ends the crossing/,
        );
        await activate(page, 'passenger-rabbit-2', true);
        await save('critical-boarding', true);
        await activate(page, 'commit', true);
        await idle(page);
        expect(await puzzleState(page)).toMatchObject({ turn: 4, tideLevel: 1 });
        await undo(page, true);
        expect(await puzzleState(page)).toEqual(before);
        await act(page, 'board', true);
        await act(page, 'map-shallows', true);
        await act(page, 'map-stone', true);
        await act(page, 'board', true);
        await act(page, 'map-harbor', true);
        const atHarbor = await puzzleState(page);
        await act(page, 'unload', true);
        await expect.poll(async () => (await audio(page)).victorySettled).toBe(true);
        expect(await audio(page)).toMatchObject({
          contextCount: 1,
          schedulerCount: 1,
          victoryTarget: 0.5,
          deliveryCount: 1,
        });
        await save('won', true);
        await undo(page, true);
        expect(await puzzleState(page)).toEqual(atHarbor);
        await act(page, 'unload', true);
        await expect.poll(async () => (await audio(page)).victorySettled).toBe(true);
        expect((await audio(page)).deliveryCount).toBe(2);
        await restart(page, true);
        expect(await puzzleState(page)).toMatchObject({ turn: 0, status: 'playing' });
        expect(await audio(page)).toMatchObject({
          victoryTarget: 1,
          contextCount: 1,
          schedulerCount: 1,
        });
        await passive(page, () => {
          Object.defineProperty(document, 'hidden', { configurable: true, value: true });
          document.dispatchEvent(new Event('visibilitychange'));
        });
        await expect.poll(async () => (await audio(page)).schedulerCount).toBe(0);
        const hidden = await save('simulated-hidden');
        await passive(page, () => {
          Object.defineProperty(document, 'hidden', { configurable: true, value: false });
          document.dispatchEvent(new Event('visibilitychange'));
        });
        await playing(page);
        const recovered = await save('simulated-visible');
        expect(recovered.audio.deliveryCount).toBe(hidden.audio.deliveryCount);
        expect(recovered.audio.arrivalActive).toBe(false);
        await activate(page, 'menu', true);
        await page.locator('#cove-picker').selectOption('bellwater');
        await page.waitForURL(/cove=bellwater/);
        await idle(page);
        expect(await puzzleState(page)).toMatchObject({ turn: 0, status: 'playing' });
        await activate(page, 'view-toggle', true);
        await playing(page);
        await save('bellwater-new-document');
      },
    );
  });
