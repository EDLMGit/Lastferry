# Last Ferry review — story foundation

## Disposition

**Ready for ChatGPT review, with recorded existing limitations.** Final production build/TypeScript, all 261 unit checks and asset validation pass. Ten distinct focused browser checks pass across the retained eight-pass/one-failure batch and three-pass targeted follow-up. The original cold-touch fixture precondition failure is preserved; the corrected strict cold-context check passes with native audio activation/background recovery. Actual two-cove journey, reloads, storage handling, practice isolation, keyboard/fullscreen and production play pass. All 33 final-run screenshots have been inspected at native size. Actual moving evidence and source/reuse audits are retained; final commit identity is added in the handoff. Human story/pacing approval and deployment are separate.

## Source and scope

Implementation commit: **`ca59e78fb877024296c1484eb6b5fee8b8e66717`**. The following handoff commit adds audit/continuity metadata only; its exact identity is reported in PR #1 and the final handoff. [Packaging audit](packaging-audit.json) verifies all 275 source entries, 40 selected PNGs plus the uninterrupted WebP, and five supplied originals against committed blobs: 305 entries byte-exact and 12 text entries differing only by Git newline normalization. The final runtime hash is `d6f92b376088544ebe1dbf3671181d2b8e2dc34fae405a16eb0c563a57e8054a`. Code/tests/source whitespace checks pass; preserved raw build-output and patch context contain their original trailing spaces.

- Repository: https://github.com/EDLMGit/Lastferry
- Existing PR: https://github.com/EDLMGit/Lastferry/pull/1 — draft; branch `m1-first-crossing`.
- Reviewed comparison base: `1a85874883af5caa59f6294a75495eccf2afebbc`, explicitly supplied by the user; checkout was clean at task start.
- Evidence source: that baseline plus the identified working-tree story changes; [initial capture source](runtime-source.json), [final runtime source](final-runtime-source.json) and [implementation patch](implementation.patch) retain the actual execution identities. The final Git commit is recorded in the packaging/handoff below when created, without relabeling captures.
- Task: [`NEXT_TASK_STORY_FOUNDATION.md`](../../NEXT_TASK_STORY_FOUNDATION.md), explicitly superseding historical M1-only scope around the two existing story coves.
- Protected scope: all three authored puzzles and rules, accepted world/assets, portraits, nearby previews, native dialog/fullscreen owner, audio intent and mix, sailing timing, boat headings, wake, lighthouse, and complete in-session Undo.
- Excluded scope: new coves/animals/boat/current rules, larger campaign scenes, mid-puzzle save, backend/cloud accounts, new music and automatic deployment.

The active task, three campaign direction documents and publication receipt are copied byte-for-byte from the supplied parent-workspace files. [supplied-inputs.json](supplied-inputs.json) preserves hashes; future direction in those documents is not counted as implemented or verified content.

The full journey and `browser/` captures use runtime hash `35b68fd65b0985d1bdf142be097164489deb20d9961fe0393afc6c19bf32ab0f`. Final runtime hash is `d6f92b376088544ebe1dbf3671181d2b8e2dc34fae405a16eb0c563a57e8054a`; `final-checks/` covers its narrow return-to-title camera guard, strict cold audio/background and fresh production entry. The reuse audit proves that reversing only that `src/main.ts` guard reproduces the original capture source hash. Earlier captures retain their actual source identity, not the later commit's label. [evidence-manifest.json](evidence-manifest.json) records each image's source/hash, native dimensions and production assets; [protected-source-audit.json](protected-source-audit.json) verifies 138 of 143 pre-existing runtime/data/assets/configuration files byte-identical and exactly five expected modifications, none unexpected.

## Implemented journey and checkpoint policy

The default URL opens a compact title with New journey, Continue journey when valid, Practice and Settings. `src/campaign/registry.ts` contains exactly two story entries backed by the existing level references: Holding Pier, then Bellwater. Its separate practice list contains all three original puzzles. Explicit `?cove=first-crossing`, `?cove=holding-pier` and `?cove=bellwater` links keep direct gameplay and do not instantiate/read/write journey storage. Unknown query values cannot corrupt progress.

The version 1 local record stores only a validated stable checkpoint, accepted cove completions and acknowledged scene IDs. Its key is `last-ferry.journey.v1`, separate from Sound/Motion preferences. Schema, supported version, known IDs, order and relationships are checked before use. Malformed/unsupported/unknown records remain intact until explicit replacement. Storage denial or failure keeps an in-memory journey with a truthful persistence notice.

**Progress is saved between coves. An unfinished cove starts again.** A won reducer state, preview, arrival animation, completion card or Undo never accepts campaign progress. Only Continue story after a completed rescue performs the coherent acceptance operation. Holding acceptance records its completion and pending Bellwater scene together. A reload resumes that pending scene's readable end frame; subsequent Continue acknowledges it once and enters untouched Bellwater. Bellwater's explicit continuation records completion and opens the honest endpoint: both coves are safe, and the next part is still being made.

Until departure, the completed cove remains fully undoable. Reloading before departure restarts its original checkpoint, even if the final delivery was already visible. Returning to title explains loss of current moves/Undo before confirmation. New journey confirms replacement while preserving preferences. Restart/replay/practice cannot farm or overwrite accepted progress. Full mid-puzzle resume with complete Undo and coherent presentation recovery remains deferred and required before shipping the longer phone campaign.

## Scene staging and lifecycle

The opening retains the actual Holding start: Moss aboard at Stone Pier. All three authored caption lines are visible together from the beginning and remain on the settled frame. Optional eight-second motion reuses the existing lighthouse, water and idle boat movement; no cinematic departure, automatic game action or new renderer is introduced. Skip animation immediately settles the same complete copy. Reduced Motion and restored pending scenes begin still. The player explicitly continues; elapsed time never advances a puzzle.

`World.setStoryFraming` is an opt-in, bounded fit for the existing lighthouse, ferry and aboard passengers in the scene space above a portrait caption or beside a landscape caption. It does not change normal Play/Whole cove framing. The first native 320px comparison showed the ferry hidden behind the reading card; the story-only fit now makes that silhouette visible while keeping full caption text. Final native phone and desktop screenshots verify this composition. This is an implementation/inspection decision, not human visual acceptance.

The Holding connection begins only after Continue story, keeping the real won Harbor arrival with Pip, Rue and Moss safe. Its exact caption names Bellwater. No victory cue is replayed merely by opening it. When restoring a pending connection after reload, a presentation-only safe Harbor arrangement supplies the readable context without replaying a rescue, modifying the active Session or synthesizing arrival sounds. The completed-prototype restoration similarly uses Bellwater's safe Harbor as presentation context.

One active world is disposed/recreated only when a boundary needs a different scene or initial cove. There is one sound owner and the existing native dialog/fullscreen owner. Story controls fence map input; backgrounding settles pending motion safely. New/Continue gestures use the existing audio activation path and preserve an explicit mute. Full captions communicate the whole meaning without sound.

## Assets and continuity

[ASSETS.md](ASSETS.md) records the one new `ui.story-presentation` family. The catalog contains **73 families**, preserving all 72 prior IDs/retirements. Existing painted panels, controls/icons, models/portraits, water, lighthouse and sound are reused. The gallery imports the runtime caption/policy sources; its static specimens are design evidence, not gameplay. No generated image/audio, new font/model, dependency or second renderer is added. Caption/staging/controller sources remain editable.

The supplied [publication receipt](../../review/deployment-confirmation.json) confirms the existing owner-private Site at **version 12**, published 2026-10-25 17:28 Madrid: game `1a85874883af5caa59f6294a75495eccf2afebbc`, hosting source `e87c5c5baa53a39001c5a89b07b59aab2ad150fc`. It reports all six production files identical to the reviewed portrait handoff. Earlier version 11/10/9 records remain historical. This pass did not deploy or independently audit hosting; the new story work is not in the live Site.

## Environment

| Item | Actual value |
| --- | --- |
| OS | Windows, PowerShell local workspace |
| Node / npm | 24.15.0 / 11.12.1 |
| Browser | Playwright Chromium 156.0.8078.4, SwiftShader, DPR 1 |
| Input | Native browser controls driven by mouse, keyboard and emulated touch; no physical phone |
| Native viewports | 780×320, 844×390 landscape; 320×740, 390×844 portrait; 1440×900 desktop; all 33 final-run PNGs inspected |
| Servers | Development `127.0.0.1:5252`, production preview `127.0.0.1:4197` |
| Test browser cache / policy | `PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright`; `--autoplay-policy=document-user-activation-required` |

## Executed checks

| Check | Result | Observation / evidence |
| --- | --- | --- |
| `npm run typecheck` | pass | Fresh TypeScript check reported by implementation owner; no final-build claim implied. |
| New registry/checkpoint units | pass | 27 focused checks cover validation, explicit transactions, isolation and unavailable storage. |
| New presentation units | pass | Six focused checks cover settled/cancelled presentation and restored context. |
| New story-framing units | pass | Seven focused checks included in the complete suite; bounded story camera space and preserved play behavior. |
| `npx vitest run tests/unit/asset-catalog.test.ts --maxWorkers=1` | pass | Five existing asset tests pass with the new family; validator unchanged. |
| `npm run check:assets` | pass | 73 unique families; original 72 IDs preserved. |
| `npm run build` | pass | Fresh final typecheck and Vite production build; [build-final.txt](gates/build-final.txt). Existing >500 kB chunk advisory remains; no device-performance claim. Earlier gate retained separately. |
| `npm run test:unit -- --maxWorkers=1` | pass | **261/261 tests across 32 files**, final 17.53 seconds with browser rendering paused; [unit-final.txt](gates/unit-final.txt). Earlier 19.56-second pass also retained. |
| Frozen `tests/e2e/story.spec.ts` batch | 8 pass / 1 fail | [automation-results.json](browser/automation-results.json), 259.345 seconds. Original cold-touch precondition failure retained; no retry silently replaces this batch. |
| Focused final follow-up | 3 pass | [final automation results](final-checks/automation-results.json), 38.340 seconds: strict cold touch/background, fresh production, desktop/phone return-cancellation/Practice. Together the runs cover ten distinct checks, with production repeated. |
| Full actual story → Holding rescue → transition → Bellwater rescue → endpoint | pass | Actual nine-action Holding and ten-action Bellwater rescues, explicit acceptance, in-session tide/terminal Undo and complete endpoint; 87.264 seconds. Existing Bellwater overlap uses verified visible-map/pan access, not a claimed layout fix. |
| Reload boundaries and no early acceptance | pass | Mid-cove, won-before-Continue, pending transition, complete checkpoint, duplicate Continue and restored readable context. |
| Malformed, unsupported and unknown/inconsistent saves | pass | Four invalid records retained until explicit replacement; cancellation and independent preferences covered. |
| Direct practice isolation | pass | Three explicit cove entrances plus unknown query do not read/write the journey key; ordinary existing puzzles remain direct entrances. |
| Storage unavailable | pass | Read denial and write/quota failure retain playable in-memory flow with truthful notice. |
| Native text/button fit, keyboard/touch fencing | pass for executed coverage | Final 320×740 keyboard/replacement/Reduced/Mute, desktop gameplay/preview and panned phone cancellation with exact camera recovery; [native-inspection.json](native-inspection.json) records the exact 33 inspected PNG hashes/dimensions. |
| Actual supported fullscreen | pass | Native portrait Settings enters fullscreen and retains dialog/control identity; not a physical Android API guarantee. |
| Cold touch audio/background | pass in strict final follow-up; original fixture fail retained | First passive check confirms no sticky user activation/no context/request before touch. Actual New journey activates existing sound owner; background settles complete captions and recovery does not spend a turn or duplicate startup. No physical-phone listening claim. |
| Production entry | pass twice | Built assets show title/opening and perform a real transfer without development hooks, including fresh final runtime at 390×844. |

Exact browser commands use the shared environment below, with distinct evidence directories:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='../.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT='5252'
$env:LAST_FERRY_PRODUCTION_PORT='4197'
$env:LAST_FERRY_REVIEW_DIR='reviews/story-foundation/browser'
npx playwright test tests/e2e/story.spec.ts --output=.cache/story-final
$env:LAST_FERRY_REVIEW_DIR='reviews/story-foundation/final-checks'
npx playwright test tests/e2e/story.spec.ts --grep 'cold touch|return cancellation|production entry' --output=.cache/story-final-checks
```

## Original failures and corrections

The first development browser collection failed because importing the application progress module through Playwright's native Node 24 loader reached JSON imports without import attributes. The test fixture now uses literal serialized protocol records; pure constructors remain covered by unit tests. This was a test-loader problem, not a game runtime pass or failure.

Development run 2 reported two passes and one measurement-fixture failure: an intentionally screen-reader-only label was incorrectly assessed as visible overflow. The measurement excludes only `.sr-only` content; visible text geometry, viewport and nested-overflow assertions remain unchanged. The original run/results are retained under `development-run-2/`. Later source/results must identify their own run rather than erase this failure.

A subsequent full development run hit the original 180-second timeout while trying to select Bellwater's East Buoy in the 780×320 overview: the existing Let ashore dock button occluded that map target. The original [timeout context](development-run-3/original-timeout-context.md) is retained. The same overlap reproduces in the current direct Bellwater practice entrance. Protected layout sources remain unchanged, supporting an inference that this predates campaign integration; no older build was freshly run to establish its introduction. It is not claimed as fixed by this pass. The successful full journey and separate diagnosis use the existing Play view and trusted bounded pan to expose the actual target, retaining real activation/visibility assertions and the original timeout budget. That workaround is not a repaired layout.

The frozen nine-case batch then passed eight cases and failed the cold-touch setup assertion at `story.spec.ts:485`: sticky browser user activation was already true before the tested New journey touch. The original JSON failure remains in `browser/automation-results.json`. The fixture had used locator/evaluation access before its initial passive CDP reading. The final check follows the existing strict audio harness's passive polling order, confirms a genuinely cold precondition, and passes actual touch/background recovery. No audio runtime defect is inferred from the earlier setup failure.

Review of cancellation found a narrow presentation risk: entering a Return to title confirmation must not replace an active panned Play view with a story fit. The final conditional keeps that confirmation in the playable composition; the targeted follow-up checks cancellation against the exact pre-dialog camera state. Only this guard differs between the full-sequence capture runtime and the final runtime, and its source/evidence reuse is explicit.

## Captured gameplay

All 33 final-run PNGs have been opened at original/native dimensions. [native-inspection.json](native-inspection.json) records exact hashes, dimensions and per-image observations; screenshots do not establish audio, timing or physical-device behavior. Full captions, recovery wording and controls fit, with lighthouse/ferry/Moss visible outside the story card. Some repeated-input captures contain a non-obscuring cyan selection-like highlight on the disabled settled control; its cause is not established by an image. Development captures retain their preliminary source status.

| Actual state | Screenshot |
| --- | --- |
| Default entrance, short landscape | [780×320 title](browser/780x320-title.png) |
| Opening, all three lines and Skip | [780×320 opening](browser/780x320-opening.png) |
| Native narrow portrait, Reduced Motion | [320×740 opening](browser/320x740-opening-reduced.png) |
| Holding actual nine-action arrival and Undo/continuation policy | [Holding arrival](browser/780x320-holding-arrival.png) |
| Connective scene with safe Holding trio | [Another bell](browser/780x320-transition.png) |
| Restored pending connective frame | [844×390 restored scene](browser/844x390-restored-transition.png) |
| Bellwater actual ten-action arrival | [Bellwater arrival](browser/780x320-bellwater-arrival.png) |
| Honest endpoint and restored endpoint | [Endpoint](browser/780x320-endpoint.png), [restored](browser/780x320-endpoint-restored.png) |
| Native portrait fullscreen Settings | [320×740 fullscreen](browser/320x740-settings-fullscreen.png) |
| Fresh production portrait opening | [390×844 production](final-checks/390x844-production-opening.png) |
| Desktop story and actual passenger preview | [1440×900 opening](final-checks/1440x900-opening.png), [Moss preview](final-checks/1440x900-holding-preview.png) |
| Panned phone return confirmation and independent Practice | [Return confirmation](final-checks/844x390-return-confirmation.png), [Practice](final-checks/844x390-practice-chooser.png) |

[The uninterrupted gameplay sequence](story-journey-780.webp) contains the entire actual default entrance → watched opening → Holding rescue with tide/terminal Undo → explicit connection → Bellwater rescue → endpoint/reload. The original silent 780×320 WebM is 84.08 seconds; the versioned WebP is 84.125 seconds, 615 decoded frames at 8fps sampling, with 45ms endpoint rounding and no cuts, crop or speed change. [VIDEO_EVIDENCE.json](VIDEO_EVIDENCE.json) records source/output hashes, complete decoding, exact environment and the local ignored original location. It is visual evidence, not a new listening approval. Gallery/concept images do not count as gameplay. Visual verification is **complete for all 33 listed native desktop/phone PNGs**.

## Remaining uncertainty and next action

- Existing constrained current-location-card/dock overlap remains open; Close exposes the controls. A direct Bellwater 780×320 overview also reproduces East Buoy obscured by the Let ashore dock control. The actual journey/diagnosis passed with visible-map/pan access; no underlying layout fix is claimed.
- The prior delivered-heading observation of 1.425683 radians over 99.9 ms versus the 0.85 threshold remains open.
- The ≤180 ms rapid-touch timing window remains unverified; earlier misses are retained.
- Physical Android, other engines, native GPU/performance, alternate platform fonts, screen-reader/audio listening and a new acoustic approval remain unverified. Chromium touch emulation does not establish those results.
- Human pacing/enjoyment and story visual acceptance await review. The supplied larger campaign has not been implemented or solver-validated by this pass.
- Next action: review the pushed handoff in draft PR #1 before any new publication to the existing private Site. The final handoff records the branch/remote equality and metadata commit separately from this audited implementation. Main remains unchanged; this pass does not deploy.
