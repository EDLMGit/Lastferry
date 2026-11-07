# Story sound and narration

**Current task:** sound effects for the approved illustrated opening and the Harbor connection. **Narration status:** prepared script only; no generated or recorded voice is supplied. Source audit: `6fc5a09dd4ef876ad96ad12d623532f0d13deb10`.

## 1. The intended experience

Keep the accepted score continuous. Add a few quiet sounds that belong to visible actions: water reaching stone, a lantern handle or wooden base moving, and the ferry making its approach. Each effect has a finite envelope and a clear ending. The soundtrack should still have space and warmth.

Do not add an alarm, countdown, storm crescendo, extra continuous ambience bed, or a new musical composition. Story time never advances a puzzle's tide. A narrated version will be a later listening decision, using finished local files and the same presentation controls.

## 2. Cues in this task

| Scene / shot | Visible event | Sound direction |
| --- | --- | --- |
| `opening:tide` | Water reaches the lower landing steps | `tide-wash`: one soft, broad wash, with a gentle attack and finite release. The animals remain on dry upper ground. |
| `opening:lantern` | Rue lifts the lantern | `lantern-contact`: one restrained handle/wood contact, aligned to the movement. It is not a passenger boarding sound event. |
| `opening:ferry` | The ferry approaches with Moss aboard | `ferry-water`: a finite, gently shaped hull/water sound following the visible approach. Stop before the scene settles. |
| `another-bell:harbor` | Rue places the lantern on the safe Harbor landing | Reuse `lantern-contact`, with an appropriate quieter landing treatment. Pip looks toward the ferry; Moss remains safely ashore. |

The opening's visual durations are 6 / 6 / 7 seconds. The Harbor connection is approximately 5 seconds. Author exact effect offsets against the actual visible contact or water movement; these durations do not establish verified audio cue times. Stable cue IDs should combine the scene, shot and event, for example `opening.lantern.contact`.

Start the lantern contact below the accepted prominent boarding contacts. A useful audition starting point is roughly 60–80% of the existing light-contact strength, with a softer transient. Keep story water below normal travel prominence. Tune in the actual music mix and report what was listened to. These are starting directions, not verified final loudness values or a required dB target.

## 3. Reuse the existing owner

`src/main.ts` creates one persistent `Sound`. `src/audio/sound.ts` re-exports it from `src/audio/atmosphere.ts`. Extend that owner; do not create another AudioContext, HTML audio owner, music scheduler or independently unmuted story channel.

The existing graph sends music and its reverb through `musicOutput`, then master. Ambience and effects have separate routes. `reconcileState`, `settleArrangement` and `setVictoryMix` own the accepted arrival reduction. Preserve the score, its phase, the existing mute/Enable/Retry intent and victory behavior.

Reuse low-level synthesis and cached textures where useful, but give story effects separate ownership. Do not call `startTravel()` for illustrative travel, `transferContact()` for the lantern, or `delivery()` for an opening/lighthouse beat. Those methods carry gameplay flags, counters or arrival behavior. In particular, a persistent travel request can restart after audio recovery.

A small story-cue method and separately identifiable owned sources are sufficient. Bound concurrent story sources, release their nodes at the end and include them in global resource budgeting. Preserve normal music scheduling under repeated scene replay.

## 4. Cancellation and timing

Use one scene/shot run token. Invalidate it on Next, Replay, Skip, scene exit, background settlement and disposal. A cue fires at most once in its run. Mark missed cues consumed while muted, unavailable or suspended; enabling sound must not replay a backlog. Late resume or decode completion must recheck the current token and audio intent.

Next cancels the departing shot's effects before starting the next shot. Replay starts a new run of the current shot. Skip settles the scene and exposes its recap without playing skipped cues or accepting campaign progress. Hide/recovery uses the existing settled presentation policy; it must not revive old tails. Reduced Motion presents static endpoints and suppresses action-timed story effects whose movement was skipped. The accepted score can continue under the existing sound preference.

Audit all existing cancellation paths, including `clearActions`, context state changes, `resetActionEffects`, `visibility` and `dispose`. Adding a new owned-source kind does not automatically make those filters cover it.

Currently `src/campaign/presentation.ts` is a single-duration timeline, and `src/main.ts` advances it from `world.onFrame`. If the illustrated scene pauses the 3D render loop, ensure the active story still has one clock owner. Do not run two clocks against the same shot.

Also separate shot advancement from campaign advancement: the current `continueStory()` calls `JourneyProgress.acknowledge()` immediately. Internal Next must only advance a shot. Only the final explicit gameplay handoff acknowledges the scene.

## 5. Narration prepared for a later audition

`audio/narration-script.json` is the canonical audition script. Its four stable clip IDs have `asset: null`, `recorded: false`, and `implementationStatus: "pending"`. Do not report these as delivered voice assets or add an unavailable narration control to the game.

Choose one original, warm, gently textured voice with clear, unhurried delivery. Aim for the intimacy of someone remembering the evening. Keep the delivery natural and restrained. Use no celebrity or singer imitation. Audition one selected voice against the actual scenes and accepted score before expanding to the campaign.

Generate approved narration outside the running game and export finished local audio. Preserve a clean master, the shipped file, the exact spoken text, voice/model provenance, generation settings where available, measured duration and usage-rights record. Keep credentials outside the repository. The game must not depend on ElevenLabs availability, a voice key, live synthesis or a network request to read its story.

In a voiced version, use the same Sound owner and a cancellable voice source. Start the caption with its voice cue; keep the text after speech ends. Next stays available. A missing or failed clip leaves the image and caption fully usable. Never stretch a recording to force it into the visual duration; the held endpoint provides reading/listening space.

Any later narration duck must compose with the existing victory reduction. A separate attenuation stage after the combined dry/wet music output is one practical option. Restoring it to unity must not overwrite `victoryTarget` or `arrangementTarget`. Do not lower music now for a voice that does not exist.

## 6. Focused evidence

Verify trusted cold touch/keyboard startup, cue timing during actual playback, and bounded sources through Next/Replay/Skip. Exercise mute, background settlement and a pending resume so no old cue returns. Confirm the Holding handoff has no extra turn, transfer, travel or arrival event; ordinary boarding and victory audio must still work. Opening the Harbor connection must not replay the victory phrase. Check the normal Bellwater handoff as well.

Use `Sound.captureStream()` or an equivalent actual-runtime recording path for evidence. Do not substitute a separately rendered sound file or normalize a comparison in a way that conceals playback levels. State listening, speaker and physical Android limits honestly. If a narration loader is implemented, test missing/delayed/cancelled assets with fixtures without presenting fixtures as an approved voice.

Expected handoff wording: **story effects integrated; narration script and asset slots prepared; voice recordings not yet supplied**, unless real approved recordings have subsequently been provided.

## References

Official ElevenLabs documentation checked for this package on 27 October 2026:

- [Voice Design](https://elevenlabs.io/docs/eleven-creative/voices/voice-design) — text-described voice exploration.
- [Download generated Text to Speech files](https://elevenlabs.io/docs/help-center/product/core-capabilities/text-to-speech/how-do-i-download-generated-files-from-text-to-speech) — finished audio export, including MP3/WAV.

These support the proposed offline audition/export workflow; they do not require a runtime service integration.
