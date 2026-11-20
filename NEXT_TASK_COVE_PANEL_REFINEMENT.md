# Next task — Cove panel material and readable passenger previews

## Current task and outcome

This is the current task. Read `AGENTS.md`, `docs/PROJECT_STATE.md`, this file and the accompanying `cove-panel-package/` before editing. The older `FIRST_TASK.md` describes the original milestone; it does not replace this scoped follow-up.

The user likes the new buttons and the overall game. Their latest screenshot exposes clipped passenger choices and a horizontal scrollbar in the final Harbor preview. They also want the menu background to feel like a properly authored cove asset, with the same care as the buttons.

Complete one focused pass, in two internal stages: first correct the passenger preview, then integrate the shared painted panel material. Continue through both stages without an intermediate approval request. The result must run in the actual game, not only in the gallery.

**Success:** every passenger's name and full space cost are legible; preview text clearly describes a future action; menu surfaces have quiet painted depth; phone controls remain near the selected action and stable while choosing subsets.

## Exact starting state

- Repository: `https://github.com/EDLMGit/Lastferry`
- Branch: `m1-first-crossing`; PR #1 stays **draft**; leave `main` unchanged.
- Reviewed source: `a4325353cf11cd4edba8d5384b58fe138e4772e3`.
- Previous accepted/published game: `8052cfcd67f2e56cf3258243618c4ce125d51c4b`.
- Last confirmed private publication: **Sites version 10**, hosting source `f9ada70cbd093bf52c105f2287558381b3b7c83c`.
- Stable phone URL: `https://last-ferry-playtest.abumech.chatgpt.site`.

The cove-interface SHA above is not deployed. Do not reset, discard newer work or overwrite the canonical catalog with an older seed. Inspect the current branch and adapt to any intervening changes while preserving their intent.

ChatGPT freshly verified the exact a432535 production build/TypeScript, 202 unit tests, 71-family catalog, all three production asset identities, 193 packaged source entries, 58 media entries and 52 protected sources. These are code/source checks, not new Android or browser approval. See `cove-panel-package/REVIEW_A432535.md`.

## 1. Correct the reported preview

### Reproduce the actual missing state

Reach Harbor through the real Holding Pier interface with Pip, Rue and Moss aboard. Open **Bring home** and stop before confirming. Compare the three selected passenger choices at the existing phone sizes and an ordinary approximately 400px-wide dialog. The uploaded image is a crop, 426×405; that is not evidence of the browser viewport.

The current source combines:

- An equal-width, nonwrapping flex row in `src/style.css`, `.passenger-options`.
- A fixed 22px check, a 7px gap and padding in `src/ui/cove-ui.css`.
- Inline name/capacity markup in `src/main.ts`, `renderDialog()`.
- A nonwrapping capacity span and a dialog body that can scroll on both axes.

The existing recorded mixed-subset screen has two rabbits. The capture helper opens the final three-passenger Harbor preview and immediately confirms it. Control rectangles being in the viewport does not prove that their text fits.

### Readable choice layout

Retain native buttons, IDs, `aria-pressed`, selected shape and keyboard behavior. Separate the passenger name from capacity deliberately. Recommended compact tile: **check + name on the first line, full capacity on the second line across the tile's usable width**. Alternatively use a clean equivalent that actually fits; do not merely stack text inside the same cramped check-plus-copy flex row.

Use content-aware columns: three only when all three full labels fit, two or one where necessary. A grid with a sensible minimum tile width is a useful starting point. Do not choose columns only from the screen orientation: the measured panel width is what matters. The supplied preview demonstrates the intended hierarchy, not a new gameplay layout engine.

Requirements:

- Entire name and `1 space` / `2 spaces` remain visible. No clipped or ellipsized decision information.
- Preserve about 16px essential text and at least 48px primary touch targets. Do not solve this by shrinking typography or removing capacity information.
- No horizontal scrolling in the dialog, body or passenger group. Correct intrinsic sizing and wrapping first; `overflow-x: hidden` alone is not a fix.
- Vertical scrolling is allowed when the phone height requires it. Make the full warning and consequences reachable, with Close and Confirm available. A scroll affordance must not masquerade as an action.
- Give flex/grid children `min-width: 0` or equivalent only where needed. Check the title, named choices, counts, full warnings and focus outlines, not just outer rectangles.
- Preserve DOM reading/Tab order. Do not visually reorder passengers for a prettier grid.
- Empty, partial and full selections keep the action rules and disabled state intact.

### Stable sheet and nearby action

The fixed transfer sheet height in `positionDialog()` currently prevents the footer from moving as selection text changes. Preserve that useful behavior. Do not remove the reserved height merely to eliminate the screenshot's blank area. Make good use of it with readable choices and a coherent material.

Within one open subset interaction, changing selections must not move the confirmation target to another side, change the camera or make the dialog jump. Rotation/viewport changes may recompute placement using the existing safe-viewport logic. Keep the recent portrait keyboard focus-recovery fix.

Do not enlarge the ordinary HUD, shrink the ferry, recenter every modal, or redesign panning to accommodate the new material. Existing card/dock overlap remains separately documented; do not let this pass introduce a new unreachable action.

### Make preview time explicit

`src/ui/presentation.ts` currently says `Everyone is safely home at Harbor.` for a **proposed** winning state. In a confirmation preview use future/conditional wording, such as `Everyone will be safely home at Harbor.` The committed victory can keep present-tense language.

Qualify the projected load/tide line consistently, for example `After this action: Boat 0/4 spaces · tide 2.` Keep current/projected tide changes unambiguous. The real HUD and committed state must not update until Confirm.

Opening, toggling or cancelling the final delivery preview must leave committed passengers, turn, tide and history untouched, and must not start victory music ducking, a lighthouse sweep, animal celebration or arrival camera. Verify that boundary without changing accepted timings or adding a new state machine.

## 2. Give panel backgrounds an authored material

### Art decision

Treat **the menu/card background** as the asset in this task. The accepted world, water, islands and lighting stay the visual context. The user praised the buttons; retain their palette, relief and original icon family.

Use the supplied original editable material in `cove-panel-package/material/` as the starting source:

- `cove-panel-material.css`: quiet opaque blue-green face, softened upper wash, sage edge and dark lower lip.
- `shoreline-corner.svg`: sparse low-contrast coastal curves for the lower corner.
- `MATERIAL_SPEC.md`: roles, variants, constraints and integration notes.

These are candidate asset sources. The visual board/HTML are design specimens, not actual game evidence. Integrate, inspect and adjust the candidate if real-game contrast or fit requires it; record the final choice.

### Palette and hierarchy

| Role | Starting value |
| --- | --- |
| Upper face | `#2b5356` |
| Main reading face | `#1b434b` |
| Lower face | `#123741` |
| Desaturated sage rim | `#9eb5a5` |
| Lower edge | `#0b2d36` |
| Main / secondary text | Existing `#fff3d9` / `#d6e5d8` |
| Action / warm action | Existing seafoam / lantern button tokens |
| Warning | Existing `#f2b7a0` |

The large reading face is opaque: recognizable animals, map labels and underlying buttons must not show through it. The world stays visible around the compact panel. Use shadow/edge treatment to soften its boundary instead of lowering the opacity of the whole component.

The material should feel softly painted and shallowly raised. Keep the center quiet. Any shoreline motif stays sparse, low contrast and toward a corner. The motif must remain harmless if long text reaches that region. Keep a solid fallback when the SVG is missing.

Use the same family for local options, action previews, forecast, Menu, Settings and completion. Compact HUD/name contexts can use a quieter variant without the motif; preserve their dimensions. Arrival may have a restrained warm upper edge. Amber should still identify Home, meaningful actions/selection and progression; avoid a bright gold frame around everything.

No big animal/lighthouse watermark, literal plank/rope frame, full-screen illustration, texture grain, backdrop blur, animated shimmer, particles, new shader, remote asset, font or UI sound. Do not bake text, buttons or rounded panel dimensions into an image.

### Integration ownership

Use one editable runtime source for each material/decoration. Either integrate the supplied material into the shared existing CSS or import the candidate CSS from a deliberate source path; avoid competing copies and selector patches scattered through `src/style.css` and `src/ui/cove-ui.css`.

The candidate class is layout-neutral. The actual dialog/component continues to own width, padding, placement, radius and scrolling. Do not paste specimen dimensions into the game. Ensure shared `#app .cove-panel` specificity, native dialog styles and compact variants resolve deliberately.

Background layers must not create focus targets, capture pointer input, alter z-order or change the native fullscreen dialog promotion. Keep controls and the same open dialog node intact. Test glyph and label clicks after markup changes.

The existing contrast checker assumed simpler surfaces. Inspect and update its method if gradients/motifs change that assumption. Check the lightest actual text-bearing combinations, warning text, focus and selected cues; do not count an unparsed background as a pass. Aim for at least 4.5:1 normal text and 3:1 meaningful icons/state indicators. This is focused evidence, not a claim of full accessibility conformance.

## 3. Extend the existing inventory correctly

`assets/catalog.json` remains canonical. `cove-panel-package/asset-updates.json` maps the intended updates; it is not a replacement catalog or runtime data file.

Reuse these stable families:

- `ui.component.panel`: authored background material, source SVG/CSS, regular/compact/arrival variants and actual consumers.
- `material.cove-ui-tokens`: exact final palette, opaque backing and material ownership.
- `ui.component.passenger-choice`: responsive two-line information hierarchy and state behavior.
- `ui.surfaces` and `ui.dialogs`: actual shared surfaces, preview copy, placement, scroll and fullscreen contracts.

The corner SVG can be a source of the existing panel family. Do not create a separate family for each menu or color variant. Add a family only if there is a genuinely independent reuse/ownership need, and satisfy the actual validator. Preserve existing provenance and retired entries.

Update the developer gallery from the same runtime material. Include ordinary panel, compact panel, arrival, long warning, selected/unselected passenger tiles, keyboard focus, and a constrained-width three-passenger example. The gallery should expose the text-fit case that the last pass missed. Do not embed the gallery/catalog into ordinary gameplay.

Update `docs/UI_STYLE_GUIDE.md`, `docs/ASSET_LEDGER.md`, `STATUS.md` and `docs/PROJECT_STATE.md`. Record that the user likes the button direction but has requested correction/refinement of the panel; do not blanket-approve every UI family. Integration, independent code verification and human visual acceptance stay separate.

## 4. Focused verification and evidence

### Fresh code gates

Use Node 24. Run production build/TypeScript, existing units, and `npm run check:assets`. Add or adapt only meaningful tests for the actual changes: future-tense preview semantics, committed-state preservation, passenger text fit and nested overflow. Avoid snapshot tests that merely repeat token values or tests asserting a specific decorative path.

### Browser checks that close this gap

1. **Three aboard at Harbor, before Confirm:** reach the state through actual UI; capture at 844×390, 780×320, 390×844 and 360×740, plus a desktop dialog. Inspect full names/costs, title, future consequence, projected load, Close and Confirm.
2. **Actual nested fit:** check `#preview`, dialog content and passenger group for horizontal overflow. Check per-line text `Range.getClientRects()` against each choice's content bounds, allowing legitimate wrapping; a union rectangle or the button's own bounds is insufficient. Do not waive a failure because a scrollbar is hidden. A bounded longer-label/text-size stress case may live in the gallery; do not rename real passengers or levels.
3. **Subset safety and stability:** exercise one, two, three and zero selected passengers, a partial delivery and the existing losing subset. Show full warning by normal scrolling if needed. Verify committed state/history unchanged until Confirm, footer target stability and keyboard focus after toggles/cancel.
4. **Complete actual rescue:** confirm final delivery, observe the accepted arrival, Undo it, then redeliver. Include a tide Undo in the rescue. Keep an uninterrupted short capture; silent video is fine if labeled. New acoustic approval is outside this surface pass.
5. **Phone orientation and input:** natural Tab/Shift+Tab/Enter/Space/Escape, nested icon/label activation, short-landscape scrolling, portrait focus recovery, rotation with a selected subset and same-edge nearby placement. Verify no map tap-through while interacting with the material/panel.
6. **Retained lifecycle:** focused cold-touch audio intent check and an actual supported fullscreen entry/exit with the dialog/subset open, retaining selection/focus/scroll. Do not claim a mocked fullscreen event is physical Android proof. No need to rerun every historical audio test when those sources are unchanged.

Use the actual common system-font fallback available on the runner. For Android, a physical-device check remains a user playtest unless you really perform one. At 320 CSS px or increased text size, content may stack and scroll vertically, but names/costs cannot disappear.

### Visual comparison

Before/after must use the exact same three-passenger pre-confirmation state and viewport, not a two-passenger screen against victory. Also inspect one long warning, Menu/Settings and the compact ordinary game view. Confirm no faint world silhouettes under text, no increased HUD height, no smaller ferry and no new obscured dock action due to decoration.

Inspect native-size phone images. Keep a source-tied screenshot manifest with measured panel/body/choice widths and scroll dimensions for the reported state. If reuse of unaffected results is justified, say exactly what is reused. Retain real failures and distinguish them from corrected reruns.

### Existing limits

The prior constrained card/dock overlap, delivered-heading observation and ≤180ms rapid-touch condition remain open unless separately resolved with appropriate evidence. Do not erase or relabel them because new surface checks pass. This task does not require speculative infrastructure or a full historical browser suite.

## 5. Finish and hand off

Write `reviews/cove-panel-refinement/REVIEW.md` with the reproduced defect, root cause, final material decision, updated asset IDs, exact commands/results, actual comparison images and remaining limits. Include source/build identity so ChatGPT can review the committed result.

Commit and push the completed work to `m1-first-crossing`. Update PR #1 while keeping it draft. Verify remote/local SHA equality and report the working-tree state. Leave `main` unchanged; never force-push.

**Do not deploy this pass yet.** Return the final SHA and review for ChatGPT's next review and publication to the same private phone Site. Keep the live version field at the last confirmed publication until deployment is actually confirmed.

## Technical references

- [CSS white-space behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/white-space)
- [W3C reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [W3C non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
