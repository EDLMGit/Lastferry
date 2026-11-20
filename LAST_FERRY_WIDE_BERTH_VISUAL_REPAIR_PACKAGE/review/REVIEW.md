# Wide Berth — visual review and correction decision

**Reviewed SHA:** 45ab9768792ddd3a8dffb67da6c332f8fe2234ff  
**Date:** 31 October 2026, Europe/Madrid  
**Disposition:** retain the implemented puzzle/campaign foundation; correct the visually rejected presentation before expansion.

## Review scope

GitHub PR#1 was read directly and matched the supplied SHA on `m1-first-crossing`; it remained open/draft with main at `386de54d20fdd4a513a06115471d70bf94738cc0`. The report, relevant source and committed native frames were inspected, together with the user's desktop screenshot and an earlier Driftwood phone frame.

This review did not run a fresh application browser session, replay the full recordings, listen to runtime audio or test Android. The contributor's381 unit checks,79 asset families and development/production browser results are reported evidence, not independently rerun here. Source downloads are audited against Git blob identities.

The generated direction board is a new design artifact. It is not a photograph of an implemented fix, a geometry proof or a claimed runtime capture.

## Findings and cause

| Finding | Source/evidence | Correction |
| --- | --- | --- |
| Oversized flat boat with weak cabin presence | `ferry-profile.ts` declares beam1.06→2.92 and length-envelope1.93→4.90 for4→6 spaces. `models.ts:wideFerry()` expands the deck much more than cabin mass. | Reauthor a compact, purposeful hull/cabin/deck with real legal loads. |
| A test requires the oversized result | `tests/unit/wide-ferry.test.ts` explicitly requires both wide model dimensions to exceed2× old. | Replace arbitrary enlargement with real fit/contact/clearance and native composition evidence. |
| Huge repetitive docks and sparse lines | `shoreSeat()` assigns all six global IDs a1.1-unit row; each pier is6.4 wide. The shore test forces every group into that rectangle. | Compact supported groups on actual island/quay space; small functional docks. |
| Fence-like boards | `createPier()` uses nine .14-deep strips over2.2 units: .275 center spacing and .135 gaps. Old1.2-depth docks had approximately.01 gaps. | Supported fitted decking with coherent board spacing; distinct stone landing. |
| Large orange gangway | `world.ts` stretches a plain1.05-wide box between distant bridge/gate endpoints. | Reauthor the berth relationship and a shorter credible bridge sharing actual transfer endpoints. |
| Cloned islands | The four new footprint arrays are identical translated six-point polygons. | Four distinct readable silhouettes/shore treatments; correct triangulation. |
| Animals visually overwhelmed | Existing model scale is retained; larger hull/docks and broad world bounds dominate the view. Native loaded portrait also masks a sheep face. | Correct relative scale, grouping, framing and marker; preserve full-size bodies. |
| Opaque current cue on a face | `main.ts` projects endpoint targets at node XZ. `endpointTargets()` positions44/48px targets; label avoidance does not move the marker. CSS produces an opaque disk over the load. | Accessible target with a stable visible cue in nearby water or at water level. |
| Floating portrait quay | `launchShot()` independently uses quay.41H, foreground water.55H and boat.73H. Quay side ends above that water without supports. | Shared composed shore/quay/water/boat/feet anchors and visible support. |
| Nell/cabin overlap in landscape | Nell/cleat project over the roof during the opening and are painted afterward. | Clear silhouettes throughout release/glide, not only at endpoint. |

Declared profile dimensions are not a measured volume. The approximately sevenfold bounding-rectangle increase explains the disproportion but is not a simulation result. Animal meshes were not simply shrunk; the stronger finding is relative scale/composition and UI occlusion.

The current island-top renderer uses a fan around the center. Distinct compatible outlines are sufficient; deep concavities require a deliberate triangulation update. A generated crescent must not silently add triangles over navigable water.

## Actual frames supporting the review

At the reviewed SHA:

- `reviews/wide-berth/close/390x844-six-spaces.png`: full group, opaque marker over sheep, broad deck and long gangway.
- `reviews/wide-berth/chooser/390x844-five-bodies.png`: supported legal group, with weak deck/character hierarchy.
- `reviews/wide-berth/chooser/390x844-six-ashore.png`: mechanically supported but rigid global row.
- `reviews/wide-berth/play-initial/780x320-wide-start.png`: released Play crops much of Harbor above HUD; this cannot substitute for Overview acceptance.
- Launch beginning, glide and endpoint under both `play-initial/780x320-launch-*.png` and `close/390x844-launch-*.png`: portrait water/quay gap and landscape roof overlap.
- Prior `7e324e8` Driftwood `handoff/390x844-full-deck.png`: compact earlier ferry, with a smaller pre-existing marker overlap.

The screenshot attached by the user independently exposes all four cloned shores and the relative sizes in Overview. Close-only transfer evidence did not establish overall composition.

## Why the prior checks did not settle the question

The handoff honestly reserved human art/puzzle judgment and documented the obscured sheep. Functional tests establish memberships, collision checks, input and saves; their success does not establish a convincing silhouette or grounded illustration. The phrase “native inspection passed for stated coverage” permitted a visible defect.

The preceding creative brief also emphasized mechanical coverage more strongly than explicit proportions/composition. This correction supplies an image target and issue-specific native observations, while replacing two design-shaped test assumptions. More screenshots alone are not the remedy.

## Scope and preservation

Preserve the graph, depth/tide/capacity rules, passengers/appearance, all witnesses, complete Undo and campaign/save boundaries. Allow new spatial coordinates, actual ferry/pier/shore geometry, waiting arrangements, route controls, framing, current marker presentation and the launch composition.

Keep original four-space coves,79 asset IDs, established UI/audio/water and sailing policy. No new cove, species or current is added. The user is the human playtester. Physical-device/acoustic approval and inherited unrelated defects remain separate.

The included publication receipt is copied unchanged from the previous package. Last confirmed private Site is version12/game `1a85874883af5caa59f6294a75495eccf2afebbc`; no fresh live-site audit or deployment is claimed.

## Primary source links

- [PR#1](https://github.com/EDLMGit/Lastferry/pull/1)
- [Wide Berth report](https://github.com/EDLMGit/Lastferry/blob/45ab9768792ddd3a8dffb67da6c332f8fe2234ff/reviews/wide-berth/REVIEW.md)
- [Ferry profile](https://github.com/EDLMGit/Lastferry/blob/45ab9768792ddd3a8dffb67da6c332f8fe2234ff/src/scene/ferry-profile.ts)
- [Ferry tests](https://github.com/EDLMGit/Lastferry/blob/45ab9768792ddd3a8dffb67da6c332f8fe2234ff/tests/unit/wide-ferry.test.ts)
- [Pier construction](https://github.com/EDLMGit/Lastferry/blob/45ab9768792ddd3a8dffb67da6c332f8fe2234ff/src/scene/pier.ts)
- [Level geometry](https://github.com/EDLMGit/Lastferry/blob/45ab9768792ddd3a8dffb67da6c332f8fe2234ff/data/wide-berth.level.json)
- [Story painter](https://github.com/EDLMGit/Lastferry/blob/45ab9768792ddd3a8dffb67da6c332f8fe2234ff/src/campaign/story-painter.ts)
