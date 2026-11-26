# Far Shore on the phone

At Tide Steps, Thistle and Button are both close to home. Which one can ride with the ferry on its next trip? Both single-passenger choices let the first trip succeed. The free forecast names the passengers on the far bank and shows how much water their berth will have. [Opening chooser](780x320/tempting-action.png) · [Portrait forecast](390x844/decision-forecast.png) · [Short landscape forecast, scrolled to Rowan](780x320/forecast-rowan.png)

| Actual state | 390×844 portrait | 780×320 short landscape |
| --- | --- | --- |
| First dock, released Play view | [Start](390x844/start-play.png) | [Start](780x320/start-play.png) |
| The first passenger selection | [Button selected](390x844/tempting-action.png) | [Button selected](780x320/tempting-action.png) |
| Turn 7, Thistle beside Rowan | [Rush berth](390x844/settled-rush-thistle.png) | [Rush berth](780x320/settled-rush-thistle.png) |
| Turn 7 revisited with Button | [Same berth](390x844/settled-rush-button.png) | [Same berth](780x320/settled-rush-button.png) |
| Rowan boards before the flood | [Turn 8](390x844/rowan-aboard.png) | [Turn 8](780x320/rowan-aboard.png) |
| All four safely home | [Arrival](390x844/arrival.png) | [Arrival](780x320/arrival.png) |

## Watch the actual rescue

[Uninterrupted portrait recording with runtime audio](390x844/arrival.mp4). At **0:29** the dock shows why Rowan cannot board. At **0:31** the landing floods. Eight Undos bring back the original decision by **0:34**. At **1:01** the boat returns to the same berth with the other companion. Rowan is aboard at **1:03**. The four-passenger unscored arrival appears at **1:28**. Both phone runs then withdrew the victory with terminal Undo and delivered everyone again. The recording ends at the first arrival.

The 89.53-second movie contains all 1,299 native browser frames ordered by timestamp and the game’s simultaneous stereo output at its original gain. The longest capture stall lasts 3.50 seconds just after Rowan boards. Across the recording, 4 native frame intervals exceed one second. The MP4 passed a full decode. Audio presence and levels were measured. Subjective listening on phone speakers and physical Android performance await playtest. [Stream measurements and event times](MEDIA.json)

## Record identity and inspection

Windows, Node 24.15.0, Chromium 156.0.8078.4 with SwiftShader, DPR 1 and touch emulation. The recorded portrait run uses normal motion. The short landscape run uses Reduced Motion. Both checked the actual minified files served by Vite, used the production controls, matched the visible turns and loaded all four arrival figurines. [Touch run results](browser.json) · [Portrait trace](390x844/run.json) · [Landscape trace](780x320/run.json) · [Source and served bytes](source/79dcf1a51fa26140765c1be75d2325d2f0ab9f13c2b86d97c19249f06587b431.json)

The two actual turn-seven dock states were revisited on both sizes and captured after an additional 1.8 seconds in released Play. Landscape has space for the berth requirement and remaining action to be visible together. Portrait shows the entire route around Rush with smaller animals at that dock. The opening forecast in short landscape scrolls within its panel. A wheel scroll exposed Rowan’s full passenger-size row with action count still zero on dismissal. The original follow-up check applied a 100% viewport requirement for a touch target to the list-item box, obtaining 99.79%. The revised inspection tests the actual text rectangles inside the panel following a scroll. Its first discovery attempt also required adding Node’s JSON import attribute to the supplemental script. [Original follow-up](settled-first.json) · [Corrected landscape inspection](settled.json) · [Native dimensions and SHA-256 for each retained image](frames.json)

The first prototype had the later flood at action nine. Its real 14-action phone run is preserved with the original level and compiled-bundle identity. [Prototype trace](development/390x844/run.json) · [Prototype framing after staging](development/390x844/after-staging.png)
