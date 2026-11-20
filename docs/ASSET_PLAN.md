# Last Ferry — M1 Asset Plan

## Deliverable boundary

Supply actual 3D assets for one finished cove: a yellow ferry with a red cabin, one sheep, two rabbits, shoreline, piers, and a lighthouse refuge. Future orchard and sanctuary references do not require additional environments in M1.

Follow [`ART_DIRECTION.md`](ART_DIRECTION.md), using [`first-crossing.png`](../references/first-crossing.png) as the primary reference. Concept-image geometry, passenger counts, typography, and implied routes are not authoritative. Level data and rules control the playable scene.

## Prioritized inventory

| Priority | Asset | Quantity or reuse | Required finish and function |
| --- | --- | --- | --- |
| P0 | Cove landform | One authored composition | Shaped terrain with rounded edges, sand, rock, and restrained vegetation; exact playable locations from data |
| P0 | Water and shoreline states | One water treatment; variants for defined tide states | Readable depth bands and exposed land, with clean transitions and no false routes |
| P0 | Ferry | One reusable model | Curved yellow hull, red cabin, open deck, readable bow, named passenger anchors; convincing when lightly or fully loaded |
| P0 | Sheep | One model | Cream wool silhouette, darker face, simple limbs and pivoted head; clear onboard and ashore |
| P0 | Rabbit | One shared base, two instances | Clear ears, compact body, modest pose or surface variation; no implied mechanical difference |
| P0 | Pier kit | One kit, instanced as authored | Substantial boards, supports, clear boarding edge; flooded state readable at actual tide heights |
| P0 | Lighthouse refuge | One small composition | Distinctive lighthouse, readable landing, restrained warm arrival detail |
| P0 | Gameplay indicators | Reusable procedural geometry or sprites | Selection, destinations, route state, and forecast; all derived from actual state |
| P0 | Interface | DOM and CSS | Accessible controls and status; no essential text baked into textures |
| P1 | Coastal dressing | Small reusable set | Rounded rocks, grass clumps, bushes, mooring details; placed after route readability works |
| P1 | Surface accents | Optional palette or texture atlas | Subtle wood, stone, and painted details only where they improve the scene |

P0 means required for milestone completion, not that each asset must be elaborate. P1 polish must not compromise visibility or delay a functional, finished cove. Passenger capacity, anchor use, pier count, and tide variants must follow the implemented data rather than the quantities implied by this visual inventory.

## Creation and acquisition

Prefer an original, cohesive asset family. If available, use Blender to build, bevel, shade, and export hero models. Keep editable sources or reproducible scripts. Blender is optional; installation must not block implementation.

Code-generated geometry is acceptable when it achieves the intended finish: a shaped and tapered hull, curved or beveled structures, deliberate normals, character silhouettes, and coordinated materials. Runtime meshes are real 3D assets. Unmodified boxes, spheres, and capsules are useful for blockout but do not constitute final art simply because they render in 3D.

Third-party assets may be used when their license, source, and style fit the project. Rework colors, proportions, and unnecessary detail to create a coherent family. Do not introduce several visibly unrelated asset styles merely to populate the scene. Do not depend on a remote asset service during play.

Use concepts to guide modeling, not as full-screen backdrops beneath interactive markers. Material textures and a sky gradient are fine. Navigable terrain, piers, characters, and ferry need spatially coherent geometry.

## File formats, scale, and pivots

Use **GLB** for imported runtime models where practical; glTF with explicitly packaged dependencies is also acceptable. Procedural meshes may remain in source code. Keep models, textures, and source assets in predictable project directories; avoid embedding opaque assets in application components.

Adopt these conventions consistently:

- **Units:** one authored unit equals one metre. Choose proportions to suit the miniature style; consistency matters more than literal engineering dimensions.
- **Runtime coordinates:** right-handed, Y up; asset forward is positive Z. Adapt camera and movement math explicitly to this convention.
- **Transforms:** apply export transforms and avoid unexplained negative scales. Check Blender-to-glTF axis conversion in the actual runtime.
- **Ferry pivot:** centered on the footprint at its nominal light-load waterline. Give visual draft adjustment its own transform beneath the logical route-position root.
- **Animal pivots:** centered between the feet at ground contact. Use simple child pivots or a small rig only where animation needs them.
- **Structure pivots:** ground or water-contact base; pier boarding edges and attachment points should have predictable local coordinates.
- **Passenger anchors:** clearly named transforms matching the game's slot data. Attach the visible passengers to these anchors; do not approximate occupancy with floating icons.
- **Materials:** semantic names such as `hull_yellow`, `cabin_red`, and `wool_cream`; use a small reusable palette.

Keep source geometry straightforward to edit. Bone rigs, morph targets, normal maps, and elaborate UV workflows are optional. Use them only for a visible benefit. Verify that exports preserve intended normals, material colors, transparency, pivots, and child names.

## Provenance and license ledger

As assets are added, maintain an asset ledger, for example `docs/ASSET_LEDGER.md`, with one entry per original asset family or acquired source. Record:

| Field | Required record |
| --- | --- |
| Runtime asset | Local path and purpose |
| Source | Original authoring file/script, or exact acquisition URL and version |
| Author | Creator or publisher, when known |
| Rights | Actual license or project rights status; never assume a downloaded asset is free to use |
| Evidence | Retained license text, source notice, or other supplied terms |
| Changes | Material edits, geometry changes, conversions, and attribution requirements |

Keep third-party license files and required notices with the project. Document any externally sourced textures or fonts too; system fonts can keep the interface simple. Identify generated material assets and supplied concept references accurately. Do not label generated imagery as public domain or claim unverified rights. Resolve uncertain provenance before including the asset in the deliverable.

## Production order and verification

1. Establish the camera, level locations, water heights, and temporary silhouettes from game data.
2. Finish the ferry and animals early, testing their readability both at piers and onboard.
3. Replace the terrain, piers, and refuge blockout with a coherent finished composition.
4. Add state-derived indicators, draft response, tide transitions, and small character animations.
5. Add only the dressing that improves composition; verify small-screen visibility again.

Use existing tooling. Add custom pipelines, LOD, compression, or texture streaming only for measured needs. Profile on a representative mobile browser and desktop; optimize observed stalls or heavy assets rather than imposing invented engine limits.

Before handoff, verify that all required assets load locally, passenger instances match occupancy, the ferry clears its rendered piers, water meets every authored shoreline, and undo/restart remove stale objects and effects. Inspect every defined tide and load state. Confirm that completed assets remain coherent under reduced motion and at the smallest supported landscape view. A polished screenshot is evidence of appearance; a playable, consistent scene is the acceptance target.
