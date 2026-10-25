# Last Ferry — interface materials and icon style

This is the integrated interface contract derived from the supplied [`STYLE_GUIDE.md`](../cove-ui-package/STYLE_GUIDE.md). Existing cove art remains the reference. The original package specimen is design evidence, not a gameplay screenshot or a new level layout. Runtime use and verification are recorded in [`assets/catalog.json`](../assets/catalog.json); human acceptance of the new appearance remains pending the next playtest.

The shared implementation is [`src/ui/cove-ui.css`](../src/ui/cove-ui.css) and [`src/ui/cove-ui.ts`](../src/ui/cove-ui.ts). Editable icon paths remain only in `cove-ui-package/ui/icons/*.svg`; Vite imports the individual originals, excluding the supplied snapshot sprite. The development gallery reads the canonical catalog and these same helpers/components. No runtime asset manager, font loader or separate copy of SVG paths is introduced.

## Character

Make the controls feel like small useful objects from the harbor: painted surfaces, softened corners, a little thickness and warm light along an edge. The game world already supplies waves, reflections and movement. The controls should settle quietly around it.

Current source anchors are `src/scene/models.ts` (rounded ferry, cream wool, painted timber, stone) and `src/style.css` (deep teal, ivory, foam and amber). Keep large reading surfaces dark teal. Light seafoam and lantern colors belong on compact action faces and small identity details.

## Material tokens

| Token | Integrated value | Role |
| --- | --- | --- |
| `--cove-panel` | `#143d46` | Text-bearing dark surface |
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

The supplied token values are retained in `.cove-kit`, with `--panel: rgb(20 61 70 / 97%)`, quiet button upper face `#345f64`, lower face `#234e55`, disabled face `#345158` and disabled text `#d5e0d7`. Panel borders use warm-neutral `#b5bca1`; quiet control borders use `#a4b7a9`. These are CSS material choices, not sampled physical materials or a changed world palette.

The [actual composite check](../reviews/cove-ui-assets/contrast.json) covers 169 comparisons across nine runtime UI stages at 844×390 in Chromium/SwiftShader. It uses computed foreground/background colors with source-over ancestor compositing against local and darkest/brightest current WebGL samples, bounding the two-color gradients by their endpoints. The lowest sampled text/icon ratio is 6.279777:1, with no failed sampled comparisons. This excludes antialiased glyph fringes and decorative borders and is not full accessibility certification. Native screenshots and the [gameplay review](../reviews/cove-ui-assets/REVIEW.md) establish actual fit separately.

## Shape and relief

- Main actions: labeled capsules, 48px or more high on phones, 16px action text, 24px glyph. Narrow HUD Undo uses a 22px glyph above its label inside the stable control; it does not enlarge the short-landscape HUD to fit decoration.
- Familiar utilities: rounded 48px controls; constrained existing targets may remain 44px. A 24px visible icon is not a 24px hit target.
- Panels: 20px outer corner radius, with compact 14px HUD and 15px forecast variants; one restrained frame. Preserve current placement and scrolling behavior rather than applying specimen padding wholesale.
- Relief: about 2–3px lower lip, one thin top highlight and a short soft shadow. Press feedback changes the inner face/shadow, not the measured hit region or map anchor.
- Passenger choice: quiet inset surface; a checked shape, name and capacity usage carry selection. Avoid a bright outline around every line of explanation.
- Name plates: short, subtle dark backings. Do not turn island names back into large button-shaped signs.

## Hierarchy and transparency

Keep all ordinary water/animal inspection visible around compact controls. The top HUD should not become taller in order to add icons. Prefer one outer surface to multiple nested cards. A small transparent perimeter can soften a panel, while its text area remains approximately 94–98% opaque. Test the composite result over luminous water; do not make all content faint to achieve transparency.

Warm Harbor identity is a lighthouse plus “Home.” Warning identity is a warning shape plus its consequence. They may share a warm family but cannot be distinguished only by hue. The current amber selection language remains coherent with both.

## Icon drawing contract

The supplied original set uses 24×24 view boxes, 1.8px round-cap/round-join strokes, a consistent inset, and at most two related tones. Use `currentColor`; optional accent is `--cove-icon-accent`. They must remain understandable in one color. Author no icon text, remote resources, effects or fonts.

Board/Unload share a hull and reverse the arrow relative to the deck. The complete pictogram stays upright. Home is the lighthouse; Back to boat is a framed ferry. Sound Retry is a distinct state and keeps its short visible word. A general Home/menu icon must not replace the objective icon.

Inline the individual SVGs through the shared bundler helper. Standalone `<img>` does not inherit the button's current color. SVG children are decorative and nonfocusable; the native button owns the visible label, accessible name, hit target and event. `setControl()` retains the actual button and its intent/focus data while updating the glyph and label children. The supplied sprite remains a package snapshot, outside the runtime source of truth.

Dock transfer pictograms stay upright at either berth orientation; only the game geometry determines boarding. Harbor/Home uses the lighthouse identity, Bring home uses the unload-family action with warm emphasis, and Back to boat uses the framed ferry. Board, Let ashore, Bring home, Sail, Wait and confirmation retain visible wording. Playing/muted/requested sound states select their own icons; Retry retains a visible word, and explicit captured sound intent continues to own the click.

Passenger choices remain native buttons with `aria-pressed`, a square checked shape, passenger name and capacity use. Their style borrows the specimen's inset treatment without converting them to inputs or changing dialog Tab traversal. Map name and marker remain one semantic selection button. State shapes/text and free inspection are retained.

## States and movement

Every shared control needs normal, active/pressed, keyboard focus and disabled states; applicable controls also need selected, warning, pending/retry and current states. Use shape/text in addition to color. Disabled text remains readable even when no longer actionable. Keep important warnings explicit.

Use a brief 120ms non-focus shadow response. Focus is immediate and uses a 6px dark isolation keyline around its warm outline. Press feedback changes only the inner shadow; the measured target never translates or scales. No automatic bobbing, looping shine or new UI audio. Device Reduced Motion and the in-game Settings Reduced mode make decorative transitions immediate; the actual Settings check recorded 13 controls with `0s` transition duration. Existing audio, crossings and homecoming keep their accepted timing.

## Readability

Preserve Segoe UI/Arial/sans-serif body text and Georgia/serif titles for now. Essential phone controls retain approximately 16px labels. Check normal text at 4.5:1 and meaningful icon/state cues at 3:1 over their actual adjacent colors. Light action faces use dark ink. Focus uses amber with a dark keyline so it remains distinct on both kinds of face. Candidate color-pair calculations are only a preliminary check; actual integrated alpha, gradients, anti-aliasing and backgrounds need review.

## Extension rule

Choose an existing material and icon family before inventing another. Copy [`assets/ASSET_ENTRY.template.json`](../assets/ASSET_ENTRY.template.json), add a stable ID, editable source, semantics, states, provenance and evidence in the same change as a new asset. Keep instance placement in level data. The gallery renders actual shared sources so it cannot drift into a second implementation of the UI. Run `npm run check:assets`; each type's required details are listed in the catalog and in the supplied [`ASSET_INVENTORY.md`](../cove-ui-package/ASSET_INVENTORY.md). A procedural factory is an asset source, and a reference image remains reference-only. Retired entries retain their source revision and replacement IDs; integration does not imply human acceptance.

References: [text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [larger targets](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html).
