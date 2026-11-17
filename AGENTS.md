# Last Ferry — repository guidance

## Objective

**Current task: [TERNHAVEN_JOURNEY_01](NEXT_TASK_TERNHAVEN_JOURNEY.md).** The user positively received ANIMAL_PRESENTATION_01 and asks to continue the campaign plan. Append the accepted Ternhaven puzzle after Orchard as Journey cove eight, with one truthful illustrated encounter and deliberate, safe continuation for exact completed-seven saves. Read the named task, [active state](docs/PROJECT_STATE.md), campaign/story guidance and [independent animal review](reviews/animal-presentation/INDEPENDENT_REVIEW.md).

Reviewed and published baseline: `26ca0a4f7b42c3f9e809f4a6558b0df8dc0c9139`, Site **version 22**, hosting `9bde1051ecdcab851c829473b75a82f73ace3be6`. [Publication receipt](reviews/animal-presentation/deployment-confirmation.json). Current runtime still contains seven Journey coves, nine Practice entrances and nine scoring targets, including `ternhaven@1`, target 14. This commission does not itself implement Journey eight.

Preserve the finished four-species/five-appearance animal family, exact identities, world scales, contact/attachment behavior and ten source-derived static profiles. `portraitSources` serves passenger choices; `arrivalFigureSources` serves complete named arrival figures, including earlier deliveries. Retain the animal-local cached geometry/material approach and existing image loading/fallbacks. The Journey task does not remodel, rebake or create per-card 3D renderers. The recorded crowded-frame cost increase remains a physical-phone review question, not a new implementation gate or an assumed FPS result.

The new `ternhaven-wave` scene shows Juniper, Sedge and tan Fennel already aboard the full six-space ferry at open-water Tern Buoy, while Willow waits at Reed Landing. The buoy has no pier. Preserve exact turn-zero handoff, explicit acknowledgment, finite shared-player/audio ownership and the accepted 13/14/14-action witnesses. Extend exact completed-seven records only on deliberate Continue with a distinct original-byte backup; keep all older compatibility, backup collisions/newer-record protection, Practice isolation and earned bests.

Keep the centered lantern/animal arrival bubble, free passenger selection, nearby named commitment, native dialog/fullscreen, complete Undo and provisional result acceptance. An ordinary rescue advances the story at any lantern count. After this contained implementation, report eight available Journey coves and four future coves truthfully. C9–C12, new puzzles, new mechanics and the final supper remain outside this pass.

Local Codex implements and hands off; ChatGPT reviews and handles publication separately. Safely incorporate the current guidance and newer work; never reset to the baseline or force-push. Do not deploy or change access during implementation. Keep PR #1 draft, GitHub main unchanged and the existing custom private audience. Do not copy recipient contact details into the repository. Physical-phone, fresh listening and spoken screen-reader checks remain unverified; the user's deferred playtest does not block this authorized integration.

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
