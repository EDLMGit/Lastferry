# COVE_READABILITY_01 · Help a new captain read the water

A first-time player liked the game and felt lost. Address that feedback before cove twelve. Use the Far Shore handoff `7edba1519e9d856f3dc029bb0d500b4480985149` as the reviewed runtime and incorporate current guidance on `m1-first-crossing`.

**The first ten seconds.** At Take the helm in Holding Pier, a newcomer should be able to tell who needs a ride, where home is, and which landing will flood next. Keep the lighthouse destination and rescue progress easy to recover when a landmark is offscreen. Essentials should be visible with default settings, including Tips Off.

**Two readings the player can connect to the map.**

- **Water and ferry.** Today “2/4 · Depth 2” means Moss occupies two spaces and the hull needs two units of water. Visually separate load, depth needed and depth available. For a selected crossing, show which passage or destination berth limits it. On a boarding preview, show how deep the ferry would sit after the group boards. Far Shore is the test case: Rush can admit the arriving ferry yet be too shallow for the projected load. A matching mark on the hull and a waterline on a gauge are one possible treatment.
- **Actions and tide.** Show actions taken and how many committed actions remain until the next named change. Connect the countdown to the affected pier on the map. Inspection and selecting passengers are free. Sailing, a committed group transfer, Wait and operating the bridge each cost one. Rabbit Pier floods after action four. Boarding on four resolves before the water rises. Keep simultaneous changes, empty shores and the end of a tide schedule truthful.

**Codex owns the visual design.** Prototype a slim landscape side gauge and a compact portrait treatment in the existing painted harbor-sign style. Use dark teal, ivory, brass and the established icon family. Compare alternatives on a real phone-sized map and tune the stronger one. Use legible labels, shapes and contrast alongside color. Preserve map taps, faces, near-ferry controls, Reduced Motion, keyboard access and the player’s opportunity to solve the puzzle. Detail can expand freely.

**Deliver one tested interface pass.** Use the normal Journey entrance and late Practice coves. Capture before/after at 390×844 and 780×320, including first control, projected load, a tide rise and Undo. Check narrow-screen fit and rotation. Preserve rules, saves, lantern targets and the existing coves. Return the tested commit on draft PR #1 and a spoiler-free build for the friend. Their retest begins with “What are you trying to do, and what do you expect to change first?” Record actual player responses separately from engineering checks.
