# Last Ferry — selectable places and an open cove

## Disposition

**Ready for presentation review and playtesting.** Implementation, affected checks and native visual inspection are complete for the stated coverage. Both reproduced input defects are fixed. One legacy rapid-Confirm test remains failed/inconclusive because its strict timing precondition was missed; independently measured final repeat-input checks pass. Desktop software-renderer tails remain a limitation. The user remains the visual and puzzle playtester; no full browser-suite or physical-device approval is claimed.

## Source and scope

- Repository: https://github.com/EDLMGit/Lastferry; branch `m1-first-crossing`; draft PR https://github.com/EDLMGit/Lastferry/pull/1.
- Clean starting HEAD: `dea5fdd1ed8b017d5112085d4964bab3122ea44f`, the reviewed base requested in the new NEXT_TASK. Main is `386de54d20fdd4a513a06115471d70bf94738cc0`.
- Scope: free mapped location selection, one explicit-action card, stable framing, existing rocky styling at Holding's Stone island, visible lighthouse lantern/local illumination. Accepted game rules, all coves, water, music and sailing are preserved.
- Evidence captured before committing belongs to the recorded base plus identified working-tree changes. Final runtime SHA-256: `60617c88dec76b6232459953785cdb27890138cbbb33a9333a2ec05eb076c4d9`. The final source snapshot, staged-source/image audit and preservation audit are linked below; no capture is relabeled as a later commit.
- Final91-file source snapshot: `faff91efb9d700d30ae6b9ce53f0dd723e880f43730d5b3a6d505395a8737065`. [Source equivalence](source-equivalence.json) identifies later documentation, browser-clock and verification-tool changes separately. Final input-corrected browser execution, screenshots and performance share the exact committed runtime; the added diagnostic tool never loads into the game.

## Executed checks

- Initial integrated `npm run typecheck`: pass.
- New pure location-fact tests: 6/6 pass. They derive adjacent/blocked/remote/current state, actual preview consequences, legal passenger subsets and safe waiting from existing rules.
- New nearest-placement and existing transition checks: 7/7 pass, preserving post-clamp exclusions.
- Final production `npm run build` (includes TypeScript): pass. JS **702.16kB /186.49kB gzip**; CSS **9.04kB /2.78kB gzip**. Existing >500kB Vite advisory. [Final output](final-build-output.txt); preceding builds remain separately attributed.
- Complete unit suite: initial **101/101 pass in 13 files**, 1.49s; after the first input fix **101/101 pass**, 1.47s. [Output](final-unit-output.txt), [machine report](final-unit-results.json). Later changes affect main's browser input/placement wiring and noninteractive SVG/CSS; unit-tested dependencies are unchanged. Actual reducer searches retain Holding's nine-action rescue/required holding and Bellwater's ten-action route/pickup constraints.
- Initial browser execution: **11 passed /2 failed**, exit 1, 7.4 minutes, 13 selected scenarios. Four intended new tests were omitted by an incorrectly anchored grep; this omission is recorded, not counted as execution.
- First new-selection execution: **3 passed /2 failed**; three viewport/picking cases pass. The original timing/event-trace harness assumptions and corrections are retained.
- Later affected execution: **7 passed /2 failed**. Final input-corrected execution: **8 passed /1 failed**; the remaining failure is the legacy timing precondition. Clock-corrected rerun: **1 passed /1 failed**; last bounded reduced attempt: **1 failed precondition** at244.6ms. All original reports remain in [Browser QA](BROWSER_QA.md).
- Final runtime input regressions pass: new intentional Sail at **92.1ms**; former Sail-point repeat at **102.7ms** does nothing; deliberate arrived-card Board at **152.7ms** opens a free preview. Normal/reduced lifecycle, both phone ray/overlap checks, narrow full rescue and production First Crossing pass. Reduced lifecycle actually measures Confirm **59.6ms** and Sail **33.9ms** between first release and second press, exactly one action each.
- Fresh capture flows: desktop Holding nine-action rescue with first-rise Undo/replay, terminal Undo/redelivery; desktop Bellwater ten-action rescue; Bellwater844×390 and780×390 touch rescues. **Four sessions won, zero recorded errors, source unchanged.** Production First Crossing completes in the final browser execution. Safe/blocked/remote/current facts, actual scene targets, free inspection, keyboard/focus/modal recovery, subsets/loss confirmation, both rises, reduced motion and visibility recovery are covered across the identified runs.
- Both tempting Holding alternatives still lose in the initial affected execution; exact reducer search still has no win bypassing temporary holding. A31-file preservation audit confirms rule/data/audio/water/contact/path/timing/dependency contracts unchanged against the reviewed base.

## What changed

Every named stop remains visible through one compact semantic button. Current, connected, shallow, remote and selected states use symbols and borders as well as color. Mapped islands, piers, landmarks and the ferry expose the same selection contract; unrelated terrain and empty water do not invent a destination. A place selection opens one nonmodal region for free. Reselecting keeps it open, another selection replaces it, and Close/empty water/Escape clears it. Hover and focus emphasize the place and only a real adjacent passage, without replacing persistent selection.

The card derives its current/adjacent/blocked/remote facts from the production rule/preview helpers. Safe Sail commits exactly one passage directly; losing Sail opens the existing explicit confirmation. Current-pier passenger actions keep the existing subset preview and Confirm. A flooded pier offers no transfers but explains that the ferry can leave. The card hides during transit, then presents the arrived-at place's current actions. Transfers and Wait recompute any retained selection; Undo and Restart clear it. The ending dialog takes precedence.

Keyboard selection focuses a non-committing heading. Repeated Enter/Space is consumed; actions must be chosen deliberately. Pointer actions must originate on the same control, new controls avoid the opening point, and the existing spatial repeat guard protects Sail/Confirm and dismissal. Modal cancellation retains selection and restores its actual trigger, with the heading/selector as fallback. A global modal opened from the clean overview does not invent a location. One Escape closes one layer.

The card uses a translucent deep blue-green background, opaque warm text, a fine warm boundary, inner highlight and restrained shadow; buttons have stronger local backing. No backdrop filter is used. The shared placement helper chooses nearby valid space after clamping, protecting passengers, the full ferry, place bounds, global UI, other selectors and the activating point. The first actual comparison found a selector falling to a distant corner; nearest-anchor candidates fixed that placement. Redundant safe-travel prose was removed while actual tide and loss consequences remain visible and prioritized. Native review also found that a long card leader resembled an extra passage beneath Stone and toward Rabbit Pier. Final distant-card links use paired short solid endpoint accents; nearby cards retain a short full connector. Selected borders/rings carry identity without drawing a continuous false route.

## Original failures and fixes

**P2, fixed in the working tree — rapid intentional reduced-motion sailing could be swallowed.** After unloading Moss and sailing to Shallows, select Rabbit Pier and press Sail promptly. The old commit fence remained active at the previous Sail rectangle even after that explicit new selection. A trusted-input probe reproduced the missing move with first Sail at 2547.2ms, new selection at 2679.1ms and second Sail at 2723.2ms, **176.0ms apart**. The boat stayed at turn 2/Shallows; a retry after the fence expired reached turn 3/Rabbit Pier. Two slower trials passed. [Original probe](fence-probe/probe.json).

An explicit valid selection establishes fresh intent before the next action. A second probe found another P2 in the same family: after instant reduced-motion First Crossing arrival, deliberate Board at **66.4ms** was swallowed because its center occupied part of the old Sail rectangle. The actual original Sail point was outside Board, so the rectangle was broader than the repeated gesture. [Original trace](final-input-probe/probe.json).

The final correction distinguishes commit and dismissal fences: commit protection uses a 24px neighborhood of the actual activation point inside the old rectangle, while dismissal retains its original rectangle. Both selection and action points protect card placement. Repeating at the actual old point is consumed even if water or a new control is exposed; a deliberate different Board control remains available. Explicit valid selection clears the previous action fence. The 180ms timer was not enlarged. Original probe microtask snapshots are not presented as post-dispatch proof: Chrome ran that checkpoint before target handlers; separately observed state and later retry establish the reproduced behavior. Final tight-interval results are recorded in [Browser QA](BROWSER_QA.md).

The other initial failure was a legacy timing check still clicking a destination without its new explicit Sail action. Its transition correctly remained null. The test is corrected to execute the actual new contract, preserving its duration/course/arrival assertions. A stale hardcoded lens baseline was replaced with the captured ordinary baseline while retaining strengthening/reset comparisons; it was not reported as an independently observed initial failure.

The first new test run's two failures were harness assumptions: one measured successful sequence was 1662ms apart rather than exercising the 180ms case; another expected five compatibility clicks although the disabled Confirm correctly suppressed one. Their original reports remain. Corrected checks use trusted physical-coordinate clicks on actual controls, explicit timing preconditions and pointer pairs with normalized button identities, retaining one-commit/history/modal/focus/selection assertions.

The canvas extends behind the interface. A fixed orthographic camera fits cached static geometry, waiting passengers and actual loaded-ferry dimensions across the complete canonical path/tide/draft/bob envelope. It uses clear lateral space before reducing scale to avoid a corner forecast. Selection, hover and tide never reframe it. Initial comparison exposed excessive shrinking for that corner; translation restored useful phone scale. Those exploratory captures remain separate from final-source evidence.

Holding's Stone island now uses the existing sparse rocky style; its footprint, pier and elevation are unchanged. Harbor retains its garden and Rabbit Pier its cottage. The lantern has an amber shell and pale core, slightly opened roof and locally warmed receivers. Normal occlusion is retained; shared house/roof materials are isolated. The existing explicit anchor connects its glow and local reflection. Persistent, arrival, resting, Undo/Restart and recovery behavior remain intact. [Scene QA](SCENE_QA.md).

Disclosure semantics and control-boundary decisions were checked against the task's [W3C disclosure guidance](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), [navigation example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) and [non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). These references support the implementation choices; the performed browser/native checks do not establish assistive-technology certification.

## Environment and reproduction

Windows 11 Pro; Node 24.15.0/npm 11.12.1; Three 0.186.1, TypeScript 7.0.2, Vite 8.3.4, Vitest 5.0.5, Playwright 1.64.1/Chromium 156.0.8078.4. Headless SwiftShader WebGL, DPR 1; desktop 1440×900, emulated-touch phone landscape 844×390 and 780×390. No physical-phone/native-GPU claim.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

This workspace reused its installed lockfile dependencies and browser cache `../.cache/ms-playwright`; a fresh `npm ci` was not repeated. Live development is 5186 and production preview 4182. Exact frozen runtime copies use 5188 for the reviewed baseline, 5187/5189/5190 for preceding implementations and 5191 for the final input correction. Exact browser/capture commands and source identities are retained in their manifests and verification report.

## Captured gameplay

**Visual verification complete for the stated desktop/emulated-phone coverage.** All22 fresh main captures, four exactly reused baseline images and two final-runtime narrow critical states were inspected at native size. [Scene QA](SCENE_QA.md), [capture index](capture-manifest.json) and [media inspection](MEDIA_QA.md) identify source, input, state, time and actual limits.

| State | Selected evidence | What it establishes |
| --- | --- | --- |
| Ordinary baseline/final | `before/`, `after/holding-pier-ordinary.png`, `after/bellwater-ordinary.png` | Exact audited baseline reuse, full stable final cove, visibly lit ordinary/muted lantern |
| Current/safe/blocked/remote | `after/holding-current-stone.png`, `holding-safe-harbor.png`, `holding-blocked-shallows.png`, `holding-remote-rabbits.png` | One translucent card, real route/depth facts and free selection |
| Passenger subset | `after/holding-passenger-subset-preview.png` | Actual partial boarding would leave Rue at the flood; no invented safe consequence |
| Critical safe boarding/after rise | `phone-critical/critical-boarding.png`, `phone-critical/after-rise.png` |780×390 selected both rabbits, exact boundary and flooded-pier departure facts |
| Both phone widths | `after/phone-{844,780}-{ordinary,current-harbor,remote-low-pier,loaded-harbor}.png` | Open/closed card, complete loaded ferry, readable control/forecast and full landmarks |
| Delivery/Undo | `after/holding-delivery.png`, `holding-delivery-undo.png`, `bellwater-delivery.png` | Real success, visible lantern response and restored loaded Harbor state |
| Original-speed video | `after/raw/holding-pier-selection-rescue.webm` (51.36s), `after/raw/bellwater-selection-rescue.webm` (35.28s) | Uninterrupted actual UI, silent25fps1440×900, no cuts/state injection; local/ignored, unavailable in a fresh clone |

The Holding recording includes island selection, free inspection, explicit Sail, boarding, tide Undo/replay, delivery, terminal Undo and redelivery. Entire streams decode without FFmpeg errors. Native ordered extracted frames support visual sequencing; continuous playback was not reviewed at real time, and silent video does not establish audio quality. Prior audio evidence retains its original source and has not been relabeled.

## Remaining limits and workflow

No reproduced gameplay, selection, overlap or modal defect remains in performed final-runtime checks. One strict after-idle reduced rapid-Confirm timing scenario remains inconclusive; its original failed attempts are preserved alongside the passing independently timed lifecycle pairs. The full60-scenario browser collection was not rerun; source-separated coverage and reuse are explicit.

The final no-video software comparison has worse desktop p95 with23.3% more rendered pixels; phone median/p95 is unchanged despite51.2% more pixels. The baseline-sized diagnostic has mixed tails, preventing a pixel-versus-light attribution. [Renderer QA](RENDERER_QA.md) retains actual intervals/resolutions, recording-enabled samples separately, and the historical regression.

Not run: fresh dependency installation, fresh reference-model verification, physical phones/native GPU, other browser engines, screen-reader speech, speaker/headphone listening or actual OS audio-interruption policy. Dependencies and accepted music are unchanged. Puzzle satisfaction and aesthetic preference remain the user's playtest.

[Source snapshot](source-manifest.json), [verification summary](verification-summary.json), [preservation audit](preservation-audit.json), [staged packaging audit](packaging-audit.json) and [tested patch](tested-changes.patch) make the exact review state reproducible. Final source metadata may differ from earlier execution manifests only where separately identified; runtime equality is checked byte-for-byte. The final commit SHA and verified remote equality are recorded in the PR/user handoff to avoid self-referential commit metadata. The authorized workflow uses a normal commit/push on `m1-first-crossing`, updates PR#1 while draft, and never merges or changes main.
