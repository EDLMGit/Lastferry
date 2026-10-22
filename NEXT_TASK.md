# Last Ferry — luminous water, unhurried crossings and a musical atmosphere

## Current task and working agreement

Continue on m1-first-crossing from reviewed commit **7346b91c23331b7c1e8ad4b147c8fa4006767a89**, preserving newer user work. Read AGENTS.md, the current scene/audio code, docs/ART_DIRECTION.md, docs/ENVIRONMENT.md, docs/TECHNICAL_PLAN.md and reviews/environment/REVIEW.md. Use Node 24.

This is the authorized task following the completed environment pass and advances beyond the original M1 stopping point. Implement this complete milestone, verify it, and perform the established commit/push/draft-PR handoff. Keep PR #1 draft and main unchanged. Make routine art and implementation decisions independently; the user will playtest the result.

The user likes the rounded routes. The water is better, but the scene still lacks the beautiful, absorbing quality they want. They suggest a slightly slower boat and describe the desired feeling through listening to a beautiful AURORA song.

**The goal is a cove that is pleasurable to watch and listen to while considering a puzzle.** Treat that musical reference as tenderness, air, wonder and a little longing. As a deliberate product decision, this brief also adds one original instrumental proposal alongside the water and pacing changes. Water and travel are the primary work; keep the score to the small arrangement below.

## Creative decision

Create a **luminous evening cove** within the existing coastal miniature:

- Deeper blue-green open water and clearer sea-glass shallows.
- One broad, soft region of pearly reflected sky light, gently broken by moving wavelets.
- Selective submerged sand/rock detail that makes the shallows look transparent and substantial.
- A quiet amber reflection near Harbor, connected to its existing refuge light.
- A small ferry that visibly departs, cruises through the light and settles at its destination.
- A continuous, spacious instrumental phrase with quiet water ambience, including while the player is idle.

Keep land, cabin, passengers, piers, warnings and routes readable. This is a light and material improvement to the accepted miniature, not a change to its composition. A dark night scene, literal aurora spectacle, all-over sparkle or larger prop collection is outside this task.

The previous task successfully reduced visual noise. This task needs a clearly visible increase in depth, coherent reflected light and living motion. Recoloring the same flat surface and declaring it more subtle does not meet the goal.

## Preserve the accepted game

Retain the three coves, default Holding Pier, Next cove progression, level selection, contextual controls, accessible compact dialogs, named passengers and complete Undo.

Keep puzzle topology, node coordinates, pier elevations, route control geometry, capacity/draft bands, authored depths, action costs, tide schedule, flood/boarding event order, winning alternatives and losing consequences unchanged. The rounded canonical courses and docking clearance are accepted. This task changes presentation and sound, not puzzle difficulty or available routes.

Real time remains free: watching water, listening, opening Menu or inspecting a route never spends an action or raises the tide.

## 1. Build water that responds to light

### What the reviewed implementation lacks

src/scene/water.ts currently supplies an opaque color field, coastal masks, very slow color drift and world-cell glints whose brightness changes. It has no wave normals, sun/sky response, reflected environment or visible seabed surface. The scene's standard lights do not automatically illuminate this custom shader.

The existing 256×256 coastal mask is useful. Its blue channel represents nearby land elevation, including outside land; it is **not a continuous seabed height field**. Keep its shoreline/bank information, but do not mistake that channel for bathymetry.

### Required visible layers

**A. Coherent wavelets.** Use a small number of compatible, low-amplitude normal layers at different scales. They should move slowly enough to feel calm, but visibly change reflected light during an ordinary five-to-ten-second look. Fine detail stays subordinate to the broad movement and must survive native phone scale without crawling or aliasing. Use seamless local normal textures or an economical analytic equivalent. Any flow-map animation must avoid an obvious synchronized reset.

Large geometric wave displacement is unnecessary. Keep the gameplay waterline, ferry draft and shore contact stable and controlled by the real tide.

**B. Soft reflected light.** Give the shader explicit sky/light parameters coordinated with the scene lighting. Establish a broad pearl-blue sheen, broken into connected soft streaks by the wavelets. Preserve darker, quiet water around it. Highlights should respond coherently to surface orientation and lighting, instead of independently blinking at fixed hashed cells.

Use an inexpensive painterly sky/environment reflection as the starting architecture. Make its spatial composition readable from the fixed camera: the sheen should occupy a deliberate area of open water, rather than turning the entire surface into equally glossy plastic. Subtle variation in the reflected sky or an authored light field can provide that composition.

**C. Visible shallow depth.** Extend the existing coast/bank data into an explicit, bounded seabed height/color representation, or render a small appropriate substrate. Distinguish deep water, shallow sand/rock, and formerly dry ground submerged by a tide. The actual rendered water height must determine the wet/depth relationship.

A compact authored seabed field composited in the shader is acceptable if it visibly conveys depth: a shallow coastal apron, a few irregular sand/rock forms with gentle bottom lighting, color absorption with increasing depth, and distortion tied to the same moving wavelets. Sample the substrate at an estimated point beneath the surface along the orthographic view ray; a small bounded approximation is sufficient. It must remain a separate read beneath the moving surface reflection, rather than another color texture painted directly on the plane.

Keep reflected-light and submerged-detail strengths independently tunable, so the sheen does not erase the depth. A recognizable shallow form should remain visible under passing ripples and become less visible in deeper water. Weaken distortion at shore contact to avoid smearing dry land. A uniform green tint is insufficient. Do not turn shallow banks into bright painted tracks following route centerlines. Keep decorative depth separate from the reducer's authored navigation depths.

Add restrained moving light patterns beneath selected shallow patches only if they improve the result. Their intensity should fade with depth. Keep the large open areas quiet; full-screen caustic patterning would recreate the noise removed in the previous milestone.

**D. Shore and Harbor contact.** Preserve the continuous shore geometry and exact flood thresholds. Refine the immediate wet edge and selective soft lapping so land feels seated in water. Flooded piers must still look flooded. Avoid tracing every shore with a solid bright rim.

Make the Harbor lamp's warmth perceptible in nearby water as a small, elongated, broken reflection. It should belong to the lamp's location and water surface, distort with the same wavelets and remain secondary to the ferry. Let successful delivery gently warm this existing cue. Restore the correct effect on Undo and cancellation.

### Renderer constraints and practical implementation

Stay within the current Three.js WebGL renderer and ShaderMaterial architecture. Favor one bounded water material and cached local data/textures. Full fluid simulation, an engine migration and a general post-processing stack are unnecessary.

The current camera is orthographic. Use its constant world-space view direction for reflection/Fresnel calculations, in the same coordinate space as the normals. Do not copy perspective camera-position formulas or perspective depth reconstruction unmodified. On a flat orthographic surface the base view angle is constant; varying normals and a composed reflected-light field supply variation.

Follow Three.js color management deliberately: color textures and scalar/vector data need the appropriate color-space treatment; shader output must use the intended tone-mapping and output conversion once. Audit this before final palette tuning.

The installed Three.js 0.186.1 Reflector supports orthographic cameras, but the bundled Water and Refractor implementations still contain perspective assumptions. Water2 also needs review of its view-direction/refraction path. These are references or building blocks, not automatic replacements for this game's shader.

A low-resolution, cached reflection of static landmarks is an optional addition **only if** the basic material is strong and the visual gain merits its measured cost. Start small, exclude routes/UI and transient actors from a static capture, and refresh correctly for cove/camera/viewport/water-height changes. Avoid a full extra scene render every animation frame as the default. Do not leave stale reflections through a tide or Undo.

Keep resources bounded and dispose them on teardown. Bundle runtime assets locally and record their provenance. The existing software-rendered frame timings do not establish native-phone performance headroom.

### Tune in the actual game

Keep the small set of artistic parameters together: depth palette, absorption, normal scale/speed/strength, sheen width/strength, warm reflection and shallow-detail contrast. A temporary development-only tuning panel is useful if it makes iteration faster; lil-gui is one option. Select and commit one authored default. Remove/exclude development controls from production.

Judge it in Holding Pier and Bellwater, at the actual camera and both phone widths. Make internal comparisons and choose the strongest version without asking the user to art-direct sliders. Inspect motion as well as stills before considering the material complete.

## 2. Give the ferry time to inhabit the water

All normal moves currently take 780 ms. Longer passages therefore move much faster through the world. Use the accepted canonical path length to choose a modestly longer, deterministic duration.

Start with this policy, expressed in milliseconds:

    duration = clamp(900 + 150 * canonicalPath.length, 1400, 2400)

Calculated against the reviewed paths, this gives approximately:

| Passage | Initial target |
| --- | --- |
| Holding: Shallows → Rabbit Pier | 1.47 s |
| Holding: Harbor → Stone Pier | 1.83 s |
| Bellwater: Harbor → Bell Pier | 2.04 s |
| Bellwater: West → East outer passage | 2.27 s |

These are the slower comparison candidate, not proof of the best feel. Also inspect a more restrained candidate, such as clamp(800 + 140 * length, 1200, 2300), on one short and one long passage. Choose the shortest timing that lets departure, a visible cruise and arrival read clearly without feeling like a forced wait. The final range may be materially shorter than the table. Make that choice internally and ship one default; keep opposite directions equal in duration.

Give roughly the first and last 18–20% of the journey to gentle departure/arrival, with a steadier middle cruise. Preserve arc-length sampling, exact endpoints, continuous heading and the existing distance-based docking clearance. Change the time-to-distance mapping; do not alter the accepted course to obtain a smoother motion.

Retain prompt transfers and Wait. Use a separate, bounded presentation phase for tide changes, initially about 550 ms and capped by the actual action duration, finishing with that action. Do not automatically stretch the water rise to the full longer crossing. Keep any coincident draft response coordinated with it, and keep passengers, shore/contact effects and masks attached to the actual rendered water height throughout.

Preserve the existing approximately 30 ms reduced-motion transitions. Under reduced motion, freeze animated normals, reflection distortion, caustics and decorative lapping and suppress the moving wake. Retain static sheen, visible depth, the exact tide state and the brief state transitions.

Retune the wake for the slower speed. The current 360 ms lifetime will create a much shorter trail when travel slows. Aim for a short, softly spreading disturbance that persists briefly behind the stern, fades naturally after arrival and remains distinct from the dotted course. Bound its length and lifetime; clear it on Undo, Restart and cancellation.

### Fix the timing integration

src/main.ts currently has a hard **1,800 ms fallback**. Simply increasing the world animation duration would truncate the longer journeys.

Use one authoritative transition-duration policy for both the animation and its recovery timeout. Derive recovery from the planned duration plus a bounded margin, initially around 1,000 ms. Retain stalled-transition recovery. Completion, error, visibility reconciliation and cancellation must synchronize the committed state and release the lock exactly once.

Keep one commitment per input and no queued second move. Slower animation must not affect the action count, tide/event order, previews, rapid-confirm protection or complete Undo. Revise the older ferry-duration guidance in docs/ART_DIRECTION.md so it agrees with the chosen behavior.

### Clear the ferry's silhouette

Fix these existing presentation cases as part of making transit worth watching:

- During movement, the local destination passenger card can cover the ferry. Suppress the transfer card while sailing and use one compact, calm transit status such as “Sailing to Bell Pier.” Preserve keyboard status/focus behavior and restore the appropriate local controls on every completion/recovery path.
- At rest, reviews/environment/after/holding-desktop-tide-2.png shows the Harbor card covering part of the loaded ferry cabin. Placement must exclude the projected full ferry/aboard-passenger bounds **after** viewport clamping, as well as the other UI regions. Use another fitting candidate or compact fallback.

Preserve the accepted contextual interaction model and touch targets. This is a bounded placement/transit fix.

## 3. Compose one continuous original musical atmosphere

The current Sound class only plays short action-triggered notes. There is no continuous ambience or score to refine. Create one original, approximately **60–90-second instrumental cue** with a deliberate phrase and seamless return.

The musical direction is airy, tender, spacious and gently hopeful. A slow internal pulse around 60–70 BPM can organize it without an audible drum beat. Use soft open harmony, a sparse small motif, long rests and a restrained shared reverb. Let the middle of the phrase become slightly fuller, then return naturally. Author pitches, voicings, durations and rests; random notes or an unchanging arpeggio do not supply a composed cue.

Keep the arrangement small:

| Layer | Purpose |
| --- | --- |
| Soft sustained harmonic voices | Give the scene warmth and continuity |
| Sparse plucked/bell-like motif | Give the score an identifiable, gentle musical presence |
| Quiet air and water | Give the cove a natural sense of space |
| Soft travel texture | Connect ferry movement to water; fade at the stop |
| Restrained delivery response | Add relief when successful delivery becomes visible |

Use original local synthesis/buffers or appropriately sourced local assets with recorded provenance. The existing Web Audio stack is sufficient for a first musical arrangement: softly filtered voices, bounded polyphony, reusable noise buffers and one modest shared reverb. Keep any generated asset's authoring recipe. External services must not be required during play.

This milestone needs an audible musical proposal, not an elaborate adaptive-score system. Avoid making cosmetic water brightness pulse on every beat or synchronizing action completion to the music.

### Audio behavior

- Start/resume from an intentional game activation or explicit Sound-on gesture, respecting the persisted Sound preference. Handle unavailable audio or a rejected resume gracefully.
- Continue the base phrase through thought, inspection, moves, Undo and Restart without restarting or stacking another copy. Musical phase is cosmetic and need not rewind with Undo.
- Schedule music against AudioContext time, with a bounded lookahead rather than animation-frame timing. Use owned source nodes, bounded buffers and one scheduler.
- Route music, ambience and effects through controlled buses and a master gain. The current Boolean-only mute does not silence already-scheduled nodes. Mute the live mix promptly with a short ramp, including effect tails.
- Keep a compact Sound control reachable during transit. Preserve accessible labeling, keyboard/touch use and the persisted preference. A mixer panel is unnecessary.
- On page hide/interruption, reconcile action effects and suspend/stop scheduling deliberately. Resume enabled audio cleanly without a backlog of notes or duplicate loops. Clean up owned resources on teardown.
- Start movement sound with visible movement and stop it when the ferry stops. Place the delivery resolution at visible successful unloading, not at the initial state commit. Undo/cancellation must clear stale action-specific accents.
- Keep music independent of puzzle time. A player may listen indefinitely without a ticking warning or escalating danger.

Current cove changes navigate to a new page. One clean audio startup per page is acceptable; this task does not require a navigation rewrite. Sound preference remains independent of reduced motion, and every puzzle cue remains understandable with sound off.

Listen to the actual mix if the available environment supports it. An oscillator starting successfully is not musical acceptance. If the arrangement still resembles alert tones or a generic test drone, improve its timbre/phrase before labeling it finished. If actual listening is unavailable, provide a capture and state that sonic quality awaits listening; do not invent a listening result.

## 4. Validate the changed experience

Use the existing build/typecheck and unit coverage. Add or adapt focused checks for meaningful new timing/audio lifecycle risks; avoid tests that merely repeat implementation constants.

Exercise the real interface for successful rescues in Holding Pier and Bellwater and a shared-renderer First Crossing regression. Cover both rises, tide Undo and terminal Undo, with loaded passengers. Check the longest crossing, reverse travel and a short passage. The longest crossing must finish normally rather than through fallback recovery.

Cover natural keyboard and emulated touch at 1440×900, 844×390 and 780×390, including a full transit and the reported docked Harbor-card case. Preserve the existing rapid Confirm protection and modal safety. Verify hide/show during a passage and reduced motion. A slower passage may justify a deliberate test-budget adjustment, but never weaken the state, input or visibility assertions to obtain a pass.

For continuous audio, check initial activation, muted reload, live mute during travel, repeated toggles, Undo/Restart, page hide/show and a full loop boundary. Check that prolonged idle listening leaves game state unchanged and that repeated actions do not accumulate graphs or schedulers. Record which checks establish behavior and which involve actual listening.

Measure before/after renderer work and frame intervals under the same available environment. Investigate material regressions. Report render-target resolution/pass count and asset size if adding them. Keep software-renderer results distinct from physical-device performance; report untested devices honestly.

### Visual and musical acceptance

At native phone size, the water must show identifiable shallow depth, a coherent area of reflected light and slow connected surface movement. Routes, passengers and warning text remain easy to read.

During an unedited crossing, the ferry should visibly cruise through the scene, leave a gentle fading water disturbance and arrive without a snap or covering card. During 30–60 seconds of idle thought, the water and score should remain interesting and calm, without an obvious visual reset or intrusive musical repetition.

Make this judgment from actual gameplay motion and actual audio where available. A successful build, a still image or a count of tests cannot establish the atmosphere.

## 5. Evidence and handoff

Retain a compact set of matching before/after gameplay captures tied to the actual source:

- Holding and Bellwater in ordinary play, including a shallow region and open-water sheen.
- A flooded low shore at tide 2 and the correct Undo-restored state.
- Both phone widths, with route visibility and a clear loaded ferry.
- Harbor's warm response at visible delivery.

Capture a short idle-water segment and an uninterrupted short/long crossing segment at original speed. Include an audio-enabled sample long enough to hear the musical phrase and its loop boundary; this can be a separate actual runtime mix capture. A silent rescue video does not verify the soundtrack. Identify whether media is real-time capture or sampled/offline evidence and retain that distinction.

Use available tools to inspect selected images at native size, motion and sound. Raw media may remain ignored/local if upload is unavailable; clearly report that limitation. Keep historical captures attributed to their original commits.

Update STATUS, the relevant art/environment/technical notes and the asset ledger. Put a concise review report and selected evidence under a new review directory. State exact source, commands, fresh/reused results, original failures and remaining uncertainties. The prior 38-pass/3-timeout browser run plus three isolated passes remains historical evidence, not a clean new run.

Complete the usual normal commit/push and update draft PR #1. Return final SHA, source/remote equality, main/draft status, changes, verification, selected captures and recording locations. Do not merge or mark the PR ready.

Finish this atmosphere milestone before expanding levels or mechanics. The next playtest should let the user judge the combined water, travel rhythm and sound.

## Research references and optional tools

Use these as technical explanations, adapting them to the existing renderer. Unity Shader Graph examples and newer Three.js node-material examples are not drop-in GLSL code.

1. [Aleksandar Gjoreski — Be Water, my friend!](https://aleksandargjoreski.dev/blog/stylized-water-shader/): a Three.js development account connecting normals, reflected/refracted light and absorption.
2. [Alexander Ameye — Stylized Water Shader](https://ameye.dev/notes/stylized-water-shader/): useful organization of depth, color, refraction and shore effects; distinguish vertical depth from camera-ray thickness.
3. [Catlike Coding — Texture Distortion](https://catlikecoding.com/unity/tutorials/flow/texture-distortion/): flowing texture coordinates and phase blending to hide resets.
4. [Three.js — Color Management](https://threejs.org/manual/pages/color-management.html): linear working space, texture roles and custom-shader output conversion.
5. [Three.js Reflector orthographic support](https://github.com/mrdoob/three.js/pull/33249) and [Reflector documentation](https://threejs.org/docs/pages/Reflector.html): consult only if adding a justified reflection capture; inspect installed helper code.
6. [lil-gui](https://lil-gui.georgealways.com/): optional development-only parameter tuning.
7. [Spector.js](https://github.com/BabylonJS/Spector.js): optional WebGL frame inspection if render-pass or shader behavior needs diagnosis.
8. [Material Maker](https://www.materialmaker.org/): optional procedural texture authoring/export tool. A reproducible local script is also suitable; installing another editor must not block the task.
9. [MDN — Creating and sequencing audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques), [GainNode](https://developer.mozilla.org/en-US/docs/Web/API/GainNode) and [AudioContext.suspend](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/suspend): scheduling, live gain and audio lifecycle.
10. [Chrome — Web Audio, Autoplay Policy and Games](https://developer.chrome.com/blog/web-audio-autoplay): activation/resume behavior.

Read source licenses before incorporating third-party code or assets and retain required notices. The reference list is guidance, not a request to install every tool.
