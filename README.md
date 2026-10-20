# Last Ferry — The First Crossing

M1 is a playable 3D tutorial cove: rescue Moss the sheep with Pip and Rue already aboard, manage the ferry's draft, and bring everyone to the lighthouse. Time advances only when you confirm a valid action. The scene, sounds and rules run locally in the browser.

## Run

Use **Node 24** (`.nvmrc`). Verified locally with Node **24.15.0** and npm **11.12.1**.

```sh
git clone --branch m1-first-crossing https://github.com/EDLMGit/Lastferry.git
cd Lastferry
npm ci
npm run dev
```

Open the printed local URL, normally `http://127.0.0.1:5173`. A production build is available with `npm run build`, then `npm run preview` (normally port 4173). No credentials, downloaded art, API account or backend is needed for play.

## Play

Choose a labeled adjacent waypoint or its ring in the water. Read the preview, then press **Confirm**. Each passage crosses one graph edge and costs one turn. At a pier, choose Board or Deliver/Unload; toggle the named passenger buttons to change the selection. A sheep needs two spaces; each rabbit needs one.

The full boat has draft 3 and cannot take the depth-2 cut at tide 0. Take the outer buoys, or wait for the rise after turn 4. The low sheep pier floods after turn 8. Next-tide forecast is free; **Wait** is a separate, paid action. Reaching the lighthouse does not deliver passengers until you confirm unloading.

All controls support mouse, touch, Tab, Enter and Space. Escape closes a preview. Undo restores the entire previous turn, including tide and passengers, after the brief movement finishes. Restart begins again. Gameplay controls are disabled during a transition; there is no queued input. The sound control remembers mute. System reduced-motion preference shortens movement and disables decorative motion.

Desktop and phone landscape use a fixed camera. The phone sidebar scrolls as needed; selecting an action temporarily replaces its action list with the preview. In portrait, the cove stays visible above the scrollable controls and an orientation suggestion appears.

## Verify

Install the test browser into the project-local cache used by `playwright.config.ts`.

PowerShell:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $PWD '.cache/ms-playwright'
npx playwright install chromium
$env:LAST_FERRY_REVIEW_DIR = 'reviews/m1-1'
```

macOS/Linux:

```sh
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright npx playwright install chromium
export LAST_FERRY_REVIEW_DIR=reviews/m1-1
```

Then run:

```sh
npm run typecheck
npm run build
npm run test:unit
npm run test:e2e
node tools/verify-design.mjs
```

The browser suite uses ports 5173 and 4173, launches the development and production servers when necessary, and reuses already-running servers. Rebuild before testing if an existing production server is running. In this Windows sandbox, Playwright's process-tree shutdown stalled on an earlier attempt, so the final run used separately launched `npm run dev -- --port 5173` and `npm run serve:test` servers. All browser tests then completed with normal exit.

`LAST_FERRY_REVIEW_DIR` selects the capture/report folder, so refinement evidence does not overwrite the first-pass record. `LAST_FERRY_DEV_PORT` and `LAST_FERRY_PRODUCTION_PORT` optionally select isolated servers; the M1.1 verification used 5174/4174 while preserving the already-open first-pass game. Its new tests navigate through actual Tab/Shift+Tab, Enter and Escape input without test-side `.focus()` calls, and sample attached passenger feet during draft, tide, idle bobbing and reduced motion.

`test:unit` checks the independent application reducer, all five supplied replays, boundaries, history, locking and the actual modeled ferry's sampled clearance. The separate design verifier checks only the supplied reference model. `test:e2e` operates the real interface: desktop detour, touch and keyboard tide-wait rescues, tide undo, invalid preview, double input, terminal undo, loss recovery, restart, mute persistence, reduced motion, portrait, interrupted/stalled presentation and a production rescue.

Reproduce the detour manually: Sheep pier → Board Moss → East buoy → South buoy → West buoy → Lighthouse harbor → Deliver everyone. This wins on turn 7. Undo after reaching South buoy restores turn 3 and tide 0. Alternatively board Moss, Wait twice, then Shallow cut → Lighthouse harbor → Deliver everyone; also turn 7.

## Evidence and source

See the current [M1.1 refinement review](reviews/m1-1/REVIEW.md), [fresh capture manifest](reviews/m1-1/capture-manifest.json), [tested source identity](reviews/m1-1/source-manifest.json) and [status](STATUS.md). Fresh actual gameplay PNGs include desktop and 844×390 phone loading/success views. The phone camera fits the full lighthouse and network, larger cream/tan rabbits and a dark-faced sheep improve silhouettes, and aboard passengers inherit the moving deck transform. Keyboard selection, cancellation, continuation and terminal Undo recover focus naturally.

The [M1 first-pass review](reviews/m1-first-pass/REVIEW.md), its [reuse audit](reviews/m1-first-pass/evidence-reuse.json), and the [original implementation report](reviews/m1/REVIEW.md) remain historical records of the earlier source. Their captures are not relabeled as M1.1 evidence. New desktop, phone and boarding/unloading recordings remain locally under `reviews/m1-1/raw/`; the original recordings are preserved in the parent workspace. Raw videos are ignored and unavailable in a fresh clone. The committed screenshots and manifests provide remote review evidence.

Touch coverage is Chromium emulation, not a physical phone test. Safari, Firefox, real device performance and listening to audio on speakers remain outside the verified environment. The build reports a Three.js bundle size warning (about 607 kB raw / 159 kB gzip); no frame-rate or device-performance guarantee is claimed.

## Project contract and assets

The preserved [first task](FIRST_TASK.md), [gameplay rules](docs/GAMEPLAY_RULES.md) and [level JSON](data/first-crossing.level.json) own the M1 mechanics. [First cove](docs/FIRST_COVE.md) explains its exact route network. The [technical plan](docs/TECHNICAL_PLAN.md), [art direction](docs/ART_DIRECTION.md), [asset plan](docs/ASSET_PLAN.md) and [product brief](docs/PRODUCT_BRIEF.md) provide the implementation direction. [Review workflow](docs/REVIEW_WORKFLOW.md) governs evidence and future reviews.

Production meshes and tones are original procedural code, documented in [the asset ledger](docs/ASSET_LEDGER.md). Supplied images under `references/` are concept art only; they are never used as gameplay backgrounds. `PACKAGE_MANIFEST.json` is the historical starter-package manifest, not the current implementation manifest. The selected dependencies follow the official [Vite guide](https://vite.dev/guide/), [Three.js installation](https://threejs.org/manual/pages/installation.html), [Vitest guide](https://vitest.dev/guide/) and [Playwright installation](https://playwright.dev/docs/intro); exact installed versions are locked in `package-lock.json`.

M1 stops at the small lighthouse arrival. Later chapters, progression, publishing and a large asset catalog remain outside this implementation.
