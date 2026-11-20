# Product brief

## The promise

Last Ferry is a finite, authored 3D puzzle story about bringing a small island community to a lighthouse refuge before rising water cuts off their piers. The player pilots a little yellow ferry. Heavier passenger loads can make the boat sit lower and restrict shallow routes. The tide opens passages while shrinking the remaining rescue window.

The desired feeling is an understandable little plan coming together inside a place the player enjoys looking at. A heavy sheep can change an entire route; successfully bringing it home should feel useful and warm.

## Experience pillars

1. **Visible consequences.** Passenger load, available routes, and the next tide are understandable before commitment.
2. **Tactile miniature world.** The ferry, islands, and passengers have real 3D shape and restrained, expressive motion.
3. **Time to think.** Rules advance on committed actions. Cosmetic water and idle animation can continue while the player considers a decision.
4. **A complete short story.** Authored puzzles lead to a real ending. A satisfying single playthrough is a valid outcome.

## Proposed story

It is the captain's first evening running the ferry alone. An unusually high tide is approaching. The remaining islanders need to gather at the lighthouse before nightfall.

Early crossings introduce the boat and its neighbors. Later, the player recognizes submerged paths in a familiar cove and finds that rising water has turned them into useful channels. Small personal objects brought aboard reappear at the sanctuary. After the final crossing, the passengers have made a place for the captain at a supper table.

The selected campaign direction is now [The Long Tide](../campaign/CAMPAIGN_DIRECTION.md), with [authored scene copy](../campaign/STORY_SCENES.md) and [puzzle progression](../campaign/PUZZLE_PROGRESSION.md). It develops this first-evening/lighthouse/supper premise into four phases of three coves. The current [story foundation task](../NEXT_TASK_STORY_FOUNDATION.md) explicitly extends the historical M1 scope only around the existing Holding Pier → Bellwater puzzles. First Crossing remains practice. Dialogue stays sparse and the captain unseen.

The implemented prototype scope is a compact journey entrance, the opening, one Holding → Bellwater connective scene and honest cove-boundary checkpoints. Both completed coves lead to an explicit end-of-available-content message. The twelve-cove arc, future cast, larger ferry, currents and supper finale remain authored direction, not completed story content. Technical verification and actual phone evidence are tracked in [the story review](../reviews/story-foundation/REVIEW.md); human acceptance and publication are separate.

## Full-game planning envelope

The initial hypothesis is about 12 authored puzzles and roughly 1–2 hours. Establish the real length and pacing through playtesting. A mix of introductory, demanding, and quiet crossings should give the journey room to breathe. The selected direction proposes one fixed story-earned six-space ferry and one later current-rule family, each requiring its own scoped implementation and puzzle proof. Replay scores, generated campaigns, an upgrade shop and a wider simulation remain unnecessary.

No additional mechanic or new cove is part of the story foundation. Local progress is saved between coves: an unfinished cove starts again, with fresh in-session Undo history. Complete mid-puzzle resume and coherent Undo/presentation recovery are a phone-usability requirement before shipping the longer campaign.

## Historical M1 scope

One small tutorial cove, one ferry, two rabbits, one sheep, two depth categories of route, two tide rises, one safe lighthouse harbor, and the complete rescue loop. Exact route/depth/timing values are in the rules and level data.

M1 proves that loading a passenger creates a clear, interesting route change and that the scene is pleasant to control. It is intentionally short and forgiving. Several valid approaches demonstrate consistency; they do not establish commercial replay value or the full game's difficulty.

## Platform and presentation choices

Start with a browser build for desktop and phone landscape. The game should load local bundled assets and run its rules on the device. Use a fixed camera during puzzles and restrained camera changes for story moments. Core controls must remain usable with mouse, touch, and keyboard.

The reference images are an art target. The real scene must earn its appearance through meshes, materials, lighting, water, composition, and motion. Preserve readable forms at the actual display size; simplify decorative detail when necessary.

## Evidence for the next decision

At the M1 review, ask whether a new player can anticipate the consequence of boarding the sheep, find the next action without instruction, undo a mistake, and enjoy completing the rescue. Automated checks establish rule consistency; playtesting establishes clarity and enjoyment. Record both without conflating them.
