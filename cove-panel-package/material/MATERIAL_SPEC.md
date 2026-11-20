# Last Ferry — painted harbor panel material

**Status:** original candidate assets, not integrated or human accepted. Intended source baseline: `a4325353cf11cd4edba8d5384b58fe138e4772e3`.

## Purpose

Give the shared menu/card background the quiet painted relief of the accepted cove controls. The reading face is opaque: moving animals, labels and other controls remain visible around a compact panel, rather than appearing through its text area. The accepted world, water, button materials and icon sources are unchanged by this candidate.

These files define appearance only. Existing application CSS and measured placement continue to own width, height, position, padding, border width, radius, scrolling, hit regions and focus behavior.

## Sources and variants

| Source | Role |
| --- | --- |
| `cove-panel-material.css` | Editable shared material, face palette, relief and variants |
| `shoreline-corner.svg` | Original transparent decorative lower-corner contours, 192 × 128 view box |

Apply `cove-surface` to an existing panel after its layout and focus contract is retained. It adds an opaque three-stop face, a muted rim color, a thin top highlight, a small lower lip and a short exterior shadow. It declares no component dimensions, positioning, overflow, opacity, transforms, pointer behavior or transitions.

Use `cove-surface cove-surface--compact` on HUDs and small location surfaces. It removes the motif and uses slightly shallower relief. Use `cove-surface cove-surface--arrival` on the completion surface. It changes only the upper highlight to a restrained warm accent. Variants may be combined if a compact arrival surface is needed; no extra asset family is implied.

The SVG contains three paths with a single 5.5%-opacity muted-teal stroke (`#648e86`). It contains no fonts, text, filters, gradients, scripts, raster images or external references. It is anchored at the lower right at its intrinsic CSS size; it does not stretch across the dialog or carry gameplay meaning. CSS owns the actual outer shape. Missing the SVG leaves the complete opaque gradient and fallback color intact.

## Material tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `--cove-surface-top` | `#2b5356` | Modest upper wash |
| `--cove-surface-face` | `#1b434b` | Main reading surface and fallback |
| `--cove-surface-bottom` | `#123741` | Quiet lower face |
| `--cove-surface-rim` | `#9eb5a5` | Desaturated sage border color |
| `--cove-surface-edge` | `#0b2d36` | Small lower painted edge |
| `--cove-surface-highlight` | ivory at 18% | Restrained upper catchlight |
| Arrival highlight | warm ivory at 38% | Warm top edge only |

Retain the existing shared ivory, secondary, warning, foam and warm control tokens. This material does not redefine button colors or put amber around every frame. Home, confirmation/progression and current selection keep their established hierarchy.

## Integration caveats

1. **Resolve CSS ownership deliberately.** Existing `.cove-kit .cove-panel` and `#app .cove-panel` selectors have greater specificity than the supplied base class. A later import alone will not override them. Integrate the material declarations into the canonical panel rule, or use an explicit shared selector with appropriate specificity. Avoid `!important` and scattered per-dialog overrides.
2. **Preserve the border box.** `border-color` changes the existing border only. Do not add a thicker border, larger padding or extra wrapper to obtain the specimen appearance. Border width/radius remain application-owned.
3. **Preserve focus.** Do not let a material `box-shadow` override the established focus outline/keyline on interactive panel-like controls such as the forecast button. Put the material layer before existing state/focus rules, and verify actual focused controls. The candidate does not declare an outline.
4. **Keep existing warning semantics.** If a warning state currently overrides `background`, resolve that state in the same shared material source. Preserve explicit warning text, symbol and edge; do not silently lose warning styling through the cascade.
5. **Keep URLs resolvable.** CSS references its sibling SVG. Preserve that relationship or let the bundler rewrite the asset URL when moving these sources into the chosen canonical directory. Do not copy the same vector paths into a second maintained file.
6. **Do not apply to every button.** The material is for reading panels and their compact variants. Existing raised round/capsule controls keep their accepted surfaces.
7. **Fix layout independently.** This material does not repair clipped passenger text or horizontal overflow. Do not use global clipping or hidden scrollbars to conceal content that still fails to fit.
8. **Decorative background only.** No added DOM node, accessible name, pointer target or frame-loop update is needed. Essential content remains live DOM text and native controls.

## Preliminary readability bounds

Against the opaque gradient endpoints alone, the weakest calculated pairs are ivory `#fff3d9` at **7.71:1**, secondary `#d6e5d8` at **6.49:1**, and warning `#f2b7a0` at **4.87:1**. A conservative bound that composites one full 5.5%-opacity motif stroke over the lightest endpoint gives warning text **4.64:1**; the normally lower-corner placement is not relied on to meet this bound. These are candidate calculations, not integrated contrast certification. Verify the final rendered composite, including the motif, selected controls, warning state and focus outline. Never make the whole surface translucent to soften it.

## Inventory and gallery

Update existing `ui.component.panel`, `ui.surfaces`, `ui.dialogs` and `material.cove-ui-tokens` ownership/evidence records as appropriate. The motif is a source of the shared panel family unless later independent reuse justifies its own stable family. Do not add one material record per dialog.

Show ordinary, compact and arrival variants in the existing development gallery using their actual shared source, plus focused forecast, a long warning and narrow passenger selection. The material specimen is design evidence; actual game captures establish integration and layout.

## Acceptance

- Compact opaque faces remove recognizable background ghosts while leaving the scene visible around panels.
- Lower-corner decoration stays subtle beneath long copy and does not resemble selectable routes or a new objective marker.
- Main text and action labels remain at their accepted phone sizes; all names and capacity values fit.
- No panel grows, moves, changes a hit target or steals input solely for decoration.
- No new continuous animation, blur, texture generation, render pass or runtime dependency is introduced.
- Inspect actual phone portrait/landscape, short landscape, full warnings, focus, fullscreen promotion and arrival. Measure contrast on integrated surfaces.

**Provenance:** original SVG paths and CSS authored for this Last Ferry task from the established project palette and component direction. No third-party illustration, photograph, font or icon is included. Small source budget: one CSS file and one SVG motif; all normal variation is CSS.
