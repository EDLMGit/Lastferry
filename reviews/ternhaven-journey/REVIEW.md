# TERNHAVEN_JOURNEY_01 — A wave from Ternhaven

After Orchard’s provisional rescue, **Continue story** accepts the crossing and opens a seven-second greeting. Juniper, Sedge and tan Fennel are already aboard the six-space ferry. It settles beside a freestanding buoy, across open water from Willow on Reed Landing. The caption names the four neighbors without giving away the puzzle. **Continue to Ternhaven** is immediately available and is the only scene action that starts gameplay.

Eight Journey coves, nine independent Practice entrances and nine scoring targets. C9–C12 and the final supper remain unavailable. The published game is still private Site v22, game `26ca0a4f7b42c3f9e809f4a6558b0df8dc0c9139`, hosting `9bde1051ecdcab851c829473b75a82f73ace3be6` ([receipt](../animal-presentation/deployment-confirmation.json)). No deployment or access change.

## Review the actual picture

| Native viewport | Beginning | Greeting | Held endpoint | Turn zero |
| --- | --- | --- | --- | --- |
| 390×844 | [Approach](lifecycle/390x844/scene-begin.png) | [Willow's paw](lifecycle/390x844/scene-greeting.png) | [Rest](lifecycle/390x844/scene-held.png) | [Playable handoff](lifecycle/390x844/playable-handoff.png) |
| 780×320 | [Approach](lifecycle/780x320/scene-begin.png) | [Willow's paw](lifecycle/780x320/scene-greeting.png) | [Rest](lifecycle/780x320/scene-held.png) | [Playable handoff](lifecycle/780x320/playable-handoff.png) |

These are captures of the root Journey, entered by continuing an exact completed-seven boundary. Frame observations beside the images record the working source digest, viewport, caption bounds, story clock and actual handoff state. [Narrow portrait](lifecycle/320x740/scene-held.png) and [desktop](lifecycle/1440x900/scene-held.png) exercise the Reduced Motion endpoint. The gallery uses the same painter but is not evidence of a played scene.

## Continuity and provenance

The branch fast-forwarded from the reviewed runtime to guidance `42e0b3a46e2f347a0e00a8dbb4240a36fa0197e0`. The evidence belongs to that parent plus the candidate's working source and identified bundles. [Save and mastery checks](SAVE_AND_MASTERY.md) cover exact legacy completions, verified non-overwriting backups, newer checkpoints, blocked writes and earned bests. The new backup family is `last-ferry.journey.v1.before-ternhaven`. Viewing Home or playing Practice performs no conversion. The first deliberate Continue plays the new scene from the beginning; a restored pending scene opens on the held recap.

The gameplay handoff is the existing production initial state: fork/Tern Buoy, turn and tide zero, Juniper/Sedge/Fennel aboard, Willow at reeds-pier, every other landing empty, no deliveries, no Undo history and a fresh attempt. Ternhaven keeps target 14, revision 1. Earlier-delivered Sedge appears in the full four-neighbor arrival. A better Practice best cannot skip the rescue or be replaced by a worse replay.

## Original findings and limits

The [first portrait](art-first/390x844-greeting.png) and [first short-landscape](art-first/780x320-greeting.png) revealed two legibility issues: the rabbit's muted coat blended into the water, and Willow's raised paw crossed her face. The revised illustration uses a warmer tan, a clearer paw silhouette and more space between the boat and shore. Existing shots keep their palette and poses.

The [first lifecycle run](originals/scene-first.json) also reported Chromium's refusal to resize a fullscreen desktop window. The test now verifies actual fullscreen entry and exit, then rotates the emulated viewport with Settings still open. This separates two supported actions rather than claiming a physical rotation while fullscreen. Hide/recovery uses a simulated visibility change. Phone-size emulation does not establish physical Android performance, acoustic approval or spoken screen-reader behavior. The animal pass's recorded cost and source-audit qualifications remain in its [independent review](../animal-presentation/INDEPENDENT_REVIEW.md).


## Verification and actual play

- **Minified release:** [Actual Orchard → Ternhaven → endpoint route, recording and reproduction](GAMEPLAY.md). Both rescues were played from a legitimate Orchard cove checkpoint. Orchard finished in 12 actions; Ternhaven in 14. The trip included free inspection, tide Undo, Sedge’s early delivery, dismissal and inspection of the provisional result, terminal Undo and redelivery. The [four-neighbor arrival](gameplay/390x844/ternhaven-arrival.png) reports two current lanterns and keeps the stronger prior Practice best. [Accepted endpoint](gameplay/390x844/eight-cove-endpoint.png) · [Home after reload](gameplay/390x844/eight-cove-home-reload.png) · [uninterrupted recording with game audio](gameplay/390x844/scene-to-acceptance.mp4).
- **Build and preservation:** Node 24.15.0 on Windows. `npm run build` (includes TypeScript), `npm run check:assets` and six catalog unit tests passed. All 82 catalog IDs were retained. The [audit](AUDIT.json) pins both minified bundles and 101 unchanged Git blobs: levels and witnesses, rules, scoring, animals, portraits, ferries, movement, lanterns, audio and the v22 receipt. Vite’s chunk-size advisory remains.
- **Units:** 213 distinct focused progress, registry, mastery, arrival, puzzle and presentation tests passed across the first run and scoped correction. See the [save results, exact commands and original failure](SAVE_AND_MASTERY.md). A one-lantern rescue can complete the Journey. The [art review](ART.md) includes 54 matched renders of the nine previous shots; all matched the prior pixels.
- **Phone scene and saves:** [Five browser cases](lifecycle/results.json) passed at DPR 1, Chromium 156.0.8078.4 with SwiftShader. They checked the beginning, greeting, held endpoint, exact handoff, 320px fit, desktop fit, transcript, Pause/Resume, Skip, Reduced Motion, recap, natural keyboard focus, fullscreen entry/exit, rotation and Settings/hide recovery. Home/Practice and direct Practice preserved representative active, completed-seven and historical Journey bytes. Reproduce with a fresh Vite dev server on port 5334, then `node node_modules/@playwright/test/cli.js test -c reviews/ternhaven-journey/lifecycle.config.ts`.
- **Supplemental historical check:** the minified Reef → Orchard rescue and continuation passed. The separate older completed-six Orchard capture did **not** pass end to end: successive runs missed a timed cue, measured hidden Details content, or sampled Orchard after its expected mid-shot window. The original results and bounded reruns are [retained](SAVE_AND_MASTERY.md). The new Ternhaven scene checks and minified route passed independently.

The selected uninterrupted take is 82.884 seconds with runtime stereo audio. It keeps all 1,130 delivered frames; the longest capture gap was 4.966 seconds between the held greeting and playable handoff. Both takes passed the minified route. [Media audit](gameplay/MEDIA.json). All 147 captured runtime input digests matched the working tree again before commit.
