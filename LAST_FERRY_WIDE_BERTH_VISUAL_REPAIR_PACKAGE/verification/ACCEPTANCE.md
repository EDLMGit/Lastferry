# Visual repair — acceptance and evidence

Complete these checks against the actual final implementation. The goal is a visible correction with preserved behavior; a larger test/screenshot count is not an acceptance criterion.

## 1. Inspect the actual composition before final packaging

At native **390×844** and **780×320**, use normal released Play and Whole-cove controls. Also fit-check **320×740**, **844×390**, **1440×900** and the user's approximately **1782×1225** desktop aspect. Do not hide problems with a developer-only close camera or a cropped capture.

Use matched baseline/final state pairs where practical. For geometry changes, matching means the same gameplay state, viewport and camera mode; report intentional framing changes. A contact sheet may help internal comparison but does not replace full native frames.

| Concern | Required actual states | Visual acceptance |
| --- | --- | --- |
| Ferry proportion | Empty, four bodies/six spaces, five bodies/six spaces; both berth headings | Recognizable yellow/red ferry with a substantial cabin, shaped hull and purposeful deck; no huge vacant tray |
| Animal visibility | Aboard and nearby waiting groups, current/selected/focused marker | Every present body countable and species recognizable in Play; no UI disk, routine button, cabin/rail or label covering head silhouettes |
| Shore arrangement | Initial groups, all six at High Quay, all six delivered | Supported compact groups with a clear path; no obligatory long sparse line across the whole island |
| Pier/bridge | Each landing, idle and mid-transfer | Closely fitted boards or coherent stone, modest supported landing, credible short connection; no ladder gaps or long plain orange strip |
| Cove composition | Released Overview on both phone orientations and desktop | Four distinct actual outlines/edge treatments; occupied shores and shallow/deep alternatives apparent |
| Water/contact | Draft four, both rises, moving/full ferry and return | Hull/deck/gangway contact coherent; wake attaches to corrected hull then releases independently; no shoreline fill across intended water |
| Launch | Beginning, release, mid-glide, endpoint at both phone orientations | Continuous believable dock/water/boat relation; Nell's feet on quay and clear of roof throughout; corrected boat recognizable |
| Layout recovery | Natural portrait/landscape rotation, Play/Overview/pan/Back to boat | Readable stable anchors and nearby controls; no accidental UI commitment, head-covering cue or off-screen essential controls |

For each concern, record an observation and frame path. “Native images inspected” alone is insufficient. A failing visible criterion remains a defect even if functional tests pass.

## 2. Keep real safety while replacing misleading tests

Replace the greater-than-twice-width/length test with actual legal occupancy, dry contact, safe transfers and visual scale evidence. Replace pier-rectangle-only support with actual authored walkable land/quay/pier support. Record why those old predicates were inappropriate.

Keep the following guarantees:

- All 59 capacity-legal memberships and all legal transfer selections; four rabbits, either/both sheep, five bodies/six spaces.
- Stable identity through input reordering, subsets, animation, Undo and reload/restart. Remaining occupants do not snap or teleport.
- Body/roof/cabin/rail/stationary-passenger clearance using actual production geometry and placement/path helpers.
- Real land support for reachable waiting/delivered populations, including six at High Quay and six delivered at Harbor.
- Both supported berth orientations, relevant tides/drafts, intermediate transfer frames and the existing winning-arrival boundary.
- Actual corrected hull and protrusions swept along smoothed courses in both directions and reachable headings. Keep the authored .45 route-clearance requirement; no old reference-radius proxy as the proof.
- Fitted deck coverage, credible gate-to-bridge endpoints, waterline and wake contact. If islands become concave, valid top triangulation/masks with no painted ground across water.
- Original four-space profile and old level data remain intact.

Do not weaken real collision/support tolerances to accommodate prettier geometry. Reauthor geometry/routes until safety and visual goals both hold.

## 3. Preserve game and interface behavior

Compare actual non-spatial Wide Berth data to `mechanics-before.json`. Original four level JSONs retain their reviewed Git blobs. Both 13-/14-action strategies, five-body17 and opening-slack16 witnesses retain their outcomes. Reuse current mechanics tests and meaningful new presentation checks; avoid a second surrogate game implementation.

Complete both main rescues through actual controls after the spatial changes. Exercise the reachable five-body and six-ashore arrangements, partial unloading/reboarding, one losing subset correction, tide Undo and terminal Undo. Preserve one action per group, current-tide validation and free inspection/rejection.

Check the corrected visible marker with natural keyboard/touch, current/selected/focused states, both berth headings and idle bobbing. Accessible target remains at least44px, endpoint semantics stay truthful, focus survives cancellation and the subset chooser stays near its initiating action. Representative old-cove checks cover shared-helper changes.

Preserve existing Sound/mute intent, accepted music/contact/victory behavior, sailing policy and water. Do not introduce global timing changes to solve new physical layout.

## 4. Launch and continuity

Keep scene ID, duration8000ms, caption cue1050ms, water cue3500ms and exact caption. Check immediate final handoff, Pause/Resume, Skip without acknowledgment, Replay, Reduced Motion, transcript, restored recap and background/mute behavior.

Actual launch evidence must include an uninterrupted excerpt or a real source-indexed sequence across all four beats. Preserve historical2/3 completion continuation, current4 endpoint, deliberate acknowledgment, Practice isolation and terminal Undo boundaries. Run affected continuity checks if shared composition/player code changes.

## 5. Final gates and concise handoff

Run production build, TypeScript, unit suite, asset validation and focused affected browser coverage. Keep all79 previous asset IDs, with updated actual gallery/provenance for revised families. Do not repeat the entire historical browser matrix without a concrete reason.

Retain one uninterrupted actual launch/transfer/rescue sequence, including runtime audio where the existing recorder supports it. Preserve actual levels, timestamps and source identity. Label local-only media honestly and provide representative native frames. Record software-renderer stalls separately from physical-phone performance.

The report under `reviews/wide-berth-visual-repair/` should include:

- Exact source SHA and mechanical/protected-source comparison.
- The issue-by-issue observation/frame matrix above.
- Original failed checks, actual corrections and final focused results.
- Honest unresolved layout/timing/device/audio limits.
- Draft PR status, remote equality and unchanged main; no deployment.

A source/geometry pass establishes technical correctness. Codex's native-frame inspection establishes the stated observations. The user's next playtest establishes human visual acceptance; do not conflate them.
