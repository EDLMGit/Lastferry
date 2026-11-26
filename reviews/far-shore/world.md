# Far Shore on the phone

The stone Tide Steps and the high Far Bank face each other across the reversing current. The high bank has a pine above the dock. Rush Landing is lower, with a split sand edge and reeds beside Rowan. Harbor retains its lighthouse. All four stops reuse the six-space ferry, fitted pier kit and full-size animal models.

The initial portrait camera faced the stone landing and Harbor. It gave a clear look at the two neighbors there but cropped off the far pickup. Initial short landscape also spent much of its height on Harbor and open water. The retained portrait angle turns the view down the reach, putting both nearby companions above Peat and Rowan in the scene. The short landscape angle exposes the two far islands to the right of Tide Steps. It includes the lower edge of the lighthouse and leaves the next passengers in view. Whole cove remains available for the full map. [Initial portrait study](development/portrait-initial-framing.png) · [Initial short landscape study](development/landscape-initial-framing.png) · [Final portrait](play/390x844/start-play.png) · [Final short landscape](play/780x320/start-play.png)

The initial study images are actual development Play frames recorded from `?cove=far-shore` in Chromium, DPR 1 and Reduced Motion. They predate the final camera and do not identify the release bundle. Use the final phone runs for release evidence. [Final touch runs](play/)

## Physical verification

The first geometry run returned **15 passed, one failed**. Two sampled lighthouse footprint coordinates, each checked twice, lay outside the smoothed island top at XZ `[-10.400, 0.650]` and `[-10.706, 0.711]`. The lighthouse was moved inward to `[-10.15, 1.85]`. The corrected run and the subsequent final seating/framing run each passed **16 of 16 Far Shore checks**. [Authored scene layout](../../src/scene/layout.ts) · [Shore and sailing checks](../../tests/unit/wide-clearance.test.ts) · [Ferry and transfer checks](../../tests/unit/wide-ferry.test.ts)

- The occupied model clears land, piers and current rocks along all three routes. Tests sample 1,001 poses in each direction from each supported departure heading, with the modeled turns into and away from the berths.
- All fifteen capacity-legal roster subsets, including the empty ferry, have stable seats and clear the cabin, rails and other animals. Each of four landings supports the waiting and delivered groups.
- Both berth orientations, every dry tide, all draft bands and both directions of transfer are covered. Tests check actual foot support along the gangway and deck and the body bounds of moving neighbors against the dock's scenery and one another. The sampled tests do not establish continuous mathematical clearance between frames.
- Native phone gameplay supplies the visual check for legibility and the timing of the turning current. The desktop Chromium emulation has different input and graphics characteristics from a physical Android handset.
