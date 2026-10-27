# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: story-production.spec.ts >> production navigation, restored checkpoints, Reduced Motion and isolated practice
- Location: tests\e2e\story-production.spec.ts:511:1

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  locator('#story-settings')
Expected: focused
Received: inactive
Timeout:  10000ms

Call log:
  - Expect "toBeFocused" locator('#story-settings') with timeout 10000ms
  - waiting for locator('#story-settings')
    23 × locator resolved to <button id="story-settings" class="cove-button cove-button--quiet">…</button>
       - unexpected value "inactive"

```

```yaml
- main:
  - region "The Holding Pier"
  - status
```

# Test source

```ts
  443 |           expect(begin.before.story.timeline.settled).toBe(false);
  444 |           expect(begin.before.story.timeline.elapsed).toBeLessThan(1050);
  445 |           await page.waitForFunction(
  446 |             () => (window as any).__LAST_FERRY__.getStoryStatus().timeline.elapsed >= 2800,
  447 |           );
  448 |           const middle = await snapshot(page, `${width}x${height}-shot-${shot}-intermediate`);
  449 |           run.snapshots.push(middle);
  450 |           expect(middle.before.story.timeline.settled).toBe(false);
  451 |           expect(middle.before.story.timeline.elapsed).toBeLessThan(4000);
  452 |           await settled(page);
  453 |         } else await page.waitForTimeout(1400);
  454 |         run.snapshots.push(
  455 |           await snapshot(page, `${width}x${height}-shot-${shot}-${detailed ? 'end' : 'fit'}`),
  456 |         );
  457 |         expect(await checkpoint(page)).toBe(pending);
  458 |         if (shot < 2) await activate(page, 'story-continue', true);
  459 |       }
  460 |       await activate(page, 'story-read', true);
  461 |       for (const copy of openingText)
  462 |         for (const line of copy.split('\n'))
  463 |           await expect(page.locator('#dialog')).toContainText(line);
  464 |       await fullyVisible(page, page.locator('#story-read-back'));
  465 |       await page.keyboard.press('Escape');
  466 |       await expect(page.locator('#story-read')).toBeFocused();
  467 |       await activate(page, 'story-continue', true);
  468 |       await holdingStart(page);
  469 |       await page.evaluate(() =>
  470 |         localStorage.setItem(
  471 |           'last-ferry.journey.v1',
  472 |           JSON.stringify({
  473 |             version: 1,
  474 |             checkpoint: { kind: 'scene', id: 'another-bell' },
  475 |             completed: ['holding-pier'],
  476 |             acknowledgedScenes: ['opening'],
  477 |           }),
  478 |         ),
  479 |       );
  480 |       await page.reload();
  481 |       await activate(page, 'journey-continue', true);
  482 |       expect(await timeline(page)).toMatchObject({
  483 |         scene: 'another-bell',
  484 |         shotIndex: 0,
  485 |         settled: true,
  486 |       });
  487 |       run.harborFixture =
  488 |         'Valid pending cove-boundary checkpoint, separate from the real uninterrupted earned-rescue sequence. Replay drives actual production illustration; no gameplay state is injected.';
  489 |       if (detailed) {
  490 |         await activate(page, 'story-replay-scene', true);
  491 |         const begin = await snapshot(page, `${width}x${height}-harbor-begin`);
  492 |         run.snapshots.push(begin);
  493 |         expect(begin.before.story.timeline.settled).toBe(false);
  494 |         expect(begin.before.story.timeline.elapsed).toBeLessThan(1050);
  495 |         await page.waitForFunction(
  496 |           () => (window as any).__LAST_FERRY__.getStoryStatus().timeline.elapsed >= 2800,
  497 |         );
  498 |         run.snapshots.push(await snapshot(page, `${width}x${height}-harbor-intermediate`));
  499 |         await settled(page);
  500 |       }
  501 |       run.snapshots.push(await snapshot(page, `${width}x${height}-harbor-end`));
  502 |     } finally {
  503 |       run.video = await page.video()!.path();
  504 |       await context.close();
  505 |       records.push(run);
  506 |       save('native-compositions', records);
  507 |     }
  508 |   }
  509 | });
  510 | 
  511 | test('production navigation, restored checkpoints, Reduced Motion and isolated practice', async ({
  512 |   browser,
  513 |   baseURL,
  514 | }) => {
  515 |   const context = await browser.newContext({
  516 |     baseURL,
  517 |     viewport: { width: 390, height: 844 },
  518 |     hasTouch: true,
  519 |     isMobile: true,
  520 |     deviceScaleFactor: 1,
  521 |   });
  522 |   const page = await context.newPage(),
  523 |     records: any[] = [];
  524 |   try {
  525 |     await title(page);
  526 |     await tabTo(page, 'journey-new');
  527 |     await page.keyboard.press('Enter');
  528 |     const pending = await checkpoint(page),
  529 |       original = await state(page);
  530 |     await tabTo(page, 'story-read');
  531 |     await page.keyboard.press('Enter');
  532 |     expect((await timeline(page)).shotIndex).toBe(0);
  533 |     expect((await timeline(page)).settled).toBe(true);
  534 |     for (const copy of openingText)
  535 |       for (const line of copy.split('\n'))
  536 |         await expect(page.locator('#dialog')).toContainText(line);
  537 |     await page.keyboard.press('Escape');
  538 |     await expect(page.locator('#story-read')).toBeFocused();
  539 |     await tabTo(page, 'story-settings', true);
  540 |     await page.keyboard.press('Enter');
  541 |     await page.locator('#motion-preference').selectOption('reduced');
  542 |     await page.keyboard.press('Escape');
> 543 |     await expect(page.locator('#story-settings')).toBeFocused();
      |                                                   ^ Error: expect(locator).toBeFocused() failed
  544 |     expect((await timeline(page)).shotIndex).toBe(0);
  545 |     await tabTo(page, 'story-continue');
  546 |     await page.keyboard.press('Enter');
  547 |     expect(await timeline(page)).toMatchObject({
  548 |       shotIndex: 1,
  549 |       settled: true,
  550 |       captionVisible: true,
  551 |     });
  552 |     await activate(page, 'story-settings', true);
  553 |     await page.locator('#motion-preference').selectOption('device');
  554 |     await activate(page, 'settings-back', true);
  555 |     expect(await timeline(page)).toMatchObject({ shotIndex: 1, settled: true });
  556 |     await activate(page, 'story-replay', true);
  557 |     expect(await timeline(page)).toMatchObject({ shotIndex: 1, settled: false });
  558 |     await page.evaluate(() => {
  559 |       Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  560 |       document.dispatchEvent(new Event('visibilitychange'));
  561 |       Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  562 |       document.dispatchEvent(new Event('visibilitychange'));
  563 |     });
  564 |     expect(await timeline(page)).toMatchObject({ shotIndex: 1, settled: true });
  565 |     expect(await checkpoint(page)).toBe(pending);
  566 |     expect(await state(page)).toEqual(original);
  567 |     await page.keyboard.press('Escape');
  568 |     expect(await timeline(page)).toMatchObject({ shotIndex: 2, settled: true });
  569 |     await expect(page.locator('#story-continue')).toBeFocused();
  570 |     await expect(page.locator('#story-replay-scene')).toBeVisible();
  571 |     await snapshot(page, '390x844-skip-recap');
  572 |     await page.setViewportSize({ width: 780, height: 320 });
  573 |     await snapshot(page, '780x320-skip-recap');
  574 |     await page.setViewportSize({ width: 390, height: 844 });
  575 |     records.push(await inspect(page));
  576 |     await page.reload();
  577 |     await activate(page, 'journey-continue', true);
  578 |     expect(await timeline(page)).toMatchObject({ shotIndex: 2, settled: true });
  579 |     expect(await checkpoint(page)).toBe(pending);
  580 |     await activate(page, 'story-replay-scene', true);
  581 |     expect(await timeline(page)).toMatchObject({ shotIndex: 0, settled: false });
  582 |     await page.locator('#story-continue').dblclick();
  583 |     expect((await timeline(page)).scene).toBe('opening');
  584 |     expect(await checkpoint(page)).toBe(pending);
  585 |     await activate(page, 'story-skip', true);
  586 |     const final = await page.locator('#story-continue').boundingBox();
  587 |     await page.touchscreen.tap(final!.x + final!.width / 2, final!.y + final!.height / 2);
  588 |     await page.touchscreen.tap(final!.x + final!.width / 2, final!.y + final!.height / 2);
  589 |     await holdingStart(page);
  590 |     records.push(await inspect(page));
  591 |     const saved = await checkpoint(page);
  592 |     for (const cove of ['first-crossing', 'holding-pier', 'bellwater']) {
  593 |       await page.goto(`/?cove=${cove}`);
  594 |       await idle(page);
  595 |       expect((await inspect(page)).campaign.entry).toBe('direct');
  596 |       expect(await checkpoint(page)).toBe(saved);
  597 |       await activate(page, 'menu', true);
  598 |       await page.keyboard.press('Escape');
  599 |     }
  600 |     await page.goto('/');
  601 |     await activate(page, 'journey-continue', true);
  602 |     await holdingStart(page);
  603 |   } finally {
  604 |     save('navigation-lifecycle', records);
  605 |     await context.close();
  606 |   }
  607 | });
  608 | 
  609 | test('production cold audio, canceled story cues, mute and bounded Replay', async ({
  610 |   browser,
  611 |   baseURL,
  612 | }) => {
  613 |   const records: any[] = [];
  614 |   for (const muted of [false, true]) {
  615 |     const context = await browser.newContext({
  616 |       baseURL,
  617 |       viewport: { width: 844, height: 390 },
  618 |       hasTouch: true,
  619 |       isMobile: true,
  620 |     });
  621 |     if (muted) await context.addInitScript(() => localStorage.setItem('last-ferry-muted', 'true'));
  622 |     const page = await context.newPage();
  623 |     try {
  624 |       await page.goto('/');
  625 |       await expect
  626 |         .poll(() =>
  627 |           passive(
  628 |             page,
  629 |             () => !!document.getElementById('journey-new')?.getBoundingClientRect().width,
  630 |           ),
  631 |         )
  632 |         .toBe(true);
  633 |       const before = await passive(page, () => ({
  634 |         activation: navigator.userActivation.hasBeenActive,
  635 |         audio: (window as any).__LAST_FERRY__.getAudioStatus(),
  636 |       }));
  637 |       expect(before.activation).toBe(false);
  638 |       expect(before.audio.contextCount).toBe(0);
  639 |       await coldTouch(page, 'journey-new');
  640 |       if (!muted) await expect.poll(async () => (await audio(page)).running).toBe(true);
  641 |       const pending = await checkpoint(page);
  642 |       await activate(page, 'story-continue', true);
  643 |       await activate(page, 'story-replay', true);
```