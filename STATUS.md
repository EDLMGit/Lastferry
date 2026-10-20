# Last Ferry status

Updated: 2026-10-20

## Current state

**M1 complete — ready for M1 within the tested Chromium environment.** The independent reducer, complete 3D rescue loop, responsive controls, animation locks, sound and arrival are implemented. Final results: 16/16 unit tests, 9/9 browser tests, typecheck and production build pass. Actual desktop/phone/portrait captures and unedited recordings accompany the [review](reviews/m1/REVIEW.md). No confirmed remaining defects in the performed checks.

## Scope

M1: one complete playable tutorial cove, The First Crossing. See `FIRST_TASK.md`.

## Progress

- [x] Product direction and concept references established.
- [x] First-cove rules and level parameters specified.
- [x] Independent design validation supplied; see the checked report in `docs/validation/`.
- [x] Actual application rules and project configuration implemented.
- [x] Real 3D cove and complete player interactions implemented.
- [x] Presentation, sound, accessibility, and arrival moment refined.
- [x] Actual game tests, captures, and review report completed.

## Decisions to preserve

Finite authored experience; one cove in M1; browser-first TypeScript/Vite/Three.js; no live AI requirement. Four passenger spaces. Turns advance only on committed valid actions. Exact first-cove rules are owned by the rules document and JSON level.

## Current review

No GitHub repository/branch/commit has been supplied for this package. No remote review automation or publishing is configured.

Implemented source: **no commit yet**, SHA-256 snapshot `3fbcb8c62bfd933a776cb1836d35430713943a6e6ff400c545146d6e74e7c0df`; see `reviews/m1/source-manifest.json`. Evidence belongs to that uncommitted snapshot. README/STATUS/review metadata are excluded from the implementation hash. No remote actions or publication occurred.

Remaining coverage limits: touch is emulated Chromium; physical phones, Safari/Firefox, actual speaker listening, native GPU performance and first-time-player enjoyment remain unverified. Vite reports a >500 kB bundle advisory (604.14 kB raw / 157.72 kB gzip JS); build succeeds. These limitations are detailed in the review.

The packaged reference design was checked on 2026-10-20 with Node v24.19.0 using `node tools/verify-design.mjs --write-report`: **32/32 checks passed**. The bounded reference search processed **502 canonical states** within a 12-action horizon and found a **7-action shortest solution**. The three supplied rescue witnesses finish in 7, 7, and 8 actions. These are design-model results; no application, rendering, input, or performance result is implied.

## Implementation log

2026-10-20: Read the implementation contract and visually inspected first-crossing.png. No material rules contradiction found. Plan: independent rules/configuration → procedural 3D cove and controls → visual inspection and refinement → unit/browser verification and review evidence. Original procedural mesh families will supply production assets. This directory has no Git repository; final evidence will retain a source hash manifest (no commit yet). No remote actions planned.

2026-10-20, checkpoints A–C: Built and visually inspected the real scene; retained `reviews/m1/checkpoint-a.png` (refreshed with final checks). Implemented independent reducer/history and six-node controls. All five authored replays pass against the actual runtime; desktop detour and touch/keyboard tide-wait rescues finish in seven turns. Refined terrain, water, animal anchors, gangway traversal, draft response and low-island flooding. Full modeled-footprint checks found two pier clips during yaw; delayed turns until clear of the jetty, and all 1,212 sampled poses now pass. Phone framing was corrected after actual screenshot inspection. `npm ci` completed from the lockfile (51 packages added, 0 vulnerabilities). Final acceptance run follows.

2026-10-20, checkpoint D: Fixed a final phone success scroll issue after inspecting the real capture; added a browser assertion and repeated the affected verification/captures. Final `npm run build` (including typecheck), `npm run test:unit` (16/16), and `npm run test:e2e` (9/9, normal exit 0) pass. Reference check remains 32/32. Both development and production rescues are verified. Final source snapshot was retained before execution; finalization confirms it unchanged and records 9 screenshots plus two unedited local videos. Review and run instructions are complete. Stop at M1; no later chapters or publishing added.
