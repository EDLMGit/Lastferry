# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: driftwood-yard.spec.ts >> earned Bellwater boundary, new scene and uninterrupted actual Driftwood rescue with audio
- Location: tests\e2e\driftwood-yard.spec.ts:222:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 10000ms exceeded while waiting on the predicate
```

# Test source

```ts
  51  | async function seeded(page: Page, record: unknown) {
  52  |   await page.addInitScript(
  53  |     ({ key, record }) => {
  54  |       if (!sessionStorage.seeded) {
  55  |         localStorage.setItem(key, JSON.stringify(record));
  56  |         sessionStorage.seeded = '1';
  57  |       }
  58  |     },
  59  |     { key: journeyKey, record },
  60  |   );
  61  | }
  62  | function source(name: string) {
  63  |   const walk = (dir: string): string[] =>
  64  |     readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  65  |       e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
  66  |     );
  67  |   save(name, {
  68  |     head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  69  |     at: new Date().toISOString(),
  70  |     files: Object.fromEntries(
  71  |       [...walk('src'), ...walk('data'), 'package.json', 'package-lock.json']
  72  |         .sort()
  73  |         .map((p) => [p, createHash('sha256').update(readFileSync(p)).digest('hex')]),
  74  |     ),
  75  |     node: process.version,
  76  |   });
  77  | }
  78  | test.beforeAll(() => source('source-before'));
  79  | test.afterAll(() => source('source-after'));
  80  | async function endScene(page: Page, prefix: string) {
  81  |   await snap(page, `${prefix}-begin`);
  82  |   let middle = false;
  83  |   const interruptions: any[] = [];
  84  |   await expect
  85  |     .poll(
  86  |       async () => {
  87  |         const t = await timeline(page);
  88  |         if (!middle && t.elapsed >= 2800) {
  89  |           middle = true;
  90  |           await snap(page, `${prefix}-middle`);
  91  |         }
  92  |         if (t.paused && !t.settled && !t.recap) {
  93  |           interruptions.push(t);
  94  |           await activate(page, 'story-pause', true);
  95  |         }
  96  |         return t.settled;
  97  |       },
  98  |       { timeout: 30000, intervals: [180] },
  99  |     )
  100 |     .toBe(true);
  101 |   await snap(page, `${prefix}-end`);
  102 |   save(`${prefix}-interruptions`, interruptions);
  103 | }
  104 | async function driftRescue(page: Page, prefix: string) {
  105 |   expect(await state(page)).toMatchObject({ turn: 0, boatNodeId: 'harbor', aboard: [] });
  106 |   await snap(page, `${prefix}-start`);
  107 |   for (const id of ['map-yard', 'board', 'map-mooring']) await act(page, id, true);
  108 |   await snap(page, `${prefix}-nell-aboard`);
  109 |   await act(page, 'unload', true);
  110 |   await snap(page, `${prefix}-nell-staged`);
  111 |   for (const id of ['map-bend', 'map-reeds']) await act(page, id, true);
  112 |   const before = await state(page);
  113 |   await activate(page, 'board', true);
  114 |   await activate(page, 'passenger-oat', true);
  115 |   await expect(page.locator('#preview')).toContainText(/Oat.*floods/);
  116 |   expect(await state(page)).toEqual(before);
  117 |   await activate(page, 'cancel', true);
  118 |   expect(await state(page)).toEqual(before);
  119 |   await activate(page, 'board', true);
  120 |   await snap(page, `${prefix}-rabbits-preview`);
  121 |   for (const id of ['passenger-fern', 'passenger-oat', 'commit'])
  122 |     await fullyVisible(page, page.locator(`#${id}`));
  123 |   await activate(page, 'commit', true);
  124 |   await idle(page);
  125 |   expect(await state(page)).toMatchObject({
  126 |     turn: 7,
  127 |     tideLevel: 1,
  128 |     status: 'playing',
  129 |     aboard: ['fern', 'oat'],
  130 |   });
  131 |   await snap(page, `${prefix}-first-rise`);
  132 |   await undo(page, true);
  133 |   expect(await state(page)).toEqual(before);
  134 |   await act(page, 'board', true);
  135 |   for (const id of ['map-bend', 'map-mooring', 'board']) await act(page, id, true);
  136 |   await snap(page, `${prefix}-full-deck`);
  137 |   await act(page, 'map-harbor', true);
  138 |   expect(await state(page)).toMatchObject({ turn: 11, tideLevel: 2 });
  139 |   await activate(page, 'unload', true);
  140 |   await snap(page, `${prefix}-delivery-preview`);
  141 |   await expect
  142 |     .poll(() =>
  143 |       page
  144 |         .locator('#preview img')
  145 |         .evaluateAll((images) =>
  146 |           images.every(
  147 |             (i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0,
  148 |           ),
  149 |         ),
  150 |     )
> 151 |     .toBe(true);
      |      ^ Error: expect(received).toBe(expected) // Object.is equality
  152 |   const fit = await page.evaluate(measureStory);
  153 |   save(`${prefix}-delivery-fit`, fit);
  154 |   expect(fit.failures).toEqual([]);
  155 |   await activate(page, 'commit', true);
  156 |   await idle(page);
  157 |   expect(await state(page)).toMatchObject({ turn: 12, status: 'won' });
  158 |   await snap(page, `${prefix}-arrival`);
  159 |   await undo(page, true);
  160 |   expect(await state(page)).toMatchObject({ turn: 11, status: 'playing', delivered: [] });
  161 |   await act(page, 'unload', true);
  162 |   expect(await state(page)).toMatchObject({ turn: 12, status: 'won' });
  163 | }
  164 | async function recordRuntime(page: Page, name: string) {
  165 |   const directory = `${reviewDir}/raw/${name}`;
  166 |   mkdirSync(directory, { recursive: true });
  167 |   await passive(page, () => {
  168 |     const startAudio = () => {
  169 |       const stream = (window as any).__LAST_FERRY__.captureAudioStream();
  170 |       if (!stream || (window as any).__storyRecording) return;
  171 |       const chunks: Blob[] = [],
  172 |         recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
  173 |       const start = performance.timeOrigin + performance.now();
  174 |       const stopped = new Promise<number[]>((resolve) => {
  175 |         recorder.ondataavailable = (e) => chunks.push(e.data);
  176 |         recorder.onstop = async () =>
  177 |           resolve(Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())));
  178 |       });
  179 |       (window as any).__storyRecording = { recorder, stopped, start };
  180 |       recorder.start();
  181 |     };
  182 |     document.addEventListener('click', startAudio, { capture: true, once: true });
  183 |   });
  184 |   const cdp = await page.context().newCDPSession(page),
  185 |     frames: { path: string; timestamp: number; receipt: number }[] = [];
  186 |   cdp.on('Page.screencastFrame', (event) => {
  187 |     const path = `${directory}/frame-${String(frames.length).padStart(6, '0')}.jpg`;
  188 |     writeFileSync(path, Buffer.from(event.data, 'base64'));
  189 |     frames.push({ path, timestamp: event.metadata.timestamp!, receipt: Date.now() });
  190 |     void cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId });
  191 |   });
  192 |   await cdp.send('Page.startScreencast', {
  193 |     format: 'jpeg',
  194 |     quality: 87,
  195 |     maxWidth: page.viewportSize()!.width,
  196 |     maxHeight: page.viewportSize()!.height,
  197 |     everyNthFrame: 1,
  198 |   });
  199 |   return async () => {
  200 |     await cdp.send('Page.stopScreencast');
  201 |     const audioBytes = await page.evaluate(async () => {
  202 |       const capture = (window as any).__storyRecording;
  203 |       capture.recorder.stop();
  204 |       return capture.stopped as Promise<number[]>;
  205 |     });
  206 |     writeFileSync(`${directory}/runtime-audio.webm`, new Uint8Array(audioBytes));
  207 |     const manifest = {
  208 |       name,
  209 |       viewport: page.viewportSize(),
  210 |       audioStartEpochMs: await passive(page, () => (window as any).__storyRecording.start),
  211 |       audio: `${directory}/runtime-audio.webm`,
  212 |       frames,
  213 |       method:
  214 |         'Uninterrupted native viewport CDP screencast plus existing Sound.captureStream master output; timestamp alignment only, no level adjustment, normalization, substituted audio or gameplay state injection.',
  215 |     };
  216 |     save(`${name}-recording`, manifest);
  217 |     await cdp.detach();
  218 |     return manifest;
  219 |   };
  220 | }
  221 | 
  222 | test('earned Bellwater boundary, new scene and uninterrupted actual Driftwood rescue with audio', async ({
  223 |   browser,
  224 |   baseURL,
  225 | }) => {
  226 |   const context = await browser.newContext({
  227 |     baseURL,
  228 |     viewport: { width: 780, height: 320 },
  229 |     hasTouch: true,
  230 |     isMobile: true,
  231 |     deviceScaleFactor: 1,
  232 |   });
  233 |   const page = await context.newPage();
  234 |   const errors: string[] = [];
  235 |   page.on('pageerror', (e) => errors.push(e.message));
  236 |   let stop: any;
  237 |   try {
  238 |     await seeded(page, bell);
  239 |     await page.goto('/');
  240 |     await coldTouch(page, 'home-play');
  241 |     await idle(page);
  242 |     stop = await recordRuntime(page, 'actual-boundary-rescue');
  243 |     await rescueBellwater(page, true);
  244 |     await undo(page, true);
  245 |     await act(page, 'unload', true);
  246 |     await activate(page, 'continue-story', true);
  247 |     await endScene(page, '780x320-driftwood-scene');
  248 |     await activate(page, 'story-continue', true);
  249 |     await idle(page);
  250 |     await driftRescue(page, '780x320');
  251 |     await activate(page, 'continue-story', true);
```