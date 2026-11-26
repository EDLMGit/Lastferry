# Automatic story and sound contract

Supporting contract for `HOME_PLAY_FLOW_01`. This is part of the combined current assignment, not a separate task or a dependency on an earlier implementation.

## 1. The story after Play

Fresh Home **Play** enters the first approved illustrated shot directly. Normal-motion playback advances Tide → Lantern → Ferry without further taps. Retain the approved finite 6 / 6 / 7-second visual actions and the exact current captions, with their approximately 1,050ms visual lead and brief fade.

At the current timings, complete captions are fully visible for approximately 4.7 / 4.7 / 5.7 seconds before those action endpoints. Watch the natural sequence on a phone. If a brief additional reading hold is needed, represent its advancement deadline separately from the art's elapsed time. Do not stretch the drawing equations or use an unmanaged timer to force the next shot.

The final picture holds indefinitely. **Take the helm** is available immediately when the final shot becomes current, but only a fresh explicit activation acknowledges `opening`. The Harbor connection plays its single action and waits for **Continue to Bellwater**. Autoplay changes presentation only: it never acknowledges a scene, accepts a rescue, advances a puzzle tide or writes a checkpoint.

A restored pending scene reached through Home Continue keeps the existing final static recap and Replay scene option. A cove checkpoint continues at the cove start. Those are intentional different entry paths, specified in `ENTRY_AND_STATE.md`.

## 2. Playback controls and interruptions

Keep Next, Replay, Skip animation and Read story, and provide a compact Pause/Resume control. Preserve shared Options/Sound access. Use a small secondary disclosure where useful rather than adding a crowded row of tiny buttons. Essential controls remain real, accessible HTML.

| Event | Required behavior |
| --- | --- |
| Pause | Freeze the current artwork/time, reveal the whole caption and cancel current/pending action sounds. |
| Resume from a paused action | Continue from retained elapsed time. Keep the revealed caption visible and already-consumed cues consumed. |
| Next | Begin the next shot immediately, cancel obsolete work and preserve the player's explicit playing/paused choice. |
| Replay current shot | Start a new run deliberately; respect an explicit user Pause choice. A naturally held final shot may replay normally. |
| Replay scene | Begin the first shot deliberately; normal Motion can autoplay, while Reduced Motion retains manual stills. |
| Skip animation | Show the final composed picture and complete recap; hold without acknowledgment. |
| Read story / Options | Settle only the current shot and pause progression. Closing restores trigger focus and stays on that readable endpoint. |
| Hide / long rendering interruption | Settle the current shot and pause; no catching up through unseen shots or deferred effect burst. |
| Restored pending scene | Final readable static recap and Replay scene; explicit final handoff remains necessary. |
| Reduced Motion | Readable manual still endpoints, immediate complete captions and no skipped-action effects. |

An explicit Resume at a settled nonfinal endpoint may start the next shot once; it must not skip several shots based on elapsed background time. A final endpoint always waits for the named final handoff. Turning Motion back on does not restart playback by itself. Escape closes a secondary view first; on the main story surface it retains Skip behavior without acknowledgment.

Expose the current illustration's concise accessible description when the shot changes, without announcing every frame or duplicating captions. Keep the full transcript available immediately.

## 3. One controller and clear input ownership

Extend the existing `StoryPresentation`. Distinguish the artwork reaching its endpoint, permission to advance automatically, and a final handoff waiting for the player. The current controller settles at duration and the app clock stops when settled; those responsibilities need deliberate adaptation.

Keep one story clock and the retained gameplay World. Pause/Resume must not reuse `enter()` unchanged because it resets time and clears consumed cues. Invalidate obsolete effect sources while retaining which cues have already occurred. Re-arm exactly one current run when playback continues. The score is independent of whether illustration effects are paused.

Two boundaries need fresh-input protection:

- A press/double tap that began on Home Play cannot activate Next or Take the helm on the new screen.
- A press begun as Next cannot become the final handoff when the automatic clock advances from Lantern to Ferry during that press.

Require fresh pointer/keyboard intent for the final action; retain repeated-click and held-key protection without mandatory waiting. Automatic shot changes must not steal focus. Cancel callbacks and sources on exit, Home, replacement or teardown.

Keep stable scene IDs and the strict checkpoint schema. Holding starts exactly as before: ferry at Stone, Moss aboard occupying two of four total spaces, Pip and Rue at Rabbit Pier, tide 0, turn 0 and the original empty Undo history. Terminal Undo remains available until the player explicitly accepts the completed rescue.

## 4. Music from the first Play gesture

The user's missing-music report is unresolved. The reviewed source runs its score on an independent 100ms scheduler; retained cold-test observations show four/five music voices in one unmuted run. Neither source inspection nor those observations establishes the user's actual audible experience. Missing narration is unrelated: the existing score is synthesized separately.

The principal reproduction is now **fresh root Home → Play as the first trusted input**, with ordinary unmuted intent. Do not first visit Options or activate sound through a test helper. Request activation from the trusted gesture before an asynchronous transition, preserving explicit stored mute. Test touch, pointer and keyboard entry.

Trace sound intent, context resume, music scheduling, source ownership, the combined dry/reverb route and effective gains. Verify the music specifically using relevant route/output observations and an actual combined runtime recording. A running context, nonzero master meter or a finite story sound alone does not prove score playback. Listen if possible and report that boundary honestly.

Make Sound state/action discoverable on both Home and story. Reuse Enable/Retry/Mute semantics. Current `renderSound()` / `audioControl()` identify specific control IDs, so new controls must join the shared intent capture deliberately; avoid duplicate IDs or activating the generic click handler before a Sound button's intended action is preserved.

Test remembered mute, explicit Enable, pending/blocked resume with Retry, hide/return and no stale cue backlog. The first screen must remain usable while sound is blocked or muted. Home does not attempt unprompted audio playback merely because it renders.

Fix the demonstrated cause with the smallest coherent change. Preserve the accepted score, phase, normal travel/transfer effects, arrival cue and sustained won-state music reduction. Use one persistent Sound owner/AudioContext/scheduler. Shot or screen transitions must not restart the score. Home decoration must not invoke travel or victory APIs; Harbor must not replay arrival.

If silence does not reproduce, finish the supported Home/playback/control work, retain the report as unresolved and include useful audio state in the existing support-details mechanism. Do not invent a diagnosis, boost the whole master speculatively or repeat identical checks indefinitely.

## 5. Narration and evidence boundaries

Narration recordings remain absent. Preserve the script and optional slots without generating a substitute voice, introducing live TTS or adding an unavailable voice toggle. This task changes the entry and playback experience, not the story composition or voice production plan.

Capture the ordinary runtime mix at its actual levels, without normalization, boosting or substituted tracks. The combined acceptance document specifies the integrated sequence and focused lifecycle checks. Distinguish source/scheduling evidence, software-browser output, acoustic listening and physical Android approval.
