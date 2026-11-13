# ORCHARD_LANDING_01 — meet Orin and prepare the crossing

## Outcome and baseline

Build one complete, compact Practice candidate for the intended seventh Journey cove: **Orchard Landing**, `?cove=orchard-landing`. Introduce **Orin, a gentle deer who occupies three spaces**, aboard the already accepted six-space ferry. Give the player a consequential new planning decision using the existing rules.

The player has accepted the repaired boats/docks, Wide/Reef complexity, connected story and latest mobile readability for continued development. Accepted runtime is `f0ffe2c12f1cc0e42ad7ef10a4b57dd29097c731`, published as **Sites version 19**. The preceding continuity head is `47023ecc8594a9d3181421a64010f8d89955fd55`; this task is added above it. Safely fast-forward `m1-first-crossing` and preserve newer/unrelated work. Do not reset to the runtime SHA.

Read this named root task, `AGENTS.md`, the active `docs/PROJECT_STATE.md`, `docs/GAMEPLAY_RULES.md`, `campaign/PUZZLE_PROGRESSION.md`, and the current sections of `campaign/CAMPAIGN_DIRECTION.md` and `campaign/STORY_SCENES.md`. Inspect the accepted ferry, passenger and phone references before making assets. Historical C5-deer/C6-launch/C7-first-current proposals are superseded.

**Complete the playable candidate in this pass.** Make routine design and implementation choices independently. An initial design note or mockup alone is not the deliverable.

## 1. A different puzzle, within familiar rules

Use this design question:

> What must the light ferry finish—and where must it be—before committing to Orin's three-space load?

Aim for a useful preparation or positioning decision across an opening depth opportunity and the known tide/current schedule. Orin's indivisible cost must affect the plan, rather than simply replacing another animal's appearance. The exact map, starting arrangement, additional neighbors, route depths, tide timings and winning sequence are yours to author. Keep the cove compact and its cast small enough to read on a phone.

Develop the puzzle before expanding its scenery. In `reviews/orchard-landing/DESIGN.md`, explain its central decision and how it differs from:

- Driftwood's staging at the useful refuge before retrieving small neighbors.
- Wide's two-space first homeward trip and six-space final trip.
- Reef's gather-everyone versus early heavy delivery and approach-side choice.

If the candidate reduces to one of those plans with a deer substituted, revise it. The proposed preparation idea is a design target, not a claim that particular values already work. Difficulty should come from visible dependencies between decisions, not extra bodies, a larger map, more required clicks or an arbitrary minimum solution length.

Stay within existing capacity/draft, indivisible passenger subsets, local flooding, tide stages, deterministic turns and complete Undo. At most **one scheduled current passage**, as supported by the current level validator. Do not add falling tides, a second independent current, another boat upgrade, passenger powers, a packing grid, a global turn cap or real-time pressure. Orin's three spaces use the existing draft bands.

Prove the authored puzzle against the production rules. Retain a complete winning witness, meaningful tempting alternatives and their actual consequences, and useful recovery through Undo. Check the concrete shortcuts relevant to this map: collecting everything immediately, delivering small groups repeatedly, waiting on a safe landing, taking an ordinary bypass, and whether Orin is merely cosmetic. Safe waiting need not lose by itself; it must not erase the intended decision. A valid alternative is welcome when it involves another meaningful choice; the listed approaches do not all have to lose. A small developer counterfactual with Orin costing two spaces can help show which dependency his third space creates. Use exhaustive reachability where needed for universal claims, and state any limits. Do not claim multiple distinct strategies unless the evidence shows them.

Keep factual load, depth, route legality, current direction, schedule and flood information available. Tips remains Off by default; optional help must not reveal the intended solution in the ordinary view.

## 2. Orin belongs to this coast

Create a coherent gameplay model and portrait with a stable appearance ID. Orin should be recognizably a cute deer: warm rounded forms, a clear muzzle and face, short readable antlers, and proportions that fit the accepted passengers. Three spaces is a capacity cost, not permission to scale him to three times a rabbit.

Use the existing six-space yellow ferry/red wheelhouse and fitted docks. Extend automatic seating, shore placement and supported transfers deliberately for a three-space body. The present shared helpers distinguish two-space passengers from smaller ones in several places; numeric rule support alone does not make the model fit.

Check each distinct reachable aboard subset and relevant shore group for fit, including Orin alone and the candidate's mixed groups. Use geometry checks where useful and inspect representative native phone states. Where a three/two/one-space group is legal, verify that full load. Cover both supported pier orientations, boarding/unloading, tide changes, delivery and Undo. Faces and antlers must remain legible; feet must meet the deck or landing; the cabin, rail and current marker must not conceal the character. Do not add player-controlled seating or enlarge the hull to hide a fit problem.

Keep accepted Wide/Reef passenger arrangements and the original ferry visually intact. Maintain full names, visible space costs, existing native selection controls and image-failure fallback. Update the asset inventory, gallery/evidence and ledger for content actually added; choose the appropriate existing asset families before creating new ones.

Give the orchard a recognizable but restrained identity through a few shared-style boughs, fruit or leaves and a grounded landing. Preserve the water, shore contact, lighting, routes, sailing, wake, sound and calm arrival. Avoid a new visual style, giant platform or scenery that hides the animals.

## 3. Scope and campaign continuity

This is the intended **C7 candidate**, available through the normal Practice menu and explicit cove URL. It is not an unrelated successor to Wide/Reef, and it does not replace an accepted cove.

Keep the six-cove Journey order, existing scene IDs, completed endpoint and save format unchanged. Opening or playing Orchard Practice must leave existing Journey save bytes untouched, including completed-six and older supported saves. All seven current Practice entrances remain available.

Do not implement its illustrated entry or append it to Journey in this pass. Record the later story premise in the review:

> Orin knows every path through the orchard. Tonight, he needs the ferry.

After acceptance, a separate integration will add this same cove and a compact entry using the existing illustrated player. It must preserve earned rescues and explicitly continue completed-six saves with the established original-byte backup. Do not replay Nell's launch, teach currents as new, or rescue previously delivered neighbors again.

Preserve the accepted mobile presentation: nearby names, named local passenger/Sail actions, clear current arrows, Play/Whole cove, bounded Zoom, panning and free inspection. Use the shared layout rather than a cove-specific camera or label workaround. Keep Sound/Motion settings, direct actions, optional Tips and complete in-session Undo.

## 4. Focused verification and evidence

Verify risks introduced by the candidate and shared changes; do not rerun every historical capture by default.

- Production build, TypeScript, relevant unit/level checks and asset validation. Assert Orin's three-space arithmetic, subset integrity and draft outcomes through real rules.
- Complete the candidate through actual controls in phone portrait and short landscape. Exercise a meaningful bad choice, tide/current change, subset transfer where applicable, final delivery and terminal Undo. Include the ordinary supported touch and keyboard paths.
- Check Practice isolation with an in-progress and completed-six Journey record. Recheck the specific old save cases only if their code changed.
- Inspect matched ordinary Play and Whole cove frames at 390×844 and 780×320, plus a desktop composition. Check Orin alone and mixed loads at actual phone scale, names/actions, shallow readability, transfer support and an ending.
- Give accepted Wide Berth and Reef Return targeted regression coverage for shared model/seating/transfer changes. Retain the old level data/rules/witnesses; broaden checks only to resolve a concrete risk.

Capture one uninterrupted actual rescue with runtime sound, plus a small selection of native frames that shows the new decision and character clearly. Tie evidence to the final source; retain original failures and identify corrections or reused results honestly. Emulation is not physical-device acceptance. Solver witnesses establish correctness, not fun.

## 5. Handoff

Update `STATUS.md`, active project state, relevant gameplay/character documentation and the asset inventory to match what exists. Mark Orchard as a Practice candidate awaiting human acceptance; do not mark the seventh Journey cove or twelve-cove ending implemented.

Commit and push to `m1-first-crossing`, update PR #1 and keep it draft, leave `main` unchanged, and verify remote equality. **Do not deploy.** The existing Site remains version 19 with its custom private audience.

Return the exact final SHA, concise design/review, verification and limitations, representative native phone frames, uninterrupted actual sequence, and both root Journey and `?cove=orchard-landing` local links. Explain the puzzle's intended decision in the developer review without putting its solution into normal play.
