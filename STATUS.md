# Last Ferry status

Updated: 2026-10-20

## Current state

**M1 first pass complete — prepared for independent review within the tested Chromium environment.** The independent reducer, complete 3D rescue loop, responsive controls, animation locks, sound and arrival are implemented. Results: 16/16 unit tests, 9/9 browser tests, typecheck and production build pass. See the current [first-pass review](reviews/m1-first-pass/REVIEW.md) and [evidence identity audit](reviews/m1-first-pass/evidence-reuse.json). No confirmed remaining gameplay defects in the performed checks.

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

Repository: https://github.com/EDLMGit/Lastferry. Branch: `m1-first-crossing`, created from clean `main` at `386de54d20fdd4a513a06115471d70bf94738cc0`. Implementation commit: `c4c6f28d509d7c928157698c3a70f1336dfe9804`. The final packaging commit adds review/README/STATUS metadata only; its full SHA and draft PR URL are supplied in the handoff. No merge, deployment or force push is authorized or performed.

Original capture source: **no commit yet** at capture, SHA-256 snapshot `3fbcb8c62bfd933a776cb1836d35430713943a6e6ff400c545146d6e74e7c0df`; see `reviews/m1/source-manifest.json`. Evidence remains attributed to that uncommitted snapshot. All 36 source files, all nine screenshots and both original local recordings were rehashed; the committed implementation and compiled JS/CSS match exactly. README/STATUS/review metadata are outside that source snapshot. See `reviews/m1-first-pass/evidence-reuse.json` for the comparison rather than relabeling earlier captures as later-commit captures.

Remaining coverage limits: touch is emulated Chromium; physical phones, Safari/Firefox, actual speaker listening, native GPU performance and first-time-player enjoyment remain unverified. Vite reports a >500 kB bundle advisory (604.14 kB raw / 157.72 kB gzip JS); build succeeds. These limitations are detailed in the review.

The packaged reference design was checked on 2026-10-20 with Node v24.19.0 using `node tools/verify-design.mjs --write-report`: **32/32 checks passed**. The bounded reference search processed **502 canonical states** within a 12-action horizon and found a **7-action shortest solution**. The three supplied rescue witnesses finish in 7, 7, and 8 actions. These are design-model results; no application, rendering, input, or performance result is implied.

## Implementation log

2026-10-20: Read the implementation contract and visually inspected first-crossing.png. No material rules contradiction found. Plan: independent rules/configuration → procedural 3D cove and controls → visual inspection and refinement → unit/browser verification and review evidence. Original procedural mesh families will supply production assets. This directory has no Git repository; final evidence will retain a source hash manifest (no commit yet). No remote actions planned.

2026-10-20, checkpoints A–C: Built and visually inspected the real scene; retained `reviews/m1/checkpoint-a.png` (refreshed with final checks). Implemented independent reducer/history and six-node controls. All five authored replays pass against the actual runtime; desktop detour and touch/keyboard tide-wait rescues finish in seven turns. Refined terrain, water, animal anchors, gangway traversal, draft response and low-island flooding. Full modeled-footprint checks found two pier clips during yaw; delayed turns until clear of the jetty, and all 1,212 sampled poses now pass. Phone framing was corrected after actual screenshot inspection. `npm ci` completed from the lockfile (51 packages added, 0 vulnerabilities). Final acceptance run follows.

2026-10-20, checkpoint D: Fixed a final phone success scroll issue after inspecting the real capture; added a browser assertion and repeated the affected verification/captures. Final `npm run build` (including typecheck), `npm run test:unit` (16/16), and `npm run test:e2e` (9/9, normal exit 0) pass. Reference check remains 32/32. Both development and production rescues are verified. Final source snapshot was retained before execution; finalization confirms it unchanged and records 9 screenshots plus two unedited local videos. Review and run instructions are complete. Stop at M1; no later chapters or publishing added.

2026-10-20, first-pass handoff preparation: Located the existing clean checkout in `Lastferry/` on `main`, verified its remote and created `m1-first-crossing` from the current initial commit. Imported the completed project without altering the original parent workspace. Fresh `npm ci`, production build/typecheck, 16/16 unit tests and 32/32 reference checks pass in the checkout. Reused the existing 9/9 browser result and captures after exact committed-source, media and production-bundle comparison; browser tests were not rerun during packaging because no runtime changed. Kept dependencies, cache, dist, disposable test outputs and raw recordings out of Git. Selected durable review JSON/PNG evidence is committed. The unfiltered Git whitespace check flags only existing trailing spaces in the supplied generated SVG; the focused check excluding it passes. Push and draft PR are the authorized remaining handoff actions.
