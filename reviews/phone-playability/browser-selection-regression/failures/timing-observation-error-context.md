# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: selection.spec.ts >> selection regression: the arrived dock permits a deliberate local action inside the prior Sail fence
- Location: tests\e2e\selection.spec.ts:287:1

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 180
Received:    277.30000001192093
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
  216 |       await expect(page.locator('#local-context')).toBeHidden();
  217 |       expect((await selection(page)).selectedId).toBeNull();
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
  278 |   expect(x).toBeGreaterThanOrEqual(first!.x); expect(x).toBeLessThanOrEqual(first!.x + first!.width);
  279 |   expect(y).toBeGreaterThanOrEqual(first!.y); expect(y).toBeLessThanOrEqual(first!.y + first!.height);
  280 |   expect(result.final.state).toMatchObject({ turn: 3, boatNodeId: 'rabbit-pier' });
  281 |   expect(result.final.history).toBe(3);
  282 |   expect((await selection(page)).selectedId).toBeNull();
  283 |   await expect(page.locator('#board')).toBeVisible();
  284 |   await context.close();
  285 | });
  286 | 
  287 | test('selection regression: the arrived dock permits a deliberate local action inside the prior Sail fence', async ({ browser }) => {
  288 |   mkdirSync(reviewDir, { recursive: true });
  289 |   const context = await browser.newContext({ viewport: { width: 844, height: 390 }, reducedMotion: 'reduce', hasTouch: true, isMobile: true });
  290 |   const page = await context.newPage();
  291 |   await ready(page, 'first-crossing');
  292 |   expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getEnvironmentStatus().reducedMotion)).toBe(true);
  293 |   await activate(page, 'map-sheep-pier', true);
  294 |   const sail = await page.locator('#sail').boundingBox();
  295 |   await page.evaluate(() => {
  296 |     (window as any).__localIntentClicks = [];
  297 |     window.addEventListener('click', (event) => (window as any).__localIntentClicks.push({ at: performance.now(), trusted: event.isTrusted, target: (event.target as HTMLElement).closest('button')?.id ?? null }), true);
  298 |   });
  299 |   await page.touchscreen.tap(sail!.x + sail!.width / 2, sail!.y + sail!.height / 2);
  300 |   await idle(page);
  301 |   const arrived = await snapshot(page);
  302 |   await page.touchscreen.tap(sail!.x + sail!.width / 2, sail!.y + sail!.height / 2);
  303 |   expect(await snapshot(page)).toEqual(arrived);
  304 |   expect((await selection(page)).selectedId).toBeNull();
  305 |   await expect(page.locator('#dialog')).toBeHidden();
  306 |   const board = await page.locator('#board').boundingBox();
  307 |   const x = board!.x + board!.width / 2, y = board!.y + board!.height / 2;
  308 |   await page.touchscreen.tap(x, y);
  309 |   const clicks = await page.evaluate(() => (window as any).__localIntentClicks);
  310 |   const result = { sail, board, gapMs: clicks[2]?.at - clicks[0]?.at, repeatGapMs: clicks[1]?.at - clicks[0]?.at, clicks, arrived, final: await snapshot(page), modalOpen: await page.locator('#dialog[open]').count() === 1 };
  311 |   writeFileSync(`${reviewDir}/arrived-local-action-regression.json`, JSON.stringify(result, null, 2));
  312 |   expect(clicks).toHaveLength(3);
  313 |   expect(clicks[0].target).toBe('sail');
  314 |   expect(clicks[2].target).toBe('board');
  315 |   expect(clicks.every((click: any) => click.trusted)).toBe(true);
> 316 |   expect(result.gapMs).toBeLessThanOrEqual(180);
      |                        ^ Error: expect(received).toBeLessThanOrEqual(expected)
  317 |   await expect(page.locator('#commit')).toBeVisible();
  318 |   await expect(page.locator('#cancel')).toBeFocused();
  319 |   expect(result.final).toEqual(arrived);
  320 |   expect(arrived.state).toMatchObject({ turn: 1, boatNodeId: 'sheep-pier' });
  321 |   expect(arrived.history).toBe(1);
  322 |   await page.keyboard.press('Escape');
  323 |   await expect(page.locator('#board')).toBeFocused();
  324 |   await context.close();
  325 | });
  326 | 
  327 | test('selection lifecycle: repeated trusted actions, separate Escape layers, transit, visibility recovery, Undo and Restart', async ({
  328 |   browser,
  329 | }) => {
  330 |   const evidence: any[] = [];
  331 |   mkdirSync(reviewDir, { recursive: true });
  332 |   for (const reduced of [false, true]) {
  333 |     const context = await browser.newContext({
  334 |       viewport: { width: 844, height: 390 },
  335 |       deviceScaleFactor: 1,
  336 |       hasTouch: true,
  337 |       isMobile: true,
  338 |       reducedMotion: reduced ? 'reduce' : 'no-preference',
  339 |     });
  340 |     const page = await context.newPage();
  341 |     await ready(page, 'holding-pier');
  342 |     const original = await snapshot(page);
  343 |     await tabTo(page, 'map-stone');
  344 |     await page.keyboard.press('Enter');
  345 |     await expect(page.locator('#local-heading')).toBeFocused();
  346 |     await page.keyboard.down('Enter');
  347 |     await page.keyboard.press('Enter');
  348 |     await page.keyboard.up('Enter');
  349 |     expect(await snapshot(page)).toEqual(original);
  350 |     await tabTo(page, 'unload');
  351 |     await page.keyboard.press('Enter');
  352 |     await expect(page.locator('#cancel')).toBeFocused();
  353 |     await page.keyboard.press('Escape');
  354 |     await expect(page.locator('#unload')).toBeFocused();
  355 |     await expect(page.locator('#local-context')).toBeVisible();
  356 |     expect((await selection(page)).selectedId).toBe('stone');
  357 |     await page.keyboard.press('Escape');
  358 |     await expect(page.locator('#local-context')).toBeHidden();
  359 |     await expect(page.locator('#map-stone')).toBeFocused();
  360 |     for (const id of ['wait', 'menu', 'status-toggle']) {
  361 |       await activate(page, id, true);
  362 |       await expect(page.locator('#dialog')).toBeVisible();
  363 |       await page.keyboard.press('Escape');
  364 |       await expect(page.locator(`#${id}`)).toBeFocused();
  365 |       expect((await selection(page)).selectedId).toBeNull();
  366 |       await expect(page.locator('#local-context')).toBeHidden();
  367 |       expect(await snapshot(page)).toEqual(original);
  368 |     }
  369 |     await activate(page, 'unload', true);
  370 |     await page.evaluate(() => {
  371 |       const runtime = window as any;
  372 |       runtime.__selectionActionClicks = [];
  373 |       runtime.__selectionTrace = (event: MouseEvent) =>
  374 |         runtime.__selectionActionClicks.push({
  375 |           type: event.type,
  376 |           at: performance.now(),
  377 |           trusted: event.isTrusted,
  378 |           target: (event.target as HTMLElement).closest('button')?.id ?? '',
  379 |           x: event.clientX,
  380 |           y: event.clientY,
  381 |         });
  382 |       for (const type of ['pointerdown', 'pointerup', 'click']) window.addEventListener(type, runtime.__selectionTrace, true);
  383 |     });
  384 |     const confirm = await page.locator('#commit').boundingBox();
  385 |     await page.touchscreen.tap(confirm!.x + confirm!.width / 2, confirm!.y + confirm!.height / 2);
  386 |     await page.touchscreen.tap(confirm!.x + confirm!.width / 2, confirm!.y + confirm!.height / 2);
  387 |     await idle(page);
  388 |     expect(await state(page)).toMatchObject({
  389 |       turn: 1,
  390 |       boatNodeId: 'stone',
  391 |       aboard: [],
  392 |       waitingByPier: { 'stone-pier': ['sheep-1'] },
  393 |     });
  394 |     expect((await rendered(page)).historyLength).toBe(1);
  395 |     await expect(page.locator('#dialog')).toBeHidden();
  396 |     expect((await selection(page)).selectedId).toBe('stone');
  397 |     await activate(page, 'map-shallows', true);
  398 |     const beforeMove = await snapshot(page),
  399 |       sail = await page.locator('#sail').boundingBox();
  400 |     await page.touchscreen.tap(sail!.x + sail!.width / 2, sail!.y + sail!.height / 2);
  401 |     await page.touchscreen.tap(sail!.x + sail!.width / 2, sail!.y + sail!.height / 2);
  402 |     if (!reduced) await expect(page.locator('#local-context')).toBeHidden();
  403 |     await idle(page);
  404 |     expect(await state(page)).toMatchObject({ turn: 2, boatNodeId: 'shallows' });
  405 |     expect((await rendered(page)).historyLength).toBe(2);
  406 |     expect((await selection(page)).selectedId).toBe('shallows');
  407 |     await expect(page.locator('#local-context')).toBeVisible();
  408 |     await expect(page.locator('#local-context')).toContainText('Waypoint');
  409 |     const clicks = await page.evaluate(() => {
  410 |       const runtime = window as any;
  411 |       for (const type of ['pointerdown', 'pointerup', 'click']) window.removeEventListener(type, runtime.__selectionTrace, true);
  412 |       return runtime.__selectionActionClicks;
  413 |     });
  414 |     const downs = clicks.filter((event: any) => event.type === 'pointerdown');
  415 |     const ups = clicks.filter((event: any) => event.type === 'pointerup');
  416 |     expect(downs).toHaveLength(5);
```