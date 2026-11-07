# Last Ferry — interface materials and icon style

Status: proposed interface family, ready for integration and real-game review. Existing cove art remains the reference. The specimen shows component treatment, not a gameplay screenshot or a new level layout.

## Character

Make the controls feel like small useful objects from the harbor: painted surfaces, softened corners, a little thickness and warm light along an edge. The game world already supplies waves, reflections and movement. The controls should settle quietly around it.

Current source anchors are `src/scene/models.ts` (rounded ferry, cream wool, painted timber, stone) and `src/style.css` (deep teal, ivory, foam and amber). Keep large reading surfaces dark teal. Light seafoam and lantern colors belong on compact action faces and small identity details.

## Material tokens

| Token | Candidate value | Role |
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

These are starting CSS values derived from the accepted scene/UI family, not sampled physical materials or a new world palette. Tune them in the actual game while retaining contrast and record the final tokens. A muted palette still needs a clear light/dark separation.

## Shape and relief

- Main actions: labeled capsules, 48px or more high on phones, 16px action text, 24px glyph. Give text sufficient horizontal room before increasing overall height.
- Familiar utilities: rounded 48px controls; constrained existing targets may remain 44px. A 24px visible icon is not a 24px hit target.
- Panels: approximately 18–22px outer corner radius, one restrained frame, 12–16px internal rhythm. Preserve current placement and scrolling behavior.
- Relief: about 2–3px lower lip, one thin top highlight and a short soft shadow. Press feedback changes the inner face/shadow, not the measured hit region or map anchor.
- Passenger choice: quiet inset surface; a checked shape, name and capacity usage carry selection. Avoid a bright outline around every line of explanation.
- Name plates: short, subtle dark backings. Do not turn island names back into large button-shaped signs.

## Hierarchy and transparency

Keep all ordinary water/animal inspection visible around compact controls. The top HUD should not become taller in order to add icons. Prefer one outer surface to multiple nested cards. A small transparent perimeter can soften a panel, while its text area remains approximately 94–98% opaque. Test the composite result over luminous water; do not make all content faint to achieve transparency.

Warm Harbor identity is a lighthouse plus “Home.” Warning identity is a warning shape plus its consequence. They may share a warm family but cannot be distinguished only by hue. The current amber selection language remains coherent with both.

## Icon drawing contract

The supplied original set uses 24×24 view boxes, 1.8px round-cap/round-join strokes, a consistent inset, and at most two related tones. Use `currentColor`; optional accent is `--cove-icon-accent`. They must remain understandable in one color. Author no icon text, remote resources, effects or fonts.

Board/Unload share a hull and reverse the arrow relative to the deck. The complete pictogram stays upright. Home is the lighthouse; Back to boat is a framed ferry. Sound Retry is a distinct state and keeps its short visible word. A general Home/menu icon must not replace the objective icon.

Inline the SVG or the sprite through the bundler. Standalone `<img>` does not inherit the button's current color. SVG children are decorative and nonfocusable; the native button owns the visible label, accessible name, hit target and event. Keep individual SVGs as the editable source and generate any runtime sprite/map from them.

## States and movement

Every shared control needs normal, active/pressed, keyboard focus and disabled states; applicable controls also need selected, warning, pending/retry and current states. Use shape/text in addition to color. Disabled text remains readable even when no longer actionable. Keep important warnings explicit.

Use at most a brief 100–140ms color/shadow response. No automatic bobbing, looping shine or new UI audio. Reduced Motion makes decorative transitions immediate. Existing audio, crossings and homecoming keep their accepted timing.

## Readability

Preserve Segoe UI/Arial/sans-serif body text and Georgia/serif titles for now. Essential phone controls retain approximately 16px labels. Check normal text at 4.5:1 and meaningful icon/state cues at 3:1 over their actual adjacent colors. Light action faces use dark ink. Focus uses amber with a dark keyline so it remains distinct on both kinds of face. Candidate color-pair calculations are only a preliminary check; actual integrated alpha, gradients, anti-aliasing and backgrounds need review.

## Extension rule

Choose an existing material and icon family before inventing another. Add a stable catalog ID, editable source, semantics, states, provenance and evidence in the same change as a new asset. Keep instance placement in level data. A gallery should render actual shared sources, so it cannot drift into a second implementation of the UI.

References: [text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [larger targets](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html).
