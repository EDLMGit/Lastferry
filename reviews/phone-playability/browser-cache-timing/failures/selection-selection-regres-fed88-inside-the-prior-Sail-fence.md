# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: selection.spec.ts >> selection regression: the arrived dock permits a deliberate local action inside the prior Sail fence
- Location: tests\e2e\selection.spec.ts:285:1

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 180
Received:    377.5999999642372
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - main [ref=e3]:
    - region "First Crossing" [ref=e4]:
      - generic "First Crossing. Use the labeled waypoint controls to navigate." [ref=e6]
      - generic [ref=e7]:
        - generic [ref=e8]:
          - heading "The First Crossing" [level=1] [ref=e9]
          - paragraph [ref=e10]: Bring all three passengers to Harbor
        - generic "Crossing progress" [ref=e11]:
          - strong [ref=e12]: Depth 2 · 2/4 spaces
          - generic [ref=e13]: 01 actions · Tide 0 · Home 0/3
        - navigation "Crossing controls" [ref=e14]:
          - button "↶ Undo" [ref=e15] [cursor=pointer]
          - button "Wait · 1 action" [ref=e16] [cursor=pointer]
          - button "Menu" [ref=e17] [cursor=pointer]
          - button "Mute sound" [ref=e18] [cursor=pointer]: ♫
      - navigation "Map stops":
        - generic:
          - button "Select Harbor; no direct passage; Home, delivery destination":
            - generic [aria-hidden] [ref=e20] [cursor=pointer]: ◇
            - generic [ref=e21] [cursor=pointer]: Harbor · Home
        - generic:
          - button "Select Shallow Cut; adjacent passage available":
            - generic [ref=e23] [cursor=pointer]
            - generic [ref=e25] [cursor=pointer]: Shallow Cut
        - generic:
          - button "Select Sheep Pier; current location":
            - generic [aria-hidden] [ref=e28] [cursor=pointer]: •
            - generic [ref=e29] [cursor=pointer]: Sheep Pier
        - generic:
          - button "Select East Buoy; adjacent passage available":
            - generic [ref=e31] [cursor=pointer]
            - generic [ref=e33] [cursor=pointer]: East Buoy
        - generic:
          - button "Select South Buoy; no direct passage":
            - generic [aria-hidden] [ref=e36] [cursor=pointer]: ◇
            - generic [ref=e37] [cursor=pointer]: South Buoy
        - generic:
          - button "Select West Buoy; no direct passage":
            - generic [aria-hidden] [ref=e40] [cursor=pointer]: ◇
            - generic [ref=e41] [cursor=pointer]: West Buoy
      - paragraph: Select a place to see its options.
      - button "Open tide and pier forecast" [ref=e43] [cursor=pointer]:
        - generic [aria-hidden] [ref=e44]: "!"
        - strong [ref=e46]: Sheep Pier floods in 7 actions.
      - navigation "Cove view" [ref=e47]:
        - button "Play view" [pressed] [ref=e48] [cursor=pointer]
        - button "Back to boat" [ref=e49] [cursor=pointer]
    - status [ref=e50]: 1 actions completed. Sheep Pier floods in 7 actions.
  - dialog [ref=e51]:
    - generic [ref=e52]:
      - banner [ref=e53]:
        - generic [ref=e54]:
          - paragraph [ref=e55]: Sheep Pier · inspection is free
          - heading "Board Moss" [level=2] [ref=e56]
        - button "Close dialog" [active] [ref=e57] [cursor=pointer]: ×
      - generic [ref=e58]:
        - group "Passenger selection" [ref=e59]:
          - button "Moss · 2 spaces" [pressed] [ref=e60] [cursor=pointer]
        - paragraph [ref=e61]: "After boarding: boat needs depth 3."
        - paragraph [ref=e62]: "Moss will be aboard. Passage to Shallow Cut has depth 2: too shallow."
        - paragraph [ref=e63]: Boat 4/4 spaces · tide 0
      - contentinfo [ref=e64]:
        - button "Confirm · 1 action" [ref=e65] [cursor=pointer]
```

# Test source

```ts
  218 |       expect(await snapshot(page)).toEqual(beforeScenery);
  219 |       unrelatedScenery = { point: sceneryPoint, before: beforeScenery, after: await snapshot(page) };
  220 |     }
  221 |     writeFileSync(
  222 |       `${reviewDir}/selection-${label}-picking.json`,
  223 |       JSON.stringify(
  224 |         {
  225 |           input: touch ? 'Chromium emulated touch' : 'mouse and natural keyboard',
  226 |           viewport: [width, height],
  227 |           initial,
  228 |           frame: firstFrame,
  229 |           trace,
  230 |           final,
  231 |           unrelatedScenery,
  232 |         },
  233 |         null,
  234 |         2,
  235 |       ),
  236 |     );
  237 |     await context.close();
  238 |   });
  239 | }
  240 | 
  241 | test('selection regression: an explicit new place permits the next trusted Sail inside the previous 180ms fence', async ({ browser }) => {
  242 |   mkdirSync(reviewDir, { recursive: true });
  243 |   const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  244 |   const page = await context.newPage();
  245 |   await ready(page, 'holding-pier');
  246 |   expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getEnvironmentStatus().reducedMotion)).toBe(true);
  247 |   await activate(page, 'unload'); await activate(page, 'commit'); await idle(page);
  248 |   await activate(page, 'map-shallows');
  249 |   const first = await page.locator('#sail').boundingBox();
  250 |   await page.evaluate(() => {
  251 |     const runtime = window as any;
  252 |     runtime.__consecutiveSailClicks = [];
  253 |     runtime.__consecutiveSailTrace = (event: MouseEvent) => runtime.__consecutiveSailClicks.push({
  254 |       at: performance.now(), trusted: event.isTrusted, target: (event.target as HTMLElement).closest('button')?.id,
  255 |       x: event.clientX, y: event.clientY,
  256 |     });
  257 |     window.addEventListener('click', runtime.__consecutiveSailTrace, true);
  258 |   });
  259 |   await page.mouse.click(first!.x + first!.width / 2, first!.y + first!.height / 2);
  260 |   await page.waitForFunction(() => document.querySelector('#seascape')?.getAttribute('aria-busy') === 'false');
  261 |   const rabbit = await page.locator('#map-rabbit-pier').boundingBox();
  262 |   await page.mouse.click(rabbit!.x + rabbit!.width / 2, rabbit!.y + rabbit!.height / 2);
  263 |   const second = await page.locator('#sail').boundingBox();
  264 |   const x = second!.x + second!.width / 2, y = second!.y + second!.height / 2;
  265 |   await page.mouse.click(x, y);
  266 |   await page.waitForFunction(() => document.querySelector('#seascape')?.getAttribute('aria-busy') === 'false');
  267 |   const clicks = await page.evaluate(() => {
  268 |     const runtime = window as any;
  269 |     window.removeEventListener('click', runtime.__consecutiveSailTrace, true);
  270 |     return runtime.__consecutiveSailClicks;
  271 |   });
  272 |   const result = { clicks, gapMs: clicks[2]?.at - clicks[0]?.at, first, second, final: await snapshot(page) };
  273 |   writeFileSync(`${reviewDir}/consecutive-sail-regression.json`, JSON.stringify(result, null, 2));
  274 |   expect(clicks).toHaveLength(3);
  275 |   expect(clicks.every((click: any) => click.trusted)).toBe(true);
  276 |   expect(clicks.map((click: any) => click.target)).toEqual(['sail', 'map-rabbit-pier', 'sail']);
  277 |   expect(result.gapMs, 'The new intentional Sail must exercise the still-live old fence').toBeLessThanOrEqual(180);
  278 |   expect(result.final.state).toMatchObject({ turn: 3, boatNodeId: 'rabbit-pier' });
  279 |   expect(result.final.history).toBe(3);
  280 |   expect((await selection(page)).selectedId).toBeNull();
  281 |   await expect(page.locator('#board')).toBeVisible();
  282 |   await context.close();
  283 | });
  284 | 
  285 | test('selection regression: the arrived dock permits a deliberate local action inside the prior Sail fence', async ({ browser }) => {
  286 |   mkdirSync(reviewDir, { recursive: true });
  287 |   const context = await browser.newContext({ viewport: { width: 844, height: 390 }, reducedMotion: 'reduce', hasTouch: true, isMobile: true });
  288 |   const page = await context.newPage();
  289 |   await ready(page, 'first-crossing');
  290 |   expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getEnvironmentStatus().reducedMotion)).toBe(true);
  291 |   await activate(page, 'map-sheep-pier', true);
  292 |   const sail = await page.locator('#sail').boundingBox();
  293 |   await page.evaluate(() => {
  294 |     (window as any).__localIntentClicks = [];
  295 |     window.addEventListener('click', (event) => {
  296 |       const api=(window as any).__LAST_FERRY__,v=api.getViewStatus();
  297 |       (window as any).__localIntentClicks.push({ at: performance.now(), trusted: event.isTrusted, target: (event.target as HTMLElement).closest('button')?.id ?? null,dialogOpen:!!document.querySelector('#dialog[open]'),selectedId:document.querySelector('.map-target[aria-expanded="true"]')?.id??null,snapshot:{state:api.getState(),history:api.getRenderStatus().historyLength,desiredMusic:api.getAudioStatus().desiredArrangement,view:{mode:v.mode,scale:v.scale,focus:v.focus}} });
  298 |     }, true);
  299 |   });
  300 |   await page.touchscreen.tap(sail!.x + sail!.width / 2, sail!.y + sail!.height / 2);
  301 |   await page.waitForFunction(() => document.querySelector('#seascape')?.getAttribute('aria-busy') === 'false');
  302 |   const board = await page.locator('#board').boundingBox();
  303 |   await page.touchscreen.tap(sail!.x + sail!.width / 2, sail!.y + sail!.height / 2);
  304 |   const x = board!.x + board!.width / 2, y = board!.y + board!.height / 2;
  305 |   await page.touchscreen.tap(x, y);
  306 |   const clicks = await page.evaluate(() => (window as any).__localIntentClicks);
  307 |   const arrived=clicks[1]?.snapshot;
  308 |   const final=await page.evaluate(()=>{const api=(window as any).__LAST_FERRY__,v=api.getViewStatus();return{state:api.getState(),history:api.getRenderStatus().historyLength,desiredMusic:api.getAudioStatus().desiredArrangement,view:{mode:v.mode,scale:v.scale,focus:v.focus}};});
  309 |   const result = { sail, board, gapMs: clicks[2]?.at - clicks[0]?.at, repeatGapMs: clicks[1]?.at - clicks[0]?.at, clicks, arrived, final, modalOpen: await page.locator('#dialog[open]').count() === 1 };
  310 |   writeFileSync(`${reviewDir}/arrived-local-action-regression.json`, JSON.stringify(result, null, 2));
  311 |   expect(clicks).toHaveLength(3);
  312 |   expect(clicks[0].target).toBe('sail');
  313 |   expect(clicks[2].target).toBe('board');
  314 |   expect(clicks[2].dialogOpen).toBe(false);
  315 |   expect(clicks[2].selectedId).toBeNull();
  316 |   expect(clicks[2].snapshot).toEqual(arrived);
  317 |   expect(clicks.every((click: any) => click.trusted)).toBe(true);
> 318 |   expect(result.gapMs).toBeLessThanOrEqual(180);
      |                        ^ Error: expect(received).toBeLessThanOrEqual(expected)
  319 |   await expect(page.locator('#commit')).toBeVisible();
  320 |   await expect(page.locator('#cancel')).toBeFocused();
  321 |   expect(result.final).toEqual(arrived);
  322 |   expect(arrived.state).toMatchObject({ turn: 1, boatNodeId: 'sheep-pier' });
  323 |   expect(arrived.history).toBe(1);
  324 |   await page.keyboard.press('Escape');
  325 |   await expect(page.locator('#board')).toBeFocused();
  326 |   await context.close();
  327 | });
  328 | 
  329 | test('selection lifecycle: repeated trusted actions, separate Escape layers, transit, visibility recovery, Undo and Restart', async ({
  330 |   browser,
  331 | }) => {
  332 |   const evidence: any[] = [];
  333 |   mkdirSync(reviewDir, { recursive: true });
  334 |   for (const reduced of [false, true]) {
  335 |     const context = await browser.newContext({
  336 |       viewport: { width: 844, height: 390 },
  337 |       deviceScaleFactor: 1,
  338 |       hasTouch: true,
  339 |       isMobile: true,
  340 |       reducedMotion: reduced ? 'reduce' : 'no-preference',
  341 |     });
  342 |     const page = await context.newPage();
  343 |     await ready(page, 'holding-pier');
  344 |     const original = await snapshot(page);
  345 |     await tabTo(page, 'map-stone');
  346 |     await page.keyboard.press('Enter');
  347 |     await expect(page.locator('#local-heading')).toBeFocused();
  348 |     await page.keyboard.down('Enter');
  349 |     await page.keyboard.press('Enter');
  350 |     await page.keyboard.up('Enter');
  351 |     expect(await snapshot(page)).toEqual(original);
  352 |     await tabTo(page, 'unload');
  353 |     await page.keyboard.press('Enter');
  354 |     await expect(page.locator('#cancel')).toBeFocused();
  355 |     await page.keyboard.press('Escape');
  356 |     await expect(page.locator('#unload')).toBeFocused();
  357 |     await expect(page.locator('#local-context')).toBeVisible();
  358 |     expect((await selection(page)).selectedId).toBe('stone');
  359 |     await page.keyboard.press('Escape');
  360 |     await expect(page.locator('#local-context')).toBeHidden();
  361 |     await expect(page.locator('#map-stone')).toBeFocused();
  362 |     for (const id of ['wait', 'menu', 'status-toggle']) {
  363 |       await activate(page, id, true);
  364 |       await expect(page.locator('#dialog')).toBeVisible();
  365 |       await page.keyboard.press('Escape');
  366 |       await expect(page.locator(`#${id}`)).toBeFocused();
  367 |       expect((await selection(page)).selectedId).toBeNull();
  368 |       await expect(page.locator('#local-context')).toBeHidden();
  369 |       expect(await snapshot(page)).toEqual(original);
  370 |     }
  371 |     await activate(page, 'unload', true);
  372 |     await page.evaluate(() => {
  373 |       const runtime = window as any;
  374 |       runtime.__selectionActionClicks = [];
  375 |       runtime.__selectionTrace = (event: MouseEvent) =>
  376 |         runtime.__selectionActionClicks.push({
  377 |           type: event.type,
  378 |           at: performance.now(),
  379 |           trusted: event.isTrusted,
  380 |           target: (event.target as HTMLElement).closest('button')?.id ?? '',
  381 |           x: event.clientX,
  382 |           y: event.clientY,
  383 |         });
  384 |       for (const type of ['pointerdown', 'pointerup', 'click']) window.addEventListener(type, runtime.__selectionTrace, true);
  385 |     });
  386 |     const confirm = await page.locator('#commit').boundingBox();
  387 |     await page.touchscreen.tap(confirm!.x + confirm!.width / 2, confirm!.y + confirm!.height / 2);
  388 |     await page.touchscreen.tap(confirm!.x + confirm!.width / 2, confirm!.y + confirm!.height / 2);
  389 |     await idle(page);
  390 |     expect(await state(page)).toMatchObject({
  391 |       turn: 1,
  392 |       boatNodeId: 'stone',
  393 |       aboard: [],
  394 |       waitingByPier: { 'stone-pier': ['sheep-1'] },
  395 |     });
  396 |     expect((await rendered(page)).historyLength).toBe(1);
  397 |     await expect(page.locator('#dialog')).toBeHidden();
  398 |     expect((await selection(page)).selectedId).toBe('stone');
  399 |     await activate(page, 'map-shallows', true);
  400 |     const beforeMove = await snapshot(page),
  401 |       sail = await page.locator('#sail').boundingBox();
  402 |     await page.touchscreen.tap(sail!.x + sail!.width / 2, sail!.y + sail!.height / 2);
  403 |     await page.touchscreen.tap(sail!.x + sail!.width / 2, sail!.y + sail!.height / 2);
  404 |     if (!reduced) await expect(page.locator('#local-context')).toBeHidden();
  405 |     await idle(page);
  406 |     expect(await state(page)).toMatchObject({ turn: 2, boatNodeId: 'shallows' });
  407 |     expect((await rendered(page)).historyLength).toBe(2);
  408 |     expect((await selection(page)).selectedId).toBe('shallows');
  409 |     await expect(page.locator('#local-context')).toBeVisible();
  410 |     await expect(page.locator('#local-context')).toContainText('Waypoint');
  411 |     const clicks = await page.evaluate(() => {
  412 |       const runtime = window as any;
  413 |       for (const type of ['pointerdown', 'pointerup', 'click']) window.removeEventListener(type, runtime.__selectionTrace, true);
  414 |       return runtime.__selectionActionClicks;
  415 |     });
  416 |     const downs = clicks.filter((event: any) => event.type === 'pointerdown');
  417 |     const ups = clicks.filter((event: any) => event.type === 'pointerup');
  418 |     expect(downs).toHaveLength(5);
```