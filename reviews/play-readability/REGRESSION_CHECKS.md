# Focused existing-cove regression checks

The four requested smoke cases passed through the actual UI. These runs precede the final Overview camera and receipt-clearance corrections. Their source manifests identify that earlier working tree; they are not presented as final visual acceptance. The subsequent focused Overview/production evidence covers the changed presentation.

Environment: Node v24.15.0, Playwright 1.64.1, Chromium 156.0.8078.4 / revision 1248, ANGLE SwiftShader, Windows, local development server `http://127.0.0.1:5282`. Native CSS viewports 390×844 and 780×320, DPR1, emulated touch, natural keyboard. One browser worker; action timeout 15 seconds; navigation timeout 20 seconds. No game-state mutation, forced click, fixture-only gameplay renderer or save injection.

## Passed cases

| Case | Actual actions and checks | Retained result |
| --- | --- | --- |
| Bellwater | First two moves from the shallow-outward witness; inspect rabbit subsets without commitment; board both; native Play/Whole-cove frames in both orientations; inspect an unloading subset's real flood-loss warning without committing it; Undo restores the entire prior state. | `regressions-fourth/automation-results.json`, 18.3 seconds |
| Wide Berth | Four-action prefix of stage-sheep-light-return witness; four bodies/six spaces aboard at High Quay; native Play/Whole-cove frames in both orientations; choose Alder and Clover, leave Poppy and Wren aboard, commit once; Undo restores the full-six state. Full labels, native pressed state and 44px minimum chooser targets checked. | `regressions-fourth/automation-results.json`, 27.4 seconds |
| First Crossing | Original two-rabbit initial roster, native Play/Whole-cove frames at both sizes, free Harbor inspection, Escape returns focus, practice remains an independent entrance. | `regressions-third/automation-results.json`, 7.4 seconds |
| Home | Touch enables Sound; Home controls fit both orientations; natural Tab/Enter opens Options and mutes Sound; Back restores Home Options focus; stored mute is true, gameplay stays inert and turn/state unchanged. | `regressions-third/automation-results.json`, 6.4 seconds |

These are bounded regressions rather than new full-rescue claims. The task's uninterrupted rescue evidence is recorded separately.

## Native frame inspection

Opened at native size: `regressions-fourth/bellwater-loaded-390x844-play.png`, `bellwater-loaded-780x320-play.png`, `wide-full-six-390x844-play.png`, `wide-full-six-780x320-overview.png`, `wide-780x320-staging-subset.png`, and `regressions-third/home-780x320-settings-muted.png`.

The occupied ferry and local controls are legible in the Play frames. The Wide Berth chooser shows all four names and capacities, both sheep selected, both rabbits unselected, and the full named commit in short landscape. Home Settings fits with its sound state, Motion selector and Back control.

The pre-correction Wide Berth Overview shows the remote upper shore group obscured by corner chrome. This does not pass visual acceptance. It matches the independently reproduced obstacle issue and is retained as pre-fix evidence; the final camera correction and replacement captures are owned by the main verification run.

## Source identity and originals

Both passing runs record Git HEAD `52f72d6cdb1caa292425511394f4a11efa024a61` plus exact SHA-256 hashes for their working-tree source, data, dependency manifests and executed test/helper. Each run has `regressions-source-before.json`, `regressions-source-after.json`, and an executed spec copy. The fourth run's complete manifest hash is `22ec0389d49af292b73e4ed73ce720b94b4efc7cbc54d3f6dd7e4225a60fcc16`, unchanged from before to after. The final report identifies any later runtime changes separately.

Original failures are retained:

- `regressions-first/collection-failure.txt` and JSON reporter: Node required JSON import attributes during test collection; corrected witness loading to `readFileSync`/`JSON.parse` before any gameplay ran.
- `regressions-second/automation-results.json`: source-manifest setup assumed an optional `public/` directory existed. Guarded that directory; no runtime change.
- `regressions-third/bellwater-original-failure.md`: the fixture observed Back to boat before a Play-view toggle had settled, then tried tapping its now-hidden control. Awaited two real animation frames before inspecting camera controls. The test retained ordinary touch activation.
- `regressions-third/wide-original-failure.md`: the new fixture expected tide level 1 after turn 4. Wide Berth's unchanged first rise is after turn 5; corrected the test expectation to the authored level contract. No gameplay data changed.

The third run passed Home and First Crossing and failed the above two fixtures. Only the two affected cases were rerun; both passed in the fourth run. JSON reporters originally landed beneath `.cache/` because their config lived there; exact originals were copied into the corresponding review directories without alteration. `regressions-fourth/executed-config.ts` records the execution settings.

No physical-phone or human-listening approval is claimed. Sound verification here concerns intent/mute state and focus, not perceptual audio quality. The remaining inherited timing and device limitations stay in the main review.

## Final integrated run

The final serialized batch passed14/14, including both water cases, all four cove regressions and the built-game rescue. `final/` contains fresh native frames and source manifests after the Overview/receipt corrections. The only later runtime change is the explicitly audited Overview-drag early return; unchanged fields/composition and the scope of reuse are recorded in `evidence-reuse-audit.json`. Actual post-guard recovery and rebuilt production rescue pass2/2 in `recovery-final/`. Original attempts above remain intact.
