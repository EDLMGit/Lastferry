# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cove-eight-practice.spec.ts >> portrait first strategy rescues the unscored candidate with tide and terminal Undo
- Location: tests\e2e\cove-eight-practice.spec.ts:27:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

@@ -9,12 +9,12 @@
    "tideLevel": 0,
    "turn": 2,
    "waitingByPier": Object {
      "harbor-pier": Array [],
      "high-pier": Array [
-       "fennel",
        "juniper",
+       "fennel",
      ],
      "low-pier": Array [],
      "reeds-pier": Array [
        "willow",
      ],
```

# Page snapshot

```yaml
- main [ref=e3]:
  - region "Ternhaven" [ref=e4]:
    - generic "Ternhaven. Use the labeled waypoint controls to navigate." [ref=e6]
    - button "2 of 6 spaces · boat needs depth 2 · crossing status" [ref=e7] [cursor=pointer]:
      - generic: 2/6 · Depth 2
    - navigation "Crossing controls" [ref=e8]:
      - button "Undo" [ref=e9] [cursor=pointer]
      - button "Wait · 1 action" [ref=e10] [cursor=pointer]:
        - generic: Wait
      - button "Menu" [ref=e11] [cursor=pointer]
      - button "Mute sound" [ref=e12] [cursor=pointer]
    - navigation "Map stops":
      - generic:
        - button "Select Harbor; no direct passage; Home, delivery destination":
          - generic [ref=e13] [cursor=pointer]
          - generic [ref=e15] [cursor=pointer]: Harbor
      - generic:
        - button "Select Tern Buoy; adjacent passage available" [expanded]:
          - generic [ref=e17] [cursor=pointer]
          - generic [ref=e19] [cursor=pointer]: Tern Buoy
      - generic:
        - button "Select High Bank; current location":
          - generic [aria-hidden] [ref=e22] [cursor=pointer]: •
          - generic [ref=e23] [cursor=pointer]: High Bank
      - generic:
        - button "Select Tern Steps; no direct passage":
          - generic [aria-hidden] [ref=e26] [cursor=pointer]: ◇
          - generic [ref=e27] [cursor=pointer]: Tern Steps
      - generic:
        - button "Select Reed Landing; no direct passage":
          - generic [aria-hidden] [ref=e30] [cursor=pointer]: ◇
          - generic [ref=e31] [cursor=pointer]: Reed Landing
    - region "Tern Buoy · free inspection" [active] [ref=e33]:
      - generic [ref=e34]:
        - button "Sail to Tern Buoy · 1 action" [ref=e35] [cursor=pointer]:
          - generic: Sail to Tern Buoy
        - button "Details" [ref=e36] [cursor=pointer]
        - button "Close location card" [ref=e37] [cursor=pointer]
    - button "Reed Landing floods in 8 actions. Tern Reach flows from Tern Buoy to Harbor. After 2 actions, it turns toward Tern Buoy. Open reef and tide forecast." [ref=e38] [cursor=pointer]:
      - generic [ref=e39]:
        - strong [ref=e40]: Reed Landing floods in 8 actions.
        - generic [ref=e41]: Tern Reach to Harbor · turns in 2 actions
    - navigation "Cove view" [ref=e42]:
      - button "Play view" [pressed] [ref=e43] [cursor=pointer]
      - button "Adjust map zoom" [ref=e44] [cursor=pointer]:
        - generic: Zoom
      - button "Back to boat" [ref=e45] [cursor=pointer]
  - status [ref=e46]: Tern Buoy selected. Inspection is free.
```

# Test source

```ts
  1   | import { expect, type Page } from '@playwright/test';
  2   | import { createHash } from 'node:crypto';
  3   | import { readFileSync } from 'node:fs';
  4   | import { initial, preview, type Action, type State } from '../../src/game/rules';
  5   | import type { Level } from '../../src/levels/level';
  6   | import { activate, fullyVisible, idle, state, wholeCove } from './ui';
  7   | import { checkTurn, directory, localView, report, snapshot, transferStart } from './large-cove-support';
  8   | import { completed, scenes, runtimeSource, storage } from './three-lanterns-support';
  9   |
  10  | export const seven = [...completed, 'orchard-landing'];
  11  | export const sevenScenes = [...scenes, 'orchard-paths'];
  12  | export const completeSeven = JSON.stringify({ version: 1, completed: seven, acknowledgedScenes: sevenScenes, checkpoint: { kind: 'complete' } }, null, 2) + '\n';
  13  | export const acceptedBest: string = JSON.parse(readFileSync('reviews/three-lanterns/release/accepted.json', 'utf8')).saved.mastery;
  14  | export const recordOnly = process.env.LAST_FERRY_C8_RECORD_ONLY === '1';
  15  |
  16  | export function sources() {
  17  |   const current = runtimeSource();
  18  |   const tests = Object.fromEntries([
  19  |     'tests/e2e/cove-eight-practice.spec.ts', 'tests/e2e/cove-eight-support.ts',
  20  |     'tests/e2e/three-lanterns-support.ts', 'tests/e2e/large-cove-support.ts',
  21  |     'tests/e2e/ui.ts', 'tests/e2e/story-support.ts', 'playwright.config.ts',
  22  |   ].map(path => [path, createHash('sha256').update(readFileSync(path)).digest('hex')]));
  23  |   return { ...current, tests };
  24  | }
  25  |
  26  | export function candidate(id: string) {
  27  |   const level: Level = JSON.parse(readFileSync('data/' + id + '.level.json', 'utf8'));
  28  |   const data = JSON.parse(readFileSync('data/' + id + '/witnesses.json', 'utf8'));
  29  |   return { level, witnesses: data.witnesses as { id: string; actions: Action[] }[] };
  30  | }
  31  |
  32  | export async function capture(page: Page, folder: string, name: string) {
  33  |   if (!recordOnly) await snapshot(page, directory(folder), name);
  34  |   const fit = await page.evaluate(() => {
  35  |     const failures: string[] = [];
  36  |     const dialog = document.querySelector<HTMLElement>('#dialog[open]');
  37  |     const controls = [...document.querySelectorAll<HTMLElement>(dialog ? '#dialog button:not([hidden]), #dialog select' : '#menu, #undo, #load-toggle, #view-toggle, #view-zoom')];
  38  |     const measurements = controls.filter(el => el.getBoundingClientRect().width && getComputedStyle(el).visibility !== 'hidden').map(el => {
  39  |       const bounds = el.getBoundingClientRect();
  40  |       return { id: el.id, rect: bounds.toJSON(), font: getComputedStyle(el).fontSize };
  41  |     });
  42  |     const scope = dialog ?? document.getElementById('app')!;
  43  |     for (const el of [scope, ...scope.querySelectorAll<HTMLElement>('*')]) {
  44  |       if (el.closest('.sr-only') || !el.getBoundingClientRect().width || getComputedStyle(el).display === 'inline') continue;
  45  |       if (dialog && el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1) failures.push((el.id || el.className) + ': horizontal overflow');
  46  |     }
  47  |     if (document.documentElement.scrollWidth > innerWidth) failures.push('page horizontal overflow');
  48  |     return { viewport: [innerWidth, innerHeight], measurements, failures };
  49  |   });
  50  |   expect(fit.failures).toEqual([]);
  51  |   report(directory(folder), name + '-fit', fit);
  52  | }
  53  |
  54  | export async function startCheck(page: Page, level: Level, development = true) {
  55  |   await idle(page);
  56  |   await expect(page.locator('#seascape')).toHaveAttribute('aria-label', level.title);
  57  |   await expect(page.locator('[data-testid=turn]')).toHaveText('00');
  58  |   await expect(page.locator('#undo')).toBeDisabled();
  59  |   for (const id of ['menu', 'undo', 'load-toggle', 'view-toggle', 'view-zoom'])
  60  |     await fullyVisible(page, page.locator('#' + id));
  61  |   if (development) expect(await state(page)).toEqual(initial(level));
  62  | }
  63  |
  64  | export async function execute(page: Page, level: Level, action: Action, before: State, development = true, previewCapture?: () => Promise<void>) {
  65  |   const proposed = preview(before, action, level);
  66  |   expect(proposed.error).toBeNull();
  67  |   if (proposed.state.status !== 'playing') await localView(page);
  68  |   if (action.type === 'move') {
  69  |     await wholeCove(page, true);
  70  |     await page.locator('#map-' + action.to + ' .map-hit').tap();
  71  |     await fullyVisible(page, page.locator('#sail'));
> 72  |     if (development) expect(await state(page)).toEqual(before);
      |                                                ^ Error: expect(received).toEqual(expected) // deep equality
  73  |     if (previewCapture) await previewCapture();
  74  |     await activate(page, 'sail', true);
  75  |   } else if (action.type === 'wait') {
  76  |     await activate(page, 'wait', true);
  77  |     if (development) expect(await state(page)).toEqual(before);
  78  |     if (previewCapture) await previewCapture();
  79  |     await activate(page, 'commit', true);
  80  |   } else {
  81  |     await localView(page);
  82  |     await transferStart(page, action, async () => {
  83  |     if (development) expect(await state(page)).toEqual(before);
  84  |     await fullyVisible(page, page.locator('#commit'));
  85  |     for (const tile of await page.locator('.passenger-options button').all()) {
  86  |       const labelsFit = await tile.evaluate(el => {
  87  |         const box = el.getBoundingClientRect();
  88  |         const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  89  |         let node: Node | null;
  90  |         while ((node = walker.nextNode())) {
  91  |           if (!node.textContent?.trim()) continue;
  92  |           const range = document.createRange(); range.selectNodeContents(node);
  93  |           if ([...range.getClientRects()].some(r => r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1)) return false;
  94  |         }
  95  |         return true;
  96  |       });
  97  |       expect(labelsFit).toBe(true);
  98  |     }
  99  |     if (previewCapture) await previewCapture();
  100 |     });
  101 |   }
  102 |   await idle(page);
  103 |   await checkTurn(page, proposed.state, development);
  104 |   const all = [...proposed.state.aboard, ...proposed.state.delivered, ...Object.values(proposed.state.waitingByPier).flat()];
  105 |   expect([...all].sort()).toEqual(level.passengers.map(p => p.id).sort());
  106 |   expect(new Set(all).size).toBe(all.length);
  107 |   return proposed.state;
  108 | }
  109 |
  110 | export async function replay(page: Page, level: Level, actions: Action[], development = true, from = initial(level)) {
  111 |   const states: State[] = [];
  112 |   let current = from;
  113 |   for (const action of actions) {
  114 |     current = await execute(page, level, action, current, development);
  115 |     states.push(current);
  116 |   }
  117 |   return states;
  118 | }
  119 |
  120 | export async function unscoredWin(page: Page, turn: number) {
  121 |   await expect(page.locator('#dialog[open]')).toHaveAttribute('data-outcome', 'won');
  122 |   await expect(page.locator('.ending')).toContainText(turn + ' actions');
  123 |   await expect(page.locator('#mastery-result')).toHaveCount(0);
  124 |   await fullyVisible(page, page.locator('#terminal-undo'));
  125 |   await fullyVisible(page, page.locator('#terminal-restart'));
  126 |   await fullyVisible(page, page.locator('#choose-cove'));
  127 |   expect((await storage(page)).mastery).toBe(acceptedBest);
  128 |   expect((await storage(page)).masteryWrites).toBe(0);
  129 | }
  130 |
  131 | export async function unscoredMenu(page: Page) {
  132 |   await activate(page, 'menu', true);
  133 |   await expect(page.locator('#dialog')).toContainText('Playtest · no lantern rating');
  134 |   await expect(page.locator('.mastery-criteria')).toHaveCount(0);
  135 |   await expect(page.locator('#dialog')).not.toContainText('keeps the lantern result');
  136 |   await expect(page.locator('#dialog')).not.toContainText('keeps its lantern result');
  137 |   await page.keyboard.press('Escape');
  138 | }
  139 |
```
