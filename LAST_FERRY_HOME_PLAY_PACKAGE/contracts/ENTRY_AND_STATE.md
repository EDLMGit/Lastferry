# Home entry and state contract

**Applies to:** `HOME_PLAY_FLOW_01`, implemented through `NEXT_TASK_HOME_PLAY_FLOW.md`.  
**Inspected source:** `d532c62f0f25854387869466572a1ed0cf35a0ac`.

This specifies new presentation work on top of the existing journey model. It does not claim that the new home is already implemented. Keep checkpoint data and puzzle state separate from the currently displayed surface.

## Home actions

| Existing journey state | Primary action and destination | Supporting behavior |
| --- | --- | --- |
| Empty; no saved journey | **Play** creates the opening checkpoint once and starts the automatic opening. | Options, Practice and compact Sound access. No extra confirmation. |
| Valid pending scene | **Continue** restores that pending scene's readable final recap, with Replay scene available. | Show the scene name; New journey remains secondary. Entry does not acknowledge the scene. |
| Valid playable-cove checkpoint | **Continue** starts that cove from its beginning. | Adjacent copy names the cove and says “from cove start.” Do not imply mid-puzzle resume. |
| Both current coves completed | **Play a cove** opens independent Practice/Choose cove. | New journey remains available. “Both available coves are safe” is truthful; do not claim the planned whole campaign is complete. |
| Invalid or unsupported saved record | **New journey** opens an explicit replacement confirmation. | No false Continue. Keep existing bytes until replacement; Practice remains available without changing them. |
| Storage unavailable, no active record | **Play** starts an in-memory journey. | Brief visible notice: progress lasts only for this visit. Navigation and play remain usable. |
| Storage unavailable after an in-memory record exists | **Continue** follows that valid record during this visit. | Keep the saving limitation visible and honest. |

When a valid saved journey exists, **New journey** must first explain that it replaces that journey. Cancel returns home without writing storage or changing Sound/Motion preferences. Confirmation alone replaces the record and starts the fresh opening. Preserve the existing invalid-record recovery behavior as well.

Loading home, animating its background, opening Options or browsing Practice must not create a journey, acknowledge a scene, accept a rescue or write a checkpoint.

## Root and practice isolation

The root URL enters home. Explicit `?cove=` links continue to enter their independent review/practice puzzle directly. In the baseline, those links create no `JourneyProgress` owner; preserve that separation.

Practice selected from home does not replace the journey. A Home action from a direct practice URL may navigate to the root deliberately, without writing campaign progress. Never treat leaving practice as accepting a campaign rescue.

Keep current scene/cove IDs and the strict checkpoint schema. A later additional cove needs its own completed-save migration; this task does not append content or change saves speculatively.

## Returning home from a crossing

The current application constructs a new Session when a cove is mounted. Returning to title discards that crossing's in-session moves and Undo. Keep this behavior explicit rather than introducing an accidental Resume feature.

Before leaving an active crossing, use a compact confirmation equivalent to:

> Return home? This crossing will restart from its beginning. Your saved journey checkpoint is kept.

Cancel preserves the exact active puzzle and Undo history. Confirm may discard that crossing, return home and retain the existing checkpoint. The same principle applies when unaccepted victory still has terminal Undo available: returning home does not implicitly accept the rescue. Existing explicit Continue story remains the acceptance action.

Do not promise durable mid-puzzle resume. Options opened from home, however, is only a secondary view: closing it returns to the same home composition without recreating a cove.

## Home input ownership

The baseline `blocked()` relies on `dialog.open` to shield gameplay while the old journey menu is displayed. If the new full-screen home lives outside that dialog, add an explicit presentation-mode gate. CSS visibility alone is insufficient.

While home is active, covered gameplay controls must be inert and absent from keyboard navigation. Prevent map picking, location selection, panning and action execution. Transparent space around the home controls must not expose the playable canvas. Escape on home must not dismiss the entrance into a puzzle.

Keep home inside `#app`, the existing fullscreen root. Reuse the existing native dialog for Options, Practice and confirmations where appropriate. Do not add nested native dialogs, an iframe or a second application surface. Close secondary views back to their triggering home control with visible focus; preserve the established fullscreen dialog-ordering behavior.

One explicit top-level home/story/gameplay presentation distinction is enough. Use existing state owners rather than building a general navigation framework.

## Sound and the first Play gesture

Request audio activation synchronously within the trusted Play/Continue interaction. Do not wait for an animation, fetch or asynchronous transition before asking the existing Sound owner to resume. Preserve explicit remembered mute; a fresh Play action does not authorize overriding it.

Home and story Sound controls must share the established Enable/Retry/Mute intent capture. The current `renderSound()` and `audioControl()` hard-code the gameplay/Settings IDs; extend or generalize that binding deliberately. Avoid duplicate IDs and avoid generic capture-phase activation changing a Sound button's intended action before its handler runs.

The separate story/music contract owns diagnosis of the reported silence. A running context or decorative sound alone does not prove that the score is audible. Play must remain usable if audio is blocked; expose the existing retry behavior visibly.

## Background, camera and lifetime

Use the existing cove assets and a deliberate home framing/visibility mode. Home animation is presentation only: no transfer, tide, travel or victory events, and no fake won state to light the lighthouse.

Keep one active gameplay World/WebGL renderer and one persistent Sound owner. Reuse the background through home Options/Practice browsing. Existing cove recreation at a genuine gameplay boundary can remain; do not recreate a World for every home control or hover.

The live home background needs its own permitted World drawing, while the illustrated story can continue to cover/suspend that drawing through the existing mechanism. Preserve Reduced Motion and hidden-page recovery. Restore the proper gameplay framing and controls on handoff without leaking decorative camera state into puzzle behavior.

## Source anchors

The relevant existing owners are `src/main.ts` (`showJourney`, `beginJourney`, `resumeJourney`, `returnToJourneyTitle`, `mountCove`, `blocked`, Sound binding), `src/campaign/progress.ts` (validation and checkpoint writes), `src/ui/fullscreen.ts` (app/dialog ordering), and `src/scene/world.ts` (`setStoryFraming`, `setStoryCovered`). Adapt these responsibilities; do not duplicate them.
