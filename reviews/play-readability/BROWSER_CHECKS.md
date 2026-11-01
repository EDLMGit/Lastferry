# Browser checks and original failures

All browser evidence is actual app UI on Windows, Node 24.15.0 and Chromium 156.0.8078.4 (Playwright build 1248), ANGLE SwiftShader, DPR 1. Phone sizes are emulated touch viewports, not a physical phone. Source manifests identify the dirty working tree above baseline 52f72d6cdb1caa292425511394f4a11efa024a61. Development diagnostics observe state; actions use normal inputs. The separate production smoke has no development API.

## Independent controls and Sail

ui-reviewed/automation-results.json: **4/4 pass**. Native 320x740, 390x844, 780x320, 844x390 and 1440x900 cover collapsed/expanded status, occupied-pier deadline, exact blocked depth, free Details and stable camera framing. Five points on every visible Whole-cove marker retain the correct hit owner. Natural Tab/Shift+Tab/Enter/Escape covers selection, Details, close, sailing, Menu, inline immediate loss and complete terminal Undo at desktop and short landscape. Actual touch inspection/pan, rotation, Reduced Motion, mute and actual document.fullscreenElement === app entry/exit preserve state. Card rectangles are checked against visible chrome; original nested clipping/44px assertions remain.

One requested 60ms-separated tap pair was actually observed **197.1ms** apart and committed one move while busy. The second pointer landed on the now-exposed map control. This is a measured busy-window sample, **not** a universal <=180ms guarantee. See repeat-input.json.

Original attempts are retained: ui-first failed before app launch under sandbox; ui-second was interrupted during concurrent software rendering and contains a blank capture. ui-final passed its four functional cases, but native 780x320 inspection showed the blocked card covering Back to boat and the loss card under Undo. Strengthened overlap checks reproduced the former in ui-layout-corrected (1 failed/3 passed). ui-compact-final passed 4/4 but still showed the long loss warning colliding with upper chrome. Final correction reserves the selected card before labels, keeps 44px controls with tighter panel padding, states the exact preview-derived names/pier loss concisely, and shows passenger actions when the current place is selected or inspection is closed. ui-reviewed passes with both blocked and losing card chrome assertions. Original images and reports remain separate; earlier green checks are not visual acceptance.

A distinct reproduced Driftwood turn2 target interception by the forecast capsule is retained in journey-attempt-3. Visible endpoint hit areas now avoid individual control rectangles and retain leaders to their real endpoint. The subsequent actual Driftwood rescue passed. Holding tide2 Overview also exposed Bring home over the lighthouse; dock placement now tries landmark clearance before its fallback. Later water/production frames identify the final-source coverage.

## Other focused evidence

- [Journey checks](JOURNEY_CHECKS.md): actual Holding and Driftwood rescues, tide/terminal Undo, practice isolation, earned Harbor and explicit Bellwater continuation.
- [Water checks](WATER_CHECKS.md): three tides, matched loads, deeper node pockets, actual blocked-to-legal and Undo, original timeout retained.
- [Harbor observations](HARBOR_OBSERVATIONS.md): twelve native held beats at 320x740, 390x844, 780x320 and 2048x930; four explicit handoffs; actual Pause/Resume/Replay, no game-state mutation.
- Final regression and production outcomes are recorded in REVIEW.md and their original JSON reporters, without replacing failed attempts.

## Retained limitations

No physical Android, other browser engine/font/screen reader or native-GPU performance approval. Sparse software captures and capture stalls do not establish phone frame rate. Inherited intermittent portrait loading, constrained Bellwater overlap, delivered-heading and precise repeat-input limits remain open unless specifically closed by new relevant evidence. Accepted score/composition and cues are unchanged; recording original runtime audio does not establish human listening approval. No exhaustive historical browser rerun is claimed.

## Final integrated batch and corrective recovery

`final/automation-results.json`:14/14pass in5.7minutes, including5UI/Overview,2actualrescues,2water,4cross-cove/Home and1production case. The final actual rapid input timing is in final/repeat-input.json; the earlier197.1ms sample above remains historical. Final actual shore-roster/lighthouse bounding rectangles are fully visible and clear of corner chrome in five Whole-cove configurations.

After this batch, an actual Wide Overview water drag reproduced recentering that put the upper group under Undo again. Original focus changedx3.4255 tox0.7766 at844x390; `overview-drag-first/` retains the failure and frame. One guard in World.panByPixels now leaves the complete Overview fixed; Play drag and Back to boat still work. Fresh build/typecheck,6viewunits and `recovery-final/automation-results.json`2/2 pass at844/780 plus another production rescue. `evidence-reuse-audit.json` proves this is the sole runtime delta after the14-case source; no game rule, field, UI or story source changed.
