# Seven-cove Journey publication review

**Reviewed game:** `9c7a05785a021538c996f5dcd4b03415d1a35080`  
**Published:** Site **version 20**, 14 November 2026 UTC  
**Disposition:** suitable for the next Android playtest; no blocking issue found in the scoped review.

[Play the private Site](https://last-ferry-playtest.abumech.chatgpt.site) · [Exact publication receipt](deployment-confirmation.json) · [Codex implementation review](REVIEW.md)

## Decision and next checkpoint

ORCHARD_JOURNEY_01 is complete and the reviewed runtime is now published to the existing Site. Its custom private audience and one previously authorized external viewer are unchanged. No contact details or visitor identifiers are recorded here.

The next checkpoint is human play of the seven-cove Journey on Android, before commissioning C8. A returning player should use Continue in the same browser and Site; a completed-six save presents the Orchard continuation. Practice remains independent and includes all eight coves, including First Crossing. New journey is available for a deliberate full replay.

This review does not commission another level, rebalance Orchard, or claim completion of the twelve-cove story.

## Integration and scene findings

The Journey appends Orchard after Reef. The exact source comparison with task baseline `007bbabf24d5c859e6786b1b679a77fd5b5799cf` changes no protected gameplay data, reducer, level-loader, gameplay scene, audio or gameplay UI files. Orchard's accepted twelve- and thirteen-action approaches, target **13**, and mastery identity **orchard-landing@1** remain intact.

The illustrated encounter tells the truth about the playable handoff: Pomme and tan Medlar wait ashore at Spring Steps, the six-space ferry is empty, and Orin waits across the water. His head and forehoof acknowledge the approaching ferry. The existing story controller/view, immediate Continue, Skip without acknowledgment, Pause, recap, Reduced Motion and sound ownership remain. A scene spends no action and performs no rescue.

Nine committed native frames were inspected across portrait, short landscape and the narrow storage-failure layout. The caption and named Continue control remain readable, the two shores are supported, and the seven-cove endpoint explicitly says the remaining coast is still to come. This is still-image review, not a fresh movie or physical-phone pacing judgment.

## Fresh verification

- **149/149 exact-source core tests passed**, without reruns: Orchard progress 22, general Journey progress 64, story presentation 19 and mastery 44. The mastery cases replay all 24 accepted winning witnesses.
- Thirty-four extracted test/source inputs matched their Git blobs; twenty protected rule/loader/level/witness inputs still match accepted `9933303`. Mastery and Session match reviewed `14f1286`.
- Save coverage includes exact old-six recognition, read-only Home/Practice, explicit continuation, raw-byte backups and collisions, earlier migrations, newer-checkpoint races, storage failure, pending-scene restoration, Practice best carryover and terminal Undo/redelivery.
- Fresh Node **24.22.1** dependency installation and production build/TypeScript passed. The built main bundle matches the implementation's recorded SHA-256 exactly: `29413607bdfd41770c485cb79773a79e7987c795dd84ed070bfaf6e308e4db34`.
- The hosting checkout audit covers **263** runtime/asset/data/test/tool/build inputs including the imported target fixture: **262** exact Git blobs and one retained, declared hosting adaptation in `vite.config.ts` (`server.allowedHosts: ['terminal.local']`). No gameplay adaptation was made.
- The existing custom access policy was identical before and after publication. Native deployment returned **succeeded**, the saved version and live URL. The live URL opens the expected private sign-in gate in the review browser.

[Independent core results](INDEPENDENT_CORE_REVIEW.md) · [Exact core input manifest](FRESH_SOURCE_MANIFEST.json) · [Publication source audit](PUBLICATION_SOURCE_AUDIT.json) · [Build audit](PUBLICATION_BUILD_AUDIT.json)

## Retained failures and limits

The first publication typecheck failed because the lean hosting checkout omitted `reviews/three-lanterns-preparation/TARGET_AUDIT.json`, which the new mastery tests import. Restoring that file from the exact reviewed Git commit resolved the failure. The app and tests were not altered to bypass it. Its Git blob is `46512981171692f2dd08fe4c0a2fb99d79dfa702`.

The managed cloud browser could not create a WebGL context; its diagnostic reported `GL_VENDOR = Disabled, GL_RENDERER = Disabled`. Fresh browser gameplay therefore remains unverified here. No browser flags, permissions or app code were changed to work around this environment limitation. The committed five browser cases and 81-family validation remain Codex's reported checks, separately from the fresh checks above.

The implementation's 3.55-second delivered-frame recording gap remains documented and inconclusive for physical Android smoothness. Speaker listening, human scene pacing, physical-device performance and spoken screen-reader verification remain open. The pre-existing bundle-size advisory also remains. A verified deployment and passing core tests do not close these human/device checks.

## Publication history

This version succeeds Site19/game `f0ffe2c`. Earlier task files, reports and publication receipts remain history. The GitHub runtime stays at `9c7a057`; the subsequent review/continuity commit changes documentation/evidence only. PR1 remains draft and GitHub main remains unchanged.
