# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: wide-berth.spec.ts >> original profiles, dynamic Help, reduced transfers, keyboard and fullscreen lifecycle
- Location: tests\e2e\wide-berth.spec.ts:511:1

# Error details

```
Error: page.setViewportSize: Protocol error (Browser.setWindowBounds): To resize minimized/maximized/fullscreen window, restore it to normal state first.
```

# Test source

```ts
  431 |       await page.setViewportSize(size);
  432 |       await expect.poll(async () => (await page.evaluate(measureStory)).failures).toEqual([]);
  433 |       for (const id of ['alder', 'clover', 'poppy', 'wren', 'sorrel', 'finch'])
  434 |         await fullyVisible(page, page.locator(`#passenger-${id}`));
  435 |       await snap(page, `${size.width}x${size.height}-six-chooser`);
  436 |       save(`${size.width}x${size.height}-six-fit`, await page.evaluate(measureStory));
  437 |     }
  438 |     await page.setViewportSize({ width: 390, height: 844 });
  439 |     await activate(page, 'passenger-clover', true);
  440 |     await expect(page.locator('#commit')).toBeEnabled();
  441 |     await expect(page.locator('.requirement')).toContainText('6/6 spaces');
  442 |     await page.route('**/*rabbit-tan*', (route) =>
  443 |       route.request().resourceType() === 'image' ? route.abort() : route.continue(),
  444 |     );
  445 |     await page.locator('#passenger-finch img').evaluate((img: HTMLImageElement) => {
  446 |       const u = new URL(img.src);
  447 |       u.searchParams.set('fail', '1');
  448 |       img.src = u.href;
  449 |     });
  450 |     await expect(page.locator('#passenger-finch img')).toHaveAttribute(
  451 |       'data-portrait-state',
  452 |       'failed',
  453 |     );
  454 |     await expect(page.locator('#passenger-finch')).toContainText('Finch');
  455 |     await snap(page, '390x844-six-chooser-fallback');
  456 |     await tabTo(page, 'commit');
  457 |     await page.keyboard.press('Enter');
  458 |     await idle(page);
  459 |     expect((await state(page)).aboard).toHaveLength(5);
  460 |     await act(page, 'map-harbor', true);
  461 |     await choose(page, 'unload');
  462 |   } finally {
  463 |     await context.close();
  464 |   }
  465 | });
  466 | 
  467 | test('historical two and three boundaries stay read-only then advance fresh and restore recap', async ({
  468 |   browser,
  469 |   baseURL,
  470 | }) => {
  471 |   for (const [record, scene, previous] of [
  472 |     [complete2, 'driftwood-light', 'bellwater'],
  473 |     [complete3, 'a-wider-deck', 'driftwood-yard'],
  474 |   ] as const) {
  475 |     const context = await browser.newContext({
  476 |       baseURL,
  477 |       viewport: { width: 390, height: 844 },
  478 |       hasTouch: true,
  479 |       isMobile: true,
  480 |     });
  481 |     const page = await context.newPage();
  482 |     try {
  483 |       await seeded(page, record);
  484 |       await page.goto('/');
  485 |       const raw = await recordBytes(page);
  486 |       await expect(page.locator('#home-play')).toHaveText('Continue');
  487 |       await activate(page, 'home-options', true);
  488 |       await activate(page, 'settings-back', true);
  489 |       await activate(page, 'home-practice', true);
  490 |       await expect(page.locator('#practice-wide-berth')).toBeVisible();
  491 |       await activate(page, 'journey-title', true);
  492 |       expect(await recordBytes(page)).toBe(raw);
  493 |       await activate(page, 'home-play', true);
  494 |       expect((await timeline(page)).scene).toBe(scene);
  495 |       expect((await timeline(page)).recap).toBe(false);
  496 |       expect((await snapshot(page)).campaign.level).toBe(previous);
  497 |       await page.reload();
  498 |       await activate(page, 'home-play', true);
  499 |       expect((await timeline(page)).recap).toBe(true);
  500 |       expect((await snapshot(page)).campaign.level).toBe(previous);
  501 |       await snap(page, `390x844-${scene}-restored`);
  502 |       await activate(page, 'story-continue', true);
  503 |       await idle(page);
  504 |       expect((await state(page)).turn).toBe(0);
  505 |     } finally {
  506 |       await context.close();
  507 |     }
  508 |   }
  509 | });
  510 | 
  511 | test('original profiles, dynamic Help, reduced transfers, keyboard and fullscreen lifecycle', async ({
  512 |   browser,
  513 |   baseURL,
  514 | }) => {
  515 |   const context = await browser.newContext({
  516 |     baseURL,
  517 |     viewport: { width: 780, height: 320 },
  518 |     hasTouch: true,
  519 |     isMobile: true,
  520 |   });
  521 |   const page = await context.newPage();
  522 |   try {
  523 |     await ready(page, 'wide-berth');
  524 |     await activate(page, 'menu', true);
  525 |     await page.locator('#help-details summary').tap();
  526 |     await expect(page.locator('#help-details')).toContainText('5–6 spaces = 4');
  527 |     await activate(page, 'settings', true);
  528 |     await page.locator('#motion-preference').selectOption('reduced');
  529 |     await activate(page, 'fullscreen', true);
  530 |     await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
> 531 |     await page.setViewportSize({ width: 390, height: 844 });
      |                ^ Error: page.setViewportSize: Protocol error (Browser.setWindowBounds): To resize minimized/maximized/fullscreen window, restore it to normal state first.
  532 |     await page.evaluate(() => document.exitFullscreen());
  533 |     await page.keyboard.press('Escape');
  534 |     await page.keyboard.press('Escape');
  535 |     await keyAct(page, 'map-high-quay');
  536 |     await keyAct(page, 'map-wide-berth');
  537 |     await keyAct(page, 'board');
  538 |     await undo(page, true);
  539 |     expect(await state(page)).toMatchObject({ turn: 2, aboard: [] });
  540 |     await activate(page, 'menu', true);
  541 |     await activate(page, 'settings', true);
  542 |     await page.locator('#motion-preference').selectOption('device');
  543 |     await page.keyboard.press('Escape');
  544 |     await page.keyboard.press('Escape');
  545 |     for (const cove of ['first-crossing', 'holding-pier', 'bellwater', 'driftwood-yard']) {
  546 |       await ready(page, cove);
  547 |       await expect(page.locator('#boat-summary')).toContainText('/4 spaces');
  548 |       await activate(page, 'menu', true);
  549 |       await page.locator('#help-details summary').tap();
  550 |       await expect(page.locator('#help-details')).not.toContainText('5–6 spaces');
  551 |       await page.keyboard.press('Escape');
  552 |     }
  553 |     await ready(page, 'holding-pier');
  554 |     await keyAct(page, 'unload');
  555 |     await undo(page, true);
  556 |     expect((await state(page)).aboard).toEqual(['sheep-1']);
  557 |     await ready(page, 'first-crossing');
  558 |     await keyAct(page, 'map-sheep-pier');
  559 |     await keyAct(page, 'board');
  560 |     await undo(page, true);
  561 |     expect((await state(page)).aboard).toHaveLength(2);
  562 |   } finally {
  563 |     await context.close();
  564 |   }
  565 | });
  566 | 
  567 | test('launch playback intent, pause, skip, replay, mute and controlled background recovery', async ({
  568 |   browser,
  569 |   baseURL,
  570 | }) => {
  571 |   const context = await browser.newContext({
  572 |     baseURL,
  573 |     viewport: { width: 390, height: 844 },
  574 |     hasTouch: true,
  575 |     isMobile: true,
  576 |   });
  577 |   const page = await context.newPage();
  578 |   try {
  579 |     await seeded(page, complete3);
  580 |     await page.goto('/');
  581 |     await coldTouch(page, 'home-play');
  582 |     await expect.poll(async () => (await timeline(page)).elapsed).toBeGreaterThan(1300);
  583 |     await activate(page, 'story-pause', true);
  584 |     const paused = await timeline(page);
  585 |     const saved = await recordBytes(page);
  586 |     await page.waitForTimeout(220);
  587 |     expect((await timeline(page)).elapsed).toBe(paused.elapsed);
  588 |     await activate(page, 'story-sound', true);
  589 |     await expect(page.locator('#story-sound')).toContainText(/Enable|Retry/);
  590 |     await activate(page, 'story-sound', true);
  591 |     await activate(page, 'story-pause', true);
  592 |     await expect.poll(async () => (await timeline(page)).elapsed).toBeGreaterThan(paused.elapsed);
  593 |     await page.locator('#story-more summary').tap();
  594 |     await activate(page, 'story-skip', true);
  595 |     expect((await timeline(page)).recap).toBe(true);
  596 |     expect(await recordBytes(page)).toBe(saved);
  597 |     await page.locator('#story-more summary').tap();
  598 |     await activate(page, 'story-replay-scene', true);
  599 |     await page.evaluate(() => {
  600 |       Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  601 |       document.dispatchEvent(new Event('visibilitychange'));
  602 |     });
  603 |     await page.evaluate(() => {
  604 |       Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  605 |       document.dispatchEvent(new Event('visibilitychange'));
  606 |     });
  607 |     expect((await timeline(page)).settled).toBe(true);
  608 |     expect(await recordBytes(page)).toBe(saved);
  609 |     if (!(await page.locator('#story-read').isVisible()))
  610 |       await page.locator('#story-more summary').tap();
  611 |     await activate(page, 'story-read', true);
  612 |     await expect(page.locator('#dialog')).toContainText(
  613 |       'Nell had a bigger boat ready. Now there are hands to launch it.',
  614 |     );
  615 |     await page.keyboard.press('Escape');
  616 |     await snap(page, '390x844-launch-recovery');
  617 |     await activate(page, 'story-continue', true);
  618 |     await idle(page);
  619 |     expect(await state(page)).toMatchObject({ turn: 0, boatNodeId: 'harbor', aboard: [] });
  620 |     save('launch-recovery', await snapshot(page));
  621 |   } finally {
  622 |     await context.close();
  623 |   }
  624 | });
  625 | 
```