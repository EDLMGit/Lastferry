# Current task — illustrated story production

**Task ID:** `STORY_PRODUCTION_01`  
**Reviewed baseline:** `6fc5a09dd4ef876ad96ad12d623532f0d13deb10`  
**Branch / PR:** `m1-first-crossing` / draft [#1](https://github.com/EDLMGit/Lastferry/pull/1)  
**Package:** `LAST_FERRY_STORY_PRODUCTION_PACKAGE/`

## 1. Outcome

Make the approved **Words and Light** opening part of the actual game journey, with sound and a small reusable scene player. Add one short Harbor connection through that player. A player starting the real game must recognize the same intimate compositions, purposeful movement, calm color and readable captions they approved in the reference.

The previous pass established working journey mechanics but used distant models and slight gestures. This task changes the storytelling presentation. The supplied artwork is the starting implementation, not a loose mood board.

**Do not return another prose-only story plan or a separate prototype.** Ship the scenes inside the existing app and verify their actual entry, playback and gameplay handoff.

## 2. Read and inspect before editing

Read `AGENTS.md`, `docs/PROJECT_STATE.md`, `campaign/CAMPAIGN_DIRECTION.md`, `campaign/STORY_SCENES.md`, this task and the package's presentation, script, audio, scene-contract and acceptance documents.

Open `reference/approved-opening.html` and inspect all three compositions at phone portrait and short landscape sizes. The canonical editable fragment is `reference/approved-opening.fragment.html`; its SHA-256 is `ff437f9e70675c8b532f2f774e9b9c766eb30e2cf9da73072d5b7e872fd22ce1`. `reference/scene-painter.js` provides the reusable art functions.

Check the actual branch and current HEAD. Preserve newer or unrelated work. The baseline is a review reference, not permission to reset the checkout. The latest named task is authoritative for this pass; older task files remain history.

### Explicitly updated direction

The user-approved presentation supersedes older story-only requirements that every caption be visible from the first frame or that story scenes use only the existing gameplay models. Normal-motion captions now follow the reference's brief visual lead-in; the full transcript remains available immediately. An illustrated Canvas2D story layer is authorized. The playable 3D coves must remain fully interactive and unchanged.

Any historical M1-only scope in repository guidance does not cancel this later, explicitly authorized story task. Preserve all other applicable engineering and project instructions.

## 3. Implement these two scenes

### `opening`: three approved shots

Retain the reference's three separate compositions and approximately **6 / 6 / 7 second** finite visual actions:

1. **Tide:** water reaches the lower steps; the rabbits remain safely on the higher landing.
2. **Lantern:** close enough to recognize Rue and Pip; Rue lifts the lantern in a clear greeting.
3. **Ferry:** the yellow ferry with Moss approaches through open water toward the lighthouse's light.

Use the exact copy in `direction/SCENE_SCRIPT.md`. Reveal the complete current caption after approximately 1.05 seconds, with the reference's brief opacity fade. The shot and text hold at a deliberate endpoint until the player acts. Next is available immediately; do not auto-advance or impose a minimum wait.

Begin journey enters the first shot directly. Remove the prototype's extra Play story cover and Finish/Replay story harness from the production flow. On the final opening shot, **Take the helm** explicitly acknowledges `opening` once and enters Holding Pier.

### `another-bell`: one compact Harbor shot

Author the specified approximately five-second scene in the same visual language: Pip, Rue and Moss are safe; Rue places the lantern at the high landing; Pip looks toward the waiting ferry; a distant light suggests the next cove. Use the exact two-line caption in the script.

This is new artwork to review, not a claim that its composition has already been approved. Use the same player with one shot to prove the scene length is flexible. **Continue to Bellwater** acknowledges `another-bell` once and enters the unchanged cove. Do not replay victory merely because this scene opens.

## 4. Integration and state ownership

Adapt the painter into the existing TypeScript app. Keep one small scene definition and one finite presentation controller; reuse `src/campaign/registry.ts`, `presentation.ts` and the established journey entry rather than creating a parallel campaign system.

The canvas and real HTML controls belong in the app's existing dialog/fullscreen surface. Do not ship the preview wrapper, an iframe, the prototype debug global or a separate full-page application. Preserve the existing WebGL gameplay world. One Canvas2D story renderer is sufficient; do not add a second WebGL context or dispose and rebuild the gameplay world for each shot.

Keep the clock owner explicit. The current presentation clock runs from `world.onFrame`; suspending covered gameplay rendering must not freeze the story. Avoid multiple loops driving the same timeline. Cancel callbacks, observers and cue scheduling on exit. Convert the reference's seconds to the controller's milliseconds deliberately.

**Next changes only the shot.** The current `continueStory()` acknowledges a whole scene; never wire per-shot Next directly to it. Only a final explicit handoff may acknowledge a scene. The painter and shot controller may not write puzzle or checkpoint state.

Keep stable scene IDs `opening` and `another-bell`, current cove IDs and the existing strict checkpoint schema. Per-shot position is ephemeral. Follow `architecture/SCENE_CONTRACT.md` for Skip, Replay, restore, hide and Reduced Motion.

### Authoritative gameplay start

The opening is a narrative prelude, not simulated puzzle time. After it, Holding must still start with the ferry at **Stone**, **Moss aboard**, **Pip and Rue at Rabbit Pier**, tide **0**, turn **0**, a **four-space capacity (Moss occupies two)** and the original empty Undo history. Keep all level files and gameplay rules unchanged. Illustration geometry does not create a route, passenger transfer or new mechanic.

After a successful rescue, terminal Undo remains available until the player explicitly accepts the story continuation. Preserve `?cove=` practice/review isolation and cove-boundary checkpoint behavior. Do not claim mid-puzzle resume.

## 5. Sound in this pass

Implement three restrained, finite story effects using the existing `Sound` owner: tide wash, lantern contact, and ferry/hull water. The Harbor connection may reuse the lantern contact. Align cues to visible events and tune in the accepted score mix.

Reuse low-level synthesis where helpful, but do not call gameplay transfer, travel or victory APIs for illustrated events. Give story sources their own bounded, cancellable ownership. A muted, hidden, skipped or superseded cue must never arrive late as a backlog.

Preserve the accepted composition, audio activation intent, normal travel, wood contacts, victory cue and sustained won-state music reduction. This task adds no new score, urgency pulse or constant ambience layer.

Prepare the optional narration field and supplied recording script. **There are no voice files in this package.** Do not add live TTS, a browser synthetic voice, an unavailable narration toggle or a runtime dependency on ElevenLabs. Voice production and perceptual approval are a later contained pass.

## 6. Phone composition and readable text

Preserve the reference's palette and close subjects. Recompose for portrait; do not shrink an entire landscape scene into a narrow phone. Use real HTML captions and native controls, stable placement, recognizable focus and approximately 44px touch targets. Respect the existing cove control language.

The reference's short-landscape export can exceed a 320px-tall visible viewport; that is a preview limitation, not an accepted game behavior. Fit the production art, caption and primary action within the actual available viewport and safe areas. The transcript can use the app's existing accessible scrollable reading treatment. Do not shrink essential copy to make the layout fit.

The full story text is available from the first frame through Read story. Reduced Motion displays each shot's still endpoint with its caption immediately. No typewriter text, scrolling text over action, mandatory narration or rapid visual flicker.

## 7. Scope boundaries

Deliver only the opening, compact Harbor connection, shared player, finite sound cues and necessary integration/verification. Preserve the journey entrance, all three puzzles, complete in-session Undo, water, sailing pace, accepted world assets, interface and audio outside this scope.

Do not add new coves, new species, six-space gameplay, current rules, a scene editor, per-shot saves, full mid-puzzle resume or a new deployment. `direction/FUTURE_CHAPTERS.md` explains those later milestones; it is not an instruction to implement them now.

## 8. Continuity, inventory and verification

Update canonical `campaign/STORY_SCENES.md` with the actual implemented copy and beats, and `docs/PROJECT_STATE.md` with implementation status, limitations and next direction. Record which older story instructions this task supersedes. Keep campaign direction coherent without marking proposed coves implemented.

Update `ui.story-presentation` and add only the illustration/audio families actually implemented in the existing inventory. Preserve all previous IDs and character identity mappings. Record sources, derivatives and human-approval status accurately. Run the asset validator.

Complete `verification/ACCEPTANCE.md` using the project's Node 24 environment: build/typecheck, meaningful unit checks, focused lifecycle/browser verification, actual root journey rescues, native phone layout inspection and runtime audio evidence. Watch complete visual actions and held endpoints; screenshots and test totals alone do not establish motion or sound quality. Preserve original failures and distinguish reruns from fresh complete runs.

## 9. Finish and hand off

Commit and push the completed work to `m1-first-crossing`; keep PR #1 draft and `main` unchanged. Include a concise review report and source-linked evidence under a new `reviews/story-production/` directory. Preserve unrelated changes and report them honestly if they prevent a clean tree.

Return the exact final SHA and remote equality, changes, verification with limitations, representative native phone frames, an uninterrupted actual journey sequence with runtime audio, and a runnable **local root URL without `?cove=`**. State that narration recordings remain absent.

Do not deploy automatically. Preserve the supplied existing publication receipt and earlier history; the last confirmed Site remains version 12/game `1a85874883af5caa59f6294a75495eccf2afebbc` until a separately verified publication.
