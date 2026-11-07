# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phone-playability.spec.ts >> phone rescue 844x390: actual subset/tide Undo, nearby previews and terminal redelivery
- Location: tests\e2e\phone-playability.spec.ts:239:3

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 2
Received:   22.390625
```

# Test source

```ts
  173 | }
  174 | 
  175 | for (const [width, height] of [
  176 |   [844, 390],
  177 |   [780, 320],
  178 |   [390, 844],
  179 |   [360, 740],
  180 | ])
  181 |   test(`phone layout ${width}x${height}: readable Play and deliberate complete Whole cove`, async ({
  182 |     browser,
  183 |   }) => {
  184 |     const context = await browser.newContext({
  185 |       baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
  186 |       viewport: { width, height },
  187 |       deviceScaleFactor: 1,
  188 |       hasTouch: true,
  189 |       isMobile: true,
  190 |       reducedMotion: 'no-preference',
  191 |     });
  192 |     const page = await context.newPage();
  193 |     try {
  194 |       await ready(page, 'holding-pier');
  195 |       await observed(page, `layout-${width}x${height}`, async (save) => {
  196 |         await noOverflow(page);
  197 |         const original = await stable(page),
  198 |           dimensions = await activeSubjects(page);
  199 |         const baselineWidth: Record<string, number> = {
  200 |           '844x390': 69.09490461811049,
  201 |           '780x320': 59.120034927559686,
  202 |           '390x844': 46.607412399413136,
  203 |           '360x740': 42.70176331566341,
  204 |         };
  205 |         expect(dimensions.width).toBeGreaterThan(baselineWidth[`${width}x${height}`] * 1.25);
  206 |         await fullyVisible(page, page.locator('#unload'));
  207 |         expect(
  208 |           await page.locator('#unload').evaluate((e) => parseFloat(getComputedStyle(e).fontSize)),
  209 |         ).toBeGreaterThanOrEqual(16);
  210 |         await fullyVisible(page, page.locator('#view-toggle'));
  211 |         await save('play', true);
  212 |         await whole(page);
  213 |         await markerAlignment(page, true);
  214 |         expect(await stable(page)).toEqual(original);
  215 |         await save('overview', true);
  216 |         await press(page, 'back-to-boat');
  217 |         await markerAlignment(page);
  218 |         await activeSubjects(page);
  219 |         expect(await stable(page)).toEqual(original);
  220 |         await press(page, 'unload');
  221 |         await fullyVisible(page, page.locator('#commit'));
  222 |         await fullyVisible(page, page.locator('#cancel'));
  223 |         expect(
  224 |           await page.locator('#commit').evaluate((e) => parseFloat(getComputedStyle(e).fontSize)),
  225 |         ).toBeGreaterThanOrEqual(16);
  226 |         await save('nearby-unload', true);
  227 |         await page.keyboard.press('Escape');
  228 |         expect(await stable(page)).toEqual(original);
  229 |       });
  230 |     } finally {
  231 |       await context.close();
  232 |     }
  233 |   });
  234 | 
  235 | for (const [width, height] of [
  236 |   [844, 390],
  237 |   [390, 844],
  238 | ])
  239 |   test(`phone rescue ${width}x${height}: actual subset/tide Undo, nearby previews and terminal redelivery`, async ({
  240 |     browser,
  241 |   }) => {
  242 |     test.setTimeout(180000);
  243 |     const context = await browser.newContext({
  244 |       baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
  245 |       viewport: { width, height },
  246 |       deviceScaleFactor: 1,
  247 |       hasTouch: true,
  248 |       isMobile: true,
  249 |       reducedMotion: 'no-preference',
  250 |       recordVideo: { dir: `${reviewDir}/raw`, size: { width, height } },
  251 |     });
  252 |     const page = await context.newPage();
  253 |     try {
  254 |       await ready(page, 'holding-pier');
  255 |       await observed(page, `rescue-${width}x${height}`, async (save) => {
  256 |         await save('start', true);
  257 |         await press(page, 'unload');
  258 |         await save('unload-preview', true);
  259 |         const first = await placement(page);
  260 |         expect(first.anchor).toBeTruthy();
  261 |         expect(first.panel).toBeTruthy();
  262 |         await press(page, 'commit');
  263 |         await idle(page);
  264 |         await move(page, 'shallows');
  265 |         await move(page, 'rabbit-pier');
  266 |         await press(page, 'board');
  267 |         const before = await stable(page),
  268 |           panel = await rect(page, 'dialog');
  269 |         await press(page, 'passenger-rabbit-2');
  270 |         await expect(page.locator('#dialog')).toContainText(/lost|flood|left|unsafe/i);
  271 |         const subset = await rect(page, 'dialog');
  272 |         expect(Math.abs(subset.left - panel.left)).toBeLessThan(2);
> 273 |         expect(Math.abs(subset.top - panel.top)).toBeLessThan(2);
      |                                                  ^ Error: expect(received).toBeLessThan(expected)
  274 |         expect(await stable(page)).toEqual(before);
  275 |         await save('subset-warning', true);
  276 |         await press(page, 'passenger-rabbit-2');
  277 |         await expect(page.locator('#dialog')).toContainText(/both are safe|safe aboard/i);
  278 |         await save('critical-boarding', true);
  279 |         await press(page, 'commit');
  280 |         await idle(page);
  281 |         expect(await state(page)).toMatchObject({ turn: 4, tideLevel: 1, status: 'playing' });
  282 |         await save('after-rise', true);
  283 |         await undo(page, true);
  284 |         expect(await stable(page)).toEqual(before);
  285 |         await save('tide-undo', true);
  286 |         await transfer(page, 'board');
  287 |         await move(page, 'shallows');
  288 |         await move(page, 'stone');
  289 |         await transfer(page, 'board');
  290 |         await move(page, 'harbor');
  291 |         const arrival = await stable(page);
  292 |         await transfer(page, 'unload');
  293 |         expect(await state(page)).toMatchObject({ turn: 9, status: 'won' });
  294 |         await fullyVisible(page, page.locator('#terminal-undo'));
  295 |         await save('won', true);
  296 |         await press(page, 'terminal-settings');
  297 |         await fullyVisible(page, page.locator('#settings-sound'));
  298 |         await press(page, 'settings-back');
  299 |         await undo(page, true);
  300 |         expect(await stable(page)).toEqual(arrival);
  301 |         await activeSubjects(page);
  302 |         await save('terminal-undo', true);
  303 |         await transfer(page, 'unload');
  304 |         expect((await state(page)).status).toBe('won');
  305 |       });
  306 |     } finally {
  307 |       await context.close();
  308 |     }
  309 |   });
  310 | 
  311 | test('phone camera input: real touch pan, cancellation, mode recovery and marker picking conserve state', async ({
  312 |   browser,
  313 | }) => {
  314 |   const context = await browser.newContext({
  315 |     baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
  316 |     viewport: { width: 844, height: 390 },
  317 |     deviceScaleFactor: 1,
  318 |     hasTouch: true,
  319 |     isMobile: true,
  320 |   });
  321 |   const page = await context.newPage();
  322 |   try {
  323 |     await ready(page, 'holding-pier');
  324 |     await observed(page, 'camera-input', async (save) => {
  325 |       const original = await stable(page);
  326 |       await whole(page);
  327 |       await markerAlignment(page, true);
  328 |       await press(page, 'back-to-boat');
  329 |       const beforePan = await view(page);
  330 |       const warmResources = await page.evaluate(
  331 |         () => (window as any).__LAST_FERRY__.getMetrics().resources,
  332 |       );
  333 |       const point = await page.evaluate(() => {
  334 |         const canvas = document.querySelector('canvas')!,
  335 |           r = canvas.getBoundingClientRect(),
  336 |           a = (window as any).__LAST_FERRY__;
  337 |         for (let y = 90; y < innerHeight - 70; y += 20)
  338 |           for (let x = 25; x < innerWidth - 25; x += 20)
  339 |             if (
  340 |               document.elementFromPoint(x, y) === canvas &&
  341 |               !a.getPickTargetAt(x - r.left, y - r.top)
  342 |             )
  343 |               return { x, y };
  344 |         return null;
  345 |       });
  346 |       expect(point).not.toBeNull();
  347 |       const target = await rect(page, 'map-rabbit-pier');
  348 |       const cdp = await context.newCDPSession(page);
  349 |       await cdp.send('Input.dispatchTouchEvent', {
  350 |         type: 'touchStart',
  351 |         touchPoints: [{ x: point!.x, y: point!.y, id: 1 }],
  352 |       });
  353 |       await cdp.send('Input.dispatchTouchEvent', {
  354 |         type: 'touchMove',
  355 |         touchPoints: [{ x: point!.x + 40, y: point!.y + 25, id: 1 }],
  356 |       });
  357 |       await cdp.send('Input.dispatchTouchEvent', {
  358 |         type: 'touchMove',
  359 |         touchPoints: [
  360 |           { x: (target.left + target.right) / 2, y: (target.top + target.bottom) / 2, id: 1 },
  361 |         ],
  362 |       });
  363 |       await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  364 |       await page.waitForTimeout(200);
  365 |       expect(await stable(page)).toEqual(original);
  366 |       const panned = await view(page);
  367 |       expect(panned.panned).toBe(true);
  368 |       expect(panned.focus).not.toEqual(beforePan.focus);
  369 |       expect(panned.focus.x).toBeGreaterThanOrEqual(panned.bounds.minX);
  370 |       expect(panned.focus.x).toBeLessThanOrEqual(panned.bounds.maxX);
  371 |       expect(panned.focus.y).toBeGreaterThanOrEqual(panned.bounds.minY);
  372 |       expect(panned.focus.y).toBeLessThanOrEqual(panned.bounds.maxY);
  373 |       expect(
```