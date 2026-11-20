# Last Ferry · the last trip home

[Play Last Ferry](http://127.0.0.1:5410/?cove=last-ferry) or choose **Practice → Last Ferry** at [Home](http://127.0.0.1:5410/).

Pipit and Rill wait at Lace Landing. Across the cut, Mallow and Osier wait on Quilt Quay. The evening ferry has room for all four. Lantern Buoy marks the approach to the lighthouse.

[Watch the loaded ferry approach the lighthouse](play/390x844/lighthouse-approach.mp4) · [Watch the uninterrupted pickup and arrival with game audio](play/390x844/arrival.mp4) · [Native phone frames in both orientations](play/README.md)

## What changed after the first trip

The first portrait opening framed the empty ferry and Harbor, leaving all four neighbors beyond the right edge. The buoy now frames the boat and the groups that are still waiting. On the loaded return it frames the boat and the lighthouse. The player can see whom they are going to pick up, then look ahead to where they are taking them. [Original opening](play/prototype/390x844/01-opening.png) · [Revised opening](play/390x844/01-opening.png) · [Turning alongside the lit pier](play/390x844/06b-channel-light.png)

On the first portrait run I took Mallow and Osier aboard. Their four spaces needed depth 3 at the shallow cut, so I took the deep passage around Lantern Buoy. Reaching Lace Landing on the rise gave the ferry enough water to board Pipit and Rill as well. On the way home, the sign still counted down to a flood at the empty landing. By the last approach, its brass wave was calling attention back to a pier the whole party had already left. The final cove keeps the rise on action four, which matters for the pickup, and ends the tide schedule there. A captain can stop at the buoy, look toward the light, and sail when ready. [First full-deck view](play/prototype/390x844/04-full-deck.png) · [First last approach](play/prototype/390x844/06-last-approach.png)

<details><summary>Pickup decision and production proof</summary>

Pipit and Rill use two spaces together and draw depth 2. They can cross the cut at low water. Mallow and Osier use four spaces and draw depth 3. Their route to the rabbits in deep water takes one extra action. Both pickups end with the same four neighbors on the same six-space deck. Either route then asks the captain to steer to Lantern Buoy, sail to Harbor and explicitly bring the group ashore. Docking alone delivers nobody.

Both orders were replayed in the production rules. The shortest rescue takes seven actions. Taking the heavier pair first takes eight. The exhaustive graph contains 1,057 equivalent reachable configurations and 5,072 legal transitions. A rescue remains possible from every one. Each reachable full-deck position has a legal way home, including after any number of waits. These action counts are developer evidence. Last Ferry offers the existing unscored arrival. [Design](DESIGN.md) · [Proof and hashes](proof.json) · [Witnesses](../../data/last-ferry/witnesses.json)

</details>

## Verification

The first geometry run found the occupied hull grazing both pickup piers on Ribbon Cut. Widening the approach arcs fixed the crossings in both directions. An experiment moving an aft seat forward by 0.30 m reduced transfer clearance. The released arrangement retains the established six-space seats and gives the boat a clearer camera angle. All fourteen Last Ferry geometry and transfer checks pass, including every legal passenger subset. [Coast development and measurements](COAST.md)

Two touch runs finished the minified game in Chromium 156 on Windows. The 390×844 normal-motion run entered through Home → Practice and took seven actions. The 780×320 Reduced Motion run followed the direct link, inspected both waiting pairs, found Ribbon Cut too shallow for the four-space pair, and completed the eight-action route. Undo and replay crossed the tide rise, and both runs undid the Harbor delivery and brought all four home again. Tips stayed at their fresh default. Each committed turn was compared with the production reducer. [Phone run records and frames](play/README.md)

At the 780×320 opening the load sign covers the tower; Harbor's named lighthouse marker and the reflection remain visible. At the final approach and alongside the dock the whole lit tower is in view. In portrait the camera closes the distance to the lamp and brings the four seated neighbors into a single frame before Bring home appears. [Landscape opening](play/780x320/01-opening.png) · [Docked at Harbor](play/780x320/07-docked.png) · [Portrait arrival](play/390x844/09-arrival.png)

The first production build stopped at four TypeScript diagnostics about `Array.toSorted` in the new test. Sorting copies of the arrays supports the project's existing TypeScript library. The subsequent typecheck and minified Vite build passed. The canonical inventory passes with 83 unique families. No new animal art was needed for these four neighbors.

The first full unit run passed 752 of 762 tests. Ten story-camera cases stopped in a common fixture that constructed a World without assigning the cove layout. Giving the fixture Holding Pier’s real layout made all ten pass against their original framing assertions. The full rerun passed all 762 tests across 65 files. This correction only changed the unit fixture. [Full suite](checks/unit.json) [Original failures](checks/first-unit-run.json)

The established fresh-Journey browser check also completed all three illustrated opening shots, took the helm in Holding Pier and rescued its original three passengers at 780×320 on this same release. [Holding Pier regression](checks/holding-regression.json)

The desktop check waited four extra turns with everyone aboard at Lantern Buoy, then docked, delivered and left Practice. The original completed-eight Journey, mastery and three backup strings stayed byte-identical with zero protected writes. At 320×740 a completed-seven save survived Home, keyboard inspection, one sail, Restart and return. The portable HTML opened with the browser offline and loaded both rabbit portraits using zero HTTP requests. All three checks passed. [Continuity results](checks/results.json) · [Desktop at the buoy](checks/desktop-all-aboard.png) · [Narrow Play view](checks/narrow-restart.png)

The 41.714-second uninterrupted rescue has 524 native browser frames and the game’s simultaneous stereo audio. The 5.93-second excerpt shows the Sail command, approach and pause at the dock. The recording retains a longest native frame gap of 0.60 seconds. Physical phone play, the independent player's response and speaker listening remain open. [Media timings](play/MEDIA.json)

## Build and publication

The reviewed base is `29ed5dfb32f976b5de97ddfab0b701b3b3df0989`. The branch fast-forwarded to the task and version 27 receipt in `ea94507b997f473f442fd5f7009051701e81bf9f`. The private Site serves version 27 with twelve Practice entrances. This review build has thirteen. Journey ends at Ternhaven and nine coves have mastery targets. The communal ending awaits its own Journey pass. [Published build receipt](../cove-readability/deployment-confirmation.json)

The reviewed phone runs used the guidance commit plus the recorded working tree. Their runtime fingerprint is `5446f672fca58dd18b73256e5485785427f1966b64c67467ebec828853310ca9`. The two served bundles matched the build, all 162 runtime inputs matched the staged Git contents (10 differed only in checkout line endings), and the portable file reproduced byte for byte. The first audit detected that the default `dist` directory still held the earlier readability build. The successful audit used the identified release directory, `.cache/last-ferry-release/dist`. [Source, frame and artifact audit](source-audit.json)

To play locally with Node 24, run `npm ci`, `npm run build`, then `npm run preview -- --port 5410 --strictPort`. Open the [Practice link](http://127.0.0.1:5410/?cove=last-ferry). The root [Home screen](http://127.0.0.1:5410/) also offers Last Ferry in Practice.

For a portable copy, follow the standard build above and run `node reviews/cove-readability/package-playtest.mjs "../Last Ferry - Final Crossing.html"` from the repository root. Open the HTML and choose **Practice → Last Ferry**. All art and game code travel in that one file.

To repeat the two phone rescues, run `npx playwright test -c reviews/last-ferry/play/config.ts` against the local production preview. For the desktop, keyboard and offline cases, create the portable file first, then run `npx playwright test -c reviews/last-ferry/continuity.config.ts`.

**Ready for an independent Practice playtest.**
