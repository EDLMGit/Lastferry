# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: play-readability-journey.spec.ts >> actual portrait Holding rescue, tide and terminal Undo, then uninterrupted Harbor handoff
- Location: tests\e2e\play-readability-journey.spec.ts:125:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('#story-continue')
Expected: 0
Received: 1
Timeout:  15000ms

Call log:
  - Expect "toHaveCount" locator('#story-continue') with timeout 15000ms
  - waiting for locator('#story-continue')
    31 × locator resolved to 1 element
       - unexpected value "1"

```

# Test source

```ts
  44  |     readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  45  |       e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
  46  |     );
  47  |   save(name, {
  48  |     at: new Date().toISOString(),
  49  |     head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  50  |     status: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
  51  |     files: Object.fromEntries(
  52  |       [...walk('src'), ...walk('data'), 'package.json', 'package-lock.json', 'index.html', 'vite.config.ts']
  53  |         .sort()
  54  |         .map((p) => [p, createHash('sha256').update(readFileSync(p)).digest('hex')]),
  55  |     ),
  56  |     node: process.version,
  57  |   });
  58  | }
  59  | test.beforeAll(() => {
  60  |   source('journey-source-before');
  61  |   const fixture = readFileSync('tests/e2e/play-readability-journey.spec.ts');
  62  |   writeFileSync(`${reviewDir}/raw/executed-play-readability-journey.spec.ts`, fixture);
  63  |   save('journey-fixture', { sha256: createHash('sha256').update(fixture).digest('hex') });
  64  | });
  65  | test.afterAll(() => source('journey-source-after'));
  66  | 
  67  | async function recordRuntime(page: Page, name: string) {
  68  |   const directory = `${reviewDir}/raw/${name}`;
  69  |   mkdirSync(directory, { recursive: true });
  70  |   const audioAvailable = await passive(page, () => {
  71  |     const stream = (window as any).__LAST_FERRY__.captureAudioStream();
  72  |     if (!stream) return false;
  73  |     const chunks: Blob[] = [];
  74  |     const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
  75  |     const start = performance.timeOrigin + performance.now();
  76  |     const stopped = new Promise<number[]>((resolve) => {
  77  |       recorder.ondataavailable = (e) => chunks.push(e.data);
  78  |       recorder.onstop = async () =>
  79  |         resolve(Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())));
  80  |     });
  81  |     (window as any).__readabilityRecording = { recorder, start, stopped };
  82  |     recorder.start();
  83  |     return true;
  84  |   });
  85  |   const cdp = await page.context().newCDPSession(page);
  86  |   const frames: { path: string; timestamp: number; receipt: number }[] = [];
  87  |   cdp.on('Page.screencastFrame', (event) => {
  88  |     const path = `${directory}/frame-${String(frames.length).padStart(6, '0')}.jpg`;
  89  |     writeFileSync(path, Buffer.from(event.data, 'base64'));
  90  |     frames.push({ path, timestamp: event.metadata.timestamp!, receipt: Date.now() });
  91  |     void cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId });
  92  |   });
  93  |   await cdp.send('Page.startScreencast', {
  94  |     format: 'jpeg',
  95  |     quality: 87,
  96  |     maxWidth: page.viewportSize()!.width,
  97  |     maxHeight: page.viewportSize()!.height,
  98  |     everyNthFrame: 3,
  99  |   });
  100 |   return async () => {
  101 |     await cdp.send('Page.stopScreencast');
  102 |     const recording = audioAvailable
  103 |       ? await passive(page, async () => {
  104 |           const r = (window as any).__readabilityRecording;
  105 |           r.recorder.stop();
  106 |           return { start: r.start, bytes: await r.stopped };
  107 |         })
  108 |       : null;
  109 |     if (recording) writeFileSync(`${directory}/runtime-audio.webm`, new Uint8Array(recording.bytes));
  110 |     const manifest = {
  111 |       name,
  112 |       viewport: page.viewportSize(),
  113 |       audioStartEpochMs: recording?.start ?? null,
  114 |       audio: recording ? `${directory}/runtime-audio.webm` : null,
  115 |       frames,
  116 |       method:
  117 |         'Uninterrupted native viewport CDP frames and existing Sound capture stream at runtime levels. Actual UI actions at natural animation speed; no game state injection, cuts, time scaling or substituted audio. Frame timestamps retain capture stalls.',
  118 |     };
  119 |     save(`${name}-recording`, manifest);
  120 |     await cdp.detach();
  121 |     return manifest;
  122 |   };
  123 | }
  124 | 
  125 | test('actual portrait Holding rescue, tide and terminal Undo, then uninterrupted Harbor handoff', async ({ browser, baseURL }) => {
  126 |   const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  127 |   const page = await context.newPage();
  128 |   const errors: string[] = [];
  129 |   const observations: unknown[] = [];
  130 |   let stop: Awaited<ReturnType<typeof recordRuntime>> | undefined;
  131 |   page.on('pageerror', (e) => errors.push(e.message));
  132 |   try {
  133 |     await page.goto('/');
  134 |     await expect(page.locator('#home-play')).toBeVisible();
  135 |     await coldTouch(page, 'home-play');
  136 |     await expect(page.locator('#story-continue')).toBeVisible();
  137 |     for (const shot of ['lantern', 'ferry']) {
  138 |       await page.waitForTimeout(550);
  139 |       await activate(page, 'story-continue', true);
  140 |       await expect.poll(async () => (await inspect(page)).story.timeline.shot).toBe(shot);
  141 |     }
  142 |     await page.waitForTimeout(550);
  143 |     await activate(page, 'story-continue', true);
> 144 |     await expect(page.locator('#story-continue')).toHaveCount(0);
      |                                                   ^ Error: expect(locator).toHaveCount(expected) failed
  145 |     await idle(page);
  146 |     expect(await state(page)).toMatchObject({ turn: 0, tideLevel: 0, boatNodeId: 'stone', aboard: ['sheep-1'] });
  147 |     const coveStart = await checkpoint(page);
  148 |     stop = await recordRuntime(page, 'actual-holding-harbor');
  149 |     await snap(page, '390x844-holding-start');
  150 |     await act(page, 'unload', true);
  151 |     for (const id of ['map-shallows', 'map-rabbit-pier']) {
  152 |       const before = await state(page);
  153 |       await activate(page, id, true);
  154 |       expect(await state(page)).toEqual(before);
  155 |       await fullyVisible(page, page.locator('#sail'));
  156 |       await activate(page, 'sail', true);
  157 |       await idle(page);
  158 |       expect((await state(page)).turn).toBe(before.turn + 1);
  159 |     }
  160 |     const beforeRise = await state(page);
  161 |     await activate(page, 'board', true);
  162 |     await expect(page.locator('#preview')).toContainText(/Pip.*Rue/s);
  163 |     for (const id of ['passenger-rabbit-1', 'passenger-rabbit-2', 'commit']) await fullyVisible(page, page.locator(`#${id}`));
  164 |     await snap(page, '390x844-critical-boarding');
  165 |     await activate(page, 'commit', true);
  166 |     await idle(page);
  167 |     expect(await state(page)).toMatchObject({ turn: 4, tideLevel: 1, status: 'playing' });
  168 |     await snap(page, '390x844-holding-first-rise');
  169 |     await undo(page, true);
  170 |     expect(await state(page)).toEqual(beforeRise);
  171 |     await act(page, 'board', true);
  172 |     for (const id of ['map-shallows', 'map-stone', 'board', 'map-harbor']) await act(page, id, true);
  173 |     const beforeVictory = await state(page);
  174 |     await act(page, 'unload', true);
  175 |     expect(await state(page)).toMatchObject({ turn: 9, tideLevel: 2, status: 'won' });
  176 |     expect(await checkpoint(page)).toBe(coveStart);
  177 |     await undo(page, true);
  178 |     expect(await state(page)).toEqual(beforeVictory);
  179 |     await act(page, 'unload', true);
  180 |     await snap(page, '390x844-holding-arrival');
  181 |     observations.push(await inspect(page));
  182 |     await activate(page, 'continue-story', true);
  183 |     await fullyVisible(page, page.locator('#story-continue'));
  184 |     const pending = await checkpoint(page);
  185 |     expect(JSON.parse(pending!)).toMatchObject({ checkpoint: { kind: 'scene', id: 'another-bell' }, completed: ['holding-pier'] });
  186 |     await snap(page, '390x844-earned-harbor-begin');
  187 |     const interruptions: unknown[] = [];
  188 |     await expect.poll(async () => {
  189 |       const frame = (await inspect(page)).story.timeline;
  190 |       if (frame.paused && !frame.settled) interruptions.push(frame);
  191 |       return frame.settled;
  192 |     }, { timeout: 20000, intervals: [150] }).toBe(true);
  193 |     save('harbor-uninterrupted-observations', interruptions);
  194 |     expect(interruptions).toEqual([]);
  195 |     expect(await checkpoint(page)).toBe(pending);
  196 |     const fit = await page.evaluate(measureStory);
  197 |     save('390x844-earned-harbor-fit', fit);
  198 |     expect(fit.failures).toEqual([]);
  199 |     await snap(page, '390x844-earned-harbor-end');
  200 |     await activate(page, 'story-continue', true);
  201 |     await idle(page);
  202 |     expect((await inspect(page)).campaign.level).toBe('bellwater');
  203 |     expect(await state(page)).toMatchObject({ turn: 0, tideLevel: 0, status: 'playing', boatNodeId: 'harbor', aboard: [], delivered: [] });
  204 |     const bellCheckpoint = await checkpoint(page);
  205 |     expect(JSON.parse(bellCheckpoint!)).toMatchObject({ completed: ['holding-pier'], acknowledgedScenes: ['opening', 'another-bell'] });
  206 |     await snap(page, '390x844-earned-bellwater-start');
  207 |     observations.push(await inspect(page));
  208 |     await page.waitForTimeout(500);
  209 |     expect(errors).toEqual([]);
  210 |   } finally {
  211 |     if (stop) await stop();
  212 |     save('holding-journey-result', { browser: browser.version(), node: process.version, baseURL, viewport: page.viewportSize(), errors, observations, final: await inspect(page).catch(() => null) });
  213 |     await context.close();
  214 |   }
  215 | });
  216 | 
  217 | test('actual short landscape Driftwood rescue preserves subset warnings, tide Undo and practice isolation', async ({ browser, baseURL }) => {
  218 |   const context = await browser.newContext({ baseURL, viewport: { width: 780, height: 320 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  219 |   const page = await context.newPage();
  220 |   const errors: string[] = [];
  221 |   page.on('pageerror', (e) => errors.push(e.message));
  222 |   const saved = JSON.stringify({ version: 1, checkpoint: { kind: 'cove', id: 'holding-pier' }, completed: [], acknowledgedScenes: ['opening'] });
  223 |   try {
  224 |     await page.addInitScript(({ key, saved }) => localStorage.setItem(key, saved), { key: journeyKey, saved });
  225 |     await page.goto('/?cove=driftwood-yard');
  226 |     await idle(page);
  227 |     await snap(page, '780x320-driftwood-start');
  228 |     for (const id of ['map-yard', 'board', 'map-mooring', 'unload', 'map-bend', 'map-reeds']) await act(page, id, true);
  229 |     const beforeRise = await state(page);
  230 |     await activate(page, 'board', true);
  231 |     await activate(page, 'passenger-oat', true);
  232 |     await expect(page.locator('#preview')).toContainText(/Oat.*floods/s);
  233 |     expect(await state(page)).toEqual(beforeRise);
  234 |     await snap(page, '780x320-driftwood-subset-loss-preview');
  235 |     await activate(page, 'cancel', true);
  236 |     await activate(page, 'board', true);
  237 |     for (const id of ['passenger-fern', 'passenger-oat', 'commit']) await fullyVisible(page, page.locator(`#${id}`));
  238 |     await snap(page, '780x320-driftwood-critical-boarding');
  239 |     await activate(page, 'commit', true);
  240 |     await idle(page);
  241 |     expect(await state(page)).toMatchObject({ turn: 7, tideLevel: 1, status: 'playing', aboard: ['fern', 'oat'] });
  242 |     await snap(page, '780x320-driftwood-first-rise');
  243 |     await undo(page, true);
  244 |     expect(await state(page)).toEqual(beforeRise);
```