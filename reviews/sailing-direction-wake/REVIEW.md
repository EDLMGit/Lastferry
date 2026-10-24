# Last Ferry review — Sailing direction and released crests

## Disposition

**Ready for focused review.** Implementation and required local verification are complete. This corrects the functionally verified but visually unaccepted water-motion pass. Contributor visual inspection is documented; user acceptance and publication remain separate decisions.

## Source and scope

- Repository: [EDLMGit/Lastferry](https://github.com/EDLMGit/Lastferry), branch `m1-first-crossing`, [draft PR #1](https://github.com/EDLMGit/Lastferry/pull/1).
- Comparison and starting HEAD: **`8b874adccfc1d65af569b81fade548f0368645b0`**, explicitly requested by the task. Checkout was clean; no newer/unrelated work was present. An isolated exact Git archive preserved the baseline during implementation.
- Active scope: `NEXT_TASK_SAILING_DIRECTION_AND_WAKE.md`. Earlier task files are historical. No puzzle, route-centerline, sailing-budget, interface, music or global-water change.
- Evidence belongs to that HEAD plus identified working changes. Per-run source manifests record hashes and commands, including the exact helper version. Final Git identity is separate from capture time; see the source/packaging audit and PR handoff.
- Final runtime/data/build-input hash: **`5ce456eb46c08fa3b368e3799768cb93f578794126797aa7b56f050bd05eb3b6`**. Final136-file source hash: **`2a42444983d3910e314137f0ca3f3d962082d8af527bc4f894b06270721fc84e`**. [Reuse audit](source-reuse.json) compares build/unit snapshot `4c4885…`, browser snapshot `e581d4…` and final packaging: only the new e2e fixture/observation method, capture input-label text and safe benchmark setup changed. Runtime, build and unit inputs are identical; fresh final TypeScript checking passes.
- [Protected-source audit](protected-source-audit.json):40 protected files remain byte-exact, including rules/data/routes, timing, UI/CSS, audio, water shader/fields and accepted lighthouse/homecoming effects. There is no dependency or global-renderer change.
- Main started at `386de54d20fdd4a513a06115471d70bf94738cc0`; no merge or force-push is authorized.

## Confirmed causes and chosen correction

The old sampler blended back to its starting angle near every destination, and `World.sync()` independently assigned π/2. Fixing just one would leave the other reset. The new plan has independent starting and final headings, sampled deterministically with an exact endpoint. Free-water nodes use the final tangent. Actual pier relationships derive the safe broadside axis from the shaft; the closer opposite berth is selected against the incoming course.

Angles remain unwrapped; exact reversals use a deterministic shortest-turn tie. Free-water steering takes at most22% of the unchanged movement budget before the established travel easing. Pier departure holds broadside until clear, backing where necessary, then turns; arrival makes only the required berth alignment. Full modeled ferry clearance checks use the production plan, reachable starting headings and both berth variants, rather than checking only the centerline.

A presentation history is updated alongside accepted transactions, successful Undo and Restart. The target exists before animation construction. Nonmoves retain heading; normal completion, hidden settlement, device Reduced, timeout and animation error all synchronize to that same target. Inspection/invalid actions create no history entry. Undo restores the corresponding pre-action heading and clears water transients.

Both ferry sides have a usable deck opening. Transfers pass through a forward entry and interior point, turn before crossing the rail, and end at their actual deck anchors. Pip's anchor moves slightly forward to clear the cabin. The first candidate's center-only check missed Moss's cabin intersection; modeled-vertex inspection prompted this fix. Transfer duration, draft/tide phase, wooden contact marks and passenger conservation remain unchanged.

The historical trail already had world-space samples; the rejected live bow crescent and stern ellipse did not. The correction removes those ornaments and paired lateral crest bands. Each open crest stores release pose, displacement direction, time, strength and stable variation. Its own age then controls spreading, relaxation, drift and fade. Later boat translation or yaw cannot drag it. Backing uses actual displacement direction; pure yaw, tide, draft and bobbing emit nothing.

The fixed pool holds at most12 events for1800ms, with12 sections each: one mesh,864 maximum vertices and24,192 attribute bytes. No per-event mesh, texture, material or animation loop. It borrows the accepted coast mask, follows current water height, keeps depth testing/depth-write policy and stays outside picking/framing. Normal completion simply ends emission; residual events finish after controls unlock. There is no peak-strength docking restart. New journeys retain older independent events without connectors; Undo/reset/hide/recovery/Reduced clear them.

The first phone trial produced a comb of too many similar arcs on Bellwater. The selected comparison reduces emission density, varies spacing and broadens the soft ribbon. Finite fade and actual world-space release are distinct: disappearance alone would not establish independence. The traceable-crest evidence follows immutable release data and visible evolution through the next boat turn.

## Environment and executed checks

Windows; Node24.15.0, npm11.12.1, Three0.186.1, Playwright1.64.1, Chromium156.0.8078.4, SwiftShader WebGL2, DPR1. Desktop1440×900; emulated-touch844×390 and780×390;780×320 ending/layout smoke. No physical Android or native-GPU claim. Baseline dev5205, candidate dev5206; final production port and exact commands are retained with execution results.

Phone behavioral tests use actual Playwright taps in touch emulation. Natural capture sequences use mouse clicks in a touch-enabled mobile context; [input clarification](capture-input-correction.json) corrects the older ambiguous metadata label without relabeling the actions as taps. Production was served on4189 from the fresh bundle.

Exact executed commands, environment overrides and each affected rerun are recorded in [COMMANDS.md](COMMANDS.md). Install/run with Node24:

```sh
npm ci
npm run dev
```

Production: `npm run build`, then `npm run preview`. Browser cache for this checkout: `PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright`. Capture command example:

```sh
node tools/capture-sailing-direction-wake.mjs --base=http://127.0.0.1:5206 --phase=after --width=844 --height=390 --rest=250 --stills=false
```

| Check | Result | Evidence / limit |
| --- | --- | --- |
| `npm run build` including TypeScript | Pass | Final runtime bundle `index-CCbqiVfU.js`,734.18kB raw/195.90kB gzip; existing500kB advisory. [Output](build-results.txt). |
| `npm run typecheck` after test corrections | Pass | [Final output](typecheck-final-results.txt). |
| `npm run test:unit` | Pass173/173,24files | [Output](unit-results.txt). Production heading/whole-ferry clearance, pose Undo, both-side transfer volumes, released-crests and existing rules/audio/homecoming checks. |
| Focused browser checks | Pass23 distinct cases |20/20 existing cases passed in7.7minutes; three new cases pass across affected reruns. Complete9-action Holding rescue, relevant Bellwater travel both ways, First Crossing, all four viewport sizes, keyboard/touch, both berths and transfer/tide/terminal Undo. [Regression output](browser-final/results.txt). |
| Settlement and release contracts | Pass |Normal, hidden, device Reduced, actual timeout and injected animation errors before/after transition construction agree on the intended pose and one completion. A released crest survives the next turn independently; finite fade/cleanup and immediate follow-up remain. [Settlement result](browser-focused-rerun/direction-settlements.json), [crest result](browser-crest-rerun/results.txt). |
| Accepted homecoming/audio/production | Pass |Eight homecoming, two transfer-audio, three victory-mix and fresh production UI rescue cases are included in the20. Source remains protected; these are lifecycle checks, not new acoustic listening. |
| Natural moving comparisons | Pass capture assertions |Six final full-interface originals at1440×900,844×390 and780×390 complete Holding9/Bellwater14 actions, unchanged runtime source and no page errors. Retain fewer, broader crests. [Comparison](COMPARISON.md), [phone inspection](wave-native-inspection.json) and native short-phone ending coverage. |
| Matched warmed performance/resources | Pass comparison |844×390/DPR1, no video/dense geometry sampling: baseline/candidate idle median33.4/33.3ms,p9550.0/50.1ms; active median33.4/33.3ms,p9566.7ms both. Both return to624draws/326geometries/6textures/17programs; active wake adds one draw. [Results](performance/comparison.json). No demonstrated new regression or hardware speed claim. |
| Physical Android, other engines, native GPU, listening | Not run | Accepted sound source/timing remains protected; lifecycle checks do not constitute listening. |

## Evidence and original failures

Uninterrupted natural-speed originals remain local/ignored. [Selected media](selected-media.json) identifies four committed native844×390 WebP excerpts at15fps with natural timing: matched before/after free-water arrival/rest/onward, buoy reversal and actual Stone approach/boarding/departure. Their durations are about5.0/5.0/6.53/5.53seconds; frame deduplication retains playback timing. Sixteen native PNGs show100ms stop/next-turn intervals. [Matched rest states](matched-rest-states.json) verifies three exact game-state pairs and numerically equal stable cameras. Water phase is not frozen. No concept art substitutes for gameplay.

The [released-crest proof](browser-crest-rerun/released-crest.json) follows event5 from age0.179 to0.466 while boat yaw changes0.507→1.113radians. Birth position/direction/time/strength/seed/segment stay equal while width and world center evolve. The later tide observation contains two real events/144 vertices at waterY0.04046; water-height checking is not an empty-array result. This instrumented proof is separate from the natural moving captures.

The baseline capture's initial Bellwater route delayed the sheep beyond its deadline; this was a capture-fixture error, not a rules defect. The corrected actual UI route rescues all passengers before testing both outer directions. Original failure/source artifacts remain under `baseline-initial/`.

Development TypeScript failures from tests being migrated, and the negative-zero angular assertion, remain in [initial-checks.txt](development/initial-checks.txt). The latter was a test equality issue: −0 and +0 are the same orientation. Trial and corrected results are kept separately. Additional original failures and affected reruns are recorded below without replacing them with a clean-run claim.

The first new browser run was interrupted by a known development hot reload and is inconclusive. On frozen runtime, the heading/rescue case passed; the injected-recovery case patched a duplicate bare Vite module instead of the live timestamped module, so ordinary completion occurred. Importing the actually loaded resource exercised the real timeout/error paths and passed. The initial crest method used synchronous pixel readback and was interrupted; its next version did not find the selected event after arrival/UI/next-emission waits. That failed version did not retain enough age data to distinguish expiry from the300ms discontinuity guard, so the cause is unconfirmed. The corrected test observes the latest event at docking and the early next yaw, retaining pre-assert traces. It passes with unchanged runtime/lifetime. These are separate runs, not a clean three-in-one-run claim.

The initial center-only transfer test missed actual cabin overlap. Modeled-vertex diagnostics drove the entry/yaw correction. A subsequent volume-test failure used the wrong draft interpolation for900ms final unloading; calling the production last550ms settlement fixed the fixture without changing runtime/tolerance. Two original full-footprint tests exceeded their existing5000ms limits during a delayed host run; no geometric assertion failed. Removing per-vertex temporary allocations preserved every sample, starting heading, polygon and tolerance; the affected21/21 rerun and fresh173/173 suite passed. Additional idle-bob extremes pass4/4. Details and exact original outputs are in `development/`.

The first performance setup crossed the Rabbit Pier deadline without boarding, so the real loss confirmation blocked its next action. It produced no benchmark result. The corrected identical baseline/candidate setup rescues the rabbits at action4, then warms/measures at tide2; [original failure](performance/initial-failure.txt) and helper source are retained.

## Remaining uncertainty and handoff

Visual inspection is contributor evidence, not the user's perceptual acceptance. Native ordered frames and natural-speed excerpts can reveal stopping/release behavior but cannot certify every frame or real-phone performance. Device-motion changes are media emulation; hidden/recovery/error paths are labeled simulations. Existing bundle and software-renderer limitations remain. Additional ideas stay queued.

The instrumented final phone recordings have no active/wake-visible rAF gap above300ms. The1440×900 Bellwater recording has two such software-renderer gaps (maximum366.6ms), which clear transient history through the existing discontinuity guard (confirmed in `desktop-gap-detail.json`); desktop Holding has none. The baseline phone Bellwater recording also has one466.6ms gap. These recorded stalls are preserved in [the timing audit](timing-and-frame-gaps.json); they do not establish a new attributable hardware regression or perfectly continuous desktop trails. The low-overhead matched comparison is reported separately.

**Not deployed.** The owner-private [phone Site](https://last-ferry-playtest.abumech.chatgpt.site) still contains game **`0ee7d685071179b82ec2a599fac2f818251d0e54`**, hosting source **`273aa4a9900ca8a302b8708f356a2dc83dac7acd`**. Neither the rejected8b874ad pass nor this correction is published by a GitHub push. ChatGPT review of the new SHA precedes publication to the same Site. PR#1 remains draft and main unchanged.

## Evidence packaging

[Compaction audit](compaction-audit.json) identifies14 archived/derived metadata files: exact originals remain local under ignored `raw/metadata-originals`. Dense geometry/sample fields are labeled summaries with original hashes; original results and failure text are preserved. A subsequent [formatting audit](formatting-audit.json) records whitespace-only serialization of16 larger JSON files; every parsed value is retained and prior bytes are archived. [Image archive map](image-archive-map.json) resolves68 unselected PNG paths retained by older capture/inspection manifests. The38 selected native PNGs and four animated WebP excerpts are committed. Full uninterrupted silent originals are local/ignored, not remotely available; [decode validation](media-validation.json) confirms15 complete originals. No audio was changed or newly listened to in this visual pass.

[Packaging audit](packaging-audit.json) compares all136 source entries and42 selected media files against Git. [Tested source patch](tested-source.patch) records the implementation, test, helper and authoritative art/task changes from8b874ad. Evidence belongs to the identified pre-commit working tree; the later implementation identity is recorded separately after commit. Runtime/source files have no whitespace-check errors; supplied task/log trailing whitespace is retained as original evidence.

Implementation commit **`7877c9d094e3ce66f8197df6c203b0c748603488`** matches all136 source entries:131 byte-exact,5 with only Git CRLF-to-LF normalization. All38 native PNGs and four animated WebP excerpts match byte-for-byte. The following metadata-only commit records the audit and continuity; it does not change runtime, tests, helpers or media. The final pushed full SHA, remote equality and draft PR state are supplied in the PR handoff. Main remains `386de54d20fdd4a513a06115471d70bf94738cc0`.
