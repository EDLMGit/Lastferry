# Last Ferry — difficulty and three-lantern mastery

**Design decision · 13 November 2026.** The player accepts Orin's character direction but finds Orchard Landing a step down from Wide Berth and Reef Return. The accepted mobile presentation remains. This document sets the progression and reward contract; the lantern feature is **not implemented or commissioned in the current repair**.

Current assignment: [ORCHARD_DIFFICULTY_01](../NEXT_TASK_ORCHARD_DIFFICULTY.md). Source baseline: `fb5806a7a129984290c54a9f54e08d5171d0d3d3`. [Independent structural review](../reviews/orchard-difficulty-review/REVIEW.md)

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

The first six are accepted and remain unchanged during Orchard's repair. Later rows are design roles, not permission to build more levels now.

| Cove | Intended increase or pacing role |
| --- | --- |
| 1 — Holding Pier | Learn the load/depth relationship and a useful temporary landing. |
| 2 — Bellwater | Plan the loaded return while accounting for changing shore heights. |
| 3 — Driftwood Yard | Defer one retrieval so a lighter boat can finish another obligation. |
| 4 — Two Shelters | Choose the refuge as part of the retrieval plan. |
| 5 — Wide Berth | Allocate passengers across limited homeward opportunities. |
| 6 — Reef Return | Make an early load decision that changes the later approach and delivery plan. |
| 7 — Orchard Landing, Practice playtest | Work backward from the only outward current. The early Harbor delivery determines which neighbor can fit beside Orin in depth-three water. |
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

Every ordinary rescue advances the story and receives the same calm homecoming. The supper and final ending do not require lantern totals. Across the eventual twelve coves, 36 lanterns provide an optional personal mastery goal; the UI must still distinguish currently implemented coves from future content. Undo stays available without a limit, charge or confirmation dialog.

The third lantern recognizes a clean execution on this attempt. It is not a claim of first-try understanding. Learn with Undo, restart and execute the learned plan: that is a valid way to earn it. An accidental committed action corrected with Undo would also affect this optional award; reliable direct phone controls therefore remain important.

Elapsed time, sound, motion, camera, zoom, free inspection and Tips do not affect eligibility. Do not add weighted penalties, lives, currency, daily goals or per-cove Undo budgets.

### Action targets

Use an **authored and verified target**, not a number automatically equated with the shortest witness. An exhaustive minimum provides a lower bound for choosing the target; a witness alone establishes only that a particular length can win.

A target may deliberately allow several meaningful strategies. The current accepted reports include 12- and 14-action Wide rescues and 10- and 11-action Reef rescues. Choosing the strict minimum would make some accepted longer approaches earn only the rescue lantern. That may be appropriate for an explicitly optimized route, but it must be a deliberate decision.

Do not publish a target until its cove and revision are accepted. Document the minimum, candidate target, a qualifying witness and the strategies it includes or excludes. Do not manufacture inefficiency or arbitrary waiting to make the second lantern seem valuable.

**Orchard development target: 13 actions, pending playtest.** Moving both smaller neighbors to Cider Quay and leaving Medlar there gives a 12-action rescue. Taking Pomme first and returning to Spring Steps for Medlar takes 13. A strict 12 would exclude that second route even when the player correctly plans the final load. Later deliveries still count as rescues. This target lives in the design record only. [Witnesses, constraints and slack](../reviews/orchard-difficulty/DESIGN.md)

### Minimal presentation

Keep the ordinary map HUD unchanged. Put three restrained lanterns on the existing result card and small best-result icons in the existing cove list. Use the established palette and asset family workflow.

The result can say “14 actions · 2 Undos.” The target and requirements are freely inspectable before play through a compact disclosure. Continue remains primary; replay stays secondary. No live “star lost” alert or persistent score bar competes with the water, animals and routes.

## 5. Future implementation contract

This section resolves behavior so a later contained task can implement it without inventing new game rules.

- Count actions from the final winning state's existing turn count. Undo removes discarded turns normally; do not charge additional tide turns or include abandoned branches in that efficiency count.
- Track successful Undos as attempt metadata **outside the rewindable puzzle State**. An unavailable, busy or rejected input does not count.
- Starting or restarting a cove starts a fresh attempt. Settings, hiding, rotation, fullscreen and animation recovery do not reset attempt metadata.
- The winning card displays a provisional result. The existing explicit Continue/leave/replay action accepts it; do not add another save button.
- Terminal Undo before acceptance withdraws the provisional result, increments Undo use, and leaves the win fully reversible. A later delivery recomputes the result. Previously accepted best results never decrease.
- Preserve one actual best run's result. Do not combine the fewest actions from one attempt with zero Undos from another to invent a better award.
- Keep results in a separate versioned store keyed by cove identity and puzzle/scoring revision. The strict Journey schema, original-byte backups and explicit campaign continuation remain unchanged.
- A Practice replay of an accepted matching revision can improve its best result without writing Journey progress. Unaccepted candidates do not establish permanent campaign ratings.
- Older saves contain no action or Undo history. Never infer two or three lanterns from completion alone. Existing earned rescues remain recognized.
- A storage failure leaves a usable in-session result and does not block play. The game currently resumes at cove boundaries; any future mid-puzzle resume must carry the attempt metadata too.
- No anti-cheat service is needed for this personal local mastery record. A genuine puzzle rebalance changes the rating revision; a cosmetic change does not.

The current `Session` rewinds its State, and Journey validation accepts an exact record shape. [Session at review baseline](https://github.com/EDLMGit/Lastferry/blob/fb5806a7a129984290c54a9f54e08d5171d0d3d3/src/game/session.ts) · [Journey validation](https://github.com/EDLMGit/Lastferry/blob/fb5806a7a129984290c54a9f54e08d5171d0d3d3/src/campaign/progress.ts)

## 6. Implementation order

1. Repair **existing Orchard Landing** and demonstrate a stronger actual decision structure. Keep Orin and the accepted visual language.
2. Playtest that repair before approving it as C7.
3. Implement the contained lantern feature with justified targets for accepted coves, and separately connect the accepted Orchard/story/save continuation under an explicit task.
4. Commission C8 only after these foundations are accepted.

The current pass does not implement rewards, create another level, reorder the Journey or deploy. Preserve the source-linked review and historical publication records.
