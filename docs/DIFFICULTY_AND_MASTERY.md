# Last Ferry — difficulty and three-lantern mastery

## Ternhaven Journey · implementation for review

Ternhaven Journey uses the existing Practice identity, target 14 / revision 1. An accepted best cannot acknowledge a scene or complete a cove. Any actual rescue can advance on explicit continuation, even when fewer lanterns are earned. All nine targets and best storage are unchanged.

[Implementation and verification](../reviews/ternhaven-journey/REVIEW.md). Not deployed: the private Site remains version 22 at game `26ca0a4`. Its publication receipt and earlier records below are unchanged.

## Current integration after reviewed animal pass · 17 November 2026

ANIMAL_PRESENTATION_01 is complete and published at `26ca0a4f7b42c3f9e809f4a6558b0df8dc0c9139`, Site version 22. The active [TERNHAVEN_JOURNEY_01](../NEXT_TASK_TERNHAVEN_JOURNEY.md) carries the accepted puzzle into the Journey without a rebalance, new difficulty search or target revision. All nine mastery identities and current bests remain. The accepted Ternhaven minimum is 13, with two distinct 14-action strategies; **target 14 / revision 1** remains the reward policy.

Keep Practice mastery independent from Journey progression: a previous accepted best persists but cannot skip the new encounter or grant cove completion. Any ordinary rescue can continue the story. Preserve provisional acceptance, terminal Undo/redelivery and current-versus-best display. The published runtime still has seven Journey coves; the commissioned task yields eight while retaining nine Practice entrances. [Review](../reviews/animal-presentation/INDEPENDENT_REVIEW.md) · [Active state](PROJECT_STATE.md)

## Historical presentation assignment and queue · 17 November 2026

The centered arrival and **Ternhaven target 14 / revision 1** are reviewed at `a2740e61ec5a782f558ea6caad4181466d04e9f7` and published in Site **version 21**. All nine target identities remain unchanged. Fresh independent Session replay confirms all three 13/14/14-action witnesses earn three lanterns, then two after terminal Undo/redelivery. [Independent review](../reviews/arrival-bubble/INDEPENDENT_REVIEW.md)

[ANIMAL_PRESENTATION_01](../NEXT_TASK_ANIMAL_PRESENTATION.md) is the active task, preserving all scoring and acceptance behavior while refining the animals and their UI. The user has not sent the Journey task to Codex. [TERNHAVEN_JOURNEY_01](../NEXT_TASK_TERNHAVEN_JOURNEY.md) is queued for the following reviewed pass. It appends the accepted Practice puzzle as Journey eight using the same `ternhaven@1` best. Existing Practice mastery survives but does not acknowledge the new scene or complete the Journey cove. Every rescue advances the story regardless of lantern count. Preserve provisional acceptance, earlier bests, all targets, generic unscored behavior and original-byte continuation backups. This task adds no new score or historical backfill.

The paragraphs below retain earlier design and implementation checkpoints; the current task/publication above supersedes earlier assignment status.


**Reviewed implementation · 14 November 2026.** The player accepted the Orchard repair at `9933303178da04cac93ddc820ef55e181286d983`. The three-lantern feature at `14f128619267e2da81b4108ece2de4da07b50359` has no blocker in the scoped source/core/native-image review. The eight authored targets and all puzzle data retain their accepted values. [Independent review](../reviews/three-lanterns/INDEPENDENT_REVIEW.md) · [Implementation verification](../reviews/three-lanterns/REVIEW.md)

This updates the 13 November direction after the successful repair playtest. [ORCHARD_JOURNEY_01](../NEXT_TASK_ORCHARD_JOURNEY.md) implements the accepted cove's story/save continuation. At that checkpoint Journey had seven playable coves and all eight Practice entrances remained. Orchard shares target 13 and mastery revision 1 across both entrances. [Preparation review](../reviews/three-lanterns-preparation/REVIEW.md) · [Verified targets](../reviews/three-lanterns-preparation/TARGETS.md) · [Earlier structural diagnosis](../reviews/orchard-difficulty-review/REVIEW.md)

**Current implementation · 15 November 2026.** The user positively received the latest two levels and lantern mechanic and requested the centered [ARRIVAL_BUBBLE_01](../NEXT_TASK_ARRIVAL_BUBBLE.md). Fresh independent execution of Ternhaven's production-rule audit reproduced minimum **13** and two distinct **14-action** plans. ARRIVAL_BUBBLE_01 registers **target 14 / revision 1** for Ternhaven, preserving all eight prior target/revision pairs. [Independent review](../reviews/cove-eight-practice/INDEPENDENT_REVIEW.md)

Ternhaven remains the ninth independent Practice entrance, outside the seven-cove Journey. The reviewed runtime at `291d8f2a9570d833709e10815db12bd5c1fe75cc` was unscored; the arrival implementation now includes Ternhaven as the ninth target. Earlier unscored rescues remain unrated because they have no saved action/Undo history. Preserve the generic unscored fallback for other unsupported entries.

The arrival pass changes reward presentation, not cumulative scoring or acceptance rules: large current-result lanterns, all rescued animal identities, a compact result line and icon actions. Keep prior best distinct and put detailed criteria/persistence copy in an accessible disclosure. A card opening, closing or animating does not accept a result.

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

The first six and repaired Orchard are accepted; Orchard's story integration is reviewed and published. Ternhaven is implemented and reviewed as independent Practice, with positive user feedback and target 14 / revision 1 registered in the arrival pass. Its Journey integration remains a separate task. C9–C12 remain design roles, not authorization to build those levels.

| Cove | Intended increase or pacing role |
| --- | --- |
| 1 — Holding Pier | Learn the load/depth relationship and a useful temporary landing. |
| 2 — Bellwater | Plan the loaded return while accounting for changing shore heights. |
| 3 — Driftwood Yard | Defer one retrieval so a lighter boat can finish another obligation. |
| 4 — Two Shelters | Choose the refuge as part of the retrieval plan. |
| 5 — Wide Berth | Allocate passengers across limited homeward opportunities. |
| 6 — Reef Return | Make an early load decision that changes the later approach and delivery plan. |
| 7 — Orchard Landing, Journey and Practice | Work backward from the only outward current. The early Harbor delivery determines which neighbor can fit beside Orin in depth-three water. |
| 8 — Ternhaven; reviewed independent Practice | Preserve retrieval access while fulfilling a linked early delivery. Minimum 13; target 14 / revision 1 registered. Journey integration remains separate. |
| 9 — Drowned Orchard | Reinterpret recognizable geometry for a new waiting group and changed conditions. Earlier rescued neighbors stay safe. |
| 10 — Lantern Reach | A compact, quiet consolidation with a real inference and an elegant efficient solution; scenery can relax without making every decision automatic. |
| 11 — Far Shore | Peak synthesis of established load, route, staging and timing knowledge. No late exception or new mechanic. |
| 12 — Last Ferry | A shorter final application and unhurried homecoming. The hardest test has already been earned; no surprise rescue after the last group is safe. |

The curve rises in the reasoning expected of a returning player. Deliberate consolidation and an emotional final release are compatible with that curve. Do not use this as a mandate for every successive cove to have a longer shortest path.

## 4. Three lanterns: a minimal star system

Use three warm lanterns as the cove's optional mastery rating: prominent on the centered arrival card and compact in Practice badges.

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

**Accepted efficient targets · 15 November 2026.** The 14 November review reproduced the eight existing minimums and twenty-four witnesses. The fresh Ternhaven review separately reproduced minimum 13 and its three 13/14/14-action witnesses. ARRIVAL_BUBBLE_01 preserves the eight existing entries and registers Ternhaven at revision 1.

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
| Ternhaven — independent Practice | 13 | **14** |

Orchard's 13 includes its 12-action Cider Quay staging and 13-action Spring Steps retrieval. Wide and Reef likewise retain distinct longer accepted strategies. Driftwood's fifteen-action order adds a home trip after the same critical rescue plan: it earns full rescue/story credit but does not meet the twelve-action efficiency target. [Exact audit, witnesses and rationale](../reviews/three-lanterns-preparation/TARGETS.md) · [Orchard proof](../reviews/orchard-difficulty/DESIGN.md)

### Arrival and compact Practice presentation

Keep the ordinary gameplay HUD unchanged. ARRIVAL_BUBBLE_01 gives successful arrival a centered floating card with large original lanterns, every rescued animal, concise result metrics and clear icon actions. Keep small best-result icons in the cove list. Use the established palette and asset family workflow; detailed criteria, prior best and persistence information remain available in Details.

The result can say “14 actions · 2 Undos.” The target and requirements are freely inspectable before play through a compact disclosure. Continue remains primary; replay stays secondary. No live “star lost” alert or persistent score bar competes with the water, animals and routes.

## 5. Implementation contract

[THREE_LANTERNS_01](../NEXT_TASK_THREE_LANTERNS.md) implemented this contract. ARRIVAL_BUBBLE_01 preserves it while adding Ternhaven's accepted target 14 / revision 1 and the new result presentation.

- Count actions from the final winning state's existing turn count. Undo removes discarded turns normally; do not charge additional tide turns or include abandoned branches in that efficiency count.
- Track successful Undos as attempt metadata **outside the rewindable puzzle State**. An unavailable, busy or rejected input does not count.
- Starting or restarting a cove starts a fresh attempt. Settings, hiding, rotation, fullscreen and animation recovery do not reset attempt metadata.
- The winning card displays a provisional result. Actual Continue story, cove navigation, confirmed Home or a successful completed Restart accepts it once. Practice “Choose a cove” only opens a menu and does not accept. Neither do Settings, dialog cancellation, Escape or visibility/fullscreen lifecycle. Do not add another save button or pagehide acceptance.
- Terminal Undo before acceptance withdraws the provisional result, increments Undo use, and leaves the win fully reversible. A later delivery recomputes the result. Previously accepted best results never decrease.
- Preserve one actual best run's result. Prefer more lanterns, then fewer final actions, then fewer successful Undos; retain the old entry on an exact tie. Do not combine the fewest actions from one attempt with zero Undos from another to invent a better award.
- Keep results in a separate versioned store keyed by cove identity and puzzle/scoring revision. The strict Journey schema, original-byte backups and explicit campaign continuation remain unchanged.
- The eight existing scored Practice entries retain their targets and bests. `ternhaven@1` / target 14 is the ninth under ARRIVAL_BUBBLE_01; earn its first result through a new scored replay. Matching Journey/Practice revisions share bests without Practice writing Journey progress. Preserve `orchard-landing@1` / target 13. First Crossing stays independent training; Ternhaven stays independent Practice. New Journey preserves mastery.
- Older saves contain no action or Undo history. Keep their rescues completed and their mastery unrated until a scored replay; create no synthetic result or invented metrics. Restored Harbor worlds used for Home/story presentation are not playable attempts and cannot earn awards.
- A mastery-storage failure leaves a usable in-session result/best and does not block play or campaign continuation. Validate data without rewriting Journey bytes. The game currently resumes at cove boundaries; any future mid-puzzle resume must carry the attempt metadata too.
- No anti-cheat service is needed for this personal local mastery record. A genuine puzzle rebalance or scoring-target change changes its rating revision; a cosmetic change does not.

The Session keeps successful Undo history outside its rewindable State. A result becomes available after a real committed win finishes presenting. Actual departure consumes that result once. The separate `last-ferry.mastery.v1` record stores whole best runs under stable cove/revision keys. Each current target uses revision 1. Unknown revisions remain stored and stay unrated in the current UI. A failed read or write keeps new accepted bests available for the visit and displays a storage notice. Journey retains its exact record shape. [Scoring and storage](../src/game/mastery.ts) · [Session](../src/game/session.ts)

## 6. Implementation order

1. **Complete:** repair existing Orchard Landing and demonstrate its connected load/crossing decision.
2. **Complete:** player accepts the repair at `9933303178da04cac93ddc820ef55e181286d983`.
3. **Implemented and scoped review complete:** THREE_LANTERNS_01 at `14f128619267e2da81b4108ece2de4da07b50359`; physical-phone/listening/spoken-screen-reader approval remains open.
4. **Implemented, reviewed and published:** ORCHARD_JOURNEY_01 connects the accepted puzzle with its truthful illustrated entry and explicit completed-six continuation; Site version 20 retains scoring revision and earned mastery.
5. **Android playtest deferred by the user on 15 November:** its device and human feedback remain open.
6. **Implemented and reviewed:** Ternhaven at `291d8f2a9570d833709e10815db12bd5c1fe75cc`; independent proof and positive user feedback support target 14 / revision 1.
7. **Implemented:** ARRIVAL_BUBBLE_01 builds the centered result presentation and registers that target. Preserve puzzle/witness files, all prior bests and the seven-cove Journey. Keep generic unscored support; do not fabricate historical Ternhaven scores.
8. Ternhaven's future Journey integration remains a separately scoped task.

The arrival implementation changes only successful-arrival presentation and registers the accepted target; it does not deploy. Preserve the source-linked reviews and historical publication records.
