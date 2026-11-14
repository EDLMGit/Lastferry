# Last Ferry review — full-width cove and contextual controls

## Disposition

**Ready for the contextual interface review within the stated Chromium coverage.** The permanent sidebar and its parallel travel list are replaced by a full-width cove, compact state controls, nearby passenger actions and one native contextual dialog at a time. Holding Pier remains the introductory puzzle; First Crossing remains available. Production build/typecheck, all 28 unit checks and all 22 browser checks pass. Nineteen selected actual gameplay screenshots and native recording samples were inspected; no confirmed blocker remains in the requested coverage.

## Source and scope

- Repository: https://github.com/EDLMGit/Lastferry; existing draft PR: https://github.com/EDLMGit/Lastferry/pull/1; branch `m1-first-crossing`.
- Reviewed starting HEAD / comparison base: `95f4ca4b49c65e37414d02c6186774ebf275808c`, specified by NEXT_TASK and confirmed clean against the fetched remote. No newer user work was present.
- PR base remains `main` at `386de54d20fdd4a513a06115471d70bf94738cc0`.
- Evidence source: starting HEAD plus the identified uncommitted changes in [tested-changes.patch](tested-changes.patch). The [48-file manifest](source-manifest.json) pins runtime, tests, dependencies, authored data, instructions and NEXT_TASK: SHA-256 `faa52719f5ee809c07ff4cc42f136ff9cb2c3ad687e19c3844b54fac07c39420`.
- The task was supplied in the parent workspace; an unchanged copy is retained at repository `NEXT_TASK.md`. Parent files and historical evidence remain untouched.
- No changes to level JSON, topology, authored positions, passenger costs, capacity/draft bands, action cost, tide schedule, reducer event order, preview calculation, session Undo, ferry/passenger models, dependency versions or lockfile.
- Interaction decision: the new task's one-activation safe sailing applies consistently to both coves. This supersedes the baseline's former mandatory movement confirmation, as explicitly recorded in `docs/GAMEPLAY_RULES.md`; free previews, one-edge commits, invalid-action rejection and immediate-loss confirmation remain.
- Source and screenshots are compared with the staged and committed files before the normal branch push. The final commit SHA is provided in the PR/handoff; precommit captures retain their actual identity.

## Implementation

The scene uses the full viewport width. Fixed orthographic framing fits the lighthouse, passengers and route envelope; baseline phone elevation is adjusted to 45 degrees to preserve passenger readability. Named map targets retain current/available/too-shallow/nonadjacent/flood-warning states, with a separate visible Inspect button for every adjacent stop. Focus, hover and inspection highlight the exact passage. Phone baseline labels use short callout lines to their markers; authored coordinates are unchanged. Current buoy labels are kept beside the boat, and empty local-action cards are removed.

The compact HUD shows the state-derived objective, Home progress, depth/load, action count and tide. Undo and Wait with its one-action cost are direct controls. The deadline/passenger-status button opens the actual forecast. Local Board/Let ashore/Bring home actions sit near the ferry on desktop and in a bottom strip on landscape phones. Current ferry/pier activation focuses these local actions without spending time.

A single native HTML dialog handles transfer, passage inspection, Wait, forecast, Menu and endings. Transfers include supported subsets, resulting boat load/depth, exact consequence, event order and one confirmation. There is one inspection label. Menu contains Restart, Sound, cove selection and detailed help. Native modality, handler guards and a Tab/Shift+Tab cycle prevent background actions; Escape/close restores a valid focus target. Subset updates retain focus; commits restore focus after the existing animation lock. Terminal cards provide their own directly reachable Undo/Restart, and can be dismissed without changing outcome. Repeated closing input cannot activate a passage underneath; a deliberate different Inspect target remains usable.

## Environment

| Item | Actual value |
| --- | --- |
| OS / browser | Windows 11 Pro, Chromium 156.0.8078.4 via Playwright 1.64.1 |
| Renderer | SwiftShader WebGL 2.0; no physical-device or native-GPU performance claim |
| Runtime | Node 24.15.0 / npm 11.12.1; existing locked dependencies |
| Viewports | 1440×900 desktop; 844×390 and 780×390 landscape phones; DPR 1 |
| Input | Browser mouse, natural Tab/Shift+Tab/Enter/Escape/Space; Chromium touch emulation on phone cases |
| Servers | `npm run dev -- --port 5177`; production `npm run preview -- --port 4177` after build |
| Capture | Playwright PNGs of actual WebGL gameplay; continuous local WebM; decoded native-size video samples |

## Executed checks

| Check | Result | Observation |
| --- | --- | --- |
| `npm run build` | **pass** | Includes TypeScript checking. JS 623.91 kB raw / 163.32 kB gzip; existing >500 kB advisory. |
| `npm run test:unit` | **pass, 28/28** | Existing simulation/replays/history/clearance and presentation checks, plus two new objective/progress checks. |
| `npm run test:e2e` | **pass,22/22** | All 22 migrated checks on final pinned source, including focused modal/background and viewport coverage; 0 failed, 0 skipped, 0 flaky, exit 0. |
| Both playable coves / nine-action rescue | **pass** | Actual controls, baseline detour/tide-wait and Holding Pier rescue; production has no debug global or external assets. |
| Holding Pier alternatives and necessity | **pass** | Actual reducer search: 154 canonical states, shortest win 9, zero wins bypassing temporary unloading. Home-first and waiting lose at action 4. |
| Readonly previews / subsets / complete Undo | **pass** | Inspection/cancel conserve state/history; subset loss and safe boarding agree with commit; unloading, tide and terminal Undo restore all passengers and outcome. |
| Modal accessibility and input safety | **pass** | Initial focus, Tab/Shift+Tab wrap, Escape/Cancel restoration, background physical and handler-triggered input, repeat-close point, transition and double-touch guard. |
| Migrated secondary functions | **pass** | Wait preview, forecast, help, Restart, Sound persistence and cove selection through the actual controls. |
| Layout / native-size gameplay | **pass** | Full-width canvas, no sidebar, ≥14px essential text, ≥44px targets, complete consequence/confirmation inside viewport and every clipping ancestor. |
| Fresh `npm ci` / separate reference model | **not run this pass** | Lockfile and mathematical rules unchanged; actual implementation unit/browser checks are primary evidence. |
| Physical devices / other engines / speaker listening / screen reader speech | **not run** | Chromium emulation/software rendering only. |

Browser assertions and exact totals are in [automation-results.json](automation-results.json), the compact results in [verification-summary.json](verification-summary.json), actual nine-action trace in [ui-witness.json](ui-witness.json), reducer search in [reachability.json](reachability.json), and disposable production hashes in [build-manifest.json](build-manifest.json). The tests were migrated to real map/Menu/dialog controls without relaxing state, conservation, clipping, font or touch-target assertions. Modal focus and background checks were added to the three viewport cases.

PowerShell commands used:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Split-Path $PWD) '.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT = '5177'
$env:LAST_FERRY_PRODUCTION_PORT = '4177'
$env:LAST_FERRY_REVIEW_DIR = 'reviews/contextual'
node tools/snapshot-evidence.mjs --review-dir reviews/contextual --base 95f4ca4b49c65e37414d02c6186774ebf275808c
npm run build
npm run test:unit
npm run test:e2e
node tools/snapshot-evidence.mjs --review-dir reviews/contextual --finalize
```

The browser cache path is specific to this workspace. Fresh checkouts use the project-local installation instructions in README. Intermediate browser runs during live UI edits were exploratory; HMR resets made some intermediate results inconclusive. They are not reused or represented as final-source verification.

## Actual gameplay evidence

Selected screenshots are fresh from the pinned implementation. The [capture manifest](capture-manifest.json) records exact time, source identity, viewport, input and hash. The six states below are retained for each of these prefixes: `desktop-contextual` (1440×900), `phone-contextual` (844×390), `phone-narrow-contextual` (780×390).

| State | Filename suffix | Demonstrates |
| --- | --- | --- |
| Initial cove | `-start.png` | Full-width scene, objective, load/depth, deadline, named map controls, visible Inspect and local Moss action. |
| Route inspection | `-route-inspection.png` | One compact modal, exact passage highlight, blocked depth comparison and free inspection. |
| Critical boarding | `-critical-boarding.png` | Selected rabbits, after-boarding depth/load, boarding-before-rise order, full safe consequence and Confirm. |
| One-rabbit warning | `-subset-warning.png` | Named rabbit left to flood, complete losing consequence and confirmation. |
| After tide rise | `-after-rise.png` | Tide 1, rabbits aboard, safe waiting Moss, current facts and flooded pier. |
| Success | `-success.png` | Actual ninth-action delivery and accessible terminal Undo/Restart. |
| Baseline phone loading | `phone-loading.png` | Original First Crossing with new camera, labels and transfer dialog. |

The local [uninterrupted recording](raw/uninterrupted-rescue.webm) is **31.76 seconds**, 1440×900, silent VP9 at 25fps. It shows free blocked inspection followed by temporary unloading, both shallow stops, rabbit boarding, tide rises, retrieval and success in one UI session. No cuts, speed changes or state injection. Undo is exercised separately. Native full-frame decoded samples at 2, 9, 18 and 30 seconds are inspected; encoding and provenance are in [video-inspection.json](video-inspection.json). Full-size video stays local/ignored; the GitHub integration has no attachment-upload capability. Committed PNGs, manifests and traces are available to remote reviewers.

Visual verification is complete for the 19 selected native-size PNGs and stated coverage. Desktop and baseline images were independently inspected, and both phone safe/subset cards received independent real-UI clipping/focus/Menu checks. Historical sidebar captures are kept under their original review directories and are not relabeled or reused as current screenshots.

## Findings and resolutions

- **Resolved — baseline phone scale and labels.** Initial full-width framing made rabbits about 21px tall and labels obscured the current ferry/overlapped one another. The baseline phone camera now gives rabbits about 24.8/25.7px and sheep24.9px in the 258px canvas, with the complete lighthouse visible. Labels were separated without moving world coordinates; current ferry labels avoid the hull, and annotation lines associate outlying baseline labels with their markers.
- **Resolved — close guard blocked a deliberate Inspect tap.** At 844×390, cancelling a card then immediately tapping a different Inspect button could be swallowed by the short close guard. It now distinguishes a different inspection point while retaining protection for the repeated close point. The strict state and closed-dialog repeat-input assertion is retained.
- **Resolved — portrait note intercepted Undo.** The secondary orientation note could cover the toolbar. Portrait HUD spacing was corrected and the note no longer receives pointer events. The original real-action/Undo portrait assertion remains.
- No code comments added. No unrelated feature or puzzle expansion.

## Remaining limits and handoff

Physical phones, Safari/Firefox, other platform fonts, native GPU performance, speaker listening and screen-reader speech remain unverified. Compact Menu/help content can scroll; core consequences and confirmation are checked at both requested phone widths. The bundle-size advisory remains. No performance guarantee is inferred from SwiftShader captures.

Install/run with Node 24:

```sh
npm ci
npm run dev
```

Open `/?cove=holding-pier` at the printed URL. `/` or `/?cove=first-crossing` retains the baseline. Production uses `npm run build`, then `npm run preview`.

The final source/screenshot content audit is retained in [packaging-audit.json](packaging-audit.json); the committed content is compared again before push. The final commit and remote equality are supplied in draft PR #1 and the handoff response. This task ends with the authorized normal branch push and draft PR update, without modifying/merging main or beginning another cove. Dependencies, local configuration, raw videos, caches and build outputs remain out of Git.
