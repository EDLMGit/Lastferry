# Last Ferry — the first evening

Open the default root URL, without `?cove=`, for **Last Ferry**. **Play** starts the shared Sound intent and opens three illustrated shots of the changing coast, Rue and Pip’s lantern, and Moss aboard the ferry. Normal motion advances through the three pictures automatically; Take the helm starts **The Holding Pier**. After completing its rescue, **Continue story** accepts that cove and introduces **Bellwater Cove**. Bellwater tests changing route depths and two pickup deadlines. Its explicit continuation introduces Nell at **Driftwood Yard**, the third campaign cove: use a safe mooring while reaching the low reeds in time. After its rescue, explicit continuation ends the available prototype honestly; the larger ferry and later coves are still being made. See the current [Driftwood review](reviews/driftwood-yard/REVIEW.md), the [Home and play review](reviews/home-play-flow/REVIEW.md), the [illustrated story production review](reviews/story-production/REVIEW.md), the [earlier authored-scenes record](reviews/story-scenes/REVIEW.md), the [foundation record](reviews/story-foundation/REVIEW.md), [campaign direction](campaign/CAMPAIGN_DIRECTION.md) and developer notes for [Holding Pier](docs/HOLDING_PIER.md) and [Bellwater](docs/BELLWATER.md), plus [Driftwood developer notes](docs/DRIFTWOOD_YARD.md).

**Practice** offers all four existing puzzles. Explicit `/?cove=first-crossing`, `/?cove=holding-pier` `/?cove=bellwater` and `/?cove=driftwood-yard` links enter a puzzle directly without story scenes and never read or change journey progress. First Crossing is separate practice, preserving the original baseline. Freestanding island names and light markers open free inspection; nearby dock controls offer direct named single-passenger transfers or a compact group chooser with one named commit. Sailing remains deliberate. Accepted painted panels, portraits, water, lighthouse, wooden contacts, music and sailing pace remain.

Baseline M1 is a playable 3D tutorial cove: rescue Moss the sheep with Pip and Rue already aboard, manage how much depth the loaded ferry needs, and bring everyone to the lighthouse. Time advances only on accepted actions. The scene, sounds and rules run locally in the browser.

The [victory mix review](reviews/victory-mix/REVIEW.md) verifies a clearer arrival cue and music that becomes quieter at visible final arrival, staying reduced while the cove is won. Undo, Restart and cove changes restore the gameplay mix. The private Site currently contains reviewed portrait game `1a85874883af5caa59f6294a75495eccf2afebbc` (Sites version **12**, hosting source `e87c5c5baa53a39001c5a89b07b59aab2ad150fc`), confirmed 2026-10-25 in [the supplied publication receipt](review/deployment-confirmation.json). It includes [Harbor homecoming](reviews/homecoming/REVIEW.md), [soft lighthouse light](reviews/lighthouse-light/REVIEW.md), and accepted [sailing direction and released crests](reviews/sailing-direction-wake/REVIEW.md). The earlier water-motion result was not visually accepted. **The Home/story/Driftwood additions are not deployed.** GitHub push alone does not update the Site; [PROJECT_STATE](docs/PROJECT_STATE.md) keeps publication history and current source separate.

## Run

Use **Node 24** (`.nvmrc`). Verified locally with Node **24.15.0** and npm **11.12.1**.

```sh
git clone --branch m1-first-crossing https://github.com/EDLMGit/Lastferry.git
cd Lastferry
npm ci
npm run dev
```

Open the printed local root URL without `?cove=`, normally `http://127.0.0.1:5173/`. The current local review server is http://127.0.0.1:5270/; reproduce that address with `npm run dev -- --port 5270 --strictPort`. A production build is available with `npm run build`, then `npm run preview` (normally port 4173). No credentials, downloaded art, API account or backend is needed for play.

## Journey checkpoints

**Progress is saved between coves. An unfinished cove starts again.** Continue journey identifies a cove-start recovery; it is not a mid-puzzle save. Your complete Undo history lasts through the current crossing, including after victory, until you explicitly choose Continue story to leave it. Previews, arrival animations, completion cards and Undo never accept a rescue. Reloading before that departure returns to the cove's initial state with empty Undo history.

Normal-motion opening shots advance after their finite 6 / 6 / 7-second actions, holding the final picture for explicit Take the helm. Pause/Resume keeps elapsed time and consumed cues; the More disclosure contains Replay, Skip animation, Read story and Options. **Next** is available immediately and changes only the picture; **Take the helm** on the final shot enters Holding. Normal captions appear as complete phrases after a brief visual lead-in; **Read story** exposes the full scene text immediately. **Replay** restarts the current shot. **Skip animation** settles the final picture and complete recap without accepting it. **Options** or Read story holds only the current shot; Back or Escape returns to that held shot and its trigger. Reduced Motion shows each still endpoint and caption immediately. A restored pending scene shows its final static recap with Replay scene available. Scenes never spend turns. After Holding’s accepted rescue, the compact Harbor gathering ends with explicit **Continue to Bellwater**. Home after both accepted rescues offers Play a cove and New journey, without implying more playable content. Finite story effects use the existing sound preference; narration recordings are not supplied and are not required for play.

New journey asks before replacing existing progress, and Return home explains the cove-start consequence before leaving a crossing. Settings and Practice do not replace the saved journey. Invalid/unsupported saves are retained until explicit replacement. If local storage is unavailable, play continues in memory with a notice that progress cannot survive closing. Sound and Motion preferences remain independent. Full mid-puzzle resume is deferred until a later phone-usability pass.

## Play

Select a named place, its island, pier or landmark to reveal its options for free. Select the ferry for its current location. Whole cove keeps every place available; shapes and borders distinguish the current place, adjacent passages, shallow passages and places without a direct connection. Harbor retains its Home identity. A warm marker and name highlight connect the place and its single dark teal card. Each place has one keyboard stop; both its freestanding name and endpoint marker select it. Hover and keyboard focus emphasize the actual place and only a real connecting passage.

Choose **Sail · 1 action** in an adjacent place's card to cross one passage. Safe travel commits once; a move that would lose passengers opens its explicit consequence and requires confirmation. A shallow passage explains “Boat needs depth 2. Passage has depth 1: too shallow” and disables Sail. Remote places remain freely inspectable and say which current place has no direct passage. Selecting, reselecting, switching and closing cards never spend a turn. Empty water, Close or Escape clears selection; Escape closes an active modal first.

When the ferry is idle at a usable pier, a safe single-passenger **Board Moss**, **Let Moss ashore** or **Bring Moss home** action commits directly. Its cost, resulting depth and relevant tide/landing consequence appear before the tap. Multiple passengers use a nearby compact chooser with portraits, full names and capacities; freely select a subset, then use its named action once. Predicted loss always opens a warning before commitment. A small receipt appears at actual visual completion, showing the accepted action and any changed depth band; Undo clears it. Reaching Harbor does not deliver anyone until you explicitly use Bring home. A rabbit uses one space; Moss uses two; the ferry has four spaces.

The compact objective, **Home 0/3** progress, boat depth/load and current deadline stay visible during play. Sailing, boarding, unloading and waiting each cost **one action**. Inspection is free, and time never advances while you think. Rabbit Pier floods after the fourth action; the warning counts down the remaining actions, and the boundary says “The tide rises after your next action.” Boarding resolves before that rise. The preview uses the actual selected passengers, including the named passenger who would be left at a flooded pier. After the rescue, current passenger facts replace the obsolete danger warning.

**Undo** and **Wait · 1 action** are directly accessible. Wait opens its actual consequence before confirmation. The deadline/status control opens the tide and pier forecast. **Menu** contains Restart, Settings, detailed Help and cove selection. Settings shares Sound on/off with the permanent music-note control and offers Motion: Follow device (default) or Reduced. Both choices persist locally; Back or Escape returns to the originating Menu or ending. While won, Menu offers Return to arrival without replaying effects. Only one contextual dialog is open at a time; inspection, opening a menu and cancellation leave the puzzle unchanged.

All controls support mouse, touch, Tab, Shift+Tab, Enter and Space. Dialogs keep focus within their controls; Escape or Cancel closes them and restores focus to the actual trigger or selected card heading. Keyboard selection focuses a non-committing heading, with explicit actions next in Tab order. Background gameplay is unavailable while a dialog is open. Undo restores the entire previous action, including tide and passengers, after movement finishes, including after success or loss, and clears location selection. Restart begins with the closer Play view at the starting ferry. Undo earlier moves or restart to recover from a losing plan. Gameplay controls are disabled during a transition; there is no queued input. The music-note **Sound** control remains available during sailing and remembers mute. Intentional game activation starts the original 75-second phrase and quiet water ambience; thinking, inspection, Undo and Restart keep its musical phase. Listening never spends an action. The effective motion choice shortens movement and freezes decorative water/wake independently of Sound. Follow device responds to OS changes; manual Reduced overrides them. Reduced motion also settles the arrival gesture immediately and keeps ordinary camera framing.

Phones start in a closer **Play** view in portrait or landscape. **Whole cove** shows every destination for planning; drag open water to pan within the cove and use **Back to boat** to return. These view changes are free. The isometric angle stays fixed, and Play follows the ferry during a crossing. Selecting an offscreen place by keyboard brings it into view. Action previews stay beside their initiating control, with a nearby edge sheet on smaller screens; passenger choices scroll above the reachable confirmation footer. **Menu → Settings → Fullscreen** includes the scene, controls and dialogs where the browser supports it. Ordinary browser play works without fullscreen. See the [phone playability review](reviews/phone-playability/REVIEW.md) for measured comparisons and device limitations; the phone interface and audio/fullscreen correction are accepted and published as game `8052cfc`, Sites version 10.

After final disembarkation, normal Play permits a small Harbor push where the ferry, delivered passengers and completion card fit. Short-phone and Reduced settings keep ordinary framing; Whole cove continues to show the network. Undo returns to a useful view of the restored ferry. In a journey, **Continue story** accepts the rescue; in practice, the existing cove switching remains independent.

With Sound enabled, a completed interaction starts playback. If the browser is still waiting, use **Retry sound**; Settings also offers **Mute sound** while a request is pending. Muted sound stays muted during ordinary play and story scenes. Fullscreen keeps an open dialog visible above the scene. If a browser blocks fullscreen, **Copy support details** provides local diagnostic text without sending telemetry. See the [phone audio/fullscreen review](reviews/phone-audio-fullscreen/REVIEW.md); this correction was accepted in version 10 and remains included in the published version 12 baseline.

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
npm run check:assets
npm run test:e2e
node tools/verify-design.mjs
```

The browser suite defaults to ports 5173 and 4173, launches the development and production servers when necessary, and reuses already-running servers. Rebuild before testing if an existing production server is running.

`LAST_FERRY_REVIEW_DIR` selects the capture/report folder so new evidence does not overwrite earlier records. `LAST_FERRY_DEV_PORT` and `LAST_FERRY_PRODUCTION_PORT` optionally select isolated servers.

For the current illustrated production pass, use `npx playwright test tests/e2e/story-production.spec.ts` with a fresh evidence directory. The earlier model-scene checks remain historical in `tests/e2e/story-scenes.spec.ts`. The earlier checkpoint coverage remains in `tests/e2e/story.spec.ts` and `tests/unit/story-progress.test.ts`; timeline/cancellation checks are in `tests/unit/story-presentation.test.ts`. The [production report](reviews/story-production/REVIEW.md) distinguishes actual visual/interaction results from development failures, unchanged foundation coverage and untested devices. Run `npm run test:unit -- --maxWorkers=1` when sharing the machine with renderer-heavy work; avoid concurrent browser rendering for the final whole-suite gate.

For the historical interface pass, use `npx playwright test tests/e2e/cove-interface.spec.ts tests/e2e/production.spec.ts tests/e2e/transfer-audio.spec.ts`. The [cove interface report](reviews/cove-interface/REVIEW.md) records its source, isolated ports 5197/4185, actual outcomes and native-size phone inspection. It covers endpoint/name reachability, dock actions, free inspection, explicit commitment, subsets, repeated input, natural keyboard, three-cove rescues and preserved transfer audio. Use a new `LAST_FERRY_REVIEW_DIR` for reruns so recorded evidence is retained.

For the historical transfer-sound checks, use `npx playwright test tests/e2e/transfer-audio.spec.ts tests/e2e/transfer-phone.spec.ts tests/e2e/production.spec.ts`. That recorded pass uses development port **5193**, production port **4183**, and distinct output folders under `reviews/transfer-audio/`. Its short-phone regression covers 780×320 beside 844×390 with touch emulation; physical Android and speaker listening remain unverified. Its original publication statements describe that handoff, not the current version 12 Site.

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

See the current [Driftwood review](reviews/driftwood-yard/REVIEW.md), the [Home and play review](reviews/home-play-flow/REVIEW.md), the [illustrated story production review](reviews/story-production/REVIEW.md), the historical [story foundation review](reviews/story-foundation/REVIEW.md), and [status](STATUS.md). Source manifests distinguish fresh gameplay evidence from earlier captures and development failures. The [portrait review](reviews/passenger-portraits/REVIEW.md), [cove asset interface review](reviews/cove-ui-assets/REVIEW.md), [cove interface review](reviews/cove-interface/REVIEW.md) and its [capture manifest](reviews/cove-interface/capture-manifest.json) retain their historical identities. The [refinement review](reviews/refinement/REVIEW.md) retains the previous water/music result and actual audio phrase. Raw videos/audio stay local under the review's `raw/` folders, ignored and unavailable in a fresh clone. Versioned screenshots/manifests provide remote evidence. The [atmosphere review](reviews/atmosphere/REVIEW.md), [environment review](reviews/environment/REVIEW.md), [Bellwater review](reviews/bellwater/REVIEW.md), [prerequisite responsive/input report](reviews/bellwater/phase-a/REVIEW.md) and [contextual interface review](reviews/contextual/REVIEW.md) remain historical evidence of preceding source.

The [navigation review](reviews/navigation/REVIEW.md) preserves the accepted navigation, rule wording and phone-layout pass. The [original Holding Pier review](reviews/holding-pier/REVIEW.md) records its nine-action solution, losing alternatives and exhaustive temporary-holding check. The [M1.1 refinement review](reviews/m1-1/REVIEW.md) preserves earlier phone framing, passenger deck attachment and keyboard work. These are historical records, not captures of the contextual interface.

The [M1 first-pass review](reviews/m1-first-pass/REVIEW.md), its [reuse audit](reviews/m1-first-pass/evidence-reuse.json), and the [original implementation report](reviews/m1/REVIEW.md) remain historical records of earlier source. Older recordings remain in their original local folders; they are not relabeled as current evidence.

Touch coverage is Chromium emulation, not a physical phone test. Safari, Firefox, real device performance, screen-reader listening and audio on speakers remain outside the verified environment. The independent Linux/Chromium 141 broad-suite timeouts remain inconclusive; a Windows pass does not establish their cause. The reports retain actual build advisories; no frame-rate or device-performance guarantee is claimed. Puzzle satisfaction awaits the user's playtest.

## Project contract and assets

The preserved [first task](FIRST_TASK.md), [gameplay rules](docs/GAMEPLAY_RULES.md) and [level JSON](data/first-crossing.level.json) own the M1 mechanics. [First cove](docs/FIRST_COVE.md) explains its exact route network. The [technical plan](docs/TECHNICAL_PLAN.md), [art direction](docs/ART_DIRECTION.md), [asset plan](docs/ASSET_PLAN.md) and [product brief](docs/PRODUCT_BRIEF.md) provide the implementation direction. [Review workflow](docs/REVIEW_WORKFLOW.md) governs evidence and future reviews.

Production meshes and tones are original procedural code, documented in [the asset ledger](docs/ASSET_LEDGER.md). Supplied images under `references/` are concept art only; they are never used as gameplay backgrounds. `PACKAGE_MANIFEST.json` is the historical starter-package manifest, not the current implementation manifest. The selected dependencies follow the official [Vite guide](https://vite.dev/guide/), [Three.js installation](https://threejs.org/manual/pages/installation.html), [Vitest guide](https://vitest.dev/guide/) and [Playwright installation](https://playwright.dev/docs/intro); exact installed versions are locked in `package-lock.json`.

The current task is [STORY_PRODUCTION_01](LAST_FERRY_STORY_PRODUCTION_PACKAGE/NEXT_TASK_STORY_PRODUCTION.md); its explicit illustrated story scope supersedes earlier model-only scene presentation while retaining the two-cove foundation and old M1 gameplay. Larger campaign documents provide future direction, not implementation claims. The published [portrait pass](reviews/passenger-portraits/REVIEW.md) supplies static images derived from the original animal models with a shared full-level identity resolver. Existing panels, controls, puzzles, sailing and audio remain foundations.

## The Holding Pier

Open `http://127.0.0.1:5173/` after `npm ci` and `npm run dev` (use the printed port if 5173 is occupied). New journey begins with Holding Pier after the opening. `/?cove=holding-pier` is a direct independent practice entrance. Practice and **Menu → Choose cove** retain all three authored puzzles. The original baseline's six-node layout and starting arrangement are preserved.

The accepted puzzle starts at safe Stone Pier with Moss aboard; Pip and Rue wait at Rabbit Pier. Shallows is a meaningful intermediate stop on their route. Bring all three to Harbor. Select a place for free, then choose Sail to cross one safe passage. Blocked places explain the limitation; an immediately losing Sail opens explicit confirmation. Named passenger actions and Wait retain selection/confirmation and passenger subsets. Undo works through unloading, tide changes and endings.

The player review kept this puzzle after discovering its challenge over a few attempts. The full-width contextual interface and required temporary holding remain. Developer rationale and solution are in [docs/HOLDING_PIER.md](docs/HOLDING_PIER.md); the game does not display the holding plan. The journey ending keeps Undo and Restart until explicit Continue story accepts this rescue and opens the Bellwater connection. Practice does not accept campaign completion.

## Bellwater Cove

Open `/?cove=bellwater` directly, choose it in Menu, or continue from Holding Pier. The ferry starts empty at Harbor. Tansy and Lark wait at Low Pier; Bram waits at Bell Pier. A sandy reed shore, rocky bell landmark and lighthouse inlet distinguish the new composition. All six stops remain identifiable on desktop and phone landscape.

The shallow channel and deeper outer loop connect Harbor and Low Pier; Bell Pier branches from Harbor. Low Pier floods after action 4 and Bell Pier after action 8. The shared capacity, depth bands, one-action transfers, action-before-rise order and complete Undo remain. Current-depth inspection and selected-passenger consequences explain decisions without recommending a route. Developer witnesses and failed alternatives remain in [docs/BELLWATER.md](docs/BELLWATER.md), outside player-facing Help.

Bellwater's ending acknowledges that its neighbors are safe without declaring the whole game's story finished. The shared water and shore treatment now follows the actual rising water, including submerged low ground. The ferry and route dots follow one curved course, and Harbor briefly responds with warm light after delivery. See [reviews/environment/REVIEW.md](reviews/environment/REVIEW.md) for the actual verification and handoff.

## Cove interface assets

The canonical extensible inventory is [`assets/catalog.json`](assets/catalog.json). Original local SVGs feed one shared control helper and matte seafoam/teal surface family; three transparent model-derived PNG portraits supply 44px animal recognition beside full text. Passenger actions retain **Board**, **Let ashore** and **Bring home**; the lighthouse identifies Harbor/Home, while the framed ferry identifies camera recentering. See [`docs/UI_STYLE_GUIDE.md`](docs/UI_STYLE_GUIDE.md) and the [portrait review](reviews/passenger-portraits/REVIEW.md), now published as version 12. One shared story-presentation family reuses these materials and records authored captions/staging; all 72 prior families remain. The new story pass is not deployed.

With `npm run dev` running, open `/asset-gallery.html` for the developer gallery. It reads the catalog and real shared icons/components, offers named source/evidence links, and is outside the ordinary game and production build. Run `npm run check:assets` when adding, replacing or retiring a family. The same change must update the catalog, gallery/provenance entry and relevant evidence.
