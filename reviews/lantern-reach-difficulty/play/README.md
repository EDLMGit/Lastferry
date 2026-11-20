# Lantern Reach on the phone

**At Wick Landing, would you board the two rabbits?** They are standing beside your empty six-space ferry. Sorbus is across the channel at Lantern Steps. Tap the forecast to compare their deadlines before spending the next action.

| What the player sees | Portrait · 390×844 | Short landscape · 780×320 |
| --- | --- | --- |
| The empty deck, both landings and the current | [Turn six](390x844/decision-before.png) | [Turn six](780x320/decision-before.png) |
| The free forecast with the two clocks and open bridge | [Forecast](390x844/decision-forecast.png) | [Forecast](780x320/decision-forecast.png) |
| The two rabbits in the boarding chooser | [Passenger choices](390x844/tempting-action.png) | [Passenger choices](780x320/tempting-action.png) |

<details>
<summary>What both playthroughs showed</summary>

The first trip to Signal let us open the bridge and take Flax home before returning empty. At Wick, boarding Tallow and Ember fits comfortably. It uses the first of the two actions left before Lantern Steps floods. Sailing to Sorbus uses the second. We arrived in time to see him but too late to board him. The current reverses on that same action.

| Observed result | Portrait | Short landscape |
| --- | --- | --- |
| Rabbits aboard, Sorbus still ashore, one action left | [After boarding](390x844/decision-after.png) | [After boarding](780x320/decision-after.png) |
| Sorbus stranded | [Actual loss](390x844/mistake-consequence.png) | [Actual loss](780x320/mistake-consequence.png) |
| Two Undos restore the empty ferry at Wick | [Recovered choice](390x844/undo-restored.png) | [Recovered choice](780x320/undo-restored.png) |
| Take the passage immediately, then board Sorbus before the rise | [Sorbus aboard](390x844/sorbus-aboard.png) | [Sorbus aboard](780x320/sorbus-aboard.png) |
| All four safely home, unscored | [13-action arrival](390x844/arrival.png) | [13-action arrival](780x320/arrival.png) |

The short-landscape run then used Replay for an independent opening. It boarded just Tallow at Wick. Flax, Tallow and Sorbus then filled all six spaces. The ferry brought this group home around the outside and returned for Ember, delivering on turn 17 with the bridge closed throughout. [Opening subset](780x320/reserve-room-choice.png) · [Six spaces used](780x320/reserve-room-full.png) · [Second rescue](780x320/outer-arrival.png)

</details>

[Uninterrupted portrait playthrough with runtime audio](390x844/arrival.mp4) · [Timestamps, frame gaps and audio measurements](MEDIA.json). At **0:28.5** the empty ferry returns to Wick. The loss appears at 0:42.7, Undo restores the fork at 0:45.5, and Sorbus is aboard at 0:53.8. The 82.18-second video retains all 1,137 native frames, ordered by their capture timestamps. The largest gap is 0.517 seconds. The master output was captured at its runtime gain and encoded as 48 kHz stereo AAC. The recording used normal motion. The separate landscape run used Reduced Motion.

## Verification and provenance

The actual minified Vite build ran in Chromium touch emulation at device scale factor 1 with SwiftShader. Each touch committed through the ordinary controls. The browser fetched the JS and CSS and compared their bytes with the build output. The test checked that the development API was absent and verified the working source digest before and after each complete phone run. The turn, tide, boat location and load displayed after each action matched the production reducer. The discarded alternatives, no-win proof and minimum are separate from these observed UI results. These engineering checks do not establish physical Android performance, speaker balance or human difficulty approval.

- [Portrait input, actual outcomes and clock](390x844/run.json) · [Short-landscape input, actual outcomes and clock](780x320/run.json)
- [2/2 minified browser results](browser.json) · [Captured runtime inputs and served bundle hashes](source/838d626e8b0904eb87a0d6910ddf84b3df2300a2d6cf15d6f212fce170b26c7c.json) · [Native frame SHA-256s](frames.json) · [Superseded checks](PREFLIGHT.md)

To reproduce, run `npm run build` and `npm run preview -- --port 5380 --strictPort` at the repository root. In a second terminal run `npx playwright test -c reviews/lantern-reach-difficulty/play/config.ts`. Run `node reviews/lantern-reach-difficulty/play/encode.mjs` to encode the portrait capture using ffmpeg and ffprobe. Raw samples stay in the ignored local recording directory.
