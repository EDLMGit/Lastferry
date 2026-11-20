# Far Shore production proof review

**Ready for a private Practice playtest.** At `7edba1519e9d856f3dc029bb0d500b4480985149`, the minimum is **13 actions**. Eight Undos from the demonstrated loss restored the opening state, and I completed the rescue and terminal Undo/redelivery through the game’s Session. All four neighbors arrived. Far Shore still has no accepted or proposed lantern target.

## What the manifest changes

On turn seven both plans reach Rush Landing at tide one, with Rowan still ashore and the berth at depth three. The boat has six spaces, enough to board three-space Rowan in either plan. The difference is how deep it sits **after** he boards.

| First neighbor delivered | Outward companion | Load with Rowan | Required depth | Turn-eight result |
| --- | --- | ---: | ---: | --- |
| Thistle, two spaces | Button, one space | 4 | 3 | Rowan boards before the pier floods. |
| Button, one space | Thistle, two spaces | 5 | 4 | The Board action is unavailable while the berth is dry. |

The rejected boarding preview and commit leave the clock, state and Undo history at turn seven. The losing witness then commits Wait on action eight. Rush floods with Rowan ashore. This is a consequence of the earlier manifest: every continuation from the opening choice of Button alone fails. It remains possible to deliver Button first and sail Thistle all the way to Rush before that mistake becomes visible.

Two controlled changes isolate the cause. Increasing **only Rush’s basin depth by one** lets the reversed manifest board Rowan and complete the same 13-action rescue. Restoring the prototype’s **action-nine** flood gives time to put Thistle ashore at Far Bank, sail to Rush and board Rowan. That distinct recovery finishes on action 14. The shipped flood removes the spare staging action. [Committed manifests and proof](https://github.com/EDLMGit/Lastferry/blob/7edba1519e9d856f3dc029bb0d500b4480985149/reviews/far-shore/DESIGN.md)

## Difficulty judgment

The corrected placement of the constraint matters. Orchard Landing already asks the player to send the sheep home first so the rabbit can accompany a three-space deer. Its decisive depth check occurs while crossing Pomona Reach. In Far Shore, both escorts can **reach** Rowan, and the test occurs at his berth as the ferry takes on his weight. This is a plausible final application of familiar rules. The campaign-peak goal remains a question for the player: my independent search found **exactly one minimum sequence**, and every winning rescue shares the first eight actions through boarding Rowan. The clearest playtest signal is whether anticipating the remote berth feels like a fresh deduction to someone who remembers Orchard. [Accepted Orchard design](https://github.com/EDLMGit/Lastferry/blob/7edba1519e9d856f3dc029bb0d500b4480985149/reviews/orchard-difficulty/DESIGN.md) · [Far Shore commission](https://github.com/EDLMGit/Lastferry/blob/7edba1519e9d856f3dc029bb0d500b4480985149/NEXT_TASK_FAR_SHORE.md)

## Verification

On Node 24.22.3, I verified 24 exact Git blobs in an isolated scratch checkout and executed `node reviews/far-shore/proof.mjs`. Its output matched the committed result byte for byte, SHA-256 `82ccb07ec059e665bfb4d39f1e9dca5ead5130b1aaab080cb40e773379deba2b`. A separate exhaustive search enumerated all transfer subsets and candidate moves, using production validation and reduction. It confirmed **241 canonical states, 588 transitions, 39 states with a winning continuation and the 13-action minimum**. Only boarding Thistle alone retains a win among six legal opening choices. I also replayed both counterfactual wins, the blocked boarding, the subsequent flood and the eight-Undo correction through the production Session. This review covers the mechanics and their consequences. Phone presentation and the player’s difficulty judgment are separate evidence. [Executable proof](https://github.com/EDLMGit/Lastferry/blob/7edba1519e9d856f3dc029bb0d500b4480985149/reviews/far-shore/proof.mjs) · [Committed results](https://github.com/EDLMGit/Lastferry/blob/7edba1519e9d856f3dc029bb0d500b4480985149/reviews/far-shore/proof.json)

