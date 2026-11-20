# Readable passenger previews and painted cove panels

## Source and scope

Started clean on `m1-first-crossing` at reviewed `a4325353cf11cd4edba8d5384b58fe138e4772e3`. The task and supplied companion directory were found in the parent workspace and copied into the repository without replacing runtime or inventory files. `supplied-source.json` retains the original input hashes; the material CSS is deliberately editable runtime source. The SVG remains one original source.

This is the scoped two-stage implementation of `NEXT_TASK_COVE_PANEL_REFINEMENT.md`. The user likes the current buttons/icons; their material and semantics remain. The panel refinement is not yet human accepted. The private Site remains version 10, game `8052cfcd67f2e56cf3258243618c4ce125d51c4b`, hosting source `f9ada70cbd093bf52c105f2287558381b3b7c83c`. This pass is not deployed.

## Reproduced defect and correction

The actual Holding Pier UI reaches Harbor with Pip, Rue and Moss aboard. Before confirming Bring home, the old single flex row squeezes each check/name/cost into a narrow tile while its capacity span refuses to wrap. The five-size baseline capture measures individual text lines and nested overflow. The 844×390 image visibly clips full costs and shows underlying controls through the reading panel; the previous two-rabbit capture did not expose this state.

Choices remain native buttons, in original reading order, with IDs and `aria-pressed` unchanged. A shared content helper places check/name on the first row and the complete capacity across the second. The group chooses columns from available width; essential text stays 16px and targets at least 48px. Intrinsic sizing and wrapping fix the excess; no new horizontal clipping mask hides it. The fixed transfer-sheet height and existing placement logic remain, keeping Confirm stable across subset selection.

The winning preview now says “Everyone will be safely home at Harbor.” The projected summary begins “After this action,” reports the resulting load/tide, and distinguishes the current tide when a rise is proposed. Committed status keeps present tense. No rule, action timing or victory trigger changes.

## Material decision and inventory

The single runtime source is `cove-panel-package/material/cove-panel-material.css`, imported by the existing shared UI stylesheet. Its sibling `shoreline-corner.svg` is the only vector source. The opaque painted face uses the supplied upper/main/lower colors `#2b5356`, `#1b434b`, `#123741`, sage rim `#9eb5a5`, dark lower lip `#0b2d36` and sparse 5.5%-opacity corner curves. Missing decoration leaves an opaque fallback. The ordinary, compact-without-motif and warm-arrival variants share this source; layout dimensions and native dialog ownership remain application-owned.

Buttons retain their praised palette and relief. No new backdrop blur, grain, shader, animation loop, font, audio, dependency or baked text. Material focus keeps a contrasting outline/keyline; flood warnings retain their text, symbol and edge. The corner stays decorative and cannot intercept input.

Updated existing families only: `ui.component.panel`, `material.cove-ui-tokens`, `ui.component.passenger-choice`, `ui.surfaces`, `ui.dialogs`. The canonical catalog keeps all 71 IDs and retired/provenance records. The development gallery shares the actual material/helper and adds ordinary/compact/arrival, warning/focus and constrained three-passenger/stress examples. Design specimens do not count as gameplay captures.

## Verification and evidence

Windows, Node 24.15.0, Playwright 1.64.1 and Chromium 156.0.8078.4 / SwiftShader / DPR 1. Phones are emulated touch with the common Segoe UI / Arial system stack; ordinary wheel scrolling exposes lower content. [Browser checks and exact commands](BROWSER_CHECKS.md) distinguish native API execution from physical-device evidence.

| Check | Actual result |
| --- | --- |
| `npm run build` | PASS, including TypeScript; existing bundle-size advisory remains. [Log](gates/build.txt) |
| `npm run typecheck` | PASS again after final browser-test additions. [Log](gates/typecheck-final.txt) |
| `npm run test:unit -- --maxWorkers=1` | 203/203 PASS across 28 files. Includes new future-preview/committed-state/Undo case. [Log](gates/unit.txt) |
| `npm run check:assets` | PASS, 71 families. [Log](gates/catalog.txt) |
| Five focused browser cases | 5/5 PASS in one 1.7-minute run. New Harbor case plus existing portrait focus, touch pan, cold-touch audio and native fullscreen regressions. [Results](browser/automation-results.json) |
| Actual UI rescue capture | All six runs PASS; no state injection. Tide Undo, all Harbor subset counts, cancellation, arrival, terminal Undo and redelivery. [Measurements](after/capture-manifest.json) |
| Gradient/motif contrast | 272 checks across 13 actual UI stages PASS: 153 text (minimum 4.6331), 81 icons, 18 borders, eight focus keylines, 12 selected fills. Actual SVG colors are composited over all gradient stops; unparsed layers fail. [Results](contrast.json) |
| Reduced motion | All 13 measured Settings buttons have zero decorative transition duration. Protected world motion remains unchanged. |
| Gallery stress | 18 choices and 39 text-line fragments PASS at 400px/320px panel widths, including 20px (125%) longer-name stress. Design evidence only. [Measurements and reuse](gallery/measurements.json) |

All five baseline Harbor states fail the same five fit checks: preview and group overflow, plus three clipped full choice labels. The corrected per-line and nested checks pass at the five required sizes and extra 320×740. Full names and costs remain 16px; actual tiles are 62px high. No overflow is excused by a hidden scrollbar. [Matched comparison](matched-comparisons.json):

| Native viewport | Preview scroll/client width, before → after | Matched gameplay images before Confirm |
| --- | --- | --- |
| 844×390 | 375/338 → 338/338 | [Before](before/844x390-harbor-preview.png) / [After](after/844x390-harbor-preview.png) |
| 780×320 | 357/310 → 310/310 | [Before](before/780x320-harbor-preview.png) / [After](after/780x320-harbor-preview.png) |
| 390×844 | 382/348 → 348/348 | [Before](before/390x844-harbor-preview.png) / [After](after/390x844-harbor-preview.png) |
| 360×740 | 362/318 → 318/318 | [Before](before/360x740-harbor-preview.png) / [After](after/360x740-harbor-preview.png) |
| 1440×900 | 397/370 → 370/370 | [Before](before/1440x900-harbor-preview.png) / [After](after/1440x900-harbor-preview.png) |
| 320×740, extra | Final checks pass | [After](after/320x740-harbor-preview.png) |

Matched states are turn 8, tide 2, Pip/Rue/Moss aboard, all selected, before Confirm. Natural water/lighthouse phase is not artificially synchronized. Initial ferry width ratio is exactly 1 and HUD heights are unchanged at every matched size. The fixed footer and dialog edges stay within 1px through selection changes; camera, history, passengers, turn, tide and HUD remain unchanged. Before commitment there is no homecoming, animal celebration, arrival push or victory reduction. Native-button name/glyph activation, disabled empty selection, partial delivery and full Undo pass.

Inspected 53 images at original dimensions: all 48 final captures and five matched Harbor originals, recorded in [native inspection](native-inspection.json). [Short-phone future consequence](after/780x320-harbor-consequence.png), [full warning](after/780x320-warning-scrolled.png), [Menu](after/844x390-menu.png), [Settings](after/390x844-settings.png), [ordinary play](after/844x390-play.png) and [arrival](after/360x740-arrival.png) show actual gameplay. Short screens deliberately scroll vertically for lower consequence/details; Close and Confirm remain available. All final images are retained; redundant earlier images are preserved locally in the ignored archive with hashes in `archive-map.json`.

The actual Windows in-app browser also entered/exited native fullscreen with the new production Menu visible and focus retained, then opened Settings. Its native-size images were inspected through tool output; no exported screenshot is claimed. [Observation](supported-surface-observation.json). The checked production files are identified in [build identity](build-identity.json).

[Uninterrupted gameplay](gameplay-844.webp) retains the entire 38.8-second native 844×390 recording at natural speed, including preview inspection, all subsets, warning scrolling and rescue/Undo. The silent 8fps WebP has 300 decoded frames and 38.75-second duration after endpoint rounding. Original VP9 is local/ignored; [recording source and hashes](VIDEO_EVIDENCE.json).

## Source, originals and reproducibility

Evidence was captured from baseline HEAD plus the recorded working tree, not a future commit. After-capture runtime SHA-256 is `dcea96f3f613b61c2dd76914ff134407d66d8d4dfab5ff08a6d680042ea2c054` ([source](after/source.json)); baseline is `cfe1a52512136bcfd18a7e9143133f6f6799116822e8b56c0f93f8fed163ba59`. The final 219-file source snapshot is `eb7383968b176a081421391ad05c6394ff7d2525bb91281422144428cc0406ec` ([manifest](source-manifest.json)). Scope-specific hashes differ because they include different files; gallery-only catalog metadata reuse is explicitly documented.

The [protected-source audit](protected-source-audit.json) checks all pre-existing runtime/data/build/dependency entries: 52 unchanged (exact or Git newline normalization), six expected shared UI/gallery changes. Rules, all cove data, audio/fullscreen engines, world/water/wake/headings/sailing/lighthouse and camera/placement logic remain unchanged.

Original baseline failures are retained. The first exploratory short-phone run unexpectedly reset after a successful redelivery while a catalog write occurred. A development reload is plausible but unproven without the original navigation trace. This remains an **inconclusive concurrent-development run**, followed by a source-frozen traced pass and all six final passes. Initial contrast setup/data-URI parser failures and their corrected checks are retained too. [Preparation record](PREPARATION.json). No test threshold or action delay was relaxed.

Install/run with Node 24: `npm ci`, then `npm run dev`. Production: `npm run build`, then `npm run preview`. Developer gallery: `/asset-gallery.html` on the development server. No new dependencies. Full capture/browser commands are in `BROWSER_CHECKS.md`; contrast and gallery commands are `node tools/check-cove-panel-contrast.mjs` and `node tools/check-cove-panel-gallery.mjs` with their documented local server defaults/options.

## Preserved limitations

- The existing current-location card can cover the dock on constrained layouts; reachable Close exposes it. This pass does not redesign placement.
- The prior delivered-heading observation remains open; sailing behavior is unchanged.
- Rapid touch within ≤180ms remains unverified; older timing misses are retained.
- No physical Android, other-engine, native-GPU performance or new acoustic approval is claimed. Silent recordings establish visual interaction only.

- Existing lower-detail scrolling is intentional; the panel can still overlap the dock until closed. Human approval of this new material remains pending.
- No fresh full UI rescue in the other two coves or all-history browser run is claimed; unchanged sources and current units cover their rules.

**Implementation and focused verification complete; ready for ChatGPT review.** Implementation commit `28f6d30a5199c3450cc5ff826bf8b5f9bd476182` matches all 219 tested source entries (211 exact, eight Git newline normalization only), all 78 selected PNGs and the animated WebP byte-for-byte. Twenty supplied input files remain original; only the candidate material CSS is intentionally edited. All 78 capture-runtime entries and both capture/measurement helpers remain exact. Later browser-snapshot differences are catalog metadata and two guidance documents only. [Packaging and reuse audit](packaging-audit.json). The following metadata-only commit records this audit and continuity; final pushed SHA and remote equality are in the PR/handoff.

PR #1 stays draft against unchanged main `386de54d20fdd4a513a06115471d70bf94738cc0`. The private Site remains version 10/game8052cfc/sourcef9ada70. No deployment occurred.
