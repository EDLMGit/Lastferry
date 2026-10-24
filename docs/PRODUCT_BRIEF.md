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

This is a proposed creative arc, not extra implementation scope for M1. Keep dialogue sparse. Reused characters, gestures, props, changing light, and shorelines can tell most of the story. The player/captain may remain unseen during M1.

## Full-game planning envelope

The initial hypothesis is about 12 authored puzzles and roughly 1–2 hours. Establish the real length and pacing through playtesting. A mix of introductory, demanding, and quiet crossings should give the journey room to breathe. Replay scores, generated campaigns, upgrades, multiple hull classes, and a wider simulation are not needed to prove this experience.

Later chapters may introduce one additional interaction if it improves the authored puzzles. No additional mechanic is part of this package's implementation task.

## M1 scope

One small tutorial cove, one ferry, two rabbits, one sheep, two depth categories of route, two tide rises, one safe lighthouse harbor, and the complete rescue loop. Exact route/depth/timing values are in the rules and level data.

M1 proves that loading a passenger creates a clear, interesting route change and that the scene is pleasant to control. It is intentionally short and forgiving. Several valid approaches demonstrate consistency; they do not establish commercial replay value or the full game's difficulty.

## Platform and presentation choices

Start with a browser build for desktop and phone landscape. The game should load local bundled assets and run its rules on the device. Use a fixed camera during puzzles and restrained camera changes for story moments. Core controls must remain usable with mouse, touch, and keyboard.

The reference images are an art target. The real scene must earn its appearance through meshes, materials, lighting, water, composition, and motion. Preserve readable forms at the actual display size; simplify decorative detail when necessary.

## Evidence for the next decision

At the M1 review, ask whether a new player can anticipate the consequence of boarding the sheep, find the next action without instruction, undo a mistake, and enjoy completing the rescue. Automated checks establish rule consistency; playtesting establishes clarity and enjoyment. Record both without conflating them.
