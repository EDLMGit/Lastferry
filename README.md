# Last Ferry — playable coves

Start with **The Holding Pier**, then choose **Next cove** after bringing its neighbors home to continue into **Bellwater Cove**. Bellwater tests changing route depths and two pickup deadlines. First Crossing remains the explicit baseline at `/?cove=first-crossing` and in **Menu → Choose cove**. Compact named places now open one free inspection card; explicit Sail and passenger actions keep turns deliberate. The scene has stable wider framing, a rocky Stone island and a visible warm lantern. The accepted water, score/accompaniment and sailing pace remain. See the current [selection review](reviews/selection/REVIEW.md) and developer notes for [Holding Pier](docs/HOLDING_PIER.md), [Bellwater](docs/BELLWATER.md) and the [environment](docs/ENVIRONMENT.md).

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

Select a named place, its island, pier or landmark to reveal its options for free. Select the ferry for its current location. Compact names remain visible; shapes and borders distinguish the current place, adjacent passages, shallow passages and places without a direct connection. Harbor retains its Home identity. A selected border connects the place and its single translucent card. Hover and keyboard focus emphasize the actual place and only a real connecting passage.

Choose **Sail · 1 action** in an adjacent place's card to cross one passage. Safe travel commits once; a move that would lose passengers opens its explicit consequence and requires confirmation. A shallow passage explains “Boat needs depth 2. Passage has depth 1: too shallow” and disables Sail. Remote places remain freely inspectable and say which current place has no direct passage. Selecting, reselecting, switching and closing cards never spend a turn. Empty water, Close or Escape clears selection; Escape closes an active modal first.

Passenger actions appear only when the ferry's current location is selected. Choose **Let Moss ashore**, **Board Pip and Rue** or **Bring passengers home** to open one transfer card. Adjust the selected passenger buttons if needed, read the consequence, then press **Confirm**. The card shows the resulting load and depth, waiting-place safety and any tide consequence. Reaching Harbor does not deliver anyone until you confirm unloading there. A rabbit uses one space; Moss uses two; the ferry has four spaces.

The compact objective, **Home 0/3** progress, boat depth/load and current deadline stay visible during play. Sailing, boarding, unloading and waiting each cost **one action**. Inspection is free, and time never advances while you think. Rabbit Pier floods after the fourth action; the warning counts down the remaining actions, and the boundary says “The tide rises after your next action.” Boarding resolves before that rise. The preview uses the actual selected passengers, including the named passenger who would be left at a flooded pier. After the rescue, current passenger facts replace the obsolete danger warning.

**Undo** and **Wait · 1 action** are directly accessible. Wait opens its actual consequence before confirmation. The deadline/status control opens the tide and pier forecast. **Menu** contains Restart, Sound, detailed Help and cove selection. Only one contextual dialog is open at a time; inspection, opening a menu and cancellation leave the puzzle unchanged.

All controls support mouse, touch, Tab, Shift+Tab, Enter and Space. Dialogs keep focus within their controls; Escape or Cancel closes them and restores focus to the actual trigger or selected card heading. Keyboard selection focuses a non-committing heading, with explicit actions next in Tab order. Background gameplay is unavailable while a dialog is open. Undo restores the entire previous action, including tide and passengers, after movement finishes, including after success or loss, and clears location selection. Restart begins with the clean overview. Undo earlier moves or restart to recover from a losing plan. Gameplay controls are disabled during a transition; there is no queued input. The music-note **Sound** control remains available during sailing and remembers mute. Intentional game activation starts the original 75-second phrase and quiet water ambience; thinking, inspection, Undo and Restart keep its musical phase. Listening never spends an action. System reduced-motion preference shortens movement and freezes decorative water/wake independently of Sound.

Desktop and phone landscape use a fixed camera and the full viewport width for the scene. Named map targets keep the stops identifiable. Compact dialogs hold inspection, transfer, Wait, forecast, Menu and result details; phones use a bounded sheet so the scene remains visible. Essential consequence text and confirmation stay together in the transfer dialog. The camera stays fixed through selection, travel and tide changes; resizing recomputes its complete path and landmark fit.

First Crossing's full boat needs depth 3 and cannot use the depth-2 Shallow Cut at tide 0. The outer buoys remain deep enough, or the first rise after action 4 opens the cut. Sheep Pier floods after action 8. These are the original baseline's values; Holding Pier keeps its accepted layout and low-pier deadline.

## Verify

Install the test browser into the project-local cache used by `playwright.config.ts`.

PowerShell:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $PWD '.cache/ms-playwright'
npx playwright install chromium
$env:LAST_FERRY_REVIEW_DIR = 'reviews/selection'
```

macOS/Linux:

```sh
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright npx playwright install chromium
export LAST_FERRY_REVIEW_DIR=reviews/selection
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

The selection pass uses isolated development port **5186** and production port **4182**. Selected captures and its report live under `reviews/selection/`; source manifests identify the exact live or frozen server used. To use those ports with the browser suite:

```powershell
$env:LAST_FERRY_DEV_PORT = '5186'
$env:LAST_FERRY_PRODUCTION_PORT = '4182'
$env:LAST_FERRY_REVIEW_DIR = 'reviews/selection'
```

On macOS/Linux, set the same variables with `export`. If launching the servers separately, use `npm run dev -- --port 5186` and, after building, `npm run preview -- --port 4182`. This workspace reused its existing browser cache at `../.cache/ms-playwright`; a fresh clone can use the project-local cache above. The [selection report](reviews/selection/REVIEW.md) records actual commands, source ports, results and identity.

`test:unit` checks the independent application reducer, supplied replays, boundaries, history, locking, sampled ferry clearance in all three coves, both puzzle searches and active-level presentation derived from real preview results. Bellwater retains eight ten-action witnesses and its valid timing alternatives. The separate design verifier checks only the supplied reference model. Browser checks use actual mouse, natural keyboard and emulated touch controls for sailing, free inspection, subsets, both rises, complete Undo, input protection, default entry/Next/Menu and production play. Target viewports are 1440×900, 844×390, 780×390, plus 844×500 and 1024×600 with breakpoint resizes. The report distinguishes passed, failed, inconclusive and not-run checks.

Reproduce the First Crossing detour manually: Sheep Pier → Board Moss → East Buoy → South Buoy → West Buoy → Harbor → Deliver all passengers. This wins after action 7. Undo after reaching South Buoy restores action 3 and tide 0. Alternatively board Moss, Wait twice, then Shallow Cut → Harbor → Deliver all passengers; also seven actions.

## Evidence and source

See the current [selection review](reviews/selection/REVIEW.md), [capture manifest](reviews/selection/capture-manifest.json), [source identity](reviews/selection/source-manifest.json) and [status](STATUS.md). The review records fresh gameplay captures, exact working-tree source/environment, native-size inspection and original-speed recordings. Audited baseline captures retain their original source identity. The [refinement review](reviews/refinement/REVIEW.md) retains the previous water/music result and actual audio phrase. Raw videos/audio stay local under the review's `raw/` folders, ignored and unavailable in a fresh clone. Versioned screenshots/manifests provide remote evidence. The [atmosphere review](reviews/atmosphere/REVIEW.md), [environment review](reviews/environment/REVIEW.md), [Bellwater review](reviews/bellwater/REVIEW.md), [prerequisite responsive/input report](reviews/bellwater/phase-a/REVIEW.md) and [contextual interface review](reviews/contextual/REVIEW.md) remain historical evidence of preceding source.

The [navigation review](reviews/navigation/REVIEW.md) preserves the accepted navigation, rule wording and phone-layout pass. The [original Holding Pier review](reviews/holding-pier/REVIEW.md) records its nine-action solution, losing alternatives and exhaustive temporary-holding check. The [M1.1 refinement review](reviews/m1-1/REVIEW.md) preserves earlier phone framing, passenger deck attachment and keyboard work. These are historical records, not captures of the contextual interface.

The [M1 first-pass review](reviews/m1-first-pass/REVIEW.md), its [reuse audit](reviews/m1-first-pass/evidence-reuse.json), and the [original implementation report](reviews/m1/REVIEW.md) remain historical records of earlier source. Older recordings remain in their original local folders; they are not relabeled as current evidence.

Touch coverage is Chromium emulation, not a physical phone test. Safari, Firefox, real device performance, screen-reader listening and audio on speakers remain outside the verified environment. The independent Linux/Chromium 141 broad-suite timeouts remain inconclusive; a Windows pass does not establish their cause. The reports retain actual build advisories; no frame-rate or device-performance guarantee is claimed. Puzzle satisfaction awaits the user's playtest.

## Project contract and assets

The preserved [first task](FIRST_TASK.md), [gameplay rules](docs/GAMEPLAY_RULES.md) and [level JSON](data/first-crossing.level.json) own the M1 mechanics. [First cove](docs/FIRST_COVE.md) explains its exact route network. The [technical plan](docs/TECHNICAL_PLAN.md), [art direction](docs/ART_DIRECTION.md), [asset plan](docs/ASSET_PLAN.md) and [product brief](docs/PRODUCT_BRIEF.md) provide the implementation direction. [Review workflow](docs/REVIEW_WORKFLOW.md) governs evidence and future reviews.

Production meshes and tones are original procedural code, documented in [the asset ledger](docs/ASSET_LEDGER.md). Supplied images under `references/` are concept art only; they are never used as gameplay backgrounds. `PACKAGE_MANIFEST.json` is the historical starter-package manifest, not the current implementation manifest. The selected dependencies follow the official [Vite guide](https://vite.dev/guide/), [Three.js installation](https://threejs.org/manual/pages/installation.html), [Vitest guide](https://vitest.dev/guide/) and [Playwright installation](https://playwright.dev/docs/intro); exact installed versions are locked in `package-lock.json`.

The current task in [NEXT_TASK.md](NEXT_TASK.md) refines free location selection, a single explicit-action card, stable scene framing, Stone island and the visible lantern across the accepted coves. Sailing timing and the accepted base score stay unchanged. Puzzle rules, canonical courses and stopping points are preserved. A campaign map, save system, new mechanics, publishing and a large asset catalog remain outside this update.

## The Holding Pier

Open `http://127.0.0.1:5173/` after `npm ci` and `npm run dev` (use the printed port if 5173 is occupied). Holding Pier is now the default; `/?cove=holding-pier` remains an explicit route. **Menu → Choose cove** selects Holding Pier, Bellwater or **First Crossing · baseline**. The original baseline's six-node layout and starting arrangement are preserved.

The accepted puzzle starts at safe Stone Pier with Moss aboard; Pip and Rue wait at Rabbit Pier. Shallows is a meaningful intermediate stop on their route. Bring all three to Harbor. Select a place for free, then choose Sail to cross one safe passage. Blocked places explain the limitation; an immediately losing Sail opens explicit confirmation. Named passenger actions and Wait retain selection/confirmation and passenger subsets. Undo works through unloading, tide changes and endings.

The player review kept this puzzle after discovering its challenge over a few attempts. The full-width contextual interface and required temporary holding remain. Developer rationale and solution are in [docs/HOLDING_PIER.md](docs/HOLDING_PIER.md); the game does not display the holding plan. The successful ending offers Next cove alongside Undo and Restart, with a brief coast transition into a fresh Bellwater state. No unlock or save system is involved.

## Bellwater Cove

Open `/?cove=bellwater` directly, choose it in Menu, or continue from Holding Pier. The ferry starts empty at Harbor. Tansy and Lark wait at Low Pier; Bram waits at Bell Pier. A sandy reed shore, rocky bell landmark and lighthouse inlet distinguish the new composition. All six stops remain identifiable on desktop and phone landscape.

The shallow channel and deeper outer loop connect Harbor and Low Pier; Bell Pier branches from Harbor. Low Pier floods after action 4 and Bell Pier after action 8. The shared capacity, depth bands, one-action transfers, action-before-rise order and complete Undo remain. Current-depth inspection and selected-passenger consequences explain decisions without recommending a route. Developer witnesses and failed alternatives remain in [docs/BELLWATER.md](docs/BELLWATER.md), outside player-facing Help.

Bellwater's ending acknowledges that its neighbors are safe without declaring the whole game's story finished. The shared water and shore treatment now follows the actual rising water, including submerged low ground. The ferry and route dots follow one curved course, and Harbor briefly responds with warm light after delivery. See [reviews/environment/REVIEW.md](reviews/environment/REVIEW.md) for the actual verification and handoff.
