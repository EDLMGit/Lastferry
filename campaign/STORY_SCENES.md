# Last Ferry — story scenes for The Long Tide

**Current task:** `DRIFTWOOD_YARD_01` adds the third playable rescue and the one-shot `driftwood-light` entry. Holding → Bellwater → Driftwood is the implemented journey; First Crossing remains independent practice. The accepted `HOME_PLAY_FLOW_01` live Home, normal-motion autoplay, Pause/Resume and direct/group transfer ownership are retained. Evidence and human-acceptance limits belong in `reviews/driftwood-yard/`; earlier Home evidence remains historical in `reviews/home-play-flow/`.

**Illustrated art implementation:** task `STORY_PRODUCTION_01` in `LAST_FERRY_STORY_PRODUCTION_PACKAGE/NEXT_TASK_STORY_PRODUCTION.md`, from reviewed `6fc5a09dd4ef876ad96ad12d623532f0d13deb10`. The working journey, checkpoints, practice isolation and puzzles remain. The supplied Words and Light opening reference is user-approved; the production port, new Harbor drawing, runtime mix and physical-device experience have separate verification and human-approval status in `reviews/story-production/`. Implementation and focused verification are complete for the documented coverage; human review remains pending.

The campaign has four phases of three coves. Nell joins in Cove 3; a prepared larger ferry launches afterward. Cove 4 teaches its six spaces before Cove 5 introduces Orin. Cove 11 is the hardest puzzle. Cove 12 is a gentle, short final rescue, followed by supper. Those later coves, species, hull and current mechanics are still future work.

## Shared presentation contract

The opening, Harbor connection and Driftwood entry use a close illustrated Canvas2D layer inside the actual application's dialog/fullscreen surface. A small variable-length scene definition supplies artwork, complete caption groups, duration, cue positions and optional narration IDs; the finite controller owns shot position and its cancellable run. The existing application alone acknowledges scenes and writes checkpoints. Gameplay remains the accepted interactive 3D world. The standalone reference wrapper and prototype navigation are not shipped as a replacement game or iframe.

The reference's lavender/peach dusk, teal water, cream/tan animals, yellow ferry/red cabin and warm lights are retained. Rue is tan on the left and Pip cream on the right in the opening. Portrait uses an attached deep teal reading area under recomposed artwork; landscape uses the quiet space beside the focal action. Narrative captions use Georgia with a serif fallback and remain readable HTML. Controls use the accepted cove interface language and native semantics.

Normal motion reveals the entire current caption after about 1,050ms with a brief 240ms opacity fade. Normal opening playback advances Tide → Lantern → Ferry at the existing 6 / 6 / 7-second endpoints; the final picture holds indefinitely. Harbor remains one five-second action with an explicit final handoff. Read story exposes all current-scene copy immediately. Reduced Motion presents each shot's endpoint and caption immediately, preserving ordinary Next navigation. Pause reveals the full caption and preserves elapsed art time; Resume retains consumed cues. Next remains immediate. There is no typewriter or mandatory sound. Reduced Motion remains manual stills.

Next is available immediately and changes only the shot. Only the final Take the helm, Continue to Bellwater or Continue to Driftwood action explicitly acknowledges the scene once and enters its destination. Replay restarts the current shot; Replay scene restarts the sequence. Skip animation and Escape from the main scene settle the final shot and expose the complete recap without advancing campaign progress. A pending scene restored from its existing checkpoint starts at that final static endpoint and remains pending until its final action.

Read story and Options settle only the current shot, pause progression and cancel pending/active cues. Returning opens the secondary disclosure before restoring its trigger focus. Closing either returns to that held shot and trigger focus; Escape closes the subordinate reading/settings view before it can skip the scene. Hide/recovery and enabling Reduced Motion settle the current shot without Next or acknowledgment. Turning motion back on does not replay consumed work. Navigation, replacement and disposal cancel owned presentation and sound work. One story clock advances the existing controller; held illustrations do not draw repeatedly. The gameplay world is retained across shots.

Story presentation spends no turns and changes no tide, passenger, capacity, delivery or Undo state. The opening is a narrative prelude, not simulated travel. Terminal Undo remains available after a rescue until the player accepts Continue story. Explicit `?cove=` entrances stay independent practice/review flows. The existing strict checkpoint format stores scene/cove boundaries, not shot position or a mid-puzzle action history.

Home Play uses the existing trusted click capture to request Sound synchronously before routing. Home/story Sound controls share Enable/Retry/Mute intent. Use the established Sound owner, accepted score and activation intent. Finite tide wash, lantern contact and ferry-water effects have separate cancellable story ownership; they do not invoke gameplay travel, transfer or victory events. Muted, skipped, hidden, superseded or unavailable cues are consumed rather than caught up later. The Harbor connection does not replay victory or unloading contacts. No new score or continuous ambience layer is added.

Optional narration IDs and the exact four-clip script are prepared in `LAST_FERRY_STORY_PRODUCTION_PACKAGE/audio/narration-script.json`. Every asset is null and every recording remains pending. There is no generated voice, live TTS, unavailable narration toggle or voice-service dependency. Finished local voice recordings and human listening approval belong to a later contained pass.

All Home harbors are protected piers around the same lighthouse island, seen through different coastal vignettes. Delivered characters stay safe. Cosmetic story time never changes the local puzzle forecast. The third-cove extension recognizes only the exact historical version-1 two-cove-complete record. Viewing Home, Options or Practice leaves its original bytes untouched. The first deliberate Continue saves pending `driftwood-light` and plays it freshly; later restored pending scenes use the final static recap. Other invalid or future records are not coerced into a supported prefix. The storage key and version remain unchanged.

This task explicitly supersedes the older story-only requirements for distant gameplay-model gestures, one shared scene duration, and every opening caption visible on the first frame. It preserves the working campaign mechanics and all unrelated accepted results. The prior authored-scenes and foundation reports remain historical evidence.

## 1. The first evening — `opening`

**Trigger:** Fresh Home Play enters the first picture directly, before Holding Pier. **Implemented scope, pending production review.**

### Shot 1 — Tide · six seconds

The water reaches the lower steps and covers part of the marked post. Pip and Rue remain safely on the upper landing. Preserve the supplied wide composition and its portrait recomposition. One finite tide wash supports the visible water movement; it is not a gameplay tide event.

**Caption, exact:**

> Your first evening at the helm.<br>
> A high tide ahead.

The waterline reaches its composed endpoint before normal playback advances to Lantern. Pause and Reduced Motion hold it; Next never waits for the endpoint.

### Shot 2 — Lantern · six seconds

Rue, tan on the left, deliberately raises the lantern beside cream Pip. Warm light catches both faces. The supplied close artwork and gesture remain the source of the production port. A restrained handle contact supports the lift, separate from passenger boarding audio. The raised lantern and attentive pair hold without perpetual bouncing.

**Caption, exact:**

> Pip and Rue have kept a light for you.

### Shot 3 — Ferry · seven seconds

The yellow ferry with its red cabin approaches through open water with Moss aboard. The lighthouse is a clear warm destination. A finite hull/water effect supports the approach without a persistent gameplay travel flag or arrival phrase. The ferry, Moss and lighthouse hold together at the endpoint.

**Caption, exact:**

> Moss is aboard.<br>
> Bring everyone to the lighthouse.

**Take the helm** is available immediately on this shot. Its explicit application-owned continuation acknowledges `opening` once and starts unchanged Holding: ferry at Stone, Moss aboard, Pip and Rue at Rabbit Pier, tide 0, turn 0, four-space capacity with Moss occupying two, and empty Undo history. The illustration does not invent a rabbit transfer, route or continuous camera move into different gameplay geography.

**Assets:** the supplied original code-native painter, adapted into the typed shared story renderer; existing controls and Sound owner. The approved fragment hash is `ff437f9e70675c8b532f2f774e9b9c766eb30e2cf9da73072d5b7e872fd22ce1`. Reference approval does not automatically approve the production port or mix.

## Connective beat — Holding to Bellwater — `another-bell`

**Trigger:** the player explicitly accepts Holding's completed rescue with Continue story. **Implemented scope, new artwork awaiting human review.**

### Shot — Harbor · five seconds

Pip, Rue and Moss are safe on the protected high landing. Rue lowers her lantern onto the landing, completing its contact at about 3.2 seconds, then releases it. Pip turns toward the empty waiting ferry and open water; Moss settles nearby. The warm lighthouse welcome and a small distant cottage light suggest the next community. The image rests as a quiet gathering; nobody boards again.

**Caption, exact:**

> Pip, Rue and Moss are safe.<br>
> Bellwater is still waiting.

One quieter lantern contact supports placement. Opening the scene does not replay victory or the preceding rescue's unloading sounds. **Continue to Bellwater** is available immediately and alone acknowledges `another-bell` once before entering the unchanged Bellwater start. Pip, Rue and Moss stay rescued; Tansy, Lark and Bram remain Bellwater's own neighbors. Restoring the pending connection shows its final static composition and complete text, without replaying its finite effects.

**Assets:** the same illustrated characters/coast/props and scene player as the opening, with a newly authored Harbor composition and the existing persistent audio owner. The drawing is not footage of a new playable cove.

## Cove 3 entry — Bellwater to Driftwood — `driftwood-light`

**Trigger:** explicit acceptance of Bellwater's completed rescue. **Implemented scope; human visual/pacing acceptance remains separate.** The exact legacy two-cove completion offers the same fresh entry only after deliberate Continue; ordinary pending-scene restoration uses the established recap.

### Shot — A light at the yard · seven seconds

Nell works beside a timber rail with her lantern resting close to a rope coil. Her warm brown body, lighter muzzle, small round ears and broad dark flattened tail share the new 3D beaver's colors and identity. From 1.1–3.4 seconds her paw and lantern rise in a large visible arc. From 3.4–5.2 seconds her face turns toward the channel and the approaching ferry light. The composed greeting holds after 5.2 seconds and remains at the endpoint. Portrait and short landscape use separate placement/scale constraints to keep the face, lifted light and tail visible.

**Caption, exact:**

> Nell, the boatwright, is still at the yard.

The existing brief caption lead-in, readable HTML, complete description/transcript, Pause/Resume, Replay, Skip and Reduced Motion apply. A restrained finite existing ferry-water cue supports the approaching light; it does not restart the score, arrival or transfer contacts. No narration recording or new narration slot is claimed.

**Continue to Driftwood** is immediately available and alone acknowledges the scene before entering the authored original Driftwood start. Presentation spends no actions and grants no larger ferry. After the third actual rescue, terminal Undo remains until explicit acceptance. The available-content endpoint says **Three coves are safe**, with Home/Practice/Options. The prepared six-space ferry and Wide Berth remain the next contained task.

**Assets:** `src/campaign/story-painter.ts` is the editable original beaver/yard illustration; `registry.ts` supplies its caption, timing, description and cue. Existing painter functions for opening and Harbor remain unchanged. The actual world, portrait and illustration are distinct renderings of the same stable character identity.

## 2. A wider deck

**Trigger:** after completing Cove 3, Driftwood Yard, when continuing to Phase II. **Future milestone.**

**Composition:** Nell is safe at the protected boathouse. Her larger spare ferry is already built and ready beside it. A mooring releases; the wider yellow hull settles onto the water. Pip, Rue and Moss watch from the high refuge pier. Finish with a readable view of the larger passenger deck and familiar red cabin.

**Caption:** “Nell had a bigger boat ready. Now there are hands to launch it.”

This is a launch, not a rapid construction montage during an emergency. Cove 4 subsequently introduces six spaces through the actual controls and preview. No upgrade shop, currency or hull picker appears in the story scene.

**Assets:** Nell's approved beaver model/portrait, six-space ferry, a protected boathouse vignette and reusable rope/mooring prop. Only implement these with their corresponding content milestone and inventory entries.

## 3. The orchard neighbor

**Trigger:** entering Cove 5, after the larger boat's introductory cove. **Future milestone.**

**Composition:** a few orchard leaves frame a landing. Orin steps into a clear view, his short antlers and larger silhouette readable on a phone. Settle into the playable cove while he waits under its authored starting forecast.

**Caption:** “Orin knows every path through the orchard. Tonight, he needs the ferry.”

The real passenger choice teaches Orin's three-space cost. Do not suggest the old four-space ferry could not carry him alone, or that a cinematic creates his cost. His identity needs no hidden ability or special emotional rule.

**Assets:** Orin's approved deer model/portrait and a restrained orchard environment family. The small orchard bough may later recur at supper as decoration, without becoming cargo or inventory.

## 4. The water turns

**Trigger:** after completing Cove 6, entering Phase III. **Future milestone.**

**Composition:** Lark watches from a safe high pier. Broad floating reeds reveal an established current flowing through the channel beside a clear marker. Open the view toward the next cove, keeping the water luminous and slow. Do not depict a reversal here: Cove 7 teaches a fixed direction, and Cove 8 introduces its first forecasted change.

**Caption:** “Beyond the headland, the tide chooses another way.”

The following cove explicitly teaches the actual forecasted current rule. This poetic line cannot substitute for direction and next-tide information. The scene itself never changes route legality, pushes the ferry or consumes a turn.

**Assets:** approved current presentation, its readable marker and modest reused reeds. Their movement follows the same authored meaning as the subsequent rule; reduced motion retains a static directional indication and text.

## 5. The last lights

**Trigger:** after completing Cove 9, entering Phase IV. **Future milestone.**

**Composition:** more refuge windows glow warmly. Tansy unfolds a cloth, Moss settles beside the table and Bram stands near the small bell. Across the water, a remaining occupied landing holds a light. Keep the scene composed around a few representatives rather than a dense crowd.

**Caption:** “The table is nearly ready. A few lights are still waiting across the water.”

The next phase offers a quiet crossing, the hardest synthesis at Cove 11, and a short final rescue at Cove 12. The lighting gives the journey direction without implying a real-time countdown.

**Assets:** a small supper setting, warmer refuge-window arrangement and approved recurring props. Reuse existing characters. The bell is optional sound; the scene reads completely while muted.

## 6. A place for the captain

**Trigger:** after the final visible delivery in Cove 12 and explicit continuation from its arrival. **Future milestone.**

**Composition:** the last neighbors join the safe pier. Open the view toward supper: Bellwater's cloth, Nell's rope by the mooring and Orin's orchard bough connect earlier encounters. One place remains empty, facing the arriving ferry. The lighthouse's accepted warm sweep crosses the gathering once, then the composition rests.

**Caption, exact:** “We saved you a place.”

Let the player linger with the water and quiet score. Continue leads to credits with clear Replay coves and Settings access. There is no death revelation, hidden sacrifice, new quest marker or unresolved cliffhanger. The final crossing is a gentle release after Cove 11's challenge.

**Assets:** the approved refuge/supper setting and a small representative cast. Keep the captain unseen. Use the existing audio intent and score language; any later musical ending must receive its own listening review.

## Source and acceptance

The first-evening, lighthouse-refuge and supper-table foundation comes from the [existing product brief](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/docs/PRODUCT_BRIEF.md). Names, new scenes, ordering and captions here are proposed campaign content. The existing [gameplay contract](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/docs/GAMEPLAY_RULES.md) remains authoritative for committed turns and Undo.

Keep authored direction, implemented scene, verified interaction and human visual/audio acceptance as separate statuses. The current task must not report future scenes, newcomers, the larger boat or currents as built merely because this document describes them.
