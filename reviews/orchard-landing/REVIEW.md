# Orchard Landing playtest

Open [Orchard Landing](http://127.0.0.1:5270/?cove=orchard-landing) or use Home → Practice. The [root Journey](http://127.0.0.1:5270/) still ends after six rescues. Use Node 24 and run `npm ci`, then `npm run dev -- --port 5270 --strictPort`.

## The decision

The boat starts empty beside Orin on a dry landing. The shallow outward flow admits the empty ferry. Its one return opportunity is deep enough for Pomme and Sorrel together. The player has a choice of pickup order, and must decide what to finish before going back for Orin. Both orders can win. With Orin reduced to two spaces in a developer counterfactual, the player can bring him on the first trip and omit the return to the orchard altogether. [Map, witnesses and alternatives](DESIGN.md)

The future entry premise is “Orin knows every path through the orchard. Tonight, he needs the ferry.” This candidate uses the existing Practice entrance. Its illustrated entry and explicit continuation for completed-six saves follow a human playtest.

## Art and transfer

Orin has a spotted chestnut coat, a cream muzzle and two short forked antlers. The transparent portrait is a geometric projection of the same model, using the offline diffuse shading recorded in its generation manifest. The fruiting boughs, tide-worn stairs, quay crate and lighthouse distinguish four landings. Orin, sheep and rabbit occupy one fixed seat each as a six-space group. [Portrait source and hashes](../../assets/portraits/deer-manifest.json) · [Inventory](../../assets/catalog.json)

## Verification

The implementation began on the clean task commit `66ccfd4f6000a72b0bb8e147751a252057eabac7`. The published comparison is `f0ffe2c12f1cc0e42ad7ef10a4b57dd29097c731`. The private Site remains on version 19.

| Check | Observed result |
| --- | --- |
| Production and inventory | TypeScript and Vite production build passed. Vite reported the existing large-bundle warning. The catalog validates all 80 unique IDs, including the 79 earlier families. |
| Rules and old coves | Full sequential Vitest run passed 520/520. The Orchard search includes every legal subset and wait, merging equivalent states once the final tide is reached. Wide and Reef witnesses still pass. Two actual browser regression cases passed for Wide’s Whole cove and Reef’s loaded ferry. |
| Physical placement | Eight Orchard manifest subsets, including the 3+2+1 full deck, with boarding and unloading at the candidate piers and both berth orientations. The shared geometry and appearance suites passed 58/58. Hull, prop, land and route checks passed across Orchard, Wide and Reef. [Transfer results](geometry-final.json) · [Clearances](clearance.json) · [Curved path intersections](path-intersections.json) |
| Actual play | Ten actions through the controls at 390×844 in normal motion and 780×320 in Reduced Motion. The short landscape run restored the first tide across Undo, reversed the terminal delivery, brought Orin home separately and undid that subset delivery. Natural keyboard boarding, free inspection of the blocked exit, a real flood loss and recovery to departure passed. [Portrait transactions](390x844/rescued.json) · [Landscape transactions](780x320/rescued.json) |
| Journey isolation | Both played rescues retained the seeded Journey bytes with zero writes to the Journey storage key or its backup. Portrait used an in-progress Bellwater checkpoint. Landscape used the completed-six record. The rebuilt production Home → Practice menu offered eight entrances, entered Orchard, and accepted keyboard Wait/Undo with the completed record retained. Tips stayed at its fresh Off default. |
| Portrait | The 44px choice loaded, preserved native pressed-state selection and showed “Orin, 3 spaces”. A separately induced image failure kept the name, cost, choice behavior and reserved image area. [Gallery measurements](portrait-gallery.json) |

The phone captures used Windows, Node 24.15.0 and touch-emulated Chromium 156.0.8078.4 with SwiftShader at DPR 1. The screenshot runs checked 124 source and asset hashes before and after capture. Runtime inputs matched the final working tree. The separate Orin-alone captures record their own state and source hashes. The desktop entrance used the final production build. [Source manifest](source/7d25d5bb40710d0f3937fac8944810638045b6abf24d6e9eb71a50295314d7bc.json) · [Build hashes and check results](checks.json) · [Solo capture provenance](orin/source-and-states.json)

## Native frames and recording

| View | Portrait · 390×844 | Short landscape · 780×320 |
| --- | --- | --- |
| Start, ordinary Play | [Play](390x844/start-play.png) | [Play](780x320/start-play.png) |
| Same position, Whole cove | [Overview](390x844/start-whole.png) | [Overview](780x320/start-whole.png) |
| Early boarding, three spaces | [Orin alone](orin/390x844-orin-aboard.png) | [Orin alone](orin/780x320-orin-aboard.png) |
| Prepared return, six spaces | [Mixed load](390x844/orin-aboard.png) | [Mixed load](780x320/orin-aboard.png) |
| Before final delivery | [Three choices](390x844/delivery-choices.png) | [Three choices](780x320/delivery-choices.png) |
| After delivery | [All home](390x844/home.png) | [All home](780x320/home.png) |

At ordinary portrait scale the Board action, Orin’s face, the shallow entrance and the deadline share one screen. Short-landscape Play crops part of the distant lighthouse and Spring Steps. Whole cove shows all four named places in both sizes. At full load Sorrel’s ears and muzzle remain visible behind Orin, but their lower bodies overlap in projection. The longer portrait unload action partly covers the tree. [Desktop at 1440×900](desktop/start.png)

The continuous 34.845-second portrait recording follows the ten-action rescue through the held success card. It includes the live stereo game mix. All 300 captured frames decoded; the longest gap between native frames was 0.417 seconds. Capture timing on this computer is unsuitable for measuring phone performance. [Play the rescue](390x844/rescue.mp4) · [Audio, frame count and encoding audit](MEDIA.json)

## Original failures and limits

- Early type checking caught an unnarrowed action in the new solver test and an incorrect gallery argument. A concurrent trial build also ran before the scenery exports existed. The final production build passed.
- The first geometry pass exposed unsupported shore and brow contact. Two reverse approaches also clipped land, and shore landmarks crowded transfer space. The fitted seat, brow, approach curves and landmark positions were adjusted before repeating the checks. [Original transfer results](geometry-first.json) · [Original clearance results](clearance-first.json)
- Native inspection prompted a staggered bow arrangement and a move inland for the fruit tree. The first landscape chooser wrapped the last letter of Pomme’s name onto another line. Narrow tiles now reduce the gap next to the checkmark and retain the 44px portrait. The final real choices fit all three names on individual lines at both sizes.
- One landscape run during live edits returned to turn zero. Two intermediate solo captures also detected source changes. The retained captures were made on stable inputs. The first gallery failure simulation intercepted the module import as well as the raster; restricting it to the raster verified the real fallback.
- The first combined phone run passed three of four cases. The portrait chooser’s image remained pending beyond the ten-second assertion. Repeating the complete portrait rescue on the same runtime with the same assertion passed. The cause of that one timeout was not established. [First run](browser-first.json) · [Portrait rerun](automation-results.json)
- The first full unit run passed 517 cases and timed out on two existing geometric sweeps under concurrent browser load. Both passed in isolation at their original limits. The final single-worker suite included the additional Orchard path-intersection case and passed all 520. [Results](checks.json)

Physical Android, speaker listening, spoken screen-reader testing and human puzzle difficulty remain open. The full historical browser suite was outside this scoped run. The accepted six-cove campaign and its previous saves remain available in the published build.

## Reproduce

From the repository root with Node 24, run `npm ci`, `npm run build`, `npm run check:assets` and `npm run test:unit -- --maxWorkers=1`. For a new phone run, use installed Playwright Chromium and a fresh evidence directory.

```powershell
$env:LAST_FERRY_REVIEW_DIR = 'test-results/orchard-rerun'
$env:LAST_FERRY_ORCHARD_RECORD = '1'
npm run test:e2e -- orchard-landing.spec.ts --workers=1
```
