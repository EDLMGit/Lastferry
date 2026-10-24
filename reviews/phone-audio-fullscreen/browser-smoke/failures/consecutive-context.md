# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: selection.spec.ts >> selection regression: an explicit new place permits the next trusted Sail inside the previous 180ms fence
- Location: tests\e2e\selection.spec.ts:242:1

# Error details

```
Error: The new intentional Sail must exercise the still-live old fence

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 180
Received:    180.69999998807907
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
  159 |       expect(
  160 |         (await navigation(page)).routes.filter((route: any) => route.highlighted),
  161 |       ).toHaveLength(0);
  162 |       await expect(page.locator('#local-context')).toBeHidden();
  163 |       expect(await snapshot(page)).toEqual(initial);
  164 |     }
  165 |     for (const [id, kind] of [
  166 |       ['rabbit-pier', 'island'],
  167 |       ['harbor', 'pier'],
  168 |       ['harbor', 'landmark'],
  169 |       ['stone', 'ferry'],
  170 |       ['shallows', 'waypoint'],
  171 |     ] as [string, HitKind][]) {
  172 |       const water = await emptyWater(page);
  173 |       await hitPoint(page, water, touch);
  174 |       await expect(page.locator('#local-context')).toBeHidden();
  175 |       const point = await pointFor(page, id, kind);
  176 |       await hitPoint(page, point, touch);
  177 |       await expect(page.locator('#local-context')).toBeVisible();
  178 |       await expect(page.locator('#local-context')).toHaveAttribute('data-location', id);
  179 |       await expect(page.locator(`#map-${id}`)).toHaveAttribute('aria-expanded', 'true');
  180 |       expect((await selection(page)).selectedId).toBe(id);
  181 |       const nav = await navigation(page);
  182 |       expect(nav.markers.find((marker: any) => marker.id === id).selected).toBe(true);
  183 |       if (id === 'stone' || id === 'rabbit-pier')
  184 |         expect(nav.routes.filter((route: any) => route.highlighted)).toHaveLength(0);
  185 |       else expect(nav.routes.filter((route: any) => route.highlighted)).toHaveLength(1);
  186 |       await cardFits(page);
  187 |       expect(await snapshot(page)).toEqual(initial);
  188 |       trace.push({ point, selection: await selection(page), navigation: nav });
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
> 259 |   expect(result.gapMs, 'The new intentional Sail must exercise the still-live old fence').toBeLessThanOrEqual(180);
      |                                                                                           ^ Error: The new intentional Sail must exercise the still-live old fence
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
  289 |   expect(result.gapMs).toBeLessThanOrEqual(180);
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
```