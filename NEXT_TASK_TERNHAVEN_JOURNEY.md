# TERNHAVEN_JOURNEY_01 — carry the eighth cove into the Journey

> **Active · 17 November 2026.** Following the user's positive visual response to ANIMAL_PRESENTATION_01 and its independent review, resume this contained Journey integration. Preserve the finished animal models, profiles and UI while implementing the scope below.

## Outcome and baseline

Append accepted **Ternhaven** after Orchard Landing as Journey cove eight. Add one brief illustrated encounter and safe, deliberate continuation for players with an exact completed-seven save. Preserve all nine independent Practice entrances.

Reviewed implementation baseline: `26ca0a4f7b42c3f9e809f4a6558b0df8dc0c9139`, including **ANIMAL_PRESENTATION_01**, **ARRIVAL_BUBBLE_01** and accepted **`ternhaven@1`, target 14**. Safely incorporate this task/continuity commit and any newer user work on `m1-first-crossing`; never reset to the baseline or force-push. This brief commissions the integration; it does not claim the eighth Journey cove is already implemented.

Read `AGENTS.md`, active `docs/PROJECT_STATE.md`, `campaign/STORY_SCENES.md`, `campaign/CAMPAIGN_DIRECTION.md`, `docs/DIFFICULTY_AND_MASTERY.md`, the Ternhaven and arrival-bubble reviews, `reviews/animal-presentation/REVIEW.md` and `assets/portraits/animal-profiles.json`. Inspect the registry, strict progress validation and backup path, shared story painter/player, mastery identity, arrival actions and asset catalog.

The resulting Journey is Holding → Bellwater → Driftwood → Two Shelters → Nell's existing launch → Wide → Reef → Orchard → **Ternhaven**. The launch is a boundary; First Crossing remains independent Practice. There will be eight Journey coves and nine Practice entrances. C9–C12 remain unavailable.

Complete this contained integration and evidence. Preserve the accepted puzzle, all three 13/14/14-action witnesses, target/revision, finished animals and profiles, ferry, controls, audio, water and centered arrival bubble. Choose routine composition and implementation details independently. No new puzzle, rebalance, mechanic, narrator, story framework or deployment belongs to this pass.

## 1. A truthful Ternhaven encounter

Add scene **`ternhaven-wave`**, titled **A wave from Ternhaven**, using the existing illustrated Canvas player. Use this exact caption, with a natural phone line break between sentences:

> Juniper, Sedge and Fennel are aboard. Willow is waiting by the reeds.

Create a short composition on the established seven-second scale. The ferry glides into a readable open-water view and settles near **Tern Buoy**. Willow looks up from Reed Landing and gives one clear paw acknowledgment. The greeting should read at phone scale, with an observable beginning, acknowledgment and held endpoint. Keep the established caption cue and treatment; exact staging, curves and restrained timings are authoring choices.

The picture must preserve the real initial arrangement:

| Place | Visible occupants |
| --- | --- |
| Six-space yellow ferry at Tern Buoy | Chestnut deer Juniper, sheep Sedge and tan rabbit Fennel, already aboard together. |
| Reed Landing | Brown beaver Willow, waiting ashore beside the reeds. |
| High Bank, Tern Steps and Harbor | No waiting passengers. |

Tern Buoy is an **open-water node without a pier**. Do not draw the ferry docked there, put the starting three on land, or depict Willow boarding. The three aboard occupy all six spaces; use the accepted ferry and recognizable proportions. End with the same people in the same places. Nobody stages, transfers, becomes rescued or consumes a turn during the illustration.

Keep the relevant group large, Willow distinct from the reeds, her landing supported, and captions clear of the acknowledgment in portrait and short landscape. Avoid directing the player toward a staging refuge or explaining the first delivery; the scene establishes the encounter, not the solution. Previous neighbors, including Orin, Pomme and Medlar, remain safely rescued. Nell's launch and the known current rules need no repeat introduction.

Reuse established character and environmental art. Extend the story-art family, gallery and provenance under the normal catalog rules. Supply an accurate Read story/accessibility description. Use at most restrained existing finite cues through the shared Sound owner; no new music, narration or gameplay transfer/victory sound.

## 2. Shared player and exact gameplay handoff

**Continue to Ternhaven** is available immediately and alone acknowledges the new scene. Autoplay can reveal its action but cannot start the puzzle. Skip settles the scene without acknowledgment. Preserve Pause/Resume, replay, Read story, keyboard focus and the settled recap after restoration.

Reduced Motion shows a readable endpoint. Settings, hiding/recovery, rotation and fullscreen must not acknowledge the scene, replay consumed cues or alter passengers. Cancellation and replacement use the existing finite-effect ownership. Preserve mute/enable intent and the continuous score.

The scene's predecessor is Orchard. A restored predecessor background can show its safely rescued neighbors; it must not manufacture Ternhaven completion or lanterns.

Explicit continuation starts the exact authored Ternhaven state: turn zero, initial tide zero, ferry at `fork`/Tern Buoy, Juniper/Sedge/Fennel aboard, Willow at `reeds-pier`, all other landings empty, nobody delivered, empty Undo history and fresh attempt metadata. Compare against production initial state rather than constructing a separate approximation.

## 3. Exact old-seven continuation

Appending a registry entry makes the current full-registry completion validator reject an older seven-cove completion. Extend the existing compatibility path narrowly, following Orchard's explicit-continuation pattern.

Recognize exactly the known version-one completed-seven record:

- `completed`: `holding-pier`, `bellwater`, `driftwood-yard`, `two-shelters`, `wide-berth`, `reef-return`, `orchard-landing`, in that order.
- `acknowledgedScenes`: `opening`, `another-bell`, `driftwood-light`, `among-the-reeds`, `a-wider-deck`, `lights-beyond-the-reef`, `orchard-paths`, in that order.
- `checkpoint`: exactly `{ kind: 'complete' }`, retaining the existing strict keys and version contract.

Use a distinct **`last-ferry.journey.v1.before-ternhaven`** backup family. Preserve the previous record's original raw bytes before writing the pending `ternhaven-wave` checkpoint, and only after deliberate Home Continue. Retain the existing non-overwriting collision/suffix behavior and verify backup storage before proceeding with a persistent conversion.

| Situation | Required outcome |
| --- | --- |
| Earlier valid scene/cove checkpoint | Resume the same checkpoint. |
| Completed-seven record viewed through Home, Settings or Practice | Leave original Journey bytes untouched. |
| Completed-seven record, deliberate Continue | Preserve raw bytes, then enter the new pending scene. |
| Fresh Orchard win, before Continue story | Keep terminal Undo and provisional result. |
| Fresh Orchard win, explicit Continue story | Accept once and enter Ternhaven's scene. |
| Pending Ternhaven scene after reload | Settled recap; acknowledgment still requires Continue. |
| Ternhaven win, explicit Continue story | Accept once and show the eight-cove endpoint. |

Preserve every existing two/three/four/six-cove compatibility case, acknowledged launch/history and both earlier backup families. Do not broaden validation to arbitrary partial completions, unknown/future identities or inconsistent arrays. Earlier checkpoints require no gratuitous rewrite.

Retain protection against a newer checkpoint appearing before or during backup. Never overwrite that newer record. If storage or backup is unavailable, preserve usable in-session continuation with the existing honest persistence notice. Keep the storage key/schema and cove-boundary resume model; no generalized migration framework or mid-puzzle save is needed.

Update affected Home, Continue, transcript and endpoint copy to describe **eight available coves**, with four still to come. Do not show the final supper or claim the twelve-cove Journey is finished.

## 4. Preserve earned results, animal finish and the arrival bubble

Journey and Practice share **`ternhaven@1`, target 14**. Keep all nine accepted scoring targets and existing bests unchanged. An accepted Practice best survives scene entry, continuation and reload; it cannot grant Journey completion, acknowledge the scene or skip the rescue. An ordinary rescue advances the story at any lantern count. Earlier unscored rescues remain unscored until replay.

Keep the centered won-only bubble, prominent lanterns, complete rescued cast, Replay icon, Details, safe bounds and Harbor framing from ARRIVAL_BUBBLE_01. The existing next action must now lead from Orchard to the new scene and from Ternhaven to the truthful endpoint. Preserve terminal Undo/redelivery, camera restoration and the finite arrival animation's ownership.

Retain ANIMAL_PRESENTATION_01's four-species/five-appearance miniature family, current world scales and compatible attachments, ten source-derived static profiles, passenger-choice layout and complete named arrival figurines. Keep the five stable appearance keys, image loading/fallback behavior and provenance. `portraitSources` in `src/ui/cove-ui.ts` uses `assets/portraits/choice/*.png` for Board/Let ashore/Bring home; `arrivalFigureSources` uses `assets/portraits/arrival/*.png` for whole rescued figures. Do not restore the older single-profile path or remodel/rebake the accepted family.

Preserve the cached `animal(species, variant)` model/geometry path and animal-local shared material in `src/scene/animals.ts`, re-exported through `src/scene/models.ts`. Keep file-backed UI images and the existing story canvas/player; do not add per-card renderers, WebGL contexts or continuous portrait animation. The new illustration should match the finished characters' identities, coats and recognizable silhouettes within the established illustrated style. This narrative integration must not compound the animal rendering budget through unrelated model or profile changes.

Close, Details, Settings, Escape and reopening the result accept nothing. Actual continuation, cove navigation, confirmed Home and successful Restart retain their existing acceptance boundaries. Preserve successful Undo tracking outside rewindable state, best-run selection and storage-failure behavior.

Practice remains independent from Home and direct `?cove=ternhaven` entry. It must not normalize, migrate, acknowledge or advance Journey records. Scene playback, backups and restored Harbor backgrounds cannot create scores. No new rewards or automatic historical results are needed.

## 5. Focused verification and native evidence

Use Node 24. Run production build, TypeScript, affected registry/progress/story/mastery/arrival checks and asset validation. Confirm accepted level, rule, witness and target inputs are unchanged; another difficulty search is unnecessary.

Cover the meaningful integration risks:

- Fresh eight-cove transitions; exact old-seven raw-byte backup, backup collision and reload; retained historical compatibility; malformed/future records; blocked storage and a checkpoint changing during backup.
- Immediate Continue, Skip without acknowledgment, pending-scene recap, Reduced Motion, natural keyboard focus and one Settings/hide interruption without duplicate cue or progress.
- An actual-format accepted Ternhaven Practice best surviving extension and replay, without skipping the entry or changing its identity. Root/direct Practice must preserve representative active, completed-seven and older Journey bytes.
- A genuine **Orchard rescue → explicit Continue → new scene → Ternhaven initial state → Ternhaven rescue → explicit acceptance → eight-cove endpoint → reload**, through real controls on the minified build. A valid Orchard boundary fixture may avoid replaying earlier coves; injected won states cannot replace either rescue.
- Tide Undo and terminal Undo/redelivery during that route, with the centered bubble and best-result comparison intact. Closing or inspecting the provisional result must not accept it.
- Within that same route, verify the finished close profiles in passenger choices and all four whole arrival figures, including early-delivered Sedge. Retain the current model identity and physical support through handoff and Undo; use the existing native captures rather than starting another animal-art or performance campaign.

Inspect native **390×844 portrait** and **780×320 short landscape**, plus a 320px portrait fit and desktop smoke view. Capture the actual beginning, greeting and held endpoint in both principal orientations, the truthful playable handoff and accepted result. Confirm all four identities, open-water buoy, supported landing, captions and controls are readable. Use a second compact scene/fit pass where needed; a broad replay of unrelated coves is unnecessary.

Retain one uninterrupted actual scene-to-rescue-to-acceptance recording with runtime audio through the existing pipeline. Record source/build identity, environment, capture method, original failures, affected reruns and any capture gaps. Distinguish actual UI play from fixtures and native-sized emulation from physical Android. If tooling blocks a required check, state the exact unverified behavior and reproducible manual steps; do not claim visual, performance, listening or spoken screen-reader approval from source checks.

## 6. Handoff

Update active state, STATUS, current campaign/story/progression and changed asset provenance to describe implemented content. Preserve historical tasks, reviews and receipts. Add `reviews/ternhaven-journey/REVIEW.md` linking save/mastery evidence, native frames and the actual sequence.

Commit and push normally to `m1-first-crossing`, verify the final remote SHA and update PR #1 while keeping it draft. Leave GitHub `main` unchanged. Do not deploy or change access; preserve the current Site publication recorded in active project state.

Return the exact SHA, concise review, checks and limits, accessible scene/handoff/result evidence, uninterrupted recording, local root URL and Ternhaven Practice URL. State clearly: **eight Journey coves, nine Practice entrances; C9–C12 remain unavailable.**

