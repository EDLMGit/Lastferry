# Orchard Landing · difficulty playtest

[Open Orchard Practice](http://127.0.0.1:5270/?cove=orchard-landing) or choose it from the [local Home screen](http://127.0.0.1:5270/). Orchard remains the eighth Practice entrance. The six-cove Journey ends at Reef Return.

## Comparison

The original Orchard let the empty ferry collect its two smaller neighbors in either order. Those orders reached the same boat, load, shore and tide after five actions. Once back at the orchard on action six, all five immediately legal actions still allowed a rescue. The two shortest witnesses used ten actions. Orin’s third space mattered at the opening, but everyone could come home in the same load. [Original independent review](../orchard-difficulty-review/REVIEW.md)

I reran the review’s production graph audit against the ten pinned Git blobs at `fb5806a7a129984290c54a9f54e08d5171d0d3d3`. The seven graph summaries, witnesses and highlighted choices reproduced exactly on Node 24.15.0. The first run on the Windows working tree stopped at Driftwood’s CRLF line endings. Extracting the reviewed source blobs allowed the original hash check to run untouched. [Audit and source manifest](../orchard-difficulty-review/SOURCE_MANIFEST.json)

In the repair, Pomme and Medlar start together at Spring Steps. The early route home can take either passenger alone. If you bring Medlar home, Pomme will eventually reach Orin, but the pair will need depth four on the only outward flow, which has depth three. The future crossing determines the earlier Harbor delivery. The same route succeeds when the audit changes only Orin’s cost from three to two.

Two distinct rescues satisfy that constraint. Leaving Medlar at Cider Quay takes 12 actions. Taking Pomme first and returning to Spring Steps for Medlar takes 13. The exhaustive production graph proves a unique 12-action minimum. All rescues take Medlar inward alone on turn 8 or 9 and bring her back with Orin on turn 10, 11 or 12. After that crossing the player can take as long as needed. The proposed **13-action development target** admits both pickup plans. Difficulty acceptance awaits the player’s judgment. [Side-by-side witnesses and slack](DESIGN.md) · [Production graph and counterfactual](audit-results.json)

## Source and scope

The working tree was clean before fast-forwarding to the task commit, `fc1be94e124ac02ab4562f1083707943d7b4a313`. Orin keeps his accepted geometry, portrait and three-space cost. Orchard’s tan rabbit is now Medlar. Sorrel remains the cream rabbit rescued in Wide Berth. The candidate uses the existing deterministic reducer, automatic seats, direct controls and unrestricted Undo.

The private Site still serves version 19, game `f0ffe2c12f1cc0e42ad7ef10a4b57dd29097c731`. Its custom audience and publication history remain as recorded. [Publication receipt](../mobile-map-readability/deployment-confirmation.json)

## Phone play

| Actual game view | Portrait · 390×844 | Short landscape · 780×320 |
| --- | --- | --- |
| Spring Steps in normal Play | [Starting pair and Board](390x844/start-play.png) | [Starting pair and Board](780x320/start-play.png) |
| Whole cove | [Four named landings](390x844/start-whole.png) | [Four named landings](780x320/start-whole.png) |
| Cider Quay, early decision | [Choose whom to leave ashore](390x844/subset-choices.png) | [Choose whom to leave ashore](780x320/subset-choices.png) |
| First rise and outward crossing | [Orin and Medlar aboard](390x844/orin-aboard.png) | [Pair through the reach](780x320/return-crossed.png) |
| Harbor | [Arrival and terminal Undo](390x844/home.png) | [Arrival and terminal Undo](780x320/home.png) |

Native inspection caught Pomme hidden behind Medlar at Spring Steps and Medlar obscured by Orin near the bow. Medlar now waits on the other side of the approach and rides nearer midships. Both faces read on the critical crossing in either berth orientation. Immediately after boarding together, Pomme still covers part of Medlar’s feet in projection. Whole cove shows every named landing. The close Play view favors the local animals and can crop distant scenery. [Early overlapping silhouettes](browser-trials/README.md) · [Final opening load](780x320/steps-pair-aboard.png) · [Desktop Play](desktop/start.png)

At 780×320 the keyboard run delivered Medlar first and brought Pomme to Orin. Free inspection showed the five-space boat needed depth four in a depth-three outward reach. After the current turned, the player used ten Undos to restore the actual turn-two state, changed the subset and won. The touch run separately undid and replayed the tide change. Both phone rescues checked terminal Undo and byte-identical stored Journey records, including the absence of writes to the Journey key. [Blocked passage](recovery/wrong-escort.png) · [Restored choice](recovery/decision-restored.png) · [State history](recovery/wrong-plan.json)

The uninterrupted 54.65-second normal-motion portrait recording follows the 12-action staging route to the held Harbor card. It contains the game’s live stereo mix. All 441 delivered video frames decoded. The longest gap between captured frames was 0.417 seconds. [Watch the rescue](390x844/rescue.mp4) · [Encoding, levels and SHA-256](MEDIA.json)

## Focused verification

- The production build and standalone TypeScript check passed on Windows with Node 24.15.0. Vite reported the existing large-bundle warning. Asset validation passed with all 80 family IDs preserved. [Build and unit evidence](checks.json)
- The seven Orchard proof tests passed, including both strategies, the reversed partition, counterfactuals, deadline slack and complete Undo. The accepted Wide and Reef witnesses passed. A separate pre-fit regression run passed 171 checks across their rules, seating, clearance, Tips, appearance, catalog and save handling. On final seats, all 16 Orchard geometry cases passed. Across all three six-space coves, 50 of 51 geometry cases passed together. Wide’s positive Harbor heading timed out at 60 seconds, then passed by itself in 8.03 seconds at the original limit. [Geometry evidence](seat-checks.json)
- The final browser suite passed all five cases, including the two phone sizes, the 13-action route, natural keyboard recovery and the desktop production Practice entrance. A separate 390×844 test played the 13-action route through the minified release from Home, using touch and the visible UI without the development API. It checked every turn and tide, the victory card and the restored manifest after terminal Undo. [Browser results](automation-results.json) · [Release build and DOM observations](release-phone.json)
- The canonical-course tests passed for Orchard and Two Shelters. The existing Two Shelters transfer-support sweep exceeded its 30-second limit twice during concurrent checks. After capture finished it passed at the same limit in 8.46 seconds. The original failures and timings are retained. [Unit results](checks.json)
- The phone capture used Chromium 156.0.8078.4, DPR 1 and SwiftShader. Its 124-input digest was `55e2419df496fb5e06722b83e8325c82b89538b6682d9ff2656650615da3b929`. The minified release check records its own bundle digest. [Capture manifest](source/55e2419df496fb5e06722b83e8325c82b89538b6682d9ff2656650615da3b929.json)

Original browser trials caught a test-discovery import error, a portrait still pending after the ten-second assertion, and a live development page that returned to turn zero during recording. The final run kept the original portrait and viewport assertions and used a dedicated development server with file watching disabled. Physical Android performance, phone-speaker listening, spoken screen-reader output and the player’s difficulty judgment remain open. [Original results and observations](browser-trials/README.md)

To reproduce the graph, run `node reviews/orchard-difficulty/audit.mjs` from the repository root on Node 24. For a local playtest, run `npm ci` then `npm run dev -- --port 5270`. Select Orchard under Practice or use the direct link above.
