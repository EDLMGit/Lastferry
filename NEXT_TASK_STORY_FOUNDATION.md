# Next task — the opening of Last Ferry

## Current task

Read `AGENTS.md`, `docs/PROJECT_STATE.md`, `campaign/CAMPAIGN_DIRECTION.md`, `campaign/STORY_SCENES.md`, this file, and the current rules/review before editing. This explicit task supersedes the old M1-only scope and the completed portrait task. Preserve applicable repository guidance, accepted behavior and unrelated/newer work.

Build a small, playable story foundation around **Holding Pier → Bellwater Cove**, with an opening, one transition and honest cove-boundary checkpoints. First Crossing remains separate practice. The campaign bible's twelve coves, four phases, larger boat, deer and currents are future direction, not this implementation's scope.

Baseline: `1a85874883af5caa59f6294a75495eccf2afebbc`, branch `m1-first-crossing`, repository `https://github.com/EDLMGit/Lastferry`. PR #1 stays draft; main remains unchanged.

### Publication facts

Publication succeeded on 2026-10-25 at 17:28 Madrid (`2026-10-25T16:28:58.501209Z`): the same owner-private Site, `https://last-ferry-playtest.abumech.chatgpt.site`, is **Sites version 12**, game `1a85874883af5caa59f6294a75495eccf2afebbc`, hosting source `e87c5c5baa53a39001c5a89b07b59aab2ad150fc`. The supplied receipt is `review/deployment-confirmation.json`; the audience is unchanged. Update the current publication fields in `docs/PROJECT_STATE.md` to these confirmed values while preserving version 11 as history. Keep game and hosting source identities distinct. The campaign/story work is not deployed. This task does not automatically publish its own implementation; never infer publication from a Git push.

## 1. A clear journey entrance

At the default URL without `?cove=`, show a compact title view using the established cove materials, buttons, typography and palette. Reuse the existing environment where practical; keep Android portrait and short landscape readable.

- **New journey** starts the opening and Holding Pier.
- **Continue journey** is available for valid saved progress. Clearly explain **“Progress is saved between coves. An unfinished cove starts again.”** Use “Continue journey · from cove start” where the destination could otherwise imply a mid-puzzle resume.
- **Practice** opens a simple chooser for the three existing playable coves. Label First Crossing as practice, without inventing story continuity for its repeated cast.
- **Settings** uses the existing Sound/Motion settings and fullscreen support.

Starting a new journey when progress exists requires a concise replacement confirmation. Cancel leaves progress intact. Replacing journey progress must not reset sound/motion preferences. Return to title from active play must explain any restart-from-cove-start consequence before discarding an unfinished crossing.

Explicit `?cove=first-crossing`, `?cove=holding-pier` and `?cove=bellwater` links remain independent practice/review entrances: start the existing puzzle directly, retain the established controls and review harness, and do not read/overwrite campaign progress or force story scenes. Practice may retain ordinary cove switching. Unknown query values must not corrupt saves.

## 2. A tiny playable-cove registry

Replace story-specific hardcoded next-cove branching with a small data-driven registry containing **only two playable story entries**: Holding Pier, then Bellwater. Include stable IDs, existing level references, order and scene associations. Reuse the existing level data as authoritative.

Keep the three-puzzle practice list distinct from story progression. Do not create disabled future levels, a twelve-node placeholder map, a general quest engine or unlock currency. Do not change any existing map coordinates, tide thresholds, capacities, passenger IDs, route depths, objective or reducer behavior.

Use one active game/world lifecycle. If navigation remounts a world, clean up its owned listeners/resources rather than accumulating renderers or audio instances. Preserve the current native dialog/fullscreen owner and established selectors where practical. Do not insert a second overlay system or iframe.

## 3. Two restrained story scenes

### Opening: the first evening

Use existing ferry, lighthouse, water and animal assets. A calm establishing view and a small ferry/lantern movement are sufficient. The scene introduces a known high tide and a welcoming destination, not unexpected catastrophe.

Caption sequence:

1. **“Your first evening alone at the helm.”**
2. **“The tide will be high tonight.”**
3. **“Bring everyone to the lighthouse.”**

The existing Holding puzzle starts with Moss aboard at Stone Pier. End the scene in a composition consistent with that actual initial state; do not show a contradictory passenger boarding or departure and then silently reset it. The captain can remain unseen.

### After Holding: another bell

Keep the accepted arrival, celebration and completion card. Only the player's explicit **Continue story** action starts the transition:

**“Pip, Rue and Moss are safe. Across the water, Bellwater is still waiting.”**

A quiet view of Harbor followed by Bellwater's existing scene establishes the connection. This is a brief transition to an existing puzzle, not another rescue or new mechanical event. The next playable initial state must remain exactly Bellwater's current data.

### Shared scene behavior

- Approximately **6–10 seconds of optional motion** each. Hold a readable final frame until Continue; elapsed time never advances gameplay. All three opening caption lines must be available together on this settled end frame, with no automatic reading timeout.
- Provide visible **Skip animation**, which reaches the same readable end frame immediately, including all three opening lines. Continue advances once. Reduced Motion and restored pending scenes must expose the same complete caption content; never make a skipped or timed-out caption the only source of meaning.
- Reduced Motion uses still compositions with immediate readable captions. Muted play remains complete. Do not rely on a bell, camera movement or color alone to communicate the destination.
- New journey / Continue is an explicit user gesture that uses the existing audio-enable pathway. Respect an existing muted preference; do not force sound on. Preserve retry/recovery behavior.
- Pause or settle safely on backgrounding. Returning must not jump through captions, double-navigate, trigger sounds repeatedly or spend a turn.
- Use existing scene assets and simple staging, with a small bounded scene controller/data table. Do not add heavy prerendered video, a second live renderer, voiced dialogue, a new soundtrack or autonomous gameplay actions.
- Keep native keyboard/touch operation, visible focus, full captions and targets usable at 320px portrait and 780×320 landscape. Story buttons cannot tap through into the map.

## 4. Honest cove-boundary checkpoints

This first pass saves **journey progress between coves**, not an unfinished puzzle. Use a versioned, validated local record with stable cove/scene IDs, accepted completions, current checkpoint and acknowledged scenes. Keep it separate from preferences and practice. No backend, account, cloud sync or general save framework is needed.

Rules:

1. A preview, won reducer state, arrival animation, completion-card display or Undo must never advance the campaign or acknowledge a story scene.
2. Until the player explicitly continues after winning, the existing cove remains active and fully undoable. Reloading before that acceptance restarts its checkpoint; explain this policy consistently.
3. The accepted departure from Holding records completion and the Bellwater transition/checkpoint as one coherent operation. Double clicks/taps and reloads cannot duplicate progression. A reload during the transition resumes its readable end frame; a subsequent Continue enters Bellwater once.
4. A scene is acknowledged through its explicit completion control. Skipping motion has the same final state and destination as watching it; it does not silently skip a puzzle.
5. Resuming an unfinished cove starts its original initial state, with the normal empty in-session Undo history. Ordinary Undo remains complete during play. Do not serialize `Session.busy`, camera state, animation progress, renderer objects or audio nodes.
6. Restarting/replaying a crossing never farms completion, resets other accepted checkpoints or awards anything. Practice never changes journey progress.
7. Validate schema/version, known IDs and valid progression relationships. Invalid, older unsupported or unknown saves receive an understandable notice and explicit recovery choices. Retain the original data until the player chooses replacement; never silently reset it. Migrate only a supported, clearly tested version.
8. If storage is denied/full/unavailable, the game remains playable in memory with a brief truthful notice that progress will not survive closing. Preserve preferences independently.

**Full mid-puzzle resume with complete Undo and stable presentation history is deferred.** Record it as a phone-usability requirement before longer campaign content is shipped; do not claim this checkpoint system supplies it.

## 5. End the available prototype honestly

Bellwater retains its current victory experience. An explicit continuation after victory accepts its completion and opens a simple end-of-available-content view: **“Both coves are safe. The next part of the journey is still being made.”** Offer Return to title, Practice and Settings as appropriate.

Do not imply the twelve-cove story is finished, show the proposed supper finale, link to an unbuilt third cove or leave a dead Next button. Continue journey from this completed checkpoint returns to this honest endpoint. Future registry additions can later extend it deliberately.

## 6. Asset and project continuity

Preserve portraits, full names/costs, nearby stable Confirm, water/wake, headings, sailing pace, existing music/wood/victory mix, lighthouse, phone framing/panning, audio intent, fullscreen and all three puzzles.

Update `assets/catalog.json`, its existing validator/gallery contracts and `docs/ASSET_LEDGER.md` for the implemented title/story surfaces and scene recipe only. Reuse existing families where appropriate; preserve all 72 existing IDs. Record captions/staging as editable sources and actual evidence. Do not mark future animals, boats, coves or scenes integrated.

Update `docs/PROJECT_STATE.md`, `STATUS.md` and the product brief's campaign references. Clearly distinguish agreed direction, implemented prototype content, pending human approval and actual publication. Record the explicit current task's scope over old M1 wording without rewriting history or unrelated instructions.

## 7. Focused verification and handoff

Run Node 24 production build/TypeScript, current unit suite and asset validation. Add meaningful tests for registry/progression and checkpoint validation/transactions; avoid a large generic framework.

Verify these affected paths:

- Fresh default entrance → opening → actual Holding rescue → explicit continuation → transition → actual Bellwater rescue → honest endpoint. Exercise in-session tide/terminal Undo before departure; no early advancement.
- Watch, Skip animation, Reduced Motion, mute, background/recovery and double Continue. Each reaches the same intended playable checkpoint without spending a puzzle action.
- Reload at the title, mid-cove, won-before-Continue, mid-transition and completed prototype. Check truthful cove-start recovery, no duplicate progression and no repeated acknowledgement.
- Valid, malformed, unsupported, unknown-ID and unavailable-storage cases; cancel/confirm New journey; preferences survive. Practice/direct links cannot alter the campaign record.
- Native portrait and short-landscape inspection, complete caption text, reachable buttons, keyboard focus and touch fencing. Exercise affected cold-touch audio and actual supported fullscreen behavior without substituting mocks for native evidence.

Retain a short uninterrupted actual story-to-gameplay sequence plus native phone images, source/build identity and original failures. Contributor/historical passes remain distinct from newly run checks. Existing overlap, delivered-heading, rapid-touch and physical-device limits remain open unless separately resolved with evidence.

Write `reviews/story-foundation/REVIEW.md` with the registry, checkpoint policy, final scene staging, asset changes, exact commands/results, source identities and remaining limits. Commit and push to `m1-first-crossing`, update PR #1 while keeping it draft, verify remote equality/working-tree status, and leave main unchanged. Never force-push. **Do not automatically deploy this story pass.** Return its exact final SHA and evidence for ChatGPT review and publication.
