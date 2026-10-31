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
    18 × locator resolved to <button id="unload" class="cove-button" aria-haspopup="dialog" aria-label="Let Moss ashore; choose passengers">…</button>
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
  1   | import { expect, test, type Page } from '@playwright/test';
  2   | import { mkdirSync, writeFileSync } from 'node:fs';
  3   | import { reviewDir } from './evidence';
  4   | import { activate, fullyVisible, idle, ready, state, tabTo } from './ui';
  5   | 
  6   | async function tapChild(page: Page, selector: string) {
  7   |   const child = page.locator(selector);
  8   |   await expect(child).toBeVisible();
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
  48  |         document.addEventListener('click', (event) => {
  49  |           const button = (event.target as Element)?.closest('button');
  50  |           if (button) (window as any).__coveClicks.push({ id: button.id, trusted: event.isTrusted });
  51  |         }, true);
  52  |       });
  53  |       observations.initialGlyphs = await validGlyphs(page);
  54  |       expect(await state(page)).toMatchObject({ turn: 0 });
  55  |       await fullyVisible(page, page.locator('#unload'));
  56  |       await expect(page.locator('#unload')).toContainText('Let ashore');
  57  |       await expect(page.locator('#unload .cove-glyph')).toHaveAttribute('data-icon', 'unload');
  58  |       await tapChild(page, '#unload .cove-glyph');
  59  |       await expect(page.locator('#dialog')).toBeVisible();
  60  |       expect((await state(page)).turn).toBe(0);
  61  |       await tapChild(page, '#cancel .cove-glyph');
  62  |       await expect(page.locator('#dialog')).toBeHidden();
  63  |       await expect(page.locator('#unload')).toBeFocused();
  64  |       await page.waitForTimeout(200);
  65  |       await tapChild(page, '#unload .cove-label');
  66  |       await expect(page.locator('#dialog')).toBeVisible();
  67  |       await tapChild(page, '#commit .cove-glyph');
  68  |       await idle(page);
  69  |       expect(await state(page)).toMatchObject({ turn: 1, aboard: [], waitingByPier: { 'stone-pier': ['sheep-1'] } });
  70  |       expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getRenderStatus().historyLength)).toBe(1);
  71  |       await tapChild(page, '#undo .cove-label');
  72  |       await idle(page);
  73  |       expect((await state(page)).turn).toBe(0);
  74  |       expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus().muted)).toBe(true);
  75  |       await tapChild(page, '#sound-toggle .cove-glyph');
  76  |       await expect.poll(() => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus().running)).toBe(true);
  77  |       await expect(page.locator('#sound-toggle')).toHaveAccessibleName('Mute sound');
  78  |       await expect(page.locator('#sound-toggle .cove-glyph')).toHaveAttribute('data-icon', 'sound-on');
  79  |       await tapChild(page, '#sound-toggle .cove-glyph');
  80  |       await expect(page.locator('#sound-toggle')).toHaveAccessibleName('Enable sound');
  81  |       await expect(page.locator('#sound-toggle .cove-glyph')).toHaveAttribute('data-icon', 'sound-off');
  82  |       await tapChild(page, '#view-toggle .cove-glyph');
  83  |       await expect(page.locator('#view-toggle .cove-label')).toHaveText('Play view');
  84  |       await expect(page.locator('#view-toggle')).toHaveAttribute('aria-pressed', 'true');
  85  |       await expect(page.locator('#back-to-boat .cove-glyph')).toHaveAttribute('data-icon', 'back-to-boat');
  86  |       await expect(page.locator('#map-harbor .cove-glyph')).toHaveAttribute('data-icon', 'harbor-home');
  87  |       await tapChild(page, '#back-to-boat .cove-label');
  88  |       await expect(page.locator('#view-toggle .cove-label')).toHaveText('Whole cove');
  89  |       expect(await page.evaluate(() => (window as any).__coveControlNodes.every((node: HTMLElement) => document.getElementById(node.id) === node))).toBe(true);
  90  |       await tabTo(page, 'unload');
  91  |       await page.keyboard.press('Space');
  92  |       await expect(page.locator('#cancel')).toBeFocused();
  93  |       await tabTo(page, 'passenger-sheep-1');
  94  |       await page.keyboard.press('Space');
  95  |       await expect(page.locator('#passenger-sheep-1')).toHaveAttribute('aria-pressed', 'false');
  96  |       await expect(page.locator('#commit')).toBeDisabled();
  97  |       await page.keyboard.press('Space');
  98  |       await expect(page.locator('#passenger-sheep-1')).toHaveAttribute('aria-pressed', 'true');
  99  |       await tabTo(page, 'cancel', true);
  100 |       await page.keyboard.press('Escape');
> 101 |       await expect(page.locator('#unload')).toBeFocused();
      |                                             ^ Error: expect(locator).toBeFocused() failed
  102 |       await page.keyboard.press('Enter');
  103 |       await tabTo(page, 'commit');
  104 |       await page.keyboard.press('Enter');
  105 |       await idle(page);
  106 |       expect((await state(page)).turn).toBe(1);
  107 |       await tabTo(page, 'undo', true);
  108 |       await page.keyboard.press('Enter');
  109 |       await idle(page);
  110 |       expect((await state(page)).turn).toBe(0);
  111 |       observations.clicks = await page.evaluate(() => (window as any).__coveClicks);
  112 |       const clicks = observations.clicks as { id: string; trusted: boolean }[];
  113 |       expect(clicks.every((click) => click.trusted)).toBe(true);
  114 |       expect(clicks.filter((click) => click.id === 'commit')).toHaveLength(2);
  115 |       observations.finalGlyphs = await validGlyphs(page);
  116 |       observations.final = await state(page);
  117 |       expect(errors).toEqual([]);
  118 |       mkdirSync(reviewDir, { recursive: true });
  119 |       writeFileSync(`${reviewDir}/nested-${width}x${height}.json`, JSON.stringify({ observations, errors }, null, 2));
  120 |     } finally {
  121 |       await context.close();
  122 |     }
  123 |   });
  124 | 
```