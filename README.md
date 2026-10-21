# Last Ferry — playable coves

**Current puzzle: The Holding Pier.** Run the game, then open `/?cove=holding-pier`. First Crossing remains the baseline at `/` and in the cove selector. See the current [navigation, rule-communication and phone-layout review](reviews/navigation/REVIEW.md) and [puzzle design notes](docs/HOLDING_PIER.md). The [original Holding Pier review](reviews/holding-pier/REVIEW.md) preserves the earlier experiment and its evidence.

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

Use the named map targets or their matching travel controls, such as **Sail to Harbor**. Holding Pier uses the same four stop names everywhere: **Harbor**, **Stone Pier**, **Shallows**, and **Rabbit Pier**. Text and symbols distinguish your current location, available adjacent passages, passages that are too shallow, and stops with no direct passage. Activating the current stop shows local context without spending an action.

In Holding Pier, one click, tap, Enter or Space sails along a safe adjacent passage. **Inspect** opens its outcome for free, and hover or keyboard focus highlights the exact passage and destination. Touch users can use Inspect and the visible route information without hovering. An immediately losing move opens a warning and requires confirmation. A passage that is too shallow explains the comparison directly: “Boat needs depth 2. Passage has depth 1: too shallow.” Each move crosses exactly one passage; intermediate stops are never skipped.

Passenger actions appear under the current location, separately from travel. Choose a named action such as **Let Moss ashore** or **Board Pip and Rue**, adjust the selected passenger buttons if needed, then press **Confirm**. The preview explains where passengers will wait, their safety, the boat's resulting depth requirement, and any tide consequence. Reaching Harbor does not deliver anyone until you confirm unloading there. A rabbit uses one space; Moss uses two; the ferry has four spaces.

Sailing, boarding, unloading and waiting each cost **one action**. Inspection is free, and time never advances while you think. Rabbit Pier floods after the fourth action; the initial warning counts down the remaining actions, and the boundary says “The tide rises after your next action.” Boarding resolves before that rise. The preview uses the actual selected passengers, including a loss warning if someone would remain at the flooded pier. After a rescue, the main status shows current passenger facts. **Tide and pier forecast** and **Actions and boat depth** hold secondary details; **Wait** is a separate paid action.

First Crossing retains selection and **Confirm** for travel as well as passenger actions. Its full boat needs depth 3 and cannot use the depth-2 Shallow Cut at tide 0. The outer buoys remain deep enough, or the first rise after action 4 opens the cut. Sheep Pier floods after action 8. These are the original baseline's values; Holding Pier keeps its own layout and low-pier deadline.

All controls support mouse, touch, Tab, Enter and Space. Escape closes a preview. Undo restores the entire previous action, including tide and passengers, after the brief movement finishes. Undo earlier moves or restart to recover from a losing plan. Gameplay controls are disabled during a transition; there is no queued input. The sound control remembers mute. System reduced-motion preference shortens movement and disables decorative motion.

Desktop and phone landscape use a fixed camera. Named map targets keep the stops identifiable while the phone panel prioritizes the current-location action and scrolls for secondary details. Opening a preview brings the selected action, consequences and confirmation together; closing it returns to the local and travel controls. In portrait, the cove remains above the scrollable controls and an orientation suggestion appears.

## Verify

Install the test browser into the project-local cache used by `playwright.config.ts`.

PowerShell:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $PWD '.cache/ms-playwright'
npx playwright install chromium
$env:LAST_FERRY_REVIEW_DIR = 'reviews/navigation'
```

macOS/Linux:

```sh
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright npx playwright install chromium
export LAST_FERRY_REVIEW_DIR=reviews/navigation
```

Then run:

```sh
npm run typecheck
npm run build
npm run test:unit
npm run test:e2e
node tools/verify-design.mjs
```

The browser suite defaults to ports 5173 and 4173, launches the development and production servers when necessary, and reuses already-running servers. Rebuild before testing if an existing production server is running. During the original M1 verification in this Windows sandbox, Playwright's process-tree shutdown stalled on an earlier attempt, so that final run used separately launched `npm run dev -- --port 5173` and `npm run serve:test` servers. Those original browser tests completed with normal exit.

`LAST_FERRY_REVIEW_DIR` selects the capture/report folder, so refinement evidence does not overwrite the first-pass record. `LAST_FERRY_DEV_PORT` and `LAST_FERRY_PRODUCTION_PORT` optionally select isolated servers; the M1.1 verification used 5174/4174 while preserving the already-open first-pass game. Its new tests navigate through actual Tab/Shift+Tab, Enter and Escape input without test-side `.focus()` calls, and sample attached passenger feet during draft, tide, idle bobbing and reduced motion.

The navigation pass uses isolated development/production ports **5176/4176** and stores selected captures and its report under `reviews/navigation/`. To use those ports with the browser suite:

```powershell
$env:LAST_FERRY_DEV_PORT = '5176'
$env:LAST_FERRY_PRODUCTION_PORT = '4176'
$env:LAST_FERRY_REVIEW_DIR = 'reviews/navigation'
```

On macOS/Linux, set the same variables with `export`. If launching the servers separately, use `npm run dev -- --port 5176` and, after building, `npm run preview -- --port 4176`. The latest actual check results and source identity belong to the navigation report, rather than the historical run descriptions above.

`test:unit` checks the independent application reducer, supplied replays, boundaries, history, locking, the modeled ferry's sampled clearance, the Holding Pier search and rule wording derived from real preview results. The separate design verifier checks only the supplied reference model. `test:e2e` operates the real interface, including named map targets and their connecting-passage highlights, free inspection, current-location clicks, selected-passenger flood consequences, desktop and phone rescues, Undo, touch and keyboard use, and production play. The navigation coverage includes 1440×900 desktop, 844×390 phone landscape and a nearby 780×390 landscape viewport.

Reproduce the First Crossing detour manually: Sheep Pier → Board Moss → East Buoy → South Buoy → West Buoy → Harbor → Deliver all passengers. This wins after action 7. Undo after reaching South Buoy restores action 3 and tide 0. Alternatively board Moss, Wait twice, then Shallow Cut → Harbor → Deliver all passengers; also seven actions.

## Evidence and source

See the current [navigation review](reviews/navigation/REVIEW.md), [capture manifest](reviews/navigation/capture-manifest.json), [source identity](reviews/navigation/source-manifest.json) and [status](STATUS.md). The navigation evidence covers the start, free route inspection, critical rabbit boarding and the executed rise at desktop and phone landscape sizes. Available uninterrupted recordings remain local under `reviews/navigation/raw/`; their provenance and availability are recorded in the review. Raw videos are ignored and unavailable in a fresh clone. Versioned screenshots and manifests provide remote review evidence.

The [original Holding Pier review](reviews/holding-pier/REVIEW.md) records its nine-action solution, losing alternatives, exhaustive temporary-holding check and prior captures. The [M1.1 refinement review](reviews/m1-1/REVIEW.md), [capture manifest](reviews/m1-1/capture-manifest.json), and [tested source identity](reviews/m1-1/source-manifest.json) preserve earlier phone framing, passenger deck attachment and keyboard work. These are historical records, not captures of the navigation pass.

The [M1 first-pass review](reviews/m1-first-pass/REVIEW.md), its [reuse audit](reviews/m1-first-pass/evidence-reuse.json), and the [original implementation report](reviews/m1/REVIEW.md) remain historical records of the earlier source. Their captures are not relabeled as M1.1 evidence. The M1.1 desktop, phone and boarding/unloading recordings remain locally under `reviews/m1-1/raw/`; the original recordings are preserved in the parent workspace. Raw videos are ignored and unavailable in a fresh clone. The committed screenshots and manifests provide remote review evidence.

Touch coverage is Chromium emulation, not a physical phone test. Safari, Firefox, real device performance and listening to audio on speakers remain outside the verified environment. The reports retain actual build advisories and environment details; no frame-rate or device-performance guarantee is claimed.

## Project contract and assets

The preserved [first task](FIRST_TASK.md), [gameplay rules](docs/GAMEPLAY_RULES.md) and [level JSON](data/first-crossing.level.json) own the M1 mechanics. [First cove](docs/FIRST_COVE.md) explains its exact route network. The [technical plan](docs/TECHNICAL_PLAN.md), [art direction](docs/ART_DIRECTION.md), [asset plan](docs/ASSET_PLAN.md) and [product brief](docs/PRODUCT_BRIEF.md) provide the implementation direction. [Review workflow](docs/REVIEW_WORKFLOW.md) governs evidence and future reviews.

Production meshes and tones are original procedural code, documented in [the asset ledger](docs/ASSET_LEDGER.md). Supplied images under `references/` are concept art only; they are never used as gameplay backgrounds. `PACKAGE_MANIFEST.json` is the historical starter-package manifest, not the current implementation manifest. The selected dependencies follow the official [Vite guide](https://vite.dev/guide/), [Three.js installation](https://threejs.org/manual/pages/installation.html), [Vitest guide](https://vitest.dev/guide/) and [Playwright installation](https://playwright.dev/docs/intro); exact installed versions are locked in `package-lock.json`.

The current milestone keeps the small lighthouse arrival, the accepted Holding Pier puzzle and First Crossing as its baseline. Later chapters, progression, publishing and a large asset catalog remain outside this implementation.

## The Holding Pier

Open `http://127.0.0.1:5173/?cove=holding-pier` after `npm ci` and `npm run dev` (use the printed port if 5173 is occupied). The cove selector in the controls switches between the experiment and **First Crossing · baseline**. The original six-node layout and starting arrangement are preserved.

The accepted puzzle starts at safe Stone Pier with Moss aboard; Pip and Rue wait at Rabbit Pier. Shallows is a meaningful intermediate stop on their route. Bring all three to Harbor. Each safe passage uses one activation, and its separate **Inspect** button is free. Blocked and immediately losing passages open their explanation. Named passenger actions and Wait retain selection/confirmation and passenger subsets. Undo works through unloading, tide changes and endings.

The player review kept this puzzle after discovering its challenge over a few attempts. This pass improves navigation, immediate rule wording and phone hierarchy while retaining the required temporary holding and all existing mechanics. Developer rationale and solution remain in [docs/HOLDING_PIER.md](docs/HOLDING_PIER.md); the game does not display the holding plan. Current checks and gameplay evidence are in [reviews/navigation/REVIEW.md](reviews/navigation/REVIEW.md).
