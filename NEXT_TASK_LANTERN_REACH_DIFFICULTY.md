# Lantern Reach revision · LANTERN_REACH_DIFFICULTY_02

## Director’s decision

Keep the swing bridge. Revise the existing unscored Lantern Reach Practice cove before considering it for Journey. The player liked the bridge and judged the drop in difficulty too noticeable for this late in the campaign. The present map is a good demonstration of the mechanism. In both winning routes the first two actions secure every passenger. The remaining decision changes the distance home. Ternhaven and Drowned Orchard already ask the player to anticipate how an early rescue choice changes whom they can reach later.

## The experience to build

Make the bridge easy to understand and give an experienced player a reason to think twice about **when** to use it. An early, reasonable choice about passengers or position should change a later rescue decision while someone still needs help. The bridge must matter to that relationship. The player should be able to foresee the consequence from the map, load and tide forecast, then use Undo to try a different plan. Calibrate the decision against the preceding two coves. Judge the mental work directly. Extra sailing, an unexplained early loss or a larger minimum action count does not satisfy that goal on its own.

## Codex owns development

Take this through level design, prototyping, implementation, tuning and a tested handoff in one assignment. Explore materially different playable layouts or rescue arrangements using the existing production rules. Compare their strongest decisions, discard the weaker design and develop the strongest. Explain where it changed during iteration. Codex chooses the map, cast, load and ferry configuration, tide schedule, competing plans, final counts and implementation approach. Account for the established six-space ferry at this point in Journey when choosing the cove’s configuration. Keep the existing signal interaction, visible swing, free inspection, accessible controls and full Undo.

## How the director will review it

- Show the decision from the player's point of view before revealing its solution. Identify the visible clue, the attractive move, who is affected later and how a different early commitment changes the rescue.
- Use the production rules to establish the chosen map’s minimum, a viable alternative and the exact consequence of the tempting move. On the same map compare what happens with the bridge permanently open or closed, whichever best tests whether timing actually matters. Show a case that tests player reasoning beyond simply extending the route.
- Play the chosen design on the real controls, including a mistake and recovery. Provide the decisive before-and-after evidence in phone portrait and short landscape, covering readable passengers, bridge state and the forecast. Report engineering checks separately from player feedback. Review is against the player's decisions, with no fixed move target or development-time quota.

Work from the current `m1-first-crossing` branch and preserve later user work. Retain both unscored Practice candidates, existing saves and lantern bests. This brief covers the Lantern Reach revision alone. Return the candidate for another playtest before scoring, promotion or publication. Push the reviewed work normally to the draft PR and include a direct local Practice link, the implementation SHA and the evidence.
