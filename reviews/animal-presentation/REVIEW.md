# ANIMAL_PRESENTATION_01 — animal miniatures and passenger choices

The same five appearances now have two distinct jobs in the interface. Board, Let ashore and Bring home use a close portrait next to a native passenger choice and its name/cost. The arrival bubble uses standing figurines for the entire rescued group, including early deliveries. The lanterns and navigation still belong to the existing result flow. This pass adds no progression, score, save or puzzle data.

## What to compare

Use the native Holding Pier frames for the closest match to the [original user examples](baseline/). Each pair comes from playing nine actions with the same passengers, lighting setup and ordinary Play camera. Orientation, level and state are matched; lighthouse phase is not synchronized. The studio and bounded component fixtures are diagnostic renders, not evidence of a rescue. The [planning review](PLANNING_REVIEW.md) remains the historical record.

| Holding Pier | Before | After |
| --- | --- | --- |
| Portrait, Harbor offboarding | [390×844](before/390x844/holding-bring-home.png) | [390×844](after/390x844/holding-bring-home.png) |
| Portrait, everyone home | [390×844](before/390x844/holding-everyone-home.png) | [390×844](after/390x844/holding-everyone-home.png) |
| Short landscape, Harbor offboarding | [780×320](before/780x320/holding-bring-home.png) | [780×320](after/780x320/holding-bring-home.png) |
| Short landscape, everyone home | [780×320](before/780x320/holding-everyone-home.png) | [780×320](after/780x320/holding-everyone-home.png) |

## Source and scope

Before: accepted `a2740e61ec5a782f558ea6caad4181466d04e9f7`. Implementation parent: task commit `d7884445c35fc24ebdabc2790b168b68294bf0bd`. The after-build is identified by the shipped bundle hashes in the actual evidence manifest, avoiding a self-referential commit ID. Node 24.15.0 on Windows. The ten transparent, file-backed profile images are baked offline from the shipping model source; no per-card canvas or WebGL context is created. The [export manifest](../../assets/portraits/animal-profiles.json), [shared model checkpoint](art/matched-models.png), [native profile sheet](art/native-profiles.png) and [resource measurements](art/model-costs-and-cameras.json) document the source and outputs.

The [preservation check](preservation.json) compares protected files against the guidance commit, including the lockfile, levels, lanterns, gameplay, Journey, audio and shared scenery. Seven Journey coves and nine Practice entrances remain. Ternhaven stays Practice-only, target 14/revision 1. The recorded private Site remains version 21, runtime `a2740e6`, hosting `ea3bed5c0aaf41e4ba516e4621da0f81119e652b`. This pass is not deployed.

## Art and resources

The rabbits’ inner-ear paint follows the tapered ear itself, including the tan rabbit’s splay. The sheep’s fleece and dark face read as two distinct masses; the original head attachment now carries the features when Moss nods. The beaver keeps its paired teeth, forepaws and broad tail. The deer’s spots, four hooves and short forked antlers remain recognizable from the standing profile. The generator uses actual production geometry and species scale under a controlled studio light. It does not redraw the characters or claim a pixel match with the cove.

| Appearance | Meshes / single-pass draws, before → after | Triangles, before → after | Distinct materials, before → after |
| --- | ---: | ---: | ---: |
| Cream rabbit | 12 → 19 | 2,016 → 3,908 | 4 → 1 |
| Tan rabbit | 12 → 19 | 2,016 → 3,908 | 4 → 1 |
| Sheep | 29 → 28 | 4,328 → 6,128 | 6 → 1 |
| Beaver | 21 → 21 | 4,056 → 4,688 | 9 → 1 |
| Deer | 42 → 33 | 6,240 → 5,728 | 9 → 1 |

All five use cached geometry and animal-local vertex paint. One shared material does not imply a single draw per animal. The full cove also draws scenery and shadow passes; compare the same Wide Berth frame rather than treating the model-only counts as frame totals.

## Verification notes

- The 186 [identity, transfer, mastery, arrival and Journey unit assertions](interaction-units.json) passed. All six [catalog tests](catalog-units.json) passed. The canonical catalog retains all 82 IDs and all earlier provenance. Only seven existing families were updated: the four species, passenger images, passenger choices and dialogs.
- The [protected-source comparison](preservation.json) checked 71 existing files plus the original shared factory helpers/scenery, with no differences. It includes the live movement and Moss story code; the model supplies the compatible attachment. No save migration or re-solving of unchanged puzzles was needed.
- The [first geometry run](geometry-first.json) is retained: 22 failures exposed problems in real foot contact and support. The model was repaired rather than weakening the support thresholds. The [baseline browser driver log](original-runs/BROWSER.md) retains a post-Undo offscreen-target timeout and its unchanged-source rerun.
- These are native-sized emulated Chromium viewports with software WebGL, not physical Android, GPU frame-budget, human visual acceptance or acoustic approval. No new sound was composed. Existing phone performance and browser-specific limits remain open for device review.

On Wide Berth turn 10 with five passengers aboard, all 11 before samples measured **674 draws / 126,796 triangles**; all 11 after samples measured **727 / 147,332**, including shadows (+7.9% draws, +16.2% triangles). The ten transparent 256px PNGs total **446,629 bytes**. The [studio notes](art/ART_CHECKPOINT.md) record why the first crop was rejected and how the final tail attachment was corrected. The [final eight-suite run](geometry-accepted.json) passed all 109 tests; the intervening [108/109 run](geometry-final.json) is retained. No pre-existing geometry assertions were edited.

The final `npm run build` passed TypeScript and produced `index-BRpoi51i.js` (SHA-256 `62f20bc23b6812b15e8d91bdcdc51d1e6275729c4d90130e500ba904141d49e2`) and `index-BzKh4zYF.css` (`afe58761c07a73d5476dc0cb1edf153ca6287725894c9b1384fb9bc26457f066`). Vite reported its chunk-size advisory; it did not fail the build. `npm run check:assets` validated 82 families. In the native short-landscape rescue the animal feet and three names now occupy the left shelf; the right side retains the crown and forward control. In the portrait Harbor chooser, both ear silhouettes and Moss’s dark face read beside the complete live labels, with the one-action commit below the choices.

## Actual play and evidence

- **Minified production:** Holding Pier completed in nine actions; Ternhaven completed in 14 and included Sedge, who had already reached Harbor. The suite exercised Board, temporary Let ashore, Bring home, subset cancellation, a tide Undo, terminal Undo/redelivery, result dismissal and Settings without writing an accepted result. [Holding](after/runs/holding.json) · [Ternhaven](after/runs/ternhaven.json) · [Ternhaven in short landscape](after/780x320/ternhaven-everyone-home.png).
- **Actual ferry fit:** [Nell, Fern and Oat on the small deck](after/390x844/driftwood-full-deck-inspection.png) and [five bodies on the six-space ferry](after/390x844/wide-five-aboard-inspection.png) were reached through play. Four distinct minified scenarios passed: three in the initial final run, and Driftwood in a focused rerun. That first Driftwood run reached the requested crew; its optional zoom inspection timed out at maximum zoom. Its original result is preserved separately from the rerun.
- **Phone layout and access:** [Component checks, source and original failures](COMPONENTS.md) cover visible full text, native choices, keyboard/touch, load and failure, stable commit placement, rotation and Details at phone and desktop sizes. The [six-neighbor shelf](components/fixtures/320x740-six.png) uses the actual renderer with a labeled fixture; it is not presented as another real rescue. [UI evidence index](UI_EVIDENCE.json) · [actual before/after build and image hashes](ACTUAL_EVIDENCE.json).
- **Motion:** [Uninterrupted Harbor transfer and arrival with runtime sound](record/390x844/arrival.mp4) — 390×844, 9.789 seconds, 91 delivered frames, maximum capture gap 0.300 seconds. SHA-256 `19085a88c015a862afad3c0198a963aeef6b6348e2991627213f1be2ce54bf69`. This is a final-source development capture through the existing Sound owner; the two complete rescues above used minified production. A separate interrupted-unload test verified one transfer and restored the same three models and Moss’s seat after Undo. The strengthened [Moss hierarchy test](art/nod-hierarchy.json) measured eight moving facial parts, stationary feet and their restoration to rest.

[Actual gameplay cases, reproduction commands and recording audit](ACTUAL_PLAY.md) · [Component and gallery checks](COMPONENTS.md). The Holding case also verified actual fullscreen entry on the common game root and the still-open dialog after rotation.
