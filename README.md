# Last Ferry — playable coves

**Current puzzle: The Holding Pier.** Run the game, then open `/?cove=holding-pier`. First Crossing remains the baseline at `/` and in **Menu → Cove**. The current interface gives the cove the full play area, with named map targets and contextual dialogs. See the [contextual interface review](reviews/contextual/REVIEW.md) and [puzzle design notes](docs/HOLDING_PIER.md).

Baseline M1 is a playable 3D tutorial cove: rescue Moss the sheep with Pip and Rue already aboard, manage how much depth the loaded ferry needs, and bring everyone to the lighthouse. Time advances only on accepted actions. The scene, sounds and rules run locally in the browser.

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

Use named map targets such as **Sail to Harbor**. Holding Pier uses the same four stop names everywhere: **Harbor**, **Stone Pier**, **Shallows**, and **Rabbit Pier**. Text and symbols distinguish your current location, available adjacent passages, passages that are too shallow, stops with no direct passage, and moves that would leave a passenger to flood. Clicking the current pier or ferry exposes or focuses local passenger actions without spending an action.

One click, tap, Enter or Space sails along a safe adjacent passage. Each adjacent destination has a separate **Inspect** button that opens its outcome without sailing. Hover, keyboard focus and inspection highlight the exact passage and destination. Touch users can inspect without hovering. A blocked destination opens a free explanation; an immediately losing move opens a warning and requires confirmation. A passage that is too shallow explains the comparison directly: “Boat needs depth 2. Passage has depth 1: too shallow.” Each move crosses exactly one passage; intermediate stops are never skipped.

Passenger actions appear near the current ferry or pier, with a compact bottom strip on short screens. Choose **Let Moss ashore**, **Board Pip and Rue** or **Bring passengers home** to open one transfer card. Adjust the selected passenger buttons if needed, read the consequence, then press **Confirm**. The card shows the resulting load and depth, waiting-place safety and any tide consequence. Reaching Harbor does not deliver anyone until you confirm unloading there. A rabbit uses one space; Moss uses two; the ferry has four spaces.

The compact objective, **Home 0/3** progress, boat depth/load and current deadline stay visible during play. Sailing, boarding, unloading and waiting each cost **one action**. Inspection is free, and time never advances while you think. Rabbit Pier floods after the fourth action; the warning counts down the remaining actions, and the boundary says “The tide rises after your next action.” Boarding resolves before that rise. The preview uses the actual selected passengers, including the named passenger who would be left at a flooded pier. After the rescue, current passenger facts replace the obsolete danger warning.

**Undo** and **Wait · 1 action** are directly accessible. Wait opens its actual consequence before confirmation. The deadline/status control opens the tide and pier forecast. **Menu** contains Restart, Sound, detailed Help and cove selection. Only one contextual dialog is open at a time; inspection, opening a menu and cancellation leave the puzzle unchanged.

All controls support mouse, touch, Tab, Shift+Tab, Enter and Space. Dialogs keep focus within their controls; Escape or Cancel closes them and restores focus to the trigger or a valid successor. Background gameplay is unavailable while a dialog is open. Undo restores the entire previous action, including tide and passengers, after the brief movement finishes, including after success or loss. Undo earlier moves or restart to recover from a losing plan. Gameplay controls are disabled during a transition; there is no queued input. Sound remembers mute. System reduced-motion preference shortens movement and disables decorative motion.

Desktop and phone landscape use a fixed camera and the full viewport width for the scene. Named map targets keep the stops identifiable. Compact dialogs hold inspection, transfer, Wait, forecast, Menu and result details; phones use a bounded sheet so the scene remains visible. Essential consequence text and confirmation stay together in the transfer card.

First Crossing's full boat needs depth 3 and cannot use the depth-2 Shallow Cut at tide 0. The outer buoys remain deep enough, or the first rise after action 4 opens the cut. Sheep Pier floods after action 8. These are the original baseline's values; Holding Pier keeps its accepted layout and low-pier deadline.

## Verify

Install the test browser into the project-local cache used by `playwright.config.ts`.

PowerShell:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $PWD '.cache/ms-playwright'
npx playwright install chromium
$env:LAST_FERRY_REVIEW_DIR = 'reviews/contextual'
```

macOS/Linux:

```sh
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright npx playwright install chromium
export LAST_FERRY_REVIEW_DIR=reviews/contextual
```

Then run:

```sh
npm run typecheck
npm run build
npm run test:unit
npm run test:e2e
node tools/verify-design.mjs
```

The browser suite defaults to ports 5173 and 4173, launches the development and production servers when necessary, and reuses already-running servers. Rebuild before testing if an existing production server is running.

`LAST_FERRY_REVIEW_DIR` selects the capture/report folder so new evidence does not overwrite earlier records. `LAST_FERRY_DEV_PORT` and `LAST_FERRY_PRODUCTION_PORT` optionally select isolated servers.

The contextual interface pass uses isolated development/production ports **5177/4177** and stores selected captures and its report under `reviews/contextual/`. To use those ports with the browser suite:

```powershell
$env:LAST_FERRY_DEV_PORT = '5177'
$env:LAST_FERRY_PRODUCTION_PORT = '4177'
$env:LAST_FERRY_REVIEW_DIR = 'reviews/contextual'
```

On macOS/Linux, set the same variables with `export`. If launching the servers separately, use `npm run dev -- --port 5177` and, after building, `npm run preview -- --port 4177`. The [contextual interface report](reviews/contextual/REVIEW.md) records actual commands, results and source identity.

`test:unit` checks the independent application reducer, supplied replays, boundaries, history, locking, the modeled ferry's sampled clearance, the Holding Pier search and presentation derived from real preview results. The separate design verifier checks only the supplied reference model. Browser checks use the actual controls for map sailing and inspection, transfers, flood consequences, Undo, touch and keyboard input, modal focus, background-input blocking and production play. The target viewports are 1440×900 desktop, 844×390 phone landscape and a nearby 780×390 landscape viewport. The report distinguishes checks that passed, failed or were not run.

Reproduce the First Crossing detour manually: Sheep Pier → Board Moss → East Buoy → South Buoy → West Buoy → Harbor → Deliver all passengers. This wins after action 7. Undo after reaching South Buoy restores action 3 and tide 0. Alternatively board Moss, Wait twice, then Shallow Cut → Harbor → Deliver all passengers; also seven actions.

## Evidence and source

See the current [contextual interface review](reviews/contextual/REVIEW.md), [capture manifest](reviews/contextual/capture-manifest.json), [source identity](reviews/contextual/source-manifest.json) and [status](STATUS.md). The review records fresh gameplay captures, their exact working-tree source and environment, native-size inspection and recording availability. Raw videos stay local under `reviews/contextual/raw/`, are ignored and are unavailable in a fresh clone. Versioned screenshots and manifests provide remote review evidence.

The [navigation review](reviews/navigation/REVIEW.md) preserves the accepted navigation, rule wording and phone-layout pass. The [original Holding Pier review](reviews/holding-pier/REVIEW.md) records its nine-action solution, losing alternatives and exhaustive temporary-holding check. The [M1.1 refinement review](reviews/m1-1/REVIEW.md) preserves earlier phone framing, passenger deck attachment and keyboard work. These are historical records, not captures of the contextual interface.

The [M1 first-pass review](reviews/m1-first-pass/REVIEW.md), its [reuse audit](reviews/m1-first-pass/evidence-reuse.json), and the [original implementation report](reviews/m1/REVIEW.md) remain historical records of earlier source. Older recordings remain in their original local folders; they are not relabeled as current evidence.

Touch coverage is Chromium emulation, not a physical phone test. Safari, Firefox, real device performance and listening to audio on speakers remain outside the verified environment. The reports retain actual build advisories and environment details; no frame-rate or device-performance guarantee is claimed.

## Project contract and assets

The preserved [first task](FIRST_TASK.md), [gameplay rules](docs/GAMEPLAY_RULES.md) and [level JSON](data/first-crossing.level.json) own the M1 mechanics. [First cove](docs/FIRST_COVE.md) explains its exact route network. The [technical plan](docs/TECHNICAL_PLAN.md), [art direction](docs/ART_DIRECTION.md), [asset plan](docs/ASSET_PLAN.md) and [product brief](docs/PRODUCT_BRIEF.md) provide the implementation direction. [Review workflow](docs/REVIEW_WORKFLOW.md) governs evidence and future reviews.

Production meshes and tones are original procedural code, documented in [the asset ledger](docs/ASSET_LEDGER.md). Supplied images under `references/` are concept art only; they are never used as gameplay backgrounds. `PACKAGE_MANIFEST.json` is the historical starter-package manifest, not the current implementation manifest. The selected dependencies follow the official [Vite guide](https://vite.dev/guide/), [Three.js installation](https://threejs.org/manual/pages/installation.html), [Vitest guide](https://vitest.dev/guide/) and [Playwright installation](https://playwright.dev/docs/intro); exact installed versions are locked in `package-lock.json`.

The current milestone keeps the small lighthouse arrival, the accepted Holding Pier puzzle and First Crossing as its baseline. Later chapters, progression, publishing and a large asset catalog remain outside this implementation.

## The Holding Pier

Open `http://127.0.0.1:5173/?cove=holding-pier` after `npm ci` and `npm run dev` (use the printed port if 5173 is occupied). **Menu → Cove** switches between Holding Pier and **First Crossing · baseline**. The original baseline's six-node layout and starting arrangement are preserved.

The accepted puzzle starts at safe Stone Pier with Moss aboard; Pip and Rue wait at Rabbit Pier. Shallows is a meaningful intermediate stop on their route. Bring all three to Harbor. Each safe passage uses one activation, and its separate **Inspect** button is free. Blocked and immediately losing passages open their explanation. Named passenger actions and Wait retain selection/confirmation and passenger subsets. Undo works through unloading, tide changes and endings.

The player review kept this puzzle after discovering its challenge over a few attempts. This pass gives the cove the full play area and migrates controls into contextual dialogs while retaining the required temporary holding and all existing mechanics. Developer rationale and solution remain in [docs/HOLDING_PIER.md](docs/HOLDING_PIER.md); the game does not display the holding plan. Current checks and gameplay evidence are in [reviews/contextual/REVIEW.md](reviews/contextual/REVIEW.md).
