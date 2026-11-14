# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: selection.spec.ts >> selection regression: an explicit new place permits the next trusted Sail inside the previous 180ms fence
- Location: tests\e2e\selection.spec.ts:241:1

# Error details

```
Error: The new intentional Sail must exercise the still-live old fence

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 180
Received:    2752.900000035763
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
  177 |       await expect(page.locator('#local-context')).toHaveAttribute('data-location', id);
  178 |       await expect(page.locator(`#map-${id}`)).toHaveAttribute('aria-expanded', 'true');
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
> 277 |   expect(result.gapMs, 'The new intentional Sail must exercise the still-live old fence').toBeLessThanOrEqual(180);
      |                                                                                           ^ Error: The new intentional Sail must exercise the still-live old fence
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
  318 |   expect(result.gapMs).toBeLessThanOrEqual(180);
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
```