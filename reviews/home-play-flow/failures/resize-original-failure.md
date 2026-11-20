# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home-play-flow.spec.ts >> portrait real chooser loss/cancel and rescue with natural keyboard focus and full phone labels
- Location: tests\e2e\home-play-flow.spec.ts:780:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 7

- Array []
+ Array [
+   "Everyone will be safely home at Harbor.: viewport",
+   "Everyone will be safely home at Harbor.: vertical ",
+   "Bring Pip, Rue and Moss home · 1 action: viewport",
+   "Bring Pip, Rue and Moss home · 1 action: horizontal ",
+   "Bring Pip, Rue and Moss home · 1 action: vertical ",
+ ]
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - main [ref=e3]:
    - region "The Holding Pier" [ref=e4]:
      - generic "The Holding Pier. Use the labeled waypoint controls to navigate." [ref=e6]
      - generic [ref=e7]:
        - generic [ref=e8]:
          - heading "The Holding Pier" [level=1] [ref=e9]
          - paragraph [ref=e10]: Bring all three passengers to Harbor
        - generic "Crossing progress" [ref=e11]:
          - strong [ref=e12]: Depth 3 · 4/4 spaces
          - generic [ref=e13]: 08 actions · Tide 2 · Home 0/3
        - navigation "Crossing controls" [ref=e14]:
          - button "Undo" [ref=e15] [cursor=pointer]
          - button "Wait · 1 action" [ref=e16] [cursor=pointer]
          - button "Menu" [ref=e17] [cursor=pointer]
          - button "Mute sound" [ref=e18] [cursor=pointer]
      - navigation "Map stops":
        - generic:
          - button "Select Harbor; current location; Home, delivery destination":
            - generic [aria-hidden] [ref=e20] [cursor=pointer]: •
            - generic [ref=e21] [cursor=pointer]: Harbor · Home
        - generic:
          - button "Select Stone Pier; adjacent passage available":
            - generic [ref=e23] [cursor=pointer]
            - generic [ref=e25] [cursor=pointer]: Stone Pier
        - generic:
          - button "Select Shallows; no direct passage":
            - generic [aria-hidden] [ref=e28] [cursor=pointer]: ◇
            - generic [ref=e29] [cursor=pointer]: Shallows
        - generic:
          - button "Select Rabbit Pier; no direct passage":
            - generic [aria-hidden] [ref=e32] [cursor=pointer]: ◇
            - generic [ref=e33] [cursor=pointer]: Rabbit Pier
      - button "Open tide and pier forecast" [ref=e35] [cursor=pointer]:
        - generic [aria-hidden] [ref=e36]: ≈
        - strong [ref=e38]: Pip, Rue and Moss are safe aboard.
      - navigation "Cove view" [ref=e39]:
        - button "Play view" [pressed] [ref=e40] [cursor=pointer]
        - button "Back to boat" [ref=e41] [cursor=pointer]
    - status [ref=e42]: 8 actions completed. Pip, Rue and Moss are safe aboard.
  - dialog [ref=e43]:
    - generic [ref=e44]:
      - banner [ref=e45]:
        - generic [ref=e46]:
          - paragraph [ref=e47]: Harbor · inspection is free
          - heading "Bring passengers home" [level=2] [ref=e48]
        - button "Close dialog" [active] [ref=e49] [cursor=pointer]
      - generic [ref=e50]:
        - group "Passenger selection" [ref=e51]:
          - button "Pip 1 space" [pressed] [ref=e52] [cursor=pointer]:
            - generic:
              - generic: Pip
              - generic: 1 space
          - button "Rue 1 space" [pressed] [ref=e53] [cursor=pointer]:
            - generic:
              - generic: Rue
              - generic: 1 space
          - button "Moss 2 spaces" [pressed] [ref=e54] [cursor=pointer]:
            - generic:
              - generic: Moss
              - generic: 2 spaces
        - paragraph [ref=e55]: Needs depth 3 → 1
        - paragraph [ref=e56]: Everyone will be safely home at Harbor.
      - contentinfo [ref=e57]:
        - button "Bring Pip, Rue and Moss home · 1 action" [ref=e58] [cursor=pointer]
```

# Test source

```ts
  677 |   });
  678 |   await activate(page, 'story-continue');
  679 |   await activate(page, 'story-continue');
  680 |   expect((await timeline(page)).shot).toBe('ferry');
  681 |   await activate(page, 'story-continue');
  682 |   await page.locator('#unload').dblclick();
  683 |   await idle(page);
  684 |   expect((await state(page)).turn).toBe(1);
  685 |   await expect(page.locator('#transfer-receipt')).toHaveCSS('animation-name', 'none');
  686 |   await undo(page);
  687 |   expect((await state(page)).turn).toBe(0);
  688 |   await page.waitForTimeout(550);
  689 |   for (const id of [
  690 |     'unload',
  691 |     'map-shallows',
  692 |     'map-rabbit-pier',
  693 |     'board',
  694 |     'map-shallows',
  695 |     'map-stone',
  696 |     'board',
  697 |     'map-harbor',
  698 |   ])
  699 |     await act(page, id);
  700 |   await activate(page, 'unload');
  701 |   await activate(page, 'passenger-rabbit-2');
  702 |   await activate(page, 'passenger-sheep-1');
  703 |   await activate(page, 'commit');
  704 |   await idle(page);
  705 |   await expect(page.locator('#transfer-receipt')).toContainText('Pip home');
  706 |   await expect(page.locator('#transfer-receipt')).not.toContainText('Needs depth');
  707 |   await undo(page);
  708 |   await page.waitForTimeout(550);
  709 |   await activate(page, 'unload');
  710 |   const anchor = await page.locator('#commit').boundingBox();
  711 |   await activate(page, 'passenger-rabbit-1');
  712 |   const after = await page.locator('#commit').boundingBox();
  713 |   expect(Math.abs(after!.y + after!.height - anchor!.y - anchor!.height)).toBeLessThanOrEqual(1);
  714 |   await expect(page.locator('#commit')).toContainText('Rue and Moss');
  715 |   await activate(page, 'commit');
  716 |   await idle(page);
  717 |   expect((await state(page)).aboard).toEqual(['rabbit-1']);
  718 |   await expect(page.locator('#unload')).toContainText('Bring Pip home');
  719 |   expect(await page.locator('#unload').getAttribute('aria-haspopup')).toBeNull();
  720 |   await act(page, 'unload');
  721 |   expect((await state(page)).status).toBe('won');
  722 |   await undo(page);
  723 |   expect((await state(page)).aboard).toEqual(['rabbit-1']);
  724 |   await undo(page);
  725 |   await activate(page, 'unload');
  726 |   await activate(page, 'passenger-sheep-1');
  727 |   await activate(page, 'commit');
  728 |   await idle(page);
  729 |   await activate(page, 'unload');
  730 |   await idle(page);
  731 |   expect((await state(page)).status).toBe('won');
  732 |   save('reduced-fullscreen-subsets', { entered, final: await inspect(page) });
  733 |   await context.close();
  734 |   const built = await browser.newContext({ viewport: { width: 320, height: 740 } });
  735 |   const production = await built.newPage();
  736 |   await production.goto(productionURL + '/');
  737 |   await expect(production.locator('#home-play')).toBeVisible();
  738 |   await activate(production, 'home-play');
  739 |   await more(production, 'story-skip');
  740 |   await activate(production, 'story-continue');
  741 |   await activate(production, 'unload');
  742 |   await idle(production);
  743 |   await expect(production.locator('[data-testid=turn]')).toHaveText('01');
  744 |   save('production-root', { url: production.url(), title: await production.title() });
  745 |   await built.close();
  746 | });
  747 | async function previewFit(page: Page, name: string) {
  748 |   const failures = await page.evaluate(() => {
  749 |     const failures: string[] = [];
  750 |     for (const e of document.querySelectorAll<HTMLElement>(
  751 |       '#preview .cove-choice-name, #preview .cove-choice-capacity, #preview .requirement, #preview .consequence, #commit .cove-label',
  752 |     )) {
  753 |       const range = document.createRange();
  754 |       range.selectNodeContents(e);
  755 |       for (const r of range.getClientRects()) {
  756 |         if (r.left < 0 || r.top < 0 || r.right > innerWidth + 0.5 || r.bottom > innerHeight + 0.5)
  757 |           failures.push(`${e.textContent}: viewport`);
  758 |         for (let p: HTMLElement | null = e; p; p = p.parentElement) {
  759 |           const b = p.getBoundingClientRect(),
  760 |             s = getComputedStyle(p);
  761 |           if (
  762 |             /auto|scroll|clip|hidden/.test(s.overflowX) &&
  763 |             (r.left < b.left - 0.5 || r.right > b.right + 0.5)
  764 |           )
  765 |             failures.push(`${e.textContent}: horizontal ${p.id}`);
  766 |           if (
  767 |             /auto|scroll|clip|hidden/.test(s.overflowY) &&
  768 |             (r.top < b.top - 0.5 || r.bottom > b.bottom + 0.5)
  769 |           )
  770 |             failures.push(`${e.textContent}: vertical ${p.id}`);
  771 |         }
  772 |       }
  773 |     }
  774 |     return failures;
  775 |   });
  776 |   save(name, { failures, viewport: page.viewportSize() });
> 777 |   expect(failures).toEqual([]);
      |                    ^ Error: expect(received).toEqual(expected) // deep equality
  778 | }
  779 | 
  780 | test('portrait real chooser loss/cancel and rescue with natural keyboard focus and full phone labels', async ({
  781 |   browser,
  782 |   baseURL,
  783 | }) => {
  784 |   const context = await browser.newContext({
  785 |     baseURL,
  786 |     viewport: { width: 390, height: 844 },
  787 |     hasTouch: true,
  788 |     reducedMotion: 'reduce',
  789 |   });
  790 |   const page = await context.newPage();
  791 |   await root(page);
  792 |   await tabTo(page, 'home-play');
  793 |   await page.keyboard.press('Enter');
  794 |   for (let i = 0; i < 3; i++) {
  795 |     await tabTo(page, 'story-continue');
  796 |     await page.keyboard.press('Enter');
  797 |   }
  798 |   await tabTo(page, 'unload');
  799 |   await page.keyboard.press('Space');
  800 |   await idle(page);
  801 |   expect((await state(page)).turn).toBe(1);
  802 |   const focus = await page.evaluate(() => ({
  803 |     id: document.activeElement?.id,
  804 |     visible: !!document.activeElement?.getClientRects().length,
  805 |   }));
  806 |   expect(focus.visible).toBe(true);
  807 |   expect(focus.id).not.toBe('unload');
  808 |   await tabTo(page, 'undo');
  809 |   await page.keyboard.press('Enter');
  810 |   await idle(page);
  811 |   await act(page, 'unload', true);
  812 |   await act(page, 'map-shallows', true);
  813 |   await act(page, 'map-rabbit-pier', true);
  814 |   const before = await state(page);
  815 |   await activate(page, 'board', true);
  816 |   await activate(page, 'passenger-rabbit-2', true);
  817 |   await expect(page.locator('#preview')).toHaveClass(/warning/);
  818 |   await page.keyboard.press('Escape');
  819 |   expect(await state(page)).toEqual(before);
  820 |   await activate(page, 'board', true);
  821 |   await activate(page, 'passenger-rabbit-2', true);
  822 |   await activate(page, 'commit', true);
  823 |   await idle(page);
  824 |   expect((await state(page)).status).toBe('lost');
  825 |   await tabTo(page, 'terminal-undo');
  826 |   await page.keyboard.press('Enter');
  827 |   expect(await state(page)).toEqual(before);
  828 |   await activate(page, 'board', true);
  829 |   await previewFit(page, '390x844-rabbit-fit');
  830 |   await snap(page, '390x844-rabbit-chooser');
  831 |   await tabTo(page, 'commit');
  832 |   await page.keyboard.press('Space');
  833 |   await idle(page);
  834 |   expect((await state(page)).tideLevel).toBe(1);
  835 |   for (const id of ['map-shallows', 'map-stone', 'board', 'map-harbor']) await act(page, id, true);
  836 |   await activate(page, 'unload', true);
  837 |   for (const [width, height] of [
  838 |     [390, 844],
  839 |     [320, 740],
  840 |     [844, 390],
  841 |     [780, 320],
  842 |   ]) {
  843 |     await page.setViewportSize({ width, height });
  844 |     await previewFit(page, `${width}x${height}-final-label-fit`);
  845 |     await snap(page, `${width}x${height}-final-chooser`);
  846 |   }
  847 |   await page.setViewportSize({ width: 390, height: 844 });
  848 |   await tabTo(page, 'commit');
  849 |   await page.keyboard.press('Enter');
  850 |   await idle(page);
  851 |   expect((await state(page)).status).toBe('won');
  852 |   await snap(page, '390x844-arrival');
  853 |   await tabTo(page, 'terminal-undo');
  854 |   await page.keyboard.press('Enter');
  855 |   await idle(page);
  856 |   expect((await state(page)).status).toBe('playing');
  857 |   await context.close();
  858 | });
  859 | 
```