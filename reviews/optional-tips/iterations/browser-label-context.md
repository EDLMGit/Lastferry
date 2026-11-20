# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: optional-tips.spec.ts >> wide-berth Tips Off and On at 780×320
- Location: tests\e2e\optional-tips.spec.ts:19:5

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator: getByLabel('Tips', { exact: true })
Expected: "tips-preference"
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toHaveAttribute" getByLabel('Tips', { exact: true }) with timeout 10000ms
  - waiting for getByLabel('Tips', { exact: true })

```

```yaml
- main:
  - region "Wide Berth":
    - button "0 of 6 spaces · boat needs depth 1 · crossing status": 0/6 · Depth 1
    - navigation "Crossing controls":
      - button "Undo" [disabled]
      - button "Wait · 1 action"
      - button "Menu"
      - button "Enable sound" [pressed]
    - navigation "Map stops":
      - button "Select Harbor; no direct passage; Home, delivery destination": Harbor · Home
      - button "Select High Quay; adjacent passage available": High Quay
      - button "Select Wide Berth; current location": Wide Berth
      - button "Select Shell Landing; no direct passage": Shell Landing
      - button "Select Outer Buoy; no direct passage": Outer Buoy
    - button "Wide Berth floods in 4 actions. Beacon Reef flows from High Quay to Harbor. After 4 actions, it turns toward High Quay. Open reef and tide forecast.":
      - strong: Wide Berth floods in 4 actions.
      - text: Beacon Reef to Harbor · turns in 4 actions
    - navigation "Cove view":
      - button "Whole cove"
  - status
- dialog "Settings":
  - banner:
    - heading "Settings" [level=2]
    - button "Back to menu"
  - text: Sound
  - button "Enable sound"
  - status: Sound is muted.
  - text: Motion
  - combobox "Motion":
    - option "Follow device" [selected]
    - option "Reduced"
  - paragraph: Following device · normal motion.
  - text: Tips
  - combobox "Tips":
    - option "Off" [selected]
    - option "On"
  - paragraph: Show predicted outcomes and extra guidance.
  - button "Fullscreen"
  - contentinfo:
    - button "Back"
```

# Test source

```ts
  1  | import { expect, type Page } from '@playwright/test';
  2  | import { readFileSync } from 'node:fs';
  3  | import { initial, preview, type Action, type State } from '../../src/game/rules';
  4  | import type { Level } from '../../src/levels/level';
  5  | import { activate, fullyVisible, idle, state, wholeCove } from './ui';
  6  | import { checkTurn, transferStart } from './large-cove-support';
  7  | 
  8  | export const tipsKey = 'last-ferry-tips';
  9  | export const savedJourney = JSON.stringify({
  10 |   version: 1,
  11 |   completed: ['holding-pier', 'bellwater', 'driftwood-yard'],
  12 |   acknowledgedScenes: ['opening', 'another-bell', 'driftwood-light'],
  13 |   checkpoint: { kind: 'scene', id: 'a-wider-deck' },
  14 | }, null, 2);
  15 | 
  16 | export function coveData(id: string) {
  17 |   const level: Level = JSON.parse(readFileSync('data/' + id + '.level.json', 'utf8'));
  18 |   const witnesses = JSON.parse(readFileSync('data/' + id + '/witnesses.json', 'utf8'));
  19 |   return { level, actions: witnesses.witnesses[0].actions as Action[] };
  20 | }
  21 | 
  22 | export async function settings(page: Page) {
  23 |   await activate(page, 'menu', true);
  24 |   await activate(page, 'settings', true);
> 25 |   await expect(page.getByLabel('Tips', { exact: true })).toHaveAttribute('id', 'tips-preference');
     |                                                          ^ Error: expect(locator).toHaveAttribute(expected) failed
  26 | }
  27 | 
  28 | export async function setTips(page: Page, on: boolean) {
  29 |   const before = await state(page);
  30 |   await settings(page);
  31 |   await page.locator('#tips-preference').selectOption(on ? 'on' : 'off');
  32 |   await expect(page.locator('#tips-preference')).toHaveValue(on ? 'on' : 'off');
  33 |   await page.locator('#tips-preference').scrollIntoViewIfNeeded();
  34 |   await fullyVisible(page, page.locator('#tips-preference'));
  35 |   await activate(page, 'settings-back', true);
  36 |   await activate(page, 'cancel', true);
  37 |   expect(await state(page)).toEqual(before);
  38 |   return before as State;
  39 | }
  40 | 
  41 | export async function selectRoute(page: Page, to: string) {
  42 |   await wholeCove(page, true);
  43 |   const marker = page.locator('#map-' + to);
  44 |   await marker.locator('.map-hit').tap();
  45 |   await expect(page.locator('#local-context')).toBeVisible();
  46 |   await fullyVisible(page, page.locator('#sail'));
  47 | }
  48 | 
  49 | export async function chooseTransfer(page: Page, type: 'board' | 'unload', ids: string[]) {
  50 |   await activate(page, type, true);
  51 |   await expect(page.locator('#dialog')).toHaveAttribute('data-mode', 'action');
  52 |   for (const choice of await page.locator('.passenger-options button').all()) {
  53 |     const id = (await choice.getAttribute('id'))!.slice('passenger-'.length);
  54 |     if (((await choice.getAttribute('aria-pressed')) === 'true') !== ids.includes(id))
  55 |       await choice.tap();
  56 |   }
  57 |   await fullyVisible(page, page.locator('#commit'));
  58 | }
  59 | 
  60 | export async function action(page: Page, next: Action, level: Level) {
  61 |   const before = await state(page) as State;
  62 |   const proposed = preview(before, next, level);
  63 |   expect(proposed.error).toBeNull();
  64 |   if (next.type === 'move') {
  65 |     await selectRoute(page, next.to);
  66 |     await activate(page, 'sail', true);
  67 |   } else if (next.type === 'wait') {
  68 |     await activate(page, 'wait', true);
  69 |     await activate(page, 'commit', true);
  70 |   } else await transferStart(page, next);
  71 |   await idle(page);
  72 |   await checkTurn(page, proposed.state, true);
  73 |   return proposed.state;
  74 | }
  75 | 
  76 | export async function replay(page: Page, actions: Action[], level: Level) {
  77 |   let expected = initial(level);
  78 |   for (const next of actions) expected = await action(page, next, level);
  79 |   return expected;
  80 | }
  81 | 
```