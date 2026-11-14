# Passenger portrait source and gallery evidence

The three supplied transparent PNGs are retained unchanged. Their complete original generation manifest, geometric SVG intermediates and generator remain under `cove-portrait-package/`. The original model is still `src/scene/models.ts`; no model, world proportions, color, geometry or new accessory was authored for this UI pass. The shared resolver only extracts existing full-level identity.

| Appearance | Existing identities | PNG bytes | Source/display |
| --- | --- | ---: | --- |
| `rabbit-cream` | Pip in First Crossing/Holding; Tansy in Bellwater | 27,139 | 256×256 / 44 CSS px |
| `rabbit-tan` | Rue in First Crossing/Holding; Lark in Bellwater | 28,653 | 256×256 / 44 CSS px |
| `sheep-wool` | Moss in First Crossing/Holding; Bram in Bellwater | 43,602 | 256×256 / 44 CSS px |

Total **99,394 bytes** before transport compression. PNG is 8-bit straight-alpha RGBA with sRGB interpretation. Fresh Pillow decoding confirms all three dimensions, complete images and alpha range 0–255. The head/upper-chest crop intentionally continues into the lower edge; rabbit upper ears and sheep upper wool remain intact with transparent padding. [PNG audit](png-audit.json).

Fresh isolated SVG reproduction under Node **24.15.0**, existing Three.js **0.186.1**, uses:

```powershell
node cove-portrait-package/tools/render-portraits.mjs --repo . --out reviews/passenger-portraits/raw/generated-svg --source-commit 23a644aba24e6479b9d82a106a745d15c3f8c7dc
```

Every SVG matches the supplied intermediate byte-for-byte. Original model, generator and dependency-lock hashes match. No PNG regeneration was necessary because all supplied SVG/PNG hashes remain exact. The original PNG recipe records Node 24.22.1, Three.js 0.186.1, Sharp 0.35.5, 768px SVG raster input and Lanczos3 downsampling to 256px. Exact source/output hashes, camera/crop, lighting, scales and rasterizer versions remain in the original manifest; the [fresh generation audit](generation-audit.json) records the actual local command and environment. Raw repeated SVGs are local/ignored. No production dependency or rasterizer was added.

The generator creates isolated model instances and clones temporary cached materials before adapting/disposal. It uses the official geometric SVGRenderer with simplified diffuse shading. These are model-derived artwork, **not pixel-identical WebGL/ACES/shadow screenshots**. Runtime uses ordinary static PNG assets; no per-choice renderer, canvas, WebGL context, render loop, animation or sound is added.

## Shared gallery and native-size inspection

`src/dev/asset-gallery.ts` imports the actual `portraitSources`, `passengerChoiceContent()` and `observePassengerPortraits()` from runtime. It presents the three 256px originals, 44px choice images, both naming schemes, selected/unselected/focus states, a genuine failed image request, explicit unavailable-appearance fallback and 400/320px width constraints. Synthetic longer names receive explicit appearance fixtures. No name-based image lookup is used.

Fresh command with the existing Chromium installation:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='../.cache/ms-playwright'
node tools/check-passenger-portrait-gallery.mjs
```

The tool defaults to `http://127.0.0.1:5250` (`PORTRAIT_GALLERY_URL` overrides it). At 1440px and 320px viewports, all **28 choices** pass their individual text-node `Range` fragments and nested scroll checks, 44px portrait containment, decoded 256px source dimensions, fixed reserved slot, noninteractive decoration and failed/unavailable fallback. No hidden-scrollbar exemption is used. The gallery has zero canvases. [Measurements](gallery/measurements.json).

All **10 final gallery screenshots** and the three 256px source PNGs were inspected at original dimensions. At actual 44px size the rabbits remain recognizable through complete upright ears, pink inner ears, cream/tan coats and visible eyes/nose. Sheep retains the cream wool/dark face distinction. Selected and unselected images stay equally visible; checks do not cover faces or ears. The failed Lark request leaves a tidy reserved slot with the full name, cost and check. No visible halo appeared over either teal tile face. [Inspection and source hashes](gallery/native-inspection.json).

The first bounded 20px text-stress specimen failed vertical content-box bounds: Segoe UI glyph rectangles were 27px high inside a 25px line-height. Native 16px choices and all horizontal dimensions already passed. The original [failure](development/gallery-initial.json) is preserved. A gallery-only stress line-height of 1.4 gives larger glyphs actual space and lets the tile grow; the same unchanged measurement thresholds then pass. It does not change ordinary game typography or relax the phone assertions.

Gallery/package specimens are design evidence only. Actual UI rescues, phone gameplay, loading stability, keyboard/touch, fullscreen and audio checks are recorded separately in the main review. Physical Android, alternate platform fonts, other engines and new acoustic approval are not established by these images.

## Inventory ownership

The canonical inventory adds one **`ui.passenger-portraits`** family, kind **`generated-ui-image`**, for three reused appearances. All 71 previous IDs and retired entries remain, for 72 families total. `model.rabbit` and `model.sheep` record the generator/resolver consumers; `ui.component.passenger-choice` and `ui.dialogs` record actual static-image/semantic/loading contracts. Panel-related acceptance preserves prior history and now records the user's praise for published version 11, separately from the unaccepted new portrait candidate.

`tools/check-assets.ts` narrowly validates 1–16 local PNG outputs, up to 1 MiB and 1024px per axis, original model/resolver/generator/record paths, seven type contracts, RGBA8 PNG headers, actual dimensions, SHA-256/byte-count provenance and exact output/family variant correspondence. Complete PNG decoding and native-size visual quality are separate evidence. Five focused validator tests pass, including three new corruption/missing-variant/unsafe-path cases. The main handoff records final complete gates and the Git source audit.
