# How the story grows after this pass

**Direction only. Do not implement these chapters in `STORY_PRODUCTION_01`.**

The campaign remains **The Long Tide**: your first evening at the helm, an unusually high tide, and neighbors gathering at the lighthouse. As you bring people home, the community prepares a welcome. The final line remains **“We saved you a place.”**

The approved illustrated language gives us a repeatable way to show consequential moments. A chapter should introduce a person, show a change in the coast, or reveal how the rescued community helps. It does not need a long speech or the same three-shot formula each time.

## What we can reuse

| Reuse across chapters | Author for each meaningful chapter |
| --- | --- |
| Shot player and player-paced controls | The visible event and its consequence |
| Caption typography, transcript and phone layout | Short, specific copy |
| Sound intent, finite cue ownership and future narration routing | Which sounds belong to that event |
| Reduced Motion endpoints and cancellation | Poses and composed still endpoints |
| Final handoff and checkpoint integration | The destination and point in the story |
| Character palette, reusable props and drawing helpers | New characters, settings and distinct close compositions |

This deliberately leaves room for one-shot connections and larger milestone scenes. Reuse means stable behavior and a coherent style; new illustration and staging still require care.

## Planned milestones

| Phase | Story image | Playable change | Scope/status |
| --- | --- | --- | --- |
| Holding → Bellwater | A lantern kept for you; first neighbors safely home | Existing four-space puzzles | Current opening/connection integration |
| Driftwood Yard | Nell the boatwright notices a useful timber and is later welcomed home | A new cove using the established four-space rules | Next contained gameplay/story task; new beaver art and portrait |
| Wide Berth | The rescued community helps launch the prepared larger ferry | Actual six-space ferry, seating and draft behavior; a forgiving first puzzle | Separate milestone after Nell |
| Orchard Landing → Two Landings | Orin's size reads in the composition; the group makes room | Three-space deer, then combinations of established capacity and staging choices | Later character and difficulty tasks |
| Tidal Gate → Reed Narrows → Drowned Orchard | Reeds and the boat's movement make the current direction visible | First a fixed permitted direction, then a forecasted reversal, then a familiar place at higher water | Introduce one water-rule family carefully |
| Lantern Reach → Far Shore → Last Ferry | More warm windows, a table being prepared, a final place kept for you | Breather, strongest synthesis, then a gentler final rescue | Final phase; no surprise objective at the end |

These are working scene ideas, not finished assets or solver-validated future levels. Preserve the canonical campaign document's intent and validate each new puzzle independently when its task begins.

## Three rules for future story content

### Show a consequence the player can recognize

A rescue can leave one lantern on the landing, one new neighbor in the safe gathering, or one contribution to the final table. The welcome grows through completed milestones. A future Harbor display should derive those changes from accepted journey progress, not create a second simulation or persistence system.

Rescued characters stay safe. The orchard revisit has a different waiting group; it does not put Orin back in danger. The first trio does not become Bellwater's passengers.

### Introduce one new planning idea at a time

Nell's first cove uses the existing rules. The larger ferry arrives in its own forgiving lesson before the deer or currents. Orin uses three spaces; he could fit alone on the old four-space boat, so the story should celebrate useful combinations rather than claim he was impossible to carry before.

For a current, the illustration may show reeds bending and water streaming one way, but the playable map must still provide an explicit stable direction marker, inspection text and forecast. Decorative motion cannot be the only source of a puzzle rule.

### Keep the story in the player's hands

Short scenes can remain optional to watch without becoming optional to understand: full captions, clear still endpoints and explicit continuation support both. A later voice should tell the same concise story as the text, with space for the water and music. Do not narrate every action or create a real-time pressure clock.

## The next three reviewable deliveries

1. **Current package:** integrate the approved opening and one Harbor connection, add finite effects, verify the actual phone journey, review and then separately publish the accepted SHA.
2. **Complete the familiar shore:** design and solve Driftwood Yard, introduce Nell's model/portrait/scene and add honest progression. Include migration for existing two-cove completed saves. Full mid-puzzle resume needs its own reliable implementation before the campaign grows into longer phone sessions.
3. **Launch the larger ferry:** deliver the real six-space boat, its capacity/draft/Undo behavior, one launch scene and Wide Berth's forgiving lesson together.

Narration can be auditioned after the current scenes run in the real game. It need not hold up the first production integration. Use one approved narrator across later chapters; store each line as a local asset tied to a stable scene/shot ID.

## Save compatibility before extending the registry

The baseline checkpoint validator checks a completed journey against the whole current ordered cove list. A player who finished the two existing coves must not lose progress when Cove 3 is added. The next campaign-expansion task must explicitly migrate that completed record into a valid continue point while preserving prior completions. Do not silently append a cove and assume old saves remain valid.

Current task: preserve the existing schema. Future task: design and verify that migration alongside the new content.
