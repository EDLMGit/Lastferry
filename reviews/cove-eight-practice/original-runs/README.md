# Original runs retained

The first six-case browser run had three passing cases (the complete minified short-landscape rescue, 320px/fullscreen lifecycle, desktop smoke) and three failed development cases. The failures occurred after a valid Juniper/Fennel transfer: the production witness lists Fennel before Juniper, while the real chooser submits the roster order Juniper then Fennel. The existing shared `checkTurn` correctly compared passenger membership and all other rule fields; the new free-inspection assertion then incorrectly compared the next action against the witness array order.

Only the new test helper changed: after preview/commit agreement and conservation checks, development execution now returns the real checked runtime state. Subsequent inspection and every Undo still compare complete exact runtime snapshots, including array order. No game state, witness, production reducer or control changed for this correction. All three affected cases then passed. The original result, error contexts and initial source/test manifest are retained here; local trace archives remain at `.cache/c8-first-traces/{portrait,early-recovery,low-recovery}.zip`. The final source manifest has the same runtime hash and the corrected helper hash.

A redundant attempt to start the isolated development server returned “Port 5297 is already in use”; the correct no-watch server was already running. It was reused. This did not represent a game failure.

Initial authored-geometry failures and their repairs are documented by the design/geometry review and original spatial result retained alongside this review. The final geometry checks are separate from visual acceptance.
