# Cove readability · friend playtest

[Start a fresh local Journey](http://127.0.0.1:5400/) · [Observer’s question and player responses](PLAYTEST.md)

This pass starts at Take the helm. The ferry sign names the destination, counts rescues, identifies the current load, and shows the hull requirement alongside the water at the boat. The tide sign shows committed actions and names the next change. The same rising-water mark and countdown appear beside the affected landing. Both signs open free inspection. Find Harbor and the forecast’s Find landing controls bring an offscreen place into view.

The boarding chooser takes the selected passengers’ full load and compares their projected hull depth to the berth **before** the action advances the water. A selected passage shows the depth along the route and at the far end. The controls read the same production state in early and late coves.

The independently reviewed baseline was `7edba1519e9d856f3dc029bb0d500b4480985149`. The branch incorporated the commission and publication receipt in `5e3c930e83622eb8864f1554bcdd1ba9d7f9ef58`. The private Site currently serves version 26 with that baseline. [Publication receipt](../far-shore/deployment-confirmation.json)

## What changed after playing

In the v26 portrait opening, the ferry showed “2/4 · Depth 2.” The rabbits were offscreen. The new ferry sign names the goal and Moss, distinguishes occupied spaces from required depth, and compares that requirement with the water at Stone Pier. The tide sign names Pip and Rue, Rabbit Pier, and the number of actions remaining. At landscape size the same brass countdown sits beside the rabbits’ landing. In portrait, Find Rabbit Pier brings it into view without spending an action. Find Harbor works the same way. [First control in portrait, before](play/before/390x844/holding-pier/01-first-control.png) · [After](play/after/390x844/holding-pier/01-first-control.png)

The initial horizontal sign hid the lighthouse lantern in short landscape. A narrower vertical sign left the boat, all three passengers and Harbor visible. A second layout obscured Shallows. Measuring actual hit targets and changing the grouping of the two counters restored the map tap. The portrait sign uses two columns beneath its destination line to keep the middle of the cove open. [Compared layouts and observations](design/COMPARISON.md) · [Landscape first control](play/after/780x320/holding-pier/01-first-control.png)

### The harder reading

<details><summary>Far Shore evidence for the reviewer</summary>

On turn seven at Rush Landing the lighter ferry can already sail into water of depth 3. With one companion, taking Rowan aboard would require depth 4. With the other companion, the resulting ferry needs depth 3. The Board control shows the same waterline and hull notch in both situations. The shortfall disables the action. Equality allows it. Inspection and changing the selected group leave the action counter alone. This was exercised through the earlier passenger choices, travel, the loss, Undo and a completed rescue in both phone orientations. [Travel into Rush](play/after/390x844/far-shore/01-sail-to-rush.png) · [Boarding at 4 versus 3](play/after/780x320/far-shore/02-deep-party-at-rush.png) · [Boarding at 3 versus 3](play/after/780x320/far-shore/03-light-party-at-rush.png)

</details>

## Trying the build

Use the [local Journey](http://127.0.0.1:5400/) or give the friend the portable HTML file. The file includes the minified production game, its style sheet and the same ten PNGs used for portraits and arrival figurines. It starts at Home. For an independent first impression, open it in a fresh browser profile with default settings. Keep the footage, review and observer sheet for after the test. [Observer sheet](PLAYTEST.md)

To reproduce the file from this checkout with Node 24, run these commands.

```sh
npm ci
npm run build
node reviews/cove-readability/package-playtest.mjs "../Last Ferry.html"
```

## Original failures kept for review

- Rapid taps on consecutive opening shots hit the existing repeat-activation guard in the first baseline automation. Deliberate, separated taps completed both openings. [Original baseline run](play/before/browser.json) · [Baseline rerun](play/before/holding-rerun.json)
- The first route card left the required depth below a 96-pixel clipping boundary on a short phone. The corrected card gives the depth facts their own measured height. [Original frame](play/development/short-route-clipped.png) · [Bounds](play/development/short-route-clipped.json)
- The first integrated release completed both rescues in both orientations, but native inspection showed the last words of the action-four preview behind the pinned commit area. The shorter sentence names the boarding group, tide rise and flooding pier in action order. The short-landscape chooser also uses its available vertical space more efficiently. [Original preview](play/development/short-boarding-clipped.png) · [Original release runs](play/development/initial-release-browser.json)
- The initial loopback preview process exited with its shell and refused connections. The retest used a persistent local server. Served asset hashes identify each run.

## Release verification

The final minified build was captured from the guidance commit plus this working tree, on Windows with Node 24.15.0 and Chromium 156.0.8078.4. The captured source fingerprint is `1b89e7d074607195a633d5219c0920a13e2b86da5497c6c8ad16a91e387e29ff`. All 160 runtime inputs match the submitted Git index, including ten with normalized text line endings. Six capture inputs also match. The production JavaScript and CSS match the bytes the phone browser received. The standalone HTML is 1,620,712 bytes, SHA-256 `d2055d51d9c2de3e76d5f9ff661d8877df032f8dc7285b77a1c6d36f9cc02861`. [Source, bundle and portable hashes](source-audit.json)

- `npm run build` passed TypeScript and the production build. Vite reported its existing large entry chunk warning. `npm run check:assets` validated all 83 asset families. The existing panel, map-marker and passenger-choice entries record the implemented changes. The puzzle data, reducer, Journey storage, sound and mastery files have no changes from v26.
- The five existing focused browser regressions covered named places and keyboard focus, actual fullscreen exit with a pending chooser, a two-finger gesture over a transfer, five viewport sizes, and Whole-cove clearance. Seven further layout observations and a panned Wide Berth landscape-to-portrait check exercised the final placement. The first Wide and Driftwood comparisons caught covered faces. The correction lets a sign move along an edge at a settled framing change while keeping the camera and passenger positions intact. [Design evidence and original failures](design/COMPARISON.md) · [Regression results](design/regressions.json)
- The final full unit run passed **743/743** in 64 files at unchanged limits. The initial run exceeded three existing geometry time limits. All 18 checks across the two affected files passed on retry at the original limits. All 23 focused depth, tide, transfer and Tips checks passed. [Commands and original failures](checks/unit.md)

- Three release checks passed against the final bundle and its portable copy. A real 320×740 keyboard inspection framed Harbor and Rabbit Pier, returned focus, rotated an open passenger chooser and preserved the Journey, bests and three backup records byte-for-byte through the action-four rise and Undo. At 1440×900, opening the bridge and waiting each spent one action, and Undo restored the previous named change. With the browser offline, the portable file opened Home, ran the illustrated opening, entered Holding, sailed, and loaded both actual passenger portraits with zero HTTP requests and zero page errors. [Results](checks/results.json) · [Narrow phone after the rise](checks/320-after-rise.png) · [Desktop tide change](checks/desktop-current.png)
- The uninterrupted portrait recording runs 32.009 seconds from first control to arrival. It includes a blocked route inspection, the boarding choice, the rise and its reversal with Undo. All 579 captured frames decoded with stereo runtime audio at original game gain. The longest interval between delivered browser frames was 0.733 seconds. [Watch the rescue](play/after/390x844/holding-pier/arrival.mp4) · [Media measurements](play/after/390x844/MEDIA.json)

- All four release touch runs passed. Each orientation started a fresh Journey from Home and completed Holding in nine actions with an Undo across the fourth-action rise. Each entered Far Shore independently, tried both groups at Rush on turn seven, reopened the actual loss explanation, returned to the first decision with eight Undos and completed the thirteen-action rescue. Terminal Undo and redelivery preserved the unscored result. The phone runs recorded zero page errors. The evidence inventory verifies 24 matched pairs at native 390×844 and 780×320. [Before/after index](play/README.md) · [Final browser results](play/after/browser.json) · [Frame checksums](play/frames.json)

With the production server on port 5400 and the portable file built, the following commands reproduce the release checks.

```sh
npx playwright test --config reviews/cove-readability/play/config.ts
npx playwright test --config reviews/cove-readability/checks.config.ts
node reviews/cove-readability/play/verify-frames.mjs
```

**Ready for an uncoached retest.** The phone evidence uses Chromium touch emulation with software WebGL. Physical Android and iOS, hardware performance and a first-time player’s interpretation remain unverified. The historical browser suite was sampled for the changed interactions. The published private Site is still version 26. [Fresh-player follow-up](PLAYTEST.md)
