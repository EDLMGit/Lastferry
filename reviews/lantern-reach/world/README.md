# Lantern Bridge on the water

These three 390×844 frames show one normal-motion opening from the Signal Quay dock control in Chromium 156.0.8078.4. The test tapped Open bridge and Confirm. The 1,400 ms transition ran at its normal speed. All three frames use the same Play camera and viewport. The source digest, pivot, tip coordinates, observed angles and lifecycle results are in [observations.json](observations.json).

| Closed | Operating | Open |
| --- | --- | --- |
| [Signal and the occupied crossing](signal-closed.png) | [Leaf swinging clear](signal-swinging.png) | [Leaf alongside the channel](signal-open.png) |

At native size the timber deck visibly crosses the dotted Harbor approach. The masonry receiving seat stays fixed as the tip leaves it. The ferry, Wick Landing's rabbits and its deadline remain in view throughout. After the quarter-turn, the route passes through the gap and the quay's Open bridge control disappears. The midpoint frame also shows the brass handwheel on the Signal island.

The sweep check uses the fully occupied four-space ferry's real mesh footprint, both moored headings and 1,001 progress samples. The leaf crosses the channel center when closed, clears it when open and stays clear of the boat throughout its swing. A separate test drives the production journey curves in both directions across all six edges and all incoming headings. It checks land, actual pier and reef geometry, both bridge poses on the detour and the open pose through the cut. The UI check restored the exact model pose with Undo and Restart, reached the endpoint under reduced motion and settled a pending opening through the document visibility handler. Visibility was simulated in Chromium. These checks used software WebGL and touch emulation on Windows.

## Corrections found while testing

- The first fold parked the tip in the outer Harbor approach. It now parks toward Signal. A second test swept the moving leaf against the stationary loaded boat and caught an intermediate contact that both endpoint checks missed. Placing the bearing 36% along the cut from Harbor cleared every sampled phase.
- Copied four-space pier steps and two piles intersected the hull during testing. The three dock tips moved 0.23 world units inland. This cove reuses the wooden retractable gangway for the last step aboard.
- The first portrait camera showed only the edge of the closed bridge. Signal Quay's normal neighborhood now includes the bridge's swept bounds, the ferry and Wick Landing. [Original frame](../preflight/portrait-before.png)
- The first type check caught an overly narrow parent type on the handwheel model. The first pose test also distinguished JavaScript negative zero from positive zero. The final check measures the angle with a numerical tolerance.

From the repository root, serve the development build with `npm run dev -- --port 5374`. Run `npx playwright test -c reviews/lantern-reach/world.config.ts` for the live check and `npx vitest run tests/unit/wide-clearance.test.ts -t "the bridge leaf|Lantern Reach occupied"` for the two geometry checks. The separate release recordings and rescues are in the [main review](../REVIEW.md).
