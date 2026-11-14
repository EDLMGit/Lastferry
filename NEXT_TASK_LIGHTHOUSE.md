# Last Ferry — Lighthouse light refinement

## Goal and approved scope

Give the won-state lighthouse sweep a soft, dimensional, atmospheric appearance. The user likes the homecoming overall but finds the beam flat. Keep this milestone open for a focused lighting refinement before adding more features.

The target is a warm lantern sending a quiet shaft through a little sea air. The beam should dissolve at its edges and fade into the distance, while the lighthouse, animals and sea remain clearly readable.

Preserve the accepted homecoming: slow rotation, finite animal reaction, conditional camera, compact ending, shared Settings, sound and all puzzle behavior. This task changes the lighthouse light's rendering, not its gameplay or timing.

## Repository and reviewed baseline

- Repository: https://github.com/EDLMGit/Lastferry
- Branch: `m1-first-crossing`; existing PR #1 remains draft; main stays unchanged.
- Baseline game SHA: `dafb445b8d769ff92b4390d06bf3ca92bbbe8b8b`.
- Read `AGENTS.md`, `docs/PROJECT_STATE.md`, this task, relevant art guidance and `reviews/homecoming/REVIEW.md`.
- Inspect the current checkout and preserve newer/unrelated work. Do not reset to the baseline or repeat completed homecoming work.
- Confirmed private playtest: https://last-ferry-playtest.abumech.chatgpt.site now contains game `dafb445b8d769ff92b4390d06bf3ca92bbbe8b8b`; publication succeeded on 2026-10-23. Its Site source is `049c7998a8bd8afbd2e42c414c80ea0bad7d7e8d`, which includes hosting metadata. Record these separately from the next implementation SHA.
- The reviewer independently found no blocking homecoming regression, reran build/typecheck and **153/153 unit tests**, and inspected committed desktop/phone captures. Contributor browser results remain contributor results; no new independent WebGL playthrough or physical-phone result is claimed.

## Diagnosis from the actual implementation

The current beam in `src/scene/effects.ts` is already an open, tapered 3D `CylinderGeometry(0.82, 0.035, 4.8, 20, 8, true)`. Increasing the segment count alone will not address the reported look.

Its fragment shader uses axial UV falloff and an angular term equivalent to `.45 + .55 * abs(cos(circumference))^3`. That term keeps substantial opacity at the geometric silhouette and rotates with UVs rather than responding to the viewing direction. The committed captures show a coherent triangular edge and broad surface-like fill. This is the source-grounded working diagnosis; evaluate the replacement in the real scene.

The material already has `depthWrite: false`, `DoubleSide`, `forceSinglePass: true` and output/tone-mapping chunks. Do not describe it as a flat plane or assume it currently uses two render passes.

## Researched approach

Start with an improved cone proxy shader using smooth view-facing attenuation and longitudinal density falloff. Use a restrained additive contribution as the first blending candidate, and reuse the existing source glow. This approximates the appearance of light scattered through air; it is not a physically complete volumetric simulation.

The original technique reference is John Chapman's **“Good Enough” Volumetrics for Spotlights**. It combines a cone, distance attenuation and normal/view-based soft edges, and describes source-glow and intersection limitations. Adapt the principle to the current renderer; do not install an old demo library or copy an entire example.

### Camera-specific requirement

This game uses an **orthographic camera**. The viewing rays are parallel. Derive the facing attenuation using a consistent view-space normal and constant view direction, rather than copying a perspective eye vector formed from each fragment's position. Re-normalize interpolated normals and inspect both ordinary and arrival camera compositions.

This is an implementation adaptation to Last Ferry, not a recommendation to change its camera.

## Visual requirements

### 1. Soft edges and depth

- Replace the circumference stripes/opacity floor with a smooth silhouette fade that approaches transparency at the visible boundary.
- Keep a gently brighter body and a broad falloff along the beam. Fade the far end completely before the mesh boundary; no visible end cap or abrupt cutoff.
- Preserve a clear source at the lantern's glass height. Avoid a beam that appears to emerge from the roof, detach from the building or widen into a solid panel.
- Inspect the full rotation: side-on, diagonally away, closest-to-camera orientation and behind the tower. No sudden disappearance, UV seam, hollow-looking ring or brightness burst from overlapping front/back surfaces.
- Keep color warm ivory/amber within the accepted palette. Leave the cove exposure, sky, water palette and ordinary lighting unchanged.
- Match the miniature's scale. A shorter convincing shaft is preferable to an oversized washed-out cone; select reach/width from actual captures.

### 2. A convincing lantern source

Reuse/refine the existing small lantern glow so the source feels luminous and supports the shaft when it is foreshortened. Keep the roof, glass and rails recognizable.

Aim for the existing beam plus existing source glow. A deliberate additional bounded layer is acceptable only if an in-engine comparison demonstrates value. Do not stack many transparent shells to hide an unresolved edge problem.

### 3. Quiet atmosphere

First make the clean, smooth beam work. The sweep itself supplies the motion.

Only add very faint, broad density variation if it improves the result at native phone size. Avoid fine particles, sparkle, stripes, obvious scrolling noise and independent pulsing. Reduced motion freezes any new variation as well as rotation.

Preserve the existing Harbor water response and reflection. A horizontal beam does not justify painting a rotating triangular decal onto the water. Only make a small local integration correction if a demonstrated mismatch requires it; document it.

## Rendering constraints and tradeoffs

- Stay in the existing Three.js/WebGL renderer and render loop. No dependency, renderer migration or separate effects framework is needed for the chosen approach.
- Keep depth testing enabled so opaque foreground geometry can occlude the effect. Disable beam depth writes so the transparent effect does not become an opaque depth obstruction.
- Explicitly control blending and front/back contributions. Low intensity additive blending is a candidate, not permission to wash out the sky or animals.
- Preserve the current linear-color handling and `tonemapping_fragment` / `colorspace_fragment` output path. Do not increase global exposure or bypass tone mapping to manufacture brightness.
- Keep the current single-pass choice unless a measured, documented improvement justifies a change. A single draw call can still have substantial transparent overdraw; report actual behavior rather than equating draw count with GPU cost.
- Keep smooth normals continuous around the cone. Check its seam during rotation.
- The proxy has limited behavior where it intersects surfaces. Inspect the authored elevated beam before adding depth sampling. First solve demonstrated intersections through a suitable bounded shape/fade. A new scene-depth pass, shadow spotlight, full-screen bloom or ray-marched volume is outside this pass.
- Exclude all effect geometry from picking and camera-fit bounds. Reuse and dispose owned resources correctly; do not allocate meshes, textures or shader variants per win or per frame.

### Alternatives considered

| Option | Decision |
| --- | --- |
| Refined cone shader and existing lantern glow | Implement first; directly addresses the observed shell edges within the existing renderer. |
| More opacity, larger glow or bloom over the current cone | Does not resolve the underlying silhouette; avoid as the main fix. |
| Crossed planes/billboards | Can expose flat cards during rotation; no clear benefit over the existing 3D proxy. |
| Analytic ray/cone thickness | Consider later only if important views remain unacceptable after the simpler treatment. |
| Screen-space god rays / full volumetrics | Wider sampling/compositing work and different artifacts; not selected for this one effect. |

These are engineering judgments, not measured Android performance guarantees.

## Preserve lifecycle and accepted behavior

- Start at the established **visible-arrival** event, never the earlier reducer commit to won.
- Retain the approximately 20-second revolution and persistence while won.
- Keep the new material/glow steady under the resolved Reduced setting, including when enabled mid-sweep.
- Settings, Close and Return to arrival do not replay sound, animal motion or the camera move.
- Undo, Restart, cove changes, hide/recovery and disposal retain the current reset/settlement behavior. No delayed catch-up effects on resume.
- Keep the visible-arrival audio event and persistent dry/wet music reduction untouched.
- Keep the 780×320 fixed-camera fallback and existing fit behavior at other sizes.
- Keep the puzzles, selection, touch targets, focus behavior, water, wood contacts, animal animation and sailing timing unchanged.

If a confirmed regression must be corrected to satisfy this lighting task, record the reproduction and keep the fix narrow.

## Work and visual decision

1. Capture the current baseline at known sweep angles in the actual game.
2. Implement the clean soft-beam candidate; compare with baseline at the same cove, won state, viewport, camera and angle.
3. Tune source/beam balance. If broad density variation is considered, compare the plain and varied candidates and choose the calmer, clearer result.
4. Inspect a full rotation and the arrival camera motion. Select and finish one coherent treatment; no user-facing comparison controls or permanent tuning panel.
5. Verify lifecycle, phone layout and bounded resources, then update project state and handoff.

A side-by-side still is useful evidence of edge quality, but the moving sweep must also be inspected. Do not require the user to choose shader parameters or conduct implementation QA for you.

## Focused acceptance checks

Run Node 24 production build/typecheck and the unit suite. Add or adjust targeted tests only for changed invariants. If the selected effect deliberately uses more than the old one sweep child, update that structural assertion to the intended bounded ownership and retain repeated-cycle/reset checks.

Use the actual UI for a Holding Pier rescue including subset transfer, Undo across a tide rise, final arrival, Settings/Back, Undo from won and redelivery. Inspect a representative won view in Bellwater and First Crossing as well.

Verify:

- No sweep in ordinary play, partial delivery or loss; start remains at visible arrival.
- One full natural-speed revolution at desktop and phone. Capture known baseline/candidate angles; diagnostic phase control is acceptable for comparison stills, clearly labeled, but the temporal recording must show real runtime motion.
- Undo/redelivery, Restart and Next cove leave correct visuals and one accepted audio cue per visible rescue.
- Manual Reduced and Follow device, including a setting change mid-sweep; no new movement in Reduced.
- Close → Menu → Return to arrival and Settings do not reset phase or accepted quieter music.
- Hide/resume and recovery retain the existing behavior. Label simulated events as simulated.
- Markers/picking align after Undo; no effect layer intercepts controls.
- No resource growth through repeated win/Undo cycles. Compare warmed baseline/candidate ordinary and won render counts, program/texture counts and a short frame-interval sample in the same environment. Report noisy measurements honestly; add no new benchmark framework.

Inspect **1440×900**, **844×390**, **780×390**, plus the sensitive **780×320** ending. Judge the small phone beam at native size before a magnified crop.

Create a compact `reviews/lighthouse-light/` report with:

- Chosen approach, rejected candidate if any, and primary references.
- Matched before/after frames at several meaningful angles.
- At least one uninterrupted full sweep with the actual ending visible; retain raw media locally/ignored by default and report access accurately.
- A reduced-motion capture and restored play after Undo.
- Source/evidence manifests, exact commands, new/reused checks, original failures and affected rerun results.
- Explicit physical Android, other-engine, listening and native-GPU limits.

Reject a result with a visible solid wedge boundary, glare burst, seam, distracting noise, beam rendering through opaque foreground objects, altered accepted timing or unbounded resources. Background scenery should remain visible through the transparent shaft. If rendered validation is unavailable, report visual verification pending; test counts alone do not establish the effect's quality.

## Primary references

Read these as technique/documentation references. Use the repository's installed version for APIs; no engine upgrade is requested.

1. [John Chapman — Good Enough Volumetrics for Spotlights](https://john-chapman-graphics.blogspot.com/2013/01/good-enough-volumetrics-for-spotlights.html): original inexpensive proxy approach and limitations.
2. [Three.js ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html): custom WebGL shader API and its single-pass default.
3. [Three.js Material](https://threejs.org/docs/pages/Material.html): blending, depth testing/writing and side behavior.
4. [Three.js Color Management](https://threejs.org/manual/pages/color-management.html): working colors and custom-shader output conversion.
5. [Three.js OrthographicCamera](https://threejs.org/docs/pages/OrthographicCamera.html): current projection contract.
6. [NVIDIA GPU Gems 3, Chapter 13](https://developer.nvidia.com/gpugems/gpugems3/part-ii-light-and-shadows/chapter-13-volumetric-light-scattering-post-process): background on scattering and the unselected screen-space approach.

## Continuity, Git and handoff

Update `docs/PROJECT_STATE.md`: homecoming behavior is accepted overall; lighthouse appearance is the active refinement. Preserve queued future feedback. Correct the reviewed/deployed baseline from this package's confirmed publication handoff, then keep it separate from the new implementation SHA.

Update relevant art guidance and `STATUS.md` briefly. Continue on `m1-first-crossing`, commit/push the completed pass and update existing PR #1 while keeping it draft. Leave main unchanged. No force-push, merge or automatic publication.

Return the full final SHA, remote equality, checkout/PR status, concrete visual decision, fresh checks, reused evidence, limitations and capture links. State that the new light refinement awaits review and publication to the same private Site; a GitHub push alone does not update the phone build.

