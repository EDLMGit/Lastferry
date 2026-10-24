# Last Ferry review — cove interface

## Disposition

**Ready for review: focused interface pass complete.** Freestanding names, endpoint markers, direct dock controls and the shared dark teal palette are implemented. The final build, 128 unit tests, eight interface/production/audio browser checks and three scene-picking checks pass. Both required phone sizes were inspected at native resolution. No unresolved blocking defect was found in the exercised states.

## Source and scope

- Repository: https://github.com/EDLMGit/Lastferry · [draft PR #1](https://github.com/EDLMGit/Lastferry/pull/1) · branch `m1-first-crossing`.
- Clean starting HEAD and explicit comparison base: `ab8ff33fb1471aacb0dd7a22acbf90be3a4b1db6`, whose wooden contacts the player accepted. No reset or newer-work overwrite.
- Task: [FOLLOWING_TASK_UI.md](../../FOLLOWING_TASK_UI.md). One semantic selector per place; separate endpoint ring and freestanding name; direct Board / Let ashore / Bring home previews; free inspection, explicit sailing, passenger subsets and complete Undo preserved.
- Final precommit source: **`70de9ba5c7591bb048876c595845060dc9f9ba1fb0ce3395b2bd39d5c93a27ec`**, 108 SHA-256 file hashes in [source-manifest.json](source-manifest.json). Evidence belongs to the recorded base plus this identified working tree. The final GitHub commit is reported separately in the PR/handoff.
- The eight-test run and its 25 screenshots retain original full-source hash `c2a5d5bdbd16104c753845a3b31a1e9129e6ff5788b84eabf60b6e1c0afa5220`. Only the older waypoint-picking test fixture changed afterward; [evidence-reuse.json](evidence-reuse.json) proves the runtime and other 107 files identical. The affected three tests passed against the final hash.
- [Preservation audit](preservation-audit.json): all audio modules, rules/session, levels/replays, transfer timeline, water, sailing motion and authoritative copy match the accepted base. Renderer change is only `World.project` accepting an optional height with its original default. Audio callbacks remain unchanged. No dependency or code comments added.

The private Site remains at **`ab8ff33fb1471aacb0dd7a22acbf90be3a4b1db6`**. This GitHub pass does not deploy it. Main remains `386de54d20fdd4a513a06115471d70bf94738cc0`; the PR stays draft.

## What changed

Names and small state rings share one native button and one Tab stop. Shape distinguishes current, selected, shallow, risky and remote stops; Harbor retains Home. Targets are 48px, with the close Bellwater pair using 44px at the short phone size. Dock launchers are available without selecting the current location, have directional arrows and open the existing subset/Confirm preview. Available directions remain separate. Flooded piers and transitions suppress them.

HUD, forecast, Menu, location card, passenger choices, preview and ending now use opaque-enough dark teal, ivory and warm borders. Modal presentation hides the underlying local card/dock while retaining selection. Cancelling restores the trigger. Names stay fixed through selection and tide; dock placement stays fixed while the ferry state is unchanged. The dismissal guard also blocks repeated pointer-down focus changes.

## Environment and reproduction

Windows; Node 24.15.0/npm 11.12.1; Vite 8.3.4; Playwright 1.64.1; Chromium 156.0.8078.4 with SwiftShader, DPR 1. Desktop 1440×900; touch-emulated 844×390 and 780×320, plus legacy picking 780×390. Existing dependencies/browser cache were reused; `npm ci` was not rerun.

```sh
npm ci
npm run dev
```

Open `/?cove=holding-pier`; Menu retains Bellwater and First Crossing. Production: `npm run build`, then `npm run preview`.

Final verification used live dev 5197 and rebuilt production 4185. PowerShell environment: `PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright`, `LAST_FERRY_DEV_PORT=5197`, `LAST_FERRY_PRODUCTION_PORT=4185`, `LAST_FERRY_REVIEW_DIR=reviews/cove-interface/final`.

The focused browser command was `npx playwright test tests/e2e/cove-interface.spec.ts tests/e2e/production.spec.ts tests/e2e/transfer-audio.spec.ts --config .cache/cove-interface-final.config.ts`. The temporary config imports `playwright.config.ts`, sets `testDir: '../tests/e2e'`, `webServer: []`, dev 5197 baseURL and review output paths. This reuses externally owned servers to avoid the previously observed Windows runner teardown stall. A fresh clone can run the same specs with the standard config and its automatically managed servers.

## Executed checks

| Check | Result | Actual observation |
| --- | --- | --- |
| `npm run build` / TypeScript | **pass** | [Build output](build-results.txt); production built. Existing >500kB chunk advisory remains. Fixture-only follow-up typecheck also passed. |
| `npm run test:unit` | **pass, 128/128 in 17 files** | [Actual command summary](unit-results.json). Existing gameplay, puzzle search, tide, complete Undo, audio and water checks plus three endpoint geometry cases. |
| Five new focused interface cases | **pass, 5/5** | Both phones complete Holding in 9 and Bellwater in 10 actions; desktop First Crossing completes through natural keyboard. Free name/marker inspection, blocked/remote reasons, stable targets, direct dock controls, subsets, tide Undo/replay, flooded departure, cancellation, repeated input and terminal Undo. |
| Existing production and transfer audio cases | **pass, 3/3** | Real production rescue without debug globals/external assets; normal/subset/partial delivery, tide Undo, mute, hidden recovery and reduced-motion lifecycle. [Eight-test output](final/browser-results.txt), [results](final/automation-results.json). |
| Existing actual scene picking | **pass, 3/3 after fixture correction** | Island, pier, lighthouse and ferry still require actual exposed canvas hits. Buoy verifies actual underlying waypoint and allows its own matching endpoint button. [Results](final/picking-corrected/automation-results.json). |
| Composited contrast | **pass at both phone sizes** | 237 checks across 11 actual UI states each. Minimum text 5.801:1; icons 7.280:1; focus 9.326:1; border/interior 4.207:1. Actual bright/dark canvas samples; [method/results](CONTRAST.md). |
| Native-size visual review | **pass for stated coverage** | 28 selected final screenshots; all essential text/targets, modal confirmation and Undo fit. [PHONE_QA.md](PHONE_QA.md), [capture manifest](capture-manifest.json). |
| Uninterrupted UI recording | **pass** | Final nine-action win with actual temporary unloading, tide Undo/replay and arrival. Both videos decode with ffmpeg exit0. Eight played wood contacts, one three-voice arrival, one context/scheduler, zero dropped score tones. [Recording summary](recording-summary.json). |
| Full historical browser suite / physical devices | **not run** | Focused affected checks only. No Android/browser-bar/cutout, Safari/Firefox, native GPU/performance, alternate platform-font or screen-reader speech claim. |

## Gameplay evidence

All selected images are actual WebGL game plus DOM controls. The [manifest](capture-manifest.json) records each image hash, time, viewport, source and input; no concept art is used as gameplay evidence.

| State | Selected paths under `reviews/cove-interface/final/` |
| --- | --- |
| Ordinary and dock controls | `holding-{844x390,780x320}-start-dock.png`, `bellwater-{844x390,780x320}-start.png` |
| Direct unloading preview | `holding-{844x390,780x320}-unload-preview.png` |
| Safe / shallow / remote inspection | `holding-{844x390,780x320}-{safe-travel,shallow,remote}.png` |
| Cancellation and passenger subsets | `holding-{844x390,780x320}-{cancel-restored,critical-subset}.png` |
| Bellwater both directions / critical boarding | `bellwater-{844x390,780x320}-{both-directions,critical-boarding}.png` |
| After rise and success | `holding-{844x390,780x320}-{flooded-departure,success}.png`, `bellwater-{844x390,780x320}-success.png` |
| Intermediate arrival / desktop | `holding-780x320-shallows-arrival.png`, `desktop-first-crossing.png` |

Local ignored recordings:

- `reviews/cove-interface/raw/recording/raw/holding-full-interface-silent.webm` — 31.88 s, whole interface, uninterrupted, silent.
- `reviews/cove-interface/raw/recording/raw/holding-runtime-audio.webm` —about 30.24 s, actual canvas and Web Audio master together, VP9/Opus 48kHz stereo. No replacement audio, gain normalization or time edits.

The recording includes one actual Undo/retry after the first unloading contact correctly missed its stale window, and a separate tide Undo/replay. These are visible play actions, not edited-out attempts. Raw media/verbose traces are unavailable in a fresh clone; compact results and selected screenshots are committed.

## Findings and resolutions

Original failures are retained in [development-results.json](development-results.json), original local runs, and [the older picking result](final/picking/automation-results.json).

- **UI-1, fixed:** whole-island/future-ferry exclusions pushed names across the cove and caused the 780×320 Harbor card to cover protected content. Revised placement restores clear association and measured card clearance.
- **UI-2, fixed:** free inspection moved the existing dock trigger. State-based cached placement passes the stationary-control check at both sizes.
- **UI-3, fixed:** a second Cancel tap blurred restored focus before the click guard. Pointer-down protection passes repeated cancellation and subsequent keyboard/touch actions.
- **Fixture corrections:** initial Holding checks matched hidden and modal requirement text; scoped to the open dialog. An anchored grep selected no tests once. The older phone buoy fixture required exposed canvas beneath the new endpoint control; only that same-waypoint condition was updated, and all three cases rerun. Viewport/touch/visible-content assertions were not weakened.

Intermediate arrival inspection found transparent padding of the Shallows name target sharing its own current-ferry context by 1.76px/9.65px at actions 2/5. The visible text/backing remains clear of the hull and rabbit ears; both targets inspect Shallows. This is not an overlap between unrelated controls. The exact bounds and selected screenshot are retained for review.

No confirmed defect remains in the exercised behavior. The historical independent water timeout and subsequent isolated pass remain in earlier reports; neither water code nor its timeout changed. Physical-phone presentation and subjective preference remain for the user's playtest. Commit/push and draft-PR metadata are the authorized final handoff; the private Site remains unchanged.
