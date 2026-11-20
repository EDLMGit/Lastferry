# Read the water · native phone play

Open the root URL, choose **Play**, and use the illustrated opening's **Take the helm**. The first matched frame is the first player-controlled state in Holding Pier. The evidence folders reveal later decisions and outcomes for the reviewer.

| State reached through the actual controls | Published v26 | Review build |
| --- | --- | --- |
| First control in Holding Pier, portrait | [Before](before/390x844/holding-pier/01-first-control.png) | [After](after/390x844/holding-pier/01-first-control.png) |
| First control in Holding Pier, short landscape | [Before](before/780x320/holding-pier/01-first-control.png) | [After](after/780x320/holding-pier/01-first-control.png) |
| Inspecting the Shallows passage | [Before](before/780x320/holding-pier/02-blocked-passage.png) | [After](after/780x320/holding-pier/02-blocked-passage.png) |
| One rabbit selected before boarding | [Before](before/390x844/holding-pier/03a-single-preview.png) | [After](after/390x844/holding-pier/03a-single-preview.png) |
| Two rabbits selected before boarding | [Before](before/780x320/holding-pier/03-both-preview.png) | [After](after/780x320/holding-pier/03-both-preview.png) |
| Immediately after the action-four rise | [Before](before/390x844/holding-pier/04-after-rise.png) | [After](after/390x844/holding-pier/04-after-rise.png) |
| Undo restores the previous tide and waiting rabbits | [Before](before/780x320/holding-pier/05-after-undo.png) | [After](after/780x320/holding-pier/05-after-undo.png) |
| Selecting the passage into Rush Landing | [Before](before/390x844/far-shore/01-sail-to-rush.png) | [After](after/390x844/far-shore/01-sail-to-rush.png) |
| At Rush with the deeper projected load | [Before](before/780x320/far-shore/02-deep-party-at-rush.png) | [After](after/780x320/far-shore/02-deep-party-at-rush.png) |
| At the same berth with the lighter companion | [Before](before/780x320/far-shore/03-light-party-at-rush.png) | [After](after/780x320/far-shore/03-light-party-at-rush.png) |

Both sizes use fresh Chromium touch contexts on Windows with software WebGL and a device scale factor of one. Portrait uses normal motion and short landscape uses the operating system Reduced Motion preference. The normal root entrance starts with empty browser storage. Each shot advances through a separate tap before the player takes the helm. The Practice runs enter Far Shore directly.

The baseline Vite JS and CSS exactly match the version 26 Far Shore review. The early Holding check tapped **Next** rapidly enough to trigger the existing repeat-activation guard. The original failures are retained. The next run observed each new shot and spaced the taps to represent separate deliberate presses. Both orientations reached the gameplay handoff and completed the nine-action rescue. [First run](before/browser.json) · [Corrected baseline](before/holding-rerun.json)

The first short-landscape instrument prototype allocated 96 pixels to the route card. Its depth reading extended 30.5 pixels below the card’s clipped edge. A native Shallows selection caught the missing numbers even though the Sail and Details buttons fit. The same issue reproduced on the passage into Rush. [Original 780×320 frame](development/short-route-clipped.png) · [Measured bounds](development/short-route-clipped.json) · [Pilot asset hashes](development/short-route-build.json)

The first release server answered its startup check and then exited when its sandboxed shell closed. All four initial runs failed before entering the game. A persistent loopback-only process served the identical production files during the repeat. [Initial server-exit results](after/initial-preview-exit.json)

The first integrated release passed four UI runs, but the 780×320 group preview hid the end of the flood sentence. The consequence ended at y=244.22; its clipped scrolling area ended at y=237. The shorter sentence now puts boarding and the tide rise in order. The final phone checks measure each rendered text line against its clipping ancestors with both a single rabbit and both rabbits selected. [Original group preview](development/short-boarding-clipped.png) · [Measured bounds](development/short-boarding-clipped.json) · [Original integrated results](development/initial-release-browser.json) · [First integrated build](development/initial-release-source.json)

Every named PNG is a native browser frame. The manifests include image dimensions, SHA-256 values, source fingerprints and served minified asset hashes. Each run also records the tested sequence, including the first boarding choice, returning through the tide boundary with Undo and the four-neighbor Far Shore arrival. [Image inventory](frames.json) · [Staged gameplay checks](readability.spec.ts)

## Release play and recording

On the portrait first-control frame, Moss is visible, Harbor has a lighthouse marker and the forecast names the waiting pair beyond the right edge. All three are identifiable in ordinary short-landscape Play. The selected Shallows route shows hull need 2, passage 1 and arrival water 3. At Rabbit Pier the free group selection changes the projected load from 1/4 to 2/4. The new chooser fits its tide sentence above the commit button at both sizes. After the rise the forecast advances and the occupied-pier countdown clears. Undo restores one action remaining and the two waiting passengers.

At Rush Landing the lighter arrival hull needs depth 2 and the same berth supplies depth 3 on turn seven. With Thistle aboard, boarding Rowan would require 4 and Board is disabled. With Button aboard, it requires 3 and the single Board activation succeeds. Both loss and rescue were played from the original entrance in each size. On loss, closing the result and activating the ended tide sign reopens the loss result with Undo. Recovering eight actions made the 13-action rescue possible. Terminal Undo and redelivery preserved Far Shore’s independent unscored state.

The held phone recording runs 32.009 seconds from first control through arrival, including inspection, subset selection and the across-tide Undo. All 579 delivered frames and stereo game audio are present. The longest browser capture gap is 0.733 seconds. Full decode and file hash verification passed. Browser emulation and automated play establish behavior and readability at these sizes. A physical phone and a first-time human retest are still pending. [Uninterrupted rescue](after/390x844/holding-pier/arrival.mp4) · [Capture, decode and audio measurements](after/390x844/MEDIA.json) · [Final release runs](after/browser.json) · [Tested source manifest](after/source/1b89e7d074607195a633d5219c0920a13e2b86da5497c6c8ad16a91e387e29ff.json)
