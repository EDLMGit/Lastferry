# PLAY_READABILITY_01 review

## Disposition and source

**Ready for review.** Implementation `c53b241a05e4dfcc955bfb85669eabf21c553dad` is complete. [Packaging audit](packaging-audit.json) matches86 source/input files (77 exact,9 newline-only) and117 selected media files to that commit. A following metadata-only commit records this audit; its exact pushed SHA is in PR1 and the handoff. Human visual and physical-phone acceptance remain separate.

Started clean on `m1-first-crossing` at `52f72d6cdb1caa292425511394f4a11efa024a61`, retaining reviewed runtime `7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695`. The exact supplied task resolved at `C:/Users/ernes/Documents/last-ferry-codex-starter/LAST_FERRY_PLAY_READABILITY_PACKAGE/NEXT_TASK_PLAY_READABILITY.md`; all nine package files are retained byte-exact beside package.json in the actual Lastferry Git root. No reset or unrelated work was overwritten.

Evidence was captured from that HEAD plus identified working-tree changes. Per-batch manifests record source hashes and before/after identity; packaging-audit.json records their comparison to the implementation commit. The final pushed metadata commit and remote equality are reported in PR1 and the handoff. Earlier attempts are not relabelled as final-source evidence.

## Changes

- Removed the continuous HUD and its invisible full-width camera/layout strip. Independent Undo, Wait, Menu and Sound controls, expandable load/depth status and the occupied-pier deadline use visible obstacle rectangles. Camera bounds stay stable while information expands.
- Free named location inspection exposes one nearby Sail action and optional Details. A blocked passage states the exact depth comparison. A legal losing Sail names the actual endangered passengers and pier before committing once, with no second dialog. Revalidation, input fences, direct transfers/subsets and complete Undo remain. Dock actions return on closing destination inspection or selecting the current place. Placement prioritizes the selected card, and visible markers avoid chrome with honest endpoint leaders.
- Shared static bathymetry follows canonical curved edges and authored base depths in the existing fields: broad irregular shallow banks, quieter intermediate beds and deep node/route pockets. Tide changes optical depth at the preserved 0.18 height scale; loading does not move or recolor the bed.
- Harbor uses a bounded local foreground composition: supported quay, nearby empty ferry, grouped Rue/Pip/Moss and lantern, with captions related to the group. Five seconds, caption at1.05s, contact cue at3.2s, existing Sound owner and explicit continuation are unchanged.
- Canonical planning records the user's negative Wide Berth difficulty feedback and proposed four-space C4/C5 before a later six-space launch. No future cove, campaign reordering, save migration or changed launch trigger is implemented.

All five level files, reducer/session, campaign registry/progress/presentation, ferry/transfer/headings/wake/effects, seven audio sources and two publication receipts match the baseline after newline normalization: [25-file preservation audit](preservation-audit.json). All79 asset IDs remain; [12 existing families](asset-changes.json) and their gallery/ledger provenance are updated. No new asset family or external image is introduced.

## Environment and checks

Windows; Node24.15.0, npm11.12.1; Chromium156.0.8078.4 / Playwright1248, ANGLE SwiftShader, DPR1. Phone input is emulated touch. Native320x740,390x844,780x320,844x390,1440x900 and Harbor2048x930 are covered. Production smoke uses a fresh Vite build; development state APIs only observe the other real-UI sequences.

| Check | Result | Scope |
| --- | --- | --- |
| `npm run build` including `npm run typecheck` | PASS | Fresh production bundle; existing >500kB advisory retained |
| `npm run test:unit` | PASS,395/395 | 41files; five water and two view cases added. After the final one-line recovery guard,6/6 focused view checks pass; full-suite scope is retained honestly |
| `npm run check:assets` | PASS |79 unique families; all IDs retained |
| Native controls/Sail/Overview | PASS,5/5 | Five sizes; free inspection/Details, hit ownership, keyboard, inline loss/Undo, touch/pan, rotation, actual fullscreen, Reduced Motion/mute |
| Water matrix | PASS,2/2 | Holding/Driftwood3tides, light/heavy, Play/Overview/label-free diagnostic, blocked-to-legal, tide Undo/replay; Bellwater/Wide initial water smoke |
| Harbor held beats | PASS |12 native frames/four explicit handoffs;85 focused story units reused within full suite |
| Actual Holding and Driftwood rescues | PASS |9/12actions, subsets/warnings, tide/terminal Undo; earned Harbor and explicit Bellwater, practice bytes unchanged |
| Cove regressions / production smoke | PASS,4+1 | Bellwater/Wide actual loaded/subset/camera checks, Home/settings/mute, First Crossing; built Holding rescue without DEV API |
| Final Overview drag recovery / rebuilt production | PASS,2/2 | Actual844/780 touch drag preserves Whole-cove frame; Play still pans/returns; final rebuilt rescue/tide/terminal Undo |

The serialized final batch passed **14/14 in5.7minutes**. A separately exercised Overview drag then reproduced a loss of obstacle-aware framing. One early return in `World.panByPixels` keeps the complete Overview fixed; Play panning remains intact. The original failure,6 focused view units and2/2 corrective browser results are retained. [Evidence reuse audit](evidence-reuse-audit.json) proves that this is the only runtime change after the14-case batch/movie:73 of74 files remain byte-identical; the changed function is outside those recorded sequences. No earlier capture is relabelled as a different source.

[Browser checks/original failures](BROWSER_CHECKS.md), [journey ledger](JOURNEY_CHECKS.md), [water ledger](WATER_CHECKS.md) and [Harbor observations](HARBOR_OBSERVATIONS.md) distinguish product findings, fixture errors, interrupted/capture attempts and corrected results. No failed attempt is rewritten as a pass.

## Selected actual evidence

- [Portrait start](final/390x844-start.png), [320px start](final/320x740-start.png), [expanded status](final/390x844-expanded.png), [short-landscape expanded](final/780x320-expanded.png), [desktop](final/1440x900-start.png).
- [Safe Sail](final/390x844-safe-sail.png), [blocked passage](final/780x320-blocked.png), [inline losing Sail](final/780x320-inline-loss.png).
- [Holding shallow ordinary Play](final/water/holding-390x844-tide0-shallow-play.png), [light-load bank](final/water/holding-390x844-tide0-light-overview.png), [after rise](final/water/holding-390x844-tide1-overview.png), [tide2](final/water/holding-390x844-tide2-overview.png).
- [Driftwood ordinary Play](final/water/driftwood-780x320-tide0-shallow-play.png), [label-free diagnostic](final/water/driftwood-780x320-tide0-shallow-play-label-free.png), [tide1](final/water/driftwood-780x320-tide1-overview.png), [tide2](final/water/driftwood-780x320-tide2-overview.png). Label suppression is review-only; it is not a game mode.
- [Harbor wide placement](harbor-second/2048x930-placement.png), [portrait endpoint](harbor-second/390x844-end.png), [short-landscape endpoint](harbor-second/780x320-end.png). Beginning/placement frames are held with actual Pause, which reveals captions; the uninterrupted movie separately covers natural timing.
- [Uninterrupted actual Holding rescue and Harbor connection](final/actual-holding-harbor.mp4), with native timestamps and original runtime audio; [recording provenance](final/actual-holding-harbor-encoding.json). [Final built boarding](recovery-final/844x390-production-boarding.png) and [arrival](recovery-final/844x390-production-arrival.png). [Corrected overview drag](recovery-final/844x390-overview-drag.png). No reference or mockup is presented as gameplay.

## Visual decision and limits

Native inspection drove two additional UI corrections after functional checks: a deadline capsule intercepted Driftwood's next target, and short-landscape cards overlapped view/Undo controls. New hit-owner/chrome-overlap checks and actual rescue/recovery verify the corrections. Wide Overview initially hid its upper animals under Undo; a stable bounded composition now moves around measured controls while retaining the complete cove and preserving Play/pan. Five native actual-roster/lighthouse clearance checks pass. Transaction receipts also avoid lighthouse/bell landmarks. Bring home no longer covers the Holding lighthouse in the final tide2 Overview. The shallow fields visibly follow curves while deeper pockets remain blue; whole-cove portrait necessarily uses smaller animals. Harbor is a coherent group instead of independently spread objects. Selected native images were opened at their actual dimensions; these observations are not the user's visual acceptance.

Inherited intermittent portrait loading, constrained Bellwater overlap, delivered-heading and precise <=180ms repeat-input limits remain open. The final rapid-touch sample was528.6ms; the earlier isolated sample was197.1ms. Both committed one busy-window move and neither proves the inherited<=180ms bound. Physical Android, other engines/fonts/screen readers, native GPU performance and human listening approval are not verified. Sparse software capture and stalls are not phone FPS. No new narration/audio arrangement or exhaustive historical browser rerun is claimed. Wide Berth's mandatory campaign difficulty remains unaccepted; future recalibration needs its own prototype and playtest.

## Run and publication

Node24: `npm ci`, then `npm run dev -- --port 5270 --strictPort`.

[Local Journey](http://127.0.0.1:5270/) · [Holding practice](http://127.0.0.1:5270/?cove=holding-pier) · [Driftwood practice](http://127.0.0.1:5270/?cove=driftwood-yard).

**Not deployed.** The existing owner-private Site remains version13/game `7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695`, hosting `c24aa6528675bc278de848e111ee73f9e22810ac`. Its confirmed receipt and earlier history are preserved. This GitHub push is a separate review build; PR1 stays draft and main unchanged.

## Subsequent user-requested publication

Published successfully as owner-private Sites version14 on2026-11-01, game `2e4f99268da4691b315fe8467d9e539cda15e927`, hosting `d01264d26cb7b5abaf68920a9014718ab21d97b4`. All seven production files match the fresh game build byte-for-byte. [Receipt](deployment-confirmation.json), [build audit](site-build-audit.json), [source audit](site-source-audit.json). Earlier no-deployment prose records the original implementation handoff. No new physical-phone or human listening claim.
