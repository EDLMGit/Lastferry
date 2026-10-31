# Compact dock controls

**Supporting contract for `DRIFTWOOD_YARD_01` / `NEXT_TASK_DRIFTWOOD_YARD.md`.** This is the first internal stage of the combined assignment: simplify dock controls, then implement Driftwood Yard and Nell. It is not a separately queued task.

## 1. The revised requirement

The user accepts direct transfers but finds the dock buttons too explanatory and large. This explicitly revises the previous task's requirement to show ordinary cost, predicted depth and tide prose inside those buttons. Preserve understandable decisions through the existing information surfaces while returning the dock controls to compact actions.

In the reviewed source, `renderDock()` appends `.dock-facts` and `.dock-consequence`; `transferFacts()` supplies the complete preview consequence. `src/campaign/home.css` gives those spans full-width rows. Remove that routine presentation rather than shortening each sentence or shrinking its font.

## 2. Routine actions: icon and short label only

Use the accepted icon and a short label:

| Context | Label |
| --- | --- |
| One waiting passenger | **Board Bram** / **Board Nell** |
| One passenger leaving at an ordinary landing | **Let Moss ashore** |
| Several passengers available to unload | **Let ashore** |
| One passenger delivered at Harbor | **Bring Nell home** |
| Several passengers available to deliver | **Bring home** |

Routine buttons contain **no cost badge, depth row, “Choose passengers” subtitle or consequence paragraph**. Do not replace the removed copy with a permanent footer, neighboring information card or repeated safety notice. A legal boarding that saves Bram before a tide rise is an ordinary action; “Bram is safe aboard” does not require an attention indicator.

Keep the established rounded cove treatment, readable full labels and visible focus. Use content-sized width and an effective touch target of at least **44px**, preferably **48px**. Reduce occupied space by removing content and unnecessary padding, not by making the controls difficult to tap. Allow a genuinely long name to wrap rather than truncate it. Feed the actual smaller dimensions into the existing near-ferry placement calculations; preserve safe-area bounds and avoid covering figures or map targets.

## 3. Information remains available when useful

The persistent boat HUD remains the source for current load and required depth. The common one-action cost remains explained in Help and confirmed by the transaction receipt. Existing tide/forecast controls explain ordinary rises.

Make predicted transfer depth and relevant route/landing consequences available through **optional, free current-place inspection**, reachable by touch and keyboard. Selecting the current ferry/place already provides that entry. Extend that surface concisely if necessary; do not make hover the only access or require a details tap before every direct action.

The compact multi-passenger chooser retains portraits, full names, capacities, selected-group depth and useful consequences, with one named commit. Selection remains free. Avoid repetitive safe-outcome sentences there as well.

Immediate loss still requires the existing pre-commit warning naming the affected passengers and location, with free Cancel. Preserve useful disclosure of a newly blocked loaded return in inspection/selection. Derive consequences structurally from the real preview; do not classify risk by parsing English copy or display a warning for every ordinary tide change.

## 4. Preserve interaction ownership

Keep direct transfers on the existing `execute()` / Session / actual-completion pipeline. Preserve one accepted transaction per intentional input, group action cost, transfer-before-tide ordering, audio timing, Undo and receipt cancellation.

Direct controls must not advertise a popup. Group or risky controls should truthfully expose their chooser/dialog behavior. Keep concise accessible names, appropriate optional descriptions and focus recovery when a completed action removes its button. No change to sailing, forecasts or puzzle rules is authorized by this styling stage.

## 5. Focused acceptance

Recreate the supplied Bellwater Bram state at native portrait and short landscape. Both controls should be visibly smaller, with only icon/label and no replacement prose panel. Check the actual scene for occlusion.

Exercise direct drop/reboard/delivery, group selection, the last-safe rabbit loss warning and free Cancel, Undo, keyboard focus and transaction feedback. Verify that current depth and optional predicted consequences remain discoverable before commitment. Carry the same compact treatment into Driftwood Yard. Retain inherited overlap and precise rapid-touch limitations unless corresponding evidence actually closes them.
