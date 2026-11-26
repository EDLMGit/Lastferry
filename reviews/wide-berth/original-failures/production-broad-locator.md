# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: wide-berth-production.spec.ts >> production six-space boat rescue, actual six-option overflow and full-label fit
- Location: tests\e2e\wide-berth-production.spec.ts:18:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.requirement')
Expected substring: "boat has 6 spaces; this group needs 8"
Error: strict mode violation: locator('.requirement') resolved to 2 elements:
    1) <p class="requirement">Boat needs depth 4. Passage has depth 4: enough d…</p> aka getByText('Boat needs depth 4. Passage')
    2) <p class="requirement">The boat has 6 spaces; this group needs 8.</p> aka getByText('The boat has 6 spaces; this')

Call log:
  - Expect "toContainText" locator('.requirement') with timeout 10000ms
  - waiting for locator('.requirement')

```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | import { mkdirSync, writeFileSync } from 'node:fs';
  3   | import { productionURL, reviewDir } from './evidence';
  4   | import { act, activate, idle, fullyVisible } from './ui';
  5   | import { measureStory } from './story-support';
  6   | async function transfer(page: Page, type: 'board' | 'unload', ids?: string[], commit = true) {
  7   |   await activate(page, type, true);
  8   |   if (await page.locator('#dialog[open][data-mode="action"]').count()) {
  9   |     for (const b of await page.locator('.passenger-options button').all()) {
  10  |       const id = (await b.getAttribute('id'))!.replace('passenger-', '');
  11  |       if (ids && ((await b.getAttribute('aria-pressed')) === 'true') !== ids.includes(id))
  12  |         await b.tap();
  13  |     }
  14  |     if (commit) await activate(page, 'commit', true);
  15  |   }
  16  |   await idle(page);
  17  | }
  18  | test('production six-space boat rescue, actual six-option overflow and full-label fit', async ({
  19  |   browser,
  20  | }) => {
  21  |   test.setTimeout(300000);
  22  |   const context = await browser.newContext({
  23  |     viewport: { width: 844, height: 390 },
  24  |     hasTouch: true,
  25  |     isMobile: true,
  26  |   });
  27  |   const page = await context.newPage();
  28  |   const errors: string[] = [];
  29  |   page.on('pageerror', (e) => errors.push(e.message));
  30  |   mkdirSync(reviewDir, { recursive: true });
  31  |   try {
  32  |     await page.goto(`${productionURL}/?cove=wide-berth`);
  33  |     await expect(page.locator('.identity h1')).toHaveText('Wide Berth');
  34  |     for (const id of ['map-high-quay', 'map-wide-berth']) await act(page, id, true);
  35  |     await transfer(page, 'board');
  36  |     await expect(page.locator('#boat-summary')).toContainText('Depth 4 · 6/6 spaces');
  37  |     await act(page, 'map-high-quay', true);
  38  |     await transfer(page, 'unload', ['alder']);
  39  |     await act(page, 'map-shell-landing', true);
  40  |     await transfer(page, 'board');
  41  |     for (let i = 0; i < 3; i++) await act(page, 'wait', true);
  42  |     await act(page, 'map-high-quay', true);
  43  |     await transfer(page, 'unload');
  44  |     await transfer(page, 'board', undefined, false);
  45  |     await expect(page.locator('#commit')).toBeDisabled();
> 46  |     await expect(page.locator('.requirement')).toContainText(
      |                                                ^ Error: expect(locator).toContainText(expected) failed
  47  |       'boat has 6 spaces; this group needs 8',
  48  |     );
  49  |     await expect
  50  |       .poll(() =>
  51  |         page
  52  |           .locator('#preview img')
  53  |           .evaluateAll(
  54  |             (images) =>
  55  |               images.length === 6 &&
  56  |               images.every(
  57  |                 (i) =>
  58  |                   (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth === 256,
  59  |               ),
  60  |           ),
  61  |       )
  62  |       .toBe(true);
  63  |     for (const size of [
  64  |       { width: 320, height: 740 },
  65  |       { width: 390, height: 844 },
  66  |       { width: 780, height: 320 },
  67  |       { width: 844, height: 390 },
  68  |       { width: 1440, height: 900 },
  69  |     ]) {
  70  |       await page.setViewportSize(size);
  71  |       await expect.poll(async () => (await page.evaluate(measureStory)).failures).toEqual([]);
  72  |       for (const id of ['alder', 'clover', 'poppy', 'wren', 'sorrel', 'finch'])
  73  |         await fullyVisible(page, page.locator(`#passenger-${id}`));
  74  |       await fullyVisible(page, page.locator('#preview .requirement'), false);
  75  |       await fullyVisible(page, page.locator('#commit'));
  76  |       await page.screenshot({
  77  |         path: `${reviewDir}/${size.width}x${size.height}-production-six-chooser.png`,
  78  |       });
  79  |       writeFileSync(
  80  |         `${reviewDir}/${size.width}x${size.height}-production-fit.json`,
  81  |         JSON.stringify(await page.evaluate(measureStory), null, 2),
  82  |       );
  83  |     }
  84  |     await page.setViewportSize({ width: 844, height: 390 });
  85  |     await activate(page, 'passenger-clover', true);
  86  |     for(const size of [{width:320,height:740},{width:390,height:844},{width:780,height:320},{width:844,height:390},{width:1440,height:900}]){
  87  |       await page.setViewportSize(size);
  88  |       await expect.poll(async()=>(await page.evaluate(measureStory)).failures).toEqual([]);
  89  |       for(const id of ['alder','clover','poppy','wren','sorrel','finch'])await fullyVisible(page,page.locator(`#passenger-${id}`));
  90  |       await fullyVisible(page,page.locator('#preview .requirement'),false);await fullyVisible(page,page.locator('#commit'));
  91  |       await page.screenshot({path:`${reviewDir}/${size.width}x${size.height}-legal-six-chooser.png`});
  92  |     }
  93  |     await activate(page, 'commit', true);
  94  |     await idle(page);
  95  |     await expect(page.locator('#boat-summary')).toContainText('Depth 4 · 6/6 spaces');
  96  |     await act(page, 'map-harbor', true);
  97  |     await transfer(page, 'unload');
  98  |     await act(page, 'map-high-quay', true);
  99  |     await transfer(page, 'board');
  100 |     await act(page, 'map-harbor', true);
  101 |     await transfer(page, 'unload');
  102 |     await expect(page.locator('#dialog')).toContainText('6 passengers safe at Harbor');
  103 |     expect(errors).toEqual([]);
  104 |     writeFileSync(
  105 |       `${reviewDir}/production-environment.json`,
  106 |       JSON.stringify(
  107 |         {
  108 |           browser: browser.version(),
  109 |           node: process.version,
  110 |           errors,
  111 |           method:
  112 |             'Actual production build UI, no DEV state bridge; safe six-neighbor staging variation then complete delivery',
  113 |         },
  114 |         null,
  115 |         2,
  116 |       ),
  117 |     );
  118 |   } finally {
  119 |     await context.close();
  120 |   }
  121 | });
  122 | 
```