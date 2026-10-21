# Last Ferry — full-width cove and contextual controls

Continue on `m1-first-crossing` from the reviewed navigation pass, commit `95f4ca4b49c65e37414d02c6186774ebf275808c`, or preserve any newer user work on that branch. PR #1 stays draft; main stays unchanged. Follow the existing authorized Git workflow and repository instructions.

## Product decision

The navigation pass is accepted. Holding Pier is our introductory puzzle. Its challenge, authored values and solution should remain unchanged in this task.

Remove the permanent right sidebar. Give the cove the full play area, retain the successful named map controls, and move the sidebar's remaining functions into contextual buttons and compact dialogs. The player should spend most of a normal turn looking at the miniature cove.

Read the current source and review evidence before changing the UI. This is a complete interaction migration, including the functions that currently exist only in the sidebar. A hidden sidebar or a permanently open floating replacement does not satisfy the task.

## 1. Main play screen

- Use the full viewport width for the scene. Reframe the camera and reposition map labels for the available space. Keep the lighthouse, ferry, useful piers, passengers and passages legible at desktop and landscape-phone sizes. Keep labels off important scenery where possible; do not change authored world coordinates to solve UI layout.
- Retain named map controls and their meaningful current, available, too-shallow, nonadjacent and flood-warning states. A safe adjacent sailing action remains one activation and one committed action.
- Keep a separate, visible Inspect affordance for adjacent destinations so a player can inspect a safe route without sailing. It must work with touch and keyboard; hover alone is insufficient. Blocked destinations open a free explanation. Focus/hover/inspection must continue to highlight the actual passage.
- Show a compact objective and progress: “Bring all three passengers to Harbor” and Home 0/3, adapting to each cove's actual state.
- Keep the boat's load/required depth and the urgent deadline visible without opening a dialog. For example, “Depth 2 · 2/4 spaces” and “Rabbit Pier floods in 4 actions.” Derive this information from state and replace obsolete danger emphasis when the passengers are safe.
- Keep Undo and Wait directly accessible with clear labels. Wait must show its one-action cost and open its actual consequence before commitment. Put Restart, Sound, detailed help and cove selection in a small Menu dialog. The deadline/status control can open the tide and pier forecast.

## 2. Local passenger actions

Place the available passenger actions near the ferry/current pier. A compact bottom action strip is acceptable on short phone screens if it keeps the scene legible. Use concrete action labels such as “Let Moss ashore,” “Board Pip and Rue” and “Bring passengers home.”

Activating a passenger action opens one card containing selection, consequence and confirmation. Avoid a chain of separate action-picker and confirmation dialogs. If boarding and unloading are both available, expose both without recommending the puzzle solution.

Clicking the current pier or ferry should expose or focus its local actions without spending a turn or offering an invalid move. Remove stale instructions that tell the player to use the former side panel.

## 3. Contextual dialogs

Use one compact dialog at a time for passenger transfer, passage inspection, Wait, forecast, Menu or terminal feedback. Keep as much useful scene visible as the task permits. On phones, a bounded bottom sheet is acceptable. The normal play screen must not retain an empty panel-sized area.

The transfer dialog contains:

1. The selected action and passenger choices, including supported subsets.
2. Resulting boat load/depth and the relevant route or pier consequence.
3. The actual action/tide order where it matters.
4. A single clear confirmation and an accessible Cancel/close action.

Continue to derive all consequences from the actual selected preview. Selecting only one rabbit at the critical boundary must name the rabbit left to flood. Selecting both must explain that they board before the rise and are safe aboard. Do not hardcode copy to the successful solution.

Inspection and cancellation remain free. Use a brief “Inspection · no action spent” label once rather than repeating it throughout the card. An immediately losing sailing action must retain its explicit warning and confirmation. Ordinary safe sailing must not gain a mandatory dialog.

While a dialog is open, prevent background gameplay input and click-through. Supply dialog semantics, predictable initial focus, a usable Tab/Shift+Tab cycle, Escape/Cancel, and focus restoration to its trigger or a valid successor if that trigger disappeared after committing. Prevent double actions during transitions and repeated touch input. Essential consequences and the confirmation must remain fully visible at both 844 × 390 and 780 × 390. Preserve at least 14 px essential text and 44 px interactive targets.

Success and failure use compact result cards with clear recovery controls. Terminal Undo must continue to work and must not be blocked behind an inaccessible modal.

## 4. Scope and implementation

Preserve both coves, their current entry routes/selection, topology, passenger costs, capacity and draft bands, tide timing, reducer event order, preview semantics and complete Undo. Do not add a new cove, tune difficulty, introduce another mechanic, redesign the characters or change dependencies as part of this pass.

Replace the sidebar flow rather than leaving a second parallel UI path. Organize UI code as needed to keep state, presentation and dialog interaction coherent. Keep the deterministic simulation independent of layout and animation. Avoid speculative UI frameworks or infrastructure.

## 5. Acceptance and verification

The result should demonstrate the following through the real interface:

- The full-width initial cove shows the objective, depth/load, urgent deadline and named destinations. Local passenger actions are discoverable without opening a general menu.
- Safe map sailing still commits exactly once. Safe and blocked routes can be inspected for free with mouse, keyboard and emulated touch.
- Both coves can be completed. Holding Pier retains its nine-action rescue, meaningful losing alternatives and full Undo across unloading, tide rise and terminal state.
- Passenger subset changes update the real preview. Both the complete safe boarding message and complete one-rabbit loss message fit, together with confirmation, at the two phone sizes.
- Dialog opening, switching and cancellation do not change game state. Keyboard focus behaves correctly and background clicks/touches cannot commit actions through an open or closing dialog.
- Wait, forecast, rules, Restart, Sound and cove selection remain reachable. The current boat/pier interaction and any instructions match the new layout.

Run build/typecheck, the unit suite and browser checks relevant to this migration. Update affected tests to use the new actual controls and add focused coverage for modal focus and background-input behavior. Keep the existing state, consequence and clipping assertions meaningful; do not weaken them to accommodate the new structure. Stop once the relevant risks are covered.

Capture the actual game at 1440 × 900, 844 × 390 and 780 × 390: initial cove, route inspection, critical boarding, one-rabbit warning, after the tide rise and success. Inspect layout at native size. Retain a short uninterrupted recording locally if supported; no external hosting is required.

Update STATUS and the review report with source identity, actual commands/results, representative screenshots and any remaining issue. Use the existing authorized branch/PR handoff workflow. Keep PR #1 draft and main unchanged. Report the final commit and distinguish fresh evidence from any reused evidence. Finish this interface milestone before beginning the next cove.
