# Cove interface and asset inventory

This pass applies the supplied original cove interface family to the actual game and establishes a maintained asset inventory. Started clean from accepted `8052cfcd67f2e56cf3258243618c4ce125d51c4b` on `m1-first-crossing`; no newer or unrelated checkout changes were present.

The supplied package is retained as design input, not gameplay evidence. The canonical inventory is `assets/catalog.json`; the development gallery is `asset-gallery.html`.

The current private Site remains game `8052cfcd67f2e56cf3258243618c4ce125d51c4b`, Sites version 10, hosting source `f9ada70cbd093bf52c105f2287558381b3b7c83c`. This style pass is not deployed.

## Result and visual decision

Retained the supplied matte seafoam action faces, dark teal reading panels and shallow lower edge. Warm amber belongs to Bring home, Harbor's lighthouse identity and progression. Utility controls remain quiet. Visible Board / Let ashore / Bring home / Sail / Wait / Confirm wording carries decisions; glyphs supplement it. Harbor uses the lighthouse; Back to boat and Play view use the framed ferry. Neither changes puzzle time.

The eighteen individual SVGs remain the single editable runtime source, imported by `src/ui/cove-ui.ts`. The supplied convenience sprite is archival design input, not another maintained runtime copy. Shared controls keep their native button node, IDs, explicit audio intent, focus and accessible labels while replacing only the necessary glyph/label child. Passenger choices remain native `aria-pressed` buttons with a visible checked shape. Map name and marker remain one button and Tab stop. Dock pictograms stay upright at both accepted berth headings.

The same surface family covers the HUD, names, dock controls, location options, previews, forecast, Menu, Settings and completion. Main phone targets remain 48px and essential action text 16px; constrained Close controls retain 44px. Sound's compact secondary Sound/Retry word is 14px. One quiet outer frame replaces redundant preview framing. No new font, remote icon, texture, shader pass, blur or continuous UI frame loop.

Actual comparison found an initial 780px HUD height increase and a 360px Wait row increase. Compact Undo and padding corrections restore the 780×320 HUD to its baseline 58px and the narrow control row to 48px. The actual five-size initial ferry width is exactly unchanged. Selected-state contrast uses the check shape and its adjacent surface; focus keylines appear immediately instead of fading in with the ordinary 120ms shadow response.

## Inventory and developer use

The canonical `assets/catalog.json` preserves all 71 supplied stable IDs:

| Status | Families |
| --- | ---: |
| Existing runtime | 38 |
| Newly integrated | 25: eighteen icons, six components, one material-token family |
| Retired | 2: `ui.dock-icons`, `ui.utility-icons`, with replacement IDs and historical source revision |
| Reference only | 6 |

The existing `ui.surfaces`, `ui.map-markers` and `ui.dialogs` records were updated. New appearance remains **not yet human accepted**. Each family has actual paths, descriptive symbols/selectors, purpose, variants, material contract, consumers/ownership, lifecycle, provenance, evidence and type-specific fields. Procedural factories are registered directly; no GLB, texture export or acquired rights were invented. Named passengers and placements remain instances/data.

`docs/ASSET_LEDGER.md` is the provenance/history guide; stale sound and font descriptions were corrected without deleting history. `docs/UI_STYLE_GUIDE.md` describes the actual result. AGENTS requires inventory/gallery/provenance updates with an asset addition, replacement or retirement. `assets/ASSET_ENTRY.template.json` supports later additions.

Use Node 24:

```sh
npm ci
npm run dev
```

Open `/asset-gallery.html` on the development server. The gallery renders the actual shared sources, all interaction specimens and the searchable canonical inventory with source/evidence links. It does not load all world effects or play every sound. The normal production build contains only the game entry and excludes the gallery/catalog. Its specimens are design evidence only.

```sh
npm run check:assets
npm run build
npm run preview
```

## Verification and evidence

Environment: Windows, Node 24.15.0, npm 11.12.1, Playwright 1.64.1 / Chromium 156.0.8078.4, SwiftShader, DPR 1. Touch is browser emulation. Native captures cover 844×390, 780×320, 390×844, 360×740 and 1440×900; browser regression coverage also includes 780×390. The actual Windows ChatGPT in-app browser independently exercised production fullscreen entry/Exit with the already-open menu visible.

- Final production build and standalone TypeScript checking: pass; see `gates/build-final.txt`, `gates/final-checks.json` and `build-identity.json`. The existing bundle-size advisory remains.
- Existing units plus two catalog checks: **202/202 pass across 28 files**; `gates/unit-final.txt`.
- Catalog: **71 unique families pass**. Validator checks statuses, kinds, local paths, provenance, replacements and per-type requirements; it does not parse TypeScript symbols with regex.
- Composite contrast: **169 checks across nine actual UI stages pass**, minimum measured text/icon 6.28:1, selected check fill against adjacent choice 5.16:1 and focus keyline 9.33:1. Actual pixel/computed backgrounds include dark water, brightest shallows and Harbor. This bounded check is not a full accessibility certification. Settings Reduced yields zero decorative transition duration on all 13 measured buttons. See `contrast.json` and preserved initial findings.
- Twenty matched before/after captures share exact committed states and viewport/input, with recorded camera facts. Natural ambient/light phase is not time locked. All twenty after images were inspected at native size; see `matched-comparisons.json` and `native-inspection.json`.
- All five capture runs complete the actual nine-action Holding rescue, mixed subset warning, tide Undo, terminal Undo/redelivery and both berth orientations. No injected gameplay state. Separate browser cases exercise actual Bellwater and keyboard First Crossing rescues.

**24 distinct browser cases pass across retained runs, not one clean combined run.** The first final batch had 23 passes and one portrait cancellation-focus failure. The same unmodified keyboard sequence naturally reproduced the failure in one of three attempts. Map focus reframed toward Rabbit Pier before the next placement update; entering and cancelling the dock preview then tried to focus a CSS-hidden dock button. The bounded fix flushes placement and reframes to the current boat only for a hidden keyboard dock return. Both phone nested-control cases and the other-cove keyboard case pass after the fix; three further exact portrait repeats all exercise visible, focused Let ashore at Stone. No injected focus or added timing delay replaces the original assertion. See `BROWSER_CHECKS.md` and the retained failure/reproduction logs.

Passing coverage also includes cold native touch in two coves, saved mute, pending retries/rejections, explicit Enable/Retry/Mute and held-key intent, real fullscreen entry with open dialog/subset, rotation/external exit, and separately labeled mocked short-screen failure/support-copy behavior.

## Gameplay images

All twenty new images are in `after/`; the exact matched originals are `before/844x390-*.png` and `before-rest/` for the other four sizes.

[Uninterrupted actual gameplay](gameplay-844.webp) is the entire 27.8-second native 844×390 touch recording: temporary unloading, sailing, a mixed subset warning, safe boarding/tide rise, Undo, return, delivery and terminal Undo/redelivery. The silent animated WebP samples at 8fps without cuts or speed change; endpoint rounding gives 27.75 seconds. All 218 frames decode. The full VP9 original remains local/ignored. [Recording provenance](VIDEO_EVIDENCE.json) records hashes, source and action times.

| Viewport | Ordinary play | Selected location | Mixed subset | Arrival |
| --- | --- | --- | --- | --- |
| 844×390 | [Play](after/844x390-play.png) | [Selected](after/844x390-selected.png) | [Subset](after/844x390-mixed-subset.png) | [Arrival](after/844x390-arrival.png) |
| 780×320 | [Play](after/780x320-play.png) | [Selected](after/780x320-selected.png) | [Subset](after/780x320-mixed-subset.png) | [Arrival](after/780x320-arrival.png) |
| 390×844 | [Play](after/390x844-play.png) | [Selected](after/390x844-selected.png) | [Subset](after/390x844-mixed-subset.png) | [Arrival](after/390x844-arrival.png) |
| 360×740 | [Play](after/360x740-play.png) | [Selected](after/360x740-selected.png) | [Subset](after/360x740-mixed-subset.png) | [Arrival](after/360x740-arrival.png) |
| 1440×900 | [Play](after/1440x900-play.png) | [Selected](after/1440x900-selected.png) | [Subset](after/1440x900-mixed-subset.png) | [Arrival](after/1440x900-arrival.png) |

## Source and limits

Evidence identifies baseline HEAD plus the recorded working tree, not a future commit. Captured runtime hash is `ea0fb018bb39362f6b0157363eca4a093194c4e8cbef03e789463fd3cc2ba264`; final runtime hash is `3b034e49033689ad8748ae865fc8c9bfcb5b7480c622f4eb7bc76e3fa3991d59`. `after/source.json` identifies the captured game. `source-reuse.json` proves that replacing only the later keyboard-return guard reconstructs captured `src/main.ts` exactly: the twenty touch/mouse images, contrast observation and uninterrupted touch recording never take that new branch. Fresh keyboard checks and screenshots cover the final guard. Final 193-file source hash is `e3736e6d7b77ef076c94c94ee9312e62386ac28eb22616bd4bb276bda0174b30` in [source-manifest.json](source-manifest.json); build output identity is in [build-identity.json](build-identity.json). The commit packaging audit is retained separately.

`package-source-audit.json` confirms all 32 supplied package files match the ZIP byte-for-byte in the working tree. `protected-source-audit.json` confirms 52 pre-existing runtime/data/build files remain byte-exact; `src/main.ts` contains the rendering integration and keyboard focus recovery. Audio composition/activation engine, native fullscreen support class, puzzles, complete Undo reducer, water, wake, headings, sailing timing and lighthouse sources are unchanged. `archive-map.json` locates unselected duplicate/development images in the local ignored archive without deleting them. Original failure logs and source manifests remain committed.

Preserved limitations:

- The selected current-location card can cover Let ashore at short landscape and portrait sizes, exactly as in the accepted baseline. Its Close remains reachable and exposes the dock action. This pass does not redesign placement.
- At 780×320 secondary preview details and Settings controls use internal scrolling; choices, full loss warning, confirmation and Close/Back remain reachable. Desktop Whole cove can overlap a secondary hint, as before.
- Portrait arrival captures deliberately use Whole cove, matching their baseline, and do not represent normal Play scale.
- The prior delivered-heading observation (1.425683rad over 99.9ms versus 0.85) remains open. Rapid touch within 180ms remains unverified. Historical mouse/touch misses are retained; this restyle does not claim to resolve them.
- No new physical Android, other-engine, native-GPU performance, acoustic listening or complete accessibility certification is claimed. The user's version 10 acceptance remains valid and is not generalized into a full device matrix.

**Disposition: ready for ChatGPT review with the limits above.** No confirmed new blocker remains within this scope. PR #1 remains draft and main unchanged. ChatGPT reviews the identifiable result before the next publication to the same private Site; the current live build remains game `8052cfcd67f2e56cf3258243618c4ce125d51c4b` / Sites version 10.
