# Water verification

The water implementation connects the existing two generated256×256 fields to authored passage geography. A shared deterministic sampler follows canonical curved paths and base depths. Depth1 produces a broad irregular sand/stone shelf; depth2 has a quieter lower shelf. Depth3+ passages and node basins suppress those banks. Existing coastal shore/contact detail remains. The shader uses actual substrate optical depth and the mask's bank channel, with the existing0.18 world-height rise per tide. Neither sampler accepts passenger state, load or draft. No new rendering pass, external texture or per-frame field allocation was added.

## Units and original failures

The 12-case water suite passes: all five coves retain land/apron/deep-water field behavior; Holding/Driftwood approaches have shallower substrate heights than deep alternatives; the named Shallows/Bend nodes retain deep basins; all field bytes survive tide updates/Undo; authored-depth changes alter the bank while a changed passenger arrangement does not. Existing reflection, actual water-height exposure and disposal checks remain.

One concurrent-load rerun had11passes and one5000ms timeout in the new Holding tide/field check, observed5988ms. No numerical assertion failed. Replacing the full typed-array matcher with exact every-byte comparison and skipping segments outside their maximum influence preserved the assertions and original timeout;12/12passed again. See water-internal/ATTEMPTS.md. An initial fixture TypeScript error used Node.remove; parentNode.removeChild corrected the fixture and npm run typecheck passed.

## Actual browser attempt1

Command: `npx playwright test tests/e2e/play-readability-water.spec.ts --config .cache/readability.config.ts`, with LAST_FERRY_REVIEW_DIR set to the absolute water-final review directory. Node24.15.0; Chromium156.0.8078.4, SwiftShader; deviceScaleFactor1, touch/mobile contexts, Reduced Motion. No gameplay-state injection.

- PASS: Holding390×844 in17.5seconds. Actual taps cover a heavier ferry blocked on base-depth1 at tide0, unloading and a matched light-load view, shallow arrival in ordinary Play, rabbit boarding at the rise, complete tide Undo/replay, returning to Stone with a depth2 boat at tide1 and the same now-legal passage, and tide2 arrival. Turns0/1/4/8 have source-tied frames; the source manifest is water-final/water/holding-source.json. Full rescue/terminal Undo are covered separately by the integrated journey case.
- FAILED: Driftwood780×320 timed out at240000ms. It successfully reached turn3 with Nell aboard at High Mooring and switched from Overview to Play; the next heavy-Play screenshot was never written. The retained error-context snapshot has usable Let Nell ashore and the correct remaining deadline. No selector or rule assertion mismatch was emitted. The initial screenshot-stall suspicion was unconfirmed; the later bounded retry identified the actual fixture race below.
- Original result: water-final-run.txt, water-final/automation-results.json and water-final/driftwood-timeout-context.md. The fixture now uses bounded native CDP Page.captureScreenshot instead of Playwright's screenshot readiness path, and records state before capture. A subsequent result is separate; the original failure is not rewritten.

## Native observations before the final retry

Inspected native Holding390×844 frames: lighter curved approaches are distinct from the blue deep approach and darker turning pockets; the same banks remain recognizable, but dimmer, at tides1/2. The matched light/heavy view retains the bank location. Ordinary Play at Shallows shows the submerged bank beside the boat without relying on its route dots. Overview necessarily makes the whole cove and animals smaller on portrait.

The tide2 Overview also exposed Bring home covering the lighthouse. This is a separate layout defect passed to the root implementation agent; later dock placement changes require fresh corresponding UI evidence. Water shader/field source is unchanged, so the earlier optical comparisons remain scoped evidence rather than a claim that every UI pixel matches the final build.

Initial internal844×390 inspection of Holding, Driftwood, Bellwater and Wide drove a less pale/lower and more irregular second bank candidate. Bellwater's long banks still read as broad pale shelves; they are not new travel graphics. The original first candidate was not retained as a separately indexed capture set and is not claimed as matched evidence. All selected final frames must be read alongside their actual source manifest and later results.

## Final focused result and retained retries

Attempt2 used bounded CDP capture and the repaired dock layout. Five Holding frames were written before another stall; the run was interrupted, not passed. Its partial output and source identity remain in water-final2/ and water-final2-run.txt.

Attempt3 added a stricter15second action timeout and ran Driftwood alone. It failed at18.8seconds with an exact `locator.tap` trace for the hidden `#back-to-boat` button. The fixture had tapped Play view, then queried Back to boat before the next layout hid that now-unneeded control. It tried to tap the stale visible result. The correction uses either Play view or Back to boat, then verifies the actual Play mode; it does not change runtime behavior or extend a timeout. Original trace/context: water-final3-run.txt and water-final3/driftwood-helper-failure.md.

Final command uses `.cache/readability-water.config.ts` with Chromium headless-shell1248, the same SwiftShader/native viewport settings, bounded CDP capture and15second action waits. **Both cases passed in40.0seconds**: Holding16.9seconds; Driftwood22.1seconds. See water-final4-run.txt and water-final4/automation-results.json. Browser contexts closed after the cases. No gameplay state was injected; all moves/transfers/Undo used real touch inputs.

The final matrix adds the missing Driftwood tides0/1/2, heavy/light Nell comparison at the same tide/location, normal Play and Whole cove views, label-free ordinary Play and Overview diagnostics, tide Undo/replay, and initial Bellwater/Wide water inspection. Holding's blocked→legal and all tide/load checks also passed again on the updated UI. Full rescues/terminal Undo and normal-motion/audio footage remain separate integrated evidence, rather than claims made by these partial routes.

All runtime, data and dependency hashes stayed identical from start to end of each successful final case. Exact working-tree manifests: water-final4/water/holding-source.json and driftwood-source.json. The HEAD is the pre-commit continuity revision; file hashes identify the actual implementation. Each PNG has adjacent actual-state/view/environment/frame metadata.

Representative native frames inspected directly:

- `water-final4/water/holding-390x844-tide0-shallow-play-label-free.png`: the lighter bent approach remains legible without map names, beside the darker stopping pocket and the actual boat.
- `water-final4/water/holding-390x844-depth1-blocked.png` and `holding-390x844-depth1-now-legal.png`: the exact accessible restriction changes with tide while bank geography remains fixed.
- `water-final4/water/driftwood-780x320-tide0-heavy-overview.png` and `driftwood-780x320-tide0-light-overview.png`: unloading Nell changes deck/shore occupancy and route legality, not the bank shape or position.
- `water-final4/water/driftwood-780x320-tide0-shallow-play-label-free.png`, `driftwood-780x320-tide1-overview.png` and `driftwood-780x320-tide2-overview.png`: both approaches remain recognizable across rises, with lower underwater contrast; the deeper Bend pocket remains dark. The base-depth2 return is quieter than the depth1 approaches; the deep return stays blue.
- `water-final4/water/bellwater-844x390-water-overview.png` and `wide-berth-844x390-water-overview.png`: shallow/intermediate areas are distinct from the deeper alternative, without covered physical landings caused by the water rendering.

Layout observations sent to the root agent separately: the corrected Holding arrival dock control clears the lighthouse. A transient Driftwood transfer receipt overlaps the distant Harbor light in its tide1 frame. Wide's upper island/group reaches the corner controls in its initial Overview. These are not water-field defects or claims of completed visual acceptance; any subsequent layout correction needs its own corresponding evidence and explicit source scope.

## Overview obstruction correction

The root agent confirmed the Wide upper-group/corner-control overlap as a task defect. The camera now receives the actual persistent control rectangles in canvas coordinates, measured at the cove/viewport/view-mode boundary. Expanded status, action cards and receipts do not become camera inputs. Static lighthouse/bell and every possible authored shore-group envelope provide stable protected subjects, independent of the current action or passenger arrangement.

`unobscuredOverview` first uses existing horizontal/vertical slack to translate the whole composition around individual controls. It keeps the complete existing world envelope inside the safe rectangle. Only when translation cannot resolve overlap does it try2percent scale steps, bounded at8percent reduction; it reports residual overlap honestly if no candidate clears everything. This does not recreate a continuous invisible HUD strip. Play, its automatic ferry framing, Home/story presentation and ordinary panning retain their existing paths.

Typecheck and all6view-unit checks pass. New checks require full-world fit, translation at unchanged scale around a real upper-right control, unchanged framing for repeated static inputs, and a bounded finite fallback for an impossible obstruction. The root's quick actual844×390 Wide Overview inspection found the upper faces clear. Full all-cove Overview controls/subjects, expanded-status stability and final integrated browser results are recorded by the root after this correction; earlier water-final4 captures retain their original source identity. No new water-rendering change was made for this correction.

## Remaining limits

Software-rendered native screenshots establish rendered appearance and measured state, not physical-phone perception, hardware performance or human visual acceptance. The inherited heading, overlap, portrait-loading, precise repeat-touch and listening limits remain open. Numeric depth and blocked/forecast labels remain the precise accessible rule explanation; water coloring does not replace them.

## Final integrated run

The final serialized batch passed14/14, including both water cases, all four cove regressions and the built-game rescue. `final/` contains fresh native frames and source manifests after the Overview/receipt corrections. The only later runtime change is the explicitly audited Overview-drag early return; unchanged fields/composition and the scope of reuse are recorded in `evidence-reuse-audit.json`. Actual post-guard recovery and rebuilt production rescue pass2/2 in `recovery-final/`. Original attempts above remain intact.
