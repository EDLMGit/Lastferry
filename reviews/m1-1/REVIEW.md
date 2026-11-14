# Last Ferry review — M1.1 refinement

## Disposition

**Ready for M1 — focused M1.1 refinement complete for the stated coverage.** Phone framing/readability, visual deck attachment and natural keyboard focus recovery are addressed in the existing cove. All 16 existing unit checks and all 13 browser checks pass, including the production rescue. Fresh desktop and phone captures were inspected at native size. The three independently identified presentation/input issues supersede the earlier first-pass visual conclusions; the older reports remain historical records.

## Source and scope

- Repository / PR / branch: [EDLMGit/Lastferry](https://github.com/EDLMGit/Lastferry), [draft PR #1](https://github.com/EDLMGit/Lastferry/pull/1), `m1-first-crossing`.
- Independently reviewed comparison base: **`c224fe07a1f4391ae481af4bab77b16d9b4322a3`**, supplied by the user. Initial branch and fetched remote matched it exactly; no newer work was present.
- Reviewed implementation and capture HEAD: **`16ebda11e908aa7234a38d6fc1d3f157ee97e72c`**. The subsequent evidence/report commit changes README, STATUS and review artifacts only. The final full SHA is in the PR/handoff; this document cannot embed its own commit SHA.
- Working tree at snapshot: implementation committed; only the new `reviews/m1-1/` evidence directory was untracked. README/review metadata was edited during or after verification, outside the source hash; no hashed source changed. The original workspace and existing game on port 5173 were preserved. Isolated development/production servers used ports 5174/4174 in the Git checkout.
- Source snapshot: [source-manifest.json](source-manifest.json), **38 files**, captured at **2026-10-20T21:04:21.562Z**, aggregate SHA-256 **`e529fd441a651b73aa127d2cb99e5447a1975ae70f8888e79430776a3f860765`**. Finalization confirms the tested source is unchanged. Per-image source identity, capture times, dimensions and hashes are in [capture-manifest.json](capture-manifest.json).
- The baseline comparison image and focus observation are explicitly attributed to `c224fe0…`; all other new captures belong to the refined source above. They are not concept art or reused first-pass screenshots.
- Scope: the three requested refinements only. `src/game/`, authoritative JSON/coordinates, rules, tide schedule, capacity and complete logical Undo are unchanged from the reviewed baseline. No dependency changes, new chapters, objectives, camera controls or publishing work.

## Environment

| Item | Actual value |
| --- | --- |
| OS / browser | Windows 11 Pro 10.0.26200 x64; headless Chromium 156.0.8078.4, SwiftShader WebGL 2 |
| Runtime / tools | Node 24.15.0, npm 11.12.1; Three.js 0.186.1, Vite 8.3.4, TypeScript 7.0.2, Vitest 5.0.5, Playwright 1.64.1 |
| Desktop | 1440×900 CSS pixels, DPR 1, mouse and normal keyboard navigation |
| Phone landscape | 844×390 CSS pixels, DPR 1; keyboard in the phone layout plus a separate Chromium mobile/touch-emulated rescue |
| Portrait / motion | 390×844; separate normal and reduced-motion attachment checks |
| Capture method | Playwright operates real controls, captures actual WebGL PNGs and browser-context WebM recordings |

No physical phone, Safari/Firefox, speaker listening, hardware performance or new-player study is claimed. Browser UA/renderer diagnostics are retained in [browser-environment.json](browser-environment.json).

## Executed checks

All checks below were executed freshly against the refinement unless explicitly marked otherwise. Four focused browser tests were added; the nine existing browser tests and 16 unit tests were retained. Evidence output is parameterized to avoid overwriting earlier review records. The existing undo render assertion now checks stable deck coordinates and allows only the bounded cosmetic bob phase difference in world coordinates.

| Check / command or steps | Result | Observation / evidence |
| --- | --- | --- |
| `npm run build` | pass | Production build exits 0; JS 606.84 kB raw / 158.58 kB gzip. The existing >500 kB advisory remains. |
| `npm run typecheck` | pass | Executed by the final production build; no TypeScript errors. |
| `npm run test:unit` | pass | **16/16** in two files, including all five authored replays and modeled hull clearance. |
| `npm run test:e2e` with environment below | pass | **13/13**, exit 0, 0 skipped/flaky/unexpected; 109.573629 s. [Full results](automation-results.json). |
| Real rescue, preview, tide boundary, Undo and arrival | pass | Existing desktop detour and touch rescue plus desktop/phone natural-keyboard tide-wait rescues; turn-4 Undo restores tide 0, final explicit delivery wins on turn 7. Production rescue also completes with no debug global or external assets. |
| Phone composition and silhouettes | pass | Actual lighthouse bounds have a **10 px top margin** inside the 580×320 canvas. All six nodes fit. Rabbit projected bounding heights are **26.14 / 27.30 px**, waiting sheep **28.99 px**. Native 844×390 loading, loaded and success captures inspected. [Frame diagnostics](phone-frame.json). |
| Already-aboard passengers attached to current visual deck | pass | Named anchors are children of the animated hull. Foot positions remain invariant in hull-local space during boarding Moss, unloading only Moss, idle bob, tide rise, Undo and reduced motion. Numeric observations below. |
| Normal Tab/Shift+Tab, Enter and Escape | pass | Two new tests use only actual key presses to move focus; no test-side `.focus()` calls. Selection enters the preview, Escape returns to its source control, commit recovers to an available action, and arrival focuses Undo. Terminal Undo and subsequent delivery both work on desktop and phone layout. |
| Existing input/undo/flood coverage | pass | Mouse double click, emulated double tap, blocked preview, state conservation, terminal Undo/Restart, flooded-pier recovery, visibility cancellation, stalled-animation fallback and portrait checks remain passing. |
| Reference design verifier | not rerun | Earlier 32/32 result is historical supplementary evidence. Rules, authored level and production reducer are unchanged; fresh application unit checks cover all supplied replays. |
| `npm ci` | not rerun | Dependency manifests/lockfile are unchanged; existing locked dependencies used. |
| Physical devices / other browsers / speakers / GPU FPS | not run | Outside available coverage. |

Exact browser invocation in PowerShell, with both isolated servers already running:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Split-Path $PWD) '.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT = '5174'
$env:LAST_FERRY_PRODUCTION_PORT = '4174'
$env:LAST_FERRY_REVIEW_DIR = 'reviews/m1-1'
npm run test:e2e
```

Server commands: `npm run dev -- --port 5174` and `npm run preview -- --port 4174`, following `npm run build`. The parent-cache path is specific to this workspace; README explains project-local browser installation for a fresh clone.

Attachment measurements: **67 normal-motion samples**, maximum foot drift **4.440892098500626e-16**, hull Y range **−0.13199948… to −0.03300095…**. The seven idle-only samples show **0.00410126…** hull motion with unchanged local feet. **45 reduced-motion samples** show the same floating-point foot bound, hull draft range **−0.12 to −0.045**, and **zero idle motion** in eight idle samples. See [normal](deck-normal-samples.json) and [reduced](deck-reduced-samples.json) summaries. Assertions use tolerance 1e−8; these are transform observations, not a frame-rate measurement.

## Captured gameplay

All refined PNGs below were captured freshly from the recorded source. The full-page images were inspected at native 1440×900 or 844×390 size. A spatially magnified video is separate inspection evidence, not a claim about native phone readability.

| State | File | Observation |
| --- | --- | --- |
| Desktop loading | [desktop-loading.png](desktop-loading.png) | Two distinguishable rabbits aboard, sheep waiting, explicit proposed load/draft, visible keyboard focus. |
| Phone loading | [phone-loading.png](phone-loading.png) | Complete lighthouse and cove, larger cream/tan rabbit silhouettes, dark-faced waiting sheep, current HUD, confirmation and Undo. |
| Full boat | [desktop-loaded.png](desktop-loaded.png), [phone-loaded.png](phone-loaded.png) | All three aboard, 4/4 occupied, draft 3 and shallow cut blocked. |
| Success | [desktop-keyboard-success.png](desktop-keyboard-success.png), [phone-keyboard-success.png](phone-keyboard-success.png) | Actual arrival after the keyboard rescue; three passengers ashore and focus on terminal Undo. |
| Existing-control captures, freshly rerun | [normal-play.png](normal-play.png), [loading-preview.png](loading-preview.png), [after-tide.png](after-tide.png), [success.png](success.png), [phone-loading-preview.png](phone-loading-preview.png), [phone-success.png](phone-success.png) | Mouse and emulated-touch journeys, including tide change and arrival. |
| Supporting coverage | [portrait.png](portrait.png), [flood-loss.png](flood-loss.png), [checkpoint-a.png](checkpoint-a.png) | Actual refined build; separate motion/orientation and loss paths. |
| Baseline comparison | [baseline-phone.png](baseline-phone.png), [baseline-observation.json](baseline-observation.json) | **Pre-refinement `c224fe0…`**, not fresh refined evidence. Tab selection left active element at BODY with turn still 0. |
| Boarding/unloading recording | `raw/boarding-unloading.webm` | Local unedited approximately eight-second desktop run; board Moss, unload only Moss while rabbits stay aboard, idle, Undo, tide and Undo. |
| Deck close-up | `raw/boarding-unloading-closeup.webm` | Same continuous recording, spatial crop at 730,350 of 300×260 pixels, enlarged 3× with nearest-neighbor scaling; **no temporal cuts**. Makes feet/deck relation easier to inspect. |
| Rescue recordings | `raw/desktop-rescue.webm`, `raw/phone-rescue.webm` | New unedited actual UI rescues, including tide Undo and arrival. |

All four named recordings are retained under `C:/Users/ernes/Documents/last-ferry-codex-starter/Lastferry/reviews/m1-1/raw/`. They are ignored/local-only, not committed or uploaded, and are unavailable in a fresh clone. Hashes and transformation disclosure are in the capture manifest. Concept references remain separately under `references/`; no concept image was substituted for gameplay.

Visual verification: **complete for these fresh captures**. Recognition is supported by native-size inspection and projected geometry measurements; no independent usability study is implied.

## Findings and resolutions

### M1.1-01 — P2 — Small phone passengers and clipped lighthouse

- Reproduce: baseline at 844×390, inspect initial or loading view without zoom.
- Expected / observed: recognize all three animals and full refuge; baseline silhouettes were too small and the roof exceeded the canvas.
- Source / fix: `src/scene/world.ts` fits actual static bounds and a route-wide boat envelope using a stable phone camera; `src/style.css` reclaims vertical scene space. Animal scale/anchor spacing, wider ears, distinct coats, dark sheep face and slightly more exposed waiting pose improve silhouettes. Authored gameplay coordinates are unchanged.
- Resolution: fixed at reviewed implementation HEAD; fresh native captures and bounds checks pass together. These changes address clipping and readability as one composition problem.

### M1.1-02 — P2 — Passenger feet disagreed with animated draft and bob

- Reproduce: board/unload Moss while rabbits remain aboard; observe their deck contact during draft settling or idle bobbing.
- Expected / observed: already-aboard feet follow the current deck; baseline computed final-state draft immediately while the hull interpolated, and idle bob moved only the hull.
- Source / fix: named `deck-anchor-*` children beneath the hull carry aboard animals. Only passengers crossing the gangway are detached into world space, then reattached on completion. Boarding destinations use the current anchor transform. Sync/Undo reconcile parent, local feet and pose together; reduced motion returns to the nonbobbing deck.
- Resolution: fixed; normal/reduced sampling, real UI boarding/Moss-only unloading, tide/Undo, and the retained recording verify the affected cases.

### M1.1-03 — P2 — Keyboard focus lost after preview/action rendering

- Reproduce: use Tab to select a route in phone layout, then Enter. Baseline active element became BODY when the focused control was hidden/rebuilt.
- Expected / observed: continue naturally through preview, cancellation and subsequent actions; baseline test-side `.focus()` calls bypassed the failure.
- Source / fix: `src/main.ts` remembers the preview source, moves keyboard selection into the preview, restores it on Escape, and recovers to an available action after animation or Undo after arrival. It respects a user who moves focus to another available control during the transition. Panel scroll is reset before keyboard recovery so the phone HUD stays visible.
- Resolution: fixed; desktop and phone tests exercise actual Tab/Shift+Tab/Enter/Escape selection, confirmation, cancellation, continuation, tide Undo and terminal Undo without scripted focus placement.

## Remaining uncertainty and next action

No known requested M1.1 item remains incomplete in the stated coverage. Physical phones, other browsers, audible output, hardware performance and first-time-player recognition/enjoyment remain unverified. The existing bundle-size advisory is unchanged in kind; no unrelated optimization or infrastructure was added.

The final evidence/report commit is metadata only and must retain identical tested source hashes. Update existing draft PR #1 on `m1-first-crossing`; leave `main` unchanged. The final SHA, remote equality and PR draft status are reported in the handoff. No force push, merge, deployment, GitHub approval or review comment is part of this refinement.
