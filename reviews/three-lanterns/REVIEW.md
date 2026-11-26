# Three lanterns

The optional result recognizes a rescue, a rescue within its authored action target, and that efficient rescue without a successful Undo. The eight accepted Practice coves share their corresponding Journey bests. First Crossing is independent training. Orchard remains Practice-only, and the six-cove Journey retains its saved progress and order.

## Source and implementation

The checkout was clean at accepted runtime `9933303178da04cac93ddc820ef55e181286d983`. It fast-forwarded to task and continuity commit `19ac9654b9e974e79effee6d863edf9a2bd08f04`. The implementation adds Session attempt history and a separate mastery store. The production reducer, level data and witnesses retain their accepted bytes.

Successful Undo history is separate from the rewindable puzzle state. Discarded branches therefore leave the ordinary final action count intact while recording the Undos actually used. Unavailable and busy inputs do not count. A completed Restart starts a fresh attempt.

A real committed rescue becomes provisional after its visible arrival finishes. Opening Settings, Choose a cove, or a Home confirmation keeps it provisional. Terminal Undo withdraws it. Redelivery uses the same attempt history. Actual Continue story, cove navigation, confirmed Home or successful Restart accepts the result once.

The `last-ferry.mastery.v1` record stores each cove’s best under its stable identity and scoring revision. Revision 1 adopts the eight independently reviewed targets. Higher lantern count wins, followed by fewer final actions and then fewer successful Undos. Each best is one actual accepted run. Previously stored revisions stay available in storage and cannot appear as the current best. Invalid or inaccessible records leave play usable with a notice that new results last for the visit.

Practice navigation now mounts its destination within the same app. Direct entrances keep the matching `?cove=` address, and confirmed Home returns to the root. This preserves the in-memory best and existing Sound owner when storage is unavailable. Direct Practice reads Journey progress only after the player returns Home. The strict Journey schema and existing backups retain their previous implementation.

The result card shows the current rescue’s lanterns, actions and successful Undos. A different previous best appears separately. Practice rows show accepted bests or an honest unrated label. Criteria and authored targets are inspectable in Practice and the crossing menu. The new original `ui.mastery-lanterns` family uses outlined glass for an unearned lantern and filled glass with a flame for an earned lantern. All earlier 80 asset IDs remain.

## Verification

The production build, standalone TypeScript and asset validator passed on Node 24.15.0. Vite retained the existing large-bundle warning. The inventory contains 81 families, with all 80 earlier IDs preserved. The 44 new mastery checks plus 15 rule and 64 Journey checks passed, including every one of the 24 authored winning witnesses. The original explicit-Practice read/write isolation browser test also passed. [Commands, checks and release bundle](checks.json)

The acceptance checks exercise all three outcomes through actual controls. Orchard’s clean 12-action route earns three provisionally. Terminal Undo and redelivery retain 12 final actions and record one Undo, giving two. A safe extra action before Holding’s delivery gives one. The minified build uses Orchard’s 13-action Spring Steps alternative. The development target table and puzzle witnesses retain their accepted values.

All seven focused browser cases passed on the final implementation, without retries (143.041 seconds). They cover current versus better accepted results, actual Restart/Home/cove/story acceptance, cancelled menus, natural keyboard focus and Settings return, reload and New Journey, exact legacy-save isolation, corrupt and blocked score storage, actual fullscreen entry/exit, rotation, motion/Tips changes, visibility recovery and restored story backgrounds earning no score. [Final browser results](automation-results.json) · [Minified rescue and bundle identity](release/build.json) · [Lifecycle evidence](lifecycle/history-and-restored-scene.json)

Captures were produced from the task HEAD plus the implementation working tree, not from a later commit. The final 129-input runtime manifest is SHA-256 `a7d5fe49691a6c28a0ea7482de8df7554891a8c93bcbedaced4d9dce3fe17f1f`. Its input and test hashes were rechecked before committing; only documentation and evidence changed afterward. The minified JavaScript bundle is SHA-256 `140c958e0768401d94acc7f7f255c6fc3b0cf778066ac0a48cc8bc326b34f54e`. Chromium 156.0.8078.4 on Windows used emulated touch, DPR 1 and SwiftShader. [Exact source manifest](source/a7d5fe49691a6c28a0ea7482de8df7554891a8c93bcbedaced4d9dce3fe17f1f.json) · [Environment and reproducible command/configuration](ENVIRONMENT.json)

All 129 runtime inputs and six test/configuration inputs also matched the staged source after CRLF/LF normalization. Six text files differed only in those line endings; there was no implementation delta between capture and staging.

| Native frame | Observed result |
| --- | --- |
| [390×844 criteria](390x844/criteria.png) | Expanded rules and authored target fit after dialog repositioning. |
| [390×844 provisional three](390x844/three-provisional.png) | Clean 12-action Orchard rescue with zero Undos. |
| [390×844 redelivery](390x844/two-redelivery.png) | Same final action count, one successful Undo, two lanterns. |
| [390×844 accepted Practice](390x844/accepted-practice.png) | Full cove names, compact best, historical rescue honestly unrated. |
| [780×320 current and best](780x320/best-comparison.png) | Two-lantern replay distinguished from the earlier three-lantern best; primary action and Undo remain visible. |
| [320×740 one lantern](320x740/one-provisional.png) | Over-target rescue retains normal completion and controls. |
| [320×740 targets](320x740/practice-criteria.png) | All eight targets are reachable through the native panel scroll. |
| [1440×900 legacy Practice](desktop/legacy-unrated.png) | Old completion does not invent action or Undo history. |

The [uninterrupted 390×844 recording](390x844/rescue.mp4) contains the actual Orchard rescue, provisional three, Settings/menu return, terminal Undo, two-lantern redelivery, Restart acceptance and the accepted Practice marker. Its 45.386 seconds retain all 445 delivered native frames with simultaneous stereo runtime audio, without cuts, time changes or gain adjustment. All frames decoded successfully. Native browser capture gaps remain (maximum 0.733 seconds); this is interaction evidence, not a smoothness or phone-performance measurement. [Recording provenance and checksums](MEDIA.json)

## Native presentation and limits

The native checks cover 390×844, 780×320, a 320px portrait, and a desktop view. Practice scrolls as one panel on short screens. Result cards keep continuation, Settings, Undo and Restart reachable while their details can scroll. At 780×320, a different best’s complete statistics require a short scroll inside the result body.

The initial Practice footer extended outside short landscape and compressed the expanded criteria. It now uses a single scroll region. A later vertical assertion found that expanding the crossing-menu criteria enlarged the card below its previous position. Observing the dialog’s actual size now repositions it within the viewport. The original criteria failure and frame are retained. Other early test failures concerned a missing local browser, a hidden versus removed-dialog expectation, a closed More disclosure and an incorrect Bellwater label. [Original runs](original-runs/README.md)

Chromium phone emulation and SwiftShader establish these recorded interaction and layout outcomes. Physical-phone performance, phone-speaker listening and spoken screen-reader testing remain unverified. Background recovery is tested through a simulated visibility event on the actual moving game. Fullscreen uses the browser’s actual fullscreen element. Earlier capture and geometric-sweep timing limitations remain in their historical reports. [Previous Orchard evidence](../orchard-difficulty/REVIEW.md)

## Publication and local play

The private Site still serves version 19, game `f0ffe2c12f1cc0e42ad7ef10a4b57dd29097c731`, hosting source `1ea40b815911a0fc1131350ee34125ae3508396e`. Its custom private audience and publication history retain their confirmed receipt. [Publication record](../mobile-map-readability/deployment-confirmation.json)

Use Node 24. From the repository root, run `npm ci`, then `npm run dev -- --port 5270 --strictPort`. For the minified build, run `npm run build` and `npm run preview -- --port 5281 --strictPort`.

Disposition: implemented and ready for review. No known failing focused check remains; physical-device, listening and screen-reader limits above remain open. Publication awaits review.

[Local Journey](http://127.0.0.1:5270/) · [Local Orchard Practice](http://127.0.0.1:5270/?cove=orchard-landing) · [Authored target rationale](../three-lanterns-preparation/TARGETS.md)
