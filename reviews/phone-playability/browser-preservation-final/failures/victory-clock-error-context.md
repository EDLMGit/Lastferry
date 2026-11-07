# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: victory-mix.spec.ts >> victory mix: visible final arrival, persistent ending, Undo/redelivery and next cove
- Location: tests\e2e\victory-mix.spec.ts:144:1

# Error details

```
Error: expect(received).toBeCloseTo(expected, precision)

Expected: 18.421333333333333
Received: 18.429333333333332

Expected precision:    2
Expected difference: < 0.005
Received difference:   0.007999999999999119
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - main [ref=e3]:
    - region "The Holding Pier" [ref=e4]:
      - generic "The Holding Pier. Use the labeled waypoint controls to navigate." [ref=e6]
      - generic [ref=e7]:
        - generic [ref=e8]:
          - heading "The Holding Pier" [level=1] [ref=e9]
          - paragraph [ref=e10]: Bring all three passengers to Harbor
        - generic "Crossing progress" [ref=e11]:
          - strong [ref=e12]: Depth 1 · 0/4 spaces
          - generic [ref=e13]: 09 actions · Tide 2 · Home 3/3
        - navigation "Crossing controls" [ref=e14]:
          - button "↶ Undo" [ref=e15] [cursor=pointer]
          - button "Wait · 1 action" [disabled] [ref=e16]
          - button "Menu" [ref=e17] [cursor=pointer]
          - button "Mute sound" [ref=e18] [cursor=pointer]: ♫
      - navigation "Cove view" [ref=e19]:
        - button "Whole cove" [ref=e20] [cursor=pointer]
    - status [ref=e21]: 9 actions completed. Everyone is safely home.
  - dialog [ref=e22]:
    - generic [ref=e23]:
      - banner [ref=e24]:
        - heading "Everyone home." [level=2] [ref=e26]
        - button "Close dialog" [ref=e27] [cursor=pointer]: ×
      - paragraph [ref=e29]: 3 passengers safe at Harbor · 9 actions.
      - contentinfo [ref=e30]:
        - button "Next cove" [active] [ref=e31] [cursor=pointer]
        - button "Settings" [ref=e32] [cursor=pointer]
        - button "↶ Undo last action" [ref=e33] [cursor=pointer]
        - button "Restart" [ref=e34] [cursor=pointer]
```

# Test source

```ts
  98  |     failure: string | null = null;
  99  |   page.on('pageerror', (error) => errors.push(error.message));
  100 |   const snap = async (label: string) => {
  101 |     const value = await observation(page, label);
  102 |     snapshots.push(value);
  103 |     return value;
  104 |   };
  105 |   try {
  106 |     await run(snap);
  107 |     expect(errors).toEqual([]);
  108 |     outcome = 'passed';
  109 |   } catch (error) {
  110 |     outcome = 'failed';
  111 |     failure = error instanceof Error ? error.message : String(error);
  112 |     throw error;
  113 |   } finally {
  114 |     const environment = await page.evaluate(() => ({
  115 |       userAgent: navigator.userAgent,
  116 |       viewport: { width: innerWidth, height: innerHeight },
  117 |       devicePixelRatio,
  118 |       reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  119 |     }));
  120 |     const commits = await page.evaluate(() => (window as any).__victoryCommits ?? []);
  121 |     mkdirSync(reviewDir, { recursive: true });
  122 |     writeFileSync(
  123 |       `${reviewDir}/${name}.json`,
  124 |       JSON.stringify(
  125 |         {
  126 |           startedAt,
  127 |           finishedAt: new Date().toISOString(),
  128 |           outcome,
  129 |           failure,
  130 |           environment,
  131 |           errors,
  132 |           snapshots,
  133 |           commits,
  134 |           listening:
  135 |             'Not performed; runtime assertions establish timing and ownership, not perceived sound quality.',
  136 |         },
  137 |         null,
  138 |         2,
  139 |       ),
  140 |     );
  141 |   }
  142 | }
  143 | 
  144 | test('victory mix: visible final arrival, persistent ending, Undo/redelivery and next cove', async ({
  145 |   page,
  146 | }) => {
  147 |   test.setTimeout(180000);
  148 |   await page.setViewportSize({ width: 844, height: 390 });
  149 |   await ready(page, 'holding-pier');
  150 |   await observeCommits(page);
  151 |   await observed(page, 'visible-arrival-lifecycle', async (snap) => {
  152 |     await atHarbor(page, true);
  153 |     const before = await snap('harbor-before-delivery');
  154 |     expect(before.audio).toMatchObject({
  155 |       arrivalEventCount: 0,
  156 |       deliveryCount: 0,
  157 |       victoryTarget: 1,
  158 |       victorySettled: false,
  159 |     });
  160 |     await activate(page, 'unload');
  161 |     await activate(page, 'passenger-rabbit-1');
  162 |     await activate(page, 'passenger-rabbit-2');
  163 |     await activate(page, 'commit');
  164 |     await idle(page);
  165 |     const partial = await snap('partial-delivery-no-victory');
  166 |     expect(partial.state).toMatchObject({ status: 'playing', delivered: ['sheep-1'] });
  167 |     expect(partial.audio).toMatchObject({
  168 |       arrivalEventCount: 0,
  169 |       deliveryCount: 0,
  170 |       victoryTarget: 1,
  171 |       victorySettled: false,
  172 |     });
  173 |     await undo(page);
  174 |     expect(await state(page)).toEqual(before.state);
  175 |     await activate(page, 'unload');
  176 |     await activate(page, 'commit');
  177 |     await idle(page);
  178 |     const arrival = await snap('visible-arrival');
  179 |     const commit = await page.evaluate(() => (window as any).__victoryCommits.at(-1));
  180 |     expect(commit.state.status).toBe('won');
  181 |     expect(commit.transition.active).not.toBeNull();
  182 |     expect(commit.audio).toMatchObject({
  183 |       arrivalEventCount: 0,
  184 |       deliveryCount: 0,
  185 |       pendingTerminal: true,
  186 |       victoryTarget: 1,
  187 |       victorySettled: false,
  188 |     });
  189 |     expect(arrival.state).toMatchObject({ turn: 9, status: 'won' });
  190 |     expect(arrival.audio).toMatchObject({
  191 |       arrivalEventCount: 1,
  192 |       deliveryCount: 1,
  193 |       arrivalVoicesPlayed: 3,
  194 |       arrivalVoicesSkipped: 0,
  195 |       victoryTarget: 0.5,
  196 |       victorySettled: true,
  197 |     });
> 198 |     expect(arrival.audio.lastVictoryMixChange.time).toBeCloseTo(arrival.audio.lastArrival.time, 2);
      |                                                     ^ Error: expect(received).toBeCloseTo(expected, precision)
  199 |     await mix(page, 0.5, 0.62);
  200 |     await page.waitForFunction(
  201 |       () => {
  202 |         const value = (window as any).__LAST_FERRY__.getAudioStatus();
  203 |         return value.currentTime - value.lastArrival.time >= 10;
  204 |       },
  205 |       undefined,
  206 |       { timeout: 15000 },
  207 |     );
  208 |     const settled = await snap('ten-seconds-after-arrival-with-success-open');
  209 |     expect(settled.audio).toMatchObject({
  210 |       arrivalSources: 0,
  211 |       arrivalActive: false,
  212 |       deliveryCount: 1,
  213 |       victoryTarget: 0.5,
  214 |       victorySettled: true,
  215 |     });
  216 |     await expect(page.locator('#dialog')).toBeVisible();
  217 |     await page.keyboard.press('Escape');
  218 |     await expect(page.locator('#dialog')).toBeHidden();
  219 |     await mix(page, 0.5, 0.62);
  220 |     await activate(page, 'menu');
  221 |     await expect(page.locator('#dialog-title')).toHaveText('Crossing menu');
  222 |     await page.waitForTimeout(900);
  223 |     await mix(page, 0.5, 0.62);
  224 |     await snap('menu-retains-ending');
  225 |     await page.keyboard.press('Escape');
  226 |     await undo(page);
  227 |     expect(await state(page)).toEqual(before.state);
  228 |     await mix(page, 1, 0.72);
  229 |     const undone = await snap('terminal-undo-restored');
  230 |     expect(undone.audio).toMatchObject({
  231 |       arrivalSources: 0,
  232 |       arrivalActive: false,
  233 |       deliveryCount: 1,
  234 |       arrivalEventCount: 1,
  235 |     });
  236 |     await act(page, 'unload');
  237 |     await mix(page, 0.5, 0.62);
  238 |     const redelivered = await snap('redelivery-fresh-duck');
  239 |     expect(redelivered.audio).toMatchObject({
  240 |       deliveryCount: 2,
  241 |       arrivalEventCount: 2,
  242 |       victoryTarget: 0.5,
  243 |     });
  244 |     await undo(page);
  245 |     await act(page, 'unload');
  246 |     await mix(page, 0.5, 0.62);
  247 |     const rapid = await snap('rapid-undo-redelivery-no-accumulation');
  248 |     expect(rapid.audio).toMatchObject({
  249 |       deliveryCount: 3,
  250 |       arrivalEventCount: 3,
  251 |       victoryTarget: 0.5,
  252 |       contextCount: 1,
  253 |       schedulerCount: 1,
  254 |       droppedTones: 0,
  255 |     });
  256 |     expect(rapid.audio.peakOwnedSources).toBeLessThanOrEqual(29);
  257 |     await activate(page, 'next-cove');
  258 |     await page.waitForURL('**/?cove=bellwater');
  259 |     await page.waitForFunction(
  260 |       () => ((window as any).__LAST_FERRY__?.getMetrics().frames ?? 0) > 4,
  261 |     );
  262 |     expect(await state(page)).toMatchObject({ turn: 0, status: 'playing' });
  263 |     expect(await audio(page)).toMatchObject({
  264 |       arrivalEventCount: 0,
  265 |       deliveryCount: 0,
  266 |       victoryTarget: 1,
  267 |       victorySettled: false,
  268 |       arrangementTarget: 0.72,
  269 |     });
  270 |     await snap('next-cove-clears-ending');
  271 |   });
  272 | });
  273 | 
  274 | test('victory mix: finish muted before lazy graph, activate ending, mute recovery and Restart', async ({
  275 |   page,
  276 | }) => {
  277 |   test.setTimeout(120000);
  278 |   await page.setViewportSize({ width: 844, height: 390 });
  279 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  280 |   await page.addInitScript(() => localStorage.setItem('last-ferry-muted', 'true'));
  281 |   await ready(page, 'holding-pier');
  282 |   await observeCommits(page);
  283 |   await observed(page, 'muted-lazy-recovery', async (snap) => {
  284 |     await atHarbor(page);
  285 |     expect(await audio(page)).toMatchObject({
  286 |       muted: true,
  287 |       contextCount: 0,
  288 |       contextState: 'not-created',
  289 |     });
  290 |     await act(page, 'unload');
  291 |     const mutedWin = await snap('finished-muted-without-graph');
  292 |     expect(mutedWin.state.status).toBe('won');
  293 |     expect(mutedWin.audio).toMatchObject({
  294 |       arrivalEventCount: 1,
  295 |       deliveryCount: 0,
  296 |       arrivalVoicesPlayed: 0,
  297 |       contextCount: 0,
  298 |       contextState: 'not-created',
```