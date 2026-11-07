# WIDE_BERTH_01 — campaign continuity

## Scope and authority

Deliver one combined milestone: the community launches Nell’s prepared larger ferry, and Wide Berth supplies a substantial new puzzle using six spaces. Complete the authored puzzle, actual boat, scene, journey integration and verification within this task. Mechanical prototypes and intermediate review checks are internal stages, not alternative stopping points.

The root task file owns the launch composition, visual beats and exact caption. This contract owns campaign placement, acceptance boundaries, save compatibility and the corresponding documentation changes.

| Item | Required value |
| --- | --- |
| Task | `WIDE_BERTH_01` |
| New scene | `a-wider-deck` |
| New illustration | `launch` |
| New cove | `wide-berth` |
| Final scene action | **Continue to Wide Berth** |
| Storage key | `last-ferry.journey.v1` |
| Save version | `1` |

## Campaign placement and difficulty

Extend the implemented journey to Holding Pier → Bellwater → Driftwood Yard → Wide Berth. First Crossing remains independent practice. Orin, Orchard Landing, Two Landings and the later current rule remain future work. Do not introduce deer, currents, a boat selector or another playable cove in this task.

Explicitly revise the earlier gentle C4 brief in `campaign/CAMPAIGN_DIRECTION.md`, `campaign/PUZZLE_PROGRESSION.md` and `campaign/STORY_SCENES.md`. Wide Berth now offers the six-space benefit and a consequential load/depth planning decision within the same cove. Its challenge must affect the rescue plan; extra passengers or a blocked optional shortcut alone do not establish that result. Preserve the larger campaign sequence while recording this deliberate difficulty calibration.

Nell is safely rescued before the launch. The larger spare ferry was already prepared at the protected boathouse; safe neighbors help launch it. Rescued characters remain safe. The scene introduces no construction timer, gameplay action or second rescue of the established cast.

## Exact historical completion records

Preserve both known complete boundaries. Each record has exactly the existing four top-level fields: `version`, `checkpoint`, `completed`, `acknowledgedScenes`. Its checkpoint is exactly `{ "kind": "complete" }` and its version is exactly `1`.

| Boundary | Exact ordered `completed` | Exact ordered `acknowledgedScenes` | Next pending scene |
| --- | --- | --- | --- |
| Historical two-cove completion | `holding-pier`, `bellwater` | `opening`, `another-bell` | `driftwood-light` |
| Historical three-cove completion | `holding-pier`, `bellwater`, `driftwood-yard` | `opening`, `another-bell`, `driftwood-light` | `a-wider-deck` |

Recognize these specific historical shapes deliberately. Do not accept arbitrary completed prefixes, unordered arrays, extra fields, missing acknowledgments or unknown identifiers. Appending Wide Berth must not invalidate the existing exact three-cove completion. Preserve the strict validation of ordinary pending-scene and current-cove records.

Construction, loading, Home, Options and Practice leave either historical record’s stored bytes untouched. Home offers Continue with an accurate new-content notice. Only deliberate Continue advances that boundary: retain its completed and acknowledged arrays, save the appropriate pending scene, and play that scene freshly. The two-cove record must visit Driftwood before the launch.

After that first continuation, restoring the pending scene uses the established final static recap. Repeated activation must not duplicate advancement or skip the cove. Storage failure retains usable in-memory progress with the existing honest persistence notice; it must not masquerade as a successful durable write.

Unsupported versions, inconsistent progress and malformed records remain invalid with their original stored bytes preserved. Retain the current replacement confirmation and independent Practice escape. Do not change the storage key, bump the version or silently rewrite unsupported data.

## Registry and presentation boundaries

Derive the preceding cove for a scene from the campaign registry or explicit registry metadata. Replace the current special case that selects Bellwater only for `driftwood-light` and Holding for other scenes. The launch’s preceding safe world is Driftwood’s Harbor. Opening retains its established starting presentation.

Likewise, resolve a historical complete record’s displayed cove from its actual completed boundary. Neither `checkpointCove()` nor complete restoration may blindly use the newest registry entry and portray Wide Berth as already rescued. Audit Home notices, continuation routing and restored Harbor presentation together.

Winning remains undoable until explicit Continue story accepts the rescue. Accepting Driftwood then earns the launch; scene playback, Next, Skip, Escape, replay and inspection never acknowledge it. Only **Continue to Wide Berth** acknowledges `a-wider-deck` once and enters the authored Wide Berth start. Preserve cancellation, recap, reduced-motion and shared audio ownership.

An exact current four-cove completion contains all four cove IDs and their four entry-scene IDs in registry order. Show **Four coves are safe.** as the available-content endpoint, with Home, Practice and Options. Do not imply the whole planned story has ended.

## Replay, evidence and continuity updates

Practice, direct `?cove=` entrances and old-cove replay retain their authored boat profiles. First Crossing and C1–C3 keep four spaces; Wide Berth uses six. These independent entries never migrate or overwrite journey progress. Cove-boundary saving remains explicit: unfinished crossings restart, and full mid-puzzle restoration remains future work.

Verify both historical completions, first fresh continuation, later recap restoration, current four-cove completion, strict invalid records, failed writes and Practice isolation. Exercise terminal Undo before acceptance and duplicate input around both new boundaries through the actual interface.

Update project continuity and canonical status using the identifiable implementation and evidence. Record the user’s acceptance of Driftwood gameplay without expanding it into hardware listening, device-matrix or unrelated visual approval. Reconcile stale Bellwater-only endpoint and asset-count prose against the current 78-family baseline. Keep source handoff, human acceptance and deployment status distinct.
