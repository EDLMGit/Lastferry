# Last Ferry — a clear victory cue and a quieter ending

## Current task and intent

The player can barely perceive the victory sound and sometimes cannot tell whether it played. Make final rescue clearly audible while retaining the calm, rewarding character of Last Ferry. When the visible final arrival triggers, lower the ordinary music and keep it reduced while the cove remains won. Restore the gameplay mix when leaving that won state through Undo, Restart or a cove change.

This is a focused audio and lifecycle pass. Preserve the accepted cove interface, wooden contacts, puzzles, water, sailing and base composition.

## Workflow

- Repository: https://github.com/EDLMGit/Lastferry
- Branch: `m1-first-crossing`; PR #1 stays draft; main stays unchanged.
- Reviewed starting game SHA: `c5f4ae110973aa352d15028ba9d8c857a4270f6b`.
- Use the current branch head and preserve newer work. Do not reset to this SHA.
- Use Node 24 and existing dependencies.
- Read `AGENTS.md`, `docs/AUDIO.md`, the audio-polish and cove-interface reports, `src/audio/arrival.ts`, `src/audio/atmosphere.ts`, and the actual final-unloading callbacks in `src/main.ts` and `src/scene/world.ts`.
- This task supersedes older instructions freezing the arrival effect or victory music level. The player explicitly requested this new mix behavior.
- Complete implementation, focused verification, commit/push and a draft-PR handoff. Do not merge or force-push.

The private phone baseline is the existing Site at https://last-ferry-playtest.abumech.chatgpt.site, updated separately to the reviewed cove-interface commit. This task's new victory behavior is not in that baseline.

## 1. Establish whether the cue is missing or masked

First reproduce a complete rescue through the current interface. At final unloading, inspect the existing delivery count, played/skipped/reclaimed arrival voices, sound/context state, musical phase and gain targets. A short diagnostic extension to the existing development status is acceptable if necessary; do not create a new diagnostics system or player-facing settings.

Current evidence establishes that the recorded UI rescue invoked one arrival and three voices. The interface pass leaves the audio modules and final-arrival callback unchanged. This makes masking plausible; it does not prove the cue always fires or explain every physical-device session.

The current win arrangement changes music gain from 0.72 to 0.62, only about 1.3 dB. It waits for an accompaniment beat, then ramps over 0.8 seconds. Arrival uses soft 0.060/0.078/0.044 envelopes through the 0.34 effects bus, with related pad/pluck timbres. These are source facts, not a perceived-loudness measurement.

If reproduction reveals a genuine missed or prematurely cancelled cue, fix that within this task and document its cause. Do not replace the event path with a success-dialog listener.

## 2. Make the rescue acknowledgment distinct and calm

Keep the immediate acknowledgment, melodic answer and gentle settling tail. Give the opening and answer enough definition to be recognized in the full runtime mix at comfortable volume. A rounded, slightly firmer onset, useful upper harmonics or a modest arrival-only gain change are available authoring choices.

Retain the warm musical palette and concise footprint, roughly the existing three-to-four-second moment. Avoid a startling fanfare, deep impact, harsh click or long ambient wash. The sound should remain clear on a phone speaker without depending on very low bass.

Preserve harmony-aware note lifetimes and the phrase return. Some transitions require all stages to share one pitch class; maintain a recognizable rhythmic/timbral identity in those cases. Avoid increasing the whole effects bus: the player has already accepted the wooden contacts.

Do not infer perceptual success from a source counter, normalized waveform peak or an isolated effect. Judge the cue against the playing score, accompaniment and ambience. If listening is unavailable, say so and retain the actual runtime mix for the player's phone test.

## 3. Reduce the music at the arrival event and hold it

Start a smooth music reduction at the existing visible final-unloading arrival event. The final action's committed state becomes won before the unloading animation completes, so starting the duck directly from that early state change would be premature.

A music reduction around 6 dB, a 150–250 ms fade down and a 0.5–0.9 second restoration are reasonable first listening candidates. These are authoring starting points, not mandatory values or proof of phone quality. Document the actual effective reduction, including the existing won arrangement gain.

Route both the dry score/accompaniment and the existing music reverb return through one controllable music output, or use an equally small design that attenuates both correctly. Reducing only the send leaves an old wet tail at its previous return level. Reducing master would also reduce the victory cue and wooden contacts.

Keep the arrival/wood effects path independent. Leave the quiet ambience bed unchanged initially; adjust it only if listening identifies it as a real masking source. Preserve the 75-second composition, score clock, musical phase, scheduler, ordinary mix and authored accompaniment.

Account for the existing 0.62 won arrangement gain explicitly. Keep authored arrangement gain upstream of one independently targeted victory modifier, or centralize the effective target cleanly. Never repeatedly multiply current gain values or let the accompaniment pump overwrite the duck.

The music must remain reduced after the cue ends, after the success dialog is dismissed, and while Menu is open in a won cove. Do not use a three-second timer to restore it.

## 4. Own the mix state separately from the one-shot sound

The one-shot arrival and the sustained won-state mix have different lifetimes. Store enough authoritative state to recover the correct mix even if audio is muted, hidden, suspended or not yet created.

| Situation | Required behavior |
| --- | --- |
| Final action accepted, unloading still in progress | Preserve the pre-arrival mix. |
| Existing visible final arrival event | Play one cue when sound is eligible and begin the music fade immediately. |
| Arrival tail finishes or success dialog closes | Music stays reduced while the cove remains won. |
| Terminal Undo | Cancel arrival voices/tails; smoothly restore the appropriate gameplay mix. |
| Genuine redelivery after Undo | One new cue and one fresh duck, with no cumulative attenuation. |
| Restart, Next cove or choosing another cove | Clear old ending state and begin with the correct normal mix. |
| Mute, hide or audio-context interruption | Cancel action voices; retain settled-win mix intent. |
| Unmute or return while still won | Resume reduced music without replaying victory. |
| Finish while muted, including before graph creation | No queued cue; later activation uses the reduced win mix. |
| Hidden/recovered final transition | Reconcile the settled win mix without inventing a delayed victory sound. |
| Partial Harbor delivery or a losing outcome | No victory cue or victory duck. |

In particular, `clearActions()` is used for mute/hide as well as gameplay cancellation. It must not automatically restore full music merely because it cleared the one-shot voices. Conversely, Undo or cove change must not leave a stale duck or delayed gain ramp.

Use AudioContext-time automation and cancel/hold existing ramps when targets change. Keep a single AudioContext/scheduler and the current bounded ownership and score priority. Preserve full cancellation of arrival tails without cutting the soundtrack reverb.

## 5. Focused verification and listening evidence

1. Run production build/typecheck and the unit suite. Add meaningful checks for dry/wet routing, independent effects gain, no early duck, persistent attenuation beyond the cue, cancellation of prior gain automation, and restoration on authoritative state changes.
2. Cover rapid Undo/redelivery and level changes without cumulative gain reduction or a stale delayed restoration. Include finish-muted → unmute-on-success, hide/resume while won, and lazy graph creation.
3. Complete an actual UI rescue with final unloading, observe the victory screen for at least 8–10 seconds, then exercise terminal Undo/redelivery and the next-cove transition. Confirm partial delivery remains unaffected.
4. Exercise ordinary and dense musical positions and the phrase return. Reuse existing boundary and transfer tests where appropriate. Keep the accepted wood and score continuous and unchanged during normal play.
5. Record a compact before/after runtime comparison at unmodified playback levels. Keep enough post-arrival time to demonstrate the sustained quieter music. Preserve actual game audio; do not normalize exports, substitute a soundtrack or splice a claimed uninterrupted run.
6. State what was actually listened to, on what output, and what remains unverified. Automated gain/counter checks establish behavior; the player decides whether victory is now clearly perceptible and rewarding on Android.
7. Reuse unchanged visual evidence. Run only affected browser/input checks if lifecycle integration changes their implementation; do not launch the full historical browser suite, another visual redesign or a broad performance campaign without a concrete regression.

The independent review of the UI baseline passed build/typecheck and 128 unit tests. Its browser environment has WebGL disabled, so no new independent 3D playthrough is claimed. Contributor evidence separately records 11 passing focused browser checks. Preserve that distinction and original failed/interrupt results.

## 6. Handoff and phone publication

Update `docs/AUDIO.md`, `STATUS.md` and a compact report under `reviews/victory-mix/`. Include:

- The actual trigger diagnosis, audible design choices, effective music reduction and restoration timing.
- Exact source SHA, executed checks and any reused evidence.
- Runtime recordings and listening/device limits.
- Any remaining failure or uncertainty.

Keep raw media local/ignored. Commit and push to the existing branch, keep PR #1 draft and main unchanged, and return the handoff.

The next review must make this exact new version available on the same private Site for Android listening. GitHub remains authoritative, and pushing does not deploy. Do not create another Site or change its audience. If the local Codex environment lacks the existing Sites capability, state deployment pending and return the exact SHA so the review conversation can update the existing Site. Do not call the victory fix live before that deployment succeeds.
