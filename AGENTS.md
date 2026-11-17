# Last Ferry — repository guidance

## Objective

**Current task: [ANIMAL_PRESENTATION_01](NEXT_TASK_ANIMAL_PRESENTATION.md).** The user asks for improved animal models, a stronger rescued-animal showcase and better offboarding passenger cards, comparable in finish to the new lanterns. They have not sent TERNHAVEN_JOURNEY_01 to Codex and choose this presentation pass first. Read the named task, [active state](docs/PROJECT_STATE.md), [art direction](docs/ART_DIRECTION.md) and [planning review](reviews/animal-presentation/PLANNING_REVIEW.md).

Refine the actual shared four-species/five-appearance animal family, then produce two faithful static profiles from it: recognizable close-up passenger-choice portraits and complete arrival figurines. Improve the complete rescued group and Board/Let ashore/Bring home controls in the existing teal interface. The older portrait task's exact-geometry freeze and old 44px prescription are superseded by this user request. Preserve identities, world scale, practical deck/transfer fit and all decision information.

Keep the original lantern crown, native dialog/fullscreen, safe-bound centering, finite arrival ownership, nearby confirmation, free selection, complete Undo and provisional result acceptance. Use animal-local geometry/material choices; shared primitive/material helpers also build the ferry and scenery. Keep source-derived model/portrait consistency, five stable appearance keys, existing loading/fallback behavior and accurate provenance. This is actual model/UI implementation, not a gallery-only pass.

**TERNHAVEN_JOURNEY_01 is queued after review of this pass; do not implement or chain it now.** Preserve its brief. Runtime remains seven Journey coves, nine Practice entrances and nine scoring targets, including `ternhaven@1` target14. All puzzles/witnesses, rules, current bests, save history/backup bytes, story progression and Practice isolation remain unchanged. No C9/new mechanic or narrative content is part of this pass.

Current reviewed/published runtime is `a2740e61ec5a782f558ea6caad4181466d04e9f7`, Site **version21**, hosting `ea3bed5c0aaf41e4ba516e4621da0f81119e652b`. [Arrival review](reviews/arrival-bubble/INDEPENDENT_REVIEW.md) · [Receipt](reviews/arrival-bubble/deployment-confirmation.json). This guidance does not itself replace models or deploy. Keep the existing custom private audience; never copy recipient contact details into the repository.

Local Codex implements and hands off; ChatGPT reviews and handles publication separately. Incorporate this task commit without discarding newer work. Do not deploy in the implementation pass. Keep PR #1 draft and GitHub main unchanged. Physical-phone/listening/spoken screen-reader checks remain separate; the user's deferred playtest is not a new implementation gate.

## Read and preserve the project decisions

- Read `FIRST_TASK.md`, `docs/GAMEPLAY_RULES.md`, `data/first-crossing.level.json`, and `docs/FIRST_COVE.md` before implementing gameplay.
- Inspect `references/first-crossing.png` visually; read `docs/ART_DIRECTION.md` and `docs/ASSET_PLAN.md` before building the scene.
- General mechanics belong in `docs/GAMEPLAY_RULES.md`; exact first-level values belong in the JSON level. Explanatory prose and generated art do not override them. Resolve a material contradiction explicitly rather than silently changing a rule.
- Use the TypeScript/Vite/Three.js architecture in `docs/TECHNICAL_PLAN.md`. Keep game state independent of rendering and animation.
- Preserve user changes and any applicable repository instructions. Make routine implementation choices without repeated confirmation. Follow the user's current Git workflow and authorization for remote actions; never force-push.
- Reuse existing asset families before adding near-duplicates. The same change that adds, replaces or retires an asset family must update `assets/catalog.json`, its gallery/evidence entry and provenance in `docs/ASSET_LEDGER.md`. Keep instances in level data, editable sources local, and human acceptance separate from integration. Run `npm run check:assets` after inventory changes.

## Implementation priorities

1. Clear and correct player interaction: action previews, one commitment per input, deterministic turns, and undo.
2. Recognizable 3D ferry, passengers, islands, and lighthouse; coherent camera, water, and lighting.
3. A complete rescue loop and a small satisfying arrival.
4. Focused tests and reviewable evidence tied to the actual implementation.

Code-built geometry is acceptable when it meets the art direction. Raw primitives are an intermediate checkpoint, not sufficient final art. Do not use a concept image as a background with clickable hotspots to stand in for the 3D game.

## Verification

The starter includes `node tools/verify-design.mjs` as an independent design check. It is not the game runtime. Build the actual reducer, controls, and renderer; test them independently and replay the supplied action sequences against them.

After creating the app, provide `npm run dev`, `npm run build`, `npm run typecheck`, `npm run test:unit`, and `npm run test:e2e` as specified in `docs/TECHNICAL_PLAN.md`. Run the checks relevant to the work. Once remaining concrete risks are covered, avoid redundant tests and speculative infrastructure.

Use the real interface for at least one complete rescue and one undo across a tide rise. Capture gameplay at desktop and phone landscape sizes. Screenshots support visual review; a state-only test cannot establish visual quality. If browser/device/video tooling is unavailable, record what is unverified and provide reproducible manual steps. Never fabricate a passed check or a gameplay capture.

## Code Review Rules

Flag preview code that mutates committed state; tide/flood event-order errors; passenger duplication/loss; partial undo; actions accidentally triggered twice; paths crossing land; inaccessible controls; misleading visual state; unsupported verification claims; and scope expansion beyond the task.

Prefer actionable findings with reproduction and consequences. Separate verified defects from visual preferences and untested risks. Follow `docs/REVIEW_WORKFLOW.md` and the review templates.

## Completion

For the next scoped task, maintain `STATUS.md`, the active project state and focused evidence. Keep PR #1 draft and GitHub `main` unchanged. Follow the user's current publication instruction, preserve the Site's custom named-viewer access, and retain all earlier tasks and publication receipts as history.
