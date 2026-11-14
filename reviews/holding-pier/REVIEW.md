# Last Ferry review — The Holding Pier

## Disposition

**Ready for the puzzle experiment review.** A separate playable cove tests temporary passenger holding, with the original First Crossing available for comparison. The actual UI completes the designer's nine-action rescue. The two tempting alternatives lose at the specified deadline, and exhaustive application-state search finds no winning route without leaving Moss at Stone Pier. Whether discovering that decision is satisfying remains the purpose of the upcoming player review.

## Source and scope

- Repository: https://github.com/EDLMGit/Lastferry
- Branch: `m1-first-crossing`. Starting/comparison HEAD: `d07bcfd39b84b64031c8ce054e533f9ad8a9bed1`, chosen because it was the clean current implementation at task start. Newer M1.1 work was preserved.
- Original capture source: that HEAD **plus the then-uncommitted working tree**, pinned in [source-manifest.json](source-manifest.json). Final SHA-256 snapshot: `69e49e5399eb36e95355e106659a862495fed651c33a8af6ed88d1a672334ad6` (43 files). This is a source snapshot hash, not a Git commit.
- [tested-changes.patch](tested-changes.patch) retains tracked runtime/test/document changes. New level, witness, developer notes and tests remain ordinary project files and are individually hashed by the manifest. README/STATUS/review metadata are outside the source hash.
- Scope: one four-node experimental cove, safe/low pier presentation, session-owned level selection and one-activation routine movement. Shared deterministic rules, four slots, existing draft bands, tide timing, named passengers, sound, deck attachment and complete Undo are retained. Original level and replay data are unchanged.
- The user subsequently authorized committing and pushing this experiment on `m1-first-crossing` and updating [draft PR #1](https://github.com/EDLMGit/Lastferry/pull/1). This handoff preserves the capture-time source identity and audits the packaged source against it. The PR remains in draft against unchanged `main`; no merge or deployment is part of this handoff.

## What was built and what to judge

The ferry starts at high Stone Pier with Moss aboard; Pip and Rue wait on low Rabbit Pier. Harbor is connected to Stone by deep water. Reaching Rabbit Pier takes two shallow passages. Safe height, the four-action flood window, current depth/draft and transfer costs are visible. Non-delivery unloading says passengers can wait and board again, without naming a solution action.

The decision is whether to finish the delivery already aboard, wait for deeper water, or use a safe pier as temporary storage. The level makes those priorities conflict: the tide that opens the shallow channel also closes the rabbits' boarding window. The developer solution and rationale are in [HOLDING_PIER.md](../../docs/HOLDING_PIER.md) and `data/experiments/holding-pier-solution.json`; the player interface never displays the sequence.

In the experiment, a safe adjacent passage commits once by mouse, touch, Enter or Space. Its separate Preview button is free. Blocked or immediately losing moves show a preview; an intentional loss still requires confirmation. Transfers and Wait retain subset selection/confirmation. One move always means one edge and one turn. The baseline keeps its previous move confirmation behavior for comparison. The selected preview replaces the action list so confirmation stays together with its consequences.

## Run the playable build

From this checkout, using Node 24:

```sh
npm ci
npm run dev -- --port 5175
```

Open http://127.0.0.1:5175/?cove=holding-pier . The cove selector returns to First Crossing; its direct URL is `/?cove=first-crossing` or `/`.

```sh
npm run build
npm run preview -- --port 4175
```

The tested production build is running at http://127.0.0.1:4175/?cove=holding-pier . Production assets are generated into ignored `dist/`; [build-manifest.json](build-manifest.json) pins the resulting HTML/CSS/JS. No backend, credentials or external asset service is required.

## Environment

| Item | Actual value |
| --- | --- |
| OS | Windows 11 Pro, 10.0.26200, x64 |
| Browser | Playwright Chromium / HeadlessChrome 156.0.8078.4 |
| Renderer | WebGL 2 via SwiftShader software rendering |
| Runtime | Node v24.15.0, npm 11.12.1; existing dependency lockfile unchanged |
| Desktop | 1440 × 900 CSS px, DPR 1; mouse and real Tab/Shift+Tab, Enter, Escape sequences |
| Phone landscape | 844 × 390 CSS px, DPR 1; Chromium mobile/touch emulation and keyboard |
| Motion | Normal animation rescue/capture; reduced motion Undo, alternative routes and keyboard checks |
| Evidence | Playwright operates actual DOM controls; debug API is read-only assertions. Production rescue has no debug API. |

See [environment.json](environment.json), [phone-frame.json](phone-frame.json), and [capture-manifest.json](capture-manifest.json). This is emulated touch, not a physical phone or a native GPU performance benchmark.

## Executed checks

| Check / command | Result | Observed evidence |
| --- | --- | --- |
| `npm run build` | **pass** | Includes `npm run typecheck` (`tsc --noEmit`); production HTML/CSS/JS generated. JS 613.29 kB raw / 160.18 kB gzip. Vite's >500 kB bundle advisory remains. |
| `npm run test:unit` | **pass — 20/20** | Existing 16 checks retained, three new experiment rules/search checks and a second modeled-clearance case. Both coves' sampled hull paths clear all authored islands/piers in both directions (1,818 poses total). |
| Exhaustive reachable-state search | **pass** | Actual production reducer and legal-action enumerator; 154 canonical states including the holding-history flag, one canonical win, shortest win 9 actions, zero bypass wins. All subsets, Wait and detours included. Turns canonicalize only after the final rise; no fixed search horizon. [reachability.json](reachability.json) |
| Designer witness through actual UI | **pass** | States 0–9, boarding rabbits before the turn-4 rise, boarding Moss on return, turn-8 rise, arrival and final unloading. [ui-witness.json](ui-witness.json) |
| Home-first alternative | **pass — expected loss** | Sail Harbor → unload Moss → Stone → attempt Shallows. Fourth-action preview warns; confirmed move floods Rabbit Pier with both rabbits still waiting. Delivered sheep remains delivered. |
| Wait-for-depth alternative | **pass — expected loss** | Three Waits leave draft 2 blocked by depth 1. A proposed fourth move is invalid and free. Fourth Wait raises tide to 1 but loses the waiting rabbits. |
| Undo unloading and tide boundary | **pass** | Undo first unload restores the complete initial state and Moss's deck parent. Undo rabbit boarding at turn 4 restores turn 3/tide 0, empty ferry and both waiting rabbits; boarding again succeeds. Terminal Undo and alternate replay also pass. |
| Previews / costs / duplicate input | **pass** | Inspection/cancellation leaves authoritative state unchanged; proposed rabbit load/tide matches committed state. One direct move advances one turn. Rapid double touch on direct travel commits once under the transition lock. |
| Keyboard and phone | **pass** | Complete rescues at both sizes using normal Tab/Shift+Tab and Enter, Escape cancellation, continuing after direct sailing and terminal Undo; no test-side `.focus()` in the new navigation checks. Initial phone unload and loading Confirm are fully in the viewport. All nodes and full lighthouse are framed; initial passenger heights about 35–39 CSS px. |
| Production actual UI | **pass** | Nine-action rescue, no debug global, no external requests and no page errors. |
| Full browser regression | **pass — 19/19** | All 13 pre-existing baseline checks plus six new Holding Pier checks on snapshot `78497c89e782acae088018a895a4d33b07236b8ec2efaa77e848ad171d2a538e`. [full-regression-results.json](full-regression-results.json) and its pinned [source](full-regression-source.json). |
| Final affected browser checks | **pass — 6/6** | After experiment-only presentation refinements, all six experiment checks and captures repeated on the final pinned source. The 13 baseline checks are reused after comparison of the three changed files; see [regression-reuse.json](regression-reuse.json). Final results: [automation-results.json](automation-results.json). |
| `node tools/verify-design.mjs` | **pass — 32/32** | Historical First Crossing reference model only, shortest 7 within a 12-action horizon; not used to establish the experiment's behavior. |
| Fresh dependency reinstall during this experiment | **not run** | Existing installed dependencies and unchanged lockfile used; prior M1.1 installation evidence remains historical. |
| Physical device, Safari, Firefox, native GPU performance, speaker listening | **not run** | No claim for those environments. |

The first focused browser run found the phone loading Confirm partially outside the viewport (5 passed, 1 failed). The preview layout was corrected and the full run above passed. Native image inspection then found a Harbor label over delivered animals and slight desktop unloading-preview clipping. The final presentation hides that label on victory and replaces the action list during preview. Added viewport/label assertions and reran all affected experiment checks. No failed check is outstanding.

### Exact verification commands

PowerShell, from the checkout:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Split-Path $PWD) '.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT = '5175'
$env:LAST_FERRY_PRODUCTION_PORT = '4175'
# Servers were launched separately; Playwright reused them.
npm run dev -- --port 5175 --strictPort
npm run preview -- --port 4175 --strictPort

# Source pin, then build (including typecheck), unit checks and final capture run:
node tools/snapshot-evidence.mjs --review-dir reviews/holding-pier --base d07bcfd39b84b64031c8ce054e533f9ad8a9bed1
$env:LAST_FERRY_REVIEW_DIR = 'reviews/holding-pier'
npm run build
npm run test:unit
npm run test:e2e -- tests/e2e/holding-pier.spec.ts
node tools/snapshot-evidence.mjs --review-dir reviews/holding-pier --base d07bcfd39b84b64031c8ce054e533f9ad8a9bed1 --finalize

# Earlier complete regression, whose relevant baseline results are retained:
$env:LAST_FERRY_REVIEW_DIR = '.cache/holding-final'
npm run test:e2e
node tools/verify-design.mjs
```

The browser cache is in the parent workspace on this machine. For a fresh checkout, use the README's project-local cache and `npx playwright install chromium` instead. The server commands occupy separate terminals; tests run in a third terminal.

## Captured gameplay

All images are actual WebGL gameplay, inspected at native size. Every final image/recording belongs to the final working-tree snapshot, with hashes, timestamps and inputs in [capture-manifest.json](capture-manifest.json). No concept art is presented as gameplay.

| State | Paths relative to this report | Demonstrates |
| --- | --- | --- |
| Start | [desktop-normal.png](desktop-normal.png), [phone-normal.png](phone-normal.png) | Sheep aboard, two waiting rabbits, safe Stone/Harbor, low Rabbit Pier, depth-1 load restriction and available unloading |
| Unloading | [desktop-unloading-preview.png](desktop-unloading-preview.png), [desktop-holding-sheep.png](desktop-holding-sheep.png) | Empty draft preview and sheep safely waiting while ferry can use shallows |
| Boarding preview | [desktop-loading-preview.png](desktop-loading-preview.png), [phone-loading-preview.png](phone-loading-preview.png) | Both rabbits selected as one action, next tide, resulting load/draft and channel access; visible confirmation |
| First rise | [desktop-after-tide.png](desktop-after-tide.png), [phone-after-tide.png](phone-after-tide.png) | Rabbits aboard, low pier flooded and empty, Moss safely held at Stone |
| Arrival | [desktop-success.png](desktop-success.png), [phone-success.png](phone-success.png) | Nine-action completion with all three delivered, visible animals and Undo |
| Losing alternatives | [home-first-loss.png](home-first-loss.png), [waiting-loss.png](waiting-loss.png) | Both required negative branches reach the expected loss |
| Uninterrupted recording | `raw/uninterrupted-rescue.webm` | 32.28 seconds, 1440 × 900, 25 fps, silent VP9/WebM. One continuous real UI session: blocked inspection, temporary unload, two shallow moves, boarding preview/commit, both tide rises, retrieval and arrival. No cuts, speed changes or state injection. Undo is verified separately, not part of this clean nine-action recording. Video is retained locally and ignored by Git. |

Visual verification is **complete for these stated desktop/phone Chromium states**. The phone sidebar scrolls for secondary forecast, selector and the rest of the ending text; primary preview/confirmation and Undo remain usable.

## Findings and remaining uncertainty

**No confirmed gameplay defect remains in the checks performed.** The phone confirmation and arrival-label defects found during implementation were corrected and recaptured. No rules or deadline compromise was needed.

The remaining milestone question is design validation: have a first-time player try the experiment without developer notes, then report whether they noticed safe unloading, understood why the two shortcuts failed, and enjoyed the resulting plan. Automated solution/necessity proofs do not establish that discovery feels satisfying. Physical-phone/browser coverage and the bundle advisory remain as listed above. No campaign or additional cove expansion was started.

## Commit and PR handoff

The experiment implementation and twelve selected gameplay PNGs are committed at [0ee5d1477562be6f11c9ee3059ab9d3fb86c435b](https://github.com/EDLMGit/Lastferry/commit/0ee5d1477562be6f11c9ee3059ab9d3fb86c435b) on `m1-first-crossing`. A subsequent documentation-only handoff commit records this audit; its final SHA and verified remote tip are provided in draft PR #1 and the handoff response.

[packaging-audit.json](packaging-audit.json) checks all 43 committed source files against the original tested working tree: 40 match byte-for-byte and three documentation files differ only by CRLF-to-LF normalization required by existing attributes. All twelve committed screenshots and the retained local recording match their captured hashes. The archived diff is marked binary to preserve its exact unified-diff bytes. Capture identity remains the original precommit snapshot; these assets were not recaptured or relabeled as later-commit captures.

This handoff reuses the recorded build/typecheck, 20 unit checks, 19-check browser regression and six final affected browser checks after the content audit. Tests were not rerun during commit/push packaging because runtime, assets, dependencies and tests are unchanged. The PR links the versioned review and screenshots. The 32.28-second raw video remains local and ignored: the available GitHub integration has no attachment-upload capability. No new release or hosting service is created.

The authorized operation is a normal push to the implementation branch and a draft PR update against main at `386de54d20fdd4a513a06115471d70bf94738cc0`. No merge, force push or deployment.
