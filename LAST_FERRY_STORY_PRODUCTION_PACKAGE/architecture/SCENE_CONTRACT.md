# A small reusable scene player

This is an integration contract, not a request for a cinematic framework. Use the repository's naming and types where they already serve these responsibilities.

## Data, playback, drawing and progression

Keep four responsibilities clear:

| Responsibility | Owner |
| --- | --- |
| Authored shots, copy, illustration IDs and cue positions | Scene definitions in the existing campaign registry or a nearby content module |
| Current shot, elapsed time, settlement and run token | A small finite presentation controller |
| Canvas illustration and real HTML text/controls | Story view inside the existing app surface |
| Checkpoint writes, scene acknowledgment and playable cove selection | Existing application / `JourneyProgress` |

The presentation controller cannot execute puzzle commands or save progress. The art renderer receives a frame and draws it. Only the application accepts the final scene handoff.

Give each illustration a concise accessible shot description through semantic text in the scene view or a properly labelled canvas. Update the description when the shot changes, not every animation frame. Avoid duplicate announcements of the visible caption; decorative elements do not need individual narration.

One practical definition is:

```ts
type StoryShot = {
  id: string;
  illustration: IllustrationId;
  durationMs: number;
  caption: string;
  captionCueMs: number;
  description: string;
  cues?: readonly StoryCue[];
  narrationAssetId?: string;
};

type StoryScene = {
  id: SceneId;
  title: string;
  shots: readonly StoryShot[];
  destination: CoveId;
  continueLabel: string;
};
```

Names may adapt to existing code. `IllustrationId` needs only the illustrations actually implemented. Define content once in the production application; the package script remains the review reference. Do not maintain two competing runtime registries or import the whole prototype HTML.

## Minimal operations

The controller needs operations equivalent to start scene, update time, next shot, settle current shot, skip to final shot, replay current shot, replay scene and cancel. Its output should identify scene, shot, elapsed time, caption visibility, settlement and the current run token.

Use monotonic elapsed time, clamp negative deltas and cap at the finite visual duration. A large stalled interval must settle safely instead of producing an effect burst. Do not queue every missed cue when the document or audio resumes.

The reference painter exposes `resize(width, height, devicePixelRatio)`, `draw(shotIndex, elapsedSeconds)` and durations `[6, 6, 7]`. Port or adapt it into a typed production module. The current campaign timeline uses milliseconds; make the conversion explicit.

## Interaction semantics

| Event | Presentation result | Campaign result |
| --- | --- | --- |
| Enter fresh opening | First shot, normal or reduced playback | Pending scene unchanged |
| Next before final shot | Cancel old run; begin next shot | No acknowledgment |
| Take the helm / Continue to Bellwater | Cancel presentation and enter destination | Acknowledge the entire scene exactly once |
| Replay | Cancel old run; restart current shot | No change |
| Skip animation | Final shot at endpoint; complete text exposed | No acknowledgment |
| Escape on the main scene surface | Same safe settlement as Skip | No acknowledgment |
| Read story / open Settings | Settle current shot; cancel pending cues; show the requested view | No change |
| Escape / close while transcript or Settings is open | Close that view first and return focus to its trigger; remain on the held current shot | No Skip or acknowledgment |
| Reduce Motion | Current shot at its endpoint, caption visible | No automatic Next |
| Hide / lose active presentation | Settle current shot and cancel its queued cues | No automatic Next or acknowledgment |
| Restore a pending scene | Final static endpoint; full text exposed; Replay scene available | Remains pending until explicit final action |
| Exit / change journey / dispose | Cancel owned callbacks, sources and handlers | Only the existing app's explicit operation applies |

Normal Next and the final handoff are available immediately. Keep final acknowledgment guarded against repeated input. Never wait for sound or a mandatory timer.

Reduced Motion preserves the sequence of readable still shots: Next moves from one endpoint to the next. Turning motion back on must not replay already-consumed cues by itself. Replay is the explicit way to see a shot again.

Read story and settings must use the existing dialog ownership pattern. A simple in-scene transcript disclosure or existing accessible reading state is sufficient. Opening either settles only the current shot and cancels its pending cues so the player does not miss an action while reading or changing settings. Closing returns to that held shot; Replay can restart it. Do not create nested native dialogs. Escape closes the open reading/settings view before it can act on the main scene. Preserve trigger focus on closing and prevent hidden gameplay controls receiving input through the story surface.

## Renderer and clock lifetime

Keep the gameplay `World` alive across shots. The illustrated surface may cover or pause unnecessary WebGL drawing if that is safe and measured useful, but the story still needs one active clock. In the baseline, `world.onFrame` advances presentation; check that dependency before suspending rendering.

Use one Canvas2D surface for the current illustration, a bounded device-pixel ratio appropriate to the device, and the existing layout observers where practical. Resize/recompose on orientation and available viewport changes. Cancel the active frame loop once a finite scene is held, unless another active owned component truly needs it. Resume only for an explicit replay, next shot, resize or another legitimate state change.

Do not put an iframe or second WebGL renderer in the game. Do not copy the standalone preview host, prototype debug global, anonymous global event listeners or independent navigation state into production.

## Sound ownership

Use the existing persistent `Sound` owner. A scene/shot run token owns finite sources and cue consumption. Increment or invalidate it on Next, Replay, Skip, hide, exit and disposal. Async activation or future audio decoding must check that token before scheduling anything.

A cue is consumed even when sound is unavailable or muted. Later activation starts current ordinary audio intent, not a backlog of past story events. Distinguish story effects from actual gameplay travel, passenger contact and victory. The detailed sound and optional narration contract is in `../direction/AUDIO_PLAN.md`.

## Checkpoints and canon

Keep scene IDs `opening` and `another-bell`, current cove IDs and the current strict save schema. Shot index and art elapsed time remain presentation-only. No per-shot persistence or migration is needed for this task.

Keep `?cove=` entrances independent from campaign progress. Keep the existing explicit acceptance after a completed rescue; terminal Undo remains available before acceptance. Story playback never fabricates an action history or marks a rescue won.

The future third cove will need a separate migration plan: the current completed-record validator expects completion against the full ordered cove registry. Simply appending a cove can invalidate an old two-cove completed save. Record that constraint for the future expansion task; do not opportunistically change saves here.

## Extending later

A later chapter adds an authored scene definition, artwork/poses, captions and optional sound assets. It reuses playback, controls, typography, cancellation, accessibility and final acknowledgment. New art remains deliberate work; reuse does not mean every chapter must repeat the same shoreline and lantern.

Keep scene IDs stable, use a variable-length `shots` array and record the actual asset dependencies. There is no need now for a timeline editor, arbitrary command language, dependency graph or data-driven general-purpose animation engine.
