# Arrival bubble — independent review and publication

## Disposition · 17 November 2026

**Accepted for the existing private playtest within the reviewed scope.** No blocking defect was found in the source, focused execution, reproduced build or the three inspected native frames. Game commit `a2740e61ec5a782f558ea6caad4181466d04e9f7` is published as **Site version 21**, hosting source `ea3bed5c0aaf41e4ba516e4621da0f81119e652b`.

[Play Last Ferry](https://last-ferry-playtest.abumech.chatgpt.site) · [Publication receipt](deployment-confirmation.json) · [Original implementation review](REVIEW.md)

The original implementation review remains an accurate record of the handoff before publication. This review adds independent findings and the actual publication; it does not rewrite original failures or turn emulated checks into physical-device approval.

## The requested presentation

The inspected committed frames are actual contributor rescues at 390×844 and 780×320 for Ternhaven, plus a 320×740 Holding Pier Journey rescue. They show the requested centered floating composition, large original lanterns, named rescued neighbors and clear forward/Replay actions in Last Ferry's coastal style. Portrait gives the crew a two-by-two showcase; short landscape gives the crew and rewards separate space within the same centered card. The narrow frame shows a distinct unlit lantern, three named neighbors and reachable result actions.

All four Ternhaven neighbors are visible, including Sedge from the earlier delivery. The images show no clipped crew name, reward crown or primary action in these inspected states. The card intentionally covers much of Harbor. This is an accepted presentation tradeoff for the result; dismissal exposes the settled world.

| Inspected frame | Exact Git blob |
| --- | --- |
| [390×844, Ternhaven](gameplay/390x844-three.png) | `32a9edf6f2cac82d0d7d66db294da328236a2c71` |
| [780×320, Ternhaven](gameplay/780x320-three.png) | `455181278ca08f11cf74dbd4d66782876f7e879d` |
| [320×740, Holding Pier](320x740/journey-two.png) | `2ab61e09eeb15639e47cd2065d3eca346735891e` |

These are independently inspected contributor captures, not a fresh browser run. Image bytes were downloaded at the pinned implementation and checked against Git blob identities.

## Source and independent execution

[Lifecycle and scoring review](LIFECYCLE_REVIEW.md) found the established acceptance owners unchanged. The rescued cast uses required IDs intersected with actual delivered IDs; current-run lanterns stay separate from accepted bests. Won-only positioning and Harbor framing do not replace ordinary action-card placement. The brief arrival animation belongs to a completed transaction, with cancellation and settled reopening.

The target addition is exactly **Ternhaven, revision 1, target 14**. A selected 36-file protected comparison confirms unchanged puzzles/data, rules/Session, appearance helpers, campaign/progress and audio against the task parent. [Protected manifest](independent-protected-source.json)

Fresh Node 24.22.1 exact-source replay reproduced all three Ternhaven witnesses at **14 / 14 / 13 actions**, each earning three lanterns, then two after terminal Undo/redelivery. Early Sedge and the complete delivered identity set remained present. Four additional check groups cover prior raw bests, synthetic restored wins, lower-current/better-best results, failed persistence and generic unscored behavior. [Results](fresh-session-storage-results.json) · [15-file execution manifest](execution-source-manifest.json) · [Reproducible check](independent-session-check.mjs)

The reproducible check changes only repository-relative import/output paths from the temporary review harness. Game code and assertions are unchanged. Its repository-relative rerun passed and produced results identical to the preserved original execution JSON. Run it from the repository with Node 24: `node --experimental-transform-types reviews/arrival-bubble/independent-session-check.mjs`. Its output is a new local review result, not a replacement for the preserved original execution JSON.

## Fresh publication validation

The existing Site source was opened through the supported Sites workflow. Its hosting identity, static output and access policy were retained. All **525 non-review GitHub blobs** selected from the current tree match exactly. The 526th input is the already-existing preview-only `terminal.local` allowed-host setting in `vite.config.ts`. All **135** captured runtime inputs match the final staged hashes except that same configuration adaptation. No gameplay source was edited for publication. [Source audit](PUBLICATION_SOURCE_AUDIT.json)

A fresh dependency installation and production build, including TypeScript, succeeded. **180 focused unit checks across nine files passed**. These cover Session/mastery, Ternhaven, generic unscored Practice, Journey/Orchard progress, homecoming, framing and arrival presentation. The existing large-bundle warning remains.

The production artifacts match the contributor's final reported build byte for byte:

| Artifact | SHA-256 |
| --- | --- |
| `index-nKQpoEle.js` | `e720078df7235229fb334ad17331b371ce3fef8d5d9e4915257a64629fbfde55` |
| `index-BTw6r7z5.css` | `7f3ddf5ea7153d49b07f93a5e9feb1677da9e5f5e2ce53ec6c3cd03c978e138b` |

[Build, commands and focused unit output](PUBLICATION_BUILD_AUDIT.json). The five asset-catalog unit checks and complete evidence-filesystem validation were not rerun in this publication source subset. The contributor's **185 focused checks, 82 families and eight distinct browser cases** remain separately attributed in the original review.

## Publication and limits

Native Sites publication returned **succeeded** for version 21. A follow-up Site read confirms the existing custom private access policy is exactly unchanged, including its one external viewer. No recipient contact details are stored here. The playtest URL opened to its expected ChatGPT sign-in gate in the review browser; no login or fresh browser gameplay was performed.

Physical-phone testing, fresh acoustic listening and spoken screen-reader checks remain unverified. The contributor's selected 14.546-second recording and its gaps/audio audit remain the implementation evidence; this review does not claim a new recording or listening approval.

## Next contained step

Commission [TERNHAVEN_JOURNEY_01](../../NEXT_TASK_TERNHAVEN_JOURNEY.md): append the accepted Practice puzzle after Orchard, add one truthful illustrated encounter, and extend exact completed-seven saves only through deliberate Continue with original-byte backup. The published game still contains **seven Journey coves and nine Practice entrances**. The new task is guidance, not completed runtime.

Keep PR #1 draft and GitHub main unchanged. C9–C12 remain future work.

