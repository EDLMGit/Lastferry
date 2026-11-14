# TWO_SHELTERS_PROTOTYPE_01 — one small cove that belongs in Last Ferry

## 1. Assignment

Build one playable independent Practice candidate named Two Shelters, available at ?cove=two-shelters. It is the proposed replacement for the fourth campaign slot, but is not integrated into the story by this task.

The user has repeatedly rejected Wide Berth's difficulty and visual feeling. Another broad Wide repair is not the current assignment. Use the original four-space ferry, a compact cast and the established first-three-cove visual language to demonstrate one distinct puzzle.

Reviewed runtime: 2e4f99268da4691b315fe8467d9e539cda15e927. Later continuity HEAD: 98f9713b1a69474b4066cca8f336cb8c4ca21a50. Private Site version14 already contains that game; hosting source is d01264d26cb7b5abaf68920a9014718ab21d97b4. Preserve newer/unrelated work and all publication history. Do not reset.

Branch m1-first-crossing; PR1 remains draft; main unchanged. No automatic deployment.

## 2. Read and inspect

Read this exact task, REVIEW_AND_VISUAL_DIRECTION.md, AGENTS.md, docs/PROJECT_STATE.md, STATUS.md, docs/GAMEPLAY_RULES.md, docs/ART_DIRECTION.md, campaign/CAMPAIGN_DIRECTION.md, campaign/PUZZLE_PROGRESSION.md, assets/catalog.json and the relevant asset ledger.

Inspect the named native Holding, Driftwood and Wide frames. Inspect the existing four-space ferry, character/shore construction, load/depth rules, level loading, practice selection and campaign progress code. Do not treat an older task's instruction to build Wide as active work.

Make routine choices independently and finish one candidate with honest evidence. No additional human participants or research sessions are required.

## 3. Mechanical design before extra scenery

The decision to develop is:

**Which temporary landing and retrieval order keep the later rescue possible?**

Author one small level using existing rules:

- Original capacity of four spaces and existing draft bands.
- Three or four animal bodies, using existing species/model archetypes and canonical space costs.
- Familiar movement, boarding, unloading, local tide/flood thresholds, free inspection and complete Undo.
- A compact set of meaningful stops/routes. Add a stop only when it changes a decision or supports legibility.
- At least two relevant staging possibilities whose access, later safety or return paths have materially different consequences.
- Complete visible information from the start. The forecast and current inspections must explain the facts the player needs.

A useful starting direction is a convenient lower shelter and a modest higher refuge, with a later pickup making their different retrieval costs matter. This is a design hypothesis, not a supplied solved map. Choose exact geometry, passenger distribution and tide timing only after checking them through the production reducer.

Avoid these shortcuts:

- Repeating Driftwood's single obvious safe pier and compulsory lightening.
- A level won by collecting the earliest complete group, following the only available return and repeating, without considering the intended staging choice.
- Difficulty produced only by extra bodies, long crossings, more transfers or an arbitrary additional action limit.
- A new rule, species cost, current, inventory item, switch, boat upgrade or real-time pressure.
- Retrospectively hiding information or introducing passengers after a plan is committed.

Write a concise DESIGN.md under reviews/two-shelters-prototype/ containing the intended insight, exact chosen level contract, successful action sequence and concrete tempting alternatives.

Verify the sequence against the actual production rules. Inspect at least the obvious collection-first plan and a plausible wrong staging/retrieval plan. Explain where each succeeds, loses or leaves the intended decision avoidable. Revise a candidate if the main insight can be bypassed by routine collection. If multiple strategies are claimed, verify those actual strategies; do not inflate the design with solution/state counts.

A solver/search horizon is only a verification tool, never a new player deadline. Passing a witness establishes solvability; player enjoyment remains for the user's playtest.

Do not spend the pass authoring a new scene or model while the mechanical candidate remains unexamined.

## 4. Make the candidate look like the same game

Use the existing finished asset families, not raw placeholder blocks.

### Scale and hierarchy

- Preserve the original four-space ferry's proportions, cabin, deck and passenger relationship. Do not shrink a six-space model or modify Wide's capacity in place.
- Keep the boat, current landing and animal group prominent in normal phone Play framing.
- Let each important place have one clear visual identity: home lighthouse, sheltered stone refuge, low timber/reed landing or an equally coherent use of existing assets.
- Use modest supported piers, short plausible gangways and shores that meet the water. Avoid broad generic masonry bars and large empty decking.
- Compose coast, vegetation and landmarks as groups. Each island should have a deliberate silhouette and visual purpose, without scattering tiny props to fill space.
- Automatic seating and transfers stay stable. Preserve full names/portraits and species silhouettes, including fallback behavior.

Reuse established character archetypes with stable identity mapping. Add only the few new individual names needed for this standalone candidate; do not strand Pip, Rue, Moss, Nell or other already rescued named neighbors again. No new species or portrait family is commissioned.

### Water and routes

Preserve the current water palette, motion, wake, shallow-bank response, tide height, reflections and audio. New authored depths must feed the existing bathymetry correctly. Keep deeper node pockets and deep alternatives truthful; loading changes draft, not geography.

Keep rounded courses clear of land, with no misleading crossings or accidental implied junctions. A route must remain the same route in dots, highlighting, ferry motion and inspection.

### Phone composition

Inspect ordinary 390×844 and 780×320 Play first, then 320×740, 844×390 and desktop. Whole cove must remain useful, but fitting a miniature network is not the visual acceptance criterion.

At the important initial, loaded and staged states:

- The relevant animal group reads as characters rather than small marks on a large floor.
- The selected landing, ferry and immediate route relationship are understandable together.
- Actions/markers do not cover faces or physically important landing geometry.
- Place names remain associated with their own destinations; avoid long crossing leaders through the ferry.
- No large blank upper area displaces the entire active composition into a corner.
- Buttons and state/deadline cues remain readable and within safe areas.

Prefer solving these requirements in the candidate's authored layout and local composition. Do not launch a general camera, label or UI redesign. If a shared defect directly blocks the candidate, make the narrow fix and capture the affected earlier-cove regression. Preserve free panning, Whole cove and Back to boat.

## 5. Practice and continuity boundary

Add the candidate to the existing Practice entrance and explicit ?cove= loading path, with honest labeling as a playable cove. It must be reachable without completing Wide.

Preserve the current storyCoves order, a-wider-deck trigger, explicit story acknowledgments and strict saved-progress semantics. Do not insert Two Shelters into campaign completion, replace a Wide save, mark the candidate complete from older history or write campaign progress through Practice.

The shared registry may need a new Practice entry or type wiring; this is not permission to change the story list or validate a new campaign prefix. Preserve all five existing level contracts and original rule behavior.

Keep Wide, its larger ferry and its scene as existing work. Record that their visual/difficulty acceptance is negative and that the new candidate has not yet earned the mandatory campaign slot. A later scoped route/save integration will replace the slot after playtest. Do not automatically move the launch in this task.

Do not change music, victory mix, controls, story player, narration or unrelated settings. No Orin/current implementation. Update the inventory/ledger for actual changes and preserve stable IDs. New level instances normally reuse families; do not create duplicate families to label every island.

## 6. Focused verification

Run Node24 production build/typecheck, the existing unit suite and asset validation. Use meaningful new coverage for the candidate's rule contract and practice isolation; avoid tests that merely mirror its JSON.

Require:

1. Production-rule verification of the successful rescue and documented tempting alternatives. Preserve complete state and event-order correctness.
2. Actual UI rescue in portrait and short landscape. Include a subset transfer, staging/retrieval decision, the relevant tide boundary, tide Undo/replay and terminal Undo. One sequence may cover multiple requirements.
3. Free inspection, direct Sail, blocked reasons, visible immediate-loss consequence, transaction feedback and keyboard/touch behavior work for this candidate.
4. Practice opening, Restart, successful completion, Home return and reload do not alter existing campaign save bytes or invent a checkpoint. Use representative existing pending-scene, active-Wide and completed-four-cove records, retaining their original data.
5. Earlier coves retain original puzzle data, ferry capacities and rules. Smoke Holding and Driftwood with their existing models; extend checks only for shared runtime surfaces actually changed.
6. Sound intent, Reduced Motion, mute and rotate/fullscreen recovery retain the existing lifecycle. A screenshot cannot establish physical-phone audio/performance.
7. Review native Play/Overview images for the specific composition criteria above, including the ferry and all candidate passengers at their meaningful states.

If the core puzzle remains a rote collection loop, report and correct that before claiming the candidate ready. If a visual condition still fails, fix the composition rather than counting a bounds assertion as aesthetic approval.

Preserve original failures and corrections. Carry inherited portrait-loading, overlap, heading, precise rapid-touch, device and listening limits honestly; do not claim unrelated issues closed.

## 7. Evidence and handoff

Under reviews/two-shelters-prototype/ include:

- DESIGN.md with actual chosen mechanics, proof and alternatives.
- REVIEW.md separating functionality, observed visual quality and pending human acceptance.
- Native initial/loaded/staged/rescue frames in portrait and short landscape, plus one Whole cove frame.
- Matched Holding or Driftwood and candidate frames at the same viewport to judge scale/style.
- One uninterrupted actual candidate rescue with runtime audio if capture is available; preserve the actual source/build identity.
- A concise source/preservation record sufficient to show what was tested and what stayed unchanged.

No mockup or generated concept is gameplay evidence. Use existing art to deliver a small playable place; do not create an image background with hotspots.

Update continuity and inventory for implemented content. State that Two Shelters is a Practice candidate, the story route is still unchanged and the twelve-level plan remains proposed beyond the accepted content.

Commit and push to m1-first-crossing without force-pushing, keep PR1 draft and leave main unchanged. Do not deploy.

Put the **local ?cove=two-shelters URL first** in the handoff. Then give exact final SHA/remote equality, concise findings, native phone frames, uninterrupted rescue, checks and limitations. Label the root Journey as unchanged so the user does not mistake the old Wide chapter for this candidate.

Stop after this candidate. Human playtest determines whether it becomes the new C4; campaign/save integration and the later Orin/upgrade threshold are separate work.
