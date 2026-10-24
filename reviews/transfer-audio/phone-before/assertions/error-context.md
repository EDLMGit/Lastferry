# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: transfer-phone.spec.ts >> transfer controls remain reachable at 780x320
- Location: tests\e2e\transfer-phone.spec.ts:7:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 320
Received: 360
```

# Page snapshot

```yaml
- main [ref=e3]:
  - region "The Holding Pier" [ref=e4]:
    - generic "The Holding Pier. Use the labeled waypoint controls to navigate." [ref=e6]
    - generic [ref=e7]:
      - generic [ref=e8]:
        - heading "The Holding Pier" [level=1] [ref=e9]
        - paragraph [ref=e10]: Bring all three passengers to Harbor
      - generic "Crossing progress" [ref=e11]:
        - strong [ref=e12]: Depth 2 · 2/4 spaces
        - generic [ref=e13]: 00 actions · Tide 0 · Home 0/3
      - navigation "Crossing controls" [ref=e14]:
        - button "↶ Undo" [disabled] [ref=e15]
        - button "Wait · 1 action" [ref=e16] [cursor=pointer]
        - button "Menu" [ref=e17] [cursor=pointer]
        - button "Unmute sound" [pressed] [ref=e18] [cursor=pointer]: ♩
    - navigation "Map stops":
      - button "Select Harbor; adjacent passage available; Home, delivery destination" [ref=e20] [cursor=pointer]:
        - generic [aria-hidden] [ref=e21]: ○
        - generic [ref=e22]: Harbor · Home
      - button "Select Stone Pier; current location" [ref=e24] [cursor=pointer]:
        - generic [aria-hidden] [ref=e25]: ◉
        - generic [ref=e26]: Stone Pier
      - button "Select Shallows; adjacent, too shallow" [ref=e28] [cursor=pointer]:
        - generic [aria-hidden] [ref=e29]: ⊘
        - generic [ref=e30]: Shallows
      - button "Select Rabbit Pier; no direct passage" [ref=e32] [cursor=pointer]:
        - generic [aria-hidden] [ref=e33]: ◇
        - generic [ref=e34]: Rabbit Pier
    - paragraph: Select a place to see its options.
    - button "Open tide and pier forecast" [ref=e35] [cursor=pointer]:
      - generic [aria-hidden] [ref=e36]: "!"
      - generic [ref=e37]:
        - strong [ref=e38]: Rabbit Pier floods in 4 actions.
        - generic [ref=e39]: Moss is safe aboard.
  - status [ref=e40]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { mkdirSync, writeFileSync } from 'node:fs';
  3  | import { reviewDir } from './evidence';
  4  | import { act, active, dialogCycle, fullyVisible, idle, readable, ready, state, tabTo, undo } from './ui';
  5  | 
  6  | for (const [width, height] of [[780, 320], [844, 390]]) {
  7  |   test(`transfer controls remain reachable at ${width}x${height}`, async ({ browser, baseURL }) => {
  8  |     const context = await browser.newContext({ baseURL, viewport: { width, height }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  9  |     await context.addInitScript(() => localStorage.setItem('last-ferry-muted', 'true'));
  10 |     const page = await context.newPage(), errors: string[] = [], evidence = `${reviewDir}/${width}x${height}`;
  11 |     page.on('pageerror', error => errors.push(error.message));
  12 |     mkdirSync(reviewDir, { recursive: true });
  13 |     await ready(page, 'holding-pier');
  14 |     const initial = await state(page);
> 15 |     expect(await page.locator('.game').evaluate(element => element.getBoundingClientRect().height)).toBe(height);
     |                                                                                                     ^ Error: expect(received).toBe(expected) // Object.is equality
  16 |     for (const id of ['status-toggle', 'map-harbor', 'map-stone', 'map-shallows', 'map-rabbit-pier', 'undo']) {
  17 |       await fullyVisible(page, page.locator(`#${id}`));
  18 |       await readable(page.locator(`#${id}`));
  19 |     }
  20 |     await page.screenshot({ path: `${evidence}-start.png` });
  21 |     await page.locator('#status-toggle').tap();
  22 |     await fullyVisible(page, page.locator('#cancel'));
  23 |     await expect(page.locator('.forecast-detail')).toContainText('Rabbit Pier will flood');
  24 |     await page.keyboard.press('Escape');
  25 |     await expect(page.locator('#status-toggle')).toBeFocused();
  26 |     await tabTo(page, 'map-stone', true);
  27 |     await page.keyboard.press('Enter');
  28 |     await expect(page.locator('#local-heading')).toBeFocused();
  29 |     await fullyVisible(page, page.locator('#unload'));
  30 |     await readable(page.locator('#unload'));
  31 |     await page.screenshot({ path: `${evidence}-current.png` });
  32 |     await tabTo(page, 'unload');
  33 |     await page.keyboard.press('Enter');
  34 |     await dialogCycle(page);
  35 |     for (const id of ['cancel', 'commit']) await fullyVisible(page, page.locator(`#${id}`));
  36 |     await readable(page.locator('#commit'));
  37 |     await page.screenshot({ path: `${evidence}-unload-preview.png` });
  38 |     await page.keyboard.press('Escape');
  39 |     await expect(page.locator('#unload')).toBeFocused();
  40 |     expect(await state(page)).toEqual(initial);
  41 |     await act(page, 'unload', true);
  42 |     expect(await state(page)).toMatchObject({ turn: 1, aboard: [], waitingByPier: { 'stone-pier': ['sheep-1'] } });
  43 |     await tabTo(page, 'undo', true);
  44 |     await page.keyboard.press('Enter');
  45 |     await idle(page);
  46 |     expect(await state(page)).toEqual(initial);
  47 |     await act(page, 'unload', true);
  48 |     await act(page, 'map-shallows', true);
  49 |     await act(page, 'map-rabbit-pier', true);
  50 |     const dry = await state(page);
  51 |     await page.locator('#map-rabbit-pier').tap();
  52 |     await fullyVisible(page, page.locator('#board'));
  53 |     await page.locator('#board').tap();
  54 |     await expect(page.locator('.consequence')).toContainText('Both are safe aboard.');
  55 |     for (const id of ['passenger-rabbit-1', 'passenger-rabbit-2']) {
  56 |       await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  57 |       await fullyVisible(page, page.locator(`#${id}`));
  58 |       await readable(page.locator(`#${id}`));
  59 |     }
  60 |     await page.locator('#passenger-rabbit-2').tap();
  61 |     await expect(page.locator('.consequence')).toContainText('Rue is still waiting at Rabbit Pier when it floods. This ends the crossing.');
  62 |     await page.locator('#passenger-rabbit-2').tap();
  63 |     await page.locator('.consequence').scrollIntoViewIfNeeded();
  64 |     await fullyVisible(page, page.locator('.consequence'), false);
  65 |     for (const id of ['cancel', 'commit']) await fullyVisible(page, page.locator(`#${id}`));
  66 |     await page.screenshot({ path: `${evidence}-critical-boarding.png` });
  67 |     await page.locator('#commit').tap();
  68 |     await idle(page);
  69 |     const afterRise = await state(page);
  70 |     expect(afterRise).toMatchObject({ turn: 4, tideLevel: 1, status: 'playing', aboard: ['rabbit-1', 'rabbit-2'] });
  71 |     await fullyVisible(page, page.locator('#status-toggle'));
  72 |     await page.screenshot({ path: `${evidence}-after-rise.png` });
  73 |     await undo(page, true);
  74 |     expect(await state(page)).toEqual(dry);
  75 |     await act(page, 'board', true);
  76 |     expect(await state(page)).toEqual(afterRise);
  77 |     await act(page, 'map-shallows', true);
  78 |     await act(page, 'map-stone', true);
  79 |     await act(page, 'board', true);
  80 |     await act(page, 'map-harbor', true);
  81 |     await act(page, 'unload', true);
  82 |     expect(await state(page)).toMatchObject({ turn: 9, tideLevel: 2, status: 'won', delivered: ['rabbit-1', 'rabbit-2', 'sheep-1'] });
  83 |     for (const id of ['terminal-undo', 'terminal-restart']) await fullyVisible(page, page.locator(`#${id}`));
  84 |     await dialogCycle(page, 'terminal-undo');
  85 |     await page.screenshot({ path: `${evidence}-success.png` });
  86 |     await tabTo(page, 'terminal-undo');
  87 |     await page.keyboard.press('Enter');
  88 |     await idle(page);
  89 |     expect(await state(page)).toMatchObject({ turn: 8, status: 'playing', aboard: ['rabbit-1', 'rabbit-2', 'sheep-1'] });
  90 |     expect(await active(page)).toBe('undo');
  91 |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  92 |     expect(errors).toEqual([]);
  93 |     writeFileSync(`${evidence}-verification.json`, JSON.stringify({ viewport: [width, height], touchEmulation: true, initial, beforeTide: dry, afterTide: afterRise, afterTerminalUndo: await state(page), errors }, null, 2));
  94 |     await context.close();
  95 |   });
  96 | }
  97 | 
```