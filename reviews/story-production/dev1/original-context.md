# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: story-production.spec.ts >> production native temporal phone compositions and all required viewport fits
- Location: tests\e2e\story-production.spec.ts:362:1

# Error details

```
Error: ENOENT: no such file or directory, scandir 'C:\Users\ernes\Documents\last-ferry-codex-starter\Lastferry\public'
```

```
Error: ENOENT: no such file or directory, scandir 'C:\Users\ernes\Documents\last-ferry-codex-starter\Lastferry\public'
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test';
  2   | import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
  3   | import { createHash } from 'node:crypto';
  4   | import { execFileSync } from 'node:child_process';
  5   | import { reviewDir, productionURL } from './evidence';
  6   | import { act, activate, fullyVisible, idle, state, tabTo, undo } from './ui';
  7   | import {
  8   |   checkpoint,
  9   |   coldTouch,
  10  |   passive,
  11  |   rescueBellwater,
  12  |   rescueHolding,
  13  |   title,
  14  | } from './story-support';
  15  | 
  16  | test.use({
  17  |   launchOptions: {
  18  |     ignoreDefaultArgs: ['--autoplay-policy=no-user-gesture-required'],
  19  |     args: [
  20  |       '--use-angle=swiftshader',
  21  |       '--enable-unsafe-swiftshader',
  22  |       '--autoplay-policy=document-user-activation-required',
  23  |     ],
  24  |   },
  25  | });
  26  | test.setTimeout(240000);
  27  | mkdirSync(`${reviewDir}/raw`, { recursive: true });
  28  | const openingText = [
  29  |   'Your first evening at the helm.\nA high tide ahead.',
  30  |   'Pip and Rue have kept a light for you.',
  31  |   'Moss is aboard.\nBring everyone to the lighthouse.',
  32  | ];
  33  | const harborText = 'Pip, Rue and Moss are safe.\nBellwater is still waiting.';
  34  | const timeline = (page: Page) =>
  35  |   page.evaluate(() => (window as any).__LAST_FERRY__.getStoryStatus().timeline);
  36  | const audio = (page: Page) => passive(page, () => (window as any).__LAST_FERRY__.getAudioStatus());
  37  | const inspect = (page: Page) =>
  38  |   page.evaluate(() => {
  39  |     const g = (window as any).__LAST_FERRY__;
  40  |     return {
  41  |       at: Date.now(),
  42  |       story: g.getStoryStatus(),
  43  |       state: g.getState(),
  44  |       campaign: g.getCampaignStatus(),
  45  |       audio: g.getAudioStatus(),
  46  |       render: g.getRenderStatus(),
  47  |       metrics: g.getMetrics(),
  48  |       motion: g.getMotionStatus(),
  49  |     };
  50  |   });
  51  | const save = (name: string, value: unknown) =>
  52  |   writeFileSync(`${reviewDir}/${name}.json`, JSON.stringify(value, null, 2));
  53  | const hash = (value: Buffer | string) => createHash('sha256').update(value).digest('hex');
  54  | function source() {
  55  |   const walk = (path: string): string[] =>
> 56  |     readdirSync(path, { withFileTypes: true }).flatMap((e) =>
      |     ^ Error: ENOENT: no such file or directory, scandir 'C:\Users\ernes\Documents\last-ferry-codex-starter\Lastferry\public'
  57  |       e.isDirectory() ? walk(`${path}/${e.name}`) : [`${path}/${e.name}`],
  58  |     );
  59  |   const files = Object.fromEntries(
  60  |     [
  61  |       ...walk('src'),
  62  |       ...walk('data'),
  63  |       ...walk('public'),
  64  |       'package.json',
  65  |       'package-lock.json',
  66  |       'index.html',
  67  |       'vite.config.ts',
  68  |     ]
  69  |       .sort()
  70  |       .map((path) => [path, hash(readFileSync(path))]),
  71  |   );
  72  |   return {
  73  |     capturedAt: new Date().toISOString(),
  74  |     head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  75  |     status: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
  76  |     files,
  77  |     sha256: hash(JSON.stringify(files)),
  78  |     node: process.version,
  79  |   };
  80  | }
  81  | test.beforeAll(() => save('source-manifest', source()));
  82  | test.afterAll(() => save('source-after', source()));
  83  | 
  84  | async function holdingStart(page: Page) {
  85  |   await idle(page);
  86  |   expect(await state(page)).toMatchObject({
  87  |     turn: 0,
  88  |     tideLevel: 0,
  89  |     boatNodeId: 'stone',
  90  |     aboard: ['sheep-1'],
  91  |     delivered: [],
  92  |     status: 'playing',
  93  |     waitingByPier: { 'rabbit-pier': ['rabbit-1', 'rabbit-2'] },
  94  |   });
  95  |   const observed = await inspect(page);
  96  |   expect(observed.render.historyLength).toBe(0);
  97  |   expect(observed.story.timeline.scene).toBeNull();
  98  |   expect(JSON.parse((await checkpoint(page))!)).toMatchObject({
  99  |     checkpoint: { kind: 'cove', id: 'holding-pier' },
  100 |     acknowledgedScenes: ['opening'],
  101 |   });
  102 | }
  103 | async function settled(page: Page) {
  104 |   await expect.poll(async () => (await timeline(page)).settled, { timeout: 12000 }).toBe(true);
  105 |   await expect(page.locator('#story-caption')).toHaveCSS('opacity', '1');
  106 | }
  107 | async function geometry(page: Page) {
  108 |   return page.evaluate(() => {
  109 |     const dialog = document.getElementById('dialog')!,
  110 |       surface = dialog.getBoundingClientRect();
  111 |     const faults: string[] = [];
  112 |     const visible = (e: HTMLElement) =>
  113 |       e.getBoundingClientRect().width > 0 &&
  114 |       !e.closest('[hidden],.sr-only') &&
  115 |       getComputedStyle(e).visibility !== 'hidden';
  116 |     const nodes = [...dialog.querySelectorAll<HTMLElement>('*')].filter(visible);
  117 |     for (const e of nodes) {
  118 |       const style = getComputedStyle(e);
  119 |       if (e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1 && style.display !== 'inline')
  120 |         faults.push(
  121 |           `${e.id || e.className}: horizontal overflow ${e.scrollWidth}/${e.clientWidth}`,
  122 |         );
  123 |     }
  124 |     const controls = nodes
  125 |       .filter((e) => e.tagName === 'BUTTON')
  126 |       .map((e) => {
  127 |         const r = e.getBoundingClientRect();
  128 |         if (
  129 |           r.left < -0.5 ||
  130 |           r.top < -0.5 ||
  131 |           r.right > innerWidth + 0.5 ||
  132 |           r.bottom > innerHeight + 0.5
  133 |         )
  134 |           faults.push(`${e.id}: outside viewport`);
  135 |         if (r.width < 44 || r.height < 44) faults.push(`${e.id}: target below44`);
  136 |         return { id: e.id, rect: r.toJSON(), label: e.textContent };
  137 |       });
  138 |     const caption = document.getElementById('story-caption');
  139 |     const textRects = caption
  140 |       ? [...caption.childNodes]
  141 |           .filter((n) => n.nodeType === Node.TEXT_NODE)
  142 |           .flatMap((node) => {
  143 |             const range = document.createRange();
  144 |             range.selectNodeContents(node);
  145 |             return [...range.getClientRects()].map((r) => r.toJSON());
  146 |           })
  147 |       : [];
  148 |     for (const r of textRects)
  149 |       if (
  150 |         r.left < surface.left - 0.5 ||
  151 |         r.right > surface.right + 0.5 ||
  152 |         r.top < surface.top - 0.5 ||
  153 |         r.bottom > surface.bottom + 0.5
  154 |       )
  155 |         faults.push('caption fragment clipped');
  156 |     const canvas = document.getElementById('story-canvas')!;
```