# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phone-playability.spec.ts >> phone camera input: real touch pan, cancellation, mode recovery and marker picking conserve state
- Location: tests\e2e\phone-playability.spec.ts:316:1

# Error details

```
Error: expect(locator).toBeInViewport() failed

Locator:  locator('#back-to-boat')
Expected: in viewport
Received: viewport ratio 0
Timeout:  10000ms

Call log:
  - Expect "toBeInViewport" locator('#back-to-boat') with timeout 10000ms
  - waiting for locator('#back-to-boat')
    20 × locator resolved to <button hidden="" id="back-to-boat">Back to boat</button>
       - unexpected value "viewport ratio 0"

```

```yaml
- main:
  - region "The Holding Pier":
    - heading "The Holding Pier" [level=1]
    - paragraph: Bring all three passengers to Harbor
    - strong: Depth 2 · 2/4 spaces
    - text: 00 actions · Tide 0 · Home 0/3
    - navigation "Crossing controls":
      - button "↶ Undo" [disabled]
      - button "Wait · 1 action"
      - button "Menu"
      - button "Mute sound": ♫
    - navigation "Map stops":
      - button "Select Harbor; adjacent passage available; Home, delivery destination": Harbor · Home
      - button "Select Stone Pier; current location": Stone Pier
      - button "Select Shallows; adjacent, too shallow": Shallows
      - button "Select Rabbit Pier; no direct passage": Rabbit Pier
    - navigation "Passenger actions at Stone Pier":
      - button "Let Moss ashore; choose passengers": Let ashore
    - paragraph: Select a place to see its options.
    - button "Open tide and pier forecast":
      - strong: Rabbit Pier floods in 4 actions.
    - navigation "Cove view":
      - button "Whole cove"
  - status: Harbor selected. Inspection is free.
```

# Test source

```ts
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
  39  |   if (touch) await page.locator(`#${id}`).tap();
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
  67  |     await activate(page, 'commit', touch);
  68  |   }
  69  |   await idle(page);
  70  | }
  71  | export async function undo(page: Page, touch = false) {
  72  |   const terminal = await page.locator('#dialog[open] #terminal-undo').count();
  73  |   await activate(page, terminal ? 'terminal-undo' : 'undo', touch);
  74  |   await idle(page);
  75  | }
  76  | export async function closeDialog(page: Page, touch = false) {
  77  |   if (await page.locator('#dialog[open]').count()) await activate(page, 'cancel', touch);
  78  | }
  79  | export async function restart(page: Page, touch = false) {
  80  |   if (await page.locator('#dialog[open] #terminal-restart').count())
  81  |     await activate(page, 'terminal-restart', touch);
  82  |   else {
  83  |     await closeDialog(page, touch);
  84  |     await activate(page, 'menu', touch);
  85  |     await activate(page, 'restart', touch);
  86  |   }
  87  |   await idle(page);
  88  | }
  89  | export async function tabTo(page: Page, id: string, backwards = false) {
  90  |   for (let count = 0; count < 64; count++) {
  91  |     if ((await active(page)) === id) return;
  92  |     await page.keyboard.press(backwards ? 'Shift+Tab' : 'Tab');
  93  |   }
  94  |   throw Error(`Natural Tab navigation did not reach ${id}; active=${await active(page)}`);
  95  | }
  96  | export async function keyAct(page: Page, id: string) {
  97  |   if ((id === 'board' || id === 'unload') && !(await page.locator(`#${id}`).isVisible())) {
  98  |     const current = await page.locator('.map-target[aria-current="location"]').getAttribute('id');
  99  |     if (!current) throw Error('No current location selector is available');
  100 |     await tabTo(page, current);
  101 |     await page.keyboard.press('Enter');
  102 |     await expect(page.locator('#local-heading')).toBeFocused();
  103 |   }
  104 |   await tabTo(page, id);
  105 |   await page.keyboard.press('Enter');
  106 |   if (id.startsWith('map-')) {
  107 |     await expect(page.locator('#local-heading')).toBeFocused();
  108 |     await tabTo(page, 'sail');
  109 |     await page.keyboard.press('Enter');
  110 |   } else {
  111 |     await expect(page.locator('#cancel')).toBeFocused();
  112 |     await tabTo(page, 'commit');
  113 |     await page.keyboard.press('Enter');
  114 |   }
  115 |   await idle(page);
  116 | }
  117 | export async function fullyVisible(page: Page, locator: Locator, touchTarget = true) {
> 118 |   await expect(locator).toBeInViewport({ ratio: 1 });
      |                         ^ Error: expect(locator).toBeInViewport() failed
  119 |   const bounds = await locator.boundingBox();
  120 |   const size = page.viewportSize()!;
  121 |   expect(bounds).not.toBeNull();
  122 |   expect(bounds!.x).toBeGreaterThanOrEqual(0);
  123 |   expect(bounds!.y).toBeGreaterThanOrEqual(0);
  124 |   expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(size.width + 0.5);
  125 |   expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(size.height + 0.5);
  126 |   if (touchTarget) {
  127 |     expect(bounds!.width).toBeGreaterThanOrEqual(44);
  128 |     expect(bounds!.height).toBeGreaterThanOrEqual(44);
  129 |   }
  130 |   const clipping = await locator.evaluate((element) => {
  131 |     const rect = element.getBoundingClientRect();
  132 |     const failures: string[] = [];
  133 |     for (let parent = element.parentElement; parent; parent = parent.parentElement) {
  134 |       const style = getComputedStyle(parent),
  135 |         clip = parent.getBoundingClientRect();
  136 |       if (
  137 |         /(auto|scroll|hidden|clip)/.test(style.overflowY) &&
  138 |         (rect.top < clip.top - 0.5 || rect.bottom > clip.bottom + 0.5)
  139 |       )
  140 |         failures.push(`${parent.className}: vertical clipping`);
  141 |       if (
  142 |         /(auto|scroll|hidden|clip)/.test(style.overflowX) &&
  143 |         (rect.left < clip.left - 0.5 || rect.right > clip.right + 0.5)
  144 |       )
  145 |         failures.push(`${parent.className}: horizontal clipping`);
  146 |     }
  147 |     return failures;
  148 |   });
  149 |   expect(clipping).toEqual([]);
  150 | }
  151 | export async function readable(locator: Locator) {
  152 |   const fontSize = await locator.evaluate((element) =>
  153 |     Number.parseFloat(getComputedStyle(element).fontSize),
  154 |   );
  155 |   expect(fontSize).toBeGreaterThanOrEqual(14);
  156 | }
  157 | export async function dialogCycle(page: Page, initialId = 'cancel') {
  158 |   await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  159 |   await expect(page.locator(`#${initialId}`)).toBeFocused();
  160 |   const focusables = page.locator(
  161 |     '#dialog :is(button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], summary, [tabindex="0"]):visible',
  162 |   );
  163 |   const count = await focusables.count();
  164 |   expect(count).toBeGreaterThan(0);
  165 |   for (let attempt = 0; attempt < 64; attempt++) {
  166 |     if (await focusables.first().evaluate((element) => element === document.activeElement)) break;
  167 |     await page.keyboard.press('Tab');
  168 |   }
  169 |   await expect(focusables.first()).toBeFocused();
  170 |   await page.keyboard.press('Shift+Tab');
  171 |   await expect(focusables.last()).toBeFocused();
  172 |   await page.keyboard.press('Tab');
  173 |   await expect(focusables.first()).toBeFocused();
  174 |   for (let step = 0; step < count + 1; step++) {
  175 |     await page.keyboard.press('Tab');
  176 |     expect(
  177 |       await page.locator('#dialog').evaluate((dialog) => dialog.contains(document.activeElement)),
  178 |     ).toBe(true);
  179 |   }
  180 | }
  181 | 
```