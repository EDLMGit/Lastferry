# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reef-return.spec.ts >> portrait greedy pickup, blocked loaded return and six-step recovery
- Location: tests\e2e\reef-return.spec.ts:22:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('#sail')
Expected substring: "anyway"
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" locator('#sail') with timeout 15000ms
  - waiting for locator('#sail')
    - waiting for "http://127.0.0.1:5270/?cove=reef-return" navigation to finish...
    - navigated to "http://127.0.0.1:5270/?cove=reef-return"

```

```yaml
- main:
  - region "Reef Return":
    - button "0 of 6 spaces · boat needs depth 1 · crossing status": 0/6 · Depth 1
    - navigation "Crossing controls":
      - button "Undo" [disabled]
      - button "Wait · 1 action"
      - button "Menu"
      - button "Enable sound": Sound
    - navigation "Map stops":
      - button "Select Harbor; no direct passage; Home, delivery destination": Harbor · Home
      - button "Select Cairn Quay; adjacent passage available": Cairn Quay
      - button "Select Wrack Pier; current location": Wrack Pier
      - button "Select Shell Pool; no direct passage": Shell Pool
    - navigation "Passenger actions at Wrack Pier":
      - button "Board"
    - button "Wrack Pier floods in 3 actions. Needle Reef flows from Cairn Quay to Harbor. After 8 actions, it turns toward Cairn Quay. Open reef and tide forecast.":
      - strong: Wrack Pier floods in 3 actions.
      - text: Needle Reef to Harbor · turns in 8 actions
    - navigation "Cove view":
      - button "Whole cove"
  - status
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | import { mkdirSync, writeFileSync } from 'node:fs';
  3   | import { join } from 'node:path';
  4   | import { act, activate, idle, undo, fullyVisible } from './ui';
  5   | import { journeyKey, passive } from './story-support';
  6   | import { productionURL } from './evidence';
  7   | 
  8   | const out = process.env.LAST_FERRY_REVIEW_DIR ?? 'test-results/reef-return';
  9   | const report = (name: string, data: unknown) => writeFileSync(join(out, name + '.json'), JSON.stringify(data, null, 2));
  10  | test.beforeAll(() => { mkdirSync(out, { recursive: true }); });
  11  | 
  12  | async function photo(page: Page, name: string) {
  13  |   await page.waitForTimeout(350);
  14  |   await page.screenshot({ path: join(out, name + '.png'), animations: 'allow' });
  15  | }
  16  | 
  17  | async function playView(page: Page) {
  18  |   if ((await page.locator('#view-toggle').textContent())?.includes('Play view'))
  19  |     await activate(page, 'view-toggle', true);
  20  | }
  21  | 
  22  | test('portrait greedy pickup, blocked loaded return and six-step recovery', async ({ browser, baseURL }) => {
  23  |   const ctx = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, hasTouch: true });
  24  |   const page = await ctx.newPage();
  25  |   await page.goto('/?cove=reef-return');
  26  |   await transfer(page, 'board');
  27  |   await cross(page, 'quay');
  28  |   const before = await passive(page, () => (window as any).__LAST_FERRY__.getState());
  29  |   await activate(page, 'map-harbor', true);
> 30  |   await expect(page.locator('#sail')).toContainText('anyway');
      |                                       ^ Error: expect(locator).toContainText(expected) failed
  31  |   await expect(page.locator('#local-context')).toContainText('Birch');
  32  |   await activate(page, 'close-location', true);
  33  |   await act(page, 'wait', true);
  34  |   await cross(page, 'pool');
  35  |   await transfer(page, 'board');
  36  |   await activate(page, 'map-quay', true);
  37  |   await expect(page.locator('#sail')).toBeDisabled();
  38  |   await expect(page.locator('#local-context')).toContainText(/depth 4.*passage 3/i);
  39  |   await photo(page, '390x844-greedy-return');
  40  |   await activate(page, 'close-location', true);
  41  |   for (let targetTurn = 6; targetTurn <= 8; targetTurn++) {
  42  |     await activate(page, 'wait', true);
  43  |     await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  44  |     if (targetTurn === 8) await expect(page.locator('#dialog')).toContainText(/reef|current/i);
  45  |     await activate(page, 'commit', true);
  46  |     await idle(page);
  47  |     await expect(page.locator('[data-testid=turn]')).toHaveText(String(targetTurn).padStart(2, '0'));
  48  |   }
  49  |   await expect(page.locator('#dialog')).toHaveAttribute('data-outcome', 'lost');
  50  |   await expect(page.locator('#dialog')).toContainText(/will not turn|away from Harbor/i);
  51  |   await photo(page, '390x844-greedy-loss');
  52  |   for (let turn = 8; turn > 2; turn--) await undo(page, true);
  53  |   expect(await passive(page, () => (window as any).__LAST_FERRY__.getState())).toEqual(before);
  54  |   await transfer(page, 'unload', ['heather']);
  55  |   await expect(page.locator('[data-testid=tide]')).toHaveText('1');
  56  |   expect(await passive(page, key => localStorage.getItem(key), journeyKey)).toBeNull();
  57  |   await ctx.close();
  58  | });
  59  | 
  60  | async function cross(page: Page, to: string) {
  61  |   await act(page, 'map-' + to, true);
  62  |   await playView(page);
  63  | }
  64  | 
  65  | async function transfer(page: Page, type: 'board' | 'unload', subset?: string[], chooserPicture?: string) {
  66  |   await activate(page, type, true);
  67  |   if (await page.locator('#dialog[open][data-mode=action]').count()) {
  68  |     const options = page.locator('.passenger-options button');
  69  |     if (subset) {
  70  |       for (const button of await options.all()) {
  71  |         const name = (await button.getAttribute('id'))!.replace('passenger-', '');
  72  |         if (((await button.getAttribute('aria-pressed')) === 'true') !== subset.includes(name))
  73  |           await button.tap();
  74  |       }
  75  |     }
  76  |     if (chooserPicture) {
  77  |       await fullyVisible(page, page.locator('#commit'));
  78  |       await photo(page, chooserPicture);
  79  |     }
  80  |     await activate(page, 'commit', true);
  81  |   }
  82  |   await idle(page);
  83  | }
  84  | 
  85  | async function record(page: Page) {
  86  |   const directory = join(out, 'raw', 'reef-rescue');
  87  |   mkdirSync(directory, { recursive: true });
  88  |   const audioStartEpochMs = await passive(page, () => {
  89  |     const stream = (window as any).__LAST_FERRY__.captureAudioStream();
  90  |     if (!stream) throw Error('No runtime audio stream');
  91  |     const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
  92  |     const chunks: Blob[] = [];
  93  |     const done = new Promise<number[]>((resolve) => {
  94  |       recorder.ondataavailable = (event) => chunks.push(event.data);
  95  |       recorder.onstop = async () => resolve(Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())));
  96  |     });
  97  |     (window as any).__reefCapture = { recorder, done };
  98  |     const start = performance.timeOrigin + performance.now();
  99  |     recorder.start();
  100 |     return start;
  101 |   });
  102 |   const cdp = await page.context().newCDPSession(page);
  103 |   const frames: { path: string; timestamp: number; receipt: number }[] = [];
  104 |   cdp.on('Page.screencastFrame', (event) => {
  105 |     const path = join(directory, 'frame-' + String(frames.length).padStart(6, '0') + '.jpg');
  106 |     writeFileSync(path, Buffer.from(event.data, 'base64'));
  107 |     frames.push({ path, timestamp: event.metadata.timestamp!, receipt: Date.now() });
  108 |     void cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId });
  109 |   });
  110 |   await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, everyNthFrame: 2 });
  111 |   return async () => {
  112 |     await cdp.send('Page.stopScreencast');
  113 |     const bytes = await passive(page, async () => {
  114 |       const { recorder, done } = (window as any).__reefCapture;
  115 |       recorder.stop();
  116 |       return await done as number[];
  117 |     });
  118 |     const audio = join(directory, 'runtime-audio.webm');
  119 |     writeFileSync(audio, new Uint8Array(bytes));
  120 |     report('reef-rescue-recording', { viewport: page.viewportSize(), audioStartEpochMs, audio, frames });
  121 |     await cdp.detach();
  122 |   };
  123 | }
  124 | 
  125 | for (const landscape of [true, false]) {
  126 |   test(landscape ? 'short landscape production rescue, missed window and Undo' : 'portrait rescue, forecast, mixed loading and uninterrupted runtime sound', async ({ browser, baseURL }) => {
  127 |     test.setTimeout(240000);
  128 |     const viewport = landscape ? { width: 780, height: 320 } : { width: 390, height: 844 };
  129 |     const ctx = await browser.newContext({ viewport, hasTouch: true, isMobile: true, deviceScaleFactor: 1, reducedMotion: landscape ? 'reduce' : 'no-preference' });
  130 |     const page = await ctx.newPage();
```