# Last Ferry — Phone playability

## Disposition

**Ready for review with three timing-check failures retained.** Implementation and focused phone verification are complete. This pass implements `NEXT_TASK_PHONE_PLAYABILITY.md`. The larger Play view, complete Whole cove view, bounded pan, nearby previews and optional fullscreen are one coherent camera/interface change. No new Site publication is included.

## Source and scope

- Repository: [EDLMGit/Lastferry](https://github.com/EDLMGit/Lastferry), branch `m1-first-crossing`, [draft PR #1](https://github.com/EDLMGit/Lastferry/pull/1).
- Clean starting HEAD: `a93bed3897586fbfa66ed06e54ee2d9685c87be0`. Its newer publication documentation is preserved. Its runtime matches accepted/published `80545cbabb0496b215cd56f25cfc0113b056da67`.
- Evidence was generated from that starting HEAD **plus recorded working-tree changes**, not from a future commit. Per-execution manifests and the final tested patch identify those changes. Final145-file source hash: `31764a1ee974c9eb59b0f21cd8d91e1e8632a89efca5321421dcffa1a23764e4`. Runtime/capture hash: `0d6bf4dc2707ef88b9b1402fa51e2a7aa23581dc0fce8f60b4aea4f278d91b89`. Final17+4 gates use the same runtime/tests/build inputs; only the capture helper later adds Play-mode success screenshots and optional native-recording flags. [Source reuse](source-reuse.json), [final manifest](source-manifest.json).
- Baseline comparisons use an exact archive of starting HEAD, isolated at local5210; candidate dev5211 and fresh production4190. Nothing was reset to the older accepted SHA.
- Main remains `386de54d20fdd4a513a06115471d70bf94738cc0`; no merge or force push. PR #1 remains draft.
- Private Site remains **game `80545cb`**, Sites version8, hosting source `382b2d358ddf9fb1cac6cebb7905ae9f25f9fdc6`, [same private URL](https://last-ferry-playtest.abumech.chatgpt.site). This phone pass is a separate GitHub implementation awaiting ChatGPT review/publication.

## Selected behavior and visual decision

Normal phone **Play** uses a closer stable scale at the accepted isometric angle, favoring the ferry, aboard animals and local pier. It follows horizontal sailing progress rather than bobbing. Distant places remain recoverable through **Whole cove**, which fits the complete network, including during success. A water drag pans within useful cove bounds; **Back to boat** clears obsolete inspection and recovers a useful Play frame. View operations are free and do not enter rule or presentation-pose history. Undo returns to the restored ferry; Restart/cove change discard anchors.

Native comparison retained the closer scale and the stronger short-height floor (`usableHeight / 4.9`, compared with the smaller `/5.8` trial). The ferry dimensions below are projected model bounds at the same initial state, not invisible hitboxes. Essential action/preview text is16 CSSpx, new primary controls48px and map targets at least44px. The marker's visible symbol is28px. Both orientations use the actual visible viewport; no forced portrait minimum or compulsory sideways instruction remains.

| Ordinary viewport, DPR1 | Baseline ferry width × height, CSSpx | New Play width × height, CSSpx | Width ratio |
| --- | --- | --- | --- |
| 844×390 | 69.095×60.185 | 91.721×79.893 | 1.327× |
| 780×390 | 61.226×53.331 | 91.721×79.893 | 1.498× |
| 780×320 | 59.120×51.496 | 79.128×68.924 | 1.338× |
| 390×844 | 46.607×38.785 | 91.721×76.328 | 1.968× |
| 360×740 | 42.702×35.535 | 91.721×76.328 | 2.148× |

Action previews capture the actual initiating control rectangle. They flip locally and clamp to the measured safe screen; portrait uses a bottom sheet, short landscape a same-edge332px sheet. Transfer height is bounded and stable while subsets change, with internal scrolling and reachable Confirm/Cancel. Place/action headings and a leader retain association. Ordinary safe Sail still commits once from its local card. Inspection/cancel remain free. General dialogs use stable safe-bound placement. Fullscreen requests **`#app`**, containing scene, HUD, local actions and native dialog; actual `fullscreenchange` determines state.

One camera/layout revision reprojects scene picking, names, markers, docks, leaders, previews and water. Independent rendered-marker testing found and fixed a tide-height mismatch: projection now follows actual visual water height, with pending layout flushed after scene transforms and before rendering. No geometry traversal is added to pointer/frame layout. Label sizes are batch-read/cached with DOM rebuild, viewport/DPR and font invalidation; unchanged text/ARIA/viewport writes are guarded.

## Protected behavior

[Protected-source audit](protected-source-audit.json):42 files are byte-exact to both accepted `80545cb` and starting `a93bed3`, including puzzles/data/rules, routes, heading/pose history, wake, transfer/transition timing, accepted audio, water/shaders, lighthouse/homecoming models and dependencies/build configuration. `world.ts` differences are explicit view/layout integration; action/tide/transfer timing bodies agree after those listed exclusions. No new code comments were added.

## Environment and commands

Windows, Node24.15.0, npm11.12.1, Three0.186.1, Playwright1.64.1, Chromium156.0.8078.4 with SwiftShader WebGL2, DPR1. Phone contexts are touch-enabled mobile **emulation** using actual Playwright taps/CDP touch events, mouse and keyboard. Screenshots are native viewport pixels. Software rendering and synthetic viewport/cutout tests do not establish physical Android performance or browser-bar behavior.

Reproduce with Node24:

```sh
npm ci
npm run dev
```

Production: `npm run build`, then `npm run preview`. Focused checks: `npm run typecheck`, `npm run test:unit -- --maxWorkers=1`, and `npx playwright test tests/e2e/phone-playability.spec.ts`. Browser installation/port/environment details and exact additional filtered commands are in the evidence command index.

## Executed checks

| Check | Actual result and evidence |
| --- | --- |
| Production build and TypeScript | **PASS**, fresh final runtime. `npm run build` includes `tsc --noEmit`;47 modules; JS749.99kB/200.15gzip, CSS15.20kB/3.72gzip. Existing500kB chunk advisory remains. [Final gate transcription](final-gates.json). |
| Complete unit suite | **PASS188/188**,27 files, one worker,10.48s. Includes15 new placement/pan/viewport/view checks. Original default-worker five timeouts retained, with unchanged test thresholds. |
| Final phone browser suite | **PASS17/17 in one completed final-runtime run**,4.3min. [Output](browser-cache-final/results.txt), [structured result](browser-cache-final/automation-results.json), [source](browser-cache-final/source-manifest.json). |
| Affected preservation/timing cases | **1 passed, 3 failed** in the final four-case execution. Victory mix/arrival persistence passes. Delivered-frame heading step1.425683rad exceeds0.85 over99.9ms; trusted-input sequences230.2/377.6ms exceed the180ms exercise window. All thresholds remain unchanged. These three checks are **failed**, not verified under-window behavior. [Exact output](browser-cache-timing/results.txt), [heading frames](browser-cache-timing/direction-lifecycle.json), [input records](browser-cache-timing/consecutive-sail-regression.json). |
| Other preserved lifecycle checks | Seven cases passed on pre-cache runtime: homecoming Settings/recovery, fresh production, settlement/released crests and transfer audio. The bounded final change caches label dimensions/guards unchanged UI writes only; protected behavior stays byte-exact. Explicit source-reuse audit records differences. |
| Native visual comparison and moving evidence | **PASS**: all five matched native ordinary/preview pairs; completed uninterrupted short interaction sequence; actual14-action phone Bellwater rescue and additional9-action Holding Play-success captures at844×390,390×844 and780×320. Runtime unchanged, no captured page errors. [Capture assertions](final-capture/capture.json). |
| Full legacy browser suite | **NOT RUN.** Intentional full-network contracts now use Whole cove; focused current UI paths are exercised. Historical unrelated selectors/expectations are not claimed verified. |
| Physical Android, other engines, native GPU, new acoustic listening | **NOT RUN**; no corresponding hardware/listening result. |

The focused coverage includes actual complete Holding rescues in landscape and portrait, subset warning and both-safe boarding, tide Undo and terminal Undo/redelivery, Bellwater outer travel and First Crossing smoke, normal Tab/Shift+Tab/Enter/Escape, current-location selection, touch drag ending on a real live target, second-pointer/cancel recovery, free pan/inspection, camera/marker/picking alignment, rotation with selected place/open subset/during sailing, Reduced, safe insets/VisualViewport offsets and desktop1440×900. Fullscreen actual API entry/exit/external exit is separate from explicitly mocked rejection/unavailable tests. Puzzle state, subset and Settings survive the exercised lifecycle paths.

[Verification history](VERIFICATION_HISTORY.md) retains every original failure, fix and affected rerun. In particular, the old heading/input timing thresholds did fail before the final cache change. Planner equality cannot replace a delivered-frame smoothness check. No all-green historical or single combined-run claim is made.

## Performance observation

A quiet diagnostic found repeated synchronous Play layout work:379layouts,31.605ms aggregate layout time. Batching/caching label dimensions and guarding unchanged writes reduced that to83layouts/12.592ms. The final same-run baseline has47layouts/14.307ms; Overview23/4.115ms. All three end at the same authoritative state,326geometries/6textures/17programs; active wake adds one draw.

Final matched active frame median/p95/max: baseline49.9/83.3/133.3ms, Play50/100/150ms, Overview49.9/83.3/133.5ms. The extra repeated-layout cost is addressed; the one-sample software-frame distributions remain variable and Play's p95 is one display interval higher. This is not a native-GPU or device-FPS claim. [Original diagnostic](performance/comparison.json), [final cached comparison](performance-cached/comparison.json), each with its exact helper/source provenance.

## Evidence, remaining limits and next action

[Comparison and selected evidence](COMPARISON.md) · [Exact commands](COMMANDS.md) · [Native inspection](native-inspection-root.json) · [Accessible natural-size gameplay](phone-journey.webp).

- Start: [844×390 Play](final-capture/holding-844x390-play.png), [780×320 Play](final-capture/holding-780x320-play.png), [390×844 Play](final-capture/holding-390x844-play.png).
- Nearby preview: [short landscape](final-capture/holding-780x320-unload-preview.png), [portrait](final-capture/holding-390x844-unload-preview.png).
- [Critical rabbit boarding](browser-cache-final/rescue-844x390-critical-boarding.png), [after the rise](browser-cache-final/rescue-844x390-after-rise.png), [portrait Play success](final-capture/holding-won-play-390x844.png).
- [Whole cove](browser-cache-final/layout-844x390-overview.png), [actual fullscreen with retained subset](browser-cache-final/fullscreen-actual-external-exit-preview.png), [independent rendered anchors](marker-water-anchor-final.json).

The ordinary-browser recording is13.64s,25fps VP9 on an844×390 surface, silent and fully decoded. Its initial fitted-frame screencast startup is omitted from the native excerpt. The committed12.132s animated WebP trims only the first1.5s screencast startup and preserves natural timing at15fps and covers free selection/subset, Whole cove/Back, bounded pan, crossings, tide boarding and Undo; it ends after tide Undo rather than at Harbor success. Fullscreen/rotation are separately evidenced by actual API checks/stills and the retained fitted original recording. Local full original: `reviews/phone-playability/native-sequence/raw/phone-uninterrupted.webm`; it is ignored and unavailable in a clone.

Native screenshots were inspected at original size for the stated viewports. Concept art is not gameplay evidence. Animated excerpts are actual whole-interface gameplay at natural timing; any trimming/decimation is documented. Full uninterrupted originals remain local/ignored and are unavailable in a clone unless separately supplied. [Media validation](MEDIA.json) records actual durations, hashes and decode results. [Selected files](selected-evidence.json) retain31 native PNGs and one animated WebP;323 unselected original images are preserved intact under ignored archives identified by the [archive map](archive-map.json).

In narrow portrait, the deliberate bottom sheet covers part of the local ferry while choosing passengers; the pier/name association and full action footer remain visible, and the full ferry returns when the preview closes or commits. It is a bounded fallback tradeoff, not a claim that every subject stays unobscured beneath an open modal.

Headless Chromium permits actual fullscreen entry and exit but refuses Playwright viewport resizing while fullscreen. The original combined recording also changes its fitted capture surface after fullscreen; it is retained and labeled. A separate ordinary-browser native844×390 sequence supplies the accessible moving excerpt. The capture therefore exits fullscreen before emulated rotation; a physical fullscreen-plus-orientation change remains unverified. Synthetic VisualViewport/cutout coverage is labeled separately. Background/mute/recovery checks verify state and routing, not a new listening judgment. The three final timing failures remain open verification limitations. The heading planner/stop timing is protected and agrees with recorded samples; this does not establish the delivered-frame smoothness threshold. The final input driver missed its required180ms window, so that window remains unverified on this runtime. No physical-device smoothness or responsiveness claim follows from the other passing cases.

Further features and puzzles stay queued. Next action is ChatGPT review of the new GitHub SHA, then publication to the same private Site if accepted. A GitHub push does not deploy it.

## Packaging

The staged package matches all145 tested source entries:140 byte-exact and five CRLF-to-LF normalization only. All31 selected PNGs and the animation match their capture hashes byte-for-byte (6,379,462bytes). No dependencies, build outputs, test-results directories, raw folders or videos are staged. [Packaging audit](packaging-audit.json), [tested source patch](tested-source.patch).

For reviewable diffs,74 large JSON evidence files remove formatting whitespace only; every token, numeric spelling, escaped string and data value is retained. Original pretty-printed files remain intact under ignored archives, with original/derived hashes in the [compaction record](json-compaction.json). Failure logs and source manifests are unchanged.
