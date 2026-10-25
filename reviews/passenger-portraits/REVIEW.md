# Static passenger portraits in the live choices

## Source and visual decision

Started clean on `m1-first-crossing` at reviewed `23a644aba24e6479b9d82a106a745d15c3f8c7dc`. Read AGENTS, PROJECT_STATE, the active portrait task and companion package; copied the original inputs from the parent workspace without overwriting runtime/catalog. [Supplied input hashes](supplied-source.json) retain all 32 files. This is the scoped `NEXT_TASK_PASSENGER_PORTRAITS.md` implementation.

The user likes the painted panels; the existing owner-private Site already runs that reviewed baseline as **version 11**, hosting source `d1fc7158d7b00717af18b7bc61ee4a33fe85bf2f`, confirmed 2026-10-25. [Supplied publication receipt](../../cove-portrait-package/verification/deployment-confirmation.json). Version 10 is retained as history in PROJECT_STATE. Portraits are new candidates, absent from version 11. No deployment is performed in this pass.

Retained the supplied head/upper-chest compositions and original model geometry, colors, wool and ear splay. Three transparent 256px PNGs display at **44 CSS px beside the full 16px name/capacity**. They are model-derived SVG diffuse renderings, not pixel-identical WebGL screenshots. The picture is decorative; live text, selected check and native button still explain the decision.

An actual 780×320 comparison rejected a 160px and then 148px column minimum: the real passenger group is 296px wide after body padding, so those values force three rows. The retained 144px minimum permits two 144.5px columns at that size while keeping the complete real labels and 62px tile height. At narrower widths the grid stacks. Longer text can grow naturally; no essential text is shrunk, ellipsized or hidden. The transfer sheet, nearby placement, body scrolling and fixed Confirm remain owned by the existing layout.

## Identity, loading and inventory

`src/game/passenger-appearance.ts` is a pure full-level/passenger-ID resolver shared with `World.speciesIndex`. It returns the complete species ordinal separately from the portrait key. Rabbit ordinal zero is cream; nonzero remains tan, matching the existing model factory. Unknown IDs/appearances use an explicit text-preserving unavailable portrait. No display name, offered/aboard order or selected subset controls identity. The world change is a bounded delegation; model, proportions, anchors, poses and animation remain unchanged.

| Cove | Passenger | Portrait | Spaces |
| --- | --- | --- | ---: |
| First Crossing and Holding | rabbit-1 / Pip | rabbit-cream | 1 |
| First Crossing and Holding | rabbit-2 / Rue | rabbit-tan | 1 |
| First Crossing and Holding | sheep-1 / Moss | sheep-wool | 2 |
| Bellwater | tansy / Tansy | rabbit-cream | 1 |
| Bellwater | lark / Lark | rabbit-tan | 1 |
| Bellwater | bram / Bram | sheep-wool | 2 |

One native `button#passenger-ID.cove-choice` retains its reading order, `aria-pressed` and Tab stop. Empty-alt, non-draggable images have no independent pointer/focus role. A fixed slot and explicit dimensions reserve space before decode. Delegated load/error handling on the stable root reveals decoded images; failure leaves the quiet reserved slot with the full text/check/action available and no visible broken-image text. No extra canvas, WebGL context, renderer, animation or audio is added. All Board / Let ashore / Bring home consumers and the developer gallery share the helper and three runtime image sources.

Added one truthful **`ui.passenger-portraits` / `generated-ui-image`** family; preserved all 71 existing IDs and retired records, for 72 total. Updated `model.rabbit`, `model.sheep`, `ui.component.passenger-choice` and `ui.dialogs`, plus the existing panel acceptance records to reflect user praise without claiming portrait approval. The narrowly extended validator checks bounded local RGBA8 PNG outputs, dimensions, byte counts, variant correspondence, SHA-256 and seven source/recipe/consumer/fallback/evidence fields. Header/source checks do not substitute for full decoding or visual inspection. [Canonical inventory](../../assets/catalog.json), [style guide](../../docs/UI_STYLE_GUIDE.md), [ledger](../../docs/ASSET_LEDGER.md).

## Generator and output provenance

The original factory remains `src/scene/models.ts`. Runtime scales remain rabbit `[1.25,1.65,1.25]`, sheep `[1.15,1.5,1.15]`. The original generator clones temporary materials and runs in isolation, without touching the live world's cached materials. Orthographic camera/crop, full ears/wool, ambient/key/fill values, sRGB/straight-alpha semantics and 256px dimensions remain in the original [generation manifest](../../cove-portrait-package/portraits/generation-manifest.json).

Fresh isolated SVG reproduction under Node 24.15.0 / existing Three.js 0.186.1:

```powershell
node cove-portrait-package/tools/render-portraits.mjs --repo . --out reviews/passenger-portraits/raw/generated-svg --source-commit 23a644aba24e6479b9d82a106a745d15c3f8c7dc
```

All three SVGs reproduce byte-for-byte. Original model/generator/lockfile hashes match; no PNG regeneration or production dependency is needed. Supplied PNG rasterization used Node 24.22.1 / Sharp 0.35.5, 768px SVG input and Lanczos3 downsampling. The exact optional regeneration command and authoring environment are retained in the package README. [Fresh generation audit](generation-audit.json), [complete PNG decoding and alpha inspection](png-audit.json).

| Original runtime PNG | Dimensions/encoding | Bytes before transport compression |
| --- | --- | ---: |
| rabbit-cream.png | 256×256 RGBA8, sRGB | 27,139 |
| rabbit-tan.png | 256×256 RGBA8, sRGB | 28,653 |
| sheep-wool.png | 256×256 RGBA8, sRGB | 43,602 |
| Total | Three canonical appearances | 99,394 |

Transparent padding retains the complete upper ears/wool; the lower chest crop is intentional. Original source/output hashes remain distinct from the later shared resolver extraction, which does not change any model or scale.

## Focused verification and evidence

Windows, Node 24.15.0 / npm 11.12.1, Playwright 1.64.1 and Chromium 156.0.8078.4 / SwiftShader / DPR 1. Actual common font fallback is Segoe UI / Arial / sans-serif. Phone input is emulated touch; ordinary wheel scrolling exposes lower body content. No physical Android or native-GPU result is inferred.

| Check | Actual result |
| --- | --- |
| `npm run build` | PASS, including TypeScript. Three canonical PNGs are emitted unchanged with hashed filenames; gallery/catalog/rasterizer remain outside ordinary gameplay. Existing bundle-size advisory remains. [Log](gates/build.txt), [six production file identities](build-identity.json) |
| `npm run test:unit -- --maxWorkers=1` | Final **221/221 PASS**, 29 files, 10.96s. Includes 15 new appearance cases and three new generated-image validator cases. [Log](gates/unit.txt) |
| `npm run check:assets` | PASS, 72 families. [Log](gates/catalog.txt) |
| Final standalone `npm run typecheck` | PASS after all new browser-test/tool edits. [Log](gates/typecheck-final.txt) |
| Six focused browser cases | **6/6 PASS** in one 3.9-minute run: inherited Harbor lifecycle, all-nine identity mapping, delayed/failed image input at two sizes, native-policy cold audio and actual fullscreen. [Results](browser/automation-results.json), [exact commands](BROWSER_CHECKS.md) |
| Isolated SVG reproduction | All three original SVGs exact; no PNG regeneration. [Audit](generation-audit.json) |
| Complete PNG decode | All three 256×256 RGBA outputs decode with alpha 0–255. [Audit](png-audit.json) |
| Gallery fit and failure | 28 choices / 56 individual text-line fragments PASS at 1440px/320px viewports, including 20px long-name stress, 44px images, selected/focus/failure/null fallback. Ten native gallery images inspected. [Results](gallery/measurements.json), [inspection](gallery/native-inspection.json) |
| Final actual Holding UI captures | Six complete rescues PASS at all required sizes plus desktop. Actual sheep, two-rabbit boarding, subsets, Harbor before Confirm, tide Undo, arrival, terminal Undo/redelivery. [Full measurements](after/capture-manifest.json) |

All **48 final actual-game images** were inspected individually at native size. [Inspection manifest](native-inspection.json) records hashes/dimensions/source. Retain the supplied crop/lighting: cream/tan remain distinct, faces/ears/wool remain recognizable at 44px, selected/unselected images are equally visible, and the check does not cover them. No new visual defect was observed in this coverage. Full name/cost line bounds, nested scroll widths, 44px image containment and 62px ordinary tile height pass at each final size. Lower warning/consequence details deliberately scroll inside the fixed sheet, including the 400px desktop dialog; Close and Confirm remain available.

| Native viewport | Before portraits, actual Harbor | Final Harbor before Confirm | Final two-rabbit boarding |
| --- | --- | --- | --- |
| 844×390 | [Baseline](before/844x390-harbor-preview.png) | [After](after/844x390-harbor-preview.png) | [Boarding](after/844x390-rabbit-boarding.png) |
| 780×320 | [Baseline](before/780x320-harbor-preview.png) | [After](after/780x320-harbor-preview.png) | [Boarding](after/780x320-rabbit-boarding.png) |
| 390×844 | [Baseline](before/390x844-harbor-preview.png) | [After](after/390x844-harbor-preview.png) | [Boarding](after/390x844-rabbit-boarding.png) |
| 360×740 | [Baseline](before/360x740-harbor-preview.png) | [After](after/360x740-harbor-preview.png) | [Boarding](after/360x740-rabbit-boarding.png) |
| 320×740 | [Baseline](before/320x740-harbor-preview.png) | [After](after/320x740-harbor-preview.png) | [Boarding](after/320x740-rabbit-boarding.png) |
| 1440×900 | [Baseline](before/1440x900-harbor-preview.png) | [After](after/1440x900-harbor-preview.png) | [Boarding](after/1440x900-rabbit-boarding.png) |

[Single sheep](after/360x740-sheep-choice.png), [unselected tan rabbit](after/390x844-rabbit-subset.png), [full short-phone warning](after/780x320-warning-scrolled.png), [scrolled Harbor consequence](after/320x740-harbor-consequence.png) and [arrival](after/844x390-arrival.png) are actual gameplay. Supplied boards/gallery are separately labeled design evidence. Current capture runtime SHA-256 is `cffea82a6bef375e586f646c4e4d231b703f90514b4818e9d9d613b259af2378`; [after source](after/source.json) records baseline HEAD plus exact working-tree inputs and an unchanged end guard. These captures are not relabeled as coming from a future commit.

The new mapping case verifies all nine actual level/passenger combinations, a single Rue after partial Holding delivery, and Lark alone after partial boarding and partial Bellwater delivery. Reordered selections preserve both coats; Bellwater rescues Bram before his unchanged deadline and completes a full actual rescue. First Crossing is exercised through real sheep/rabbit interactions, without claiming a new full baseline rescue. The inherited Harbor case freshly covers partial delivery, tide/terminal Undo, redelivery, natural Tab/Shift+Tab/Enter/Space/Escape, portrait cancellation focus recovery, no tap-through and actual fullscreen exit/rotation with selection/focus/scroll retained. The two image cases verify pre/post-decode and failure geometry within unchanged 0.75px bounds, full accessible labels, blank/image/check/name single activation, cancellation/reopening and a committed unload with failed imagery. One actual world canvas remains; no portrait renderer is allocated.

[Uninterrupted gameplay](gameplay-844.webp) retains the entire **38.48-second** native 844×390 actual interface sequence. Silent 8fps WebP has 298 completely decoded frames and 38.5-second duration (20ms endpoint extension); no cuts, crop or speed change. It includes sheep unloading, rabbits/losing subset/full warning, tide rise/Undo, Harbor before Confirm/all subsets, cancellation, arrival and terminal Undo/redelivery. Original VP9 stays local/ignored. [Recording source, action times and hashes](VIDEO_EVIDENCE.json).

[Actual first image requests](image-transfer.json) record local Chromium encoded/decoded payloads of 27,139 / 28,653 / 43,602 bytes, with 300 additional reported transfer bytes each. A separate [production HTTP audit](http-transfer-audit.json) receives all three PNGs unchanged, uncompressed and image/png from preview4196. These are local observations, not mobile-network or repeated-cache-download claims.

The supplied baseline audit, historical 272 contrast checks and previous broad audio/puzzle suites remain historical results; this pass does not claim to rerun them. Panel material and color sources remain unchanged. [Protected source audit](protected-source-audit.json) records 53 unchanged pre-existing runtime/data/build/dependency entries and six expected UI/gallery/world-delegation changes. [Matched comparisons](matched-comparisons.json) confirm unchanged committed states and actual camera/framing values at all six sizes; initial ferry width ratio is exactly 1 and HUD heights are unchanged. Raw revision counters remain recorded separately from framing.

Final [259-file source snapshot](source-manifest.json) SHA-256 is `35675773926c70f8f415757b78a64499cdc62074bc2789e74a78fce1ef48c356`. [Source reuse](source-reuse.json) proves all 83 capture-runtime entries, three capture/measurement helpers and 14 browser-scope files remain exact. Only catalog evidence/provenance prose differs from the gallery snapshot; its runtime helper/images/layout remain exact. The final catalog validation passes after those metadata additions. [Tracked source diff](tested-changes.patch) supplements hashes of new untracked inputs; final Git packaging will check every snapshot entry.

All 48 final gameplay PNGs are retained. Selected baseline comparisons, failures, gallery specimens and original grid trials accompany them; redundant earlier/design PNGs remain local under ignored `raw/unselected`, resolved with hashes by [archive map](archive-map.json). No original result JSON or failure log was removed. Gallery/source PNGs remain explicitly distinct from actual gameplay.

Install/run with Node 24: `npm ci`, then `npm run dev`. Production: `npm run build`, then `npm run preview`. Gallery: `/asset-gallery.html` on the development server. [Exact browser/capture commands](BROWSER_CHECKS.md), [gallery/source commands](ASSETS.md). No new dependencies.

Initial development results are preserved: one typecheck ran before the gallery's new explicit-appearance caller was updated; the first delayed-image fixture intercepted Vite image-import JavaScript and prevented loading; a Bellwater test spent an extra boarding action and correctly lost Bram at the unchanged deadline, then its fixture was corrected through Undo and the accepted route. Gallery-only 20px stress text exposed a line-height mismatch, corrected by allowing its fixture to grow at line-height 1.4. No runtime threshold or essential text size was relaxed. Original wider-grid phone comparisons remain evidence of the visual choice. [Preparation record](PREPARATION.json).

One full unit run had 219 passes and two existing 5000ms geometry-test timeouts during concurrent browser work. That [original result](development/unit-geometry-timeouts.txt) remains. After pausing browser work, the same final source and unchanged limits pass all 221 tests in one run. The interrupted capture is retained separately as incomplete development evidence; the later six-size capture completes after the gate. No geometry or timing assertion was weakened.

## Remaining limits and disposition

Existing constrained card/dock overlap, prior delivered-heading observation and ≤180ms rapid-touch limit remain separately open. Lower warnings/details can require ordinary vertical scrolling. Physical Android, other engines, native GPU, alternate platform fonts and new acoustic approval remain unverified. The supplied board and gallery are design evidence only. Full historical browser coverage is outside this scoped pass.

**Implementation and focused verification complete; ready for ChatGPT review.** PR #1 remains draft against unchanged main `386de54d20fdd4a513a06115471d70bf94738cc0`. The final source/packaging identity follows the recorded working-tree evidence; final pushed SHA and remote equality are in the handoff. Portrait integration and human acceptance remain separate.

**Not deployed.** The owner-private Site remains version 11/game `23a644aba24e6479b9d82a106a745d15c3f8c7dc`, hosting source `d1fc7158d7b00717af18b7bc61ee4a33fe85bf2f`. ChatGPT reviews this new GitHub source before the next publication.
