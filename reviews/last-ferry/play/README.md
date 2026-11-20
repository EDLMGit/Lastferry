# At the helm of Last Ferry

[Open Last Ferry in local Practice](http://127.0.0.1:5410/?cove=last-ferry) · [Enter through Home](http://127.0.0.1:5410/)

The playtest frames below reveal the pickups. The direct link opens at turn zero with the ordinary controls.

| Moment | 390×844, normal motion | 780×320, Reduced Motion |
| --- | --- | --- |
| Opening in Play view | [Final group at their two islands](390x844/01-opening.png) | [Opening coast](780x320/01-opening.png) |
| The first pair chosen | [Portrait](390x844/03-first-pickup.png) | [Landscape](780x320/03-first-pickup.png) |
| Everyone aboard | [Full deck](390x844/04-full-deck.png) | [Full deck](780x320/04-full-deck.png) |
| Lantern Buoy to Harbor | [Under way](390x844/06-last-approach.png) · [Light and loaded deck](390x844/06b-channel-light.png) | [Captain’s route inspection](780x320/05-harbor-passage.png) |
| Docked, waiting for the captain | [Portrait](390x844/07-docked.png) | [Landscape](780x320/07-docked.png) |
| Practice arrival | [Portrait](390x844/09-arrival.png) | [Landscape](780x320/09-arrival.png) |

**Watch the lighthouse approach.** [Native-speed approach excerpt](390x844/lighthouse-approach.mp4) · [Uninterrupted complete rescue with runtime audio](390x844/arrival.mp4) · [Timestamps and audio measurements](MEDIA.json)

The whole trip runs 41.714 seconds. The four animals are aboard at 0:21.62, the captain takes the Harbor passage at 0:29.74, the ferry is docked at 0:34.44, and everyone is ashore at 0:39.51. The separate 5.93-second excerpt shows the passage and pause at the dock. All 524 captured frames decoded with stereo game audio. The longest capture gap was 0.600 seconds.

On the final portrait opening the rabbits and the woolly and brown pair are visible on opposite sides of the cut. In short landscape both pairs, both pier names and the Harbor marker are visible; the tower itself is behind the upper-left instrument at turn zero. On the final approach the lighthouse and all four aboard are in the same frame. The forecast reads “No more tide rises” after pickup in both routes. [Opening comparison](prototype/390x844/01-opening.png) · [Final portrait](390x844/01-opening.png) · [Loaded return](390x844/06b-channel-light.png)

The portrait run chose **Home → Practice → Last Ferry** and took the rabbits aboard first. The short-landscape run opened the independent Practice link, inspected both waiting groups at turn zero, brought the larger pair aboard first and inspected the shallow cut before taking the outer water. Undo restored the turn before the first tide rise. At Harbor, both runs paused with everyone still aboard. The named Bring home action produced the unscored four-neighbor arrival. Terminal Undo returned everyone to the boat and redelivery reproduced the same result. [The cut with the larger pair](780x320/03b-loaded-cut.png) · [The last delivery chooser](780x320/08-bring-home.png)

The prototype was also played all the way through. Its final crossing still showed a countdown for the empty landing, while its initial portrait framed the refuge and left the pickups offscreen. [Original frames and observations](prototype/OBSERVATIONS.md)

Both release tests run the minified production game in Chromium touch emulation with software WebGL at device scale factor 1. Every turn was committed through a visible control and compared with the production reducer. The route readings, capture dimensions, image checksums, served bundle hashes and source manifest identity are recorded per run. Default Tips remained Off. A physical phone and an independent player’s reaction are separate playtests. [Portrait run](390x844/run.json) · [Short-landscape run](780x320/run.json) · [Browser results](browser.json)

Both runs passed in 1.4 minutes on Node 24.15.0 and Chromium 156.0.8078.4 with zero page errors. All 19 native frame dimensions and SHA-256 digests were verified. The working-tree source fingerprint was `5446f672fca58dd18b73256e5485785427f1966b64c67467ebec828853310ca9` before and after each run. [Inputs, runner and served bundle hashes](source/5446f672fca58dd18b73256e5485785427f1966b64c67467ebec828853310ca9.json)

Use Node 24, serve the tested minified build on port 5410, and set `REACH_DIST` to the corresponding build directory if it is outside `dist`. From the repository root:

```sh
npx playwright test -c reviews/last-ferry/play/config.ts
node reviews/last-ferry/play/encode.mjs
```
