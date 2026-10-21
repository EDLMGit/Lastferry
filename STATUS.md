# Current milestone — The Holding Pier

**Playable experiment complete; ready for the discovery/satisfaction review.** Open `http://127.0.0.1:4175/?cove=holding-pier` (tested production server) or run the commands in README. First Crossing remains selectable as the baseline. No campaign expansion was added.

2026-10-21: Implemented the requested Stone–Shallows–Rabbit layout, sheep-first starting load and low-pier deadline using the existing deterministic rules and complete Undo. Safe travel takes one deliberate activation; optional free inspection, transfer subsets and confirmation remain. Height/deadline/depth cues expose the decision without displaying its solution. Session and renderer own their selected level; original first-cove data/replays are unchanged.

Verification: final build/typecheck and **20/20 unit tests pass**. Actual reducer search covers **154 canonical states**, shortest win **9**, **zero wins without unloading Moss at Stone**. Actual desktop, phone touch and natural keyboard rescues pass; both tempting alternatives lose at action 4; unloading, tide and terminal Undo pass. **19/19 browser checks** passed across both coves; after experiment-only presentation fixes, all **6/6 affected checks and captures** passed again on the final source. Initial phone confirmation clipping and arrival label overlap were fixed. Desktop chosen previews now replace the action list so Confirm fits fully.

Final evidence: **12 fresh gameplay PNGs and a 32.28-second uninterrupted local recording**, inspected at native size. See [review](reviews/holding-pier/REVIEW.md), [source manifest](reviews/holding-pier/source-manifest.json), [capture manifest](reviews/holding-pier/capture-manifest.json), and [regression reuse comparison](reviews/holding-pier/regression-reuse.json). Evidence was captured from clean starting HEAD `d07bcfd39b84b64031c8ce054e533f9ad8a9bed1` plus the then-uncommitted working tree on `m1-first-crossing`; final 43-file snapshot SHA-256 `69e49e5399eb36e95355e106659a862495fed651c33a8af6ed88d1a672334ad6`. Build output and the local recording remain ignored. The user has now authorized committing/pushing the experiment and updating draft PR #1; main remains unchanged. The capture-time identity is retained for provenance.

Remaining: a first-time player's judgment of discovery and enjoyment; physical-phone/Safari/Firefox/native-GPU/speaker coverage; existing Vite bundle-size advisory (613.29 kB raw JS / 160.18 kB gzip). No confirmed outstanding gameplay defect in performed checks. Stop here and evaluate the puzzle before expanding it.

## Historical M1 records

# Last Ferry status

Updated: 2026-10-20

## Current state

**M1.1 refinement complete for the stated Chromium coverage.** On reviewed baseline `c224fe07a1f4391ae481af4bab77b16d9b4322a3`, the phone camera now fits the full lighthouse and route envelope, characters have clearer silhouettes/spacing/contrast, and aboard passengers follow named anchors under the animated hull. Natural keyboard focus recovery is verified with real Tab/Shift+Tab, Enter and Escape. Final results: production build/typecheck, **16/16 unit tests**, **13/13 browser tests** pass. See the current [M1.1 review](reviews/m1-1/REVIEW.md), [source identity](reviews/m1-1/source-manifest.json) and [capture manifest](reviews/m1-1/capture-manifest.json). No known requested refinement remains incomplete within that coverage.

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

M1.1 tested source/capture commit: `16ebda11e908aa7234a38d6fc1d3f157ee97e72c`, compared with independently reviewed `c224fe07a1f4391ae481af4bab77b16d9b4322a3`. Snapshot covers 38 files, SHA-256 `e529fd441a651b73aa127d2cb99e5447a1975ae70f8888e79430776a3f860765`. Finalization confirms source unchanged. Evidence includes 15 fresh refined PNGs plus one explicitly labeled baseline comparison, three new unedited local recordings and one disclosed spatial close-up with no timeline cuts. Final packaging changes only README/STATUS/review artifacts; final SHA is supplied in the PR/handoff. Earlier M1 reports below are historical records and are not relabeled as refinement evidence.

Repository: https://github.com/EDLMGit/Lastferry. Branch: `m1-first-crossing`, created from clean `main` at `386de54d20fdd4a513a06115471d70bf94738cc0`. First-pass implementation commit: `c4c6f28d509d7c928157698c3a70f1336dfe9804`; M1.1 implementation is identified above. [Draft PR #1](https://github.com/EDLMGit/Lastferry/pull/1) is open against `main`. Evidence/report packaging changes metadata only; the final SHA is supplied in the PR/handoff. No merge, deployment or force push is authorized or performed.

Original capture source: **no commit yet** at capture, SHA-256 snapshot `3fbcb8c62bfd933a776cb1836d35430713943a6e6ff400c545146d6e74e7c0df`; see `reviews/m1/source-manifest.json`. Evidence remains attributed to that uncommitted snapshot. All 36 source files, all nine screenshots and both original local recordings were rehashed; the committed implementation and compiled JS/CSS match exactly. README/STATUS/review metadata are outside that source snapshot. See `reviews/m1-first-pass/evidence-reuse.json` for the comparison rather than relabeling earlier captures as later-commit captures.

Remaining coverage limits: touch is emulated Chromium; physical phones, Safari/Firefox, actual speaker listening, native GPU performance and first-time-player enjoyment remain unverified. Vite reports a >500 kB bundle advisory (M1.1: 606.84 kB raw / 158.58 kB gzip JS); build succeeds. These limitations are detailed in the review.

The packaged reference design was checked on 2026-10-20 with Node v24.19.0 using `node tools/verify-design.mjs --write-report`: **32/32 checks passed**. The bounded reference search processed **502 canonical states** within a 12-action horizon and found a **7-action shortest solution**. The three supplied rescue witnesses finish in 7, 7, and 8 actions. These are design-model results; no application, rendering, input, or performance result is implied.

## Implementation log

2026-10-20, M1.1: Confirmed clean local/remote branch at the independently reviewed baseline. Reproduced phone keyboard focus loss to BODY using only Tab and Enter. Refined phone composition and animal silhouettes together; actual phone bounds show a 10 px lighthouse margin and approximately 26/27/29 px passenger heights. Parent aboard animals to current visual deck anchors, preserving contact through draft interpolation and bobbing; detach only the boarding/unloading subset. Added natural keyboard and normal/reduced deck checks. Final committed-source run passes 16 unit and 13 browser tests, including actual desktop/touch/keyboard rescues, tide Undo, arrival, and production play. Normal sampling (67 frames) and reduced sampling (45 frames) show maximum local foot drift 4.44e-16; normal idle hull motion is observed and reduced idle motion is zero. Fresh captures inspected at native size; local full and magnified boarding/unloading clips retained. Gameplay reducer, level values, coordinates, timing, capacity, preview semantics and logical Undo are unchanged. Stop after this refinement; update existing draft PR #1 only.

2026-10-20: Read the implementation contract and visually inspected first-crossing.png. No material rules contradiction found. Plan: independent rules/configuration → procedural 3D cove and controls → visual inspection and refinement → unit/browser verification and review evidence. Original procedural mesh families will supply production assets. This directory has no Git repository; final evidence will retain a source hash manifest (no commit yet). No remote actions planned.

2026-10-20, checkpoints A–C: Built and visually inspected the real scene; retained `reviews/m1/checkpoint-a.png` (refreshed with final checks). Implemented independent reducer/history and six-node controls. All five authored replays pass against the actual runtime; desktop detour and touch/keyboard tide-wait rescues finish in seven turns. Refined terrain, water, animal anchors, gangway traversal, draft response and low-island flooding. Full modeled-footprint checks found two pier clips during yaw; delayed turns until clear of the jetty, and all 1,212 sampled poses now pass. Phone framing was corrected after actual screenshot inspection. `npm ci` completed from the lockfile (51 packages added, 0 vulnerabilities). Final acceptance run follows.

2026-10-20, checkpoint D: Fixed a final phone success scroll issue after inspecting the real capture; added a browser assertion and repeated the affected verification/captures. Final `npm run build` (including typecheck), `npm run test:unit` (16/16), and `npm run test:e2e` (9/9, normal exit 0) pass. Reference check remains 32/32. Both development and production rescues are verified. Final source snapshot was retained before execution; finalization confirms it unchanged and records 9 screenshots plus two unedited local videos. Review and run instructions are complete. Stop at M1; no later chapters or publishing added.

2026-10-20, first-pass handoff preparation: Located the existing clean checkout in `Lastferry/` on `main`, verified its remote and created `m1-first-crossing` from the current initial commit. Imported the completed project without altering the original parent workspace. Fresh `npm ci`, production build/typecheck, 16/16 unit tests and 32/32 reference checks pass in the checkout. Reused the existing 9/9 browser result and captures after exact committed-source, media and production-bundle comparison; browser tests were not rerun during packaging because no runtime changed. Kept dependencies, cache, dist, disposable test outputs and raw recordings out of Git. Selected durable review JSON/PNG evidence is committed. The unfiltered Git whitespace check flags only existing trailing spaces in the supplied generated SVG; the focused check excluding it passes. The branch was pushed and draft PR #1 created against `main`; remote/local SHA equality and unchanged `main` were verified. A final documentation-only commit records that handoff; no runtime changed and no merge, force push or deployment occurred.

## Holding Pier experiment — completed for player review

2026-10-21: Starting from clean `m1-first-crossing` at `d07bcfd39b84b64031c8ce054e533f9ad8a9bed1`. Added a separate authored four-node cove and session-owned level selection; First Crossing remains available. Implemented direct safe travel with optional free inspection, explicit transfer/Wait previews, data-derived hazard/depth information and full existing Undo. Completed focused verification and fresh gameplay evidence; final results are recorded above. This experiment tests temporary passenger holding; player enjoyment is not yet established. No remote actions planned for this experiment.
