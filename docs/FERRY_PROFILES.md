# Ferry presentation profiles

First Crossing, Holding Pier, Bellwater, Driftwood Yard and Two Shelters use the four-space boat. Wide Berth and Reef Return use the rebuilt six-space harbor ferry. The active level's capacity selects the model, seats, gate and wake outline. The player chooses passengers and the renderer seats them automatically. [Production profiles](../src/scene/ferry-profile.ts) · [Model factories](../src/scene/models.ts)

## Proportions and draft

Dimensions below are world units measured on the unscaled production models. Width includes the fittings and height includes the stack. The deck height is measured from the hull's local origin. [Measurement record](../reviews/existing-coves-repair/iterations/boat-geometry.json)

| Model | Measured width | Measured length | Measured height | Working deck height |
| --- | ---: | ---: | ---: | ---: |
| Four-space ferry | 1.06 | 1.88 | 1.51 | 0.26 |
| Six-space harbor ferry | 1.85 | 3.86 | 2.32 | 0.635 |

The larger boat has a tapered yellow hull, raised bow, red wheelhouse with a curved roof, cream trim and dark side fenders. Its narrower stem and stern enclose a working deck behind the bow. Both boats settle with load according to `hullDraftY`. At full load the large ferry needs depth four and its deck sits 0.44 units above the local waterline before idle bobbing. The model's hull outline also determines where its wake can be released. The reducer uses the draft bands in the level data for legal movement. [Wide Berth](../data/wide-berth.level.json) · [Reef Return](../data/reef-return.level.json)

## Seating, dock and transfer

On the larger ferry, two-space neighbors sit to either side just forward of the wheelhouse. Rabbits occupy staggered seats further forward. Within each space cost, passenger IDs determine the seat for the whole level. A neighbor staying aboard holds a fixed position relative to the moving deck when others transfer. Wide's five-body load consists of one sheep and four rabbits. Reef can carry its sheep, beaver and both rabbits together. All retain the production species scales. The four-space coves keep their own existing seat and transfer logic, including the separate Two Shelters choreography.

Each large-ferry landing narrows from its shore approach to a boarding end. Timber fingers have boards, supports and piles. On the stone landings a fitted stone approach meets a timber end. The moving brow connects the pier to the gate on the side facing shore. A transfer follows the supported approach, brow and transverse opening, then takes the aisle to the assigned seat. Disembarkation follows the reverse path. Within one group action, animals move in ID order. The winning group reaches shore before the existing arrival cue at 72% of its completion animation. [Landing construction](../src/scene/pier.ts) · [Transfer and deck alignment](../src/scene/world.ts)

## Depictions and verification

The developer gallery renders the production model at its real seats and scales. Nell's illustrated launch depicts its deeper hull, wheelhouse, side gate and fenders. Phone Play frames show the ferry empty, fully loaded, docked and underway beside the accepted small-ferry reference. Physical checks sample the occupied hull along the authored passages and exercise capacity-legal transfers at both berth headings. Visual and puzzle acceptance remain with the player. [Gallery](../asset-gallery.html#wide-ferry) · [Launch painter](../src/campaign/story-painter.ts) · [Current comparisons and test results](../reviews/existing-coves-repair/REVIEW.md)

## Previous profiles

The first large ferry and its earlier visual repair used a lower deck and broad crossheads at the piers. The earlier reported XZ bounds of approximately ±1.195 and −1.768 to 2.188, and the 0.065-unit full-load deck height above water, describe the superseded model. The small ferry's original model and the earlier comparison frames remain available in their historical records. [Original model audit](../reviews/wide-berth/original-model-audit.json) · [Earlier Wide visual repair](../reviews/wide-berth-visual-repair/REVIEW.md)
