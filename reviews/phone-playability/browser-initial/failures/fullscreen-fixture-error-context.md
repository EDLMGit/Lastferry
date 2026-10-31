# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phone-playability.spec.ts >> phone fullscreen: real API result, root includes dialogs and external exit preserves subset
- Location: tests\e2e\phone-playability.spec.ts:540:1

# Error details

```
Error: locator.isChecked: Error: Not a checkbox or radio button
Call log:
  - waiting for locator('#passenger-sheep-1')

```

# Test source

```ts
  474 |     });
  475 |   } finally {
  476 |     await context.close();
  477 |   }
  478 | });
  479 | 
  480 | test('phone nearby decisions: Wait and losing Sail retain their actual control anchors', async ({
  481 |   browser,
  482 | }) => {
  483 |   const context = await browser.newContext({
  484 |     baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
  485 |     viewport: { width: 780, height: 320 },
  486 |     deviceScaleFactor: 1,
  487 |     hasTouch: true,
  488 |     isMobile: true,
  489 |   });
  490 |   const page = await context.newPage();
  491 |   try {
  492 |     await ready(page, 'holding-pier');
  493 |     await observed(page, 'nearby-decisions', async (save) => {
  494 |       for (let turn = 0; turn < 3; turn++) {
  495 |         const original = await stable(page),
  496 |           anchor = await rect(page, 'wait');
  497 |         await press(page, 'wait');
  498 |         const p = await placement(page);
  499 |         expect(p.anchor.left).toBeCloseTo(anchor.left, 1);
  500 |         expect(p.anchor.top).toBeCloseTo(anchor.top, 1);
  501 |         await fullyVisible(page, page.locator('#commit'));
  502 |         await fullyVisible(page, page.locator('#cancel'));
  503 |         expect(await stable(page)).toEqual(original);
  504 |         if (turn === 0) {
  505 |           await save('wait-preview', true);
  506 |           await page.keyboard.press('Escape');
  507 |           expect(await page.locator('#wait')).toBeFocused();
  508 |           await press(page, 'wait');
  509 |         }
  510 |         await press(page, 'commit');
  511 |         await idle(page);
  512 |       }
  513 |       await whole(page);
  514 |       await place(page, 'harbor');
  515 |       const before = await stable(page),
  516 |         anchor = await rect(page, 'sail');
  517 |       await press(page, 'sail');
  518 |       await expect(page.locator('#dialog')).toBeVisible();
  519 |       await expect(page.locator('#dialog')).toContainText(/lost|flood|cannot|unsafe/i);
  520 |       const p = await placement(page);
  521 |       expect(p.anchor.left).toBeCloseTo(anchor.left, 1);
  522 |       expect(p.anchor.top).toBeCloseTo(anchor.top, 1);
  523 |       await fullyVisible(page, page.locator('#commit'));
  524 |       await save('risky-sail', true);
  525 |       await page.keyboard.press('Escape');
  526 |       expect(await stable(page)).toEqual(before);
  527 |       await press(page, 'sail');
  528 |       await press(page, 'commit');
  529 |       await idle(page);
  530 |       expect((await state(page)).status).toBe('lost');
  531 |       await expect(page.locator('#dialog')).toContainText(/undo|earlier|restart/i);
  532 |       await undo(page, true);
  533 |       expect(await stable(page)).toEqual(before);
  534 |     });
  535 |   } finally {
  536 |     await context.close();
  537 |   }
  538 | });
  539 | 
  540 | test('phone fullscreen: real API result, root includes dialogs and external exit preserves subset', async ({
  541 |   browser,
  542 | }) => {
  543 |   const context = await browser.newContext({
  544 |     baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
  545 |     viewport: { width: 844, height: 390 },
  546 |     deviceScaleFactor: 1,
  547 |     hasTouch: true,
  548 |     isMobile: true,
  549 |   });
  550 |   const page = await context.newPage();
  551 |   try {
  552 |     await ready(page, 'holding-pier');
  553 |     await observed(page, 'fullscreen-actual', async (save) => {
  554 |       const original = await stable(page);
  555 |       await press(page, 'menu');
  556 |       const enabled = await page.evaluate(
  557 |         () =>
  558 |           document.fullscreenEnabled &&
  559 |           typeof document.querySelector('#app')!.requestFullscreen === 'function',
  560 |       );
  561 |       await press(page, 'fullscreen');
  562 |       await page.waitForTimeout(300);
  563 |       const actual = await page.evaluate(() => ({
  564 |         element: document.fullscreenElement?.id ?? null,
  565 |         dialogInside: !!document.fullscreenElement?.contains(document.querySelector('#dialog')),
  566 |         enabled: document.fullscreenEnabled,
  567 |       }));
  568 |       await save('request-result', true);
  569 |       if (actual.element) {
  570 |         expect(actual).toMatchObject({ element: 'app', dialogInside: true });
  571 |         await press(page, 'cancel');
  572 |         await press(page, 'unload');
  573 |         await press(page, 'passenger-sheep-1');
> 574 |         const selected = await page.locator('#passenger-sheep-1').isChecked();
      |                                                                   ^ Error: locator.isChecked: Error: Not a checkbox or radio button
  575 |         await page.evaluate(() => document.exitFullscreen());
  576 |         await page.waitForTimeout(200);
  577 |         expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
  578 |         expect(await page.locator('#passenger-sheep-1').isChecked()).toBe(selected);
  579 |         await fullyVisible(page, page.locator('#commit'));
  580 |         await fullyVisible(page, page.locator('#cancel'));
  581 |         await save('external-exit-preview', true);
  582 |       } else {
  583 |         await expect(page.locator('#view-notice')).toContainText(
  584 |           /fullscreen|screen|available|supported/i,
  585 |         );
  586 |         expect(enabled).toBeDefined();
  587 |       }
  588 |       expect(await stable(page)).toEqual(original);
  589 |     });
  590 |   } finally {
  591 |     await context.close();
  592 |   }
  593 | });
  594 | 
  595 | for (const scenario of ['rejected', 'unavailable'])
  596 |   test(`phone fullscreen ${scenario}: labeled mocked fallback leaves play usable`, async ({
  597 |     browser,
  598 |   }) => {
  599 |     const context = await browser.newContext({
  600 |       baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
  601 |       viewport: { width: 390, height: 844 },
  602 |       deviceScaleFactor: 1,
  603 |       hasTouch: true,
  604 |       isMobile: true,
  605 |     });
  606 |     await context.addInitScript((scenario) => {
  607 |       Object.defineProperty(Element.prototype, 'requestFullscreen', {
  608 |         configurable: true,
  609 |         value:
  610 |           scenario === 'unavailable'
  611 |             ? undefined
  612 |             : function () {
  613 |                 return Promise.reject(new DOMException('Test rejection', 'NotAllowedError'));
  614 |               },
  615 |       });
  616 |       if (scenario === 'unavailable')
  617 |         Object.defineProperty(document, 'fullscreenEnabled', {
  618 |           configurable: true,
  619 |           get: () => false,
  620 |         });
  621 |     }, scenario);
  622 |     const page = await context.newPage();
  623 |     try {
  624 |       await ready(page, 'holding-pier');
  625 |       await observed(page, `fullscreen-mocked-${scenario}`, async (save) => {
  626 |         const original = await stable(page);
  627 |         await press(page, 'menu');
  628 |         await press(page, 'fullscreen');
  629 |         await expect(page.locator('#view-notice')).toContainText(
  630 |           /fullscreen|screen|available|supported|could/i,
  631 |         );
  632 |         expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
  633 |         expect(await stable(page)).toEqual(original);
  634 |         await save('notice', true);
  635 |         await page.keyboard.press('Escape');
  636 |         await press(page, 'unload');
  637 |         await fullyVisible(page, page.locator('#commit'));
  638 |         await page.keyboard.press('Escape');
  639 |         expect(await stable(page)).toEqual(original);
  640 |       });
  641 |     } finally {
  642 |       await context.close();
  643 |     }
  644 |   });
  645 | 
  646 | test('desktop and other coves: keyboard overview, Bellwater outer route, First Crossing and arrival remain coherent', async ({
  647 |   page,
  648 | }) => {
  649 |   test.setTimeout(180000);
  650 |   await ready(page, 'bellwater');
  651 |   await observed(page, 'desktop-coves', async (save) => {
  652 |     await tabTo(page, 'view-toggle');
  653 |     await page.keyboard.press('Enter');
  654 |     await markerAlignment(page, true);
  655 |     for (const id of ['shallows', 'low-pier']) await move(page, id, false);
  656 |     await transfer(page, 'board', false);
  657 |     await move(page, 'east-buoy', false);
  658 |     await move(page, 'west-buoy', false);
  659 |     await move(page, 'harbor', false);
  660 |     await move(page, 'bell-pier', false);
  661 |     await transfer(page, 'board', false);
  662 |     await move(page, 'harbor', false);
  663 |     await transfer(page, 'unload', false);
  664 |     expect((await state(page)).status).toBe('won');
  665 |     await save('bellwater-won', true);
  666 |     await page.goto('/?cove=first-crossing');
  667 |     await page.waitForFunction(() => (window as any).__LAST_FERRY__?.getMetrics().frames > 4);
  668 |     await idle(page);
  669 |     await whole(page, false);
  670 |     await markerAlignment(page, true);
  671 |     await save('first-crossing-smoke', true);
  672 |     await page.goto('/?cove=holding-pier');
  673 |     await page.waitForFunction(() => (window as any).__LAST_FERRY__?.getMetrics().frames > 4);
  674 |     await idle(page);
```