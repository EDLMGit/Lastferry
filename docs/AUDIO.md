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

Accompaniment changes enter on the next beat, normally within one beat; obsolete companion notes release gently. Base phrase phase never rewinds. Authored arrangement gain remains upstream: won 0.62, lost 0.53 and ordinary/homeward/deadline 0.72. A separate output now reduces both dry music and its reverb return at visible final arrival; this timing is independent of the beat. Master, ambience and wood mix are preserved. The DEV-only accompaniment switch supports matched comparison without changing the base phrase or gains.

One AudioContext and the existing 100ms bounded scheduler own the complete mix. The companion has its own music-owned source category routed through the existing music bus/reverb, so action cleanup and delivery cannot delete it. At most two companion sources, including releasing sources, coexist; a full companion allocation defers to the next beat. The total source ceiling remains 29. At capacity, score notes reclaim arrival voices first, then transfer voices; arrival itself never evicts either music or transfers. `droppedTones`, `companionDeferrals` and source counts expose budget pressure. The busy full-phrase unit case includes travel and repeated delivery notes and observes zero dropped tones.

Mute, hidden-page suspension and intentional resume retain the latest desired state. Base sources and clock preserve continuity; missed events are not replayed. Gain cancellation uses `cancelAndHoldAtTime` when available and a current-value fallback otherwise. Teardown releases all owned sources and the one graph.

## Activation and recovery

With saved sound enabled, the first deliberate completed click or touch starts audio. A consumed water drag uses its completed pointer-up; touch pointer-down does not start the graph. Keyboard activation uses the resulting trusted click. Explicit sound controls are excluded from generic activation, and their Enable/Retry/Mute intent is captured at the start of the gesture, including nonrepeated keyboard input.

A native `AudioContext.resume()` blocked by browser policy can remain pending. Each fresh deliberate activation can call native resume again, while reusing one context, graph and scheduler. Request identity and lifecycle generation prevent an older completion from clearing a newer request or restoring playback after mute, hide or disposal. Missed transfer and arrival effects remain consumed rather than replayed. No retry timer or autoplay bypass is used. This follows the [native resume algorithm](https://webaudio.github.io/web-audio-api/#dom-audiocontext-resume) and [completed-touch activation rules](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/User_activation).

The controls distinguish muted, requested and running states. Requested playback offers Retry; Settings also offers explicit Mute while a request is pending. A late context transition cannot reverse the action the user began. Composition, gains, phrase timing, source ownership and persistent victory reduction are unchanged. Controlled pending-context tests establish the retry/cancellation behavior; fresh native browser-policy checks establish completed-touch startup and sustained output. Neither establishes physical phone-speaker quality. See [the corrective review](../reviews/phone-audio-fullscreen/REVIEW.md).

## Evidence and listening boundary

### Wooden boarding and unloading contacts

`World` owns one `TransferTimeline` for each actual board/unload presentation. It includes only selected passengers whose aboard membership really changes. After positioning those passengers on the current frame, it emits a grouped contact to the existing `Sound` instance. Previews, location selection, passenger choices, reducer commits, invalid actions and Undo synchronization emit no contact.

The existing concurrent paths, hop and transition plan are unchanged. Normal transfers take 520 ms, final unloading 900 ms, and reduced motion 30 ms. Contacts use normalized visual progress, so no duplicated wall-clock delays or audio timers are needed:

| Motion | Crossing | Quieter settlement | Delayed-frame policy |
| --- | --- | --- | --- |
| Boarding | 0.50, at the wooden bridge | 0.75, towards the deck | Valid through 0.62 / 0.87 respectively |
| Unloading | 0.25, between deck and bridge | None | Valid through 0.37, before reaching the pier surface |
| Reduced motion | One compact, quieter contact on the first presented frame | None | Consumed once even if the 30 ms transition has already completed |

These normal points coincide with the existing hop's grounded phases. Unloading uses only the departure contact: a proposed second tap at 0.50 was removed after review showed it would already be over Stone Pier's stone surface. A stale phase is consumed silently; a late frame emits at most one still-current contact. This avoids catch-up bursts and wooden steps after reaching stone or land. Cancel/recovery consumes pending phases. Muted contacts are consumed by the same visual timeline and are never queued for unmute. A real replay after Undo creates a new timeline.

`src/audio/wood.ts` generates and caches two original mono buffers per context on demand. The audio-polish pass extends the lighter rabbit contact to 220 ms and the fuller sheep contact to 270 ms. Fundamentals stay 225/165 Hz and normalized peaks stay 0.8; body decay changes from 41/31 to 28/20 per second. A 5 ms onset, stronger damped inharmonic middle resonances, less filtered grain and a smooth 40 ms final fade add sustained body without a sharper transient or an effects-bus increase. The last sample is zero. These are authored signal choices pending listening, not proof of perceived weight or phone-speaker balance.

A mixed group uses the fuller contact; group gain increases only 6% per extra passenger, capped at 12%, rather than summing individual voices. Existing light/full source gains remain 0.20/0.24. Settlement uses 48% of the crossing gain, and compact reduced motion uses 70%. The longer buffers can overlap within the existing two-source budget; no contact event or animation timing changes.

Contacts use the existing effects bus and master mute with their own `transfer` ownership. At most two transfer sources coexist, including releasing sources. Full allocation skips a new contact; the score has priority and can reclaim a transfer voice at its existing source guard. Arrival owns `effect`, so its three stages neither clear transfer tails nor mistake them for arrival. Undo, Restart, hidden-page interruption, recovery and teardown clear both action categories. Accepted score/accompaniment content, ordinary music gains, phrase clock, water and sailing timing are unchanged. The separately owned victory modifier described below is the explicit won-state exception.

### A gentle final arrival

Final visible unloading still calls `delivery()` immediately and once. Partial Harbor delivery does not call it. `src/audio/arrival.ts` supplies a small authored three-stage response from the running score phase: a warm pad opening at 0 s, a clearer plucked answer at 0.48 s, and a softer pad settlement at 1.10 s. The victory-mix pass uses rounded 60/35/140 ms attacks and arrival-only peaks 0.110/0.150/0.072, retaining durations 1.55/1.90/2.25 s and the complete 3.35 s footprint. Opening/answer filters start at 1600/2400 Hz and soften to 700 Hz; settlement retains 1050→650 Hz. Each amplitude envelope reaches zero before source cleanup. Compared with the accepted soft cue, stage peaks rise about 5.3/5.7/4.3 dB without changing the effects bus or wooden contacts. These choices need runtime listening; they are not phone-speaker approval. The same existing pad/pluck waves are used, with no new loop, dependency or scheduler.

Each stage starts from the current cell's authored voicing and chooses the nearest allowed octave across the pad harmonies overlapping its entire lifetime. This includes the preceding pad's 2.5 s release, an upcoming cell and the 75 s phrase return. At the single-common-pitch A and E boundaries, the stages use compatible octaves. The first note is never postponed to a beat. This compatibility check does not establish subjective musical quality.

All three voices and their synthesized tails route dry through the existing effects bus, never into the shared score reverb. Cancellation ramps the owned gains to zero in 45 ms and stops/disconnects within 60 ms; future scheduled answers are cancelled as well. A new delivery replaces only arrival-owned sources and cannot accumulate old phrases. At graph capacity arrival skips its own voices instead of evicting score or contacts. Diagnostics expose the last phase/notes, played/skipped/reclaimed voices and remaining arrival sources. Actual redelivery after Undo can play a new phrase; restoration alone cannot.

### Persistent quieter music after rescue

The actual final-unload event is unchanged: `World.tick()` sees final won presentation progress above 0.72, marks the visual arrival once, then `main.onArrival` calls `delivery()` and `settleArrangement()`. Committing the reducer's won state happens earlier and does not lower music. Hidden/interrupted presentation recovery calls settlement without inventing a delayed cue. Partial delivery and loss have no victory reduction.

One `musicOutput` gain receives both the dry score/accompaniment bus and the existing convolver's wet return, then connects to master. Effects and ambience connect directly to master; arrival stays entirely dry and cancellable. At visible settlement, output fades from 1 to 0.5 over 200 ms with AudioContext-time automation. The modifier alone is −6.02 dB; combined with authored won gain 0.62 versus ordinary 0.72, the settled music target is 0.31, approximately −7.32 dB. Old reverb tails pass through this same output, so they reduce too. Master 0.65, effects 0.34 and ambience 0.11 remain unchanged.

The modifier is retained as authoritative settled-win intent, independent of the three arrival voices and `clearActions()`. It remains after the tail, success dismissal or Menu; there is no restoration timer. Undo, Restart or another authoritative nonwon state cancels/holds prior automation and restores the modifier to 1 and appropriate gameplay bus target over 700 ms. Rapid redelivery targets the fixed 0.5 value again, never multiplying the current gain; accompaniment updates cannot overwrite this separate output.

Mute, hiding and context interruption cancel arrival voices but retain the latest mix intent. Resume applies the retained output under the silent master before its normal fade-in, with no queued victory replay. A muted completion before graph creation records settled intent; later graph creation initializes the reduced output. A cove change disposes the old Sound and starts the new cove's normal mix. One context and scheduler remain sufficient. DEV status adds event count, settled intent, actual/target output and arrangement gains, effective target and the last mix-change time/duration; these are observation fields, not player controls.

Focused runtime comparisons and lifecycle results live under `reviews/victory-mix/`. Source/counter/gain observations establish triggering, routing and persistence. Recognizability, calmness and comfortable phone balance remain a human listening judgment. Raw master recordings keep true playback levels, with no normalization or substituted soundtrack.

DEV diagnostics expose contact calls, played/skipped counts, current/peak transfer sources, and the bounded World history of selected IDs and emitted/stale/cancelled phases. They are observation tools, not gameplay controls. The focused evidence, original failed attempts and final results are under `reviews/transfer-audio/`. Actual runtime audio plus canvas gameplay is captured separately from a silent full-interface video when available. No speaker-listening capability is exposed in this environment, so phone-speaker balance and perceived wooden character remain for the user's playtest. No physical Android result is claimed.

The private Site at https://last-ferry-playtest.abumech.chatgpt.site contains game `e78819974a0487440e439ef87d24ba4bb1c2f454`, Sites version9, including the accepted audio foundation. The phone audio/fullscreen correction is a separate GitHub update awaiting review and publication. A branch push does not deploy it.

Focused pure-state tests cover exact boarding boundaries, safe temporary unloading, Bellwater's remaining threat, homeward versus delivered, terminal Undo, previews and idle. Mock Web Audio tests cover phase, terminal gating, rapid replacement, mute/hide/resume, bounded sources, phrase return and cleanup. These establish scheduling and ownership behavior, not sound quality. Original development failures and corrected runs are recorded in `reviews/refinement/development-audio-results.json`.

Actual runtime progression and matched base/companion captures are handled by the refinement capture workflow. No speaker-listening capability is available in this agent workflow. The single restrained proposal is retained as an explicitly listening-pending experiment; its emotional improvement, perceived balance, cancellation smoothness and audible seams await listening to the actual recordings. The accepted base composition remains the foundation.

The focused audio-polish verification and matched actual-runtime captures are under `reviews/audio-polish/`. Before/after exports retain the runtime master level without normalization. No speaker/headphone listening capability is available here; physical Android balance and the perceived reward of arrival remain the user's listening check. Unchanged scene/layout evidence is reused by source comparison.

All synthesis, note choices and noise/reverb recipes are locally authored; no recording, song, external sample, asset license or new audio dependency was introduced.
