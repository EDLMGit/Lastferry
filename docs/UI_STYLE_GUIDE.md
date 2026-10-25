# Last Ferry — interface materials and icon style

This is the integrated interface contract derived from the supplied [`STYLE_GUIDE.md`](../cove-ui-package/STYLE_GUIDE.md), [`painted panel material`](../cove-panel-package/material/MATERIAL_SPEC.md) and [`model-derived portrait contract`](../cove-portrait-package/ART_AND_INTEGRATION.md). Existing cove art remains the reference. Package specimens are design evidence, not gameplay screenshots or new level layouts. The user reports that the painted panels look good at published `23a644aba24e6479b9d82a106a745d15c3f8c7dc` / Sites version 11. That feedback supports the panel direction; the new portraits are a separate integration awaiting review and user playtest. Integration, source verification and human visual acceptance remain separate in [`assets/catalog.json`](../assets/catalog.json).

The shared implementation is [`src/ui/cove-ui.css`](../src/ui/cove-ui.css) and [`src/ui/cove-ui.ts`](../src/ui/cove-ui.ts). The CSS imports the single editable [`cove-panel-material.css`](../cove-panel-package/material/cove-panel-material.css), with its sibling [`shoreline-corner.svg`](../cove-panel-package/material/shoreline-corner.svg). Editable icon paths remain only in `cove-ui-package/ui/icons/*.svg`; Vite imports the individual originals, excluding the supplied snapshot sprite. The development gallery reads the canonical catalog and these same helpers/components. No runtime asset manager, font loader or separate copy of SVG paths is introduced.

## Character

Make the controls feel like small useful objects from the harbor: painted surfaces, softened corners, a little thickness and warm light along an edge. The game world already supplies waves, reflections and movement. The controls should settle quietly around it.

Current source anchors are `src/scene/models.ts` (rounded ferry, cream wool, painted timber, stone) and `src/style.css` (deep teal, ivory, foam and amber). Keep large reading surfaces dark teal. Light seafoam and lantern colors belong on compact action faces and small identity details.

## Material tokens

| Token | Integrated value | Role |
| --- | --- | --- |
| `--cove-panel` | `#143d46` | Retained base token; painted reading faces use the surface tokens below |
| `--cove-panel-soft` | `#234e55` | Quiet inset/utility face |
| `--cove-ink` | `#173d43` | Text and icons on light action faces |
| `--cove-ivory` | `#fff3d9` | Text and icons on dark surfaces |
| `--cove-secondary` | `#d6e5d8` | Supporting text on dark panels |
| `--cove-foam-top` | `#c0ded1` | Upper edge of a seafoam action face |
| `--cove-foam` | `#a9cfc1` | Main ordinary action face |
| `--cove-foam-lip` | `#6f9e92` | Small lower edge, not text background |
| `--cove-warm-top` | `#f3d6a0` | Warm action highlight |
| `--cove-warm` | `#e7bd77` | Harbor/progression emphasis |
| `--cove-warm-lip` | `#ad8551` | Small lower edge |
| `--cove-warning` | `#f2b7a0` | Warning symbol/text on dark backing |
| `--cove-focus` | `#f6cf8a` | Focus outline, with a dark keyline |
| `--cove-edge` | `#092f3c` | Lower silhouette and focus isolation |
| `--cove-surface-top` | `#2b5356` | Opaque upper painted wash |
| `--cove-surface-face` | `#1b434b` | Opaque main reading face and missing-SVG fallback |
| `--cove-surface-bottom` | `#123741` | Opaque lower reading face |
| `--cove-surface-rim` | `#9eb5a5` | Desaturated sage panel rim |
| `--cove-surface-edge` | `#0b2d36` | Shallow lower painted lip |
| `--cove-surface-highlight` | `rgb(255 243 217 / 18%)` | Restrained upper catchlight; arrival uses warm ivory at 38% |

Button values stay in `.cove-kit`: quiet upper face `#345f64`, lower face `#234e55`, disabled face `#345158`, disabled text `#d5e0d7`, and quiet control border `#a4b7a9`. The canonical `.cove-surface` owns all reading-face gradients, the sage rim, lower lip and corner image. The older 97%-opaque `--panel` fallback is no longer the visible reading surface of integrated panels. These are CSS material choices, not sampled physical materials or a changed world palette.

The [previous composite check](../reviews/cove-ui-assets/contrast.json) recorded 169 comparisons across nine runtime UI stages at 844×390 in Chromium/SwiftShader, with lowest sampled text/icon contrast 6.279777:1. It describes the earlier two-stop/alpha treatment, not the new opaque three-stop material and motif. The current pass must parse the complete surface and conservatively composite the actual SVG decoration; unparsed backgrounds cannot count as passing. New source-tied contrast and actual-game captures are recorded under `reviews/cove-panel-refinement/`. Neither check is full accessibility certification.

The [current integrated check](../reviews/cove-panel-refinement/contrast.json) passes 272 comparisons across 13 actual UI stages at 844×390, with minimum text 4.633124:1 and meaningful icon/state 6.036691:1. Its source-checked, browser-decoded 192×128 SVG contributes every distinct nontransparent RGBA pixel over every opaque gradient endpoint, independent of its normal corner position. Unknown or unsupported layers fail instead of being skipped. The method also composites actual foreground/ancestor layers, tests focus and selected cues, and preserves original exploratory failures. All 13 measured buttons have `0s` transitions under Settings Reduced. Actual phone fit and visual inspection remain separate evidence in the [panel review](../reviews/cove-panel-refinement/REVIEW.md).

## Shape and relief

- Main actions: labeled capsules, 48px or more high on phones, 16px action text, 24px glyph. Narrow HUD Undo uses a 22px glyph above its label inside the stable control; it does not enlarge the short-landscape HUD to fit decoration.
- Familiar utilities: rounded 48px controls; constrained existing targets may remain 44px. A 24px visible icon is not a 24px hit target.
- Panels: 20px outer corner radius, with compact 14px HUD and 15px forecast variants; one restrained frame. Preserve current placement and scrolling behavior rather than applying specimen padding wholesale.
- Relief: about 2–3px lower lip, one thin top highlight and a short soft shadow. Press feedback changes the inner face/shadow, not the measured hit region or map anchor.
- Passenger choice: quiet inset surface; a static 44px portrait sits beside a flexible copy block. A separate check and full name share its first row; full `1 space` / `2 spaces` text sits below. The width-aware grid uses a 9rem minimum that accounts for portrait, check and live text rather than choosing columns by orientation. Normal phone text stays 16px; the compact tile remains about 62px high where content fits and grows for real wrapping. Full labels cannot be ellipsized or hidden.
- Name plates: short, subtle dark backings. Do not turn island names back into large button-shaped signs.

## Hierarchy and transparency

Keep all ordinary water/animal inspection visible around compact controls. The top HUD must not become taller to add decoration. Prefer one outer surface to multiple nested cards. Reading faces are opaque: no recognizable animals, map labels or underlying controls show beneath the text. Only the exterior shadow, upper catchlight and sparse motif use alpha; the panel itself does not. Do not shrink the scene or hide overflowing text to create apparent fit.

Regular panels use a 155-degree three-stop painted face and a 192×128px lower-right SVG corner. Its three curves use muted teal `#648e86` at 5.5% opacity. The center remains quiet; the gradient and solid fallback remain complete if the SVG is unavailable. `.cove-surface--compact` removes the motif and uses a smaller lip/shadow for HUD, names, forecast and local options. `.cove-surface--arrival` changes only the upper highlight to warm ivory at 38%. Geometry, radius, padding, placement and native scrolling remain component-owned; the material owns no layout, pointer target or animation.

Transfer previews reserve their existing sheet height so subset toggles keep the footer and confirmation target stable. The shared `passengerChoiceContent()` keeps native buttons and full names/costs in DOM reading order. Dialog/body/group overflow and individual text-line `Range` rectangles are checked separately: a visible button rectangle or hidden scrollbar is not evidence that its labels fit. Short heights may scroll vertically, retaining Close/Confirm and a reachable full consequence. Proposed delivery uses future wording and an explicit `After this action` line; only Confirm commits state and triggers arrival.

Warm Harbor identity is a lighthouse plus “Home.” Warning identity is a warning shape plus its consequence. They may share a warm family but cannot be distinguished only by hue. The current amber selection language remains coherent with both.

## Icon drawing contract

The supplied original set uses 24×24 view boxes, 1.8px round-cap/round-join strokes, a consistent inset, and at most two related tones. Use `currentColor`; optional accent is `--cove-icon-accent`. They must remain understandable in one color. Author no icon text, remote resources, effects or fonts.

Board/Unload share a hull and reverse the arrow relative to the deck. The complete pictogram stays upright. Home is the lighthouse; Back to boat is a framed ferry. Sound Retry is a distinct state and keeps its short visible word. A general Home/menu icon must not replace the objective icon.

Inline the individual SVGs through the shared bundler helper. Standalone `<img>` does not inherit the button's current color. SVG children are decorative and nonfocusable; the native button owns the visible label, accessible name, hit target and event. `setControl()` retains the actual button and its intent/focus data while updating the glyph and label children. The supplied sprite remains a package snapshot, outside the runtime source of truth.

Dock transfer pictograms stay upright at either berth orientation; only the game geometry determines boarding. Harbor/Home uses the lighthouse identity, Bring home uses the unload-family action with warm emphasis, and Back to boat uses the framed ferry. Board, Let ashore, Bring home, Sail, Wait and confirmation retain visible wording. Playing/muted/requested sound states select their own icons; Retry retains a visible word, and explicit captured sound intent continues to own the click.

Passenger choices remain native buttons with `aria-pressed`, a square checked shape, passenger name and capacity use. Their style borrows the specimen's inset treatment without converting them to inputs or changing dialog Tab traversal. The gallery uses the same `passengerChoiceContent()` and shared grid, including 400px and 320px three-choice specimens, selected/unselected states, a long warning, keyboard focus and a gallery-only 125% text/long-name stress case. Map name and marker remain one semantic selection button. State shapes/text and free inspection are retained.

## Static animal portraits

The original [`animal()` model](../src/scene/models.ts), world proportions and [`offline generator`](../cove-portrait-package/tools/render-portraits.mjs) own the appearance. Three canonical 256×256 transparent PNG derivatives under `cove-portrait-package/portraits/` are shared: cream rabbit Pip/Tansy, tan rabbit Rue/Lark and wool sheep Moss/Bram. Their original SVG intermediates and complete camera/crop/light/color recipe remain beside the PNGs. The SVG export uses simplified diffuse geometric shading, so these are model-derived artwork, not pixel-identical WebGL screenshots. Rabbit ears and sheep wool remain intact; the lower upper-chest crop is intentional. No baked names, check, frame, accessories or background disk.

[`resolvePassengerAppearance(level, passengerId)`](../src/game/passenger-appearance.ts) resolves from the complete level. Offered/selected/aboard order and display names do not control coat color. World keeps the full species ordinal for existing deck and pose consumers; the portrait key is separate. Unknown future appearances use an explicit text-preserving reserved slot rather than an incorrect animal. Names/capacities continue to come from existing level helpers.

The native choice still owns one Tab stop, accessible name and action. Its empty-alt, non-draggable image has no independent pointer or focus role. A fixed 44px slot and explicit image dimensions reserve geometry before decode; the image becomes visible only after load. Error leaves a quiet slot without broken-image text, retaining full name/cost, selected cue and operable action. `observePassengerPortraits()` listens on the stable component root, including later dialog renders. Same native dialog/selection/focus/scroll ownership remains through fullscreen. No per-choice canvas, new WebGL context, animation loop or UI sound is created.

The source-driven developer gallery includes actual 256px images and native 44px choices, both naming schemes, selected/unselected/focus states, a deliberate failed request, unknown-appearance text fallback and constrained longer-name/text-size specimens with explicit appearance fixtures. It is design evidence only; actual Board / Let ashore / Bring home captures and loading/input measurements belong under [`reviews/passenger-portraits/`](../reviews/passenger-portraits/REVIEW.md).

The original PNGs total 99,394 bytes before transport compression. Fresh isolated Node 24.15.0 / existing Three.js 0.186.1 export reproduces all three supplied SVGs byte-for-byte; supplied PNG hashes remain exact. PNG regeneration is therefore unnecessary. The original raster recipe records Node 24.22.1 / Sharp 0.35.5 / 768px input / Lanczos3 downsampling to 256px, straight RGBA8 alpha and sRGB. [`generation-audit.json`](../reviews/passenger-portraits/generation-audit.json) records the exact command and source/output identities; [`png-audit.json`](../reviews/passenger-portraits/png-audit.json) separately records fresh complete decoding, dimensions and alpha. No production rasterizer dependency is added.

The catalog's single new `generated-ui-image` family has structured outputs with variant/path/format/dimensions/alpha/color/hash fields plus seven required source/recipe/consumer/loading/evidence contracts. The bounded validator accepts 1–16 local RGBA8 PNG outputs, each at most 1 MiB and 1024px per axis, verifies header dimensions and SHA-256, and requires exact family/output variant correspondence. This source/header validation is distinct from complete decoding, native-size recognition and physical-phone approval. All 71 pre-existing IDs and retired records remain; the inventory now has 72 families.

The historical panel-only [gallery fit check](../reviews/cove-panel-refinement/gallery/measurements.json) passed at 1440px and 320px viewports: 18 choices and 39 individual text-node line fragments. The fresh portrait [gallery check](../reviews/passenger-portraits/gallery/measurements.json) passes 28 choices and 56 line fragments, fixed 44px image containment, no nested horizontal overflow, loading-failure fallback and 20px long-name stress. All ten final portrait specimen images were inspected at native size. These are design checks, not gameplay screenshots or Android certification. Actual phone gameplay, full-label fit and loading stability are recorded separately in the portrait review.

## States and movement

Every shared control needs normal, active/pressed, keyboard focus and disabled states; applicable controls also need selected, warning, pending/retry and current states. Use shape/text in addition to color. Disabled text remains readable even when no longer actionable. Keep important warnings explicit.

Use a brief 120ms non-focus shadow response. Focus is immediate and uses a 6px dark isolation keyline around its warm outline. Press feedback changes only the inner shadow; the measured target never translates or scales. No automatic bobbing, looping shine or new UI audio. Device Reduced Motion and the in-game Settings Reduced mode make decorative transitions immediate; the actual Settings check recorded 13 controls with `0s` transition duration. Existing audio, crossings and homecoming keep their accepted timing.

## Readability

Preserve Segoe UI/Arial/sans-serif body text and Georgia/serif titles for now. Essential phone controls retain approximately 16px labels. Check normal text at 4.5:1 and meaningful icon/state cues at 3:1 over their actual adjacent colors. Light action faces use dark ink. Focus uses amber with a dark keyline so it remains distinct on both kinds of face. Candidate color-pair calculations are only a preliminary check; actual integrated alpha, gradients, anti-aliasing and backgrounds need review.

## Extension rule

Choose an existing material and icon family before inventing another. Copy [`assets/ASSET_ENTRY.template.json`](../assets/ASSET_ENTRY.template.json), add a stable ID, editable source, semantics, states, provenance and evidence in the same change as a new asset. Keep instance placement in level data. The gallery renders actual shared sources so it cannot drift into a second implementation of the UI. Run `npm run check:assets`; each type's required details are listed in the catalog and in the supplied [`ASSET_INVENTORY.md`](../cove-ui-package/ASSET_INVENTORY.md). A procedural factory is an asset source, and a reference image remains reference-only. Retired entries retain their source revision and replacement IDs; integration does not imply human acceptance.

References: [text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [larger targets](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html).
