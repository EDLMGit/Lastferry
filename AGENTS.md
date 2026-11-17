# Last Ferry — repository guidance

## Objective

**Current task: [COVE_NINE_PRACTICE_01](NEXT_TASK_COVE_NINE_PRACTICE.md) — Drowned Orchard.** The user asks to continue after the completed Ternhaven Journey handoff. Author, prove and implement one compact independent, initially unscored Practice candidate for intended cove nine. This new bounded commission supersedes the previous integration pass's C9 exclusion; it does not authorize C9 Journey integration or C10–C12 work. Read the named task, [active state](docs/PROJECT_STATE.md), current campaign/progression guidance and [Ternhaven independent review](reviews/ternhaven-journey/INDEPENDENT_REVIEW.md).

Reviewed and published baseline: `1e3146652f50c88db1ce7d56c6de14e311aab719`, **Site version 23**, hosting `11ab9f44542ea798c2e4ed21aaabb071d1780ef4`. [Publication receipt](reviews/ternhaven-journey/deployment-confirmation.json). Live content has eight Journey coves, nine independent Practice entrances and nine accepted mastery identities. Drowned Orchard is not implemented by this guidance; its implementation yields eight Journey, ten Practice and the same nine accepted scoring identities.

Revisit recognizable accepted C7 Orchard landmarks under changed water with a new waiting group; Orin, Pomme, Medlar and all previously rescued neighbors remain safe. Investigate the relationship between which side of the turning reach the ferry/remaining group must occupy and what earlier load or rescue obligation makes that possible. Prove an added inference beyond Orchard's escort partition and Ternhaven's staging/retrieval plan. Exact data, solutions, minimum and proposed target remain authoring/proof outcomes, not prescribed facts. Use current six-space rules and at most one current. Do not resurrect the historical four-space Orchard or first-current teaching roadmap.

Retain recognizable orientation while allowing justified candidate-local changes to usable landings, routes and water. Both original low Orchard landings have elevation 1; do not copy their waiting passengers into an already flooded starting state. Use production rules/Session, exhaustive minimum and losing-branch evidence, isolated counterfactuals, two consequentially different solutions and real-interface mistake recovery. Keep the proposed target developer-only until candidate/revision acceptance; reuse the existing unscored fallback.

Preserve the eight-cove Journey, exact completed-seven continuation and all older compatibility, original-byte backups, pending scenes, earned bests and Practice isolation. Preserve accepted puzzles/witnesses/targets, revised animal models and both profile maps, physical fit, lantern/arrival UI, controls, finite ownership, audio, water and complete Undo. Restrict shared changes to a demonstrated candidate integration defect. No new mechanic, species, animal/export pass, story scene, Journey append, migration, final supper or deployment belongs to this task.

Local Codex implements, verifies and returns a normal pushed handoff; ChatGPT reviews and handles publication separately. Safely incorporate current guidance and newer work, never reset or force-push, keep PR #1 draft and GitHub main unchanged. Preserve existing custom private access and do not copy recipient details into the repository. Physical-phone performance, fresh listening and spoken screen-reader checks remain open. The recorded 4.966s Ternhaven handoff capture gap has an unmeasured cause; do not claim smoothness from that film or reinstate the deferred phone test as an implementation gate.

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
