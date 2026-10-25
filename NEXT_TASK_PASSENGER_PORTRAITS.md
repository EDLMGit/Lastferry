# Next task — recognizable animal portraits in passenger choices

## Current task and intended result

Read `AGENTS.md`, `docs/PROJECT_STATE.md`, this file and `cove-portrait-package/` before editing. This is the current task; older milestone/task files provide history rather than replacing this scope.

The user likes the new painted panels and wants to recognize the animals inside the boarding/unloading menu. Add small portraits made from the game's own animal models to the existing passenger choices. Keep the readable names, full space costs, clear selection state and stable nearby confirmation.

**Selected direction:** static transparent 256px PNG portraits, derived from the existing 3D model factory and its world proportions. Display them at approximately **40–44 CSS px beside the name and capacity**, within each existing native choice button. Do not add a tall portrait row or a live 3D viewport to the menu.

Complete the actual game integration, inventory updates, focused verification and review handoff. This is not a documentation-only or gallery-only task. Make routine implementation decisions independently; no intermediate permission request is needed.

## Source and publication continuity

- Repository: `https://github.com/EDLMGit/Lastferry`
- Branch: `m1-first-crossing`
- Reviewed implementation baseline: `23a644aba24e6479b9d82a106a745d15c3f8c7dc`
- PR #1 stays **draft** against unchanged `main`.
- Stable private phone URL: `https://last-ferry-playtest.abumech.chatgpt.site`

Preserve newer or unrelated work. Do not reset the branch, replace the canonical inventory with a seed, or overwrite later changes. Record the exact source used for implementation and evidence.

### Confirmed publication

Publication succeeded on 2026-10-25. The existing owner-private audience is unchanged.

- Published game: `23a644aba24e6479b9d82a106a745d15c3f8c7dc`
- Sites version: **11**
- Hosting source: `d1fc7158d7b00717af18b7bc61ee4a33fe85bf2f`
- URL: `https://last-ferry-playtest.abumech.chatgpt.site`
- Receipt: `cove-portrait-package/verification/deployment-confirmation.json`

The portrait candidates are **not** in that live build. Reconcile the stale version 10/live-publication prose in `docs/PROJECT_STATE.md` to these confirmed facts, preserving version 10 as history. Keep GitHub game and hosting source identities distinct. Do not infer future publication from a push.

### Acceptance context

The user reports that the panels look good and asks for animal recognition as the next improvement. Preserve that feedback in `docs/PROJECT_STATE.md` and the relevant asset acceptance records. It supports the observed visual direction; it is not a certification of every device, engine or untested interaction.

The baseline handoff reports build/TypeScript, 203 unit tests, five focused browser cases, six actual UI rescue runs and 272 contrast checks. Its retained limitations remain distinct. Do not turn those contributor results into newly performed portrait-pass checks.

## 1. Reuse the existing animals

The supplied package has three appearance variants:

- `rabbit-cream`
- `rabbit-tan`
- `sheep-wool`

The portraits are derived from `src/scene/models.ts`, `animal(species, variant)`, using the proportions that `src/scene/world.ts` applies to the actual world animals. The source SVG intermediates and the Node generator, `cove-portrait-package/tools/render-portraits.mjs`, remain editable/reproducible sources for the supplied PNG derivatives. Use the output paths and generation metadata in the supplied manifest; keep one canonical runtime image per appearance variant.

This is the existing identity mapping:

| Cove | Passenger ID / name | Appearance | Spaces |
| --- | --- | --- | ---: |
| First Crossing and Holding Pier | `rabbit-1` / Pip | `rabbit-cream` | 1 |
| First Crossing and Holding Pier | `rabbit-2` / Rue | `rabbit-tan` | 1 |
| First Crossing and Holding Pier | `sheep-1` / Moss | `sheep-wool` | 2 |
| Bellwater | `tansy` / Tansy | `rabbit-cream` | 1 |
| Bellwater | `lark` / Lark | `rabbit-tan` | 1 |
| Bellwater | `bram` / Bram | `sheep-wool` | 2 |

Cream/tan rabbits already differ in coat and ear splay. Sheep already have a distinct wool silhouette and dark face. Do not invent new accessories, recolor the world animals, change their bodies or add abilities to make the portraits different.

### Model fidelity and native-size quality

The selected portrait composition is head and upper chest, including the complete rabbit ears and enough sheep wool to identify the animal. It should read as the same miniature found on the pier and boat. Match the existing proportions:

- Rabbit world scale: `[1.25, 1.65, 1.25]`.
- Sheep world scale: `[1.15, 1.5, 1.15]`.

The supplied source-derived SVG shading is a lightweight offline interpretation of the model. It is **not pixel-identical to the game's WebGL material/light rendering**, and it must not be described as a screenshot of the live scene. Inspect the PNG at the actual 40–44px display size. Integrate it if recognizable and clean; if a crop, lighting or edge adjustment is needed, change the reproducible recipe and regenerate the three related outputs together. Do not switch to an unrelated illustration style or an image-generation prompt.

Portraits need transparent backgrounds, clean edges over both ordinary and selected tiles, consistent framing, intact ears/wool and a readable face. The image must not include baked names, space costs, checkmarks, a button frame or a background disk. Existing DOM/CSS owns those elements.

## 2. Make identity mapping consistent

Current `World.speciesIndex(id)` derives each animal's ordinal among matching species in the **complete level passenger array**. The world then passes that ordinal to the model factory. It also uses the full ordinal for deck placement and some poses.

Create or extract one small pure resolver shared by portrait lookup and the existing world identity calculation. Resolve from **level + passenger ID**, never from a display name, the current offered list, selected subset, aboard order or DOM index. Keep the resolver free of Three.js, DOM and renderer dependencies.

Requirements:

- Rue and Lark remain tan when they are the only animal offered or aboard.
- Reordering the offered/selected array cannot change any animal's portrait.
- Keep the full species ordinal available to `World.speciesIndex` and its placement/pose consumers. Do not collapse that ordinal into a two-variant boolean where callers expect the full index.
- A name or capacity comes from the existing level/name helpers, not the image file or a duplicated portrait data table.
- Unknown future appearances have an explicit text-preserving fallback or clear development diagnostic; do not silently display a different named animal.
- Preserve current world scales, colors, geometry, anchor positions, rotations and animation behavior. A bounded shared-resolver extraction is allowed; a world-model redesign is outside scope.

The portrait generator and canonical model remain the editable source. Keep image outputs as derivatives with source/version metadata. Do not create six separately painted assets for six names when three shared appearance variants suffice.

## 3. Add portraits to the existing choices

### Required consumers

Use the portraits in the passenger selection controls for **Board**, **Let ashore** and **Bring home**, across all three existing coves. Update the development gallery from the same helper and assets.

This pass does not need a new animal collection screen, encyclopedia, separate portrait dialog, Settings decoration, permanent HUD roster or new celebration. Names and capacity text remain the decision information.

### Layout

Add the 40–44px portrait **beside the complete name/capacity block**, not above it. Retain the current roughly 62px tile height wherever the measured content fits. Allow a tile to grow only when longer/wrapped text genuinely needs it. Do not reduce essential 16px text, crop a name/cost or shrink a touch target to force the picture into the old grid.

Adjust the width-aware grid minimum to account for the actual portrait + copy + selection cue. Two columns or one are acceptable when necessary; three are not mandatory. Do not choose columns solely from portrait/landscape orientation. Inspect the real three-passenger Harbor state and the two-rabbit boarding state, not only a wide gallery card.

Keep the selection check distinct without covering a face or ear. A compact check/name line with capacity beneath is a useful starting point. Selected/unselected animals remain clearly visible; do not communicate selection by making the animal nearly disappear.

The fixed transfer sheet and footer remain useful. Keep Confirm stable through 0/1/2/3 selections and repeated dialog rendering. Use the existing body scrolling on constrained heights; full warnings and consequences must remain reachable. Do not enlarge the overall sheet for portraits, move it away from the action, grow the HUD, shrink the ferry or change camera framing.

### Native controls, loading and focus

Preserve one native `button#passenger-ID.cove-choice` with `aria-pressed` for each passenger. Extend `passengerChoiceContent` with an explicit resolved appearance descriptor/key; update its gallery caller deliberately. Synthetic longer-name specimens need explicit appearance fixtures rather than name-based guessing.

- The image is decorative/nonfocusable, non-draggable and not an independent pointer target. The native button owns the action, accessible name and focus.
- Keep name and capacity readable as text. If species is added to the accessible name, announce it once; avoid redundant image alt text plus repeated labels.
- Preserve the existing choice IDs, DOM/Tab order, selected shape, keyboard activation, Escape/cancel recovery and the recent portrait-layout focus fix.
- Reserve image width/height and space before decode. Cold loading, failure or reopening cannot shift the button or footer.
- A missing image leaves a tidy reserved slot or quiet fallback while full labels, selected state and action remain available. No browser broken-image text should replace the passenger's name.
- Keep nested portrait/check/name activation to exactly one toggle, with no map tap-through or accidental confirmation.
- Keep the same native dialog and selected state through actual fullscreen promotion; do not replace it with a portrait-specific overlay.

Use static assets in ordinary gameplay. No per-choice canvas, WebGL context, live render loop, animated idle portrait, sound cue or extra scene allocation is needed.

## 4. Generator and asset ownership

Use the supplied generator and metadata as a reproducible source. It imports the current original model and uses an isolated offline render path. The portable SVG stage uses Node 24 and the project's existing Three.js dependency. PNG rasterization can use an available offline rasterizer such as the supplied environment's Sharp installation; do not add a production dependency or runtime renderer solely to display the portraits.

Document the exact command and environment actually used. Keep the source model, species scales, camera/crop, lighting/shading, alpha/color encoding, 256px output dimensions and variant mapping in the generation record. If a change makes an output stale, regenerate it deliberately and update evidence. Do not claim bit-identical WebGL rendering from the offline SVG path.

`mat()` caches model materials by color. An exporter must not mutate or dispose materials belonging to the live game. Keep generation isolated; clone any temporary materials it modifies. The shipped game simply loads the static results.

## 5. Keep the asset inventory extensible

`assets/catalog.json` remains canonical. The supplied `asset-update-plan.json` is an integration plan, not a replacement inventory.

Add **one** portrait family, for example `ui.passenger-portraits`, with the three appearance variants. Use a truthful `generated-ui-image` kind with bounded validator/type requirements. The current validator lacks a runtime portrait/raster kind; do not label a runtime PNG as `reference-image` or pretend it is a 24×24 icon.

Required type-specific information:

1. Original model source and shared identity resolver.
2. Render recipe: camera/crop, world proportions, lighting/shading, transparency and color semantics.
3. Derived output paths, dimensions, format and variant keys.
4. Generation command/environment and source/output metadata.
5. Actual consumers, displayed size/fit and semantic purpose.
6. Native-control ownership, text fallback and loading/failure behavior.
7. Actual small-screen and selected/unselected evidence, separate from model/board specimens.

Preserve all 71 existing IDs and retired entries. One new family gives 72 total if this chosen structure is used. Update `model.rabbit`, `model.sheep`, `ui.component.passenger-choice`, relevant `ui.dialogs` evidence, the ledger and style guide. Keep generated-output provenance distinct from original editable model source.

The developer gallery must show actual shared portraits at full source size and native phone display size, both rabbit variants and sheep, selected/unselected/focus states, an image-failure specimen, constrained text fit and both coves' naming schemes. Gallery-only longer names remain test fixtures, not renamed game passengers. Keep gallery/catalog tooling out of the ordinary game bundle as before.

Update `STATUS.md` and `docs/PROJECT_STATE.md`, including the user acceptance of the panel direction and the portrait pass's status. Integration and human acceptance remain distinct.

## 6. Focused verification

### Code gates

Run the production build/TypeScript, current unit suite and catalog validation under Node 24. Add only meaningful tests for shared appearance identity and the actual new UI/loading risks. No broad new asset-management infrastructure or full historical browser suite is required.

### Mapping and asset checks

- Verify all nine level/passenger combinations across the three coves.
- Verify Rue/Lark offered alone, after partial delivery and with reordered offered/selected lists.
- Confirm correct decoded variant, 256px source dimensions, transparent edge behavior and native 40–44px recognition.
- Inspect ivory/tan rabbits and sheep against ordinary/selected panels; keep ears, eyes/nose and wool legible. Record asset bytes/format and no new runtime canvas/context/render loop.
- Exercise cold/delayed and failed image loading. Labels, capacity, selection and reserved target geometry must remain correct.

### Actual interface checks

1. **Passenger states:** two rabbits at boarding, a single sheep, and all three aboard at Harbor before Confirm. Exercise selected/unselected/zero/partial/all states using actual controls. Capture the correct portrait-to-name mapping.
2. **Phone fit:** 844×390, 780×320, 390×844, 360×740 and 320px width. Check complete per-line name/capacity bounds, nested scroll widths, portrait containment, visible selected cue and reachable warnings/Close/Confirm. Preserve the last pass's no-horizontal-overflow checks.
3. **Loading stability:** at representative narrow and short viewports, measure choices and footer before/after image decoding and subset toggles. Avoid layout shifts from image intrinsic size or failed-image replacement.
4. **Input:** tap/click the image, check, name and blank button area; each toggles once. Natural Tab/Shift+Tab/Enter/Space/Escape and cancellation return visible focus. Scroll the long warning normally. Check no map input leaks through.
5. **Rescue and identity:** complete an actual Holding rescue with tide Undo, partial delivery, terminal Undo and redelivery. Reopen dialogs to verify identities do not change. Exercise Bellwater through a real passenger interaction so its Tansy/Lark/Bram mapping is verified outside the gallery.
6. **Retained lifecycle:** one representative actual supported fullscreen entry/exit with the subset dialog open, retaining selection/focus/scroll, and the affected cold-touch audio intent check. Keep mock diagnostics distinct from native/physical-device results.

Capture a short uninterrupted actual gameplay sequence and matched native-size images, with the exact source/build identity. The static portrait board is design evidence only. State which checks are fresh and which unaffected results are reused. Keep real failures and corrected reruns explicit; do not loosen thresholds to obtain a pass.

The prior card/dock overlap, delivered-heading observation and ≤180ms rapid-touch limit remain separately documented. Physical Android remains a user playtest unless actually performed. Do not relabel those limits because the portraits pass inspection.

## 7. Handoff

Write `reviews/passenger-portraits/REVIEW.md` with:

- Final visual choice and native phone-size evidence.
- Variant/name mapping and new/updated catalog IDs.
- Generator/source/output provenance and actual image transfer sizes.
- Focused commands/results, original failures and remaining limits.
- Exact final source/build identity and a short uninterrupted actual UI recording.

Commit and push the completed work to `m1-first-crossing`. Update PR #1 while keeping it draft. Verify remote/local SHA equality and report working-tree state. Leave `main` unchanged and never force-push.

**Do not automatically deploy the portrait pass.** Return the final SHA and review for ChatGPT's next review and publication to the same private phone Site. Keep live publication facts at their confirmed values until a deployment actually succeeds.
