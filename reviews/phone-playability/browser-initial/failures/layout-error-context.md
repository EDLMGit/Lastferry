# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phone-playability.spec.ts >> phone layout 844x390: readable Play and deliberate complete Whole cove
- Location: tests\e2e\phone-playability.spec.ts:174:3

# Error details

```
Error: expect(received).not.toBeNull()

Received: null
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
  18  |   if(id.startsWith('map-')) {
  19  |     const inFrame=await page.locator(`#${id}`).evaluate(element=>{
  20  |       const r=element.getBoundingClientRect();
  21  |       return r.width>0&&r.height>0&&r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;
  22  |     });
  23  |     if(!inFrame)await wholeCove(page,touch);
  24  |   }
  25  |   if ((id === 'board' || id === 'unload') && !(await page.locator(`#${id}`).isVisible())) {
  26  |     const current = await page.locator('.map-target[aria-current="location"]').getAttribute('id');
  27  |     if (!current) throw Error('No current location selector is available');
  28  |     await activate(page,current,touch);
  29  |   }
  30  |   if (touch) await page.locator(`#${id}`).tap();
  31  |   else await page.locator(`#${id}`).click();
  32  | }
  33  | export async function wholeCove(page: Page,touch=false) {
  34  |   const toggle=page.locator('#view-toggle');
  35  |   if(await toggle.count()&&(await toggle.textContent())?.includes('Whole cove')) {
  36  |     if(touch)await toggle.tap();else await toggle.click();
  37  |     await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
  38  |   }
  39  | }
  40  | export async function selectPlace(page: Page, id: string, touch = false) {
  41  |   await activate(page, id.startsWith('map-') ? id : `map-${id}`, touch);
  42  |   await expect(page.locator('#local-context')).toBeVisible();
  43  | }
  44  | export async function startMove(page: Page, id: string, touch = false) {
  45  |   await selectPlace(page, id, touch);
  46  |   await activate(page, 'sail', touch);
  47  | }
  48  | export async function act(page: Page, id: string, touch = false) {
  49  |   if (id.startsWith('map-')) await startMove(page, id, touch);
  50  |   else {
  51  |     await activate(page, id, touch);
  52  |     await activate(page, 'commit', touch);
  53  |   }
  54  |   await idle(page);
  55  | }
  56  | export async function undo(page: Page, touch = false) {
  57  |   const terminal = await page.locator('#dialog[open] #terminal-undo').count();
  58  |   await activate(page, terminal ? 'terminal-undo' : 'undo', touch);
  59  |   await idle(page);
  60  | }
  61  | export async function closeDialog(page: Page, touch = false) {
  62  |   if (await page.locator('#dialog[open]').count()) await activate(page, 'cancel', touch);
  63  | }
  64  | export async function restart(page: Page, touch = false) {
  65  |   if (await page.locator('#dialog[open] #terminal-restart').count())
  66  |     await activate(page, 'terminal-restart', touch);
  67  |   else {
  68  |     await closeDialog(page, touch);
  69  |     await activate(page, 'menu', touch);
  70  |     await activate(page, 'restart', touch);
  71  |   }
  72  |   await idle(page);
  73  | }
  74  | export async function tabTo(page: Page, id: string, backwards = false) {
  75  |   for (let count = 0; count < 64; count++) {
  76  |     if ((await active(page)) === id) return;
  77  |     await page.keyboard.press(backwards ? 'Shift+Tab' : 'Tab');
  78  |   }
  79  |   throw Error(`Natural Tab navigation did not reach ${id}; active=${await active(page)}`);
  80  | }
  81  | export async function keyAct(page: Page, id: string) {
  82  |   if ((id === 'board' || id === 'unload') && !(await page.locator(`#${id}`).isVisible())) {
  83  |     const current = await page.locator('.map-target[aria-current="location"]').getAttribute('id');
  84  |     if (!current) throw Error('No current location selector is available');
  85  |     await tabTo(page, current);
  86  |     await page.keyboard.press('Enter');
  87  |     await expect(page.locator('#local-heading')).toBeFocused();
  88  |   }
  89  |   await tabTo(page, id);
  90  |   await page.keyboard.press('Enter');
  91  |   if (id.startsWith('map-')) {
  92  |     await expect(page.locator('#local-heading')).toBeFocused();
> 93  |     await tabTo(page, 'sail');
      |                      ^ Error: expect(received).not.toBeNull()
  94  |     await page.keyboard.press('Enter');
  95  |   } else {
  96  |     await expect(page.locator('#cancel')).toBeFocused();
  97  |     await tabTo(page, 'commit');
  98  |     await page.keyboard.press('Enter');
  99  |   }
  100 |   await idle(page);
  101 | }
  102 | export async function fullyVisible(page: Page, locator: Locator, touchTarget = true) {
  103 |   await expect(locator).toBeInViewport({ ratio: 1 });
  104 |   const bounds = await locator.boundingBox();
  105 |   const size = page.viewportSize()!;
  106 |   expect(bounds).not.toBeNull();
  107 |   expect(bounds!.x).toBeGreaterThanOrEqual(0);
  108 |   expect(bounds!.y).toBeGreaterThanOrEqual(0);
  109 |   expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(size.width + 0.5);
  110 |   expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(size.height + 0.5);
  111 |   if (touchTarget) {
  112 |     expect(bounds!.width).toBeGreaterThanOrEqual(44);
  113 |     expect(bounds!.height).toBeGreaterThanOrEqual(44);
  114 |   }
  115 |   const clipping = await locator.evaluate((element) => {
  116 |     const rect = element.getBoundingClientRect();
  117 |     const failures: string[] = [];
  118 |     for (let parent = element.parentElement; parent; parent = parent.parentElement) {
  119 |       const style = getComputedStyle(parent),
  120 |         clip = parent.getBoundingClientRect();
  121 |       if (
  122 |         /(auto|scroll|hidden|clip)/.test(style.overflowY) &&
  123 |         (rect.top < clip.top - 0.5 || rect.bottom > clip.bottom + 0.5)
  124 |       )
  125 |         failures.push(`${parent.className}: vertical clipping`);
  126 |       if (
  127 |         /(auto|scroll|hidden|clip)/.test(style.overflowX) &&
  128 |         (rect.left < clip.left - 0.5 || rect.right > clip.right + 0.5)
  129 |       )
  130 |         failures.push(`${parent.className}: horizontal clipping`);
  131 |     }
  132 |     return failures;
  133 |   });
  134 |   expect(clipping).toEqual([]);
  135 | }
  136 | export async function readable(locator: Locator) {
  137 |   const fontSize = await locator.evaluate((element) =>
  138 |     Number.parseFloat(getComputedStyle(element).fontSize),
  139 |   );
  140 |   expect(fontSize).toBeGreaterThanOrEqual(14);
  141 | }
  142 | export async function dialogCycle(page: Page, initialId = 'cancel') {
  143 |   await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  144 |   await expect(page.locator(`#${initialId}`)).toBeFocused();
  145 |   const focusables = page.locator(
  146 |     '#dialog :is(button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], summary, [tabindex="0"]):visible',
  147 |   );
  148 |   const count = await focusables.count();
  149 |   expect(count).toBeGreaterThan(0);
  150 |   for (let attempt = 0; attempt < 64; attempt++) {
  151 |     if (await focusables.first().evaluate((element) => element === document.activeElement)) break;
  152 |     await page.keyboard.press('Tab');
  153 |   }
  154 |   await expect(focusables.first()).toBeFocused();
  155 |   await page.keyboard.press('Shift+Tab');
  156 |   await expect(focusables.last()).toBeFocused();
  157 |   await page.keyboard.press('Tab');
  158 |   await expect(focusables.first()).toBeFocused();
  159 |   for (let step = 0; step < count + 1; step++) {
  160 |     await page.keyboard.press('Tab');
  161 |     expect(
  162 |       await page.locator('#dialog').evaluate((dialog) => dialog.contains(document.activeElement)),
  163 |     ).toBe(true);
  164 |   }
  165 | }
  166 | 
```