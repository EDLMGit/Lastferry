# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cove-ui-assets.spec.ts >> cove assets nested activation 390x844: icon and label keep single native ownership and dynamic identity
- Location: tests\e2e\cove-ui-assets.spec.ts:36:3

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  locator('#unload')
Expected: focused
Received: inactive
Timeout:  10000ms

Call log:
  - Expect "toBeFocused" locator('#unload') with timeout 10000ms
  - waiting for locator('#unload')
    23 × locator resolved to <button id="unload" class="cove-button" aria-haspopup="dialog" aria-label="Let Moss ashore; choose passengers">…</button>
       - unexpected value "inactive"

```

```yaml
- main:
  - region "The Holding Pier":
    - heading "The Holding Pier" [level=1]
    - paragraph: Bring all three passengers to Harbor
    - strong: Depth 2 · 2/4 spaces
    - text: 00 actions · Tide 0 · Home 0/3
    - navigation "Crossing controls":
      - button "Undo" [disabled]
      - button "Wait · 1 action"
      - button "Menu"
      - button "Enable sound" [pressed]
    - navigation "Map stops":
      - button "Select Harbor; adjacent passage available; Home, delivery destination": Harbor · Home
      - button "Select Stone Pier; current location": Stone Pier
      - button "Select Shallows; adjacent, too shallow": Shallows
      - button "Select Rabbit Pier; no direct passage": Rabbit Pier
    - button "Open tide and pier forecast":
      - strong: Rabbit Pier floods in 4 actions.
    - navigation "Cove view":
      - button "Whole cove"
      - button "Back to boat"
  - status: Undid action. 0 actions completed.
```

# Test source

```ts
  9   |   const box = await child.boundingBox();
  10  |   expect(box).not.toBeNull();
  11  |   await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);
  12  | }
  13  | 
  14  | async function validGlyphs(page: Page) {
  15  |   const glyphs = await page.locator('button .cove-glyph').evaluateAll((nodes) =>
  16  |     nodes.map((node) => ({
  17  |       id: node.closest('button')!.id,
  18  |       icon: node.getAttribute('data-icon'),
  19  |       hidden: node.getAttribute('aria-hidden'),
  20  |       focusable: node.getAttribute('focusable'),
  21  |       pointers: getComputedStyle(node).pointerEvents,
  22  |       width: node.getBoundingClientRect().width,
  23  |     })),
  24  |   );
  25  |   expect(glyphs.length).toBeGreaterThan(4);
  26  |   for (const glyph of glyphs) {
  27  |     expect(glyph.hidden).toBe('true');
  28  |     expect(glyph.focusable).toBe('false');
  29  |     expect(glyph.pointers).toBe('none');
  30  |   }
  31  |   expect(await page.locator('.map-target :is(button, a, [tabindex])').count()).toBe(0);
  32  |   return glyphs;
  33  | }
  34  | 
  35  | for (const [width, height] of [[844, 390], [390, 844]])
  36  |   test(`cove assets nested activation ${width}x${height}: icon and label keep single native ownership and dynamic identity`, async ({ browser, baseURL }) => {
  37  |     const context = await browser.newContext({ baseURL, viewport: { width, height }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  38  |     await context.addInitScript(() => localStorage.setItem('last-ferry-muted', 'true'));
  39  |     const page = await context.newPage();
  40  |     const errors: string[] = [];
  41  |     page.on('pageerror', (error) => errors.push(error.message));
  42  |     const observations: Record<string, unknown> = {};
  43  |     try {
  44  |       await ready(page, 'holding-pier');
  45  |       await page.evaluate(() => {
  46  |         (window as any).__coveControlNodes = ['sound-toggle', 'view-toggle'].map((id) => document.getElementById(id));
  47  |         (window as any).__coveClicks = [];
  48  |         (window as any).__coveFocus = [];
  49  |         document.addEventListener('click', (event) => {
  50  |           const button = (event.target as Element)?.closest('button');
  51  |           if (button) (window as any).__coveClicks.push({ id: button.id, trusted: event.isTrusted });
  52  |         }, true);
  53  |         document.addEventListener('focusin', () => {
  54  |           const api = (window as any).__LAST_FERRY__;
  55  |           const dock = document.getElementById('dock-actions')!;
  56  |           const trace = (window as any).__coveFocus;
  57  |           trace.push({ at: performance.now(), focus: document.activeElement?.id, view: api.getViewStatus(), dockHidden: dock.hidden, dockVisibility: getComputedStyle(dock).visibility });
  58  |           if (trace.length > 80) trace.shift();
  59  |         });
  60  |       });
  61  |       observations.initialGlyphs = await validGlyphs(page);
  62  |       expect(await state(page)).toMatchObject({ turn: 0 });
  63  |       await fullyVisible(page, page.locator('#unload'));
  64  |       await expect(page.locator('#unload')).toContainText('Let ashore');
  65  |       await expect(page.locator('#unload .cove-glyph')).toHaveAttribute('data-icon', 'unload');
  66  |       await tapChild(page, '#unload .cove-glyph');
  67  |       await expect(page.locator('#dialog')).toBeVisible();
  68  |       expect((await state(page)).turn).toBe(0);
  69  |       await tapChild(page, '#cancel .cove-glyph');
  70  |       await expect(page.locator('#dialog')).toBeHidden();
  71  |       await expect(page.locator('#unload')).toBeFocused();
  72  |       await page.waitForTimeout(200);
  73  |       await tapChild(page, '#unload .cove-label');
  74  |       await expect(page.locator('#dialog')).toBeVisible();
  75  |       await tapChild(page, '#commit .cove-glyph');
  76  |       await idle(page);
  77  |       expect(await state(page)).toMatchObject({ turn: 1, aboard: [], waitingByPier: { 'stone-pier': ['sheep-1'] } });
  78  |       expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getRenderStatus().historyLength)).toBe(1);
  79  |       await tapChild(page, '#undo .cove-label');
  80  |       await idle(page);
  81  |       expect((await state(page)).turn).toBe(0);
  82  |       expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus().muted)).toBe(true);
  83  |       await tapChild(page, '#sound-toggle .cove-glyph');
  84  |       await expect.poll(() => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus().running)).toBe(true);
  85  |       await expect(page.locator('#sound-toggle')).toHaveAccessibleName('Mute sound');
  86  |       await expect(page.locator('#sound-toggle .cove-glyph')).toHaveAttribute('data-icon', 'sound-on');
  87  |       await tapChild(page, '#sound-toggle .cove-glyph');
  88  |       await expect(page.locator('#sound-toggle')).toHaveAccessibleName('Enable sound');
  89  |       await expect(page.locator('#sound-toggle .cove-glyph')).toHaveAttribute('data-icon', 'sound-off');
  90  |       await tapChild(page, '#view-toggle .cove-glyph');
  91  |       await expect(page.locator('#view-toggle .cove-label')).toHaveText('Play view');
  92  |       await expect(page.locator('#view-toggle')).toHaveAttribute('aria-pressed', 'true');
  93  |       await expect(page.locator('#back-to-boat .cove-glyph')).toHaveAttribute('data-icon', 'back-to-boat');
  94  |       await expect(page.locator('#map-harbor .cove-glyph')).toHaveAttribute('data-icon', 'harbor-home');
  95  |       await tapChild(page, '#back-to-boat .cove-label');
  96  |       await expect(page.locator('#view-toggle .cove-label')).toHaveText('Whole cove');
  97  |       expect(await page.evaluate(() => (window as any).__coveControlNodes.every((node: HTMLElement) => document.getElementById(node.id) === node))).toBe(true);
  98  |       await tabTo(page, 'unload');
  99  |       await page.keyboard.press('Space');
  100 |       await expect(page.locator('#cancel')).toBeFocused();
  101 |       await tabTo(page, 'passenger-sheep-1');
  102 |       await page.keyboard.press('Space');
  103 |       await expect(page.locator('#passenger-sheep-1')).toHaveAttribute('aria-pressed', 'false');
  104 |       await expect(page.locator('#commit')).toBeDisabled();
  105 |       await page.keyboard.press('Space');
  106 |       await expect(page.locator('#passenger-sheep-1')).toHaveAttribute('aria-pressed', 'true');
  107 |       await tabTo(page, 'cancel', true);
  108 |       await page.keyboard.press('Escape');
> 109 |       await expect(page.locator('#unload')).toBeFocused();
      |                                             ^ Error: expect(locator).toBeFocused() failed
  110 |       await page.keyboard.press('Enter');
  111 |       await tabTo(page, 'commit');
  112 |       await page.keyboard.press('Enter');
  113 |       await idle(page);
  114 |       expect((await state(page)).turn).toBe(1);
  115 |       await tabTo(page, 'undo', true);
  116 |       await page.keyboard.press('Enter');
  117 |       await idle(page);
  118 |       expect((await state(page)).turn).toBe(0);
  119 |       observations.clicks = await page.evaluate(() => (window as any).__coveClicks);
  120 |       const clicks = observations.clicks as { id: string; trusted: boolean }[];
  121 |       expect(clicks.every((click) => click.trusted)).toBe(true);
  122 |       expect(clicks.filter((click) => click.id === 'commit')).toHaveLength(2);
  123 |       observations.finalGlyphs = await validGlyphs(page);
  124 |       observations.final = await state(page);
  125 |       expect(errors).toEqual([]);
  126 |       mkdirSync(reviewDir, { recursive: true });
  127 |       writeFileSync(`${reviewDir}/nested-${width}x${height}-${test.info().repeatEachIndex}.json`, JSON.stringify({ observations, errors }, null, 2));
  128 |     } finally {
  129 |       observations.focusTrace = await page.evaluate(() => (window as any).__coveFocus).catch(() => null);
  130 |       observations.exit = await page.evaluate(() => ({ focus: document.activeElement?.id, view: (window as any).__LAST_FERRY__?.getViewStatus(), dock: { hidden: document.getElementById('dock-actions')?.hidden, visibility: getComputedStyle(document.getElementById('dock-actions')!).visibility } })).catch(() => null);
  131 |       mkdirSync(reviewDir, { recursive: true });
  132 |       writeFileSync(`${reviewDir}/nested-${width}x${height}-${test.info().repeatEachIndex}.json`, JSON.stringify({ observations, errors }, null, 2));
  133 |       await context.close();
  134 |     }
  135 |   });
  136 | 
```