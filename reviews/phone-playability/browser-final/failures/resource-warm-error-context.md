# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phone-playability.spec.ts >> phone camera input: real touch pan, cancellation, mode recovery and marker picking conserve state
- Location: tests\e2e\phone-playability.spec.ts:311:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 317
Received: 319
```

# Test source

```ts
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
  374 |         (await page.evaluate(() => (window as any).__LAST_FERRY__.getSelectionStatus())).selectedId,
  375 |       ).toBeNull();
  376 |       await press(page, 'back-to-boat');
  377 |       await markerAlignment(page);
  378 |       await activeSubjects(page);
  379 |       await save('returned', true);
  380 |       await page.mouse.move(point!.x, point!.y);
  381 |       await page.mouse.down();
  382 |       await page.mouse.move(-12, -12, { steps: 5 });
  383 |       await page.mouse.up();
  384 |       expect(await stable(page)).toEqual(original);
  385 |       await press(page, 'back-to-boat');
  386 |       const ferryHit = await page.evaluate(() => {
  387 |         const a = (window as any).__LAST_FERRY__,
  388 |           f = a.getFrameStatus(),
  389 |           c = document.querySelector('canvas')!,
  390 |           r = c.getBoundingClientRect();
  391 |         for (const fy of [0.5, 0.2, 0.8, 0.1, 0.9])
  392 |           for (const fx of [0.5, 0.2, 0.8, 0.1, 0.9]) {
  393 |             const x = f.boat.left + (f.boat.right - f.boat.left) * fx,
  394 |               y = f.boat.top + (f.boat.bottom - f.boat.top) * fy;
  395 |             if (
  396 |               a.getPickDetailAt(x, y)?.kind === 'ferry' &&
  397 |               document.elementFromPoint(x + r.left, y + r.top) === c
  398 |             )
  399 |               return { x: x + r.left, y: y + r.top };
  400 |           }
  401 |         return null;
  402 |       });
  403 |       expect(ferryHit).not.toBeNull();
  404 |       await page.touchscreen.tap(ferryHit!.x, ferryHit!.y);
  405 |       expect(
  406 |         (await page.evaluate(() => (window as any).__LAST_FERRY__.getSelectionStatus())).selectedId,
  407 |       ).toBe('stone');
  408 |       await press(page, 'close-location');
  409 |       await cdp.send('Input.dispatchTouchEvent', {
  410 |         type: 'touchStart',
  411 |         touchPoints: [{ x: point!.x, y: point!.y, id: 1 }],
  412 |       });
  413 |       await cdp.send('Input.dispatchTouchEvent', {
  414 |         type: 'touchStart',
  415 |         touchPoints: [
  416 |           { x: point!.x, y: point!.y, id: 1 },
  417 |           { x: point!.x + 40, y: point!.y, id: 2 },
  418 |         ],
  419 |       });
  420 |       await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  421 |       expect(await stable(page)).toEqual(original);
  422 |       await whole(page);
  423 |       await press(page, 'map-rabbit-pier');
  424 |       expect((await state(page)).turn).toBe(0);
  425 |       await save('inspection', true);
  426 |       await page.keyboard.press('Escape');
  427 |       await tabTo(page, 'back-to-boat');
  428 |       await page.keyboard.press('Enter');
  429 |       await tabTo(page, 'view-toggle');
  430 |       await page.keyboard.press('Enter');
  431 |       await tabTo(page, 'map-harbor');
  432 |       await page.keyboard.press('Enter');
  433 |       expect(await page.locator('#local-context')).toBeVisible();
  434 |       expect(await stable(page)).toEqual(original);
  435 |       const afterResources = await page.evaluate(
  436 |         () => (window as any).__LAST_FERRY__.getMetrics().resources,
  437 |       );
> 438 |       expect(afterResources.geometries).toBe(warmResources.geometries);
      |                                         ^ Error: expect(received).toBe(expected) // Object.is equality
  439 |       expect(afterResources.textures).toBe(warmResources.textures);
  440 |     });
  441 |   } finally {
  442 |     await context.close();
  443 |   }
  444 | });
  445 | 
  446 | test('phone rotation: selected place, open subset and confirmed journey retain state and anchors', async ({
  447 |   browser,
  448 | }) => {
  449 |   const context = await browser.newContext({
  450 |     baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
  451 |     viewport: { width: 844, height: 390 },
  452 |     deviceScaleFactor: 1,
  453 |     hasTouch: true,
  454 |     isMobile: true,
  455 |   });
  456 |   const page = await context.newPage();
  457 |   try {
  458 |     await ready(page, 'holding-pier');
  459 |     await observed(page, 'rotation', async (save) => {
  460 |       await whole(page);
  461 |       await place(page, 'rabbit-pier');
  462 |       const original = await stable(page);
  463 |       await page.setViewportSize({ width: 390, height: 844 });
  464 |       await page.waitForTimeout(200);
  465 |       expect(
  466 |         (await page.evaluate(() => (window as any).__LAST_FERRY__.getSelectionStatus())).selectedId,
  467 |       ).toBe('rabbit-pier');
  468 |       expect(await stable(page)).toEqual(original);
  469 |       await noOverflow(page);
  470 |       await markerAlignment(page);
  471 |       await press(page, 'back-to-boat');
  472 |       await press(page, 'unload');
  473 |       await press(page, 'passenger-sheep-1');
  474 |       const selected = await page.locator('#passenger-sheep-1').getAttribute('aria-pressed');
  475 |       await page.setViewportSize({ width: 780, height: 320 });
  476 |       await page.waitForTimeout(200);
  477 |       expect(await page.locator('#passenger-sheep-1').getAttribute('aria-pressed')).toBe(selected);
  478 |       await fullyVisible(page, page.locator('#commit'));
  479 |       await fullyVisible(page, page.locator('#cancel'));
  480 |       expect(await stable(page)).toEqual(original);
  481 |       await save('open-preview-short', true);
  482 |       await press(page, 'passenger-sheep-1');
  483 |       await press(page, 'commit');
  484 |       await idle(page);
  485 |       await place(page, 'shallows');
  486 |       await press(page, 'sail');
  487 |       await page.waitForFunction(
  488 |         () => (window as any).__LAST_FERRY__.getJourneyStatus().active?.progress > 0.2,
  489 |       );
  490 |       await page.setViewportSize({ width: 360, height: 740 });
  491 |       await idle(page);
  492 |       await noOverflow(page);
  493 |       await activeSubjects(page);
  494 |       await markerAlignment(page);
  495 |       expect(await state(page)).toMatchObject({ turn: 2, boatNodeId: 'shallows' });
  496 |       await save('journey-rotated', true);
  497 |       await undo(page, true);
  498 |       expect((await state(page)).boatNodeId).toBe('stone');
  499 |       await activeSubjects(page);
  500 |       await page.emulateMedia({ reducedMotion: 'reduce' });
  501 |       await press(page, 'view-toggle');
  502 |       await press(page, 'back-to-boat');
  503 |       expect(
  504 |         await page.evaluate(() => (window as any).__LAST_FERRY__.getMotionStatus().reduced),
  505 |       ).toBe(true);
  506 |     });
  507 |   } finally {
  508 |     await context.close();
  509 |   }
  510 | });
  511 | 
  512 | test('phone nearby decisions: Wait and losing Sail retain their actual control anchors', async ({
  513 |   browser,
  514 | }) => {
  515 |   const context = await browser.newContext({
  516 |     baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
  517 |     viewport: { width: 780, height: 320 },
  518 |     deviceScaleFactor: 1,
  519 |     hasTouch: true,
  520 |     isMobile: true,
  521 |   });
  522 |   const page = await context.newPage();
  523 |   try {
  524 |     await ready(page, 'holding-pier');
  525 |     await observed(page, 'nearby-decisions', async (save) => {
  526 |       for (let turn = 0; turn < 3; turn++) {
  527 |         const original = await stable(page),
  528 |           anchor = await rect(page, 'wait');
  529 |         await press(page, 'wait');
  530 |         const p = await placement(page);
  531 |         expect(p.anchor.left).toBeCloseTo(anchor.left, 1);
  532 |         expect(p.anchor.top).toBeCloseTo(anchor.top, 1);
  533 |         await fullyVisible(page, page.locator('#commit'));
  534 |         await fullyVisible(page, page.locator('#cancel'));
  535 |         expect(await stable(page)).toEqual(original);
  536 |         if (turn === 0) {
  537 |           await save('wait-preview', true);
  538 |           await page.keyboard.press('Escape');
```