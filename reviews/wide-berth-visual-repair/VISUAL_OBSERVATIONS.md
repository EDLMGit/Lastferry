# Native visual observations — Wide Berth repair

These are observations of actual runtime PNGs opened at their native image dimensions, not the supplied art board. The first complete inspection batch is `verified/`: Chromium 156.0.8078.4, Node 24.15.0, DPR 1, local Vite runtime at port 5270. Its `source-before.json` and `source-after.json` contain matching hashes for all 73 source/data/package files, based on Git HEAD `45ab9768792ddd3a8dffb67da6c332f8fe2234ff` plus the recorded working tree. Passing that batch's four interaction checks did **not** establish visual acceptance: inspection found the short-landscape shore-group clipping below.

## Ferry proportions, cabin and full roster

- `verified/390x844-full-wide-play.png` and `verified/390x844-full-quay-play.png`: the cabin is a substantial part of the red-and-gold ferry, with a clear open deck in front. Two sheep and two rabbits remain recognizable at full six-space load. Animals do not appear shrunk to fit. Cabin, rails, deck and hull read as one ferry, rather than a broad platform carrying a miniature cabin.
- `verified/390x844-five-shell-play.png`: five bodies occupying six spaces remain individually visible. The opposite berth shows the cabin on the left; four rabbits and one sheep occupy the open deck. The current marker is below the hull, clear of faces.
- `verified/780x320-full-wide-play.png`, `verified/780x320-full-quay-play.png` and `verified/780x320-five-shell-play.png`: the same loads remain recognizable at native short-landscape size. Play deliberately crops distant terrain, so these frames are local ferry-detail evidence, not whole-cove framing evidence.

## Compact shore groups and supported piers

- `verified/390x844-six-ashore-play.png`: all six waiting animals are visible on the land behind High Quay. The two sheep sit behind two staggered pairs of rabbits; no rabbit column hides another rabbit's face. There is a clear central approach to the short stone pier. The Board control occupies clear space to the left of the group.
- `verified/390x844-full-wide-play.png` and `verified/390x844-five-shell-play.png`: narrow fitted timber crossheads and short boarded gangways visibly connect deck and shore. High Quay's landing is visibly stone in `verified/390x844-full-quay-play.png`. These images support appearance; actual foot support, body clearance and transfer sweep claims belong to the physical-test reports.
- **Original visual failure retained:** `verified/780x320-six-ashore-play.png` hides most of the waiting group above/behind the top HUD. Only portions of the front rabbits remain visible. The corresponding Overview shows the group, but that does not make this released Play frame acceptable. This was reported for correction after the four automated interaction checks passed. Do not use this frame as evidence that short-landscape six-ashore Play framing passed.

## Four islands and Whole cove

- `verified/1440x900-empty-overview.png` and `verified/1782x1225-empty-overview.png`: Harbor is the broad lighthouse refuge; High Quay is the compact rocky central island with a stone landing; Wide Berth has the longer working island and small supported waterfront shed; Shell Landing is an oblique low bank with reeds and shells. The authored coastlines differ, although their rounded treatment keeps those differences restrained. The shed and lighthouse are visibly grounded.
- `verified/320x740-empty-overview.png`, `verified/390x844-empty-overview.png`, `verified/844x390-empty-overview.png` and `verified/780x320-empty-overview.png`: all four island masses and the buoy fit the released Whole-cove view. Harbor's lighthouse is fully inside these frames. No developer zoom or screenshot crop is used as fit evidence.
- In native phone Overview, passengers are **small species silhouettes**, not readable facial detail. The white sheep masses and upright rabbit ears are distinguishable; individual names and expressions require Play or the passenger chooser. The 780×320 Overview is the most compressed case.
- `verified/390x844-six-ashore-overview.png` and `verified/780x320-six-ashore-overview.png` show the compact six-animal shore group without turning the pier into a broad passenger platform. The group is much easier to inspect in portrait Play.

## Markers, labels and controls

- `verified/390x844-marker-focused.png`, `verified/390x844-marker-selected.png` and `verified/780x320-recovery-focused.png`: the current-location ring and keyboard focus outline are on a separate water target, not painted over the cabin or passenger heads. A visible line links the displaced target to the ferry. The selected current-location card says the player is already at Harbor and shows local context.
- `verified/390x844-recovery-loaded-play.png`, `verified/780x320-recovery-rotated.png` and `verified/780x320-recovery-opposite-berth.png`: after orientation/recovery changes, the target remains separate from the occupied hull. Motion/recovery correctness is established by the associated browser check, not by still images alone.
- `dock-corrected/780x320-staged-controls.png` records the first correction of the actual Shell-target obstruction. Board Alder and Let ashore fit as readable controls, with Shell's real touch target exposed. The original obstructed frame remains in `final/780x320-staged-controls.png`; the failed run was not overwritten.
- **Original presentation compromise retained:** `verified/780x320-full-quay-overview.png` places Let ashore across Harbor's lighthouse and upper island. Animals and map targets are clear, but the home landmark is obscured. The dock-placement preference was subsequently changed to clear terrain and landmarks where space permits. A later capture must demonstrate that result.
- The 780×320 Overview names can use long crossing leader lines. In `verified/780x320-empty-overview.png`, High Quay's name appears nearer the upper island, while Wide Berth's name is near Shell terrain. Endpoint identity is truthful, but association is less immediate than at 844×390 or desktop. This remains a presentation limitation unless superseded by later evidence; it is not reported as a hit-test failure.

## Completion and remaining evidence limits

`verified/390x844-six-delivered.png` and `verified/780x320-six-delivered.png` show six passengers home, the compact completion card and accessible recovery controls. The transient transaction receipt is still visible in those captures; it is not permanent additional UI.

This inspection does not establish physical Android behavior, subjective human art acceptance, acoustic quality or uninterrupted motion. Launch and transfer recordings, source-tied automated checks and the main review report provide those separate evidence categories. The two discovered visual issues above require corrected final frames before they can be marked resolved.

## Corrected candidate inspection

The later `accepted-candidate/` folder is a **review candidate**, not a claim of human approval. Its 73 source/data/package hashes match before/after the complete capture run. The source includes the Wide-only phone Play framing correction and the dock's terrain-clearance preference. These observations supersede the two failed visual details above while preserving their original frames and diagnosis.

- `accepted-candidate/780x320-six-ashore-play.png`: all six waiting animals now fit below the HUD, above the stone landing and empty ferry. The Board control is to the right in open water. Two sheep and the four staggered rabbits are visible at native size. The earlier shore-group clipping is resolved in this checked state. `accepted-candidate/390x844-six-ashore-play.png` retains the larger portrait view of the same group.
- `accepted-candidate/780x320-full-quay-overview.png`: Let ashore now sits in open water at upper right. Harbor's lighthouse and island remain exposed. The earlier lighthouse/control overlap is resolved in this checked state. `accepted-candidate/390x844-full-quay-overview.png` also keeps terrain and landmarks clear.
- `accepted-candidate/780x320-full-wide-play.png`, `accepted-candidate/780x320-full-quay-play.png` and `accepted-candidate/780x320-five-shell-play.png`: the released Play camera now includes both the local shore and the occupied ferry. The animals are slightly smaller than in the clipped earlier landscape crop, but recognizable sheep/rabbit silhouettes and all five bodies remain visible. This is camera fitting; animal model scales did not change.
- `accepted-candidate/390x844-full-wide-play.png` and `accepted-candidate/390x844-five-shell-play.png`: portrait detail remains strong, both berth orientations remain legible, and the nearby transfer controls occupy water rather than the waiting area or waterfront shed.
- `accepted-candidate/320x740-empty-overview.png`, `accepted-candidate/844x390-empty-overview.png`, `accepted-candidate/1440x900-empty-overview.png` and `accepted-candidate/1782x1225-empty-overview.png` were reopened at native dimensions. They retain all four islands, the buoy, readable names, the entire lighthouse and usable view controls. Phone Overview still serves as a network/silhouette view, not a facial-detail view.
- `accepted-candidate/390x844-marker-focused.png`, `accepted-candidate/390x844-marker-selected.png`, `accepted-candidate/780x320-recovery-focused.png`, `accepted-candidate/780x320-recovery-rotated.png` and `accepted-candidate/780x320-recovery-opposite-berth.png`: selected/current/focus indicators remain separate from the cabin and animals after the camera correction and orientation/recovery sequence.

The short-landscape Overview label-association caveat remains: truthful leader lines sometimes cross or place a name nearer a different island. Native Play can crop distant islands and the distant lighthouse when focusing the local rescue; Whole cove is the complete-network view. Neither limitation is presented as a physical clearance or puzzle-rule defect. Human visual acceptance remains outstanding.

## Shared current-cue regression and correction

A later uninterrupted rescue attempt reproduced an actual regression in the original Driftwood Yard: after boarding both rabbits at turn 7, the displaced Reed Landing current cue intercepted Shallow Bend's target. `drift-regression/driftwood-hit-owners.json` records the wrong owner and `gates/drift-regression.txt` retains the original 15-second tap failure. This was a runtime regression, not a fixture error.

The correction fits the full current hit rectangle around the boat while also avoiding every other actual endpoint hit rectangle. Only the current cue moves; noncurrent endpoint coordinates remain unchanged. `drift-corrected/780x320-driftwood-cue.png` was inspected at native size: Reed Landing's cue now sits to the right of the boat, Shallow Bend's return target is exposed, and the aboard rabbits remain visible. `drift-corrected/driftwood-hit-owners.json` shows all five centers resolving to their own buttons. The actual named-touch return passed with the unchanged 15-second locator timeout; the exact captured geometry was added to the unit check. Earlier candidate frames remain truthful evidence for their recorded source, and the final source-tied recapture follows this shared correction.

## Final source-tied native frame review

After the current-cue fix, the following 12 essential frames in `final-candidate/` were opened again at native size. Its `source-before.json` and `source-after.json` match across all 73 captured source/data/package files. `src/main.ts` SHA-256 is `3dd28b15107082922ac586a79cf80b0ada470bd249f406cb4d696737fa0a791f`; `src/ui/cove-layout.ts` is `f74c31e040a64b24d346c974accd28feef6c5778af8aa0520e7bec79b511e096`. This is the final working-tree candidate evidence, not a declaration of human approval.

| Native frame in `final-candidate/` | Inspection |
| --- | --- |
| `390x844-full-wide-play.png` | Full six-space load, substantial cabin and fitted landing remain readable; cue and transfer control stay on water. |
| `390x844-five-shell-play.png` | All five bodies are visible at the opposite berth; no marker covers their faces. |
| `390x844-six-ashore-play.png` | Six staggered waiting animals are supported on shore with a clear central approach. |
| `390x844-marker-focused.png` | Focus cue is separate from ferry and neighboring buoy target. |
| `390x844-marker-selected.png` | Current-location selection remains honest local context; the boat is visible above the card. |
| `780x320-full-wide-play.png` | Local shore, loaded boat and gangway fit together; native animal silhouettes remain recognizable. |
| `780x320-full-quay-play.png` | Full load and stone landing are clear; dock control does not cover the local group. |
| `780x320-five-shell-play.png` | Five bodies remain separately visible with a nearby unobstructed transfer control. |
| `780x320-six-ashore-play.png` | All six animals fit below the HUD; the original clipping remains resolved. |
| `780x320-recovery-focused.png` | After free inspection/recovery, focus and current indication remain clear of occupied deck and cabin. |
| `320x740-empty-overview.png` | Full graph and lighthouse fit; current Harbor target separates from the buoy rather than sharing its hit area. |
| `844x390-empty-overview.png` | All stops, lighthouse, names and view controls remain visible. |

`final-candidate/780x320-driftwood-cue.png` was additionally inspected: the original cove's return target stays exposed after rabbit boarding. No new material visual defect was found in these final frames. The previously recorded small Overview silhouettes, long leader-line associations and distant-landmark cropping in local Play remain the honest presentation limits. Frame inspection does not substitute for uninterrupted playback or human listening approval.
