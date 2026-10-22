# Technical plan — M1

## Selected baseline

Use TypeScript, Vite, Three.js, an accessible DOM overlay, Vitest, and Playwright. Node 24 is the selected development baseline; `.nvmrc` records the major line. Resolve compatible current packages when implementation begins, retain the resulting lockfile, and record actual versions. The package itself has no installed application dependencies.

This is a small static browser game. Keep the renderer choice conventional and browser-compatible. A local development server is sufficient for M1. No account system, hosted backend, runtime AI, purchase system, or publishing integration is part of this task. Official references and the reasoning behind the baseline are in `SOURCES.md`.

## Small module boundaries

Use a structure like the following, adapting incidental names when useful:

| Area | Responsibility |
| --- | --- |
| `src/game/` | State types, input validation, legal actions, pure reducer, preview, undo history, terminal state |
| `src/levels/` | Load and validate the supplied JSON level; convert render hints into scene coordinates |
| `src/scene/` | World objects, camera, lighting, water, ferry/passenger presentation, transitions |
| `src/ui/` | Labeled controls, selection/confirmation, forecast, status and accessibility |
| `src/audio/` | Small user-gesture-initialized sound layer and mute state |
| `tests/` | Actual game-rule and browser interaction checks |
| `public/assets/` | Production assets with documented sources |

The renderer consumes committed game state and transient preview state. It does not own the rules. Animation completion must never advance time, move passengers in the logical state, or decide success. Apply an action once; animate its already-determined result.

## State and action handling

Follow `GAMEPLAY_RULES.md` and `data/first-crossing.level.json`. Keep exact IDs stable. Define explicit validated action types. A preview runs against a copy and leaves both committed state and history unchanged. Preserve complete pre-action snapshots for undo; restore logical state first and reconcile all visible objects from it.

One edge is one move and one turn. Routes may include multiple authored waypoints for a curve, but they remain one edge. Moving to a nonadjacent destination must not become an unannounced multi-turn action. First-cove water nodes should have visible selection targets when relevant, supported by contextual named buttons.

Keep a single input transaction lock while a committed action is being animated. During that interval, new gameplay commits, Undo, and Restart are disabled with an understandable busy state. Read-only controls may remain available. Release the lock on completion, cancellation, error, visibility changes, or a fallback timeout; render the committed end state before accepting more input. Reduced-motion mode resolves transitions quickly without changing rules. This deliberately simple policy avoids mid-animation rollback races.

Selecting a passenger or route shows a preview. A clearly labeled confirmation commits it. Desktop hover may also show a preview, but touch and keyboard must have equivalent selection. The tide control first previews; a separate `Wait` action advances one turn. Closing a preview or clearing selection is free.

Restart should warn only if necessary to prevent an accidental loss of current progress; one deliberate restart control with immediate undo-free reset is acceptable for this short cove. Undo remains available from failure and success, outside the brief transition lock.

## Rendering and asset integration

Use the world coordinates, waypoint routes, and island footprints in the level as layout guidance, and the primary image for style. Keep navigation water corridors clear. Match boat scale, draft offsets, pier height, water level, and shorelines through one explicit conversion between abstract tide levels and world Y. Abstract depth units are game rules, not claimed physical meters.

Keep cosmetic bobbing smaller than the meaningful difference between draft bands. Attach passenger transforms to the ferry during travel and reconcile them with the pier positions when disembarked. Lighting and camera changes must not hide the load cue.

Start with straightforward water geometry and shader/material work suited to the scene. Discrete authored shoreline states may animate smoothly between the defined tide levels. Complex fluid dynamics are unnecessary. Record unsupported effects or lower-quality fallbacks honestly.

## Inspection and replay

Expose a development-only read interface such as `window.__LAST_FERRY__` with `getState()`, `getLegalActions()`, `getRenderStatus()`, and `getMetrics()`. Returns should be copies, with stable IDs and explicit pending-animation state. Test setup may also support reset/loading of known fixtures in development builds. Keep these helpers out of normal player flows and production global APIs where practical.

Use state snapshots to diagnose outcomes. Use real UI actions for at least one full rescue, input rejection, touch interaction, and undo across a tide rise. Direct fixture loading is useful for a repeatable screenshot but does not substitute for completing the journey.

## Required command contract after implementation

| Command | Meaning |
| --- | --- |
| `npm run dev` | Start the local playable app and print its URL |
| `npm run build` | Type-checked production build, or paired with explicit typecheck below |
| `npm run typecheck` | Check application TypeScript without silently ignoring errors |
| `npm run test:unit` | Non-watching focused tests of actual application rules and relevant state transitions |
| `npm run test:e2e` | Browser tests using real controls; create actual captures where configured |
| `node tools/verify-design.mjs` | Separately verify the supplied design and level |

Create these scripts honestly. A script that prints a success message without the named work is not an implementation. Document any browser installation prerequisite and an actual manual route when automated capture is unavailable. A lockfile should make `npm ci` reproducible after the initial dependency resolution.

## Focused verification

Cover pre-action validation, load/draft boundaries, the exact turn-4/turn-8 transitions, boarding before a flooding boundary, an invalid shallow move, free previews, passenger conservation, full undo across a tide boundary, success/failure undo, reset, and input locking. Check the recorded design witnesses against the actual game state. Avoid tests that only assert implementation constants or call the design verifier and claim the game is tested.

For browser evidence use desktop 1440×900 and a phone-like 844×390 CSS-pixel landscape viewport with touch emulation. Also inspect a narrow portrait layout for clipped/inaccessible controls. Emulation is not a real Android/iOS device test; state that difference in the report. See `REVIEW_WORKFLOW.md` for artifact naming and revision provenance.

Aim for smooth movement and responsive interaction. Record actual browser, viewport, hardware/runner, and sample method for any performance claim. A working target is 60 fps on the tested desktop and stable interaction on the tested phone configuration; these are goals, not guaranteed support claims. Lower pixel ratio, shadow resolution, or decorative detail where needed. Do not hide a rule/UI problem by labeling it a performance issue.

## Shared curved routes and coastal presentation

The environment milestone uses `src/scene/paths.ts` to cache one canonical course per edge at level load. Local quadratic corner fillets trim at most 0.75 world units and 25% of either neighboring span. They stay within each corner's convex envelope. A dense approximation is resampled at no more than 0.05 world-unit intervals with cumulative distances and unwrapped tangent angles. Distance lookup traverses the same geometry in reverse; it does not construct an independent return curve.

`sampleJourney` uses the symmetric velocity ramps and steady middle from `transitions.ts`, retaining the broadside docking clearance blend. A single planned duration is passed to both World animation and its duration-plus-1,000ms recovery timer. A separate final phase capped at 550ms drives tide and coincident draft response, ending with the action; ordinary transfers/Wait take 520ms, winning unloading 900ms and reduced motion 30ms. Completion is guarded by transaction identity and releases the input lock once after synchronizing committed state. The route line, emphasis, motion and full-ferry tests consume the unchanged canonical course. Graph nodes, pier coordinates, base depths and action costs remain authoritative and fixed.

`src/scene/water.ts` retains the bounded 256×256 RGBA coastal field for bank/shore relationships. Its blue channel is nearby land elevation, not bathymetry. `seabed.ts` independently authors a second 256×256 RGBA field: linear RGB albedo and encoded continuous height in alpha, bounded from -2.2 to 0.72 world Y. It supplies a coastal apron, irregular sand/rock patches and actual land exposure independently of route centerlines. Neither decorative field participates in rule validation.

`water-shader.ts` uses three analytic normal layers, explicit sky/sun parameters, a composed pearl reflection and the existing Harbor lamp position. Orthographic view direction is constant in world space. A bounded two-sample view-ray approximation locates the substrate below the actual water height; depth absorption and distortion use the same normals. Contact distortion weakens at shore. Palette, absorption, normals, sheen, detail and lamp strengths are grouped in `WaterTuning`. The two RGBA data textures use `NoColorSpace`, with RGB authored in linear space; CSS palette colors enter through Three Color. Output applies installed Three tone-mapping and output conversion chunks once. There is one water draw, no reflection target and no extra per-frame scene pass. Texture data totals 524,288 bytes. Owned texture/material/geometry resources are disposed on page teardown.

`src/scene/shore.ts` supplies continuous coast geometry, grouped instanced rocks, water-height wetness and cached forecast contours. Rendered water height drives contact detail during transitions, while sync restores exact state immediately for Undo and Restart. The actual new solid geometry is checked within the original validated footprint envelope; full rotated ferry clearance retains both footprint exclusions and the required centerline margin.

`src/scene/effects.ts` holds a short dynamic wake ribbon sampled from the actual stern and a restrained existing-lighthouse response on delivery. Static geometry and materials are reused. Effects reset independently from authoritative state on Undo, Restart, cancellation and level changes. Reduced motion suppresses moving decorative wake detail and presents arrival calmly.

Read-only development inspection may expose actual route buffers, boat transforms, shore uniforms and effect buffers for browser verification. Production excludes these globals. Numeric checks supplement actual-play recordings and native-size visual inspection; neither state snapshots nor software-renderer timings prove physical-device motion quality.

## Continuous audio

`audio/score.ts` authors “Between the lamps”: 80 beats at 64 BPM, ten eight-beat open voicings and 21 motif notes with explicit durations, strengths and rests. `audio/atmosphere.ts` synthesizes soft periodic-wave voices, sparse plucks, deterministic reusable air/water noise and a shared stereo convolution response. One AudioContext-time scheduler runs every 100ms with a 350ms lookahead; ended sources are disconnected. Music, ambience and action buses feed one live master gain. Mute ramps the whole mix, including scheduled voices and tails, to zero before suspension. No external assets or service are needed.

Intentional activation/resume respects the persisted mute preference and handles unavailable/rejected audio. Undo/Restart clear only action effects; the base phrase keeps its phase. Hide/interruption stops scheduling and reconciles movement effects; resume skips stale events rather than replaying a backlog. Teardown clears the timer, sources, buffers, capture tracks and context. Travel starts at the first visible movement frame and stops at completion/reconciliation. Delivery begins during visible unloading. The compact HUD Sound control remains operable while gameplay is locked. DEV-only post-master capture/meter and lifecycle inspection support actual-runtime verification; production excludes them.

Color-management and scheduling references: [Three color management](https://threejs.org/manual/pages/color-management.html), [MDN Web Audio sequencing](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques). Implementation and actual listening limits are recorded in `reviews/atmosphere/REVIEW.md`.

## Delivery hygiene

The shallow-detail refinement shares a pure `game/rescue-facts.ts` occupied-pier deadline between status copy and `audio/arrangement.ts`. This derives only required waiting passengers and future authored rises. Aboard/delivered passengers and terminal status determine homeward/won/lost arrangements; preview and elapsed listening do not change desired state. Main reconciles initialization, commit, Undo and Restart, deferring terminal presentation until visible delivery or completion/recovery. One latest desired arrangement replaces obsolete requests while the original phrase clock continues. See [AUDIO.md](AUDIO.md) for the bounded companion voice and lifecycle contract.

Scoped `scene/contact.ts` clones lower hull and selected pile materials, comparing transformed world height against the existing animated shore-water uniform. `models.ts` explicitly returns lighthouse lens/lamp/anchor; effects reset to persistent home identity rather than extinguishing it. No gameplay coordinate, passage, action timing or navigation calculation reads decorative seabed/contact data. Refined fields retain resolution and pass count; before/after CPU construction, idle rendering and audio-enabled crossing measurements are recorded separately under `reviews/refinement/`.

Bundle the assets needed for ordinary play rather than relying on hotlinked reference images. Document production asset origins. Keep generated videos and large test outputs out of routine source history unless the user chooses an artifact destination. Keep small review reports and selected actual screenshots with their source revision. Add CI only after the real commands exist and run successfully.
