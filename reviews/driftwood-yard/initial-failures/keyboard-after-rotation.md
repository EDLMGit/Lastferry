# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: driftwood-yard.spec.ts >> legacy read-only Home, explicit fresh continuation, restored recap and native fit
- Location: tests\e2e\driftwood-yard.spec.ts:304:1

# Error details

```
Error: Natural Tab navigation did not reach board; active=map-harbor
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
> 95  |   throw Error(`Natural Tab navigation did not reach ${id}; active=${await active(page)}`);
      |         ^ Error: Natural Tab navigation did not reach board; active=map-harbor
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
  140 |       )
  141 |         failures.push(`${parent.className}: vertical clipping`);
  142 |       if (
  143 |         /(auto|scroll|hidden|clip)/.test(style.overflowX) &&
  144 |         (rect.left < clip.left - 0.5 || rect.right > clip.right + 0.5)
  145 |       )
  146 |         failures.push(`${parent.className}: horizontal clipping`);
  147 |     }
  148 |     return failures;
  149 |   });
  150 |   expect(clipping).toEqual([]);
  151 | }
  152 | export async function readable(locator: Locator) {
  153 |   const fontSize = await locator.evaluate((element) =>
  154 |     Number.parseFloat(getComputedStyle(element).fontSize),
  155 |   );
  156 |   expect(fontSize).toBeGreaterThanOrEqual(14);
  157 | }
  158 | export async function dialogCycle(page: Page, initialId = 'cancel') {
  159 |   await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  160 |   await expect(page.locator(`#${initialId}`)).toBeFocused();
  161 |   const focusables = page.locator(
  162 |     '#dialog :is(button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], summary, [tabindex="0"]):visible',
  163 |   );
  164 |   const count = await focusables.count();
  165 |   expect(count).toBeGreaterThan(0);
  166 |   for (let attempt = 0; attempt < 64; attempt++) {
  167 |     if (await focusables.first().evaluate((element) => element === document.activeElement)) break;
  168 |     await page.keyboard.press('Tab');
  169 |   }
  170 |   await expect(focusables.first()).toBeFocused();
  171 |   await page.keyboard.press('Shift+Tab');
  172 |   await expect(focusables.last()).toBeFocused();
  173 |   await page.keyboard.press('Tab');
  174 |   await expect(focusables.first()).toBeFocused();
  175 |   for (let step = 0; step < count + 1; step++) {
  176 |     await page.keyboard.press('Tab');
  177 |     expect(
  178 |       await page.locator('#dialog').evaluate((dialog) => dialog.contains(document.activeElement)),
  179 |     ).toBe(true);
  180 |   }
  181 | }
  182 | 
```