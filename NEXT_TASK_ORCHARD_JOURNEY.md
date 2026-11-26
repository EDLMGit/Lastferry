# ORCHARD_JOURNEY_01 — bring the accepted seventh cove into the story

## Outcome and source

Make accepted Orchard Landing the seventh playable Journey cove, following Reef Return. Give Orin a clear, brief illustrated introduction and let returning players continue safely from their completed-six saves. Keep all existing Practice entries.

Reviewed runtime baseline: `14f128619267e2da81b4108ece2de4da07b50359`, including the three-lantern implementation. Incorporate this task/continuity commit on `m1-first-crossing` without losing newer or unrelated work.

Read this named root task, `AGENTS.md`, active `docs/PROJECT_STATE.md`, `campaign/STORY_SCENES.md`, `campaign/CAMPAIGN_DIRECTION.md`, `docs/DIFFICULTY_AND_MASTERY.md` and [the independent lantern review](reviews/three-lanterns/INDEPENDENT_REVIEW.md). Inspect the current registry, strict Journey validation/legacy continuation, shared story painter/player, mastery identity and asset catalog.

The new Journey order is Holding → Bellwater → Driftwood → Two Shelters → Nell's existing launch → Wide → Reef → **Orchard**. First Crossing remains independent Practice. There are seven Journey coves and eight Practice entries, not eight campaign levels.

Complete the working integration and its evidence. Choose routine composition, implementation and layout details independently. Do not add a puzzle, C8, a mechanic, ferry redesign, reward rule, narrator or new story framework. Keep the accepted Orchard data, both witnesses, target **13**, mastery revision **1**, controls, water, sailing and audio intact. Publication remains separate.

## 1. A readable Orchard encounter

The story has brought the ferry beyond the reef. Introduce a new neighbor and a recognizable orchard, with the accepted quiet visual language. Use the existing illustrated Canvas player and finite cues.

Use the established caption, with phone-friendly line breaks:

> Orin knows every path through the orchard. Tonight, he needs the ferry.

The image and action must communicate the encounter without explaining the solution:

- Orin's chestnut face, rounded form and short antlers match his accepted model and portrait. Give him one unmistakable acknowledgment visible on a phone.
- Establish the actual starting arrangement: the six-space yellow ferry is empty beside **Spring Steps**; sheep **Pomme** and tan rabbit **Medlar** wait ashore there; **Orin** waits at **Orchard Landing** across the reach.
- Show a supported landing near the water, a recognizable fruit-tree silhouette and a coherent approach/settle. Keep characters large enough to recognize and captions clear of the meaningful action.
- End in a calm composition consistent with the playable cove. Nobody boards, changes landing or becomes rescued merely because the illustration plays.

Choose a single bounded composition or a brief two-beat scene according to what reads best in portrait and short landscape. Keep it on the same short scale as the existing Reeds/Reef entries. A tiny idle gesture behind text is not enough; the beginning, meaningful intermediate action and settled image must communicate a visible change. Exact camera coordinates, animation curves and timings are your decisions.

Do not hint that Pomme must go home first or give loading arithmetic. Nell's launch has already happened, currents are already familiar, and these are three new waiting neighbors. Earlier rescued animals remain safe. The later return to the orchard in the twelve-cove plan uses a different waiting group.

Reuse established assets where suitable. Extend the implemented story-art family, gallery and provenance, or add one necessary family under the existing catalog rules. Keep an honest scene description for Read story/accessibility. A new drawing does not require new narration or music; use restrained existing finite cues and the current Sound owner.

## 2. Preserve the story player's behavior

Continue/Next is available immediately. Autoplay may reveal the scene, but entering gameplay requires the existing explicit final Continue. Skip settles the scene without acknowledging it. Preserve Pause/Resume, Read story, the accepted caption treatment and settled recap after restoration.

Reduced Motion shows a readable static endpoint. Settings, hiding/recovery, fullscreen and rotation must not duplicate cues, jump story progress or change passenger state. Cancelling or replacing a scene cancels its finite effects through the existing ownership model. Preserve mute/enable intent and continuous score behavior.

The new scene's predecessor is Reef Return. A restored background may show its safely rescued neighbors; it must not manufacture an already-rescued Orchard world or earn lanterns.

On explicit scene continuation, enter Orchard's exact authored initial state: action zero, initial tide, empty ferry at Spring Steps, waiting neighbors in their real positions, empty action history and a fresh attempt.

## 3. Safe continuation for existing players

The current validator accepts a completed save only when its identities match the full current registry. Simply appending Orchard would reject an existing completed-six record. Extend compatibility narrowly for the exact known six-cove completion and its six acknowledged scenes in their established order.

Required behavior:

| Situation | Outcome |
| --- | --- |
| Valid earlier scene/cove checkpoint | Resume that same checkpoint; no unnecessary conversion. |
| Existing completed-six record, Home/Settings/Practice only | Keep its original stored bytes untouched. |
| Existing completed-six record, explicit Continue | Preserve original raw bytes in a non-overwriting backup, then make the Orchard entry pending. |
| Fresh Reef win, before Continue story | Reef remains undoable and its lantern result provisional. |
| Fresh Reef win, explicit Continue story | Accept Reef once and enter the new Orchard scene. |
| Pending Orchard scene after reload | Readable settled recap, with no delayed effect catch-up or automatic acknowledgment. |
| Orchard win, before Continue story | Complete terminal Undo and provisional lantern behavior remain. |
| Explicit Continue from Orchard win | Accept Orchard and show the honest seven-cove endpoint. |

Preserve existing two/three/four-cove compatibility and original-byte backups. Backup naming is an implementation choice; existing backups must never be overwritten. If storage changes during conversion, do not overwrite the newer checkpoint. Keep usable in-session continuation and the existing honest storage-failure notice when persistence/backup is unavailable.

Maintain strict validation. Do not accept arbitrary partial “complete” records, unknown/future identities or inconsistent acknowledgment arrays just to make migration pass. No broad save framework or mid-puzzle resume is needed.

Home, Continue copy, transcript and the interim endpoint must describe the actual seven-cove content. The current Home/endpoint strings still say “Six coves are safe”; update all affected copy. Seven rescued coves is the current available endpoint, not completion of the full twelve-cove story. The final supper and “We saved you a place” remain for cove twelve.

## 4. Keep earned lanterns and Practice isolation

Orchard's existing best is `orchard-landing@1`, target 13. Keep that identity and the separate mastery store unchanged. Journey results reuse the same accepted Practice best, which remains intact during continuation, scene playback and reload.

That best does not mark Orchard completed in Journey, skip its entry or unlock a story gate. An ordinary rescue earns full story progress at any lantern count. Historical rescues remain unrated until a scored replay.

Practice stays independent whether entered from Home or `?cove=orchard-landing`. It must not normalize, migrate or advance a stored Journey. Only explicit Journey continuation triggers the completed-six extension. Scene backgrounds, save conversion, Skip and cosmetic restored Harbor states award nothing. Preserve successful Undo history and actual acceptance boundaries from THREE_LANTERNS_01.

## 5. Focused verification

Use Node 24. Run the production build, TypeScript, affected registry/progress/story/mastery checks and asset validation. Preserve exact puzzle/witness/scoring identities; there is no need to rerun a new difficulty search.

Cover meaningful changed risks:

- Fresh seven-cove checkpoint progression, exact old-six continuation, original-byte backup and an existing-backup collision.
- Earlier supported historical saves, malformed/future records, storage/write failure and protection against a newer checkpoint appearing during backup.
- Pending-scene restore, immediate Continue, Skip, Reduced Motion, natural keyboard focus, and one Settings/hide interruption without duplicate cue or progress.
- An actual-format accepted Orchard Practice best surviving Journey extension and replay without granting completion or changing its revision.
- Direct/root Practice isolation with representative in-progress, completed-six and legacy save bytes.
- A real UI Reef rescue followed by explicit Continue into the new scene and Orchard's real initial state.
- A real Orchard rescue entered through the new Journey scene, including tide Undo, terminal Undo/redelivery, explicit result acceptance, the seven-cove endpoint and reload. Exercise one complete integration route on the minified production build.

Use fixtures for historical checkpoints and pure transition checks. Required actual rescues must use the real controls; do not replace them with a synthetic won state. A full replay of every unchanged cove is unnecessary unless a shared edit exposes a concrete regression.

Inspect native portrait 390×844, short landscape 780×320, a 320px portrait fit and a desktop smoke view. Capture the real beginning, acknowledgment and endpoint in both principal phone orientations, plus the playable handoff and final accepted result. Verify that Orin is recognizable, captions are legible, landings meet the water, and controls remain reachable.

Provide one uninterrupted actual scene-to-rescue-to-acceptance sequence with runtime audio using the existing pipeline. Record exact source/build identity, original failures and affected reruns. Distinguish Chromium emulation from physical Android, and source/recording checks from human listening or performance approval.

## 6. Handoff

Update active continuity, seven-cove story/progression and the asset inventory only for implemented content. Keep earlier tasks, reports and publication receipts as history. Add `reviews/orchard-journey/REVIEW.md` with the scope, migration/mastery evidence, native frames, actual sequence, commands and limits.

Commit and push to `m1-first-crossing`; verify the final remote SHA, update PR #1 while keeping it draft, and leave `main` unchanged. Do not deploy or change access. The private Site remains version 19, game `f0ffe2c12f1cc0e42ad7ef10a4b57dd29097c731`, with its existing custom private audience.

Return the exact SHA, concise review, verification results, representative scene/handoff/result phone frames, uninterrupted recording, local root URL without `?cove=`, and Orchard Practice URL. State clearly that the Journey now has seven implemented coves and the remaining five are not yet playable.
