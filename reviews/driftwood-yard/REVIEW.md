# DRIFTWOOD_YARD_01 — review

## Disposition

**Ready for ChatGPT review and user playtest; not deployed.** Compact dock controls, the actual third cove, Nell's model/portrait, illustrated connection and save compatibility are complete. Production/rule/geometry/UI checks and native screenshot inspection are distinguished below. Human puzzle/art/listening acceptance remains pending. Existing intermittent portrait loading, Bellwater overlap and timing/device limitations remain open.

## Source and scope

Repository https://github.com/EDLMGit/Lastferry · draft https://github.com/EDLMGit/Lastferry/pull/1 · branch `m1-first-crossing`. Main remains `386de54d20fdd4a513a06115471d70bf94738cc0`.

Reviewed game: `da1f2686ce6aff8d754e13111447dabb6e1313f0`. Actual checkout initially matched it and was clean. Fetch found newer remote `879c9d1cfb6745ce8a294e4dbba4aa3d984ef4b3`; fast-forward preserved all six newer commits, with identical tree `4aa851646f66cb0eda3ee9960ca9c5125170b0e0`. No reset. The exact supplied task resolved to `C:/Users/ernes/Documents/last-ferry-codex-starter/LAST_FERRY_DRIFTWOOD_YARD_PACKAGE/NEXT_TASK_DRIFTWOOD_YARD.md`, one directory above the actual Git root `.../Lastferry`; the entire original package is retained here unchanged.

Evidence belongs to `879c9d1` **plus the recorded working-tree implementation**, not a retroactively invented capture SHA. `handoff/source-before.json` and `source-after.json` record runtime/data/dependency hashes and times. `implementation.patch`, `source-audit.json` and the subsequent committed-blob audit tie reused/final evidence to this implementation. Final GitHub SHA is supplied in the PR handoff.

Existing three puzzle JSONs, reducer, accepted Sound implementation, water, wake, headings, sailing timing, Home composition and approved opening/Harbor painter functions are protected. Nell adds a deliberate foredeck transfer profile with unchanged anchors/timing; other species retain their exact previous entry profile. No six-space hull, launch, Wide Berth, deer, currents or narration added.

## Implemented behavior

- Routine Board / Let ashore / Bring home buttons contain their existing icon and short label, with at least 44px targets. Current-place inspection exposes free predicted cost/depth/landing facts. HUD/Forecast retain ordinary status; groups retain native subset choice and a named commit. Actual immediate loss still warns before commitment with free Cancel. Receipts remain owned by real completed transactions.
- Driftwood is a real five-stop 3D cove: Harbor, low timber Yard, raised stone High Mooring, Shallow Bend and low Reed Landing. The four-space ferry starts empty. Nell uses two spaces; Fern and Oat use one each. Tide rises after actions 7 and 11. Original rule/event order is unchanged.
- Nell has a real brown beaver model, lighter muzzle, small ears, teeth and a visible flattened side-resting tail. Her original transparent 256px portrait is model-derived with simplified SVG shading, **not pixel-identical WebGL**. Explicit appearance IDs preserve Fern cream/Oat tan through reorder/subsets; full species ordinals remain separate for placement. Nell uses the accepted full wooden-contact profile by capacity classification.
- Bellwater acceptance earns `driftwood-light`: a seven-second close original illustration of Nell lifting a lantern and turning toward the channel. Caption: “Nell, the boatwright, is still at the yard.” Existing autoplay/Pause/Resume/Next/Skip/transcript/reduced/restore/audio owners remain. Only **Continue to Driftwood** acknowledges it. Driftwood terminal Undo stays available until explicit acceptance, then **Three coves are safe** offers Home/Practice/Options.
- The exact historical two-cove-complete v1 record stays read-only on Home/Options/Practice. Deliberate Continue first saves the pending scene and plays fresh; later pending reloads show the existing static recap. Invalid/extra/future records stay invalid with original bytes preserved. Practice and explicit query entrances do not migrate or write progress.
- Driftwood-only label placement avoids the reproduced overview name overlap. Natural keyboard navigation now keeps current dock actions reachable while visiting distant map targets, returning the camera to the boat when a dock action receives focus. Pointer layout remains unchanged.

Inventory: **78 families**, all previous **76 IDs retained**. Added `model.beaver` and `environment.driftwood-yard`; extended the existing portrait, story illustration and relevant shared UI families. See `catalog-changes.json`, `docs/ASSET_LEDGER.md`, actual developer gallery, editable sources and `assets/portraits/generation-manifest.json`. Regeneration against final model/world sources reproduced PNG and SVG bytes exactly (`portrait-reproduction.json`). Integration and human acceptance are separate.

## Environment and executed checks

Windows · Node24.15.0/npm11.12.1 · Playwright Chromium156.0.8078.4 · SwiftShader · DPR1 · emulated touch, mouse and natural keyboard. This is not physical Android/native GPU. Native temporal inspection used 390×844 and 780×320; changed scene/chooser fit also used 320×740, 844×390 and 1440×900.

| Check | Actual result |
| --- | --- |
| `npm run build` | **Pass**, including TypeScript. Existing >500kB bundle warning retained. `gates/build-handoff.txt`. |
| Separate TypeScript checks | **Pass** during asset/story/label integration, plus final build check. |
| `npm run test:unit` | **338/338, 38 files pass** in final run, `gates/unit-handoff.txt`. Earlier geometry/body/copy failures retained. |
| `npm run check:assets` | **Pass**, 78 unique families and no lost IDs. |
| Final focused dev batch | **5/5 pass**, `gates/browser-handoff.txt`. Original release was 3/5; original failures retained. |
| Strengthened image fallback | **1/1 pass**, `gates/browser-fallback-corrected.txt`: real delayed valid image, aborted cache-busted image with observed `failed`, naturalWidth0 and readable stable Nell/2spaces fallback; actual delivery still works. This replaces an earlier query-glob fixture that did not reliably intercept cache-busted URLs. |
| Actual production build | **1/1 pass**, `gates/browser-production.txt`: actual complete rescue, all bundled PNGs loaded256px, full text-line/nested overflow/44px targets at all five stated sizes before delivery commitment. No DEV state bridge used. |
| Actual journey | Earned Bellwater ten-action win/Undo/redelivery → explicit acceptance → Nell scene → Driftwood12-action rescue including last-safe subset warning/Cancel, critical group boarding, both rises, tide Undo and terminal Undo/redelivery → explicit available-content endpoint. |
| Input/lifecycle/continuity | Natural Tab/Shift+Tab/Space/Enter/Escape and touch, free current-place details, direct transfers, groups, reduced transfers, valid old checkpoint/legacy read-only/first fresh continuation/pending reload, original cove restart, actual common-root fullscreen entry/exit. State tests additionally cover exact invalid/future/extra/ordered records, failed writes, repeat continuation and storage failure. |
| Original content | Actual Bram safe-boundary boarding/Undo, Holding last-safe subset loss warning/free Cancel, First Crossing keyboard Board/Undo and normal-motion opening autoplay regression pass. |

Commands: `npm ci`; `npm run dev -- --port 5270 --strictPort`. Production: `npm run build`, `npm run preview -- --port 5275 --strictPort`. Browser environment: `PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright`, `LAST_FERRY_DEV_PORT=5270`, `LAST_FERRY_PRODUCTION_PORT=5275`, `LAST_FERRY_REVIEW_DIR=reviews/driftwood-yard/recheck`; run `npm run test:e2e -- driftwood-yard.spec.ts` and `npm run test:e2e -- driftwood-production.spec.ts`. Reusing manually started servers avoids the inherited Windows child-server teardown problem.

## Puzzle and real geometry proof

The supplied proof is explicitly a **mechanical proposal**, preserved under the package. Production replay against the final authored JSON and actual reducer/Session passed both12/15-action successes and all three tempting alternatives. The15-action plan changes delivery order but shares the critical staging rescue. Preview/commit equality, conservation, transfer-before-rise, one-action group cost, blocked return without mutation, full mechanical Undo and harmless later play are checked.

Production reachability normalized only time after the last rise: **246 states, shortest witness12, zero wins bypassing temporary Nell holding**. No search horizon or game move cap was introduced; a collapsed winning state is not a claim of one unique route, playtime, difficulty or fun. `production-reachability.json` and `geometry-pose-final.txt` retain results.

Actual shared curves/hull meshes were checked both directions at1001 samples across reachable headings and both berth sides, refined land/dock envelopes and route intersections. New body checks cover all seven aboard subsets and Nell boarding/unloading past stationary rabbits at both headings; body/cabin/rail clearance covers six representative transfer scenarios. Original mooring-turn, tail/Oat and reboarding-corridor failures were fixed through authored berth spacing, compact tail rest and Nell-only entry geometry, without lowering collision thresholds or changing timing. Native moving evidence complements these geometric tests; neither substitutes for the other.

## Actual native evidence and runtime audio

`MEDIA.json` lists selected native screenshots, source scope and hashes. They are actual game/root journey/production frames; gallery specimens and the package design proof are labelled separately.

- Scene beginning/lift/held: `handoff/{390x844,780x320}-driftwood-scene-{begin,middle,end}.png`.
- Normal start/whole network: `handoff/{390x844,780x320}-{start,overview}.png`.
- Compact Bram: `handoff/{390x844,780x320}-bram-compact.png`.
- Staging/critical boarding/rise: `handoff/780x320-nell-staged.png`, `780x320-rabbits-preview.png`, `780x320-first-rise.png`.
- Loaded boat: `handoff/390x844-full-deck.png`, `handoff/780x320-loaded-sailing.jpg` (unchanged native CDP frame, extraction manifest). Moving view shows character identity better because the current marker partly overlaps the deck at rest.
- Full delivery and arrival: `handoff/{390x844,780x320}-{delivery-preview,arrival}.png`; production fit frames at all five sizes, including `production/320x740-production-delivery.png`.
- Failed-image fallback: `fallback/390x844-portrait-failure-fallback.png` with actual failed image metadata.

`handoff/actual-boundary-rescue.mp4` is the **93.52-second uninterrupted actual Bellwater → scene → Driftwood sequence**, 780×320, 4,562,632bytes. It begins from a deliberately seeded valid Bellwater cove checkpoint; **both rescues and their acceptance are earned through actual controls**, with no injected mid-puzzle state. Legacy-only boundary tests/other scene fixtures are explicitly separate. Native timestamps and the actual existing Sound.captureStream mix are preserved with79.45ms start alignment, no internal cuts/speed changes/normalization/boost/substitution. H.264/AAC encoding and full video/audio decode pass. Export peak−20.5dBFS/mean−36.6dBFS establish nonzero software output, not human listening. The final scene needed no recovery Resume. CDP every-third-frame capture averages5.61 delivered frames/s; that is capture delivery, **not game or phone FPS**. Raw frames/audio remain local/ignored.

Native inspection found the new scene gesture, caption and complete tail readable at both phone orientations. Actual aboard/sailing/arrival views distinguish Nell and both rabbits; all new final-delivery names/costs fit. Human art/puzzle/acoustic approval remains the next review step.

## Original failures and remaining limits

`BROWSER_CHECKS.md`, original logs and `initial-failures/` retain the encoding error, superseded copy expectation, geometry/pose failures, initial capture interrupted by source HMR, real label overlap, keyboard focus loop, premature fullscreen assertion and the corrected image-test glob. Original failure evidence is not rewritten as a pass. The source-only staged whitespace check passes; the whole-evidence check reports intentionally preserved supplied Markdown hard breaks, literal patch-context spaces and runner error excerpts/blank lines. Those original artifacts are retained unchanged.

The **intermittent portrait-load timeout remains unresolved**: the dense landscape capture reproduced a10s wait with Nell absent, while final lower-frequency capture, portrait run and production bundled-image check pass. No causal conclusion or runtime load fix is claimed. Fallback/action independence is now directly verified.

The inherited constrained Bellwater overview overlap remains visible: compact Board/Let ashore can cover Harbor/Bell Pier labels at780×320. Established Play-view/pan inspection remains the workaround; this pass does not claim closure. Earlier delivered-heading discontinuity (1.425683rad/99.9ms vs0.85 threshold) and exact≤180ms rapid-touch bound remain open. Physical Android, other engines/fonts, screen-reader speech, native GPU and hardware-speaker/headphone listening were not run. Existing missing-phone-music report remains unreproduced/unclosed; composition was not retuned. Software capture stalls and historical runner teardown limits are retained. No narration files or voice substitute added.

## Publication and local play

**Not deployed.** Existing owner-private Site remains version12, game `1a85874883af5caa59f6294a75495eccf2afebbc`, hosting `e87c5c5baa53a39001c5a89b07b59aab2ad150fc`. Supplied receipt and all previous publication history are unchanged. GitHub push is separate from publication.

Root: **http://127.0.0.1:5270/** · independent Driftwood: **http://127.0.0.1:5270/?cove=driftwood-yard**. Next planned slice is A wider deck + actual six-space ferry + Wide Berth together; it is not implemented here.
