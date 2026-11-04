# Last Ferry — The Long Tide

**4 November 2026.** Two Shelters received positive player feedback and is published as private Site version 15. Reef Return tests the six-space ferry, temporary staging and one tide-dependent return passage in independent Practice. Wide Berth still occupies the fourth Journey slot. Reef Return and the proposed twelve-cove sequence await playtest and separate campaign decisions. [Reef Return review](../reviews/reef-return/REVIEW.md)

**Campaign direction v2 · 1 November 2026**

Implementation update — `TWO_SHELTERS_PROTOTYPE_01`: the proposed C4 now has an independent playable Practice candidate at `?cove=two-shelters`. Hazel (beaver), Bracken (beaver) and Mica (rabbit) reuse existing species and the original four-space ferry. Both temporary shelters have production-rule witnesses; Low Landing requires Mica home before retrieval, while High Refuge permits a mixed first delivery. See [actual candidate design](../reviews/two-shelters-prototype/DESIGN.md). Human playtest has not accepted it into the campaign. Holding → Bellwater → Driftwood → Wide, launch and save prefixes remain unchanged. No chapter, migration or future cove is implemented. The implementation handoff preceded the subsequent version 15 publication. The earlier recalibration record below is retained as planning history.

Original direction baseline: `1a85874883af5caa59f6294a75495eccf2afebbc`. Current task: `PLAY_READABILITY_01`, reviewed runtime `7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695`, later continuity HEAD `52f72d6cdb1caa292425511394f4a11efa024a61`. Holding Pier → Bellwater Cove → Driftwood Yard → Wide Berth remains the implemented journey; First Crossing stays independent practice. The user accepts Driftwood gameplay and reports that Wide Berth is too easy and not fun. Wide's mandatory campaign slot is under revision; technical verification does not establish difficulty acceptance. Portrait-load, layout, timing, acoustic and physical-device limits remain separately recorded.

The accepted Home, illustrated scenes, autoplay, direct/group transfers, prepared-ferry launch and actual six-space Wide Berth profile remain available. This task changes readability and planning direction only: no future cove, route reorder, launch relocation or save migration is implemented. The current private Site remains version 13/game `7ae1d8a`; the publication receipt and earlier history are retained in project state. Cove-boundary checkpoints remain honest; full mid-puzzle persistence is deferred.

The earlier written plan placed the launch after Nell's rescue and Wide at C4. Codex followed it; this is a correction to our direction. A straightforward collect/deep-return/deliver/repeat strategy bypasses the intended staging insight. More bodies, actions or valid witnesses do not make that decision stronger than Driftwood. Delay the planned upgrade until it serves mixed passenger sizes. First prove and playtest a compact replacement C4; later retain Wide as an optional development/Practice prototype and reuse its ferry, seating, transfers and launch work. Those later integration changes have not happened in this pass.

## 1. The story we are making

It is your first evening alone at the helm of the little yellow ferry. The tide will be unusually high tonight. Across the scattered low islands, neighbors are waiting for the last service to the lighthouse refuge.

You start close to home. Two rabbits and a sheep are enough to make you think about who boards, how low the boat sits, and which way you can return. With each crossing, the refuge becomes less empty. Someone lights a window. Someone brings a cloth to the table. A neighbor watches for the next ferry.

Farther along the coast, the routes ask more of you. An orchard neighbor needs more room within the original ferry. The boatwright you brought home then helps launch a larger ferry suited to useful mixed groups. Beyond the headland, a current changes which passages can be used and when. A familiar orchard looks different when the water is among its trees.

At last, the final waiting group is aboard. The rescue window no longer presses on this crossing. There is time to watch the wake, listen to the music and follow the lighthouse home. The camera opens onto the supper the others have been preparing. One place has been left empty, facing the arriving ferry.

**Final caption: “We saved you a place.”**

The game title remains **Last Ferry**. **The Long Tide** names this complete story arc. The title refers to the evening's final service before the low landings are cut off. The emotional destination is belonging: the people you have helped make a place for you.

This develops the first-evening, lighthouse and supper-table premise already present in the original product brief. It gives that premise a concrete progression instead of replacing it with a new mythology.

## 2. What changes as the story advances

Three kinds of progress should reinforce one another:

1. **The community grows.** Rescued neighbors appear safely at the refuge, through a few recognizable poses, props and greetings. Their presence gives each successful rescue a visible consequence.
2. **The player's understanding grows.** Each phase introduces a clear planning idea, gives it room to settle, then combines it with familiar ideas.
3. **The coast changes.** The light moves toward evening, familiar low scenery becomes submerged, and the route reaches more exposed water. These changes support readable puzzles.

The campaign should feel like one evening even when the player takes several sessions. Cosmetic time of day advances with story milestones. Water motion and music continue while the player thinks, but only committed actions advance a puzzle's tide.

Twelve authored coves are the planning target, arranged into four phases of three. The original one-to-two-hour envelope remains a hypothesis. We will measure first-play thinking time, retries, reading and scene pacing; solved recordings do not establish campaign duration. Cut or combine any cove that repeats an existing decision without adding something worthwhile.

## 3. The four phases

### Phase I — The familiar shore · coves 1–3

**Feeling:** tentative competence, then trust.

The little ferry has four spaces. The player learns the relationship between passengers, draft, shallow routes, temporary landings and the rising water. Holding and Bellwater retain their accepted rules and layouts. The new third cove introduces Nell without adding a new rule family.

The refuge begins to respond. Pip and Rue watch an arrival; Moss settles near the high pier. Bellwater's neighbors add a small cloth and the sound of a bell. These are brief visual returns, not another set of endangered appearances.

After cove 3, Nell is safe at the refuge. In the revised plan, she and the neighbors prepare her already-built spare ferry while the captain finishes the inner coast; its launch is delayed until after C5. The current runtime still launches after Driftwood, pending a separate route/save integration task.

### Phase II — Room for one more · coves 4–6

**Feeling:** deeper planning on familiar water, then the pleasure of useful extra room.

Cove 4 is now proposed as **Two Shelters**, using the four-space boat and three or four bodies from existing species. Its question is: which temporary landing and retrieval order keep the later rescue possible? It must add a placement dependency beyond Driftwood's single safe staging pier. This was the initial design brief. A concrete independent Practice candidate is now implemented and production-proven; campaign placement and human satisfaction remain unaccepted.

Cove 5 introduces Orin, a deer using three spaces, in the original four-space boat. His size is legible in his body, portrait and explicit cost. After explicit C5 completion, the prepared six-space ferry launches before Cove 6, Two Landings. That cove introduces and applies its capacity through mixed loads, route depth and the choice of whether a lighter return justifies an extra trip. These are future proposals awaiting mechanical proof and playtest.

The three-space deer could fit alone in the original four-space boat. The story must not claim otherwise. The larger ferry allows useful combinations and bigger groups; it does not magically make one deer transportable for the first time.

### Phase III — The turning water · coves 7–9

**Feeling:** seeing familiar water differently.

Introduce one new water-rule family: a marked channel has a permitted direction, which can change at an authored tide transition. Cove 7 teaches a fixed direction in a small, forgiving network. Cove 8 introduces a forecasted reversal. Cove 9 combines the established ideas in a recognizable orchard seen at higher water.

The beautiful water must explain the situation. A steady arrow shows the permitted direction even with motion reduced; restrained moving streaks support it. Inspection names the current direction and the next change. Decorative foam, mist or reflections never conceal the route's actual status.

The orchard revisit uses a different waiting group. Orin is already safely at the refuge. The pleasure is recognizing the place and understanding its changed routes.

### Phase IV — The last lights · coves 10–12

**Feeling:** confidence, concentration, then release.

Cove 10 is a breather: a short, attractive crossing with a clear plan. Cove 11 is the strongest synthesis of known rules. Its difficulty should come from interacting choices that the player can inspect and reason about.

Cove 12 is a gentler final rescue. All required passengers are visible and named from the start. There is no last-minute extra objective or new rule. Once everyone is aboard, the remaining homeward trip lets the player enjoy the world they have learned to read.

The existing arrival language expands into the supper scene. The lighthouse, music, people and props resolve the journey. The player can linger, open Settings or replay a completed cove after the ending.

## 4. Cove roadmap

Future titles are working names. Each row is a design intention, not a proven puzzle or final move count.

| # | Cove | Story purpose | Distinct planning focus | Status |
| --- | --- | --- | --- | --- |
| 1 | Holding Pier | Bring Pip, Rue and Moss home | Accepted introduction: load, depth, temporary landing and deadlines | Existing |
| 2 | Bellwater Cove | Meet Tansy, Lark and Bram | Accepted route and rescue-order puzzle with staged tide consequences | Existing |
| 3 | Driftwood Yard | Rescue Nell, Fern and Oat | Four-space staging at High Mooring, shallow rescue and deepened return | Implemented; user accepted gameplay |
| 4 | Two Shelters — working title | Finish the inner coast while Nell helps at home | Choose a temporary landing and retrieval order that preserve the later rescue | Independent Practice candidate; four-space boat; campaign slot pending playtest |
| 5 | Orchard Landing | Meet Orin | Fit a three-space passenger into a useful four-space plan | Proposed; four-space boat |
| 6 | Two Landings, preceded by the launch | The community provides a ferry suited to the next stretch | Choose mixed loads and when a lighter return is worth an extra trip | Proposed; six-space introduction and application |
| 7 | Tidal Gate | Reach the headland | One clearly marked, fixed-direction passage | Proposed |
| 8 | Reed Narrows | Plan a different way back | A current reverses after a forecasted tide transition | Proposed |
| 9 | Drowned Orchard | Recognize changed water in a familiar place | Reuse the orchard's landmarks; combine current, load and local deadlines | Proposed |
| 10 | Lantern Reach | See the welcome taking shape | Quiet relief crossing and beautiful travel | Proposed |
| 11 | Far Shore | Gather the last distant group | Hardest synthesis of established ideas, complete information | Proposed |
| 12 | Last Ferry | Bring the final neighbors home | Shorter, gentler final rescue and an unhurried return | Proposed |

**First Crossing stays available as optional practice.** It repeats Holding's Pip/Rue/Moss rescue in a different starting arrangement. Keeping it outside the canonical sequence avoids pretending those characters have become stranded again. Preserve its puzzle and regression coverage.

This table is the revised target, not the runtime registry. Current C4 remains Wide Berth with unchanged data and saves; its difficulty is not accepted. Moving it to optional Practice and integrating Two Shelters require their own scoped tasks.

## 5. Characters and recognition

The portraits are the start of a relationship between the player and the animals. Reinforce recognition through a few distinctive, repeated gestures and their presence at home.

| Character | Story expression | Mechanical meaning |
| --- | --- | --- |
| Pip | Curious; a small eager hop when a ferry returns | Existing one-space cream rabbit |
| Rue | Attentive; turns toward an arriving boat | Existing one-space tan rabbit |
| Moss | Calm; settles near the table with an unhurried nod | Existing two-space sheep |
| Tansy, Lark and Bram | Bellwater neighbors; prepare the table, watch the channel markers and ring the bell | Existing costs and identities retained |
| Nell | Practical boatwright; broad tail, warm face, a small rope/tool prop | Implemented beaver, two spaces; later planned contribution is the prepared larger ferry |
| Orin | Gentle orchard neighbor; readable short antlers, deliberate boarding | Proposed deer, three spaces; first rescued with the original ferry |

Nell and Orin are the two new species planned for this campaign. Additional residents can use the existing species with their own stable names and appearances. Keep the recurring lead group small enough to remember.

Nell's contribution is a story event, not an activated ability. Orin's different cost uses the familiar capacity vocabulary. Every newcomer does not need a new rule. A recognizable silhouette, a clear place in the community and a later greeting can carry a character.

Maintain one stable identity per character across world models, portraits, level data and story appearances. The current shared resolver uses explicit appearance metadata for the expanded cast while retaining full species ordinals separately for placement consumers. Reordering a level or selecting a subset must not change coats. Preserve every existing mapping when adding future neighbors.

Keep the captain unseen if that remains the most effective production choice. The first-person role and final empty place are enough; a human character model and facial animation are unnecessary for this story.

## 6. The larger boat is a story milestone

Nell has an already-built spare ferry at the protected boathouse. The revised launch threshold is after explicit completion of C5, before C6. Safe neighbors prepare it while the captain finishes the inner coast. The scene reveals work the community had prepared; it does not imply building an entire vessel while someone waits on a flooding pier. There is no construction timer or currency. The implemented launch still follows C3 until a separate route/save change is approved.

The implemented larger boat retains the yellow hull and red-cabin family resemblance with a visibly larger passenger deck. Preserve its existing capacity and draft bands for later reuse:

| Occupied spaces | Original ferry draft | Implemented larger ferry draft |
| --- | ---: | ---: |
| 0 | 1 | 1 |
| 1–2 | 2 | 2 |
| 3–4 | 3 | 3 |
| 5–6 | Unavailable | 4 |

Lightly loaded, the new ferry keeps the familiar relationships. Loaded to five or six spaces, it needs deeper water. A visible example might offer a route of depth 3 and a deeper detour: carrying six helps capacity but closes the shallow route; leaving two spaces free keeps it open. This illustrates the intended decision only. It is not a validated future level.

A three-space deer, a two-space neighbor and a one-space rabbit fill six spaces with three bodies. That is a useful capacity example, not a proven C6 puzzle. Orin already fits the original four-space boat; the upgrade must never be described as making his first rescue possible.

The old coves retain their authored four-space ferry on replay. The new boat belongs to the levels designed for it. There is no need for a hull-selection system.

Capacity is the complete loading rule. Automatic visual seating must support every legal passenger subset in each authored level; avoid accidentally introducing a separate packing puzzle. Audit actual hull clearance, turns, broadside docking, boarding reach, draft offsets, wake, passenger silhouettes and phone framing. A larger number in the menu is not sufficient.

## 7. Water that changes the plan

For the planned current rule, direction belongs to the route and current tide stage. A move validates against that direction and the existing depth rules before committing. A valid move still travels one authored edge and costs one action. A scheduled tide then changes the route's direction for subsequent actions. Undo restores the earlier tide and direction together.

The current does not move the boat involuntarily. The player can pause indefinitely, read the forecast, inspect another route or listen to the music. There is no reaction window to catch.

Use stable endpoint-based direction data, a shared rule/forecast/preview interpretation and complete coverage of every authored tide stage. A direction arrow alone is not a mechanic: the current implementation's edge lookup ignores the `bidirectional` field, so enforcement must be added and tested deliberately.

The later challenge comes from composition: taking a channel before its reversal, boarding a heavier group, then returning by a route that supports the resulting draft. The next state must be understandable before Confirm. The same atomic action order continues to decide boarding, tide rise, stranded passengers and victory.

## 8. How the story is shown

Use six short major story scenes, plus a brief connection between the existing first two coves in the initial prototype. The full shot and caption scripts are in `STORY_SCENES.md`.

| Trigger | Scene | What it establishes |
| --- | --- | --- |
| Begin the journey | First evening at the helm | Captain, tide, lighthouse goal |
| Before cove 3 | A light at the yard — implemented | Introduce Nell before the Driftwood rescue |
| Planned after cove 5, before cove 6 | A wider deck — implemented after C3 today | Safe neighbors launch Nell's prepared ferry for useful mixed groups |
| Before cove 5 | The orchard neighbor | Introduce Orin before his first selection |
| After cove 6 | The water turns | Prepare the player to learn the channel rule |
| After cove 9 | The last lights | Show the gathering and the remaining occupied landings |
| After cove 12 | A place for the captain | Supper, welcome and a complete ending |

The current opening uses three approved illustrated Canvas2D shots with finite 6 / 6 / 7-second actions; the Harbor connection uses one approximately five-second shot in the same language. Normal-motion opening shots advance automatically, with Pause/Resume and immediate Next. The final picture holds for explicit acknowledgment. Driftwood adds one seven-second lantern greeting; Harbor keeps its five-second gathering. Reduced Motion and restored pending scenes retain still endpoints. Next is available immediately, while only the final handoff acknowledges a scene. Normal captions follow a brief visual lead-in; Read story exposes the full scene immediately, and Reduced Motion shows each still endpoint with its caption. This supersedes the earlier model-only story presentation, while the playable world remains fully 3D. Later chapter composition and timing need their own authored review. The game remains understandable when muted.

Let the current score continue through its existing audio owner. Scene transitions may change arrangement or level gently; they must honor mute, touch-start, background suspension and cancellation. A repeated scene must not create overlapping music or duplicate arrival cues. New music, if later needed, should be original and consistent with the accepted score.

Story is triggered at explicit narrative boundaries. A preview never unlocks a scene. Winning remains undoable until the player chooses to leave that cove. Only that departure accepts campaign completion. Scenes work on decorative presentation state, not fabricated gameplay actions.

## 9. Continuity, geography and home

Home-marked harbors represent protected refuge piers around the same lighthouse island. Each puzzle is a composed local view of nearby water; it does not promise an open, continuously navigable world. Transitional shots can show travel between those views.

Once a named animal has been delivered in the story, it remains safe. It may greet the ferry or help at the refuge, but it does not silently return to a low pier as a new objective. Later rescue groups have their own identities. A final group is known from the beginning of its cove; there is no hidden extra passenger sprung on the player after success.

Each cove owns its local tide forecast and starting datum. Do not sum every puzzle's actions into a fictitious global timer. The time between coves is narratively compressed. All current tide/deadline text must continue to describe the actual local puzzle.

Show the refuge growing through grouped scenery and a few representatives. A warm window, cloth, rope coil, bell and orchard bough can recall earlier rescues without putting every animal on the phone screen simultaneously. Props remain decorative; they do not create cargo or collection requirements.

## 10. Difficulty and acceptance

Aim for increasing interaction between understandable ideas. Extra passengers, extra stops or shorter deadlines do not by themselves make a good puzzle. Each cove needs a distinct planning question that can be described in one sentence.

Before accepting a new cove, require a valid witness against the real reducer, an independent rule check where practical, and at least one attractive losing or blocked alternative with a fair explanation and useful Undo recovery. Where the design claims multiple approaches, prove them. Never present a search horizon as a gameplay limit or a shortest route as the only acceptable play.

For proposed C4, check whether routine earliest-group collection and the only available return bypass the intended placement/retrieval reasoning. If so, revise or discard the candidate. Approve the mechanical idea through the user's playtest before commissioning additional art or a chapter scene. Do not require multiple strategies merely to inflate the report.

The user remains our human playtester. Their feedback determines whether the intended insight is understandable and satisfying. Technical checks establish rule consistency and interface behavior. Neither replaces the other.

Keep room to breathe after demanding decisions. Cove 11 is the main peak; cove 12 offers an earned, gentler conclusion. Undo does not reduce rewards or alter the ending. Completing the story means everyone required is safely home.

The actual authoring and mechanical acceptance details are in `PUZZLE_PROGRESSION.md`.

## 11. Build it in reviewable slices

| Slice | Concrete result | Stop before |
| --- | --- | --- |
| Story foundation and illustrated production — complete, retained | Approved three-shot opening and compact Harbor connection inside the working journey/practice flow and honest cove-boundary checkpoints | New levels, species, hull or currents |
| Complete Phase I — implemented in DRIFTWOOD_YARD_01 | Driftwood Yard and Nell, using the existing four-space rules | Six-space gameplay |
| Play readability — completed | Lighter play controls, visible depth geography and composed Harbor; document recalibration | New coves, launch relocation, route/save changes |
| Prove replacement C4 — candidate implemented | Small four-space Two Shelters candidate in separate Practice; distinct placement/retrieval decision | New art or chapter scene before gameplay acceptance |
| Integrate accepted C4 | Explicit route/save revision with honest preservation of old completion history | Silent progress rewrites or fabricated new-cove completion |
| Meet Orin | Deer world model/portrait and Orchard Landing using four spaces | New water rules or premature upgrade |
| Launch and complete Phase II | Reuse the six-space ferry/launch after C5; prove mixed-load Two Landings | Broad content multiplication |
| Learn the current | Implement and prove the direction rule through Tidal Gate | Complex reversals across many routes |
| Complete Phase III | Reed Narrows, orchard revisit and the last-lights transition | Final chapter until these ideas are clear |
| The final crossings | Breather, hardest synthesis, final rescue and supper | Additional systems beyond the complete story |

Review each slice before moving its accepted result to the private phone Site. Future tasks may be split further when one asset or interaction needs another pass. The roadmap is a direction for the whole experience, not an instruction to implement twelve coves at once.

The first task saves progress between coves and labels that limitation honestly. Full mid-puzzle resume, including coherent Undo and heading/pose recovery, is a requirement before shipping the longer phone campaign. Do not silently imply that the initial checkpoint is already that system.

The current version-1 journey validates ordered cove and scene prefixes. Removing Wide or relocating `a-wider-deck` would affect pending-launch, active-Wide and completed-four-cove records. A later scoped route/save revision must preserve the original bytes and recognized C1–C3 completion, retain old Wide completion as history without marking new C4 rescued, and explain the revised continuation point briefly. Having seen the launch must not grant later cove completion. Home, Options and Practice remain read-only; unknown/malformed saves stay recoverable. Define exact mappings only after replacement content is settled, without a migration framework in this pass.

## 12. Asset ownership and project decisions

Keep the existing catalog authoritative. Its reviewed starting point has 78 families; the live catalog records actual integrated changes. Register only assets actually added in a pass; future names in this plan do not count as integrated artwork. Reuse the current painted UI, model/portrait pipeline, lighthouse, water, sound and ferry family wherever they fit.

Nell, her portrait, the larger ferry and its launch are implemented in their contained milestones. Future work needs Orin and his portrait, current markers and later story props. Add variants to an existing family when appropriate instead of duplicating every scene or character name as a new family. Record source, derivatives, consumers, native phone evidence and human acceptance separately.

This direction revises the original brief's optional exclusion of upgrades: there is now one fixed story-earned boat change. It also selects one later water-rule family and a concrete four-phase structure. These are deliberate product decisions driven by the user's current request. Existing accepted puzzles and their contracts remain authoritative until a specifically scoped task changes them.

## Sources and limits

- [Original product promise and proposed supper ending](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/docs/PRODUCT_BRIEF.md).
- [Current rules and event order](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/docs/GAMEPLAY_RULES.md).
- [Actual reducer, load/draft and edge lookup](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/src/game/rules.ts).
- [Current world presentation](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/src/scene/world.ts).
- [Portrait handoff](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/reviews/passenger-portraits/REVIEW.md).

The current recalibration comes from [the supplied planning input](../LAST_FERRY_PLAY_READABILITY_PACKAGE/CAMPAIGN_RECALIBRATION.md) and [review findings](../LAST_FERRY_PLAY_READABILITY_PACKAGE/REVIEW_FINDINGS.md). Earlier assignments and their evidence remain historical. Future encounter intentions and current designs are proposals; the larger ferry and launch already exist, but their revised campaign placement does not. Future solvability, duration and player enjoyment remain to be established by contained tasks and playtesting.
