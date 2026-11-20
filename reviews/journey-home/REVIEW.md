# Last Ferry · Journey Home

[Start at Home](http://127.0.0.1:5420/). Play takes a fresh captain from Holding Pier to the table at the lighthouse. A captain who finished Ternhaven can choose Continue to return to the orchard. The final four crossings are unrated in Journey and Practice.

## The closing chapters

Drowned Orchard revisits the fruit tree, stone steps and submerged Cider Quay with a different waiting party. Only after that rescue does Tansy open the cloth at the refuge. The last light belongs to neighbors across the water. Far Shore and Last Ferry have short entrances that set up their actual starting positions. The captain still chooses the homeward sail, the final unloading and whether to accept the rescue.

The table at supper faces the boat. Bellwater’s cloth, Nell’s mooring rope and Orin’s fruiting bough return. The credits acknowledge the project, development with Codex and the Three.js contributors. They offer Replay coves, Settings and Home. An acknowledged ending can reopen the credits from Home.

## Two separate playthroughs

**Fresh Home.** The player took the helm in all twelve coves. The last departure stayed playable. With four aboard, the captain waited an extra turn at Lantern Buoy, sailed to Harbor, unloaded, used terminal Undo, and brought all four home again. Each win waited for **Continue story**. The first eight chapters ran with Reduced Motion. The final four used normal motion, and the nine accepted scoring identities kept their established targets. [Turn-by-turn record and checkpoints](play/voyage.json)

**Returning captain.** A separate browser loaded the exact archived completion from the Ternhaven review. Opening Home, rescuing all four neighbors in Last Ferry Practice and visiting Drowned Orchard directly left the Journey, mastery and original backups byte-identical. An explicit Home Continue found an occupied backup slot, retained it, wrote the old save to the next slot, verified the bytes, and then opened the new illustration. Reload offered its recap. The player took the helm of the empty ferry at Orchard Landing on turn zero. In the failure case a storage write silently dropped the backup. Home retained the original record and focus, and a fresh keyboard activation retried successfully. [Archived record](../ternhaven-journey/gameplay/390x844/route.json) · [Continuity receipts](continuity/legacy.json) · [Restored Home](continuity/old-eight-home.png) · [First turn](continuity/old-eight-turn-zero.png)

**Supper and credits.** The fresh run distinguished the pending supper on reload from an acknowledged ending. Replaying the picture, reading the transcript, or waiting through the lighthouse sweep left the captain at the table. Continue to credits recorded the last acknowledgment. Settings returned focus to its button, replay opened a fresh independent Last Ferry, and returning Home offered View credits. [First delivery and supper](play/390x844/delivery-to-supper.mp4) · [Restored supper to credits](play/390x844/supper-to-credits.mp4)

An independent audit replayed all 141 observed transactions against the production reducer. It compared all 162 recorded inputs with the Git index, accounting for ten checkout line-ending differences, and rebuilt from staged bytes. All thirteen production files matched the served release byte-for-byte, as did the separately reconstructed portable copy. [Source, artifacts, saves and recording audit](source-audit.json)

## The two visits to the refuge

| Scene | Portrait, 390×844 | Short landscape, 780×320 |
| --- | --- | --- |
| The last lights | [Tansy unfolds the cloth](play/390x844/last-lights-unfolding.png) · [Held picture](play/390x844/last-lights.png) | [Across the water](play/780x320/last-lights.png) |
| A place for the captain | [Sweep](play/390x844/captains-place-sweep.png) · [The empty place](play/390x844/captains-place.png) | [Table and ferry](play/780x320/captains-place.png) |
| Credits | [Portrait](play/390x844/credits.png) | [Short landscape](play/780x320/credits.png) |

On the first playthrough, the lantern landing seemed to float above the horizon. The revised composition gives it a waterline and reflection. Tansy carries the raised edge of the cloth in her paw, and the waiting place at supper sits on the stone quay facing the ferry. The captain stays out of view. [Original frames and art comparisons](ART.md)

## Source and reproduction

Captures used Windows 10.0.26300, Node 24.15.0, Chromium 156.0.8078.4 with emulated touch, software WebGL and a device-pixel ratio of 1. The playthrough used the minified production game from guidance HEAD `1d4fd126d6723d150c2c2b4ec5e284e12bb773f7` plus the recorded working tree. Its runtime fingerprint is `639350812a18e171e43db271a33b6c4b2cde73c83792610224d60a39f84bd587`. The two films are continuous excerpts. The complete playthrough is documented in its action log. [Source manifest](play/source/639350812a18e171e43db271a33b6c4b2cde73c83792610224d60a39f84bd587.json) · [Run instructions and recordings](play/README.md)

Build and serve the release from the repository root with Node 24.

```sh
npm ci
npm run build
npm run preview -- --port 5420 --strictPort
```

To make the portable copy from that default build, run `node reviews/cove-readability/package-playtest.mjs "../Last Ferry - The Long Tide.html"`. The focused continuity suite uses the archived Ternhaven record and the captured fresh-voyage record. Run `npx playwright test -c reviews/journey-home/continuity.config.ts` after building the portable copy. [Local Home](http://127.0.0.1:5420/)

## Verification

| Check | Result | Observation |
| --- | --- | --- |
| TypeScript and minified production build | Pass | `npm run build -- --outDir .cache/journey-home-release/dist` typechecked, then built 124 modules. Vite reported its size advisory for the 986.52 kB JavaScript bundle (275.46 kB gzip). |
| Complete unit suite | Pass | 776/776 tests in 66 files, with no pending tests. Fourteen dedicated new tests cover migrations, failed writes, strict endings, unscored wins and Undo. [Results by file](checks/unit.json) |
| Asset inventory and picture comparison | Pass | All 83 asset families validate with `npm run check:assets`. The five new scenes have distinct beginning, middle and held pictures in both orientations. Sixty reference frames of the earlier scenes matched the published painter exactly. [Picture check](picture-check.json) |
| Archived Ternhaven continuation and retry | Pass | The archived source was restored independently from the new full run. Earlier backups, occupied migration slot and mastery were preserved. A refused backup did not start the new chapter. [Browser results](continuity/browser.json) |
| Single-file export, browser offline | Pass | With zero HTTP requests, the player reached Holding Pier, unloaded and undid Moss. A separate offline desktop case reopened a genuinely earned pending supper in Reduced Motion and chose credits. [Desktop credits](continuity/offline-credits-desktop.png) · [Native frames and offline file identity](continuity/evidence.json) |
| Fresh Home to credits and replay | Pass | All twelve rescues in 4m19s through the minified interface. The log contains 139 committed actions and two successful Undos, 40 observed checkpoints, 16 native frames and zero uncaught page errors. [Production browser result](play/browser.json) · [Route and films](play/README.md) |

Physical Android, phone-speaker balance, spoken screen-reader output, the emotional pacing of the final scenes and the friend’s uncoached control-readability retest still need human feedback. The full historical browser suite was outside this focused check. Earlier playtest limits remain recorded with [the published version 28 review](../last-ferry/INDEPENDENT_REVIEW.md).

The first 13.856-second film shows the player redelivering the neighbors and the lighthouse sweeping once. The second follows the restored supper to credits over 19.074 seconds. Both include the simultaneous stereo game output. Capture spacing reached 0.921 seconds and 6.660 seconds respectively. The longer gap occurs during the replayed sweep. The first film shows that sweep more clearly, and the second retains the handoff and credits. The gameplay clock and audio kept running during capture gaps. [Recording measurements](play/MEDIA.json)

## Findings from the first runs

- Fourteen of 119 assertions in the initial registry run expected the old count or the old Ternhaven ending. Six included historical storage-failure cases whose memory-only fallback had already passed. Their final assertion now follows the new ninth chapter. [Original failures](checks/first-runs.json)
- Two additional storage tests reproduced real defects. A stale tab could overwrite newer progress, and a silently dropped checkpoint could be reported as saved. The final writer checks the current primary record before writing and verifies the result. An ordinary rescue can continue for the visit if storage is unavailable. Migration from the old eighth rescue stays at Home until the original has a verified backup. [Regression tests](../../tests/unit/journey-home.test.ts)
- The in-development browser run reached unfinished picture code. Rehearsal drivers also tapped Next or Retry within the double-tap rejection window, and the first offline assertion used “Holding Pier” for a view actually named “The Holding Pier.” The final checks observe the shot and use distinct activations and the actual accessible name. The first event-only video capture missed quiet end frames. In another run the capture command returned after the lighthouse had settled, making two timing samples equal even though the saved picture showed the beam. The repeated voyage observes the canvas while it animates and records the quiet ending. [Original sweep frame and failure](play/first-pass/frozen-first-evidence.json). [First browser failures](checks/first-runs.json) · [Recording details](play/README.md)

## Publication

The private Site serves version 28, game `a5e1eff68ee93eb2d4cf9814863a3b104fc6a889`. The branch incorporated the commission and publication receipt in `1d4fd126d6723d150c2c2b4ec5e284e12bb773f7`. The new twelve-cove playtest is local and on the draft PR for director review. [Existing publication receipt](../last-ferry/deployment-confirmation.json)
