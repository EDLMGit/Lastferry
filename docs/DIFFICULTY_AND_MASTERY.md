# Last Ferry — difficulty and three-lantern mastery

**Current implementation · 14 November 2026.** The player accepted the Orchard repair at `9933303178da04cac93ddc820ef55e181286d983`. [THREE_LANTERNS_01](../NEXT_TASK_THREE_LANTERNS.md) now adds cumulative rescue, efficiency and efficient-without-Undo results. The eight authored targets and all puzzle data retain their accepted values. [Feature review](../reviews/three-lanterns/REVIEW.md)

This updates the 13 November direction after the successful repair playtest. The six-cove Journey stays unchanged; accepted Orchard remains Practice-only until a separate story/save-continuation task. [Preparation review](../reviews/three-lanterns-preparation/REVIEW.md) · [Verified targets](../reviews/three-lanterns-preparation/TARGETS.md) · [Earlier structural diagnosis](../reviews/orchard-difficulty-review/REVIEW.md)

## 1. What challenge means here

Last Ferry is a deterministic planning puzzle with a calm presentation. The player can think, inspect and Undo without a time limit. The challenge is assembling a plan whose **earlier decisions preserve later possibilities**.

A state contains the ferry location, each passenger's location, the turn and tide. A rescue is a legal sequence ending with every required passenger delivered. Its core constraints already include:

- The sum of indivisible passenger space costs must fit the ferry.
- The current load's draft must fit the passage's current depth.
- The passage must face the intended direction at the moment of crossing.
- A waiting passenger must leave before their landing floods.
- Boarding, unloading, sailing and waiting each spend one action, so preparing a later move can change the water.

These constraints should interact. An instruction such as “leave the deer until later” can execute one insight through many actions. A stronger puzzle asks the player to infer a future load or route requirement, preserve the place needed to assemble it, and alter an earlier pickup because of that requirement.

There is no target minimum number of moves, nodes, animals, legal actions or losing states. A short puzzle can require substantial reasoning. A large search graph can be full of repetitive or obviously unhelpful actions.

### Evidence that informs this approach

Pelánek's [2014 Sudoku study](https://arxiv.org/html/1403.7373v1) distinguishes the complexity of individual deductions from the dependencies among them, using human solving data. That is a useful lens, not a calibrated difficulty formula for this different game.

Patrick Traynor's [own design essay](https://cwpat.me/misc/puzzle-level-idea-strategies/) describes authoring a required interaction, deduction or invariant, then exploring variations. We will specify the reasoning a cove should demand and use search to test whether the dependency actually holds.

The [official FDG 2026 abstract for “Designed to Fail”](https://fdg2026.org/abstracts/) reports interviews with twenty puzzle developers and describes setbacks as part of learning. Only the abstract was reviewed. Our optional reward policy below is a product choice, not an experimentally validated scoring formula.

## 2. A small design record for each cove

Use a concise table in each developer design report; do not add this analysis to the player's normal UI.

| Question | Useful evidence |
| --- | --- |
| What must the player realize? | State the decisive capacity, route or timing inference plainly. |
| What earlier decision depends on it? | Show the connected reasoning; collapse routine sailing and interchangeable pickup orders. |
| When does the consequence become apparent? | Identify the later crossing or retrieval affected by an earlier legal choice. |
| What seems sensible but fails? | Replay a plausible plan and explain its visible, forecastable consequence. |
| What genuine freedom remains? | Distinguish strategies from symmetric passenger swaps, commuting pickups, harmless waits and split final unloads. |
| Does each claimed constraint matter? | Use a relevant counterfactual: a different load cost, relaxed deadline or ordinary passage. |
| How efficient can a rescue be? | Prove the shortest action count when feasible, then document any broader efficient target separately. |
| Does it work for a player who knows earlier coves? | Record the player's experience separately from solver and UI checks. |

Search can establish reachability, minimal action count, required transitions and recoverability. It cannot prove that the player will find a decision difficult or satisfying. Do not turn the table into an arbitrary weighted “difficulty score.”

Readability is part of fairness: all required facts stay inspectable with Tips Off. A harder cove must not depend on a hidden passenger, obscured shallow, misleading route, new exception or inaccurate forecast.

## 3. Twelve-cove progression

The first six and repaired Orchard are accepted and remain unchanged during the lantern task. Orchard's Journey integration and later rows require separate assignments; they do not authorize building more levels now.

| Cove | Intended increase or pacing role |
| --- | --- |
| 1 — Holding Pier | Learn the load/depth relationship and a useful temporary landing. |
| 2 — Bellwater | Plan the loaded return while accounting for changing shore heights. |
| 3 — Driftwood Yard | Defer one retrieval so a lighter boat can finish another obligation. |
| 4 — Two Shelters | Choose the refuge as part of the retrieval plan. |
| 5 — Wide Berth | Allocate passengers across limited homeward opportunities. |
| 6 — Reef Return | Make an early load decision that changes the later approach and delivery plan. |
| 7 — Orchard Landing, accepted Practice | Work backward from the only outward current. The early Harbor delivery determines which neighbor can fit beside Orin in depth-three water. |
| 8 — title open | Extend the planning horizon: preserve one opportunity while fulfilling another, using familiar rules. |
| 9 — Drowned Orchard | Reinterpret recognizable geometry for a new waiting group and changed conditions. Earlier rescued neighbors stay safe. |
| 10 — Lantern Reach | A compact, quiet consolidation with a real inference and an elegant efficient solution; scenery can relax without making every decision automatic. |
| 11 — Far Shore | Peak synthesis of established load, route, staging and timing knowledge. No late exception or new mechanic. |
| 12 — Last Ferry | A shorter final application and unhurried homecoming. The hardest test has already been earned; no surprise rescue after the last group is safe. |

The curve rises in the reasoning expected of a returning player. Deliberate consolidation and an emotional final release are compatible with that curve. Do not use this as a mandate for every successive cove to have a longer shortest path.

## 4. Three lanterns: a minimal star system

Use three small warm lanterns as the cove's optional mastery rating.

| Result | Requirement |
| --- | --- |
| **One — rescued** | Deliver every required neighbor. |
| **Two — efficient** | Deliver everyone within the cove's authored efficient-action target. Undo is allowed. |
| **Three — without Undo** | Meet the same action target with no successful Undo during that attempt. |

The conditions are cumulative. For a hypothetical target of 14 actions:

| Final attempt | Lanterns |
| --- | --- |
| 16 actions, no Undo | 1 |
| 14 actions, three successful Undos | 2 |
| 14 actions, no Undo | 3 |

Every ordinary rescue advances the story and receives the same calm homecoming. The supper and final ending do not require lantern totals. Across the eventual twelve Journey coves, 36 lanterns can provide an optional personal mastery goal. Do not show an aggregate total in this first implementation; First Crossing's independent training award is outside that future total. Undo stays available without a limit, charge or confirmation dialog.

The third lantern recognizes a clean execution on this attempt. It is not a claim of first-try understanding. Learn with Undo, restart and execute the learned plan: that is a valid way to earn it. An accidental committed action corrected with Undo would also affect this optional award; reliable direct phone controls therefore remain important.

Elapsed time, sound, motion, camera, zoom, free inspection and Tips do not affect eligibility. Do not add weighted penalties, lives, currency, daily goals or per-cove Undo budgets.

### Action targets

Use an **authored and verified target**, not a number automatically equated with the shortest witness. An exhaustive minimum provides a lower bound for choosing the target; a witness alone establishes only that a particular length can win.

A target may deliberately allow several meaningful strategies. The current accepted reports include 12- and 14-action Wide rescues and 10- and 11-action Reef rescues. Choosing the strict minimum would make some accepted longer approaches earn only the rescue lantern. That may be appropriate for an explicitly optimized route, but it must be a deliberate decision.

Do not publish a target until its cove and revision are accepted. Document the minimum, candidate target, a qualifying witness and the strategies it includes or excludes. Do not manufacture inefficiency or arbitrary waiting to make the second lantern seem valuable.

**Accepted efficient targets · 14 November 2026.** Fresh production-rule enumeration reproduced all eight minimums and replayed all twenty-four committed winning witnesses. The targets below are authored decisions based on that evidence.

| Cove | Proved minimum | Efficient target |
| --- | ---: | ---: |
| First Crossing — independent Practice | 7 | **8** |
| Holding Pier | 9 | **9** |
| Bellwater | 10 | **10** |
| Driftwood Yard | 12 | **12** |
| Two Shelters | 11 | **12** |
| Wide Berth | 12 | **14** |
| Reef Return | 10 | **11** |
| Orchard Landing | 12 | **13** |

Orchard's 13 includes its 12-action Cider Quay staging and 13-action Spring Steps retrieval. Wide and Reef likewise retain distinct longer accepted strategies. Driftwood's fifteen-action order adds a home trip after the same critical rescue plan: it earns full rescue/story credit but does not meet the twelve-action efficiency target. [Exact audit, witnesses and rationale](../reviews/three-lanterns-preparation/TARGETS.md) · [Orchard proof](../reviews/orchard-difficulty/DESIGN.md)

### Minimal presentation

Keep the ordinary map HUD unchanged. Put three restrained lanterns on the existing result card and small best-result icons in the existing cove list. Use the established palette and asset family workflow.

The result can say “14 actions · 2 Undos.” The target and requirements are freely inspectable before play through a compact disclosure. Continue remains primary; replay stays secondary. No live “star lost” alert or persistent score bar competes with the water, animals and routes.

## 5. Implementation contract

[THREE_LANTERNS_01](../NEXT_TASK_THREE_LANTERNS.md) implements this contract. These outcomes preserve the current puzzle and save boundaries.

- Count actions from the final winning state's existing turn count. Undo removes discarded turns normally; do not charge additional tide turns or include abandoned branches in that efficiency count.
- Track successful Undos as attempt metadata **outside the rewindable puzzle State**. An unavailable, busy or rejected input does not count.
- Starting or restarting a cove starts a fresh attempt. Settings, hiding, rotation, fullscreen and animation recovery do not reset attempt metadata.
- The winning card displays a provisional result. Actual Continue story, cove navigation, confirmed Home or a successful completed Restart accepts it once. Practice “Choose a cove” only opens a menu and does not accept. Neither do Settings, dialog cancellation, Escape or visibility/fullscreen lifecycle. Do not add another save button or pagehide acceptance.
- Terminal Undo before acceptance withdraws the provisional result, increments Undo use, and leaves the win fully reversible. A later delivery recomputes the result. Previously accepted best results never decrease.
- Preserve one actual best run's result. Prefer more lanterns, then fewer final actions, then fewer successful Undos; retain the old entry on an exact tie. Do not combine the fewest actions from one attempt with zero Undos from another to invent a better award.
- Keep results in a separate versioned store keyed by cove identity and puzzle/scoring revision. The strict Journey schema, original-byte backups and explicit campaign continuation remain unchanged.
- All eight current Practice entries are eligible. Matching Journey/Practice revisions share bests without Practice writing Journey progress. Orchard is now accepted but stays Practice-only; its best can carry into a later matching Journey revision. First Crossing stays independent training. New Journey preserves mastery.
- Older saves contain no action or Undo history. Keep their rescues completed and their mastery unrated until a scored replay; create no synthetic result or invented metrics. Restored Harbor worlds used for Home/story presentation are not playable attempts and cannot earn awards.
- A mastery-storage failure leaves a usable in-session result/best and does not block play or campaign continuation. Validate data without rewriting Journey bytes. The game currently resumes at cove boundaries; any future mid-puzzle resume must carry the attempt metadata too.
- No anti-cheat service is needed for this personal local mastery record. A genuine puzzle rebalance or scoring-target change changes its rating revision; a cosmetic change does not.

The Session keeps successful Undo history outside its rewindable State. A result becomes available after a real committed win finishes presenting. Actual departure consumes that result once. The separate `last-ferry.mastery.v1` record stores whole best runs under stable cove/revision keys. Each current target uses revision 1. Unknown revisions remain stored and stay unrated in the current UI. A failed read or write keeps new accepted bests available for the visit and displays a storage notice. Journey retains its exact record shape. [Scoring and storage](../src/game/mastery.ts) · [Session](../src/game/session.ts)

## 6. Implementation order

1. **Complete:** repair existing Orchard Landing and demonstrate its connected load/crossing decision.
2. **Complete:** player accepts the repair at `9933303178da04cac93ddc820ef55e181286d983` on 14 November.
3. **Implemented, awaiting review:** THREE_LANTERNS_01 for the eight accepted Practice entries and matching six Journey coves.
4. **Separate next task:** connect accepted Orchard with its truthful illustrated entry and explicit completed-six save continuation. Preserve matching earned mastery.
5. Commission C8 only after these foundations are accepted. Its new dependency must extend the planning horizon, not merely increase bodies or moves.

The current lantern task creates no level, changes no puzzle or Journey order, and does not deploy. Preserve the source-linked review and historical publication records.
