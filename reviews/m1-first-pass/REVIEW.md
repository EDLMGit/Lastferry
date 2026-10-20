# Last Ferry review — m1-first-pass

## Disposition

**Ready for M1** within the stated Chromium coverage; submitted as a first pass for independent review. No confirmed remaining gameplay defects were found in the performed checks. This preparation changes review documentation only. Physical-device coverage and hardware performance remain unverified.

## Source and scope

- Repository: [EDLMGit/Lastferry](https://github.com/EDLMGit/Lastferry).
- Implementation branch: `m1-first-crossing`, created from the existing clean `main` checkout. No implementation branch previously existed locally or remotely.
- Reviewed implementation HEAD: **`c4c6f28d509d7c928157698c3a70f1336dfe9804`**.
- Comparison base: **`386de54d20fdd4a513a06115471d70bf94738cc0`**, verified `origin/main` at preparation. It contained only the initial README. No merge or force push is authorized or performed.
- Checkout: `C:/Users/ernes/Documents/last-ferry-codex-starter/Lastferry`. The completed game was originally in its parent directory, outside Git. It was copied into this existing checkout; original workspace files and local recordings were preserved.
- Working tree at fresh checks: imported implementation plus documentation, then recorded in the implementation commit above. The final review-packaging commit adds this report, its audit, and README/STATUS metadata; it changes no runtime, tests, level values, lockfile or screenshots. Its SHA is supplied in the PR/handoff because a commit cannot embed its own SHA.
- Capture source: **no commit yet** at original execution, source snapshot **2026-10-20T20:16:43.083Z**, SHA-256 **`3fbcb8c62bfd933a776cb1836d35430713943a6e6ff400c545146d6e74e7c0df`**. [Original source manifest](../m1/source-manifest.json), [capture manifest](../m1/capture-manifest.json), [original implementation review](../m1/REVIEW.md).
- Reuse proof: [evidence-reuse.json](evidence-reuse.json) verifies all **36 source files byte-for-byte against Git commit `c4c6f28…`**, all nine screenshot hashes, both local recording hashes, and identical compiled JS/CSS between the original and imported production builds. The earlier captures are not relabeled as captures made from a later commit.
- Scope implemented: one real 3D six-node cove; yellow ferry/red cabin; two rabbits and one sheep; lighthouse and piers; authoritative draft/depth/tide/flood logic; explicit previews and confirmation; passenger subsets; forecast, Wait, Undo and Restart; movement/boarding/tide/draft animation; reduced motion; persistent mute and generated sound; small arrival acknowledgment. No new chapter, progression, backend or publishing work.

## Environment

| Item | Actual value |
| --- | --- |
| OS / browser | Windows 11 Pro 10.0.26200 x64; Playwright headless Chromium 156.0.8078.4, SwiftShader WebGL 2 |
| Runtime / package manager | Node 24.15.0 / npm 11.12.1; Node 24 baseline and dependency lockfile retained |
| Desktop viewport / pixel ratio | 1440×900 CSS pixels / DPR 1 |
| Narrow landscape / pixel ratio | 844×390 CSS pixels / DPR 1 |
| Portrait | 390×844 CSS pixels, reduced motion |
| Input | Mouse, keyboard-only rescue, Chromium emulated mobile touch; no physical phone |
| Launch / capture | `npm run dev -- --port 5173`; `npm run serve:test`; `npm run test:e2e` drives the actual DOM/WebGL build and captures PNG/WebM |

The prior final browser run prestarted the two servers to avoid a Windows sandbox process-tree teardown stall. It subsequently exited normally. No new account, hosted recording service or runtime asset download is required.

## Executed checks

`pass` below distinguishes fresh preparation checks from retained matching evidence. Browser tests were **not rerun during this preparation**: the source and compiled assets are identical, so no affected browser check is missing. No tests were added in this packaging task.

| Check and command or steps | Result | Observation / evidence |
| --- | --- | --- |
| `npm ci` in the Git checkout | pass — fresh | 51 packages added, 52 audited, 0 vulnerabilities. |
| `npm run build` | pass — fresh | Production bundle built. Includes `npm run typecheck`, which exited 0. JS 604.14 kB raw / 157.72 kB gzip. |
| `npm run typecheck` | pass — fresh | Executed by the production build; no TypeScript errors. |
| `npm run test:unit` | pass — fresh | **16/16** tests in two files. All five supplied replays run against the independent application reducer. |
| Actual build launches and rescue completes | pass — reused | Nine successful browser tests include desktop deep-detour, touch and keyboard tide-wait rescues, and a production rescue. Each witness finishes on turn 7. [Browser results](../m1/automation-results.json). |
| Preview does not mutate state; commit matches preview | pass — reused | Free open/cancel/forecast; 4/4 load and draft-3 boarding preview; blocked depth-2 cut cannot commit. |
| Tide/deadline and depth/load boundaries | pass — fresh units + reused browser | Current-tide validation, exact equality, turn-4/turn-8 order, last-safe boarding, late arrival, flooded unloading and no later artificial deadline. |
| Undo restores state; animals conserved | pass — fresh units + reused browser | Full snapshot restoration, tide/boat/passenger positions, win/loss undo and Restart. |
| Replay and alternate action after undo | pass — reused | Undo a tide rise and repeat; undo flood loss and board safely; undo/repeat terminal delivery. |
| Touch commits once; desktop/narrow controls usable | pass — reused | Double-click/double-tap protection, animation lock, complete phone rescue; reviewed actual desktop/phone/portrait screenshots. |
| Interrupted presentation and accessibility paths | pass — reused | Visibility cancellation and stalled-animation fallback; labeled keyboard controls, reduced motion and persistent mute. |
| `npm run test:e2e` | pass — reused, not rerun | **9/9**, 0 unexpected, 0 skipped, 0 flaky, exit 0. Exact original start time: 2026-10-20T20:16:51.023Z; duration 109.035407 s. |
| Actual modeled ferry clearance | pass — fresh units | 1,212 sampled orientations/positions, all six edges in both directions, against land and main pier decks. This is not a continuous mathematical proof. |
| `node tools/verify-design.mjs` | pass — fresh, reference only | **32/32** checks; 502 canonical states and a seven-action shortest reference witness. This does not replace runtime tests. |
| Source, image, video and compiled-asset comparison | pass — fresh | [Machine-readable identity audit](evidence-reuse.json); all comparisons match. |
| `git diff --cached --check` on imported files | fail — nonfunctional supplied-reference whitespace | Existing trailing spaces in generated `references/first-cove-layout.svg`; preserved as supplied. The focused check excluding that SVG passes. No runtime changes were made to silence it. |
| Physical phones, Safari/Firefox, speaker listening, GPU/FPS measurements, first-time-player study | not run | Outside available verification coverage; no associated performance or enjoyment claim. |

## Captured gameplay

The PNGs are actual game captures from the original verified build. They are committed under `reviews/m1/` and reused here without copying or modifying the pixels. Capture times, viewport/input and SHA-256 hashes are retained in the original capture manifest and verified by the reuse audit.

| State | Path | What it demonstrates / limitations |
| --- | --- | --- |
| Normal play | [../m1/normal-play.png](../m1/normal-play.png) | Complete cove, ferry, two rabbits, waiting sheep, HUD and available actions; desktop 1440×900. |
| Loading preview | [../m1/loading-preview.png](../m1/loading-preview.png) | Proposed boarding, 4/4 spaces, draft 3 and cut blocked, before commitment. |
| After tide advances | [../m1/after-tide.png](../m1/after-tide.png) | Turn 4, tide 1, full boat at South buoy, shallow passages now depth 3. |
| Success | [../m1/success.png](../m1/success.png) | All three delivered at turn 7, empty hull lifted, arrival and success UI. |
| Phone landscape | [../m1/phone-loading-preview.png](../m1/phone-loading-preview.png) | 844×390 emulated touch; map, current load, preview, confirm and Undo accessible. |
| Additional coverage | [Phone success](../m1/phone-success.png), [portrait](../m1/portrait.png), [flood loss](../m1/flood-loss.png), [scene checkpoint](../m1/checkpoint-a.png) | Retained supporting captures. |
| Short gameplay recording | Desktop and phone WebM files, local paths below | Unedited runs covering preview, commit, tide rise, undo and rescue completion. Retained locally, not uploaded or committed because raw video is ignored. |

Local recordings (outside the Git checkout, intentionally preserved):

- `C:/Users/ernes/Documents/last-ferry-codex-starter/reviews/m1/raw/desktop-rescue.webm` — approximately 12 MB, 1440×900.
- `C:/Users/ernes/Documents/last-ferry-codex-starter/reviews/m1/raw/phone-rescue.webm` — approximately 3 MB, 844×390 emulated touch.

These recordings are available on this machine, not in a fresh clone. GitHub reviewers have the committed screenshots and manifests. `references/` contains separately labeled concept art and the authored schematic, never gameplay evidence or a runtime background.

Visual verification: **complete for the stated original screenshot coverage**, with exact source equivalence verified during preparation. No new visual approval by an independent reviewer is claimed.

## Findings

**No confirmed remaining gameplay defects in the checks performed.** The original report documents corrected pier-turn clipping and phone framing/HUD-scroll issues, with regression evidence. This handoff intentionally presents the completed first pass for independent review; subjective art direction and enjoyment remain review questions.

Known nonblocking issues: Vite warns about the conventional >500 kB Three.js chunk; the generated reference SVG contains trailing whitespace. Neither prevents install, typecheck, build or play.

## Remaining uncertainty and next action

- No unfinished M1 feature is known within the stated checks. Device/browser, audio listening and hardware-performance limitations remain as listed above.
- Run after clone: `git switch m1-first-crossing`, `npm ci`, `npm run dev`. Use Node 24. See [README](../../README.md) for Playwright browser installation and all check commands.
- Next action: independent review of this draft against `main`, using the committed report and actual gameplay captures. No merge into `main` or deployment is requested.
- GitHub action scope: push this implementation branch and create a **draft** PR only, as explicitly authorized. The final PR URL and final packaging SHA are reported in the handoff; no GitHub approval or review comment is submitted.
