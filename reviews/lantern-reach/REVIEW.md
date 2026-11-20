# Lantern Reach

Lantern Reach is an independent, unscored Practice cove. Flax starts aboard at Signal Quay. Tallow and Ember wait at low Wick Landing. Its inlet admits the two-space load outbound. Once the rabbits board, the first rise makes the inlet deep enough for the full four-space ferry to return.

## The decision

After the pickup the player can take the newly deepened inlet back to Signal Quay and spend an action swinging the bridge clear, or use Wick Race to leave by the outer floats before the current turns. The physical bridge and the route inspection both show whether Harbor passage is open. Operating the handwheel changes the state of this attempt only.

| Production search | Minimum rescue |
| --- | ---: |
| All legal actions | 6 |
| Closed bridge throughout | 7 |
| Allow opening, forbid sailing through its passage | 7 |
| Forbid sailing Wick Race | 6 |
| Open on action one | No rescue reachable |

The unrestricted search visited 258 distinct states and followed 893 legal transitions. The five states reachable after opening first have no victory. Wick floods after action two, so the player can still reach the rabbits but cannot board them in time. After the final scheduled rise, states with identical boat, passengers, bridge, outcome and tide have identical futures regardless of the absolute turn. The search uses this equivalence to exhaust the graph without a depth or wait limit. The proposed five/six-action pair was too short for the authored map. Neither result is a mastery target. [Production proof](proof.mjs) · [Search output](proof.json) · [Both rescue witnesses and the losing opening](../../data/lantern-reach/witnesses.json)

## Evidence and verification

| Check | Result |
| --- | --- |
| Node 24.15.0, TypeScript and Vite production build | Passed. Vite reported the existing bundle-size advisory. |
| Full unit suite | 696/696 across 60 files with one worker and the normal timeout. An earlier two-worker run during browser capture had 693 passes and two 5-second timeouts in water teardown and negative asset validation. Both passed separately on the original timeout. The final suite also includes the moving-leaf clearance test added during review. |
| Asset inventory | 83 valid unique families. All 82 earlier IDs are retained. The original procedural `model.swing-bridge` family contains the span, hinge, bridgeheads and quay station. |
| Minified phone rescues | 2/2 passed in Chromium 156.0.8078.4. At 390×844 the loaded ferry operated the bridge and delivered on turn six. At 780×320 the first opening led to loss, two Undos recovered both passengers and bridge, and the closed detour delivered on turn seven. Both rescues passed terminal Undo and redelivery. [Actual inputs and images](gameplay/README.md) |
| Minified keyboard, Restart and storage | 2/2 passed at 320×740 and 1440×900. Natural Tab, Enter and Escape opened and dismissed a free preview. Confirm, Undo coverage in the rescue runs, Restart, Home Practice and direct entry used ordinary controls. The completed-eight and historical-seven saves, stored bests and original backups retained their exact bytes. The seeded protected keys received zero writes. [Results](isolation/results.json) |
| Physical span and recovery | Both berth headings cleared the moving leaf across 1,001 sampled positions. The occupied hull cleared every passage in both directions as applicable. The live normal-motion, reduced-motion, Undo, Restart and background recovery check passed. [Frames, observations and original failures](world/README.md) |

### Native evidence

[390×844 start](gameplay/390x844/start-play.png) · [Moving span](gameplay/390x844/swing-frame.jpg) · [Open passage](gameplay/390x844/open-passage.png) · [780×320 detour](gameplay/780x320/detour.png) · [320×740 signal preview](isolation/320x740/signal-preview.png) · [1440×900 start](isolation/1440x900/start.png)

The initial portrait crop hid part of the span. The final Signal Quay framing includes the full sweep, ferry and waiting rabbits. At 320 pixels wide the confirmation wraps inside its card and the one-action button stays on screen. At desktop size the opening view includes all six stops. [Original phone frame and superseded runs](preflight/OBSERVATIONS.md)

[Uninterrupted portrait rescue with runtime audio](gameplay/390x844/bridge-rescue.mp4) · [Capture metadata](gameplay/MEDIA.json). The 23.77-second clip includes all 356 recorded frames. Its longest native capture gap is 383 ms. Browser emulation and software WebGL establish input and composition at these sizes. Physical Android performance, human listening, spoken screen-reader behavior and player appraisal of difficulty remain open. The historical full browser suite was not rerun.

### Reproduction and source

From the repository root run `npm ci`, then `npm run build` and `npm run preview -- --port 5370 --strictPort`. Open [Lantern Reach](http://127.0.0.1:5370/?cove=lantern-reach) or the [root Journey](http://127.0.0.1:5370/). Both phone rescues ran against the minified entry `index-CiF04D6R.js`. Each run fetched and hashed the served JS and CSS. The four viewport checks identify the same release JS.

The evidence came from the implementation working tree over `e583ec29578e7561c0a8ab8fe6e3b08275d44ac2`. Of 152 captured inputs, 142 matched Git byte for byte and ten differed only in Windows line endings. The audit also compared all 24 previous data files, mastery, Journey progress, session, portraits and audio to that baseline. Run `node reviews/lantern-reach/verify-evidence.mjs` after building to repeat the comparison. [Audit](source-audit.json) · [Source manifest](gameplay/source/29b232d80259d1ed929d7236803b200c44c6ba207eec091187a97222b98c58c4.json)

## Publication

Private Site v23 still serves the reviewed Ternhaven game `1e3146652f50c88db1ce7d56c6de14e311aab719`. [Publication receipt](../ternhaven-journey/deployment-confirmation.json)
