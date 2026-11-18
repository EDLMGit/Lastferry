# The ferry, the occupied landings and the bridge

Four fitted landings serve the existing six-space hull. Sorbus waits at Lantern Steps on the inside of Wick Race. Wick Landing faces the Steps across the water. From Wick in 390×844 Play, Flax is visibly aboard, the two rabbits stand together ashore, and Sorbus and the direction of the current can be seen beyond the ferry. The handwheel remains on the low Signal Quay and the timber span still swings through a quarter turn. Its passage opening is sized from the six-space hull's beam.

The deer has the forward berth. Flax and Ember use the two berths aft; Tallow has the other forward berth. Their deck and shore positions are resolved by ID. All 15 capacity-legal rosters keep the same positions when the roster order is reversed. Temporary staging and delivery use the actual full-size models and their established choice portraits.

## Geometry verification

The final focused run passed all 17 Lantern Reach and bridge cases across the two existing geometry suites. The 83 deselected cases belong to the other coves or shared non-candidate checks. The bridge test samples 1,001 positions against the occupied mesh envelope at both mooring headings. The clearance check sweeps the occupied model on every approach to each passage, in each direction, including both bridge endpoints and the actual reef rock geometry. The tests include the otherwise unboardable seven-space roster in the outer envelope as a conservative clearance check.

The first flat-on short-landscape view at Wick cropped Sorbus. I compared five oblique views on the actual 780×320 surface. The retained eastern view puts the two occupied banks beside one another, with the boat, the complete cast and the arrowed race visible above the clock. Signal Quay retains its distinct bridge-operating view.

For all four landings the transfer cases cover legal subsets, the two berth orientations, every dry tide and drafts one through four. They sample actual feet on the ground, planks, gangway and deck, and moving figures against the cabin, rails, trees, winch, lighthouse and other passengers. An additional check verifies distinct land contours and supported compact waiting groups.

The first six-space layout failed the continuous sweep. A wide ferry turning away from Harbor, Wick or Lantern Steps clipped the outer pier boards. At Harbor it also grazed the bridge hardware. These 24 route/obstacle combinations occurred between settled poses. Rounding the approach curves out into open water provided the turning space; the bridge span, foot support and original collision tolerances were retained. The original failure output is summarized here to distinguish the rejected layout from the final result.

Run `npx vitest run tests/unit/wide-clearance.test.ts tests/unit/wide-ferry.test.ts -t "Lantern Reach|the bridge leaf" --maxWorkers=1` from the repository root. See the [main review](REVIEW.md) for minified actual-play frames and recovery. Browser evidence uses emulated touch and software rendering on Windows. Physical device performance and perceived difficulty remain for playtest.
