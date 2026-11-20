# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: story-scenes.spec.ts >> scene native navigation and recovery: keyboard, fullscreen, rotation, background and double activation
- Location: tests\e2e\story-scenes.spec.ts:494:1

# Error details

```
Error: page.setViewportSize: Protocol error (Browser.setWindowBounds): To resize minimized/maximized/fullscreen window, restore it to normal state first.
```

# Test source

```ts
  423 |       await activate(page, mode === 'restored' ? 'journey-continue' : 'journey-new', true);
  424 |       await captions(page);
  425 |       const before = await boundary(page),
  426 |         pending = await checkpoint(page);
  427 |       if (mode === 'skip') {
  428 |         await activate(page, 'story-skip', true);
  429 |         await expect(page.locator('#story-skip')).not.toBeVisible();
  430 |         expect(await checkpoint(page)).toBe(pending);
  431 |         expect(await state(page)).toEqual(before.state);
  432 |         await expect(page.locator('#story-continue')).toBeFocused();
  433 |       }
  434 |       if (mode === 'reduced' || mode === 'restored') {
  435 |         expect((await scene(page)).timeline.settled).toBe(true);
  436 |         await expect(page.locator('#story-skip')).not.toBeVisible();
  437 |       }
  438 |       const ambient =
  439 |         mode === 'skip' || mode === 'reduced' || mode === 'restored'
  440 |           ? await ambientAfterSettlement(page, mode === 'reduced')
  441 |           : null;
  442 |       if (mode === 'immediate') expect(await elapsed(page)).toBeLessThan(2000);
  443 |       await activate(page, 'story-continue', true);
  444 |       await holdingStart(page);
  445 |       observations.push({
  446 |         mode,
  447 |         before,
  448 |         after: await boundary(page),
  449 |         scene: await scene(page),
  450 |         ambient,
  451 |       });
  452 |       if (mode === 'immediate') {
  453 |         await act(page, 'unload', true);
  454 |         const afterAction = await state(page);
  455 |         await page.waitForTimeout(7600);
  456 |         expect(await state(page)).toEqual(afterAction);
  457 |         expect((await boundary(page)).history).toBe(1);
  458 |         await undo(page, true);
  459 |         await holdingStart(page);
  460 |       }
  461 |     } finally {
  462 |       await context.close();
  463 |     }
  464 |   }
  465 |   const context = await browser.newContext({
  466 |     baseURL,
  467 |     viewport: { width: 390, height: 844 },
  468 |     hasTouch: true,
  469 |     isMobile: true,
  470 |   });
  471 |   await seed(context, connectionCheckpoint);
  472 |   const page = await context.newPage();
  473 |   try {
  474 |     await title(page);
  475 |     await activate(page, 'journey-continue', true);
  476 |     await captions(page, true);
  477 |     expect((await scene(page)).timeline.settled).toBe(true);
  478 |     await expect(page.locator('#story-skip')).not.toBeVisible();
  479 |     await snapshot(page, '390x844-connection-restored', 'home');
  480 |     await activate(page, 'story-continue', true);
  481 |     expect(await state(page)).toMatchObject({
  482 |       turn: 0,
  483 |       boatNodeId: 'harbor',
  484 |       aboard: [],
  485 |       delivered: [],
  486 |     });
  487 |     expect(JSON.parse((await checkpoint(page))!)).toEqual(bellwaterCheckpoint);
  488 |   } finally {
  489 |     await context.close();
  490 |   }
  491 |   writeFileSync(`${reviewDir}/equivalent-entries.json`, JSON.stringify(observations, null, 2));
  492 | });
  493 | 
  494 | test('scene native navigation and recovery: keyboard, fullscreen, rotation, background and double activation', async ({
  495 |   browser,
  496 |   baseURL,
  497 | }) => {
  498 |   const context = await browser.newContext({
  499 |     baseURL,
  500 |     viewport: { width: 320, height: 740 },
  501 |     hasTouch: true,
  502 |     isMobile: true,
  503 |     deviceScaleFactor: 1,
  504 |   });
  505 |   const page = await context.newPage();
  506 |   try {
  507 |     await title(page);
  508 |     await tabTo(page, 'journey-settings');
  509 |     await page.keyboard.press('Enter');
  510 |     await tabTo(page, 'fullscreen');
  511 |     await page.keyboard.press('Enter');
  512 |     await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
  513 |     await page.keyboard.press('Escape');
  514 |     if (await page.locator('#settings-back').isVisible()) await activate(page, 'settings-back');
  515 |     await tabTo(page, 'journey-new');
  516 |     await page.keyboard.press('Enter');
  517 |     await captions(page);
  518 |     await page.keyboard.press('Shift+Tab');
  519 |     await expect(page.locator('#story-skip')).toBeFocused();
  520 |     await page.keyboard.press('Enter');
  521 |     await expect(page.locator('#story-skip')).not.toBeVisible();
  522 |     await expect(page.locator('#story-continue')).toBeFocused();
> 523 |     await page.setViewportSize({ width: 780, height: 320 });
      |                ^ Error: page.setViewportSize: Protocol error (Browser.setWindowBounds): To resize minimized/maximized/fullscreen window, restore it to normal state first.
  524 |     await captions(page);
  525 |     await page.evaluate(() => {
  526 |       Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  527 |       document.dispatchEvent(new Event('visibilitychange'));
  528 |       Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  529 |       document.dispatchEvent(new Event('visibilitychange'));
  530 |     });
  531 |     await expect.poll(async () => (await scene(page)).timeline.settled).toBe(true);
  532 |     await expect(page.locator('#story-skip')).not.toBeVisible();
  533 |     await captions(page);
  534 |     await snapshot(page, '780x320-background-rotation-settled', 'both');
  535 |     const button = await page.locator('#story-continue').boundingBox();
  536 |     await page.touchscreen.tap(button!.x + button!.width / 2, button!.y + button!.height / 2);
  537 |     await page.touchscreen.tap(button!.x + button!.width / 2, button!.y + button!.height / 2);
  538 |     await holdingStart(page);
  539 |     if (await page.locator('#dialog').isVisible()) await page.keyboard.press('Escape');
  540 |     await tabTo(page, 'menu');
  541 |     await page.keyboard.press('Enter');
  542 |     await tabTo(page, 'settings');
  543 |     await page.keyboard.press('Enter');
  544 |     if (await page.evaluate(() => !!document.fullscreenElement)) {
  545 |       await tabTo(page, 'fullscreen');
  546 |       await page.keyboard.press('Enter');
  547 |       await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  548 |       await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  549 |     }
  550 |   } finally {
  551 |     await context.close();
  552 |   }
  553 | });
  554 | 
  555 | test('scene cold touch and mute: immediate controls retain native audio intent and one context', async ({
  556 |   browser,
  557 |   baseURL,
  558 | }) => {
  559 |   const observations: unknown[] = [];
  560 |   for (const muted of [false, true]) {
  561 |     const context = await browser.newContext({
  562 |       baseURL,
  563 |       viewport: { width: 844, height: 390 },
  564 |       hasTouch: true,
  565 |       isMobile: true,
  566 |     });
  567 |     if (muted) await context.addInitScript(() => localStorage.setItem('last-ferry-muted', 'true'));
  568 |     const page = await context.newPage();
  569 |     try {
  570 |       await page.goto('/');
  571 |       await expect
  572 |         .poll(() =>
  573 |           passive(
  574 |             page,
  575 |             () => !!document.getElementById('journey-new')?.getBoundingClientRect().width,
  576 |           ),
  577 |         )
  578 |         .toBe(true);
  579 |       const cold = await passive(page, () => ({
  580 |         activation: navigator.userActivation.hasBeenActive,
  581 |         audio: (window as any).__LAST_FERRY__.getAudioStatus(),
  582 |       }));
  583 |       expect(cold.activation).toBe(false);
  584 |       expect(cold.audio).toMatchObject({ contextCount: 0 });
  585 |       await coldTouch(page, 'journey-new');
  586 |       if (muted)
  587 |         expect(
  588 |           (await passive(page, () => (window as any).__LAST_FERRY__.getAudioStatus())).muted,
  589 |         ).toBe(true);
  590 |       else
  591 |         await expect
  592 |           .poll(() => passive(page, () => (window as any).__LAST_FERRY__.getAudioStatus().running))
  593 |           .toBe(true);
  594 |       await captions(page);
  595 |       const pending = await checkpoint(page);
  596 |       await page.evaluate(() => {
  597 |         Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  598 |         document.dispatchEvent(new Event('visibilitychange'));
  599 |         Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  600 |         document.dispatchEvent(new Event('visibilitychange'));
  601 |       });
  602 |       expect((await scene(page)).timeline.settled).toBe(true);
  603 |       expect(await checkpoint(page)).toBe(pending);
  604 |       expect((await state(page)).turn).toBe(0);
  605 |       await activate(page, 'story-continue', true);
  606 |       await holdingStart(page);
  607 |       const after = await passive(page, () => (window as any).__LAST_FERRY__.getAudioStatus());
  608 |       if (muted) expect(after.muted).toBe(true);
  609 |       else expect(after).toMatchObject({ contextCount: 1, schedulerCount: 1 });
  610 |       observations.push({ muted, cold, after });
  611 |     } finally {
  612 |       await context.close();
  613 |     }
  614 |   }
  615 |   writeFileSync(`${reviewDir}/audio-intent.json`, JSON.stringify(observations, null, 2));
  616 | });
  617 | 
  618 | test('scene remaining composition sizes and production: complete captions and immediate handoff', async ({
  619 |   browser,
  620 |   baseURL,
  621 | }) => {
  622 |   const compositions: unknown[] = [];
  623 |   for (const [width, height] of [
```