# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: story-production.spec.ts >> production controlled pending resume cannot revive a skipped story cue after mute
- Location: tests\e2e\story-production.spec.ts:681:1

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0

Call Log:
- Timeout 8000ms exceeded while waiting on the predicate
```

# Test source

```ts
  639 |       await coldTouch(page, 'journey-new');
  640 |       if (!muted) await expect.poll(async () => (await audio(page)).running).toBe(true);
  641 |       const pending = await checkpoint(page);
  642 |       await activate(page, 'story-continue', true);
  643 |       await activate(page, 'story-replay', true);
  644 |       await activate(page, 'story-read', true);
  645 |       const quiet = await audio(page);
  646 |       expect(Number.isInteger(quiet.storyPlayed)).toBe(true);
  647 |       await page.waitForTimeout(1900);
  648 |       const later = await audio(page);
  649 |       expect(later.storyPlayed).toBe(quiet.storyPlayed);
  650 |       expect(later.storyOwnedSources).toBe(0);
  651 |       await page.keyboard.press('Escape');
  652 |       await activate(page, 'story-settings', true);
  653 |       if (!muted) await activate(page, 'settings-sound', true);
  654 |       await expect.poll(async () => (await audio(page)).muted).toBe(true);
  655 |       await activate(page, 'settings-back', true);
  656 |       for (let i = 0; i < 4; i++) await activate(page, 'story-replay', true);
  657 |       await settled(page);
  658 |       const silent = await audio(page);
  659 |       await activate(page, 'story-settings', true);
  660 |       await activate(page, 'settings-sound', true);
  661 |       await expect.poll(async () => (await audio(page)).running).toBe(true);
  662 |       await activate(page, 'settings-back', true);
  663 |       await page.waitForTimeout(400);
  664 |       const recovered = await audio(page);
  665 |       expect(recovered.storyPlayed).toBe(silent.storyPlayed);
  666 |       expect(recovered).toMatchObject({ contextCount: 1, schedulerCount: 1 });
  667 |       expect(recovered.sourceCount).toBeLessThanOrEqual(32);
  668 |       expect(recovered.peakStorySources).toBeLessThanOrEqual(2);
  669 |       expect(await checkpoint(page)).toBe(pending);
  670 |       await activate(page, 'story-skip', true);
  671 |       await activate(page, 'story-continue', true);
  672 |       await holdingStart(page);
  673 |       records.push({ muted, before, quiet, later, silent, recovered, handoff: await audio(page) });
  674 |     } finally {
  675 |       await context.close();
  676 |       save('audio-lifecycle', records);
  677 |     }
  678 |   }
  679 | });
  680 | 
  681 | test('production controlled pending resume cannot revive a skipped story cue after mute', async ({
  682 |   browser,
  683 |   baseURL,
  684 | }) => {
  685 |   const context = await browser.newContext({
  686 |     baseURL,
  687 |     viewport: { width: 844, height: 390 },
  688 |     hasTouch: true,
  689 |     isMobile: true,
  690 |   });
  691 |   await context.addInitScript(() => {
  692 |     const Native = window.AudioContext;
  693 |     const nativeState = Object.getOwnPropertyDescriptor(BaseAudioContext.prototype, 'state')!.get!;
  694 |     let context: AudioContext,
  695 |       resolveOld: () => void,
  696 |       blocked = true,
  697 |       requests = 0;
  698 |     const Controlled = function () {
  699 |       context = new Native();
  700 |       const resume = context.resume.bind(context);
  701 |       Object.defineProperty(context, 'state', {
  702 |         configurable: true,
  703 |         get: () => (blocked ? 'suspended' : nativeState.call(context)),
  704 |       });
  705 |       context.resume = () => {
  706 |         requests++;
  707 |         return requests === 1
  708 |           ? new Promise<void>((done) => (resolveOld = done))
  709 |           : ((blocked = false), resume());
  710 |       };
  711 |       (window as any).__storyResumeGate = {
  712 |         status: () => ({ blocked, requests, nativeState: nativeState.call(context) }),
  713 |         resolve: async () => {
  714 |           blocked = false;
  715 |           await resume();
  716 |           resolveOld();
  717 |         },
  718 |       };
  719 |       return context;
  720 |     };
  721 |     Controlled.prototype = Native.prototype;
  722 |     Object.setPrototypeOf(Controlled, Native);
  723 |     Object.defineProperty(window, 'AudioContext', { configurable: true, value: Controlled });
  724 |   });
  725 |   const page = await context.newPage();
  726 |   try {
  727 |     await page.goto('/');
  728 |     await expect
  729 |       .poll(() =>
  730 |         passive(
  731 |           page,
  732 |           () => !!document.getElementById('journey-new')?.getBoundingClientRect().width,
  733 |         ),
  734 |       )
  735 |       .toBe(true);
  736 |     await coldTouch(page, 'journey-new');
  737 |     await expect
  738 |       .poll(async () => (await audio(page)).storySkipped, { timeout: 8000 })
> 739 |       .toBeGreaterThan(0);
      |        ^ Error: expect(received).toBeGreaterThan(expected)
  740 |     const pending = await audio(page);
  741 |     expect(pending.storyPlayed).toBe(0);
  742 |     await activate(page, 'story-settings', true);
  743 |     if (await page.locator('#settings-mute').isVisible())
  744 |       await activate(page, 'settings-mute', true);
  745 |     else if (!(await audio(page)).muted) await activate(page, 'settings-sound', true);
  746 |     await expect.poll(async () => (await audio(page)).muted).toBe(true);
  747 |     await passive(page, async () => (window as any).__storyResumeGate.resolve());
  748 |     await page.waitForTimeout(250);
  749 |     const late = await audio(page);
  750 |     expect(late.storyPlayed).toBe(0);
  751 |     expect(late.storyOwnedSources).toBe(0);
  752 |     expect(late.muted).toBe(true);
  753 |     await activate(page, 'settings-back', true);
  754 |     await activate(page, 'story-skip', true);
  755 |     expect(await timeline(page)).toMatchObject({ shotIndex: 2, settled: true });
  756 |     save('pending-audio', {
  757 |       method:
  758 |         'Controlled first resume promise/state gate around a real native AudioContext; not a new browser-policy or physical Android reproduction.',
  759 |       pending,
  760 |       late,
  761 |       gate: await passive(page, () => (window as any).__storyResumeGate.status()),
  762 |     });
  763 |   } finally {
  764 |     await context.close();
  765 |   }
  766 | });
  767 | 
  768 | test('production native fullscreen dialog ownership and built root entry', async ({
  769 |   browser,
  770 |   baseURL,
  771 | }) => {
  772 |   const context = await browser.newContext({
  773 |     baseURL,
  774 |     viewport: { width: 390, height: 844 },
  775 |     hasTouch: true,
  776 |     isMobile: true,
  777 |   });
  778 |   const page = await context.newPage();
  779 |   try {
  780 |     await title(page);
  781 |     await activate(page, 'journey-new', true);
  782 |     const pending = await checkpoint(page);
  783 |     await tabTo(page, 'story-settings');
  784 |     await page.keyboard.press('Enter');
  785 |     await tabTo(page, 'fullscreen');
  786 |     await page.keyboard.press('Enter');
  787 |     await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
  788 |     await activate(page, 'settings-back');
  789 |     await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  790 |     await expect(page.locator('#story-settings')).toBeFocused();
  791 |     expect((await timeline(page)).shotIndex).toBe(0);
  792 |     await activate(page, 'story-read');
  793 |     await page.keyboard.press('Escape');
  794 |     await expect(page.locator('#story-read')).toBeFocused();
  795 |     await activate(page, 'story-settings');
  796 |     await activate(page, 'fullscreen');
  797 |     await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  798 |     await activate(page, 'settings-back');
  799 |     await page.setViewportSize({ width: 780, height: 320 });
  800 |     await snapshot(page, '780x320-rotation-held');
  801 |     expect(await checkpoint(page)).toBe(pending);
  802 |     save('fullscreen', await inspect(page));
  803 |   } finally {
  804 |     await context.close();
  805 |   }
  806 |   const production = await browser.newContext({
  807 |     viewport: { width: 320, height: 740 },
  808 |     hasTouch: true,
  809 |     isMobile: true,
  810 |   });
  811 |   const built = await production.newPage(),
  812 |     errors: string[] = [];
  813 |   built.on('pageerror', (error) => errors.push(error.message));
  814 |   try {
  815 |     await built.goto(`${productionURL}/`);
  816 |     await expect(built.locator('#journey-new')).toBeVisible();
  817 |     expect(await built.evaluate(() => '__LAST_FERRY__' in window)).toBe(false);
  818 |     await activate(built, 'journey-new', true);
  819 |     await activate(built, 'story-skip', true);
  820 |     await expect(built.locator('#story-continue')).toHaveText(/Take the helm/);
  821 |     await fullyVisible(built, built.locator('#story-continue'));
  822 |     await activate(built, 'story-continue', true);
  823 |     await idle(built);
  824 |     await act(built, 'unload', true);
  825 |     await expect(built.locator('#readout')).toContainText('01 actions');
  826 |     expect(errors).toEqual([]);
  827 |     save('production', {
  828 |       url: built.url(),
  829 |       errors,
  830 |       scripts: await built
  831 |         .locator('script[src]')
  832 |         .evaluateAll((nodes) => nodes.map((n) => (n as HTMLScriptElement).src)),
  833 |     });
  834 |   } finally {
  835 |     await production.close();
  836 |   }
  837 | });
  838 | 
```