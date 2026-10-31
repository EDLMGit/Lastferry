# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: driftwood-yard.spec.ts >> legacy read-only Home, explicit fresh continuation, restored recap and native fit
- Location: tests\e2e\driftwood-yard.spec.ts:313:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "app"
Received: undefined
```

# Test source

```ts
  272 |   baseURL,
  273 | }) => {
  274 |   const context = await browser.newContext({
  275 |     baseURL,
  276 |     viewport: { width: 390, height: 844 },
  277 |     hasTouch: true,
  278 |     isMobile: true,
  279 |   });
  280 |   const page = await context.newPage();
  281 |   try {
  282 |     await seeded(page, legacy);
  283 |     await page.route('**/*beaver-brown*.png', async route => { await new Promise(resolve => setTimeout(resolve, 1500)); await route.continue(); });
  284 |     await page.goto('/');
  285 |     await coldTouch(page, 'home-play');
  286 |     await endScene(page, '390x844-driftwood-scene');
  287 |     await activate(page, 'story-continue', true);
  288 |     await idle(page);
  289 |     await activate(page, 'menu', true);
  290 |     await page.locator('#help-details summary').tap();
  291 |     await expect(page.locator('#help-details')).toContainText('Nell uses 2 spaces');
  292 |     await page.keyboard.press('Escape');
  293 |     await driftRescue(page, '390x844');
  294 |     await undo(page, true);
  295 |     await page.route('**/*beaver-brown*.png', (route) => route.abort());
  296 |     await activate(page, 'unload', true);
  297 |     await page.locator('#passenger-nell img').evaluate((image: HTMLImageElement) => {
  298 |       image.src += '?failure=1';
  299 |     });
  300 |     await expect(page.locator('#passenger-nell')).toContainText('Nell');
  301 |     await expect(page.locator('#passenger-nell')).toContainText('2 spaces');
  302 |     await fullyVisible(page, page.locator('#passenger-nell'));
  303 |     await tabTo(page, 'passenger-fern');
  304 |     await page.keyboard.press('Space');
  305 |     await page.keyboard.press('Escape');
  306 |     await idle(page);
  307 |     await keyAct(page, 'unload');
  308 |     expect(await state(page)).toMatchObject({ status: 'won' });
  309 |   } finally {
  310 |     await context.close();
  311 |   }
  312 | });
  313 | test('legacy read-only Home, explicit fresh continuation, restored recap and native fit', async ({
  314 |   browser,
  315 |   baseURL,
  316 | }) => {
  317 |   const context = await browser.newContext({
  318 |     baseURL,
  319 |     viewport: { width: 390, height: 844 },
  320 |     hasTouch: true,
  321 |     isMobile: true,
  322 |   });
  323 |   const page = await context.newPage();
  324 |   try {
  325 |     await seeded(page, legacy);
  326 |     await page.goto('/');
  327 |     const bytes = await page.evaluate((key) => localStorage.getItem(key), journeyKey);
  328 |     await expect(page.locator('#home-play')).toHaveText('Continue');
  329 |     await activate(page, 'home-options', true);
  330 |     await activate(page, 'settings-back', true);
  331 |     await activate(page, 'home-practice', true);
  332 |     await expect(page.locator('#practice-driftwood-yard')).toBeVisible();
  333 |     await activate(page, 'journey-title', true);
  334 |     expect(await page.evaluate((key) => localStorage.getItem(key), journeyKey)).toBe(bytes);
  335 |     await activate(page, 'home-play', true);
  336 |     expect((await timeline(page)).recap).toBe(false);
  337 |     await page.reload();
  338 |     await activate(page, 'home-play', true);
  339 |     expect((await timeline(page)).recap).toBe(true);
  340 |     for (const size of [
  341 |       { width: 320, height: 740 },
  342 |       { width: 390, height: 844 },
  343 |       { width: 780, height: 320 },
  344 |       { width: 844, height: 390 },
  345 |       { width: 1440, height: 900 },
  346 |     ]) {
  347 |       await page.setViewportSize(size);
  348 |       await expect.poll(async () => (await page.evaluate(measureStory)).failures).toEqual([]);
  349 |       await snap(page, `${size.width}x${size.height}-recap-fit`);
  350 |     }
  351 |     await page.setViewportSize({ width: 780, height: 320 });
  352 |     await activate(page, 'story-continue', true);
  353 |     await idle(page);
  354 |     await act(page, 'map-yard', true);
  355 |     await activate(page, 'map-yard', true);
  356 |     await expect(page.locator('#local-context')).toContainText(/Board Nell.*Needs depth 1 → 2/);
  357 |     const before = await state(page);
  358 |     await activate(page, 'close-location', true);
  359 |     if (await page.locator('#back-to-boat').isVisible()) await keyAct(page, 'back-to-boat');
  360 |     await fullyVisible(page, page.locator('#board'));
  361 |     await snap(page, 'keyboard-visible-board');
  362 |     await keyAct(page, 'board');
  363 |     expect((await state(page)).turn).toBe(before.turn + 1);
  364 |     await undo(page, true);
  365 |     expect(await state(page)).toEqual(before);
  366 |     await page.reload();
  367 |     await activate(page, 'home-play', true);
  368 |     expect(await state(page)).toMatchObject({ turn: 0, boatNodeId: 'harbor' });
  369 |     await activate(page, 'menu', true);
  370 |     await activate(page, 'settings', true);
  371 |     await activate(page, 'fullscreen', true);
> 372 |     expect(await page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
      |                                                                       ^ Error: expect(received).toBe(expected) // Object.is equality
  373 |     await page.evaluate(() => document.exitFullscreen());
  374 |   } finally {
  375 |     await context.close();
  376 |   }
  377 | });
  378 | test('compact Bram controls, safe boundary and original last-safe loss warning', async ({
  379 |   browser,
  380 |   baseURL,
  381 | }) => {
  382 |   const context = await browser.newContext({
  383 |     baseURL,
  384 |     viewport: { width: 390, height: 844 },
  385 |     hasTouch: true,
  386 |     isMobile: true,
  387 |   });
  388 |   const page = await context.newPage();
  389 |   try {
  390 |     await ready(page, 'bellwater');
  391 |     for (const id of [
  392 |       'map-shallows',
  393 |       'map-low-pier',
  394 |       'board',
  395 |       'map-east-buoy',
  396 |       'map-west-buoy',
  397 |       'map-harbor',
  398 |       'map-bell-pier',
  399 |     ])
  400 |       await act(page, id, true);
  401 |     for (const size of [
  402 |       { width: 390, height: 844 },
  403 |       { width: 780, height: 320 },
  404 |     ]) {
  405 |       await page.setViewportSize(size);
  406 |       await expect.poll(() => page.locator('#board').boundingBox()).not.toBeNull();
  407 |       await expect(page.locator('#board')).toHaveText('Board Bram');
  408 |       await expect(page.locator('#unload')).toHaveText('Let ashore');
  409 |       expect(await page.locator('.dock-facts,.dock-consequence').count()).toBe(0);
  410 |       await fullyVisible(page, page.locator('#board'));
  411 |       await fullyVisible(page, page.locator('#unload'));
  412 |       await snap(page, `${size.width}x${size.height}-bram-compact`);
  413 |     }
  414 |     await act(page, 'board', true);
  415 |     expect(await state(page)).toMatchObject({ turn: 8, tideLevel: 2, status: 'playing' });
  416 |     await undo(page, true);
  417 |     expect(await state(page)).toMatchObject({ turn: 7, tideLevel: 1 });
  418 |     await ready(page, 'holding-pier');
  419 |     for (const id of ['unload', 'map-shallows', 'map-rabbit-pier']) await act(page, id, true);
  420 |     await activate(page, 'board', true);
  421 |     await activate(page, 'passenger-rabbit-2', true);
  422 |     await expect(page.locator('#preview')).toContainText(/Rue.*floods/);
  423 |     const before = await state(page);
  424 |     await activate(page, 'cancel', true);
  425 |     expect(await state(page)).toEqual(before);
  426 |     await ready(page, 'first-crossing');
  427 |     await keyAct(page, 'map-sheep-pier');
  428 |     await keyAct(page, 'board');
  429 |     expect((await state(page)).aboard).toContain('sheep-1');
  430 |     await undo(page, true);
  431 |     expect((await state(page)).aboard).not.toContain('sheep-1');
  432 |   } finally {
  433 |     await context.close();
  434 |   }
  435 | });
  436 | 
  437 | test('fresh Home opening autoplay and reduced transfer regression',async({browser,baseURL})=>{
  438 | const context=await browser.newContext({baseURL,viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();
  439 | try{await page.goto('/');await coldTouch(page,'home-play');const seen=new Set<string>();await expect.poll(async()=>{const t=await timeline(page);seen.add(t.shot);if(t.paused&&!t.settled)await activate(page,'story-pause',true);return t.final&&t.settled;},{timeout:45000,intervals:[300]}).toBe(true);expect([...seen]).toEqual(['tide','lantern','ferry']);await snap(page,'390x844-opening-regression');await activate(page,'story-continue',true);expect(await state(page)).toMatchObject({turn:0,boatNodeId:'stone',aboard:['sheep-1']});await page.goto('/?cove=driftwood-yard');await idle(page);await activate(page,'menu',true);await activate(page,'settings',true);await page.locator('#motion-preference').selectOption('reduced');await page.keyboard.press('Escape');await page.keyboard.press('Escape');await keyAct(page,'map-yard');await keyAct(page,'board');await undo(page,true);expect(await state(page)).toMatchObject({turn:1,aboard:[]});
  440 | }finally{await context.close();}
  441 | });
  442 | 
```