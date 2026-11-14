# Last Ferry — campaign recalibration

**Planning input for `PLAY_READABILITY_01`**  
**Reviewed baseline:** `7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695`  
**Scope:** revise direction and acceptance criteria. This document does not authorize implementing future coves, changing the runtime journey order or migrating saves in the readability pass.

## 1. What happened, and our correction

The written campaign genuinely placed Nell's larger-ferry launch after Driftwood Yard and Wide Berth at cove 4. Codex followed that assignment. The launch has a sound narrative purpose: someone we rescue helps us continue. The gameplay placement did not earn that moment.

Wide Berth lets the player collect the first whole group, take the available deep return, deliver, then collect the second group. Its optional staging approach is mechanically different, but the straightforward route can bypass the intended insight. Extra passengers and a larger vessel added considerable visual and interaction complexity without necessarily making the decision more interesting than Driftwood's required staging. The user now reports that the level is easy and not fun. Record this as negative difficulty feedback, rather than leaving acceptance pending indefinitely.

**Our correction is to delay the upgrade and strengthen the decisions before increasing the cast.** We own the earlier ordering. Passing tests and valid rescue witnesses establish consistency; they do not overturn this playtest. Avoid defending the level through action counts, state counts or the number of possible solutions.

Keep current Wide Berth playable during `PLAY_READABILITY_01`. Later, retain it as an optional development/Practice prototype while a replacement earns its campaign place. Reuse the improved ferry, seating, transfers and launch work; do not delete them or promise the current puzzle a mandatory slot merely because they exist.

## 2. Revised twelve-cove direction

Status distinguishes actual content from intended design. Acceptance below concerns gameplay, not closure of inherited visual, timing or device limitations. Proposed rows have no validated puzzle or guaranteed difficulty yet.

| # | Cove | Story purpose | Distinct decision | Status |
| --- | --- | --- | --- | --- |
| 1 | Holding Pier | Bring Pip, Rue and Moss to the refuge | Lighten the ferry safely to complete the rescue | Authored; accepted gameplay |
| 2 | Bellwater Cove | The refuge grows; another bell calls | Choose rescue order and a return route before two shores flood | Authored; accepted gameplay |
| 3 | Driftwood Yard | Rescue Nell, Fern and Oat; meet the boatwright | Stage Nell safely to reach the shallow rescue | Authored; user accepted gameplay |
| 4 | **Two Shelters** — working title | Finish the inner coast while Nell helps at home | Choose a temporary landing and retrieval order that preserve the later rescue | Proposed replacement; four-space boat |
| 5 | Orchard Landing | Meet Orin, the orchard neighbor | Fit a three-space passenger into a useful four-space plan | Proposed; four-space boat |
| 6 | Two Landings, preceded by the launch | The rescued community provides a ferry suited to the next stretch | Choose mixed loads and decide when a lighter return is worth an extra trip | Proposed; six-space introduction and application |
| 7 | Tidal Gate | Reach more exposed water beyond the headland | Route around one clearly marked fixed-direction channel | Proposed; introduce one water rule |
| 8 | Reed Narrows | Learn to anticipate the turning water | Choose which passage to use before its forecasted direction reverses | Proposed; extend the same rule |
| 9 | Drowned Orchard | Recognize a changed familiar place and rescue a different group | Combine known load, direction and deadline choices in remembered geography | Proposed synthesis |
| 10 | Lantern Reach | See the welcome taking shape | Follow a clear plan and enjoy a short relief crossing | Proposed breather |
| 11 | Far Shore | Gather the last distant neighbors | Resolve the strongest fair combination of established choices | Proposed difficulty peak |
| 12 | Last Ferry | Bring the final neighbors home to supper | Complete a gentler final rescue, then enjoy the return | Proposed resolution |

**Launch threshold:** after explicit completion of cove 5, before cove 6. Nell's spare ferry is already built; safe neighbors prepare and bring it into service while the captain finishes the inner coast. No construction timer or currency is required. Orin occupies three spaces and fits the original ferry: never claim the upgrade makes him transportable for the first time. The upgrade enables useful combinations. For example, three-, two- and one-space passengers fill six spaces with only three bodies; this illustrates the benefit, not a proven C6 puzzle.

First Crossing remains independent practice. Old coves retain their authored four-space boats. C7 teaches a fixed direction before C8 introduces reversal. Beautiful moving water never becomes a reaction timer: thinking remains free, and committed actions advance the local tide.

## 3. Proposed C4 contract: Two Shelters

**Planning question:** “Which temporary landing keeps the later rescue possible?”

- Use the original four-space ferry and three or four animal bodies from established species. No new species, capacity, inventory, scoring or current rule.
- Make staging location and subsequent retrieval order interact with familiar draft, route depth and local flood timing. A convenient temporary landing may carry a later cost; another can preserve a different approach.
- The player must reason about what their earlier placement leaves possible. Merely repeating “leave the heavy passenger at the only safe pier” does not satisfy the contract: Driftwood already teaches that.
- Provide complete, readable information. Differences between candidate shelters and their return paths must be apparent through inspection, forecast and the world. Do not hide a late passenger or punish a fact the player could not know.
- Keep groups and geometry compact enough to understand on a phone. A smaller number of meaningful alternatives is preferable to extra neighbors, long empty crossings or administrative transfers.

This is an unproven design brief. It specifies no exact map, tide schedule, witness or solution count. First author a small mechanical candidate using existing placeholder assets and a separate Practice entrance. Prove a rescue against the production reducer, inspect a plausible blocked or losing alternative, and verify useful Undo recovery. If the design claims multiple meaningful strategies, prove those specific claims; do not require multiple strategies merely to inflate a report.

Check whether routine “collect the earliest group, follow the only available return, repeat” avoids the intended reasoning. If it does, revise or discard the candidate. Independent rule checking is useful, but the user's playtest must establish whether the choice is understandable, distinct and satisfying. **Approve the mechanical idea before commissioning additional art or a chapter scene.** Do not publish a solver horizon as a player action limit.

## 4. Integration and save boundary

`PLAY_READABILITY_01` keeps the current Holding → Bellwater → Driftwood → Wide registry, launch trigger and checkpoint behavior. Update project direction to distinguish the implemented route from this proposed replacement; do not describe Two Shelters as built.

The existing version-1 journey validates ordered cove and scene prefixes. Removing Wide or relocating `a-wider-deck` can invalidate pending-launch, active-Wide and completed-four-cove records. Campaign integration therefore needs its own scoped, versioned route/save change after C4 is worth keeping.

That later task must preserve original saved data, carry recognized C1–C3 completion forward, and retain old Wide completion as history without claiming the new C4 was rescued. Previously seeing the launch must not fabricate later-cove completion. Explain the revised continuation point through a brief, honest chapter notice. Unknown or malformed records remain recoverable. Reading Home, opening Options or entering Practice must not silently rewrite campaign progress. Do not design a large migration framework in this readability pass; define exact mappings once the replacement content and route are settled.

## 5. The story we preserve

This remains one evening's last service and a growing refuge. Rescued named characters stay safe and later greet or help; Drowned Orchard uses a different waiting group. Local tide clocks do not combine into a global countdown. The hardest cove is 11, allowing 12 to release the pressure. The final required group is visible from the beginning; no surprise extra objective interrupts the ending.

The supper, empty place for the captain and final caption remain: **“We saved you a place.”**

## Pinned sources

- [Campaign direction and current twelve-cove order](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/campaign/CAMPAIGN_DIRECTION.md).
- [Puzzle progression and mechanical acceptance](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/campaign/PUZZLE_PROGRESSION.md).
- [Existing story scenes](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/campaign/STORY_SCENES.md).
- [Actual Wide Berth data](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/data/wide-berth.level.json).
- [Implemented campaign registry](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/src/campaign/registry.ts) and [progress validation](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/src/campaign/progress.ts).
