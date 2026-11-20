# Reef Return playtest

Reef Return asks whether the six-space ferry can collect the second landing and still bring its full load through Needle Reef. The shallow arm and the change in the current share the same tide. Thinking, inspecting a route and watching a crossing are free.

The supplied task and version 15 publication receipt are preserved in [the original package](../../LAST_FERRY_REEF_RETURN_PACKAGE/). The baseline for implementation and evidence is `b64583dd295b488de013fb2d6db32e63ba79427e` on `m1-first-crossing`. This candidate enters through Practice or `?cove=reef-return`. Human playtesting decides whether it earns a campaign role.

**Ready for playtest.** [Play locally](http://127.0.0.1:5270/?cove=reef-return) · [Uninterrupted portrait rescue with runtime audio](phone/reef-rescue.mp4) · [Native frames and source comparison](MEDIA.json)

The 34.146-second MP4 includes all 254 captured frames at their original intervals, from the first mixed pickup to the completed Harbor arrival. The stereo track comes from the game's Sound owner at its runtime level. FFmpeg decoded the entire movie. The recording measured −36.7 dB mean and −22.7 dB peak. The brief tail of the recorded arrival audio holds the final picture. [Encoding and SHA-256](phone/encoding.json) · [Audio measurement](phone/audio-levels.txt)

## The decision

Heather the sheep and Flick the tan rabbit wait at Wrack Pier. Birch the beaver and Dot the cream rabbit wait at Shell Pool. All four fit on the prepared ferry, but the extra load changes whether the boat can get *out* of the pool. A player can leave Heather alone or with Flick at Cairn Quay and return for the final crossing. The quay stays dry when the reef turns. Someone left there still needs a route home.

The production reducer admits both nine-action solutions. Search over every legal subset, passage and Wait found no win without staging Heather at the quay and no win without crossing the reef fully loaded. The search normalizes turns only after the final tide. Adding a deep passage in a counterfactual test opens a two-trip solution. In the real cove, waiting 30 turns after reaching Harbor with everyone aboard still permits delivery. [Proof and alternatives](DESIGN.md) · [Executable witnesses](../../data/reef-return/witnesses.json)

## What to look for on a phone

At 390×844 the starting Play frame includes Wrack Pier's two neighbors and the second pair at the nearby pool. At 780×320, Wrack's staggered pair, the planked six-space ferry, Cairn Quay's named marker and the forecast fit on screen together. Inspecting a distant destination can pan far enough to crop the ferry. Back to boat restores the local frame. [Portrait start](phone/390x844-start.png) · [Short-landscape start](phone/780x320-start.png)

Both the posted current and the three chevrons indicate the permitted heading. The action-eight move starts with homeward flow. The authoritative turn advances on commitment while the locked sailing presentation shows the direction used for the crossing. At arrival the arrows reverse. The free forecast names the next direction and the shore deadline. [Forecast](phone/390x844-forecast.png) · [Last legal crossing](phone/780x320-last-crossing.png) · [In motion](phone/390x844-sailing.png) · [After the turn](phone/780x320-after-turn.png)

The greedy pickup loads all four at Shell Pool. Its outgoing passage was deep enough for the first pair and is too shallow for the full ferry. Once the return opportunity has passed, the loss card explains the cutoff and offers Undo. The original four-space coves and the original Wide Berth still use their own level data. [Blocked loaded return](phone/390x844-greedy-return.png) · [Missed tide](phone/780x320-missed-window.png) · [Harbor](phone/390x844-home.png)

## Verification trail

| Check | Result |
| --- | --- |
| Production build and TypeScript | Passed under Node 24. Vite reports a bundle-size advisory for the 885 kB game module. [Build log](build.txt) |
| Unit suite | 462 tests passed in 48 files. This includes both winning witnesses, an exhaustive search, actual boat and passenger geometry, the direction of the modeled arrows and the two shelf elevations. [Unit output](units.txt) |
| Inventory | 79 unique families validated. Twelve existing families record the candidate's new uses. [Validation output](assets.txt) · [Asset ledger](../../docs/ASSET_LEDGER.md) |
| Preservation | Six earlier levels and eleven historical receipts were checked against the reviewed Git tree. The 41 protected files match after accounting for four line-ending differences. Direction/route/loss copy was compared against the reducer across 236 playable states. [Audit](preservation.json) |
| Native interaction | Normal-motion portrait rescue, greedy full-load restriction and six successive Undos, built-game landscape rescue and reversal Undo, early-crossing warning, Home Practice and checkpoint isolation. The moving-frame check observes the actual chevrons before arrival, then repeats the last move and switches to Reduced Motion while it runs. [Browser output](browser.txt) · [Mid-sail state and drawn direction](phone/crossing-in-motion.json) |
| Existing coves | Production Two Shelters completed with tide and terminal Undo. Production Wide Berth completed its six-passenger rescue and full-label checks. The final browser run passed all six cases in 3.4 minutes. [Structured results](phone/automation-results.json) |

Captures used the baseline plus the working-tree inputs listed in the [source manifest](source-before.json). Their hashes were checked again after capture and against the staged source, and the final shipped images and movie were compared byte-for-byte with Git. [Media and build audit](MEDIA.json)

Windows, Node 24.15.0, npm 11.12.1 and Playwright's headless Chromium with ANGLE SwiftShader. Phone frames use their native CSS viewport and DPR 1. Inputs were actual browser touch events in emulation. The short-landscape rescue used the built game with Reduced Motion and remembered mute. The portrait recording used normal motion and the existing Sound stream on the development build. No game state was injected for either rescue. Journey isolation tests seed an identified checkpoint and compare its serialized contents before and after Practice.

The dev server used port 5270 and the production preview used 5285. After `npm ci` under Node 24, use `npm run dev -- --port 5270 --strictPort` to play locally. The verification commands were:

```text
npm run build
npm run test:unit -- --reporter=dot
npm run check:assets
npm run test:e2e -- reef-return.spec.ts reef-return-practice.spec.ts two-shelters-production.spec.ts wide-berth-production.spec.ts
node reviews/reef-return/encode.mjs reviews/reef-return/phone
```

Set `LAST_FERRY_DEV_PORT=5270`, `LAST_FERRY_PRODUCTION_PORT=5285`, `LAST_FERRY_PRODUCTION_URL=http://127.0.0.1:5285` and `LAST_FERRY_REVIEW_DIR=reviews/reef-return/phone` for the browser command. The local machine reused an installed Chromium with `PLAYWRIGHT_BROWSERS_PATH` pointing to its browser cache. FFmpeg and FFprobe on PATH produce the movie from native timestamped frames and runtime audio.

## Issues found while testing

- A first layout aligned both waiting faces at the same screen X. An early turn also grazed Shell Pool, an exposed skerry and shore props, and a gangway walk had an unsupported foot. The shore lanes, fitted brow, reef flanks and curved approach were revised against real model geometry. Moving Shell Pool a further 0.39 world units cleared the turning hull. [Initial portrait](iterations/portrait-first-composition.png) · [Geometry iterations and results](iterations/geometry-observations.json)
- The first six-case browser batch passed its endpoint checks. One **moving** frame showed the outbound arrows while the ferry was still sailing home, with a warning marker over the deck. The crossing now holds departure direction and hides its endpoint markers during normal-motion travel. The four-name landscape chooser also needed two columns to keep Heather on one line. [Original mid-sail frame](iterations/current-reversed-during-sail.png) · [Original chooser](iterations/four-name-chooser.png)
- A first Practice assertion matched both visible and collapsed Details text. It now checks the visible warning. During development, one greedy route rehearsal failed to reach the expected loss, with the original cause undetermined. A later run actually observed Vite reload to turn zero. A separate run timed out tapping an offscreen Harbor marker after toggling views. The final test explicitly keeps Whole cove open for that inspection and verifies each committed Wait. [Offscreen tap](iterations/browser-greedy-timeout.txt) [Original Practice failure](practice-check/first-run.json) · [Reload diagnostics](iterations/dev-reload.md)
- A unit run concurrent with movie encoding and browser work hit the original timeouts on five hull-clearance cases and one transfer-support case. The final suite ran without those other jobs and with the existing limits. [Concurrent run](iterations/units-concurrent-encoding.txt)

## Limits

These are emulated phone checks. Physical Android touch, hardware frame rate, acoustic balance and user judgment of the new puzzle are open. The path and foot checks sample real meshes and transfer paths. They do not constitute continuous collision simulation. Existing open timing, constrained Bellwater overlap and intermittent portrait-loading findings remain recorded in project continuity. The private Site continues to serve the positively reviewed Two Shelters build under version 15. Reef Return is delivered through GitHub and the local Practice link.
