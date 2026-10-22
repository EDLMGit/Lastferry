# Music that follows the rescue

The accepted base is the original “Between the lamps”: 64 BPM, 80 beats / 75 seconds, ten open harmony cells and 21 sparse motif notes. Its notes, voicings, releases, phrase clock and ordinary mix are unchanged. Idle listening never changes the puzzle or the desired arrangement.

This pass retains one bounded accompaniment proposal for playtest. It uses the existing soft periodic-wave palette, one oscillator per note, a short gentle onset, low-pass shading and the shared music/reverb path. Deadline notes have strength 0.19, homeward answers 0.24 and home resting notes 0.10, against the existing tone envelope. The companion normally plays once every four beats, or eight at home; ordinary planning and loss have no companion. There are no drums, ticking, action jingles, tempo changes or new external samples.

## Committed facts

`occupiedPierDeadline()` in `src/game/rescue-facts.ts` finds the earliest future authored rise that reaches a pier holding a required passenger. Both status text and music consume that fact. One or two further actions selects `deadline`; distant deadlines and safe high-ground waiting select `ordinary`. Once every required passenger is aboard or delivered and at least one remains aboard, `homeward` supplies a warmer answer. Visiting Harbor alone is not delivery. Terminal `won` and `lost` take precedence.

Boarding removes the passenger before that action's rise, so exact-boundary boarding immediately removes the corresponding threat. Holding Pier's sheep on safe Stone Pier prevents homeward music. Bellwater's second occupied pier supplies the next deadline after the rabbits are rescued. First Crossing's harmless first rise does not make it urgent.

## Notes and overlap

`src/audio/arrangement.ts` authors two pitches for each of the existing ten harmony cells. The first pitch belongs to both the current and preceding harmony; it is used during the first three beats, while the preceding pad's 2.5-second tail remains. Middle-cell notes belong to the current chord. An adaptive entry on the last two beats uses the next cell's shared opening pitch, accommodating its own release into the following harmony. This boundary rule also covers the phrase return. Tests check actual pitch membership across every cell and all eight integer entry beats. Harmonic compatibility does not establish perceived musical quality.

## Timing and ownership

`Sound.reconcileState(state, level, deferTerminal)` updates one latest desired target on initialization, successful commit, Undo and Restart. Previews, inspection, invalid input and idle do not call it. A successful terminal commit stores its target without anticipating the visible consequence. `settleArrangement()` releases that target after visible unloading/normal completion or cancellation/recovery; it never invokes the delivery sound. Existing `delivery()` remains the exactly-once visible-unloading response.

Changes enter on the next beat, normally within one beat; obsolete companion notes release gently. Base phrase phase never rewinds. Won music settles to gain 0.62 and lost to 0.53 from the ordinary 0.72 music bus; recovery returns smoothly to 0.72. Master, ambience and action mix are preserved. The DEV-only accompaniment switch supports matched comparison without changing the base phrase or gains.

One AudioContext and the existing 100ms bounded scheduler own the complete mix. The companion has its own music-owned source category routed through the existing music bus/reverb, so action cleanup and delivery cannot delete it. At most two companion sources, including releasing sources, coexist; a full companion allocation defers to the next beat. The existing total source guard is unchanged (`owned.size > 28` rejects a new tone). `droppedTones`, `companionDeferrals` and source counts expose budget pressure. The busy full-phrase unit case includes travel and repeated delivery notes and observes zero dropped tones.

Mute, hidden-page suspension and intentional resume retain the latest desired state. Base sources and clock preserve continuity; missed events are not replayed. Gain cancellation uses `cancelAndHoldAtTime` when available and a current-value fallback otherwise. Teardown releases all owned sources and the one graph.

## Evidence and listening boundary

Focused pure-state tests cover exact boarding boundaries, safe temporary unloading, Bellwater's remaining threat, homeward versus delivered, terminal Undo, previews and idle. Mock Web Audio tests cover phase, terminal gating, rapid replacement, mute/hide/resume, bounded sources, phrase return and cleanup. These establish scheduling and ownership behavior, not sound quality. Original development failures and corrected runs are recorded in `reviews/refinement/development-audio-results.json`.

Actual runtime progression and matched base/companion captures are handled by the refinement capture workflow. No speaker-listening capability is available in this agent workflow. The single restrained proposal is retained as an explicitly listening-pending experiment; its emotional improvement, perceived balance, cancellation smoothness and audible seams await listening to the actual recordings. The accepted base composition remains the foundation.

All synthesis, note choices and noise/reverb recipes are locally authored; no recording, song, external sample, asset license or new audio dependency was introduced.
