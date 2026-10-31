# Last Ferry review — Holding Pier navigation pass

## Disposition

**Ready for review within the stated Chromium coverage.** The accepted Holding Pier puzzle is retained. This pass makes destinations, blocked passages, passenger actions and immediate tide consequences explicit, and improves landscape phone controls. The production build/typecheck, all 26 unit checks and all 22 browser checks pass on the final pinned source. Seventeen selected gameplay screenshots were inspected at native size. No confirmed blocker remains within this coverage.

## Source and scope

- Repository: https://github.com/EDLMGit/Lastferry
- Existing draft PR: https://github.com/EDLMGit/Lastferry/pull/1; branch `m1-first-crossing`.
- Reviewed starting HEAD and comparison base: `7e37214c3a06b224a6e2449f3216c15f9079b4bc`, the user-specified reviewed revision. The branch was clean at this commit; no newer user work was present.
- PR base remains `main` at `386de54d20fdd4a513a06115471d70bf94738cc0`.
- Execution/capture source: starting HEAD plus the uncommitted runtime and test changes retained in [tested-changes.patch](tested-changes.patch). The [46-file source manifest](source-manifest.json) pins source, dependencies, tests, authored data and instructions: SHA-256 `43eba503a9cbc1bdc62249a2f23299c76563c821db9084b1e252003f5f6c76f5`. Capture identity is the precommit working tree, not a later commit.
- Scope: consistent named map controls, exact passage highlighting, touch inspection, direct safe sailing, immediate-loss confirmation, plain rule/status wording, contextual passenger actions, keyboard recovery and landscape layout. First Crossing stays available.
- No changes to either level JSON, topology, coordinates, passenger costs, capacity/draft bands, tide timing, event order, reducer, session history, ferry/passenger/island/lighthouse models, dependency versions or lockfile. Existing comments in touched code were removed; no code comments were added.

## Environment

| Item | Actual value |
| --- | --- |
| OS / browser | Windows 11 Pro, Chromium 156.0.8078.4, headless Playwright 1.64.1 |
| Rendering | SwiftShader software WebGL 2.0; no native GPU performance claim |
| Runtime | Node 24.15.0, npm 11.12.1; existing locked dependencies |
| Viewports | Desktop 1440×900; phone landscape 844×390 and 780×390; DPR 1 |
| Input | Real browser mouse and Tab/Shift+Tab/Enter/Escape/Space events; Chromium touch emulation for phone navigation |
| Servers | `npm run dev -- --port 5176`; `npm run preview -- --port 4176` after the production build |
| Evidence | Playwright PNG screenshots and one uninterrupted WebM from actual WebGL gameplay; no concept art used as evidence |

## What changed

Map buttons and panel controls share the names Harbor, Stone Pier, Shallows and Rabbit Pier, with explicit “Sail to …” actions. Current, adjacent available, adjacent too-shallow and nonadjacent stops have distinct words and symbols; rendered markers also differ in shape. Hover, natural keyboard focus and free Inspect highlight exactly one connecting passage and its destination. Touch users have visible status and separate Inspect controls. Immediately losing destinations show a flood warning and require confirmation. Clicking the current stop or boat does not offer an invalid move. Safe sailing remains one activation across one edge.

Local passenger actions sit under the current location before travel choices. “Let Moss ashore” names the passenger, waiting location and safety; transfer subsets remain selectable. Pure presentation functions derive boat depth, deadlines, event-order explanations, losses and current passenger facts from actual state and preview results. The critical two-rabbit preview says that boarding happens before the rise and both are safe aboard; a one-rabbit selection names the rabbit left to flood. After rescue, obsolete danger emphasis gives way to current passenger facts, and the forecast describes the flooded empty pier. Loss recovery explicitly permits undoing earlier moves or restarting.

Landscape phones retain a majority of the width for the scene and readable map targets. Essential control text is at least 14px; interactive targets are at least 44px. The initial unloading action is fully visible. Selected previews reserve room for confirmation; phone passenger choices use a compact single line. The redundant panel location heading is hidden during a phone preview while the current stop remains labeled on the map. Secondary result details scroll below the complete consequence; normal controls scroll to Wait, forecast, detailed rules and cove selection.

## Executed checks

| Check / command | Result | Actual observation |
| --- | --- | --- |
| `npm run build` | **pass** | Includes `npm run typecheck`; production build succeeds. JS 620.10 kB raw / 162.11 kB gzip; existing >500 kB bundle advisory remains. |
| `npm run test:unit` | **pass, 26/26** | Existing reducer/replays/history/clearance tests plus six new state-derived presentation checks. |
| `npm run test:e2e` | **pass, 22/22** | Final pinned-source full suite: all 19 prior checks and three new navigation checks; 0 failed, 0 skipped, 0 flaky, normal exit 0. |
| Actual nine-action rescue | **pass** | Desktop, both emulated phone widths, natural keyboard, and production UI; no state injection. |
| Losing alternatives / holding necessity | **pass** | Actual reducer search: 154 canonical states, shortest win 9, zero wins without temporary unloading at Stone. Both home-first and four waits lose at action 4. |
| Named map controls / free inspection | **pass** | Actual mouse/touch/keyboard activation, current stop/boat clicks, nonadjacent and blocked explanations, exact edge/destination highlight. |
| Preview / subsets / Undo | **pass** | No mutation while inspecting, selected-passenger loss, safe boarding across rise, unloading/tide/terminal Undo, replay and continuation. |
| Phone layout | **pass** | Full ancestor-clipping checks, not only viewport intersection: 44px targets, ≥14px essential text, complete safe and subset-loss consequence, confirmation and Undo. |
| Original First Crossing after shared changes | **pass** | Desktop/touch/keyboard rescues, depth restrictions, tide wait, full deck attachment with idle bobbing/reduced motion and complete Undo. |
| Fresh `npm ci` / separate reference design verifier | **not run this pass** | Dependencies and authoritative rules are unchanged. Actual implementation checks are the primary evidence; earlier reference results remain historical. |
| Physical phones / Safari / Firefox / native GPU / speaker listening | **not run** | Chromium emulation and software rendering only. |

Exact final commands, results and coverage are in [verification-summary.json](verification-summary.json); browser assertions are in [automation-results.json](automation-results.json), state traces in [ui-witness.json](ui-witness.json), and exhaustive reducer results in [reachability.json](reachability.json). [build-manifest.json](build-manifest.json) identifies the disposable production artifacts without versioning them.

PowerShell execution used:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Split-Path $PWD) '.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT = '5176'
$env:LAST_FERRY_PRODUCTION_PORT = '4176'
$env:LAST_FERRY_REVIEW_DIR = 'reviews/navigation'
node tools/snapshot-evidence.mjs --review-dir reviews/navigation --base 7e37214c3a06b224a6e2449f3216c15f9079b4bc
npm run build
npm run test:unit
npm run test:e2e
node tools/snapshot-evidence.mjs --review-dir reviews/navigation --finalize
```

The parent browser cache is an environment-specific reuse of the installed browser. A fresh checkout uses the project-local browser-install commands in README instead. No dependency reinstall was needed for this UI pass.

## Captured gameplay

Seventeen screenshots are selected from the final source run. Exact capture times, pixel sizes, hashes, input modes and source identity belong to [capture-manifest.json](capture-manifest.json). Each image is an actual gameplay render and is inspected at native size.

| State | Paths in this directory | Demonstrates |
| --- | --- | --- |
| Start | `desktop-navigation-start.png`, `phone-navigation-start.png`, `phone-narrow-navigation-start.png` | Current location, named stop states, initial unloading action, depth and deadline. |
| Route inspection | `desktop-navigation-route-inspection.png`, `phone-navigation-route-inspection.png`, `phone-narrow-navigation-route-inspection.png` | Exact highlighted passage/destination, direct depth comparison, free blocked inspection. |
| Critical boarding | `desktop-navigation-critical-boarding.png`, `phone-navigation-critical-boarding.png`, `phone-narrow-navigation-critical-boarding.png` | Real selected rabbits, resulting boat depth, boarding-before-rise order, safe outcome, confirmation fit. |
| After rise | `desktop-navigation-after-rise.png`, `phone-navigation-after-rise.png`, `phone-narrow-navigation-after-rise.png` | Tide 1, both rabbits aboard, Moss waiting safely, flooded pier and next passage. |
| Subset loss warning | `phone-navigation-subset-warning.png`, `phone-narrow-navigation-subset-warning.png` | Entire one-rabbit loss consequence fits above confirmation; map also warns about the immediately losing departure. |
| Success | `desktop-navigation-success.png`, `phone-navigation-success.png` | Actual delivery at action 9 and accessible terminal Undo. |
| Original baseline | `phone-loading.png` | First Crossing loading preview after shared UI changes. |
| Uninterrupted recording | `raw/uninterrupted-rescue.webm` (local, ignored) | One actual desktop session: blocked inspection, temporary unloading, both shallow stops, rabbit boarding, tide rises, sheep retrieval and arrival. Undo is tested separately. |

Raw video is retained locally rather than added to Git history. The available GitHub integration cannot upload attachments; remote reviewers have committed screenshots, manifests and state witnesses. The recording is not cut, sped up, spliced or driven by state injection. The 29.44-second silent VP9 recording is 1440×900 at 25fps. Native-size decoded samples at 2, 8, 16 and 29 seconds were inspected; its hash and encoding are recorded in [video-inspection.json](video-inspection.json) and the capture manifest.

## Findings and resolutions

1. **P2 — Phone preview hid the conclusion of a subset-loss warning.** At action 3, Board → deselect Rue. An independent 844×390 check showed the warning extending beneath its scroll viewport while Confirm remained visible. Resolved by reclaiming the duplicate phone location heading and compacting passenger chips while retaining ≥14px text and 44px targets. Both 844 and 780 independent rechecks show the entire safe and losing consequences inside all clipping ancestors; Confirm remains 44px high and fully visible. The navigation test now asserts consequence clipping as well as text presence and button fit.
2. **P3 — Map omitted the panel's immediate flood warning.** At that boundary, the map previously called Shallows merely available while the panel warned of flooding. Both already required confirmation. Resolved with explicit map “Flood warning · inspect” text and `!`, plus a real map-activation check confirming free inspection and unchanged state.
3. Initial implementation checks also caught overlapping phone labels and a clipped Confirm button. Labels were separated without changing authored coordinates, and the preview grid now reserves a confirmation row. The final viewport assertions retain full intersection, ancestor clipping, minimum target and font checks.

No confirmed outstanding gameplay defect in the checks performed. The staged source equality and screenshot audit is retained in [packaging-audit.json](packaging-audit.json). The committed source and images are compared again before the authorized branch push. Earlier exploratory results and captures are not presented as final-source evidence.

## Remaining uncertainty and next action

Physical phones, other browser engines, different platform fonts, screen-reader speech output, speaker listening and native GPU performance are outside this environment. Normal phone controls and secondary preview result details may scroll; primary passenger controls, complete safety/loss consequences, confirmation and Undo are checked at both landscape widths. The existing bundle advisory remains. Whether the clearer presentation improves discovery is a player review question; the accepted puzzle and hidden developer solution are retained.

Install/run with Node 24:

```sh
npm ci
npm run dev
```

Open `/?cove=holding-pier` at the printed local URL; `/` or `/?cove=first-crossing` opens the baseline. For production use `npm run build`, then `npm run preview`. This pass ends after verification and updating the existing draft PR; main is not merged or changed.

## Git handoff

The final commit SHA and remote-tip verification are recorded in draft PR #1 and the handoff response. This report deliberately retains the original precommit capture identity. Only source, tests, documentation and selected evidence are committed; installed dependencies, local configuration, build/test caches and raw video remain excluded. The authorized update is a normal push of `m1-first-crossing` and a draft PR description update. Main remains at the recorded base, with no merge or force push.
