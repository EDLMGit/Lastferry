# Last Ferry — fuller wooden contacts and a gentle arrival

## Immediate task

Refine the existing transfer sounds so they have more rounded body and weight, then give the final rescue a calm, rewarding musical response. This is the audio pass. The interface redesign is specified separately in `FOLLOWING_TASK_UI.md` and should wait for its own pass.

The owner-private Android playtest has already been updated to the reviewed starting build:

https://last-ferry-playtest.abumech.chatgpt.site

Live game source: `a4fc4658103b630a2ae527e8479ff66d7232dff3`. It includes the first wooden contacts and the 780×320 viewport fix. It does not yet contain this new audio polish or the proposed visual interface.

## Workflow and scope

- Repository: https://github.com/EDLMGit/Lastferry
- Branch: `m1-first-crossing`; keep PR #1 draft and main unchanged.
- Reviewed starting SHA: `a4fc4658103b630a2ae527e8479ff66d7232dff3`.
- Use Node 24, the existing Web Audio graph and existing dependencies.
- Read `AGENTS.md`, `docs/AUDIO.md`, `reviews/transfer-audio/REVIEW.md` and the current audio/transfer implementation.
- Preserve newer user work if the branch has advanced. Do not reset to the starting SHA.
- Complete this scoped implementation and verification, commit/push normally, update the existing draft PR and return a handoff. No merge or force push.

The user's new instruction explicitly authorizes changing the arrival sound. Older task language that preserved the original arrival phrase no longer freezes that effect. The accepted 75-second base composition, accompaniment, score clock, puzzles, water, scene, selection behavior and sailing pace remain preserved.

## 1. Wooden contact: more body, with a restrained transient

Target a rounded wooden contact that feels connected to the weight of a passenger. The beginning should remain precise enough to match visible contact, with a fuller lower body that decays naturally. The quieter deck-settling answer should remain distinct. Rabbits can be lighter; the sheep slightly fuller.

Current source in `src/audio/wood.ts` uses 165/225 Hz bodies, 190/145 ms buffers and body decay constants of 31/41 per second. Start by shaping the body, decay and useful upper resonances. Then make a modest level adjustment if the actual mix still needs it. Do not achieve the request by only lowering pitch or raising the whole effects bus.

The intended weight should survive a phone speaker at comfortable volume. Reinforce the useful harmonics as needed instead of depending on very deep bass. This is an authoring choice, not a request for a virtual-bass processor. Keep the sound wooden and brief; avoid a kick-drum impression, abrasive click, rattling tail or exaggerated creak.

Preserve the existing cached light/full buffers, grouped level handling and at-most-two transfer-source budget. The already accepted timeline positions, stale-event windows and reduced-motion policy should remain unchanged. Do not add animation delays or extra contact events solely to make the sound more noticeable.

## 2. Arrival: a small musical moment of relief

The current `delivery()` uses three fixed A4–F#4–D4 plucks, at 0/0.32/0.78 seconds, independently of the current harmony. That is the implementation baseline, not a claim that an audible harmonic defect was heard.

Create a concise response with three perceptual stages: a soft warm opening, a clear melodic answer, then a gentle settling tail. It should feel rewarding and calm. Use the existing musical palette, a gentler envelope and a purposeful voicing. Keep its overall footprint to a few seconds and allow play/menu/Undo to remain responsive. No fanfare, heavy impact, voice, percussion or new music loop is needed.

Keep the initial acknowledgment tied to the existing visible final-unloading event. Do not defer the whole response until a later beat or restart the base score. A small authored voicing choice derived from the current harmony is enough. Account for the preceding pad's release and the next cell near a boundary, including the phrase return. The companion's boundary-aware pitch logic in `src/audio/arrangement.ts` is a useful existing pattern; no general composition engine is needed.

Arrival may change timbre, notes, envelope and its own mix. Preserve the accepted base score and accompaniment content, their clock and ordinary gains. Keep transfer tails independent from arrival ownership and maintain score priority.

Be careful with ambience: sending victory into the shared music reverb can leave a victory tail after Undo even when its source is stopped. Prefer a bounded synthesized tail, or a narrowly owned wet path that can be cancelled without cutting the score's reverb. Use AudioContext-time envelopes and the existing cancellation architecture; no new interval scheduler or AudioContext.

## Lifecycle and correctness

- Only final delivery plays victory; partial Harbor delivery does not. Final delivery plays once, and a real redelivery after Undo may play once again.
- Transfer selection, contact timing, bounded concurrent voices and release behavior remain intact. No wood cue on selection, previews, passenger toggles, cancelled actions, invalid input or state restoration.
- Preserve live mute, tab hiding, interrupted/recovered presentation, Undo, Restart and teardown. No queued catch-up contacts or leftover victory notes/tails after cancellation.
- Reduced motion keeps the single compact transfer cue and exactly-once arrival behavior.
- The base music remains continuous. New voices cannot evict score notes or accumulate across repeated rescues.

## Verification and listening

1. Run production build/typecheck and the unit suite. Extend the existing audio tests for actual new envelope/ownership/harmony-boundary failure modes. Current timbre assertions include a 0.2-second buffer cap and 0.8 normalized peak; change a design-specific assertion deliberately if the chosen sound requires it, while preserving boundedness, timing and cancellation checks.
2. Exercise actual UI boarding, temporary unloading, selected subsets, partial Harbor delivery and final unloading. Keep tide Undo/replay, terminal Undo/redelivery, reduced motion and mute/hide coverage focused on the changed audio.
3. Check the arrival response over early, middle and near-boundary positions of the existing phrase. Include the phrase return and cancellation during its tail. Deterministic pitch/envelope checks support this; they do not establish subjective quality.
4. Listen to the actual runtime mix if available. Keep a short before/after capture covering wooden boarding, temporary unloading and final arrival. Preserve true playback level so an apparent improvement is not only an export-normalization difference. If speaker listening is unavailable, state that plainly and retain runtime audio for the user.
5. The user is the physical Android playtester. Phone speaker balance is the main target; headphones provide a second check. Do not claim device or audible approval from mocks, signal levels or source counters.
6. Reuse unrelated verified visual/layout coverage when its source is unchanged. Do not launch another broad visual/performance campaign without a concrete regression. Keep original failures and corrected results separately identified.

The independent review of the current baseline compiled successfully. Its full unit run passed 110 tests and timed out once in the unchanged water suite; that complete seven-test file passed on an isolated rerun. Do not change water or loosen unrelated timeout assertions as part of this sound task.

## Handoff

Update `docs/AUDIO.md`, `STATUS.md` and a compact report under `reviews/audio-polish/`. State actual sound choices, source SHA, exact checks, listening result and limitations. Keep raw media local/ignored as before. Return the pushed SHA and draft PR URL.

GitHub remains the source of the game. The private Site is a separately deployed snapshot; do not create another Site or claim the new sounds are live merely because GitHub was pushed. After review, update the same URL through the existing Sites project.

## Technical references

- [AES / Philips Research: Perceiving Low Pitch through Small Loudspeakers](https://aes.org/publications/elibrary-page/?id=9187): supports perceived-bass techniques for small speakers. It does not prescribe a frequency or mix for this game.
- [W3C Web Audio API, AudioParam](https://www.w3.org/TR/webaudio-1.0/#AudioParam): scheduling and cancellation of envelopes on the audio timeline.

Sound character, timing feel and musical shape are our design decisions and require listening.
