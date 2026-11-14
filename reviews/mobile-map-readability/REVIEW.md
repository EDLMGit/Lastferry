# Read the cove on a phone

MOBILE_MAP_READABILITY_01 started from a clean fast-forward to `3891ec0ad97a854f267f42d8b1ee6f3e2da9982b`. The comparison runtime is `1b7b4f05e576614f061ca4949bf5aca705dc5e0e`, published as private Site version 18. The original Android images measure 1536×716 bitmap pixels. Their CSS viewport, DPR and exact action history are unknown. [Player images and research](../../docs/MOBILE_MAP_READABILITY_RESEARCH.md) · [Publication receipt](../journey-six-coves/deployment-confirmation.json)

## Matched play

The comparisons use actual controls and the same level, witness prefix, camera mode, CSS viewport and DPR on each side. PC Chromium emulates touch at DPR 1.

| Composition | Published runtime | Repaired runtime |
| --- | --- | --- |
| Two Shelters, turn 3, 844×390 Play. The beavers wait at High Refuge and the empty ferry reaches Mica at Reed Pier. | [Before](before/reed-pier.png) | [After](after/reed-pier.png) |
| Wide Berth, turn 0, 780×320 Whole cove. Four neighbors wait at the northern landing. | [Before](before/wide-whole.png) | [After](after/wide-whole.png) |
| Wide Berth, turn 5, 844×390 Play. Alder is delivered at Harbor, three neighbors wait at High Quay and Beacon Reef flows back toward the quay. | [Before](before/harbor-quay.png) | [After](after/harbor-quay.png) |
| Reef Return, turn 8, 390×844 Play. | [Before](before/reef-loaded.png) | [After](after/reef-loaded.png) |

At Harbor, the baseline High Quay label sat across the ferry and current. The repaired label is beside High Quay’s actual landing. Harbor has its own lighthouse marker and the current arrows occupy the passage between them. In Wide Whole cove, Board moved from the central quay to the northern ferry, with “At Wide Berth” immediately above it. Reed Pier keeps Board Mica next to the boat while both beavers and High Refuge’s roof fit in the frame. In loaded Reef portrait, Wrack Pier and Shell Pool can both be identified from Cairn Quay. The animals occupy fewer pixels in this wider frame. Zoom lets the player move closer.

The reconstructed Harbor view’s longest marker-center to name-box distance fell from about 476 CSS pixels to 15. Wide Whole cove grew from 18.53 to 21.02 CSS pixels per world unit and retained all five targets. At Reed Pier, normal scale went from 44 to 33.20, bringing both occupied shores into view.

## Interaction

Names have a few possible positions beside their own endpoint. Each name keeps its anchor where it still fits. Routes and directional chevrons remain on their canonical curves. Free selection supplies the full destination name, and the crossing-status panel lists every stop. Passenger controls name their current landing. The Sail button names its destination. When the local space is occupied, the action group docks to a screen edge and retains that identity.

Play uses the ferry, its landing, neighboring passages and the real corner controls to compose the view. Whole cove fits the graph. Zoom adjusts scale, and Back to boat restores automatic framing. A simultaneous reef change and occupied-pier flood share one visible countdown. The forecast gives the full direction, schedule and depth.

## Verification and original failures

The production build and TypeScript passed on Node 24.15.0. All 102 focused unit tests passed in 16 files. Asset validation passed with all 79 existing IDs. Four interface families gained updated usage, provenance and evidence. [Build](build.txt) · [Unit run](units.txt) · [Inventory validation](assets.txt)

The first camera run passed 12 of 27 tests. Its fixtures expected the removed close-up ratio and omitted the geometry the shared solver now uses. Replacements check actual visible subjects and corners. A synthetic overlap test and the first Reed Play image caught a clipped neighboring landing. The camera now considers its shore geometry. The first scale sweep reproduced a further defect where Zoom out could keep or even enlarge the current scale. Enabled zoom stops now progress in the requested direction. All 28 cove/viewport sweeps passed across 844×390, 780×320, 390×844 and 360×740. The sweeps use actual DOM handlers and camera projection. The recording exercises touch on the controls. [Camera iterations and original log](iterations/camera-rehearsals.md) · [Scale measurements](scale-sweep.txt)

The first composition run was 4/5 and the first rescue rehearsal was 0/2. Source changes and development reload invalidated those runs. On a stable server, the first Two Shelters rescue exposed the zoom defect and the Wide rescue passed. After the scale correction a seven-case batch passed 6/7. Driftwood’s Harbor ring was visible at 780×320 but its name was missing. The original right-hand slot intersected the hull by about five pixels. A vertically aligned local slot allows the full name beside the same ring. [First compositions](first-composition.txt) · [First rescues](first-rescues.txt) · [Zoom failure](stable-rescue-trial.txt) · [Original Driftwood frame](iterations/driftwood-harbor-unnamed.png)

The built production game passed three lifecycle cases. At 360×740, each Wide Berth stop was inspected from the free index, with Tab, Enter and Escape returning focus to the original map marker. A real fullscreen request entered the app root. Its passenger subset survived external exit and rotation to 390×844. A two-finger release over the direct Let Moss ashore button spent zero actions. These cases also verified the original Journey bytes, remembered mute, Reduced Motion and default Tips Off. [Production results](production-lifecycle.txt) · [Corrected Driftwood frame](after/driftwood-harbor.png) · [Earlier 6/7 run](iterations/driftwood-sweep-run.txt)

The final map browser batch passed 7/7. It reproduced all four comparison states. Across both browser suites, all seven Practice entries were exercised, including First Crossing and desktop mouse input at 1440×900. The sweep opened the visible Overview targets and their route facts without spending an action. Two Shelters completed the 12-action mixed retrieval, including a passenger subset, a tide Undo and terminal Undo. Wide Berth also completed in 12 actions, undid the reef reversal and then replayed it. The two rescues preserved the stored Journey bytes. [Map run](final-map-browser.txt) · [Free inspection sweep](checks/overview-sweep.json) · [Two Shelters rescue](interaction/shelters.json) · [Wide Berth rescue](checks/wide-rescue.json)

The uninterrupted Two Shelters recording shows a two-finger release, pan, tap-based scale adjustment, free inspection, Sail, a landscape-to-portrait resize, Back to boat and the full rescue. The first recording ended on the finishing-action message even though the browser had verified the win. A separate 1/1 rerun held the visible result for capture. Its final frame reads “Everyone home” with three passengers safe in 12 actions. The selected film retains 61 landscape and 251 portrait frames at their native pixel sizes on an 844×844 matte. They cover 49.55 seconds, with stereo runtime audio bringing playback to 50.30 seconds. Both tracks passed full decode. The longest captured frame interval was 0.70 seconds. [Play the interaction and rescue](interaction/shelters-interaction.mp4) · [Visible win](interaction/won-portrait.png) · [Encoding](interaction/shelters-interaction-encoding.json) · [Final capture check](terminal-film.txt) · [First recording record](iterations/first-final-film-encoding.json)

The final capture environment was Windows, Node 24.15.0 and Chromium 156.0.8078.4 with SwiftShader. The accepted before captures came from an isolated Git archive. All 129 archived runtime inputs matched the published Git contents, including 24 with only Windows line-ending differences. The after captures use the task commit plus the working-tree manifest `749b9e0c1197cf1a8a622572821956c5e0c5d11e71da1f868f76770de605a361`. Per-frame JSON gives the viewport, state, framing and measurements. [Baseline source](before/source.json) · [After source](source/749b9e0c1197cf1a8a622572821956c5e0c5d11e71da1f868f76770de605a361.json) · [Committed source, build and media audit](MEDIA.json)

Of the 100 after-capture inputs, 96 matched the staged Git contents byte for byte and four matched after newline normalization. The full `data/` tree matches the published game, including the puzzle witnesses. The original art, route paths, reef behavior, audio, story and version 18 publication receipt were retained.

## Reproduction

Use Node 24. From the repository root run `npm ci` and `npm run dev -- --port 5270`. Open the [Journey](http://127.0.0.1:5270/), [Two Shelters](http://127.0.0.1:5270/?cove=two-shelters) or [Wide Berth](http://127.0.0.1:5270/?cove=wide-berth).

The focused unit command is recorded in the unit log. With Playwright Chromium installed, use a separate evidence directory when repeating the map checks.

```powershell
npm run build
npm run check:assets
$env:LAST_FERRY_REVIEW_DIR = 'test-results/mobile-map-rerun'
$env:LAST_FERRY_MAP_RECORD = '1'
npm run test:e2e -- mobile-map.spec.ts mobile-map-lifecycle.spec.ts --workers=1
```

The seven map cases use development inspection alongside real controls. The separate three-case production run used the built app on port 5308 and public controls. The earlier six-cove save and story evidence is retained. The full historical browser and audio suites were outside this pass. Physical Android readability, device performance, spoken screen-reader output and speaker listening await the next comparison. The private Site still serves version 18.
