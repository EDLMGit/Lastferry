# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: wide-berth.spec.ts >> five-body six-space witness, six waiting choices, overcapacity and usable fallback
- Location: tests\e2e\wide-berth.spec.ts:425:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.requirement')
Expected substring: "6/6 spaces"
Error: strict mode violation: locator('.requirement') resolved to 2 elements:
    1) <p class="requirement">Boat needs depth 2. Passage has depth 4: enough d…</p> aka getByText('Boat needs depth 2. Passage')
    2) <p class="requirement">Needs depth 1 → 4 · 6/6 spaces</p> aka getByText('Needs depth 1 → 4 · 6/6 spaces')

Call log:
  - Expect "toContainText" locator('.requirement') with timeout 10000ms
  - waiting for locator('.requirement')

```

# Test source

```ts
  383 |     await endScene(page, '390x844-launch');
  384 |     await activate(page, 'story-continue', true);
  385 |     await idle(page);
  386 |     for (const id of ['map-high-quay', 'map-wide-berth']) await act(page, id, true);
  387 |     await choose(page, 'board');
  388 |     if (await page.locator('#back-to-boat').isVisible()) await activate(page, 'back-to-boat', true);
  389 |     await page.waitForTimeout(3300);
  390 |     await snap(page, '390x844-six-spaces');
  391 |     await act(page, 'map-high-quay', true);
  392 |     const before = await state(page);
  393 |     await choose(page, 'unload', ['alder', 'clover']);
  394 |     expect(await state(page)).toMatchObject({ turn: 5, tideLevel: 1, aboard: ['poppy', 'wren'] });
  395 |     await undo(page, true);
  396 |     expect(await state(page)).toEqual(before);
  397 |     await choose(page, 'unload', ['alder', 'clover']);
  398 |     await act(page, 'map-shell-landing', true);
  399 |     await choose(page, 'board');
  400 |     if (await page.locator('#back-to-boat').isVisible()) await activate(page, 'back-to-boat', true);
  401 |     await page.waitForTimeout(3300);
  402 |     await snap(page, '390x844-four-rabbits');
  403 |     await act(page, 'map-high-quay', true);
  404 |     await activate(page, 'map-harbor', true);
  405 |     await expect(page.locator('#local-context')).toContainText(/needs depth 3.*depth 3/);
  406 |     await activate(page, 'sail', true);
  407 |     await idle(page);
  408 |     await choose(page, 'unload');
  409 |     expect(await state(page)).toMatchObject({ turn: 10, tideLevel: 2 });
  410 |     for (const id of ['map-high-quay']) await act(page, id, true);
  411 |     await choose(page, 'board');
  412 |     await act(page, 'map-harbor', true);
  413 |     await choose(page, 'unload');
  414 |     expect(await state(page)).toMatchObject({ turn: 14, status: 'won' });
  415 |     await snap(page, '390x844-staging-arrival');
  416 |     await undo(page, true);
  417 |     expect(await state(page)).toMatchObject({ turn: 13, status: 'playing' });
  418 |     await choose(page, 'unload');
  419 |   } finally {
  420 |     if (stop) await stop();
  421 |     await context.close();
  422 |   }
  423 | });
  424 | 
  425 | test('five-body six-space witness, six waiting choices, overcapacity and usable fallback', async ({
  426 |   browser,
  427 |   baseURL,
  428 | }) => {
  429 |   test.setTimeout(300000);
  430 |   const context = await browser.newContext({
  431 |     baseURL,
  432 |     viewport: { width: 390, height: 844 },
  433 |     hasTouch: true,
  434 |     isMobile: true,
  435 |   });
  436 |   const page = await context.newPage();
  437 |   try {
  438 |     await beginWide(page);
  439 |     await choose(page, 'unload', ['alder']);
  440 |     await act(page, 'map-shell-landing', true);
  441 |     await choose(page, 'board');
  442 |     expect((await state(page)).aboard).toHaveLength(5);
  443 |     if (await page.locator('#back-to-boat').isVisible()) await activate(page, 'back-to-boat', true);
  444 |     await page.waitForTimeout(3300);
  445 |     await snap(page, '390x844-five-bodies');
  446 |     for (let i = 0; i < 3; i++) await act(page, 'wait', true);
  447 |     await act(page, 'map-high-quay', true);
  448 |     await act(page, 'map-harbor', true);
  449 |     await choose(page, 'unload');
  450 |     await act(page, 'map-high-quay', true);
  451 |     await choose(page, 'board');
  452 |     await act(page, 'map-harbor', true);
  453 |     await choose(page, 'unload');
  454 |     expect(await state(page)).toMatchObject({ turn: 17, status: 'won' });
  455 |     for (let i = 0; i < 6; i++) await undo(page, true);
  456 |     expect(await state(page)).toMatchObject({ turn: 11, boatNodeId: 'high-quay' });
  457 |     await choose(page, 'unload');
  458 |     const before = await state(page);
  459 |     expect(before.waitingByPier['high-quay-pier']).toHaveLength(6);
  460 |     await snap(page, '390x844-six-ashore');
  461 |     await choose(page, 'board', undefined, false);
  462 |     await expect(page.locator('#preview')).toContainText('boat has 6 spaces; this group needs 8');
  463 |     await expect(page.locator('#commit')).toBeDisabled();
  464 |     expect(await state(page)).toEqual(before);
  465 |     for (const size of [
  466 |       { width: 390, height: 844 },
  467 |       { width: 780, height: 320 },
  468 |       { width: 320, height: 740 },
  469 |       { width: 844, height: 390 },
  470 |       { width: 1440, height: 900 },
  471 |     ]) {
  472 |       await page.setViewportSize(size);
  473 |       await expect.poll(async () => (await page.evaluate(measureStory)).failures).toEqual([]);
  474 |       for (const id of ['alder', 'clover', 'poppy', 'wren', 'sorrel', 'finch'])
  475 |         await fullyVisible(page, page.locator(`#passenger-${id}`));
  476 |       await fullyVisible(page, page.locator('#preview .requirement'), false);
  477 |       await snap(page, `${size.width}x${size.height}-six-chooser`);
  478 |       save(`${size.width}x${size.height}-six-fit`, await page.evaluate(measureStory));
  479 |     }
  480 |     await page.setViewportSize({ width: 390, height: 844 });
  481 |     await activate(page, 'passenger-clover', true);
  482 |     await expect(page.locator('#commit')).toBeEnabled();
> 483 |     await expect(page.locator('.requirement')).toContainText('6/6 spaces');
      |                                                ^ Error: expect(locator).toContainText(expected) failed
  484 |     await page.route('**/*rabbit-tan*', (route) =>
  485 |       route.request().resourceType() === 'image' ? route.abort() : route.continue(),
  486 |     );
  487 |     await page.locator('#passenger-finch img').evaluate((img: HTMLImageElement) => {
  488 |       const u = new URL(img.src);
  489 |       u.searchParams.set('fail', '1');
  490 |       img.src = u.href;
  491 |     });
  492 |     await expect(page.locator('#passenger-finch img')).toHaveAttribute(
  493 |       'data-portrait-state',
  494 |       'failed',
  495 |     );
  496 |     await expect(page.locator('#passenger-finch')).toContainText('Finch');
  497 |     await snap(page, '390x844-six-chooser-fallback');
  498 |     await tabTo(page, 'commit');
  499 |     await page.keyboard.press('Enter');
  500 |     await idle(page);
  501 |     expect((await state(page)).aboard).toHaveLength(5);
  502 |     await act(page, 'map-harbor', true);
  503 |     await choose(page, 'unload');
  504 |   } finally {
  505 |     await context.close();
  506 |   }
  507 | });
  508 | 
  509 | test('historical two and three boundaries stay read-only then advance fresh and restore recap', async ({
  510 |   browser,
  511 |   baseURL,
  512 | }) => {
  513 |   for (const [record, scene, previous] of [
  514 |     [complete2, 'driftwood-light', 'bellwater'],
  515 |     [complete3, 'a-wider-deck', 'driftwood-yard'],
  516 |   ] as const) {
  517 |     const context = await browser.newContext({
  518 |       baseURL,
  519 |       viewport: { width: 390, height: 844 },
  520 |       hasTouch: true,
  521 |       isMobile: true,
  522 |     });
  523 |     const page = await context.newPage();
  524 |     try {
  525 |       await seeded(page, record);
  526 |       await page.goto('/');
  527 |       const raw = await recordBytes(page);
  528 |       await expect(page.locator('#home-play')).toHaveText('Continue');
  529 |       await activate(page, 'home-options', true);
  530 |       await activate(page, 'settings-back', true);
  531 |       await activate(page, 'home-practice', true);
  532 |       await expect(page.locator('#practice-wide-berth')).toBeVisible();
  533 |       await activate(page, 'journey-title', true);
  534 |       expect(await recordBytes(page)).toBe(raw);
  535 |       await activate(page, 'home-play', true);
  536 |       expect((await timeline(page)).scene).toBe(scene);
  537 |       expect((await timeline(page)).recap).toBe(false);
  538 |       expect((await snapshot(page)).campaign.level).toBe(previous);
  539 |       await page.reload();
  540 |       await activate(page, 'home-play', true);
  541 |       expect((await timeline(page)).recap).toBe(true);
  542 |       expect((await snapshot(page)).campaign.level).toBe(previous);
  543 |       await snap(page, `390x844-${scene}-restored`);
  544 |       await activate(page, 'story-continue', true);
  545 |       await idle(page);
  546 |       expect((await state(page)).turn).toBe(0);
  547 |     } finally {
  548 |       await context.close();
  549 |     }
  550 |   }
  551 | });
  552 | 
  553 | test('original profiles, dynamic Help, reduced transfers, keyboard and fullscreen lifecycle', async ({
  554 |   browser,
  555 |   baseURL,
  556 | }) => {
  557 |   const context = await browser.newContext({
  558 |     baseURL,
  559 |     viewport: { width: 780, height: 320 },
  560 |     hasTouch: true,
  561 |     isMobile: true,
  562 |   });
  563 |   const page = await context.newPage();
  564 |   try {
  565 |     await ready(page, 'wide-berth');
  566 |     await activate(page, 'menu', true);
  567 |     await page.locator('#help-details summary').tap();
  568 |     await expect(page.locator('#help-details')).toContainText('5–6 spaces = 4');
  569 |     await activate(page, 'settings', true);
  570 |     await page.locator('#motion-preference').selectOption('reduced');
  571 |     await activate(page, 'fullscreen', true);
  572 |     await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
  573 |     const metrics = await context.newCDPSession(page);
  574 |     await metrics.send('Emulation.setDeviceMetricsOverride', {
  575 |       width: 390,
  576 |       height: 844,
  577 |       deviceScaleFactor: 1,
  578 |       mobile: true,
  579 |       screenOrientation: { type: 'portraitPrimary', angle: 0 },
  580 |     });
  581 |     await expect.poll(() => page.evaluate(() => innerWidth)).toBe(390);
  582 |     expect(await page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
  583 |     await snap(page, '390x844-fullscreen-rotation');
```