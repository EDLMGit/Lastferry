# Passenger portraits — art and integration contract

## Purpose

Help players connect a name in the passenger selector with the little animal on the pier or boat. The portrait is a recognizable part of the same game world. The visible name, complete space cost and selected check still explain the action.

Use static transparent 256px PNGs displayed at approximately 40–44 CSS px beside the text. Source-derived SVG intermediates and a reproducible generator preserve editability without adding a runtime 3D viewport.

## Existing appearance is authoritative

| Appearance key | Factory and proportions | Current names |
| --- | --- | --- |
| `rabbit-cream` | `animal('rabbit',0)`, scale 1.25/1.65/1.25; cream coat, modest ear splay | Pip; Tansy |
| `rabbit-tan` | `animal('rabbit',1)`, scale 1.25/1.65/1.25; tan coat, wider ear splay | Rue; Lark |
| `sheep-wool` | `animal('sheep',0)`, scale 1.15/1.5/1.15; clustered cream wool, dark face/ears | Moss; Bram |

The names occur in different levels; reuse does not mean introducing a new relationship or story claim between those animals. Level data and name helpers own identity/capacity. Full-level species order currently owns appearance. The current offered/selected order must never recolor an animal.

The parent model's local front is positive Z and feet contact is at its origin. A head/upper-chest crop should retain full rabbit ears and enough sheep wool/face to identify it. Keep the model's existing geometry, palette, ear splay and world proportions. Add no scarf, collar, eye redesign, body rescale or gameplay meaning.

## Framing and surface

- Keep all three portraits visually balanced at native phone size, with clean padding around ears/wool.
- Transparent background; no baked badge, frame, selection color, label or capacity.
- Use quiet coherent lighting/shading. The source-derived SVG rendering is an offline approximation and is not pixel-identical to WebGL.
- Inspect the generated PNG over the actual ordinary and selected teal tile faces. Avoid dark/light fringes, cropped ears and tiny unreadable eyes.
- A portrait's visual size does not encode capacity. Keep explicit 1 space / 2 spaces text.
- No autonomous bob, blink, turn, hover zoom or animated state. Existing button feedback is sufficient.

The supplied PNGs can be integrated if their actual 40–44px result passes inspection. If adjustments are needed, change the generator recipe and regenerate the family; preserve model fidelity and document the resulting crop/light decision.

## Shared resolver

Resolve full level + passenger ID into species ordinal, model appearance and portrait key using one pure helper. Have the world preserve/delegate its current species-index calculation through that source. Keep the full ordinal intact for deck/pose consumers; the appearance key is a separate field.

Required cases include Rue and Lark offered alone, partial delivery, reopened dialogs, and any ordering of offered/selected IDs. The resolver should not depend on a display name or import Three.js/DOM. Unknown future appearances need an explicit safe text-preserving fallback or development diagnostic, rather than a silently wrong animal.

## Native choice integration

The current `passengerChoiceContent` helper and `.cove-choice` family are the integration point. Pass a resolved portrait descriptor/key alongside the existing live name/capacity. Update the game and gallery callers together.

Keep one native button and one Tab stop. The portrait is a nonfocusable, non-draggable decorative image; pointer events resolve to the native owner. Preserve button IDs, `aria-pressed`, the selected check and keyboard focus/cancellation. Use empty alt text when live text already names the passenger; if species becomes part of the accessible name, announce it only once.

Use a portrait column beside a flexible name/capacity block. Keep the current approximately 62px tile height where measured content fits. Allow normal wrapping when necessary; never shrink/ellipsis names or full costs. Adapt columns to actual panel width. The selected check must remain visible without covering a face/ear or requiring an independent control.

Reserve the portrait box before image decode. Cold, delayed, failed and cached loading must not change the button/footer bounds. Labels and state remain usable with an unavailable image. The existing fixed transfer sheet, nearby placement and scrollable body stay authoritative; do not add a tall image row or enlarge the sheet to display artwork.

## Generation and ownership

`cove-portrait-package/tools/render-portraits.mjs` is the supplied generation entry. Use its recorded output paths and metadata. The SVG stage uses Node 24 + the existing Three.js dependency; an available offline rasterizer such as Sharp can create the PNGs. A production dependency is unnecessary for display.

Keep the exact model source, scales, camera/crop, shading/light values, variant keys, alpha/color semantics, output dimensions and source/output identity in the record. PNGs are generated derivatives; do not hand-edit them independently. If one portrait needs recipe refinement, keep the family coherent and regenerate related outputs.

Model materials are cached by `mat()`. Export in isolation and clone any temporary material changes. Do not render by mutating/discarding the live world's material cache or allocating a renderer per button. The shipped game uses ordinary static images.

## Catalog and gallery

Add one `ui.passenger-portraits` family with three appearance variants and a truthful `generated-ui-image` kind. Extend the existing validator/type fields narrowly because it currently has no runtime raster portrait category. Preserve all 71 existing IDs; if this is the only added family the total is 72.

Update `model.rabbit` / `model.sheep` consumers and derivation provenance, passenger-choice helper/layout contract, relevant dialog evidence, asset ledger and style guide. Keep human acceptance separate from source generation and integration.

The gallery should reuse the runtime images/helper, showing full source size and native phone size, selected/unselected/focus/failure states, both naming schemes and constrained text stress. Synthetic names need an explicit appearance fixture, not a guessed identity. Do not add a new gameplay collection page.

## Evidence

The key screenshots are actual two-rabbit boarding, single-sheep choice and three-passenger Harbor before Confirm at both phone orientations. Extend the existing per-line label/nested overflow checks to portrait containment, loading stability and image/name/variant correctness. A new specimen alone does not prove that the game integration fits.

Keep existing sound, fullscreen, panning, nearby action, future-preview copy, tide/terminal Undo and arrival intact. A short actual rescue and one Bellwater passenger interaction establish meaningful integration coverage; a full historical browser suite is unnecessary for this bounded presentation change.
