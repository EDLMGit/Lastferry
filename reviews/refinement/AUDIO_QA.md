# Adaptive audio QA

**Retain the single accompaniment proposal for playtest; listening remains pending.** This review inspected actual runtime metadata, not speaker playback. Harmonic compatibility, restrained voicing and resource behavior support retaining the experiment, but do not establish audible improvement over the accepted composition.

## Source and recording

The final capture source is identified by [after/source-manifest.json](after/source-manifest.json), runtime SHA-256 `f48aa67712f913a50af4d527e3936e9b568cbfac86ccddf13e79ab44ba0979f2`. Its exact audio sources are `arrangement.ts` hash `370bc490f7dd5cb12a106fd122d2687b27bb51e931f98f7e7770833f52d07313` and `atmosphere.ts` hash `f56ebbd2ead62bfb376724258e8cdea7594f86271ec4ac8ee2bef4ce05a7167a`.

[Runtime metadata](affected/adaptive-runtime-mix.json) records a real-interface Holding Pier rescue, tide Undo, successful delivery, terminal Undo and a second deliberate delivery. The actual master-stream recording is `affected/raw/adaptive-rescue-loop.webm`: Opus/WebM, 1,321,979 bytes, observed capture duration 82.1134 seconds. Independently recomputed SHA-256 matches `96fa5b885dc8cb1c85570f0b4146206b92a403d135abf85136d45abc98a45c13`. Raw media is local/ignored; this is not an offline synthesis or silent-video soundtrack claim.

## All 809 samples inspected

Every sample conserves the three passenger identities without duplication. The audio clock is monotonic, crosses the 75-second phrase boundary once, and ends at phase 8.851 seconds. Context count, active scheduler count and scheduler starts remain one. Maximum ownership is 16 sources / 75 graph nodes; at most one companion is observed, within its two-source allowance. Dropped tones, allocation deferrals and skipped base events remain zero. Sixteen companion notes are scheduled by the end.

Sampled RMS spans 0.00422–0.02373 and sampled peak reaches 0.06814. These are sparse analyser windows, not whole-file loudness or clipping measurements. They cannot prove perceived balance.

Ordinary planning becomes deadline at turn 2. Boarding at turn 4 immediately changes the desired target to ordinary despite the tide rise; Undo restores turn 3/deadline. Homeward begins at turn 7 after collecting the safely waiting sheep, remains at loaded Harbor, and becomes won only on actual unloading. Nonterminal desired-to-applied differences are observed at 0–827ms, with roughly 100ms polling; the same-sample homeward entry is not a claim of zero latency. The largest sample gap is 349ms.

Both winning commits retain the homeward arrangement while `pendingTerminal` is true. Delivery count advances only with the visible arrival effect, at 38.144s and 41.021s relative to recording start. Won arrangement follows those events after observed 460ms and 381ms. Terminal Undo resets the visible response and returns homeward without incrementing delivery count; the second increment follows a second deliberate unloading.

Unchanged state/desired-target intervals include 6.70s initial ordinary planning, 9.19s near-deadline waiting and 41.70s final won rest. Musical phase advances independently throughout. This recording does not cover loss or mute/hide recovery; separate focused tests cover those paths.

The phase-aligned base/companion comparison is a separate capture workflow. Audible timbre, emotional benefit, mix masking, cancellation smoothness and seams await listening; no listening or universal performance claim is made here.
