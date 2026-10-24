# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: selection.spec.ts >> selection regression: the arrived dock permits a deliberate local action inside the prior Sail fence
- Location: tests\e2e\selection.spec.ts:267:1

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 180
Received:    622.5
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
  189 |       await hitPoint(page, point, touch);
  190 |       expect((await selection(page)).selectedId).toBe(id);
  191 |       expect(await snapshot(page)).toEqual(initial);
  192 |     }
  193 |     await activate(page, 'close-location', touch);
  194 |     await expect(page.locator('#local-context')).toBeHidden();
  195 |     expect(await snapshot(page)).toEqual(initial);
  196 |     const currentFrame = await frame(page);
  197 |     expect(currentFrame.canvas).toEqual(firstFrame.canvas);
  198 |     expect(currentFrame.camera).toEqual(firstFrame.camera);
  199 |     const final = await snapshot(page);
  200 |     let unrelatedScenery = null;
  201 |     if (!touch) {
  202 |       await ready(page, 'first-crossing');
  203 |       await activate(page, 'map-sheep-pier');
  204 |       const beforeScenery = await snapshot(page);
  205 |       const sceneryPoint = await page.evaluate(() => {
  206 |         const api = (window as any).__LAST_FERRY__, scene = api.getFrameStatus();
  207 |         const canvas = document.querySelector('#world canvas')!, rect = canvas.getBoundingClientRect();
  208 |         for (const place of scene.nonInteractivePlaces) {
  209 |           const x = (place.left + place.right) / 2, y = (place.top + place.bottom) / 2;
  210 |           if (document.elementFromPoint(rect.left + x, rect.top + y) === canvas && api.getPickDetailAt(x, y) === null)
  211 |             return { x: rect.left + x, y: rect.top + y, place };
  212 |         }
  213 |         return null;
  214 |       });
  215 |       expect(sceneryPoint, 'The central decorative crag has an exposed noninteractive center').not.toBeNull();
  216 |       await page.mouse.click(sceneryPoint!.x, sceneryPoint!.y);
  217 |       await expect(page.locator('#local-context')).toBeHidden();
  218 |       expect((await selection(page)).selectedId).toBeNull();
  219 |       expect(await snapshot(page)).toEqual(beforeScenery);
  220 |       unrelatedScenery = { point: sceneryPoint, before: beforeScenery, after: await snapshot(page) };
  221 |     }
  222 |     writeFileSync(
  223 |       `${reviewDir}/selection-${label}-picking.json`,
  224 |       JSON.stringify(
  225 |         {
  226 |           input: touch ? 'Chromium emulated touch' : 'mouse and natural keyboard',
  227 |           viewport: [width, height],
  228 |           initial,
  229 |           frame: firstFrame,
  230 |           trace,
  231 |           final,
  232 |           unrelatedScenery,
  233 |         },
  234 |         null,
  235 |         2,
  236 |       ),
  237 |     );
  238 |     await context.close();
  239 |   });
  240 | }
  241 | 
  242 | test('selection regression: an explicit new place permits the next trusted Sail inside the previous 180ms fence', async ({ browser }) => {
  243 |   mkdirSync(reviewDir, { recursive: true });
  244 |   const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  245 |   const page = await context.newPage();
  246 |   await ready(page, 'holding-pier');
  247 |   expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getEnvironmentStatus().reducedMotion)).toBe(true);
  248 |   await activate(page, 'unload'); await activate(page, 'commit'); await idle(page);
  249 |   await activate(page, 'map-shallows');
  250 |   const first = await page.locator('#sail').boundingBox();
  251 |   const trace = await trustedRapid(page, first!, 'consecutive-sail');
  252 |   const clicks = trace.clicks;
  253 |   const result = { clicks, trace, gapMs: clicks[2]?.at - clicks[0]?.at, first, second: trace.points.second, final: await snapshot(page) };
  254 |   writeFileSync(`${reviewDir}/consecutive-sail-regression.json`, JSON.stringify(result, null, 2));
  255 |   expect(clicks).toHaveLength(3);
  256 |   expect(trace.error).toBeNull();
  257 |   expect(clicks.every((click: any) => click.trusted)).toBe(true);
  258 |   expect(clicks.map((click: any) => click.target)).toEqual(['sail', 'map-rabbit-pier', 'sail']);
  259 |   expect(result.gapMs, 'The new intentional Sail must exercise the still-live old fence').toBeLessThanOrEqual(180);
  260 |   expect(result.final.state).toMatchObject({ turn: 3, boatNodeId: 'rabbit-pier' });
  261 |   expect(result.final.history).toBe(3);
  262 |   expect((await selection(page)).selectedId).toBeNull();
  263 |   await expect(page.locator('#board')).toBeVisible();
  264 |   await context.close();
  265 | });
  266 | 
  267 | test('selection regression: the arrived dock permits a deliberate local action inside the prior Sail fence', async ({ browser }) => {
  268 |   mkdirSync(reviewDir, { recursive: true });
  269 |   const context = await browser.newContext({ viewport: { width: 844, height: 390 }, reducedMotion: 'reduce', hasTouch: true, isMobile: true });
  270 |   const page = await context.newPage();
  271 |   await ready(page, 'first-crossing');
  272 |   expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getEnvironmentStatus().reducedMotion)).toBe(true);
  273 |   await activate(page, 'map-sheep-pier', true);
  274 |   const sail = await page.locator('#sail').boundingBox();
  275 |   const trace = await trustedRapid(page, sail!, 'arrived-local');
  276 |   const clicks = trace.clicks, board = trace.points.board;
  277 |   const arrived=clicks[1]?.snapshot;
  278 |   const final=await page.evaluate(()=>{const api=(window as any).__LAST_FERRY__,v=api.getViewStatus();return{state:api.getState(),history:api.getRenderStatus().historyLength,desiredMusic:api.getAudioStatus().desiredArrangement,view:{mode:v.mode,scale:v.scale,focus:v.focus}};});
  279 |   const result = { sail, board, trace, gapMs: clicks[2]?.at - clicks[0]?.at, repeatGapMs: clicks[1]?.at - clicks[0]?.at, clicks, arrived, final, modalOpen: await page.locator('#dialog[open]').count() === 1 };
  280 |   writeFileSync(`${reviewDir}/arrived-local-action-regression.json`, JSON.stringify(result, null, 2));
  281 |   expect(clicks).toHaveLength(3);
  282 |   expect(trace.error).toBeNull();
  283 |   expect(clicks[0].target).toBe('sail');
  284 |   expect(clicks[2].target).toBe('board');
  285 |   expect(clicks[2].dialogOpen).toBe(false);
  286 |   expect(clicks[2].selectedId).toBeNull();
  287 |   expect(clicks[2].snapshot).toEqual(arrived);
  288 |   expect(clicks.every((click: any) => click.trusted)).toBe(true);
> 289 |   expect(result.gapMs).toBeLessThanOrEqual(180);
      |                        ^ Error: expect(received).toBeLessThanOrEqual(expected)
  290 |   await expect(page.locator('#commit')).toBeVisible();
  291 |   await expect(page.locator('#cancel')).toBeFocused();
  292 |   expect(result.final).toEqual(arrived);
  293 |   expect(arrived.state).toMatchObject({ turn: 1, boatNodeId: 'sheep-pier' });
  294 |   expect(arrived.history).toBe(1);
  295 |   await page.keyboard.press('Escape');
  296 |   await expect(page.locator('#board')).toBeFocused();
  297 |   await context.close();
  298 | });
  299 | 
  300 | test('selection lifecycle: repeated trusted actions, separate Escape layers, transit, visibility recovery, Undo and Restart', async ({
  301 |   browser,
  302 | }) => {
  303 |   const evidence: any[] = [];
  304 |   mkdirSync(reviewDir, { recursive: true });
  305 |   for (const reduced of [false, true]) {
  306 |     const context = await browser.newContext({
  307 |       viewport: { width: 844, height: 390 },
  308 |       deviceScaleFactor: 1,
  309 |       hasTouch: true,
  310 |       isMobile: true,
  311 |       reducedMotion: reduced ? 'reduce' : 'no-preference',
  312 |     });
  313 |     const page = await context.newPage();
  314 |     await ready(page, 'holding-pier');
  315 |     const original = await snapshot(page);
  316 |     await tabTo(page, 'map-stone');
  317 |     await page.keyboard.press('Enter');
  318 |     await expect(page.locator('#local-heading')).toBeFocused();
  319 |     await page.keyboard.down('Enter');
  320 |     await page.keyboard.press('Enter');
  321 |     await page.keyboard.up('Enter');
  322 |     expect(await snapshot(page)).toEqual(original);
  323 |     await tabTo(page, 'unload');
  324 |     await page.keyboard.press('Enter');
  325 |     await expect(page.locator('#cancel')).toBeFocused();
  326 |     await page.keyboard.press('Escape');
  327 |     await expect(page.locator('#unload')).toBeFocused();
  328 |     await expect(page.locator('#local-context')).toBeVisible();
  329 |     expect((await selection(page)).selectedId).toBe('stone');
  330 |     await page.keyboard.press('Escape');
  331 |     await expect(page.locator('#local-context')).toBeHidden();
  332 |     await expect(page.locator('#map-stone')).toBeFocused();
  333 |     for (const id of ['wait', 'menu', 'status-toggle']) {
  334 |       await activate(page, id, true);
  335 |       await expect(page.locator('#dialog')).toBeVisible();
  336 |       await page.keyboard.press('Escape');
  337 |       await expect(page.locator(`#${id}`)).toBeFocused();
  338 |       expect((await selection(page)).selectedId).toBeNull();
  339 |       await expect(page.locator('#local-context')).toBeHidden();
  340 |       expect(await snapshot(page)).toEqual(original);
  341 |     }
  342 |     await activate(page, 'unload', true);
  343 |     await page.evaluate(() => {
  344 |       const runtime = window as any;
  345 |       runtime.__selectionActionClicks = [];
  346 |       runtime.__selectionTrace = (event: MouseEvent) =>
  347 |         runtime.__selectionActionClicks.push({
  348 |           type: event.type,
  349 |           at: performance.now(),
  350 |           trusted: event.isTrusted,
  351 |           target: (event.target as HTMLElement).closest('button')?.id ?? '',
  352 |           x: event.clientX,
  353 |           y: event.clientY,
  354 |         });
  355 |       for (const type of ['pointerdown', 'pointerup', 'click']) window.addEventListener(type, runtime.__selectionTrace, true);
  356 |     });
  357 |     const confirm = await page.locator('#commit').boundingBox();
  358 |     await page.touchscreen.tap(confirm!.x + confirm!.width / 2, confirm!.y + confirm!.height / 2);
  359 |     await page.touchscreen.tap(confirm!.x + confirm!.width / 2, confirm!.y + confirm!.height / 2);
  360 |     await idle(page);
  361 |     expect(await state(page)).toMatchObject({
  362 |       turn: 1,
  363 |       boatNodeId: 'stone',
  364 |       aboard: [],
  365 |       waitingByPier: { 'stone-pier': ['sheep-1'] },
  366 |     });
  367 |     expect((await rendered(page)).historyLength).toBe(1);
  368 |     await expect(page.locator('#dialog')).toBeHidden();
  369 |     expect((await selection(page)).selectedId).toBe('stone');
  370 |     await activate(page, 'map-shallows', true);
  371 |     const beforeMove = await snapshot(page),
  372 |       sail = await page.locator('#sail').boundingBox();
  373 |     await page.touchscreen.tap(sail!.x + sail!.width / 2, sail!.y + sail!.height / 2);
  374 |     await page.touchscreen.tap(sail!.x + sail!.width / 2, sail!.y + sail!.height / 2);
  375 |     if (!reduced) await expect(page.locator('#local-context')).toBeHidden();
  376 |     await idle(page);
  377 |     expect(await state(page)).toMatchObject({ turn: 2, boatNodeId: 'shallows' });
  378 |     expect((await rendered(page)).historyLength).toBe(2);
  379 |     expect((await selection(page)).selectedId).toBe('shallows');
  380 |     await expect(page.locator('#local-context')).toBeVisible();
  381 |     await expect(page.locator('#local-context')).toContainText('Waypoint');
  382 |     const clicks = await page.evaluate(() => {
  383 |       const runtime = window as any;
  384 |       for (const type of ['pointerdown', 'pointerup', 'click']) window.removeEventListener(type, runtime.__selectionTrace, true);
  385 |       return runtime.__selectionActionClicks;
  386 |     });
  387 |     const downs = clicks.filter((event: any) => event.type === 'pointerdown');
  388 |     const ups = clicks.filter((event: any) => event.type === 'pointerup');
  389 |     expect(downs).toHaveLength(5);
```