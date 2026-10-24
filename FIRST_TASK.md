# First Codex assignment — M1: The First Crossing

## Deliver the first real playable cove

Implement a small, complete browser-based 3D puzzle scene for Last Ferry using this starter package. The player should be able to rescue the waiting sheep with two rabbits already aboard, see how a full ferry changes route access, use the rising tide, undo a decision, and finish at the lighthouse. Finish the milestone through implementation, inspection, and verification; a plan, static illustration, or unstyled geometry demo is an intermediate result.

The selected stack is TypeScript, Vite, Three.js, a lightweight accessible DOM interface, Vitest, and Playwright. Use Node 24 as the development baseline. Resolve a compatible dependency set from current official documentation and commit its lockfile when following the user's Git workflow. Preserve all brief, data, reference, and review files when creating project configuration.

## Establish context

Read `AGENTS.md`; `docs/PRODUCT_BRIEF.md`; `docs/GAMEPLAY_RULES.md`; `docs/FIRST_COVE.md`; `docs/TECHNICAL_PLAN.md`; `docs/ART_DIRECTION.md`; and `docs/ASSET_PLAN.md`. Read `data/first-crossing.level.json` and inspect `references/first-crossing.png` as an image. Consult `references/README.md` to distinguish the primary visual target from future-chapter references.

Run `node tools/verify-design.mjs` to understand the supplied design check and inspect its documented witnesses. The design model is not an implementation of the rendered game. Create independent application modules and meaningful implementation tests.

Keep a short plan and update `STATUS.md` while working. Resolve ordinary file structure, math, rendering, and interaction choices yourself. Preserve the declared mechanics. If you discover a genuine contradiction that affects those mechanics, explain the evidence and record the resolved decision rather than silently changing the project.

## Included scope

Build the six-node first-cove route network from the level data. Start at `cut` with two rabbits aboard; the sheep waits at `sheep-pier`. Passenger load, draft, route depths, tide rises, pier flooding, success, failure, and turn order follow the rules and level files exactly.

Render the world as real 3D objects: a recognizable yellow hull/red cabin ferry, a visible deck, two distinguishable rabbits, one rounded sheep, coherent island terraces, piers, a lighthouse refuge, and readable water. Use a consistent fixed elevated orthographic camera during play. Reuse or create a small set of deliberate meshes and materials. If Blender or suitable local assets are available, use them where useful; otherwise build credible stylized meshes in code and record their source. Do not let unavailable optional tooling block the whole task.

Add selection and explicit commitment, visible load/depth information, a free next-tide forecast, boarding and unloading choices, Wait, Undo, and Restart. Adjacent water waypoints must be discoverable as well as piers. One move traverses one edge; an apparent long route must not silently consume several turns. Use contextual controls and quiet route previews to keep the view readable.

Provide mouse, touch, and keyboard paths to the core actions. Touch selection must expose the same information available on hover. Preserve a complete camera frame and accessible controls in desktop and small phone landscape layouts; portrait should reframe or provide a usable orientation suggestion without losing state or hiding all controls.

Animate a committed move, boarding/unloading, hull settling, and tide changes. During animation, accept no second gameplay commit. Undo/restart behavior during animation must be explicit and race-free as described in the technical plan. Add a short warm arrival beat: the rescued sheep leaves the ferry and acknowledges the boat near the lighthouse steps. The empty hull lifts naturally. Keep the full ending scene for later.

Add a modest sound layer where the environment permits it: a ferry motor or water cue, docking/boarding feedback, and an arrival cue. Initialize audio from user interaction, provide a persistent mute control, and use generated tones or documented assets. Full music composition is outside M1.

## Execution checkpoints

### A. Rules and an inspectable scene

Create the application configuration, independent state/action logic, meaningful rule tests, and a scene showing the correct route network. Match the camera, palette, scale relationships, and ferry silhouette early. Record the first in-engine screenshot as an intermediate checkpoint and continue.

### B. Playable rescue loop

Connect the real controls to the state machine. Implement previews, commitment, movement, boarding, unloading, tide forecast, Wait, Undo, Restart, and win/loss feedback. Run the supplied witnesses against the application state and complete a rescue through the real UI.

### C. Visual and tactile finish

Improve the same cove: mesh silhouettes, material consistency, lighting, water depths, shorelines, paths, readable passengers, load response, docking, and the arrival moment. Inspect the target viewports. Tune animations for clarity and response. Respect reduced motion. Do not expand the level to compensate for an unfinished core interaction.

### D. Verify and prepare review

Run type checking, the production build, focused implementation unit checks, and browser checks. Capture the requested actual gameplay states and a short recording if available. Write a review report from `reviews/REVIEW_TEMPLATE.md`; update `STATUS.md` and the run instructions in `README.md`.

Continue through these checkpoints within this task; they are not separate permission requests.

## Acceptance criteria

- A fresh checkout with the documented Node version and lockfile can install, run, and build the application.
- The first cove follows the authoritative level data; M1 contains the three rescue passengers and no unrequested additional objectives.
- The sheep can be previewed and boarded; the full-boat shallow route restriction is clear before commitment.
- Forecasts are free and accurate; the tide changes only after committed actions at the defined boundaries.
- At least the documented deep-detour and tide-wait witnesses succeed in the application with matching turn/state outcomes.
- An invalid action consumes nothing; rapid pointer/touch input cannot duplicate a move or passenger.
- Undo restores the entire logical and visible state, including a tide boundary and terminal state. Restart reliably restores the initial level.
- A real user can navigate adjacent water waypoints, board/unload, wait, undo, and finish using both mouse and touch controls. Keyboard access is available through labeled controls.
- The scene has readable 3D ferry/passenger/island/lighthouse silhouettes and a coherent art treatment. A concept-image background or untouched primitive blockout is not the delivered scene.
- The rescue ends with a small arrival moment and an understandable completion state.
- Actual screenshots, exact verification results, tested environments, and remaining limitations accompany the review. Image references are never presented as captured gameplay.

## Deliver the result

Report what changed, how to run it, which checks were run and their outcomes, where the gameplay evidence is, and any material gaps. Identify the source revision or precommit state that produced the evidence as required by `docs/REVIEW_WORKFLOW.md`. Follow the user's existing authorization for commits and remote actions. End after M1; leave later chapter ideas in the brief.
