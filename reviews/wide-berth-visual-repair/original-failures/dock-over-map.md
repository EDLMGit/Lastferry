# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: wide-visual-repair.spec.ts >> released visual matrix with actual full loads, compact shores and marker focus
- Location: tests\e2e\wide-visual-repair.spec.ts:39:1

# Error details

```
TimeoutError: locator.tap: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('#map-shell-landing')
    - locator resolved to <button data-risk="safe" class="map-target" aria-expanded="false" id="map-shell-landing" data-status="available" aria-controls="local-context" data-destination="shell-landing" title="adjacent passage available" aria-label="Select Shell Landing; adjacent passage available">…</button>
  - attempting tap action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button id="unload" class="cove-button" aria-haspopup="dialog">…</button> from <nav id="dock-actions" data-layout="row" aria-label="Passenger actions at High Quay">…</nav> subtree intercepts pointer events
    - retrying tap action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button id="unload" class="cove-button" aria-haspopup="dialog">…</button> from <nav id="dock-actions" data-layout="row" aria-label="Passenger actions at High Quay">…</nav> subtree intercepts pointer events
    - retrying tap action
      - waiting 100ms
    23 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button id="unload" class="cove-button" aria-haspopup="dialog">…</button> from <nav id="dock-actions" data-layout="row" aria-label="Passenger actions at High Quay">…</nav> subtree intercepts pointer events
     - retrying tap action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- main [ref=e3]:
  - region "Wide Berth" [ref=e4]:
    - generic "Wide Berth. Use the labeled waypoint controls to navigate." [ref=e6]
    - generic [ref=e7]:
      - generic [ref=e8]:
        - heading "Wide Berth" [level=1] [ref=e9]
        - paragraph [ref=e10]: Bring all six passengers to Harbor
      - generic "Crossing progress" [ref=e11]:
        - strong [ref=e12]: Depth 3 · 4/6 spaces
        - generic [ref=e13]: 05 actions · Tide 1 · Home 0/6
      - navigation "Crossing controls" [ref=e14]:
        - button "Undo" [ref=e15] [cursor=pointer]
        - button "Wait · 1 action" [ref=e16] [cursor=pointer]
        - button "Menu" [ref=e17] [cursor=pointer]
        - button "Mute sound" [ref=e18] [cursor=pointer]
    - navigation "Map stops":
      - generic:
        - button "Select Harbor; adjacent passage available; Home, delivery destination":
          - generic [ref=e19] [cursor=pointer]
          - generic [ref=e21] [cursor=pointer]: Harbor · Home
      - generic:
        - button "Select High Quay; current location":
          - generic [aria-hidden] [ref=e24] [cursor=pointer]: •
          - generic [ref=e25] [cursor=pointer]: High Quay
      - generic:
        - button "Select Wide Berth; adjacent passage available":
          - generic [ref=e27] [cursor=pointer]
          - generic [ref=e29] [cursor=pointer]: Wide Berth
      - generic:
        - button "Select Shell Landing; adjacent passage available":
          - generic [ref=e31] [cursor=pointer]
          - generic [ref=e33] [cursor=pointer]: Shell Landing
      - generic:
        - button "Select Outer Buoy; adjacent passage available":
          - generic [ref=e35] [cursor=pointer]
          - generic [ref=e37] [cursor=pointer]: Outer Buoy
    - navigation "Passenger actions at High Quay" [ref=e39]:
      - button "Board Alder" [ref=e40] [cursor=pointer]
      - button "Let ashore" [active] [ref=e41] [cursor=pointer]
    - paragraph: Select a place to see its options.
    - button "Open tide and pier forecast" [ref=e42] [cursor=pointer]:
      - generic [aria-hidden] [ref=e43]: "!"
      - strong [ref=e45]: Shell Landing floods in 5 actions.
    - navigation "Cove view" [ref=e46]:
      - button "Play view" [pressed] [ref=e47] [cursor=pointer]
      - button "Back to boat" [ref=e48] [cursor=pointer]
  - status [ref=e49]: Alder ashore · 1 action used. Needs depth 4 → 3. 5 actions completed. Shell Landing floods in 5 actions.
```

# Test source

```ts
  1   | import { expect, type Locator, type Page } from '@playwright/test';
  2   | 
  3   | export const state = (page: Page) => page.evaluate(() => (window as any).__LAST_FERRY__.getState());
  4   | export const rendered = (page: Page) =>
  5   |   page.evaluate(() => (window as any).__LAST_FERRY__.getRenderStatus());
  6   | export const navigation = (page: Page) =>
  7   |   page.evaluate(() => (window as any).__LAST_FERRY__.getNavigationStatus());
  8   | export const active = (page: Page) => page.evaluate(() => document.activeElement?.id);
  9   | export async function idle(page: Page) {
  10  |   await expect(page.locator('#seascape')).toHaveAttribute('aria-busy', 'false');
  11  | }
  12  | export async function ready(page: Page, cove = 'first-crossing') {
  13  |   await page.goto(`/?cove=${cove}`);
  14  |   await page.waitForFunction(() => ((window as any).__LAST_FERRY__?.getMetrics().frames ?? 0) > 4);
  15  |   await idle(page);
  16  | }
  17  | export async function activate(page: Page, id: string, touch = false) {
  18  |   if (id.startsWith('map-')) {
  19  |     const inFrame = await page.locator(`#${id}`).evaluate((element) => {
  20  |       const r = element.getBoundingClientRect();
  21  |       return (
  22  |         !element.closest('.offscreen') &&
  23  |         getComputedStyle(element).opacity !== '0' &&
  24  |         r.width > 0 &&
  25  |         r.height > 0 &&
  26  |         r.left >= 0 &&
  27  |         r.top >= 0 &&
  28  |         r.right <= innerWidth &&
  29  |         r.bottom <= innerHeight
  30  |       );
  31  |     });
  32  |     if (!inFrame) await wholeCove(page, touch);
  33  |   }
  34  |   if ((id === 'board' || id === 'unload') && !(await page.locator(`#${id}`).isVisible())) {
  35  |     const current = await page.locator('.map-target[aria-current="location"]').getAttribute('id');
  36  |     if (!current) throw Error('No current location selector is available');
  37  |     await activate(page, current, touch);
  38  |   }
> 39  |   if (touch) await page.locator(`#${id}`).tap();
      |                                           ^ TimeoutError: locator.tap: Timeout 15000ms exceeded.
  40  |   else await page.locator(`#${id}`).click();
  41  | }
  42  | export async function wholeCove(page: Page, touch = false) {
  43  |   const toggle = page.locator('#view-toggle');
  44  |   if ((await toggle.count()) && (await toggle.textContent())?.includes('Whole cove')) {
  45  |     if (touch) await toggle.tap();
  46  |     else await toggle.click();
  47  |     await page.evaluate(
  48  |       () =>
  49  |         new Promise<void>((resolve) =>
  50  |           requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  51  |         ),
  52  |     );
  53  |   }
  54  | }
  55  | export async function selectPlace(page: Page, id: string, touch = false) {
  56  |   await activate(page, id.startsWith('map-') ? id : `map-${id}`, touch);
  57  |   await expect(page.locator('#local-context')).toBeVisible();
  58  | }
  59  | export async function startMove(page: Page, id: string, touch = false) {
  60  |   await selectPlace(page, id, touch);
  61  |   await activate(page, 'sail', touch);
  62  | }
  63  | export async function act(page: Page, id: string, touch = false) {
  64  |   if (id.startsWith('map-')) await startMove(page, id, touch);
  65  |   else {
  66  |     await activate(page, id, touch);
  67  |     if (await page.locator('#dialog[open][data-mode=action]').count())
  68  |       await activate(page, 'commit', touch);
  69  |   }
  70  |   await idle(page);
  71  | }
  72  | export async function undo(page: Page, touch = false) {
  73  |   const terminal = await page.locator('#dialog[open] #terminal-undo').count();
  74  |   await activate(page, terminal ? 'terminal-undo' : 'undo', touch);
  75  |   await idle(page);
  76  | }
  77  | export async function closeDialog(page: Page, touch = false) {
  78  |   if (await page.locator('#dialog[open]').count()) await activate(page, 'cancel', touch);
  79  | }
  80  | export async function restart(page: Page, touch = false) {
  81  |   if (await page.locator('#dialog[open] #terminal-restart').count())
  82  |     await activate(page, 'terminal-restart', touch);
  83  |   else {
  84  |     await closeDialog(page, touch);
  85  |     await activate(page, 'menu', touch);
  86  |     await activate(page, 'restart', touch);
  87  |   }
  88  |   await idle(page);
  89  | }
  90  | export async function tabTo(page: Page, id: string, backwards = false) {
  91  |   for (let count = 0; count < 64; count++) {
  92  |     if ((await active(page)) === id) return;
  93  |     await page.keyboard.press(backwards ? 'Shift+Tab' : 'Tab');
  94  |   }
  95  |   throw Error(`Natural Tab navigation did not reach ${id}; active=${await active(page)}`);
  96  | }
  97  | export async function keyAct(page: Page, id: string) {
  98  |   if ((id === 'board' || id === 'unload') && !(await page.locator(`#${id}`).isVisible())) {
  99  |     const current = await page.locator('.map-target[aria-current="location"]').getAttribute('id');
  100 |     if (!current) throw Error('No current location selector is available');
  101 |     await tabTo(page, current);
  102 |     await page.keyboard.press('Enter');
  103 |     await expect(page.locator('#local-heading')).toBeFocused();
  104 |   }
  105 |   await tabTo(page, id);
  106 |   await page.keyboard.press('Enter');
  107 |   if (id.startsWith('map-')) {
  108 |     await expect(page.locator('#local-heading')).toBeFocused();
  109 |     await tabTo(page, 'sail');
  110 |     await page.keyboard.press('Enter');
  111 |   } else if (await page.locator('#dialog[open][data-mode=action]').count()) {
  112 |     await expect(page.locator('#cancel')).toBeFocused();
  113 |     await tabTo(page, 'commit');
  114 |     await page.keyboard.press('Enter');
  115 |   }
  116 |   await idle(page);
  117 | }
  118 | export async function fullyVisible(page: Page, locator: Locator, touchTarget = true) {
  119 |   await expect(locator).toBeInViewport({ ratio: 1 });
  120 |   const bounds = await locator.boundingBox();
  121 |   const size = page.viewportSize()!;
  122 |   expect(bounds).not.toBeNull();
  123 |   expect(bounds!.x).toBeGreaterThanOrEqual(0);
  124 |   expect(bounds!.y).toBeGreaterThanOrEqual(0);
  125 |   expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(size.width + 0.5);
  126 |   expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(size.height + 0.5);
  127 |   if (touchTarget) {
  128 |     expect(bounds!.width).toBeGreaterThanOrEqual(44);
  129 |     expect(bounds!.height).toBeGreaterThanOrEqual(44);
  130 |   }
  131 |   const clipping = await locator.evaluate((element) => {
  132 |     const rect = element.getBoundingClientRect();
  133 |     const failures: string[] = [];
  134 |     for (let parent = element.parentElement; parent; parent = parent.parentElement) {
  135 |       const style = getComputedStyle(parent),
  136 |         clip = parent.getBoundingClientRect();
  137 |       if (
  138 |         /(auto|scroll|hidden|clip)/.test(style.overflowY) &&
  139 |         (rect.top < clip.top - 0.5 || rect.bottom > clip.bottom + 0.5)
```