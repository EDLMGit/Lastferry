# Last Ferry review — fuller wood and gentle arrival

## Disposition

**Ready for focused listening review; speaker approval pending.** This pass gives passenger contacts a longer, rounded wooden body and gives final rescue a three-stage, harmony-aware response. The accepted base score, accompaniment, gameplay, transfer events/timing, interface, water and sailing pace are preserved. The following interface redesign is not part of this milestone.

## Source and scope

- Repository: https://github.com/EDLMGit/Lastferry
- Draft PR: https://github.com/EDLMGit/Lastferry/pull/1; branch `m1-first-crossing`.
- Clean starting HEAD and task-selected comparison: `a4fc4658103b630a2ae527e8479ff66d7232dff3`. No newer local work was present or reset.
- Main observed at `386de54d20fdd4a513a06115471d70bf94738cc0`.
- Evidence is from that HEAD plus the recorded working-tree changes, except `before/`, which is an isolated exact Git archive of the clean starting commit. It is not relabeled as a later commit. Final pushed identity is reported in the handoff; source hashes identify the tested contents independently.
- Runtime edits are confined to `src/audio/wood.ts`, `src/audio/atmosphere.ts` and new `src/audio/arrival.ts`. No dependency or code comments added.
- Final 102-file source/test/document snapshot: SHA-256 `f214ca6c68e8729528fc51d7763a527637a61cff7f7c8c9626a0b30b26143a6a`, in [source-manifest.json](source-manifest.json). The existing-file diff is retained in `tested-changes.patch`; new source/test/helper files are included by the hash manifest and final commit audit.
- [Preservation audit](preservation-audit.json) compares the complete baseline runtime set: 40 of 42 files remain identical; the two expected existing audio files change, with the new arrival helper separately identified. This includes exact unchanged score/accompaniment, main, scene/transfer timing, UI, water, rules, all level data and package/lockfile.

## Actual sound choices

Wood retains 225/165 Hz fundamentals and 0.8 normalized buffer peaks. Lighter/full buffers become 220/270 ms, with slower 28/20 per-second body decay, a 5 ms onset, stronger damped middle resonances, reduced grain and a smooth 40 ms finish to zero. Existing light/full gains, group scaling, quieter settlement and compact reduced-motion scaling remain. No event positions, stale windows, animation delays or source budgets change. Signal tests establish boundedness and additional sustained body; they do not prove phone-speaker weight.

Arrival opens immediately at the accepted visible final-unload event, answers after 0.48 s and settles after 1.10 s; its final tail ends at 3.35 s. It uses the existing pad/pluck waves, softer 120/65/200 ms attacks and staged peaks 0.060/0.078/0.044. A small authored voicing selects pitches compatible throughout each note's lifetime, including the prior pad release, upcoming harmony and 75 s return. Partial delivery stays silent; actual redelivery can respond again.

Arrival has three independently owned dry sources. Its entire synthesized tail is cancellable, with no send into score reverb. Undo/mute/hide/interruption stop future notes and tails without resetting the score. Arrival cannot evict transfers or music; score pressure reclaims arrival before transfers. See [AUDIO.md](../../docs/AUDIO.md) for the precise design.

## Environment and run

Windows; Node 24.15.0/npm 11.12.1; Playwright 1.64.1, Chromium 156.0.8078.4, headless SwiftShader. Captures use **844×390, DPR 1, emulated touch**. The boundary browser check uses mouse/reduced motion at the same viewport. This is not a physical Android test.

```sh
npm ci
npm run dev
```

Production: `npm run build`, then `npm run preview`. Use `?cove=holding-pier`; Bellwater and First Crossing remain available through the menu. Installed lockfile dependencies were reused here, with no fresh installation claim.

Verification uses dev port5194 and production4184; isolated baseline capture uses5195. Set `LAST_FERRY_DEV_PORT=5194`, `LAST_FERRY_PRODUCTION_PORT=4184`, `PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright` in this workspace, and a fresh `LAST_FERRY_REVIEW_DIR` for browser checks. README retains fresh-clone browser installation instructions.

The initial command was `npx playwright test tests/e2e/transfer-audio.spec.ts tests/e2e/audio-polish.spec.ts`; the single-test repeat selected only `tests/e2e/audio-polish.spec.ts`. For the final run, dev5194 was already running: `npx playwright test --config=.cache/audio-polish-playwright.config.ts tests/e2e/transfer-audio.spec.ts tests/e2e/audio-polish.spec.ts`. The [retained temporary config](external-server-config.txt) imports the normal config and changes only its relative test/output paths and disables automatic server ownership. It does not change assertions, timeouts or browser options.

## Executed checks

| Check | Actual result |
| --- | --- |
| `npm run build` (includes `npm run typecheck`) | **Pass**. Existing bundle-size advisory remains in the browser-server build. [Log](build.txt). |
| `npm run test:unit` | **125/125 pass**, 16 files. Includes unchanged seven water tests, transfer timing/ownership, new real-sample-rate wood checks, all-cell arrival lifetime compatibility, dry routing, cancellation at four tail phases and score-priority pressure. [Log](unit-results.txt). |
| Initial focused actual-UI browser checks | **3/3 scenarios pass**: normal rescue/subsets/partial delivery/tide and terminal Undo; muted/hidden/reduced transfer lifecycle; arrival at the 75 s return with tail Undo/redelivery/mute. Runner stalled after reporting results and was interrupted; command exit was 1. Original output retained in [browser/browser-results.txt](browser/browser-results.txt). |
| Clean-snapshot boundary repeat | **1/1 scenario pass**, unchanged runtime and final test source. Same post-result runner stall/interruption, exit 1. [Output](browser-final/browser-results.txt). |
| Focused checks with existing external server | **3/3 pass, command exit 0**, 2.0 minutes. All scenarios repeated on the final unchanged 102-file snapshot. [Final output](browser-external-server/browser-results.txt), [phrase-return observations](browser-external-server/arrival-phrase-return.json), [normal transfers](browser-external-server/normal-transfers.json), [mute/hide/reduced lifecycle](browser-external-server/lifecycle-transfers.json). |
| Before/after actual-UI captures | **Pass**, both complete the nine-action rescue with tide Undo/replay, temporary unloading, boarding and final delivery. Existing source budget, single context/scheduler, no score drops, no browser errors. |
| Speaker/headphone listening and physical Android | **Not run — unavailable here.** Actual runtime audio retained for the user's listening check. No audible approval inferred from signal metrics or mocks. |
| Unrelated full browser/layout/performance campaigns | **Not run.** Existing layout/scene evidence reused because those implementation files are identical. |

[Development results](development-results.json) preserve the initial two signed-zero wood assertions and one overly narrow arrival-register assertion, and their corrected 4/4 focused reruns. Runtime synthesis was not changed to satisfy those assertion corrections. The independently supplied baseline result remains **110 pass / one unchanged-water timeout**, followed by an isolated **7/7 water pass**; it is distinct from this pass's 125/125 result. Water code and timeouts are unchanged. Historical browser failures keep their original status in [the transfer review](../transfer-audio/REVIEW.md).

The original browser snapshot guard rejected a changed test file. [The exact audit](browser/source-audit.json) reconstructs the prior SHA by restoring only an unused helper and type import; all remaining 101 files, including runtime, are identical. No test action/assertion/timing changed. Original manifests remain untouched. The clean-snapshot repeat and external-server run use the final hash. No application check is reported as passing merely because the runner was interrupted: scenario outcomes come from recorded assertions and Playwright's per-test results.

## Gameplay and actual runtime audio

Commands:

```sh
node tools/capture-audio-polish.mjs --base=http://127.0.0.1:5195 --root=.cache/audio-polish-before --revision=a4fc4658103b630a2ae527e8479ff66d7232dff3 --output=reviews/audio-polish/before
node tools/capture-audio-polish.mjs --base=http://127.0.0.1:5194 --output=reviews/audio-polish/after
```

See each capture's source metadata and the [comparison](capture-comparison.json) for exact invocation, environment and timing. Both sessions use the same UI route, but are not sample-aligned: human-equivalent action waiting, startup gain ramp observation and music phase differ. No normalization, export gain or replacement soundtrack was applied.

| Evidence | Location and result |
| --- | --- |
| Before runtime mix + canvas | `before/raw/holding-runtime-audio.webm`; 28.49 s, VP9/Opus stereo 48 kHz, eight played contacts, one arrival. Exact baseline runtime SHA-256 `383ccdd71958e7668bf936a94ee3398ed38ee83c6f045091f3c2246899824ade`. |
| After runtime mix + canvas | `after/raw/holding-runtime-audio.webm`; 28.87 s, VP9/Opus stereo 48 kHz, seven played contacts, one arrival/three voices. One sheep settlement correctly expired at progress0.9294; crossing, rabbit settlement, holding unload and final unload played. No retries. Runtime SHA-256 `d53af122f76cce2e0afdb8fc1177b2d77345fd1d0293bdf4d13958066b944d14`, unchanged during capture. |
| Full interface, silent | `before/raw/holding-full-interface-silent.webm` and `after/raw/holding-full-interface-silent.webm`, same respective sessions. Canvas/audio captures exclude DOM controls. |
| Fresh actual gameplay screenshots | [Before start](before/phone-start.png), [before success](before/phone-success.png), [after start](after/phone-start.png), [after success](after/phone-success.png). All inspected at native 844×390. |
| Reused unaffected visual evidence | [Critical boarding](../transfer-audio/capture-complete/phone-critical-boarding.png), [after tide rise](../transfer-audio/capture-complete/phone-after-rise.png), and [780×320 action](../transfer-audio/browser-initial/780x320-current.png). Their original provenance remains intact; audio changes do not alter the audited scene/UI source. |

Both runtime videos and silent interface videos decode successfully. Mean/peak levels are before −36.6/−22.4 dBFS and after −36.6/−22.6 dBFS; these whole-run measurements are not perceptual approval or a controlled loudness comparison. Raw media stays local/ignored, unavailable in a fresh clone. Selected stills and compact source/verification records are committed. [Evidence retention](evidence-retention.json) identifies byte-preserved verbose observations in local raw folders and their derived summaries; original failure logs and manifests are unchanged.

## Findings and limitations

No confirmed runtime defect in the completed checks. New harmony tests cover early/middle/near-boundary positions and the complete phrase return; they establish pitch compatibility, not musical satisfaction. Speaker balance, perceived wood, arrival reward and audible cancellation smoothness await listening, primarily on the user's Android speaker and secondarily headphones.

The private playtest Site was separately updated to starting `a4fc465`; this pass does not deploy the polish. GitHub remains the game source. The interface redesign waits for its own pass, and existing short-phone card occlusion is unchanged. Stop after this audio milestone.
