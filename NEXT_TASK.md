# Last Ferry — reveal location controls and give the cove more room

## Working agreement

Continue on `m1-first-crossing` from reviewed commit **dea5fdd1ed8b017d5112085d4964bab3122ea44f**, preserving any newer user work. Use Node 24. Read `AGENTS.md`, this task, relevant art/UI/environment notes, and `reviews/refinement/REVIEW.md`. Inspect the actual desktop and phone captures before changing presentation.

This is the authorized next milestone beyond the original M1 stopping point. Complete implementation and affected verification, commit normally, push the existing branch, and update draft PR #1. Keep `main` unchanged and the PR draft. Make routine decisions independently; the user remains the playtester.

The user likes the improvement and wants location options to appear after selection, clear selectable indicators, mostly transparent panels with attractive borders, and a better lighthouse light. The chosen direction is a more visible cove with compact location selectors and one contextual card. Give the lighthouse a convincing visible lantern, and use the space recovered from the interface to present the existing islands better.

## Preserve the accepted foundations

Keep all three coves, default Holding Pier, progression, rules/history, full Undo, authored depths, passenger identities, capacity/draft, action costs, tide/flood order and available/losing solutions. Keep island footprints, pier positions/elevations and route topology/control geometry. Preserve the rounded sailing courses, travel pace, ferry/passenger attachment, wake, current water and contact materials.

Keep the accepted base score and current accompaniment, including activation, mute, state derivation, terminal timing and lifecycle. Free selection, inspection and camera/layout work must not change the musical arrangement or simulation. This milestone does not add music, mechanics, levels, an engine or an asset pipeline.

The deliberate interaction change is that a location activation selects a place for inspection. Only an explicit action button commits a turn.

## 1. Replace persistent action tiles with selectable places

### Persistent map affordances

Keep every location discoverable through a compact name and a small clear marker. Names stay visible on touch screens. Show Harbor's Home identity, the actual current location, selection and blocked-route information with distinguishable symbols/borders; do not make color alone carry those differences.

Remove the persistent repeated `Sail to… / 1 action / Inspect` groups and the always-open current-pier transfer card. A small visible marker/name may have a larger transparent hit area. Retain at least the existing 44-pixel touch target dimension and readable phone text, avoiding overlapping hit areas. Position chips near their place with a short connector only when necessary; retire the large screen-edge rows and long leaders when compact placement makes them unnecessary.

Selection should visibly connect the marker, its place and its card. Use a restrained selected border/halo at the dock or waypoint and a modest emphasis of the selected place. Hover or keyboard focus can preview emphasis, but must not open a card or spend an action. Preserve the underlying route network and useful availability cues.

### One explicit interaction contract

| Player input | Result |
| --- | --- |
| Select a location's name/marker, its island, pier or mapped landmark | Open that location's card for free |
| Select the ferry | Open the card for its current location |
| Select another place | Replace the single open card |
| Select the already selected place again | Keep its card open; never sail or unexpectedly toggle it away |
| Select empty water, use Close, or press Escape when no modal is open | Close the card and clear selection |
| Choose **Sail · 1 action** for a legal safe adjacent move | Commit exactly one move through the existing execution path |
| Choose a move that produces a loss | Present the existing explicit consequence/confirmation dialog before commitment |
| Select a shallow or nonadjacent destination | Show its facts and the travel limitation for free |
| Choose Board / Let ashore / Bring home at the current pier | Open the existing passenger-subset preview and use its existing Confirm action |

Make the selected card itself the normal inspection surface. A safe move should require selection followed by Sail, without another generic confirmation dialog. Keep the existing confirmation for a losing consequence and the detailed passenger preview where the chosen subset matters. No double-click shortcut or automatic multi-hop travel.

### Card contents

For an adjacent destination, show the name, a concise actual channel-depth versus boat-depth comparison, cost, relevant tide/flood consequence, and Sail. A clearly explained unavailable Sail state is appropriate for a shallow passage. A legal but losing move must clearly expose the consequence rather than looking like an ordinary safe action.

For the current location, show waiting/aboard facts and the available passenger actions. Harbor uses the existing Bring home language. A flooded current pier must still explain that the ferry can leave, without offering invalid transfers. A buoy does not need an empty passenger form.

For a nonadjacent location, show its identity, waiting passengers and relevant safety information, plus “No direct passage from [current place].” It remains inspectable. Selecting it must not draw a fictional direct route or invoke a path finder.

Keep the global objective, load/depth, turn/tide, Undo, Wait, Menu, Sound and the important flood status available. Avoid replacing urgent information with a generic selection hint. If first-use guidance is needed, use one brief instruction within existing UI: “Select a place to see its options.”

## 2. Make the card feel light while remaining readable

Use a translucent deep blue-green surface, warm pale text, a definite fine outer edge, a quiet inner highlight and a restrained shadow. Let the moving water remain perceptible through the background. Give the selected-location border a clear visual relation to the card. Keep decoration compatible with the small coastal world.

Apply alpha to background layers, not the entire component. Text, icons and focus indicators stay opaque. Allow stronger localized tint behind dense text or buttons when bright sand or reflected light reduces contrast. Judge the result at native 780×390 and 844×390, including bright water behind the card. Thin decorative outlines alone are insufficient as the only indication of a control or focus state.

Use ordinary semantic buttons and a labeled nonmodal region. Reflect expanded state and its controlled region where appropriate; do not assign an ARIA menu role just because this is colloquially an options menu. Keep natural Tab/Shift+Tab, Enter/Space, Escape and focus recovery. Selection should be equally usable through its DOM button and the scene.

On keyboard activation, focus a stable card heading or equivalent non-committing target, with actions next in the Tab sequence. A held/repeated Enter must not land on a newly created Sail button and spend a turn. Hover/focus emphasis must not overwrite persistent selection when the pointer leaves.

Place the card in nearby open water, avoiding the selected island's defining feature, relevant passengers, the full loaded ferry, HUD, flood status and other selectors. Reuse the existing post-clamp overlap checks and extend the protected bounds. Keep the card away from the point that opened it, especially its Sail control, so repeated tapping cannot hit a newly appeared action underneath the finger.

If an anchored position does not fit on a narrow screen, use one compact edge placement with a short connector to the selected place. Fit the screen without relying on a full-height sidebar or a sheet covering most of the cove. The existing detailed modal dialogs may retain their stronger readable backing. A wholesale HUD/dialog reskin is outside this task.

Avoid full-screen blur and costly backdrop filters. A good translucent fill, boundary and placement should carry the design without them. Use restrained fades; reduced motion gets immediate or simple opacity changes.

## 3. Implement selection as presentation state

### Source changes that must be deliberate

`src/main.ts` currently routes `bindTarget()` and `world.onSelect` to `activateMove()`, which commits valid safe moves immediately. Both entry points must become selection-only. `localContext()` currently focuses a card that is always rendered; it must instead select the current place and reveal its card.

The existing `selected: Action | null` belongs to modal action previews. Introduce a separate nullable location-selection identity. Keep committed boat location, selected location, hover/focus emphasis and modal action distinct. Derive card contents from current committed state and the existing preview/rule helpers; do not create a second set of gameplay calculations.

`World.indicate()` currently retains a selected destination only when `edgeTo()` succeeds. Separate selected-place emphasis from direct-route emphasis. Current and remote places can be selected even when no direct edge exists. Only an actual adjacent edge may receive the corresponding passage highlight.

The canvas currently picks the ferry/current pier, then a 32-pixel area around navigation nodes. It does not select most visible island surfaces. Add bounded scene picking with explicit authored `pier.islandId` / `pier.nodeId` mappings. Include noncurrent piers and their associated landmarks; retain sea-node/buoy picking. Exclude decorative water, glows, shadows and unrelated background surfaces. Handle any noninteractive scenery explicitly instead of assigning it an arbitrary nearest destination.

Use a small mapped set of pickable meshes/groups or equivalent precise projected bounds. Avoid scanning the entire decorative scene every animation frame. DOM and canvas events must resolve to one selection; they must not both process a single gesture.

### Selection lifecycle

- **Initial load / Restart:** no selected location, compact selectors visible.
- **Select / switch:** one card opens or updates, with no simulation or music-state change.
- **Open a passenger, loss, Wait or other modal:** retain selection but keep the underlying card and scene unavailable to that modal's input.
- **Cancel modal:** retain any location selection and restore focus to the actual trigger: the relevant card control for a location action, or Wait/Menu/Forecast for a global dialog. If that trigger no longer exists, use the selected card's stable heading or location selector, then an appropriate global fallback. Do not invent a selection when a global modal was opened from the clean overview.
- **Commit:** hide or disable contextual actions during the transition. Do not queue another selection or move. Keep Sound accessible as currently accepted.
- **Move completes:** retain the chosen destination as selection; its card now presents current-location actions, making boarding available without another discovery step.
- **Transfer / Wait completes:** retain any valid selection and recompute all facts from the resulting state.
- **Undo:** clear selection and stale preview state, restore the complete game, and recover focus to Undo or an appropriate current-location fallback. Selection itself need not become part of the game history.
- **Terminal state:** the existing ending dialog takes precedence; suppress the location card.
- **Escape:** close an active modal first. A separate later Escape can close the location card. One key event must not close both layers or activate anything underneath.

### Input safety

Preserve the current one-action protection and modal safeguards. The handoff records an earlier repeat-Cancel failure without an event interval; the final instrumented pair passed at 112.2 ms within the existing 180 ms fence. That does not justify relying on a timer alone for the new layout.

Consume the gesture that opens or dismisses a card/dialog, prevent click-through to newly exposed controls, and avoid placing a new commit button under the activating pointer. Repeated selection should remain selection. Repeated Sail/Confirm must commit at most once. Preserve coordinate transforms after changing the canvas bounds.

Revisit the existing `.inspect-route` special case in the closing fence when removing those controls. Do not simply enlarge delays or weaken state/focus assertions. Update help text and accessible names so they describe “select, then choose an action” consistently. Stabilize selector/card IDs and focus restoration across rerenders.

## 4. Let the islands occupy useful screen space

The phone canvas currently reserves 62 pixels above and 70 below, and `World.resize()` fits scene bounds plus generous boxes around each navigation node into the remaining height. Removing cards alone will not enlarge the islands.

Once the compact controls are in place, rework one stable camera fit and its UI safe areas. A canvas extending behind the interface can reclaim water/background space, but landmarks and useful play areas must remain visible outside opaque controls. Adjust scene-fit margins against actual projected bounds and routes rather than retaining all old card allowances.

Preserve the whole cove overview: every useful node, route, departure/arrival berth, full lighthouse/bell, waiting passenger group and loaded ferry must remain visible. Account for all tide levels and the full path envelope, not just the initial ferry position. Validate both selected and unselected layouts. Do not crop route endpoints to make a screenshot look larger.

Keep the camera stable through selection, hover, sailing and tide changes. Resize/orientation can recompute framing; ordinary selection must not trigger zoom, panning or a jump. Preserve the current orthographic character and scene proportions. Do not move islands or routes, inflate geometry into passages, or add manual camera controls.

Give Holding's **Stone island** a restrained rocky character through the existing island-style system. Its layout currently assigns the same garden treatment to all three islands. Use the existing rocky vocabulary to reduce repeated paired shrubs/crates/path decoration while keeping the stone pier, elevation and footprint. Harbor keeps its sheltered garden; Rabbit Pier keeps its cottage identity. Preserve Bellwater's already distinct bell and reed islands, including the low island's exposed simplicity.

Inspect the result after the UI and framing changes. This should be a small existing-asset substitution with a clear compositional purpose, not a new prop collection or terrain rebuild.

## 5. Make the lighthouse read as an illuminated lantern

### Observed issue and hypothesis

In the ordinary and success captures, the lighthouse reads primarily as a red roof and cream tower. The lantern is a pale horizontal band; its water reflection can be more apparent than the source.

The model uses an opaque cylinder for the lens. The glow sprite is centered at the lamp anchor inside it and uses normal depth testing. Its brightest center may therefore be hidden by the lens or roof. This is a source-based hypothesis to inspect in the actual render, not a confirmed isolated rendering defect.

### Chosen treatment

- Make the visible lantern itself a compact luminous focal point: a pale warm core, a warmer amber surrounding surface, and slightly darker supporting structure. Preserve some tonal detail so it reads as a lantern rather than an overexposed white block.
- Check the glow's depth and placement against the actual camera. Fix an occluded center through deliberate geometry/material/placement choices. Do not globally disable depth testing and allow light to paint through the opaque roof or tower.
- Add restrained warm spill to the immediate gallery rim/underside and a small upper-tower area. Tune the existing light and intended material receivers. A small scoped material treatment is acceptable; avoid shared-material changes that warm unrelated buildings.
- Keep the nearby water reflection connected to the same explicit anchor and subordinate to the now-visible source. Preserve the accepted water shader and reflection extent unless a local adjustment is required for coherence.

Judge the source at native phone size in an ordinary, unselected, muted still. Selection highlights must not be required to see that Harbor is lit. Slightly adjusting the lantern opening or roof overhang is acceptable if necessary, while keeping the lighthouse's recognizable silhouette and scene fit.

Preserve the permanent Home marker, baseline/resting/arrival states, visible-unloading timing, exactly-once celebration, cancellation/recovery settling and Undo/Restart behavior. Reduced motion keeps the steady light readable. Add no rotating beam, large pulsing aura, global bloom or new shadow-casting light.

## 6. Verify the new interaction and visual result

Run the normal build/typecheck and relevant unit checks. Update shared browser interaction helpers from direct destination activation to explicit selection followed by Sail. Keep outcome, preview, visibility, subset, deadline and Undo assertions intact; the required input sequence has changed, not the puzzle.

Exercise the real UI for complete rescues in all three coves, plus the affected keyboard/touch and modal scenarios. Required changed risks:

1. Marker, island, noncurrent pier, landmark and ferry selection each open the correct card for free. Selection/switch/close/hover/Inspect do not change turn, tide, passengers, boat, history, outcome or desired musical arrangement.
2. Current, adjacent-safe, adjacent-shallow, nonadjacent and losing-after-move locations present the correct facts and distinct states. Only real direct routes highlight.
3. A safe Sail commits once. Losing actions retain explicit confirmation. Passenger subsets, temporary holding, depth comparisons, both rises and complete Undo remain correct.
4. Reselecting, rapid taps, held/repeated Enter, Close/Escape, modal cancellation and a later intentional new selection behave coherently. Record genuine event intervals for timing-sensitive checks. No input falls through into a new action.
5. Transit hides/disables contextual actions, releases normally, and exposes the arrived-at pier's options. Undo/Restart, terminal Undo/redelivery, visibility recovery and reduced motion leave no stale card or emphasis.
6. At 1440×900, 844×390 and 780×390, selectors and controls remain usable, text/edges readable, the selected card avoids important scene objects, and the full cove/path envelope stays framed. Preserve natural keyboard and emulated-touch coverage; label physical-device limitations honestly.
7. The lantern is visibly lit before selection, strengthens once at visible delivery, and restores correctly after Undo and recovery. Verify the visible source and local spill, not just diagnostic intensity values.

Keep a compact matching evidence set: baseline and final ordinary views, selected safe/blocked/remote/current cases, a passenger subset preview, both phone widths with the card open and closed, and Harbor ordinary/delivery/Undo. Record one uninterrupted original-speed sequence showing island selection, a free inspection, explicit Sail, boarding, tide Undo and delivery. Inspect selected images at native size and the actual motion where tools permit.

The current Holding idle p95 was worse in both software comparisons. Keep lighthouse work local, avoid expensive panel blur and extra scene passes, and measure the final presentation under matched conditions. Record the actual canvas resolution as well as viewport/DPR: extending the canvas can increase rendered pixels. Distinguish this intentional coverage change from shader/light costs. A matched-canvas diagnostic comparison is useful only if needed to investigate a regression.

Do not change audio to address a renderer result; idle audio was uncreated in the prior samples. Report mixed/noisy results honestly. Preserve original failures and distinct source identities. Stop optional testing when the changed risks and required core flows are covered.

## Handoff

Update `STATUS.md`, relevant UI/art/environment notes and Help. Put the implementation report, selected captures and exact source/verification records in a new directory such as `reviews/selection/`. Keep raw recordings ignored/local when upload is unavailable. Do not relabel old browser/audio checks as newly executed.

Complete the established normal commit/push and draft PR #1 update. Return final SHA, remote equality, main/draft status, change summary, fresh/reused/corrected results, representative images and media locations. No merge or ready-for-review change.

The intended result is a cove the player can look at comfortably: named places invite selection, one light card appears where useful, actions remain deliberate, the islands have room and distinct character, and Harbor's lantern visibly welcomes the ferry home.

## Implementation references

- [W3C APG: disclosure controls](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) for expanded-state semantics and keyboard activation.
- [W3C APG: disclosure navigation example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) explains why an everyday options surface does not automatically need the specialized ARIA menu role. Adapt semantic principles to the game's explicit selection lifecycle; do not copy example behavior blindly.
- [W3C: non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) for meaningful control boundaries, selected states and focus visibility over changing backgrounds.

The existing Three.js renderer, semantic DOM controls and `placeLocalCard()` helper are sufficient foundations. Installing another UI framework or graphics tool is unnecessary for this milestone.
