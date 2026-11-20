# Baseline geometry

Captured from an isolated `git archive` of reviewed commit `ab8ff33fb1471aacb0dd7a22acbf90be3a4b1db6`, served by Vite at port 5196. The working implementation was not used. `geometry.json` records UTC time, Chromium version, native CSS-pixel bounds, camera projection, route endpoints and screenshot hashes. These are baseline references, not evidence of the new interface.

Both Holding Pier and Bellwater were measured at 844×390 and 780×320, device scale factor 1, touch/mobile emulation, Chromium with SwiftShader. The two retained PNGs were inspected at native size. Real Android browser bars, cutouts, platform fonts and physical touch remain outside this coverage.

The old pill labels occupy much of the near-water space at Bellwater 780×320, including the channel by Shallows. Freestanding names with separate endpoint markers can recover this space without changing the accepted framing.

At Bellwater 780×320 the projected Low Pier and East Buoy endpoints are only 47.07 CSS pixels apart vertically. Fixed 48×48 hit squares overlap by 0.93 pixels. A generic collision-aware choice of the accepted 44×44 minimum for this close pair preserves exact endpoint positions and prevents their touch targets overlapping. All other endpoint pairs in these four measured views accommodate 48×48 squares.

The current endpoint lies within the ferry's silhouette by design. At Holding 844×390 Stone Pier projects to (283.96, 250.36); the boat spans x=253.74–322.84 and y=210.04–270.22. A current-place marker therefore shares the ferry's inspection meaning. Names and transfer controls should be placed clear of the silhouette and passengers; a large transparent parent rectangle between separated marker/name pieces would create unwanted interception.

The actual pier pick bounds and endpoint provide stable dock anchors. Preferred transfer positions beside the projected ferry/pier, followed by below or above, should reuse the existing collision-aware placement helper. Reserve all marker and name hit areas, passenger bounds, lighthouse/bell, HUD and forecast before placing transfer controls or route callouts. The open right-hand water area remains available when a short-screen position close to the ferry is crowded.
