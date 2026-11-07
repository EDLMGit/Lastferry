# Sailing direction and released crests

Actual game footage at native 844×390, DPR1, Chromium156 with SwiftShader. [Review](REVIEW.md). The full uninterrupted silent originals remain local/ignored. The four compact animated WebP excerpts below are committed and accessible in a clone or through GitHub; they retain natural time and native dimensions, sampled at15fps with lossy quality80 encoding. They are excerpts, not uninterrupted rescue recordings.

## Moving comparison

|Sequence|Before8b874ad|Corrected candidate|
|---|---|---|
|Holding Stone→Shallows, rest, onward toward Rabbit Pier; empty, tide0|[Natural5s excerpt](selected/before-free-water-arrival-onward.webp)|[Natural5s excerpt](selected/phone-free-water-arrival-onward.webp)|
|Stone arrival, Moss boarding, departure; two rabbits then full load|Historical stop policy is visible in the baseline original|[Natural6.5s excerpt](selected/phone-stone-approach-board-depart.webp)|
|Bellwater outer-route arrival, rest and reversal; full load, tide2|Historical stop policy is visible in the baseline original|[Natural5.5s excerpt](selected/phone-buoy-reversal.webp)|

Before and after use the same authored routes, loads, tides, camera and sailing-time policy. Their excerpt start times differ because UI/recording startup and input intervals differ. No claim of identical animation phase or frozen water is made. The whole Holding9-action and Bellwater14-action originals include both route directions and the actual transfer interface; see their source/capture manifests.

## Stop and next-turn frames

These unscaled PNGs were decoded from the final full-interface original at100ms intervals. Labels are encoded video seconds, not inferred normalized journey progress. The faint open crests left behind at Shallows continue to fade while the ferry starts its next turn. Navigation rings and dotted routes remain separate controls.

|Holding, arrival/rest|Holding, next turn|
|---|---|
|[4.8s](selected/phone-freewater-4.8s.png) · [4.9s](selected/phone-freewater-4.9s.png) · [5.0s](selected/phone-freewater-5.0s.png) · [5.1s](selected/phone-freewater-5.1s.png)|[5.8s](selected/phone-freewater-5.8s.png) · [5.9s](selected/phone-freewater-5.9s.png) · [6.0s](selected/phone-freewater-6.0s.png) · [6.1s](selected/phone-freewater-6.1s.png)|

|Bellwater, approaching/resting at West Buoy|Bellwater, onward toward Harbor|
|---|---|
|[15.0s](selected/phone-buoy-15.0s.png) · [15.1s](selected/phone-buoy-15.1s.png) · [15.2s](selected/phone-buoy-15.2s.png) · [15.3s](selected/phone-buoy-15.3s.png)|[16.1s](selected/phone-buoy-16.1s.png) · [16.2s](selected/phone-buoy-16.2s.png) · [16.3s](selected/phone-buoy-16.3s.png) · [16.4s](selected/phone-buoy-16.4s.png)|

The independent-release browser check follows one actual event ID across docking and the next yaw: its birth position, direction, heading, time, strength and seed remain identical while its age, width and independent world center change. [Trace](browser-crest-rerun/released-crest.json). It also observes surviving geometry at the rising water surface before finite cleanup. This is a runtime lifecycle assertion, distinct from visual judgment of the recordings.

## Exact resting-state comparisons

|State|Before|After|
|---|---|---|
|Initial Stone Pier, Moss aboard, turn0/tide0|[Before](before/844x390/holding-start.png)|[After](browser-focused/direction-start.png)|
|Shallows after Stone→Shallows, empty, turn2/tide0|[Before](before/844x390/holding-02-map-shallows-rest.png)|[After](browser-focused/direction-free-water-rest.png)|
|Stone after Shallows→Stone, both rabbits aboard, turn6/tide1|[Before](before/844x390/holding-06-map-stone-rest.png)|[After](browser-focused/direction-opposite-berth.png)|

The first trial used16events and much denser release spacing. Its Bellwater motion looked comb-like; it is retained under `trial/` as a rejected treatment. The chosen12-event cap,0.72–1.22unit release spacing and softer wider crests reduce that repetition. There is no live stern ellipse, bow outline or new docking ornament. Ordinary finite fade and independent world-space release are separate properties, both checked.

Native decoded-frame inspection can miss between-frame artifacts; it is not physical Android approval or acoustic listening. [Ordered wave inspection](wave-native-inspection.json) records the exact inspected files. Original recordings have no audio track.

Additional native views: [780×390 rest](selected/phone780-freewater-rest-5.0s.png), [780×390 onward](selected/phone780-onward-7.0s.png), [780×390 buoy arrival](selected/phone780-buoy-arrival-14.0s.png), [1440×900 cruise](selected/desktop-short-cruise-7.0s.png), [desktop rest](selected/desktop-freewater-rest-9.0s.png), [desktop loaded buoy](selected/desktop-loaded-buoy-18.0s.png). The780×320 ending and Settings remain covered by the focused browser evidence.

[Frame-gap audit](timing-and-frame-gaps.json) distinguishes timing from appearance. Both final phone sizes have no greater-than300ms gap during travel or visible tails. The instrumented desktop Bellwater recording has two such gaps; the existing discontinuity guard clears the wake on those frames, confirmed in [desktop detail](desktop-gap-detail.json). The matched warmed844×390 benchmark has equal baseline/candidate active p95 frame intervals and resource counts; this does not establish physical-phone performance.
