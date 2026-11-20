# The home channel

At Lantern Buoy the captain can see the cream and tan rabbits on the low timber landing and the sheep and beaver beside the roofed shelter on the higher stone quay. The pale water between the two islands marks Ribbon Cut. The deeper arms run out into the buoy. A red-roofed cottage, a timber landing and the sweeping lighthouse share the Harbor headland. These are the game's original meshes, shore contours, shallows and lights.

## After playing the coast

In the first 390 × 844 crossing the camera chose Harbor as the nearest framing subject at the starting buoy. All four waiting bodies were outside the right edge. The camera looked good on the way home, but Mallow's head slipped behind the cabin roof partway down the channel. The lighthouse roof also touched the load gauge while docked. [First opening](play/prototype/390x844/01-opening.png) · [First approach](play/prototype/390x844/06-last-approach.png)

I tried four portrait angles and played the return channel again. The retained view looks obliquely across the ferry, with both groups in view on departure. At the same buoy on the way back it frames the tower and the boat together. The shift follows the actual waiting passengers, including a split party or an Undo. The ordinary camera interpolates through the two separately commanded homeward passages. The load, light, berth and Bring home control remain visible at arrival. [Opening](play/390x844/01-opening.png) · [Last approach](play/390x844/06-last-approach.png) · [Docked portrait](play/390x844/07-docked.png) · [Docked landscape](play/780x320/07-docked.png)

On the turn-five full-deck buoy stop of the developer UI replay, the 390 × 844 frame placed the tower at x 20–69, y 336–422 and the occupied boat at x 251–349, y 384–491. At the dock the tower filled 158 vertical pixels, with 79 pixels of clearance below the lower edge of the load gauge. On 780 × 320 the docked tower occupied x 345–399, y 24–132 and the boat x 330–446, y 170–268. These stationary Three.js projections include bounding-box padding; the linked release frames show the actual silhouettes. Looking along the moving deck briefly overlaps outlines. At rest the two rabbits, white fleece and brown beaver can be counted separately.

## Water and walking clearance

The prototype Ribbon Cut passed a centerline inspection. Sampling the occupied six-space ferry found its turning corners touched the tips of both piers near departure. I curved the two ends of the cut farther into the water and retested both directions. The through-water geography, depth comparisons and turn counts remain unchanged.

I also tried moving the two rear seats 0.30 world units forward to improve the view of Mallow. Six all-subset tests found walking collisions in that experiment, one for each pier and berth orientation. I restored the established seat positions and used the camera angle to reveal the group.

The final candidate passes all 14 applicable geometry tests. Coverage includes 16 passenger subsets, both directions, reachable departure headings, both berth orientations, drafts 1 through 4, both tide levels, supported feet along the walking paths, fixed and occupied passenger bounds, shore props and landmark foundations. [Navigable paths and landmarks](../../tests/unit/wide-clearance.test.ts) · [Feet, gangways and deck](../../tests/unit/wide-ferry.test.ts)

Run `node node_modules/vitest/vitest.mjs run --maxWorkers=1 tests/unit/wide-clearance.test.ts tests/unit/wide-ferry.test.ts -t "Last Ferry"` from the repository root. The screenshots and moving check use native-size Chromium emulation. Physical Android play and independent visual approval remain open.
