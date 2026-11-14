# Story foundation — browser verification

Ten distinct focused cases passed across the retained main batch and a targeted follow-up. The main batch is **8 passed / 1 failed**, not relabeled as a clean run. Its cold-entry precondition failed before an input was attempted. The follow-up is **3 passed / 0 failed**, covering that corrected test fixture, the bounded return-confirmation fix, and the rebuilt production entry. Production entry is deliberately repeated; it is not an eleventh distinct case.

## Environment and commands

- Windows, Node 24.15.0, npm 11.12.1, Playwright 1.64.1, Chromium 156.0.8078.4, SwiftShader, DPR 1.
- Actual HTML controls, trusted Chromium emulated touch, mouse and native keyboard. No reducer injection or forced clicks completes a rescue.
- Desktop 1440×900; short landscape 780×320; landscape 844×390; portraits 320×740 and production 390×844.
- Interaction-required autoplay: `--autoplay-policy=document-user-activation-required`, with Playwright's permissive autoplay default removed. The cold test makes its first observations through CDP `Runtime.evaluate` with `userGesture:false`.

PowerShell environment for both runs:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='../.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT='5252'
$env:LAST_FERRY_PRODUCTION_PORT='4197'
```

Main batch:

```powershell
$env:LAST_FERRY_REVIEW_DIR='reviews/story-foundation/browser'
npx playwright test tests/e2e/story.spec.ts --output=.cache/story-final
```

Result: 8 passed, 1 failed, 259.345 seconds. Original machine-readable report: [browser/automation-results.json](browser/automation-results.json).

Focused follow-up:

```powershell
$env:LAST_FERRY_REVIEW_DIR='reviews/story-foundation/final-checks'
npx playwright test tests/e2e/story.spec.ts --grep 'cold touch|return cancellation|production entry' --output=.cache/story-final-checks
```

Result: 3 passed, 0 failed, 38.3 seconds. Report: [final-checks/automation-results.json](final-checks/automation-results.json). No existing timeout, clipping tolerance or viewport assertion was increased.

## Actual checks

| Case | Result and evidence |
| --- | --- |
| Full journey on 780×320 | **Pass**, 1.5 minutes. Fresh title → all three opening captions, optional eight-second motion watched → untouched Holding start → actual nine-action rescue, tide Undo and reboarding, terminal Undo and redelivery → explicit Continue story → readable connective scene → actual ten-action Bellwater rescue → explicit acceptance → honest endpoint → reload/Continue returns to endpoint. Preview, win, arrival and Undo leave the checkpoint unchanged. [full-sequence.json](browser/full-sequence.json) includes observations and the uninterrupted raw recording path. |
| Checkpoint reload and duplicate continuation | **Pass**, 59.8 seconds. Title reload, unfinished Holding reload, won-before-Continue reload, pending transition reload, settled complete caption content and two native Continue taps. Mid-cove and unaccepted-win resumes start with original turn/tide/passengers and empty history. Only explicit accepted departure changes the record. |
| Invalid records and replacement | **Pass**, 23.7 seconds. Malformed JSON, unsupported version, unknown cove and inconsistent progression are retained verbatim until replacement. Cancel preserves them; explicit Replace creates the opening checkpoint. Mute and Reduced Motion preferences survive. Full native 320px labels and notices are measured. |
| Independent practice/review links | **Pass**, 27.0 seconds. First Crossing, Holding, Bellwater and an unknown query value start independently. Instrumented journey-key reads/writes are zero during entry; a real Wait never changes the seeded journey record. |
| Storage denied or full | **Pass**, 15.0 seconds. Controlled SecurityError on journey read and QuotaExceededError on journey write retain playable in-memory progression with the visible closing/reload limitation. Real unloading and complete Undo still work. These are storage failure simulations, not claims of physical Android storage exhaustion. |
| Native 320px keyboard, preferences and fullscreen | **Pass**, 13.7 seconds. Normal Tab/Shift+Tab/Enter, replacement Escape/cancel, Reduced Motion's complete still opening, retained mute preference, actual `document.fullscreenElement === app`, native dialog identity across exit, nearby Moss Confirm and restored dock focus. No fullscreen API mock is used. |
| Cold touch and background settlement | **Pass on focused rerun**, 5.8 seconds. Before touch, activation is false and there is no audio context/request. A trusted touch on New journey starts the existing native context. Controlled hide/show settles the full captions without a turn or checkpoint acknowledgement. After entering Holding, one context and one scheduler remain; sampled RMS is nonzero. [cold-precondition.json](final-checks/cold-precondition.json), [cold-story-audio.json](final-checks/cold-story-audio.json). |
| Short-landscape next passage | **Pass**, 20.5 seconds, with the original overlap retained as a limitation. After Bellwater action 3, overview's East Buoy target is obscured by Let ashore. The existing Play view and a trusted 80px upward water pan expose it. Strict fully-visible/44px checks then pass; an ordinary named target tap and Sail commit exactly action 4/tide 1. [bellwater-overview.json](browser/bellwater-overview.json) records before/overview/panned rectangles and hit targets. |
| Built production entry | **Pass twice**, final 5.3 seconds. Production URL on port 4197 exposes no debug hook. Actual New journey → Skip animation → all opening captions → Continue → Moss choice → Confirm advances to one action, with a Holding checkpoint. Native 390×844 screenshot and built script identity are in [production-smoke.json](final-checks/production-smoke.json). |
| Desktop, Restart, panned cancellation and chooser | **Pass**, 24.6 seconds. Desktop opening and actual Holding/Moss preview; committed unloading followed by real Restart returns turn 0/history 0 without changing progress. After rotating and panning on 844×390, Return to title → Keep playing preserves exact camera, view focus, state and history. Explicit return then Practice → First Crossing supports a real move and Undo without changing the journey record. [return-cancellation.json](final-checks/return-cancellation.json). |

## Fit, visual and source boundary

`measureStory` checks visible text fragments, nested horizontal overflow, caption font sizes of at least 14px, practical 44px button bounds and viewport containment. It excludes only intentionally screen-reader-only labels. Native full-label assertions are retained; clipping is not waived because a surface hides overflow. One canvas is asserted throughout the captured scene states. The new scene flow uses the existing native dialog and Sound owner; it does not create a second visual overlay or audio context.

Native visual inspection is recorded separately in [native-inspection.json](native-inspection.json). In the final opening views, the complete lighthouse and ferry/Moss silhouette remain visible beside or above the reading card. Transition and restored endpoint show safe Harbor residents. All opening copy is present together in settled, skipped, Reduced Motion and restored states. The compact endpoint explicitly says the next part is still being made.

The main screenshots/video use reviewed baseline `1a85874883af5caa59f6294a75495eccf2afebbc` plus the frozen story working tree in [runtime-source.json](runtime-source.json), hash `35b68fd65b0985d1bdf142be097164489deb20d9961fe0393afc6c19bf32ab0f`. The focused follow-up uses [final-runtime-source.json](final-runtime-source.json), hash `d6f92b376088544ebe1dbf3671181d2b8e2dc34fae405a16eb0c563a57e8054a`. The bounded later change keeps Return-to-title confirmation in ordinary gameplay framing, so cancelling preserves an existing pan. The targeted case directly verifies that change. It does not change the earlier full-rescue/scene footage's executed path. Final packaging/reuse audit is part of the main review; these working-tree captures are not relabeled as clean-commit captures.

## Original failures and limits

- [PRELIMINARY_BROWSER_RUNS.md](PRELIMINARY_BROWSER_RUNS.md) preserves the original JSON-module collection error, screen-reader-only measurement false positive, 180-second Bellwater overlap timeout, interrupted diagnostic and development framing decisions.
- The main cold precondition failed with `Expected: false / Received: true` before the first touch. A Playwright locator observation had already granted evaluation activation. The strict follow-up copies the existing audio harness's passive-CDP observation pattern before any locator/evaluate operation; it retains the false-activation, no-context and native-output assertions. No application audio change was needed for this test-fixture correction.
- The original constrained-layout dock/route overlap remains open; actual free panning provides the demonstrated workaround. Prior delivered-heading and ≤180ms rapid-touch limits are not closed by these tests.
- Physical Android, other browser engines, native GPU, alternate platform fonts and real OS background throttling are **not run**. Hide/show here uses controlled `document.hidden` and `visibilitychange`. Native Chromium fullscreen is exercised, but that does not establish every phone browser or hosting policy.
- Audio startup ownership and nonzero runtime output are verified. This pass does not claim a new human listening approval. Video evidence is silent unless its media metadata explicitly says otherwise.
- Full mid-puzzle resume is deliberately not implemented. Reloading an unfinished or unaccepted completed rescue restarts its saved cove; in-session Undo remains complete.
