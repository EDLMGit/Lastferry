# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: selection.spec.ts >> selection regression: an explicit new place permits the next trusted Sail inside the previous 180ms fence
- Location: tests\e2e\selection.spec.ts:241:1

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 745.421875
Received:    511.421875
```

# Page snapshot

```yaml
- main [ref=e3]:
  - region "The Holding Pier" [ref=e4]:
    - generic "The Holding Pier. Use the labeled waypoint controls to navigate." [ref=e6]
    - generic [ref=e7]:
      - generic [ref=e8]:
        - heading "The Holding Pier" [level=1] [ref=e9]
        - paragraph [ref=e10]: Bring all three passengers to Harbor
      - generic "Crossing progress" [ref=e11]:
        - strong [ref=e12]: Depth 1 · 0/4 spaces
        - generic [ref=e13]: 03 actions · Tide 0 · Home 0/3
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
        - button "Select Stone Pier; no direct passage":
          - generic [aria-hidden] [ref=e24] [cursor=pointer]: ◇
          - generic [ref=e25] [cursor=pointer]: Stone Pier
      - generic:
        - button "Select Shallows; adjacent, flood warning":
          - generic [aria-hidden] [ref=e28] [cursor=pointer]: "!"
          - generic [ref=e29] [cursor=pointer]: Shallows
      - generic:
        - button "Select Rabbit Pier; current location" [active]:
          - generic [aria-hidden] [ref=e32] [cursor=pointer]: •
          - generic [ref=e33] [cursor=pointer]: Rabbit Pier
    - navigation "Passenger actions at Rabbit Pier" [ref=e35]:
      - button "Board Pip and Rue; choose passengers" [ref=e36] [cursor=pointer]:
        - generic [ref=e39]: Board
    - paragraph: Select a place to see its options.
    - button "Open tide and pier forecast" [ref=e40] [cursor=pointer]:
      - generic [aria-hidden] [ref=e41]: "!"
      - generic [ref=e42]:
        - strong [ref=e43]: Rabbit Pier floods in 1 action.
        - generic [ref=e44]: The tide rises after your next action. Moss waits safely at Stone Pier.
      - generic [ref=e45]: Forecast
    - navigation "Cove view" [ref=e46]:
      - button "Play view" [pressed] [ref=e47] [cursor=pointer]
      - button "Back to boat" [ref=e48] [cursor=pointer]
  - status [ref=e49]: 3 actions completed. Rabbit Pier floods in 1 action.
```

# Test source

```ts
  179 |       expect((await selection(page)).selectedId).toBe(id);
  180 |       const nav = await navigation(page);
  181 |       expect(nav.markers.find((marker: any) => marker.id === id).selected).toBe(true);
  182 |       if (id === 'stone' || id === 'rabbit-pier')
  183 |         expect(nav.routes.filter((route: any) => route.highlighted)).toHaveLength(0);
  184 |       else expect(nav.routes.filter((route: any) => route.highlighted)).toHaveLength(1);
  185 |       await cardFits(page);
  186 |       expect(await snapshot(page)).toEqual(initial);
  187 |       trace.push({ point, selection: await selection(page), navigation: nav });
  188 |       await hitPoint(page, point, touch);
  189 |       expect((await selection(page)).selectedId).toBe(id);
  190 |       expect(await snapshot(page)).toEqual(initial);
  191 |     }
  192 |     await activate(page, 'close-location', touch);
  193 |     await expect(page.locator('#local-context')).toBeHidden();
  194 |     expect(await snapshot(page)).toEqual(initial);
  195 |     const currentFrame = await frame(page);
  196 |     expect(currentFrame.canvas).toEqual(firstFrame.canvas);
  197 |     expect(currentFrame.camera).toEqual(firstFrame.camera);
  198 |     const final = await snapshot(page);
  199 |     let unrelatedScenery = null;
  200 |     if (!touch) {
  201 |       await ready(page, 'first-crossing');
  202 |       await activate(page, 'map-sheep-pier');
  203 |       const beforeScenery = await snapshot(page);
  204 |       const sceneryPoint = await page.evaluate(() => {
  205 |         const api = (window as any).__LAST_FERRY__, scene = api.getFrameStatus();
  206 |         const canvas = document.querySelector('#world canvas')!, rect = canvas.getBoundingClientRect();
  207 |         for (const place of scene.nonInteractivePlaces) {
  208 |           const x = (place.left + place.right) / 2, y = (place.top + place.bottom) / 2;
  209 |           if (document.elementFromPoint(rect.left + x, rect.top + y) === canvas && api.getPickDetailAt(x, y) === null)
  210 |             return { x: rect.left + x, y: rect.top + y, place };
  211 |         }
  212 |         return null;
  213 |       });
  214 |       expect(sceneryPoint, 'The central decorative crag has an exposed noninteractive center').not.toBeNull();
  215 |       await page.mouse.click(sceneryPoint!.x, sceneryPoint!.y);
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
> 279 |   expect(y).toBeGreaterThanOrEqual(first!.y); expect(y).toBeLessThanOrEqual(first!.y + first!.height);
      |             ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
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
  316 |   expect(result.gapMs).toBeLessThanOrEqual(180);
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
```